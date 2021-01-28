"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Completer = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs-extra"));
const citation_1 = require("./completer/citation");
const documentclass_1 = require("./completer/documentclass");
const command_1 = require("./completer/command");
const environment_1 = require("./completer/environment");
const reference_1 = require("./completer/reference");
const package_1 = require("./completer/package");
const input_1 = require("./completer/input");
const glossary_1 = require("./completer/glossary");
class Completer {
    constructor(extension) {
        this.extension = extension;
        this.citation = new citation_1.Citation(extension);
        this.environment = new environment_1.Environment(extension); // Must be created before command
        this.command = new command_1.Command(extension, this.environment);
        this.documentClass = new documentclass_1.DocumentClass(extension);
        this.reference = new reference_1.Reference(extension);
        this.package = new package_1.Package(extension);
        this.input = new input_1.Input(extension);
        this.glossary = new glossary_1.Glossary(extension);
        try {
            this.loadDefaultItems();
        }
        catch (err) {
            this.extension.logger.addLogMessage(`Error reading data: ${err}.`);
        }
    }
    loadDefaultItems() {
        const defaultEnvs = fs.readFileSync(`${this.extension.extensionRoot}/data/environments.json`, { encoding: 'utf8' });
        const defaultCommands = fs.readFileSync(`${this.extension.extensionRoot}/data/commands.json`, { encoding: 'utf8' });
        const defaultLaTeXMathSymbols = fs.readFileSync(`${this.extension.extensionRoot}/data/packages/latex-mathsymbols_cmd.json`, { encoding: 'utf8' });
        const env = JSON.parse(defaultEnvs);
        const cmds = JSON.parse(defaultCommands);
        const maths = JSON.parse(defaultLaTeXMathSymbols);
        for (const key of Object.keys(maths)) {
            if (key.match(/\{.*?\}/)) {
                const ent = maths[key];
                const newKey = key.replace(/\{.*?\}/, '');
                delete maths[key];
                maths[newKey] = ent;
            }
        }
        Object.assign(maths, cmds);
        // Make sure to initialize environment first
        this.environment.initialize(env);
        this.command.initialize(maths);
    }
    provideCompletionItems(document, position, token, context) {
        const currentLine = document.lineAt(position.line).text;
        if (position.character > 1 && currentLine[position.character - 1] === '\\' && currentLine[position.character - 2] === '\\') {
            return;
        }
        const line = document.lineAt(position.line).text.substr(0, position.character);
        // Note that the order of the following array affects the result.
        // 'command' must be at the last because it matches any commands.
        for (const type of ['citation', 'reference', 'environment', 'package', 'documentclass', 'input', 'subimport', 'import', 'includeonly', 'glossary', 'command']) {
            const suggestions = this.completion(type, line, { document, position, token, context });
            if (suggestions.length > 0) {
                if (type === 'citation') {
                    const configuration = vscode.workspace.getConfiguration('latex-workshop');
                    if (configuration.get('intellisense.citation.type') === 'browser') {
                        setTimeout(() => this.citation.browser({ document, position, token, context }), 10);
                        return;
                    }
                }
                return suggestions;
            }
        }
        return;
    }
    async resolveCompletionItem(item, token) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (item.kind === vscode.CompletionItemKind.Reference) {
            if (typeof item.documentation !== 'string') {
                return item;
            }
            const data = JSON.parse(item.documentation);
            const sug = {
                file: data.file,
                position: new vscode.Position(data.position.line, data.position.character)
            };
            if (!configuration.get('hover.ref.enabled')) {
                item.documentation = data.documentation;
                return item;
            }
            const tex = this.extension.mathPreview.findHoverOnRef(sug, data.key);
            if (tex) {
                const svgDataUrl = await this.extension.mathPreview.renderSvgOnRef(tex, data, token);
                item.documentation = new vscode.MarkdownString(`![equation](${svgDataUrl})`);
                return item;
            }
            else {
                item.documentation = data.documentation;
                return item;
            }
        }
        else if (item.kind === vscode.CompletionItemKind.File) {
            const preview = configuration.get('intellisense.includegraphics.preview.enabled');
            if (!preview) {
                return item;
            }
            const filePath = item.documentation;
            if (typeof filePath !== 'string') {
                return item;
            }
            const rsc = await this.extension.graphicsPreview.renderGraphics(filePath, { height: 190, width: 300 });
            if (rsc === undefined) {
                return item;
            }
            const md = new vscode.MarkdownString(`![graphics](${rsc})`);
            const ret = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.File);
            ret.documentation = md;
            return ret;
        }
        else {
            return item;
        }
    }
    completion(type, line, args) {
        let reg;
        let provider;
        switch (type) {
            case 'citation':
                reg = /(?:\\[a-zA-Z]*[Cc]ite[a-zA-Z]*\*?(?:\([^[)]*\)){0,2}(?:(?:\[[^[\]]*\])*(?:{[^{}]*})?)*{([^}]*)$)|(?:\\bibentry{([^}]*)$)/;
                provider = this.citation;
                break;
            case 'reference':
                reg = /(?:\\hyperref\[([^\]]*)(?!\])$)|(?:(?:\\(?!hyper)[a-zA-Z]*ref[a-zA-Z]*\*?(?:\[[^[\]]*\])?){([^}]*)$)|(?:\\[Cc][a-z]*refrange\*?{[^{}]*}{([^}]*)$)/;
                provider = this.reference;
                break;
            case 'environment':
                reg = /(?:\\begin(?:\[[^[\]]*\])?){([^}]*)$/;
                provider = this.environment;
                break;
            case 'command':
                reg = args.document.languageId === 'latex-expl3' ? /\\([a-zA-Z_@]*(?::[a-zA-Z]*)?)$/ : /\\([a-zA-Z]*|(?:left|[Bb]ig{1,2}l)?[({[]?)$/;
                provider = this.command;
                break;
            case 'package':
                reg = /(?:\\usepackage(?:\[[^[\]]*\])*){([^}]*)$/;
                provider = this.package;
                break;
            case 'documentclass':
                reg = /(?:\\documentclass(?:\[[^[\]]*\])*){([^}]*)$/;
                provider = this.documentClass;
                break;
            case 'input':
                reg = /\\(input|include|subfile|includegraphics|lstinputlisting|verbatiminput)\*?(?:\[[^[\]]*\])*{([^}]*)$/;
                provider = this.input;
                break;
            case 'includeonly':
                reg = /\\(includeonly|excludeonly){(?:{[^}]*},)*(?:[^,]*,)*{?([^},]*)$/;
                provider = this.input;
                break;
            case 'import':
                reg = /\\(import|includefrom|inputfrom)\*?(?:{([^}]*)})?{([^}]*)$/;
                provider = this.input;
                break;
            case 'subimport':
                reg = /\\(sub(?:import|includefrom|inputfrom))\*?(?:{([^}]*)})?{([^}]*)$/;
                provider = this.input;
                break;
            case 'glossary':
                reg = /\\(gls(?:pl|text|first|plural|firstplural|name|symbol|desc|user(?:i|ii|iii|iv|v|vi))?|Acr(?:long|full|short)?(?:pl)?|ac[slf]?p?)(?:\[[^[\]]*\])?{([^}]*)$/i;
                provider = this.glossary;
                break;
            default:
                // This shouldn't be possible, so mark as error case in log.
                this.extension.logger.addLogMessage(`Error - trying to complete unknown type ${type}`);
                return [];
        }
        const result = line.match(reg);
        let suggestions = [];
        if (result) {
            suggestions = provider.provideFrom(type, result, args);
        }
        return suggestions;
    }
}
exports.Completer = Completer;
//# sourceMappingURL=completion.js.map
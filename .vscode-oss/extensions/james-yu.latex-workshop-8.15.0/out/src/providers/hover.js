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
exports.HoverProvider = void 0;
const vscode = __importStar(require("vscode"));
const tokenizer_1 = require("./tokenizer");
class HoverProvider {
    constructor(extension) {
        this.extension = extension;
    }
    async provideHover(document, position, ctoken) {
        this.extension.mathPreview.getColor();
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const hov = configuration.get('hover.preview.enabled');
        const hovReference = configuration.get('hover.ref.enabled');
        const hovCitation = configuration.get('hover.citation.enabled');
        const hovCommand = configuration.get('hover.command.enabled');
        if (hov) {
            const tex = this.extension.mathPreview.findHoverOnTex(document, position);
            if (tex) {
                const newCommands = await this.extension.mathPreview.findProjectNewCommand(ctoken);
                const hover = await this.extension.mathPreview.provideHoverOnTex(document, tex, newCommands);
                return hover;
            }
            const graphicsHover = await this.extension.graphicsPreview.provideHover(document, position);
            if (graphicsHover) {
                return graphicsHover;
            }
        }
        const token = tokenizer_1.tokenizer(document, position);
        if (!token) {
            return undefined;
        }
        // Test if we are on a command
        if (token.startsWith('\\')) {
            if (!hovCommand) {
                return undefined;
            }
            return this.provideHoverOnCommand(token);
        }
        if (tokenizer_1.onAPackage(document, position, token)) {
            const pkg = encodeURIComponent(JSON.stringify(token));
            const md = `Package **${token}** \n\n`;
            const mdLink = new vscode.MarkdownString(`[View documentation](command:latex-workshop.texdoc?${pkg})`);
            mdLink.isTrusted = true;
            return new vscode.Hover([md, mdLink]);
        }
        const refs = this.extension.completer.reference.getRefDict();
        if (hovReference && token in refs) {
            const refData = refs[token];
            const hover = await this.extension.mathPreview.provideHoverOnRef(document, position, refData, token, ctoken);
            return hover;
        }
        const cites = this.extension.completer.citation.getEntryDict();
        if (hovCitation && token in cites) {
            const range = document.getWordRangeAtPosition(position, /\{.*?\}/);
            const cite = cites[token];
            if (cite) {
                const md = cite.documentation || cite.detail;
                if (md) {
                    return new vscode.Hover(md, range);
                }
            }
        }
        return undefined;
    }
    provideHoverOnCommand(token) {
        const signatures = [];
        const pkgs = [];
        const tokenWithoutSlash = token.substring(1);
        this.extension.manager.getIncludedTeX().forEach(cachedFile => {
            const cachedCmds = this.extension.manager.cachedContent[cachedFile].element.command;
            if (cachedCmds === undefined) {
                return;
            }
            cachedCmds.forEach(cmd => {
                const key = this.extension.completer.command.getCmdName(cmd);
                if (key.startsWith(tokenWithoutSlash) &&
                    ((key.length === tokenWithoutSlash.length) ||
                        (key.charAt(tokenWithoutSlash.length) === '[') ||
                        (key.charAt(tokenWithoutSlash.length) === '{'))) {
                    if (typeof cmd.documentation !== 'string') {
                        return;
                    }
                    const doc = cmd.documentation;
                    const packageName = cmd.package;
                    if (packageName && (!pkgs.includes(packageName))) {
                        pkgs.push(packageName);
                    }
                    signatures.push(doc);
                }
            });
        });
        let pkgLink = '';
        if (pkgs.length > 0) {
            pkgLink = '\n\nView documentation for package(s) ';
            pkgs.forEach(p => {
                const pkg = encodeURIComponent(JSON.stringify(p));
                pkgLink += `[${p}](command:latex-workshop.texdoc?${pkg}),`;
            });
            pkgLink = pkgLink.substr(0, pkgLink.lastIndexOf(',')) + '.';
        }
        if (signatures.length > 0) {
            const mdLink = new vscode.MarkdownString(signatures.join('  \n')); // We need two spaces to ensure md newline
            mdLink.appendMarkdown(pkgLink);
            mdLink.isTrusted = true;
            return new vscode.Hover(mdLink);
        }
        return undefined;
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hover.js.map
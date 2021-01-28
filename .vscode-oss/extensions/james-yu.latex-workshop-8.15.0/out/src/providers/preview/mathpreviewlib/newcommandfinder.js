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
exports.NewCommandFinder = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const latex_utensils_1 = require("latex-utensils");
const path = __importStar(require("path"));
class NewCommandFinder {
    constructor(extension) {
        this.extension = extension;
    }
    postProcessNewCommands(commands) {
        return commands.replace(/\\providecommand/g, '\\newcommand')
            .replace(/\\newcommand\*/g, '\\newcommand')
            .replace(/\\renewcommand\*/g, '\\renewcommand')
            .replace(/\\DeclarePairedDelimiter{(\\[a-zA-Z]+)}{([^{}]*)}{([^{}]*)}/g, '\\newcommand{$1}[2][]{#1$2 #2 #1$3}');
    }
    async loadNewCommandFromConfigFile(newCommandFile) {
        let commandsString = '';
        if (newCommandFile === '') {
            return commandsString;
        }
        if (path.isAbsolute(newCommandFile)) {
            if (fs.existsSync(newCommandFile)) {
                commandsString = fs.readFileSync(newCommandFile, { encoding: 'utf8' });
            }
        }
        else {
            if (this.extension.manager.rootFile === undefined) {
                await this.extension.manager.findRoot();
            }
            const rootDir = this.extension.manager.rootDir;
            if (rootDir === undefined) {
                this.extension.logger.addLogMessage(`Cannot identify the absolute path of new command file ${newCommandFile} without root file.`);
                return '';
            }
            const newCommandFileAbs = path.join(rootDir, newCommandFile);
            if (fs.existsSync(newCommandFileAbs)) {
                commandsString = fs.readFileSync(newCommandFileAbs, { encoding: 'utf8' });
            }
        }
        commandsString = commandsString.replace(/^\s*$/gm, '');
        commandsString = this.postProcessNewCommands(commandsString);
        return commandsString;
    }
    async findProjectNewCommand(ctoken) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const newCommandFile = configuration.get('hover.preview.newcommand.newcommandFile');
        let commandsInConfigFile = '';
        if (newCommandFile !== '') {
            commandsInConfigFile = await this.loadNewCommandFromConfigFile(newCommandFile);
        }
        if (!configuration.get('hover.preview.newcommand.parseTeXFile.enabled')) {
            return commandsInConfigFile;
        }
        let commands = [];
        let exceeded = false;
        setTimeout(() => { exceeded = true; }, 5000);
        for (const tex of this.extension.manager.getIncludedTeX()) {
            if (ctoken.isCancellationRequested) {
                return '';
            }
            if (exceeded) {
                this.extension.logger.addLogMessage('Timeout error when parsing preambles in findProjectNewCommand.');
                throw new Error('Timeout Error in findProjectNewCommand');
            }
            const content = this.extension.manager.cachedContent[tex].content;
            commands = commands.concat(await this.findNewCommand(content));
        }
        return commandsInConfigFile + '\n' + this.postProcessNewCommands(commands.join(''));
    }
    async findNewCommand(content) {
        let commands = [];
        try {
            const ast = await this.extension.pegParser.parseLatexPreamble(content);
            const regex = /((re)?new|provide)command(\\*)?|DeclareMathOperator(\\*)?/;
            for (const node of ast.content) {
                if (((latex_utensils_1.latexParser.isCommand(node) && node.name.match(regex)) || latex_utensils_1.latexParser.isDefCommand(node)) && node.args.length > 0) {
                    const s = latex_utensils_1.latexParser.stringify(node);
                    commands.push(s);
                }
                else if (latex_utensils_1.latexParser.isCommand(node) && node.name === 'DeclarePairedDelimiter' && node.args.length === 3) {
                    const name = latex_utensils_1.latexParser.stringify(node.args[0]);
                    const leftDelim = latex_utensils_1.latexParser.stringify(node.args[1]).slice(1, -1);
                    const rightDelim = latex_utensils_1.latexParser.stringify(node.args[2]).slice(1, -1);
                    const s = `\\newcommand${name}[2][]{#1${leftDelim} #2 #1${rightDelim}}`;
                    commands.push(s);
                }
            }
        }
        catch (e) {
            commands = [];
            const regex = /(\\(?:(?:(?:(?:re)?new|provide)command|DeclareMathOperator)(\*)?{\\[a-zA-Z]+}(?:\[[^[\]{}]*\])*{.*})|\\(?:def\\[a-zA-Z]+(?:#[0-9])*{.*})|\\DeclarePairedDelimiter{\\[a-zA-Z]+}{[^{}]*}{[^{}]*})/gm;
            const noCommentContent = content.replace(/([^\\]|^)%.*$/gm, '$1'); // Strip comments
            let result;
            do {
                result = regex.exec(noCommentContent);
                if (result) {
                    let command = result[1];
                    if (result[2]) {
                        command = command.replace(/\*/, '');
                    }
                    commands.push(command);
                }
            } while (result);
        }
        return commands;
    }
}
exports.NewCommandFinder = NewCommandFinder;
//# sourceMappingURL=newcommandfinder.js.map
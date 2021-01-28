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
exports.DefinitionProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tokenizer_1 = require("./tokenizer");
const utils = __importStar(require("../utils/utils"));
class DefinitionProvider {
    constructor(extension) {
        this.extension = extension;
    }
    onAFilename(document, position, token) {
        const line = document.lineAt(position.line).text;
        const escapedToken = utils.escapeRegExp(token);
        const regexInput = new RegExp(`\\\\(?:include|input|subfile)\\{${escapedToken}\\}`);
        const regexImport = new RegExp(`\\\\(?:sub)?(?:import|includefrom|inputfrom)\\*?\\{([^\\}]*)\\}\\{${escapedToken}\\}`);
        const regexDocumentclass = new RegExp(`\\\\(?:documentclass)(?:\\[[^[]]*\\])?\\{${escapedToken}\\}`);
        if (!vscode.window.activeTextEditor) {
            return undefined;
        }
        if (line.match(regexDocumentclass)) {
            return utils.resolveFile([path.dirname(vscode.window.activeTextEditor.document.fileName)], token, '.cls');
        }
        let dirs = [];
        if (line.match(regexInput)) {
            dirs = [path.dirname(vscode.window.activeTextEditor.document.fileName)];
            if (this.extension.manager.rootDir !== undefined) {
                dirs.push(this.extension.manager.rootDir);
            }
        }
        const result = line.match(regexImport);
        if (result) {
            dirs = [path.resolve(path.dirname(vscode.window.activeTextEditor.document.fileName), result[1])];
        }
        if (dirs.length > 0) {
            return utils.resolveFile(dirs, token, '.tex');
        }
        return undefined;
    }
    provideDefinition(document, position) {
        const token = tokenizer_1.tokenizer(document, position);
        if (token === undefined) {
            return;
        }
        const refs = this.extension.completer.reference.getRefDict();
        if (token in refs) {
            const ref = refs[token];
            return new vscode.Location(vscode.Uri.file(ref.file), ref.position);
        }
        const cites = this.extension.completer.citation.getEntryDict();
        if (token in cites) {
            const cite = cites[token];
            return new vscode.Location(vscode.Uri.file(cite.file), cite.position);
        }
        if (token in this.extension.completer.command.definedCmds) {
            const command = this.extension.completer.command.definedCmds[token];
            return command.location;
        }
        if (vscode.window.activeTextEditor && token.includes('.')) {
            // We skip graphics files
            const graphicsExtensions = ['.pdf', '.eps', '.jpg', '.jpeg', '.JPG', '.JPEG', '.gif', '.png'];
            const ext = path.extname(token);
            if (graphicsExtensions.includes(ext)) {
                return;
            }
            const absolutePath = path.resolve(path.dirname(vscode.window.activeTextEditor.document.fileName), token);
            if (fs.existsSync(absolutePath)) {
                return new vscode.Location(vscode.Uri.file(absolutePath), new vscode.Position(0, 0));
            }
        }
        const filename = this.onAFilename(document, position, token);
        if (filename) {
            return new vscode.Location(vscode.Uri.file(filename), new vscode.Position(0, 0));
        }
        return;
    }
}
exports.DefinitionProvider = DefinitionProvider;
//# sourceMappingURL=definition.js.map
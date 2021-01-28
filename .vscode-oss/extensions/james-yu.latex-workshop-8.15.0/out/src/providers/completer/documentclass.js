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
exports.DocumentClass = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs-extra"));
class DocumentClass {
    constructor(extension) {
        this.suggestions = [];
        this.extension = extension;
    }
    initialize(classes) {
        Object.keys(classes).forEach(key => {
            const item = classes[key];
            const cl = new vscode.CompletionItem(item.command, vscode.CompletionItemKind.Module);
            cl.detail = item.detail;
            cl.documentation = new vscode.MarkdownString(`[${item.documentation}](${item.documentation})`);
            this.suggestions.push(cl);
        });
    }
    provideFrom() {
        return this.provide();
    }
    provide() {
        if (this.suggestions.length === 0) {
            const allClasses = JSON.parse(fs.readFileSync(`${this.extension.extensionRoot}/data/classnames.json`).toString());
            this.initialize(allClasses);
        }
        return this.suggestions;
    }
}
exports.DocumentClass = DocumentClass;
//# sourceMappingURL=documentclass.js.map
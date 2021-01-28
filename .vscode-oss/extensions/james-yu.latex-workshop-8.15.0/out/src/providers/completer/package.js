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
exports.Package = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs-extra"));
class Package {
    constructor(extension) {
        this.suggestions = [];
        this.extension = extension;
    }
    initialize(defaultPackages) {
        Object.keys(defaultPackages).forEach(key => {
            const item = defaultPackages[key];
            const pack = new vscode.CompletionItem(item.command, vscode.CompletionItemKind.Module);
            pack.detail = item.detail;
            pack.documentation = new vscode.MarkdownString(`[${item.documentation}](${item.documentation})`);
            this.suggestions.push(pack);
        });
    }
    provideFrom() {
        return this.provide();
    }
    provide() {
        if (this.suggestions.length === 0) {
            const pkgs = JSON.parse(fs.readFileSync(`${this.extension.extensionRoot}/data/packagenames.json`).toString());
            this.initialize(pkgs);
        }
        return this.suggestions;
    }
}
exports.Package = Package;
//# sourceMappingURL=package.js.map
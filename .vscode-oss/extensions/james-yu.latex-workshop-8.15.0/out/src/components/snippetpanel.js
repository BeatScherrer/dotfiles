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
exports.SnippetPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const webview_1 = require("../utils/webview");
class SnippetPanel {
    constructor(extension) {
        this.mathSymbols = [];
        this.extension = extension;
        const editor = vscode.window.activeTextEditor;
        if (editor && this.extension.manager.hasTexId(editor.document.languageId)) {
            this.lastActiveTextEditor = editor;
        }
        vscode.window.onDidChangeActiveTextEditor(textEditor => {
            if (textEditor && this.extension.manager.hasTexId(textEditor.document.languageId)) {
                this.lastActiveTextEditor = textEditor;
            }
        });
        this.loadSnippets();
    }
    showPanel() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }
        const resourcesFolder = path.join(this.extension.extensionRoot, 'resources', 'snippetpanel');
        this.panel = vscode.window.createWebviewPanel('latex.snippetPanel', 'LaTeX Snippet Panel', {
            preserveFocus: true,
            viewColumn: vscode.ViewColumn.Beside
        }, {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
            localResourceRoots: [vscode.Uri.file(resourcesFolder)]
        });
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
        const webviewSourcePath = path.join(resourcesFolder, 'snippetpanel.html');
        let webviewHtml = fs_1.readFileSync(webviewSourcePath, { encoding: 'utf8' });
        webviewHtml = webview_1.replaceWebviewPlaceholders(webviewHtml, this.extension, this.panel.webview);
        this.panel.webview.html = webviewHtml;
        this.initialisePanel();
        this.panel.webview.onDidReceiveMessage(this.messageReceive.bind(this));
    }
    loadSnippets() {
        const snipetsFile = path.join(this.extension.extensionRoot, 'resources', 'snippetpanel', 'snippetpanel.json');
        const snippets = JSON.parse(fs_1.readFileSync(snipetsFile, { encoding: 'utf8' }));
        for (const category in snippets.mathSymbols) {
            for (let i = 0; i < snippets.mathSymbols[category].length; i++) {
                const symbol = snippets.mathSymbols[category][i];
                symbol.category = category;
                if (symbol.keywords === undefined) {
                    symbol.keywords = '';
                }
                this.mathSymbols.push(symbol);
            }
        }
    }
    initialisePanel() {
        if (this.panel === undefined) {
            return;
        }
        this.panel.webview.postMessage({
            type: 'mathSymbols',
            mathSymbols: this.mathSymbols
        });
        this.panel.webview.postMessage({ type: 'initialise' });
    }
    messageReceive(message) {
        if (message.type === 'insertSnippet') {
            const editor = this.lastActiveTextEditor;
            if (editor) {
                editor.insertSnippet(new vscode.SnippetString(message.snippet.replace(/\\\n/g, '\\n'))).then(() => { }, err => {
                    vscode.window.showWarningMessage(`Unable to insert symbol, ${err}`);
                });
            }
            else {
                vscode.window.showWarningMessage('Unable get document to insert symbol into');
            }
        }
    }
}
exports.SnippetPanel = SnippetPanel;
//# sourceMappingURL=snippetpanel.js.map
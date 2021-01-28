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
exports.CursorRenderer = void 0;
const vscode = __importStar(require("vscode"));
class CursorRenderer {
    // Test whether cursor is in tex command strings
    // like \begin{...} \end{...} \xxxx{ \[ \] \( \) or \\
    isCursorInTeXCommand(document) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return false;
        }
        const cursor = editor.selection.active;
        const r = document.getWordRangeAtPosition(cursor, /\\(?:begin|end|label)\{.*?\}|\\[a-zA-Z]+\{?|\\[()[\]]|\\\\/);
        if (r && r.start.isBefore(cursor) && r.end.isAfter(cursor)) {
            return true;
        }
        return false;
    }
    renderCursor(document, range, thisColor) {
        const editor = vscode.window.activeTextEditor;
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const conf = configuration.get('hover.preview.cursor.enabled');
        if (editor && conf && !this.isCursorInTeXCommand(document)) {
            const cursor = editor.selection.active;
            const symbol = configuration.get('hover.preview.cursor.symbol');
            const color = configuration.get('hover.preview.cursor.color');
            let sym = `{\\color{${thisColor}}${symbol}}`;
            if (color !== 'auto') {
                sym = `{\\color{${color}}${symbol}}`;
            }
            if (range.contains(cursor) && !range.start.isEqual(cursor) && !range.end.isEqual(cursor)) {
                return document.getText(new vscode.Range(range.start, cursor)) + sym + document.getText(new vscode.Range(cursor, range.end));
            }
        }
        return document.getText(range);
    }
}
exports.CursorRenderer = CursorRenderer;
//# sourceMappingURL=cursorrenderer.js.map
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
exports.TextDocumentLike = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const util_1 = require("util");
class TextDocumentLike {
    constructor(s) {
        if (s.match(/\r\n/)) {
            this.eol = vscode.EndOfLine.CRLF;
            this._eol = '\r\n';
        }
        else if (s.match(/\n/)) {
            this.eol = vscode.EndOfLine.LF;
            this._eol = '\n';
        }
        else {
            const editor = vscode.window.activeTextEditor;
            if (editor === undefined || editor.document.eol === vscode.EndOfLine.LF) {
                this.eol = vscode.EndOfLine.LF;
                this._eol = '\n';
            }
            else {
                this.eol = vscode.EndOfLine.CRLF;
                this._eol = '\r\n';
            }
        }
        this._lines = s.split(this._eol);
        this.lineCount = this._lines.length;
    }
    static load(filePath) {
        const uri = vscode.Uri.file(filePath);
        const editor = vscode.window.activeTextEditor;
        if (editor !== undefined && editor.document.uri.fsPath === uri.fsPath) {
            return editor.document;
        }
        for (const doc of vscode.workspace.textDocuments) {
            if (doc.uri.fsPath === uri.fsPath) {
                return doc;
            }
        }
        return new TextDocumentLike(fs.readFileSync(filePath).toString());
    }
    getText(range) {
        if (range === undefined) {
            return this._lines.join(this._eol);
        }
        let ret = '';
        let line;
        const startLineNum = range.start.line;
        const endLineNum = range.end.line;
        if (this.lineCount <= startLineNum) {
            return '';
        }
        if (startLineNum === endLineNum) {
            line = this._lines[startLineNum];
            return line.slice(range.start.character, range.end.character);
        }
        line = this._lines[startLineNum];
        ret += line.slice(range.start.character);
        for (let i = startLineNum + 1; i < endLineNum; i++) {
            ret += this._eol + this._lines[i];
        }
        ret += this._eol + this._lines[endLineNum].slice(0, range.end.character);
        return ret;
    }
    getWordRangeAtPosition(position, regex = /(-?\d.\d\w)|([^`~!@#%^&*()-=+[{\]}|;:'",.<>/?\s]+)/g) {
        if (position.line > this.lineCount) {
            return undefined;
        }
        const line = this._lines[position.line];
        for (let i = position.character; i >= 0; i--) {
            const tmp = line.slice(i);
            const m = tmp.match(regex);
            if (m !== null) {
                return new vscode.Range(position.line, i, position.line, i + m[0].length);
            }
        }
        return undefined;
    }
    lineAt(lineNum) {
        if (util_1.isNumber(lineNum)) {
            return new TextLineLike(this._lines[lineNum]);
        }
        else {
            return new TextLineLike(this._lines[lineNum.line]);
        }
    }
}
exports.TextDocumentLike = TextDocumentLike;
class TextLineLike {
    constructor(s) {
        this.text = s;
    }
}
//# sourceMappingURL=textdocumentlike.js.map
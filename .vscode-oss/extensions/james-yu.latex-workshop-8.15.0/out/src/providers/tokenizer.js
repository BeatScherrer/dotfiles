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
exports.onAPackage = exports.tokenizer = void 0;
const vscode = __importStar(require("vscode"));
const utils = __importStar(require("../utils/utils"));
/**
 * If a string on `position` is like `\command{` or `\command[`, then
 * returns the `\command`. If it is like `{...}` or `[...]`, then
 * returns the string inside brackets.
 *
 * @param document The document to be scanned.
 * @param position The position to be scanned at.
 */
function tokenizer(document, position) {
    const startResult = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position)).match(/[\\{,](?=[^\\{,]*$)/);
    const endResult = document.getText(new vscode.Range(position, new vscode.Position(position.line, 65535))).match(/[{}[\],]/);
    if (startResult === null || endResult === null ||
        startResult.index === undefined || endResult.index === undefined ||
        startResult.index < 0 || endResult.index < 0) {
        return undefined;
    }
    const startIndex = startResult[0] === '\\' ? startResult.index : startResult.index + 1;
    return document.getText(new vscode.Range(new vscode.Position(position.line, startIndex), new vscode.Position(position.line, position.character + endResult.index))).trim();
}
exports.tokenizer = tokenizer;
/**
 * Return `true` if the `position` of the `document` is on a command `\usepackage{...}` including
 * `token`
 * @param document The document to be scanned.
 * @param position The position to be scanned at.
 * @param token The name of package.
 */
function onAPackage(document, position, token) {
    const line = document.lineAt(position.line).text;
    const escapedToken = utils.escapeRegExp(token);
    const regex = new RegExp(`\\\\usepackage(?:\\[[^\\[\\]\\{\\}]*\\])?\\{[\\w,]*${escapedToken}[\\w,]*\\}`);
    if (line.match(regex)) {
        return true;
    }
    return false;
}
exports.onAPackage = onAPackage;
//# sourceMappingURL=tokenizer.js.map
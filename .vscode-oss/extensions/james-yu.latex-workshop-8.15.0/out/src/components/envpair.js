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
exports.EnvPair = void 0;
const vscode = __importStar(require("vscode"));
const utils = __importStar(require("../utils/utils"));
function regexpAllMatches(str, reg) {
    const res = [];
    let m = reg.exec(str);
    while (m) {
        res.push(m);
        m = reg.exec(str);
    }
    return res;
}
class EnvPair {
    constructor(extension) {
        this.beginLength = '\\begin'.length;
        this.endLength = '\\end'.length;
        this.delimiters = {};
        this.extension = extension;
        this.delimiters['begin'] = { end: 'end', splitCharacter: '}' };
        this.delimiters['['] = { end: ']', splitCharacter: '[' };
        this.delimiters['('] = { end: ')', splitCharacter: '(' };
    }
    getEnvName(line, ind, beginOrEnd) {
        const subline = line.slice(ind);
        const re = new RegExp('^' + beginOrEnd + '\\{([^\\{\\}]*)\\}');
        const env = subline.match(re);
        if (env && env.length === 2) {
            return env[1];
        }
        return null;
    }
    tokenizeLine(document, pos) {
        const line = utils.stripComments(document.lineAt(pos).text, '%');
        const ind = pos.character;
        if (ind > line.length) {
            return null;
        }
        const lineUpToInd = line.slice(0, ind + 1);
        const startInd = lineUpToInd.lastIndexOf('\\');
        const startPos = new vscode.Position(pos.line, startInd);
        if (startInd + this.beginLength >= ind && line.slice(startInd, startInd + this.beginLength) === '\\begin') {
            const envName = this.getEnvName(line, startInd, '\\\\begin');
            if (envName) {
                return { pos: startPos, type: 'begin', name: envName };
            }
        }
        else if (startInd + this.endLength >= ind && line.slice(startInd, startInd + this.endLength) === '\\end') {
            const envName = this.getEnvName(line, startInd, '\\\\end');
            if (envName) {
                return { pos: startPos, type: 'end', name: envName };
            }
        }
        return null;
    }
    /**
     * Search upwards or downwards for a begin or end environment captured by `pattern`.
     * The environment can also be \[...\] or \(...\)
     *
     * @param pattern A regex that matches begin or end environments. Note that the regex
     * must capture the delimiters
     * @param dir +1 to search downwards, -1 to search upwards
     * @param pos starting position (e.g. cursor position)
     * @param doc the document in which the search is performed
     * @param splitSubstring where to split the string if dir = 1 (default at end of `\begin{...}`)
     */
    locateMatchingPair(pattern, dir, pos, doc, splitSubstring) {
        const patRegexp = new RegExp(pattern, 'g');
        let lineNumber = pos.line;
        let nested = 0;
        let line = doc.lineAt(lineNumber).text;
        let startCol;
        /* Drop the pattern on the current line */
        switch (dir) {
            case 1:
                if (!splitSubstring) {
                    startCol = line.indexOf('}', pos.character) + 1;
                }
                else {
                    startCol = line.indexOf(splitSubstring, pos.character) + 1;
                }
                line = line.slice(startCol);
                break;
            case -1:
                startCol = 0;
                line = line.slice(startCol, pos.character);
                break;
            default:
                this.extension.logger.addLogMessage('Direction error in locateMatchingPair');
                return null;
        }
        const begins = Object.keys(this.delimiters);
        const ends = Object.keys(this.delimiters).map((key) => {
            return this.delimiters[key].end;
        });
        while (true) {
            line = utils.stripComments(line, '%');
            let allMatches = regexpAllMatches(line, patRegexp);
            if (dir === -1) {
                allMatches = allMatches.reverse();
            }
            for (const m of allMatches) {
                if ((dir === 1 && begins.includes(m[1])) || (dir === -1 && ends.includes(m[1]))) {
                    nested += 1;
                }
                if ((dir === 1 && ends.includes(m[1])) || (dir === -1 && begins.includes(m[1]))) {
                    if (nested === 0) {
                        const col = m.index + 1 + startCol;
                        const matchPos = new vscode.Position(lineNumber, col);
                        const matchName = m[2];
                        const matchType = m[1];
                        return { name: matchName, type: matchType, pos: matchPos };
                    }
                    nested -= 1;
                }
            }
            lineNumber += dir;
            if (lineNumber < 0 || lineNumber >= doc.lineCount) {
                break;
            }
            line = doc.lineAt(lineNumber).text;
            startCol = 0;
        }
        return null;
    }
    /**
     * While on a 'begin' or 'end' keyword, moves the cursor to the corresponding 'end/begin'
     */
    gotoPair() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'latex') {
            return;
        }
        const curPos = editor.selection.active;
        const document = editor.document;
        const tokens = this.tokenizeLine(document, curPos);
        if (!tokens) {
            return;
        }
        const startPos = tokens.pos;
        const pattern = '\\\\(begin|end)\\{' + utils.escapeRegExp(tokens.name) + '\\}';
        const dir = (tokens.type === 'begin') ? 1 : -1;
        const resMatchingPair = this.locateMatchingPair(pattern, dir, startPos, document);
        if (resMatchingPair) {
            const newPos = resMatchingPair.pos;
            editor.selection = new vscode.Selection(newPos, newPos);
            editor.revealRange(new vscode.Range(newPos, newPos));
        }
    }
    /**
     * Select or add a multicursor to an environment name if called with
     * `action = 'selection'` or `action = 'cursor'` respectively.
     *
     * Toggles between `\[...\]` and `\begin{$text}...\end{$text}`
     * where `$text` is `''` if `action = cursor` and `'equation*'` otherwise
     *
     * Only toggles if `action = equationToggle` (i.e. does not move selection)
     *
     * @param action  can be
     *      - 'selection': the environment name is selected both in the begin and end part
     *      - 'cursor': a multicursor is added at the beginning of the environment name is selected both in the begin and end part
     *      - 'equationToggle': toggles between `\[...\]` and `\begin{}...\end{}`
     */
    envNameAction(action) {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'latex') {
            return;
        }
        let startingPos = editor.selection.active;
        const document = editor.document;
        let searchEnvs = '[^\\{\\}]*';
        if (action === 'equationToggle') {
            searchEnvs = '(?:equation|align|flalign|alignat|gather|multline|eqnarray)\\*?';
        }
        const pattern = `(?<!\\\\)\\\\(\\[|\\]|(?:begin|end)(?=\\{(${searchEnvs})\\}))`;
        const dirUp = -1;
        const beginEnv = this.locateMatchingPair(pattern, dirUp, startingPos, document);
        if (!beginEnv) {
            return;
        }
        const dirDown = 1;
        const endEnv = this.locateMatchingPair(pattern, dirDown, beginEnv.pos, document, this.delimiters[beginEnv.type].splitCharacter);
        if (!endEnv) {
            return;
        }
        let envNameLength;
        const beginEnvStartPos = beginEnv.pos.translate(0, 'begin{'.length);
        let endEnvStartPos = endEnv.pos.translate(0, 'end{'.length);
        const edit = new vscode.WorkspaceEdit();
        if (beginEnv.type === '[' && endEnv.type === ']') {
            const eqText = action === 'cursor' ? '' : 'equation*';
            const beginRange = new vscode.Range(beginEnv.pos, beginEnv.pos.translate(0, 1));
            const endRange = new vscode.Range(endEnv.pos, endEnv.pos.translate(0, 1));
            envNameLength = eqText.length;
            edit.replace(document.uri, endRange, `end{${eqText}}`);
            edit.replace(document.uri, beginRange, `begin{${eqText}}`);
            const diff = 'begin{}'.length + envNameLength - '['.length;
            if (startingPos.line === beginEnv.pos.line) {
                startingPos = startingPos.translate(0, diff);
            }
            if (beginEnv.pos.line === endEnv.pos.line) {
                endEnvStartPos = endEnvStartPos.translate(0, diff);
            }
        }
        else if (beginEnv.type === 'begin' && endEnv.type === 'end') {
            envNameLength = beginEnv.name.length;
            if (endEnv.name.length !== envNameLength) {
                return; // bad match
            }
            if (action === 'equationToggle') {
                const beginRange = new vscode.Range(beginEnv.pos, beginEnv.pos.translate(0, envNameLength + 'begin{}'.length));
                const endRange = new vscode.Range(endEnv.pos, endEnv.pos.translate(0, envNameLength + 'end{}'.length));
                edit.replace(document.uri, endRange, ']');
                edit.replace(document.uri, beginRange, '[');
                if (startingPos.line === beginEnv.pos.line) {
                    const diff = Math.max('['.length - 'begin{}'.length - envNameLength, -startingPos.character);
                    startingPos = startingPos.translate(0, diff);
                }
            }
        }
        else {
            return; // bad match
        }
        vscode.workspace.applyEdit(edit).then(success => {
            if (success) {
                switch (action) {
                    case 'cursor':
                        editor.selections = [new vscode.Selection(beginEnvStartPos, beginEnvStartPos), new vscode.Selection(endEnvStartPos, endEnvStartPos)];
                        break;
                    case 'selection': {
                        const beginEnvStopPos = beginEnvStartPos.translate(0, envNameLength);
                        const endEnvStopPos = endEnvStartPos.translate(0, envNameLength);
                        editor.selections = [new vscode.Selection(beginEnvStartPos, beginEnvStopPos), new vscode.Selection(endEnvStartPos, endEnvStopPos)];
                        break;
                    }
                    case 'equationToggle':
                        editor.selection = new vscode.Selection(startingPos, startingPos);
                        break;
                    default:
                        this.extension.logger.addLogMessage('Error - while selecting environment name');
                }
            }
        });
        // editor.revealRange(new vscode.Range(beginEnvStartPos, endEnvStartPos))
    }
    /**
     * Select an environment
     */
    selectEnv() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'latex') {
            return;
        }
        const startingPos = editor.selection.active;
        const document = editor.document;
        const searchEnvs = '[^\\{\\}]*';
        const pattern = `(?<!\\\\)\\\\(\\(|\\)|\\[|\\]|(?:begin|end)(?=\\{(${searchEnvs})\\}))`;
        const dirUp = -1;
        const beginEnv = this.locateMatchingPair(pattern, dirUp, startingPos, document);
        if (!beginEnv) {
            return;
        }
        const dirDown = 1;
        const endEnv = this.locateMatchingPair(pattern, dirDown, beginEnv.pos, document, this.delimiters[beginEnv.type].splitCharacter);
        if (!endEnv) {
            return;
        }
        let envNameLength = 0;
        const edit = new vscode.WorkspaceEdit();
        if (beginEnv.type === 'begin' && endEnv.type === 'end') {
            envNameLength = beginEnv.name.length + 2; // for '{' and '}'
            if (beginEnv.name !== endEnv.name) {
                return; // bad match
            }
        }
        vscode.workspace.applyEdit(edit).then(success => {
            if (success) {
                const beginEnvPos = beginEnv.pos.translate(0, -1);
                const endEnvPos = endEnv.pos.translate(0, envNameLength + beginEnv.type.length);
                editor.selections = [new vscode.Selection(beginEnvPos, endEnvPos)];
            }
        });
        // editor.revealRange(new vscode.Range(beginEnvStartPos, endEnvStartPos))
    }
    closeEnv() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'latex') {
            return;
        }
        const document = editor.document;
        const curPos = editor.selection.active;
        const pattern = '\\\\(begin|end){([^{}]*)}';
        const dir = -1;
        const resMatchingPair = this.locateMatchingPair(pattern, dir, curPos, document);
        if (resMatchingPair) {
            const endEnv = '\\end{' + resMatchingPair.name + '}';
            const beginStartOfLine = resMatchingPair.pos.with(undefined, 0);
            const beginIndentRange = new vscode.Range(beginStartOfLine, resMatchingPair.pos.translate(0, -1));
            const beginIndent = editor.document.getText(beginIndentRange);
            const endStartOfLine = curPos.with(undefined, 0);
            const endIndentRange = new vscode.Range(endStartOfLine, curPos);
            const endIndent = editor.document.getText(endIndentRange);
            // If both \begin and the current position are preceded by
            // whitespace only in their respective lines, we mimic the exact
            // kind of indentation of \begin when inserting \end.
            if (/^\s*$/.test(beginIndent) && /^\s*$/.test(endIndent)) {
                return editor.edit(editBuilder => {
                    editBuilder.replace(new vscode.Range(endStartOfLine, curPos), beginIndent + endEnv);
                });
            }
            else {
                return editor.edit(editBuilder => { editBuilder.insert(curPos, endEnv); });
            }
        }
        return;
    }
}
exports.EnvPair = EnvPair;
//# sourceMappingURL=envpair.js.map
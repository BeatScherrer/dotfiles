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
exports.Section = void 0;
const vscode = __importStar(require("vscode"));
const utils_1 = require("../utils/utils");
class Section {
    constructor(extension) {
        this.levels = ['part', 'chapter', 'section', 'subsection', 'subsubsection', 'paragraph', 'subparagraph'];
        this.upperLevels = {};
        this.lowerLevels = {};
        this.extension = extension;
        for (let i = 0; i < this.levels.length; i++) {
            const current = this.levels[i];
            const upper = this.levels[Math.max(i - 1, 0)];
            const lower = this.levels[Math.min(i + 1, this.levels.length - 1)];
            this.upperLevels[current] = upper;
            this.lowerLevels[current] = lower;
        }
    }
    /**
     * Shift the level sectioning in the selection by one (up or down)
     * @param change 'promote' or 'demote'
     */
    shiftSectioningLevel(change) {
        this.extension.logger.addLogMessage(`Calling shiftSectioningLevel with parameter: ${change}`);
        if (change !== 'promote' && change !== 'demote') {
            throw TypeError(`Invalid value of function parameter 'change' (=${change})`);
        }
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }
        const replacer = (_match, sectionName, asterisk, options, contents) => {
            if (change === 'promote') {
                return '\\' + this.upperLevels[sectionName] + (asterisk !== null && asterisk !== void 0 ? asterisk : '') + (options !== null && options !== void 0 ? options : '') + contents;
            }
            else {
                // if (change === 'demote')
                return '\\' + this.lowerLevels[sectionName] + (asterisk !== null && asterisk !== void 0 ? asterisk : '') + (options !== null && options !== void 0 ? options : '') + contents;
            }
        };
        // when supported, negative lookbehind at start would be nice --- (?<!\\)
        const pattern = '\\\\(' + this.levels.join('|') + ')(\\*)?(\\[.+?\\])?(\\{.*?\\})';
        const regex = new RegExp(pattern, 'g');
        function getLastLineLength(someText) {
            const lines = someText.split(/\n/);
            return lines.slice(lines.length - 1, lines.length)[0].length;
        }
        const document = editor.document;
        const selections = editor.selections;
        const newSelections = [];
        const edit = new vscode.WorkspaceEdit();
        for (let selection of selections) {
            let mode = 'selection';
            let oldSelection = null;
            if (selection.isEmpty) {
                mode = 'cursor';
                oldSelection = selection;
                const line = document.lineAt(selection.anchor);
                selection = new vscode.Selection(line.range.start, line.range.end);
            }
            const selectionText = document.getText(selection);
            const newText = selectionText.replace(regex, replacer);
            edit.replace(document.uri, selection, newText);
            const changeInEndCharacterPosition = getLastLineLength(newText) - getLastLineLength(selectionText);
            if (mode === 'selection') {
                newSelections.push(new vscode.Selection(selection.start, new vscode.Position(selection.end.line, selection.end.character + changeInEndCharacterPosition)));
            }
            else if (oldSelection) { // mode === 'cursor'
                const anchorPosition = oldSelection.anchor.character + changeInEndCharacterPosition;
                const activePosition = oldSelection.active.character + changeInEndCharacterPosition;
                newSelections.push(new vscode.Selection(new vscode.Position(oldSelection.anchor.line, anchorPosition < 0 ? 0 : anchorPosition), new vscode.Position(oldSelection.active.line, activePosition < 0 ? 0 : activePosition)));
            }
        }
        vscode.workspace.applyEdit(edit).then(success => {
            if (success) {
                editor.selections = newSelections;
            }
        });
    }
    /**
     * Find the first sectioning command above the current position
     *
     * @param levels the list of sectioning commands
     * @param pos the current position in the document
     * @param doc the text document
     */
    searchLevelUp(levels, pos, doc) {
        const range = new vscode.Range(new vscode.Position(0, 0), pos.translate(-1, 0));
        const content = utils_1.stripCommentsAndVerbatim(doc.getText(range)).split('\n');
        const pattern = '\\\\(' + levels.join('|') + ')\\*?(?:\\[.+?\\])?\\{.*?\\}';
        const regex = new RegExp(pattern);
        for (let i = pos.line - 1; i >= 0; i -= 1) {
            const res = content[i].match(regex);
            if (res) {
                return { level: res[1], pos: new vscode.Position(i, 0) };
            }
        }
        return undefined;
    }
    /**
     * Find the first sectioning command below the current position.
     * Stop at \appendix or \end{document}
     *
     * @param levels the list of sectioning commands
     * @param pos the current position in the document
     * @param doc the text document
     */
    searchLevelDown(levels, pos, doc) {
        const range = new vscode.Range(pos, new vscode.Position(doc.lineCount, 0));
        const content = utils_1.stripCommentsAndVerbatim(doc.getText(range)).split('\n');
        const pattern = '\\\\(?:(' + levels.join('|') + ')\\*?(?:\\[.+?\\])?\\{.*?\\})|appendix|\\\\end{document}';
        const regex = new RegExp(pattern);
        for (let i = 0; i < content.length; i += 1) {
            const res = content[i].match(regex);
            if (res) {
                return new vscode.Position(i + pos.line - 1, Math.max(content[i - 1].length - 1, 0));
            }
        }
        // Return the end of file position
        return new vscode.Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length - 1);
    }
    selectSection() {
        this.extension.logger.addLogMessage('Calling selectSection.');
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            return;
        }
        const beginLevel = this.searchLevelUp(this.levels, editor.selection.anchor, editor.document);
        if (!beginLevel) {
            this.extension.logger.addLogMessage('Cannot find any section command above current line.');
            return;
        }
        const levelIndex = this.levels.indexOf(beginLevel.level);
        const levels = this.levels.slice(0, levelIndex + 1);
        const endPosition = this.searchLevelDown(levels, editor.selection.end, editor.document);
        editor.selection = new vscode.Selection(beginLevel.pos, endPosition);
    }
}
exports.Section = Section;
//# sourceMappingURL=section.js.map
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
exports.CodeActions = void 0;
const vs = __importStar(require("vscode"));
const CODE_TO_ACTION_STRING = {
    1: 'Terminate command with empty statement',
    2: 'Convert to non-breaking space (~)',
    4: 'Remove italic correction \\/ (not in italic buffer)',
    5: 'Remove extraneous italic correction(s)',
    6: 'Add italic correction (\\/)',
    11: 'Fix ellipsis',
    12: 'Add interword space (\\ )',
    13: 'Add intersentence space (\\@)',
    18: "Replace with ` or '",
    32: 'Replace with `',
    33: "Replace with '",
    24: 'Remove extraneous space',
    28: 'Remove incorrect \\/',
    26: 'Remove extraneous space',
    34: "Replace with ` or '",
    35: 'Use suggested alternative',
    39: 'Remove extraneous space',
    42: 'Remove extraneous space',
    45: 'Use \\[ ... \\] instead of $$ ... $$',
    46: 'Use \\( ... \\) instead of $ ... $'
};
function replaceWhitespaceOnLineBefore(document, position, replaceWith) {
    const beforePosRange = new vs.Range(new vs.Position(position.line, 0), position);
    const text = document.getText(beforePosRange);
    const regexResult = /\s*$/.exec(text);
    if (!regexResult) {
        return vs.workspace.applyEdit(new vs.WorkspaceEdit());
    }
    const charactersToRemove = regexResult[0].length;
    const wsRange = new vs.Range(new vs.Position(position.line, position.character - charactersToRemove), position);
    const edit = new vs.WorkspaceEdit();
    edit.replace(document.uri, wsRange, replaceWith);
    return vs.workspace.applyEdit(edit);
}
function replaceRangeWithString(document, range, replacementString) {
    const edit = new vs.WorkspaceEdit();
    edit.replace(document.uri, range, replacementString);
    return vs.workspace.applyEdit(edit);
}
function replaceRangeWithRepeatedString(document, range, replacementString) {
    return replaceRangeWithString(document, range, replacementString.repeat(range.end.character - range.start.character));
}
function characterBeforeRange(document, range) {
    return document.getText(range.with(range.start.translate(0, -1)))[0];
}
function isOpeningQuote(document, range) {
    return range.start.character === 0 || characterBeforeRange(document, range) === ' ';
}
function replaceMathDelimitersInRange(document, range, oldDelim, startDelim, endDelim) {
    const oldDelimLength = oldDelim.length;
    const endRange = range.with(range.end.translate(0, -oldDelimLength), range.end);
    const text = document.getText(endRange);
    // Check if the end position really contains the end delimiter. This is not the cause when the opening and closing delimiters are on different lines
    const regex = new RegExp('^' + oldDelim.replace(/\$/g, '\\$') + '$');
    const regexResult = regex.exec(text);
    if (!regexResult) {
        return;
    }
    const edit = new vs.WorkspaceEdit();
    edit.replace(document.uri, endRange, endDelim);
    const startRange = range.with(range.start, range.start.translate(0, oldDelimLength));
    edit.replace(document.uri, startRange, startDelim);
    return vs.workspace.applyEdit(edit);
}
class CodeActions {
    constructor(extension) {
        this.extension = extension;
    }
    // Leading underscore to avoid tslint complaint
    provideCodeActions(document, _range, context, _token) {
        const actions = [];
        context.diagnostics.filter(d => d.source === 'ChkTeX').forEach(d => {
            let code = typeof d.code === 'object' ? d.code.value : d.code;
            if (!code) {
                return;
            }
            if (typeof code === 'string') {
                code = parseInt(code);
            }
            const label = CODE_TO_ACTION_STRING[code];
            if (label !== undefined) {
                actions.push({
                    title: label,
                    command: 'latex-workshop.code-action',
                    arguments: [document, d.range, d.code, d.message]
                });
            }
        });
        return actions;
    }
    runCodeAction(document, range, code, message) {
        let fixString;
        let regexResult;
        switch (code) {
            case 24:
            case 26:
            case 39:
            case 42:
                // In all these cases remove all proceeding whitespace.
                replaceWhitespaceOnLineBefore(document, range.end, '');
                break;
            case 4:
            case 5:
            case 28:
                // In all these cases just clear what ChkTeX highlighted.
                replaceRangeWithString(document, range, '');
                break;
            case 1:
                replaceWhitespaceOnLineBefore(document, range.end.translate(0, -1), '{}');
                break;
            case 2:
                replaceWhitespaceOnLineBefore(document, range.end, '~');
                break;
            case 6:
                replaceWhitespaceOnLineBefore(document, range.end.translate(0, -1), '\\/');
                break;
            case 11:
                // add a space after so we don't accidentally join with the following word.
                regexResult = /\\[cl]?dots/.exec(message);
                if (!regexResult) {
                    break;
                }
                fixString = regexResult[0] + ' ';
                replaceRangeWithString(document, range, fixString);
                break;
            case 12:
                replaceRangeWithString(document, range, '\\ ');
                break;
            case 13:
                replaceWhitespaceOnLineBefore(document, range.end.translate(0, -1), '\\@');
                break;
            case 18:
                if (isOpeningQuote(document, range)) {
                    replaceRangeWithRepeatedString(document, range, '``');
                }
                else {
                    replaceRangeWithRepeatedString(document, range, "''");
                }
                break;
            case 32:
                replaceRangeWithRepeatedString(document, range, '`');
                break;
            case 33:
                replaceRangeWithRepeatedString(document, range, "'");
                break;
            case 34:
                if (isOpeningQuote(document, range)) {
                    replaceRangeWithRepeatedString(document, range, '`');
                }
                else {
                    replaceRangeWithRepeatedString(document, range, "'");
                }
                break;
            case 35:
                regexResult = /`(.+)'/.exec(message);
                if (!regexResult) {
                    break;
                }
                fixString = regexResult[1];
                replaceRangeWithString(document, range, fixString);
                break;
            case 45:
                replaceMathDelimitersInRange(document, range, '$$', '\\[', '\\]');
                break;
            case 46:
                replaceMathDelimitersInRange(document, range, '$', '\\(', '\\)');
                break;
            default:
                break;
        }
    }
}
exports.CodeActions = CodeActions;
//# sourceMappingURL=codeactions.js.map
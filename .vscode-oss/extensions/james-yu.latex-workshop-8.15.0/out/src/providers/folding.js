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
exports.WeaveFoldingProvider = exports.FoldingProvider = void 0;
const vscode = __importStar(require("vscode"));
class FoldingProvider {
    constructor(extension) {
        this.sectionRegex = [];
        this.extension = extension;
        const sections = vscode.workspace.getConfiguration('latex-workshop').get('view.outline.sections');
        this.sectionRegex = sections.map(section => RegExp(`\\\\(?:${section})(?:\\*)?(?:\\[[^\\[\\]\\{\\}]*\\])?{(.*)}`, 'm'));
    }
    provideFoldingRanges(document, _context, _token) {
        return [...this.getSectionFoldingRanges(document), ...this.getEnvironmentFoldingRanges(document)];
    }
    getSectionFoldingRanges(document) {
        const startingIndices = this.sectionRegex.map(_ => -1);
        const lines = document.getText().split(/\r?\n/g);
        let documentClassLine = -1;
        const sections = [];
        let index = -1;
        for (const line of lines) {
            index++;
            for (const regex of this.sectionRegex) {
                const result = regex.exec(line);
                if (!result) {
                    continue;
                }
                const regIndex = this.sectionRegex.indexOf(regex);
                const originalIndex = startingIndices[regIndex];
                if (originalIndex === -1) {
                    startingIndices[regIndex] = index;
                    continue;
                }
                let i = regIndex;
                while (i < this.sectionRegex.length) {
                    sections.push({
                        level: i,
                        from: startingIndices[i],
                        to: index - 1
                    });
                    startingIndices[i] = regIndex === i ? index : -1;
                    ++i;
                }
            }
            if (/\\documentclass/.exec(line)) {
                documentClassLine = index;
            }
            if (/\\begin{document}/.exec(line) && documentClassLine > -1) {
                sections.push({
                    level: 0,
                    from: documentClassLine,
                    to: index - 1
                });
            }
            if (/\\end{document}/.exec(line) || index === lines.length - 1) {
                for (let i = 0; i < startingIndices.length; ++i) {
                    if (startingIndices[i] === -1) {
                        continue;
                    }
                    sections.push({
                        level: i,
                        from: startingIndices[i],
                        to: index - 1
                    });
                }
            }
        }
        return sections.map(section => new vscode.FoldingRange(section.from, section.to));
    }
    getEnvironmentFoldingRanges(document) {
        const ranges = [];
        const opStack = [];
        const text = document.getText();
        const envRegex = /\\(begin){(.*?)}|\\(begingroup)[%\s\\]|\\(end){(.*?)}|\\(endgroup)[%\s\\]|^%\s*#?([rR]egion)|^%\s*#?([eE]ndregion)/gm; //to match one 'begin' OR 'end'
        while (true) {
            const match = envRegex.exec(text);
            if (match === null) {
                //TODO: if opStack still not empty
                return ranges;
            }
            //for 'begin': match[1] contains 'begin', match[2] contains keyword
            //for 'end':   match[4] contains 'end',   match[5] contains keyword
            //for 'begingroup': match[3] contains 'begingroup', keyword is 'group'
            //for 'endgroup': match[6] contains 'endgroup', keyword is 'group'
            //for '% region': match[7] contains 'region', keyword is 'region'
            //for '% endregion': match[8] contains 'endregion', keyword is 'region'
            let keyword = '';
            if (match[1]) {
                keyword = match[2];
            }
            else if (match[4]) {
                keyword = match[5];
            }
            else if (match[3] || match[6]) {
                keyword = 'group';
            }
            else if (match[7] || match[8]) {
                keyword = 'region';
            }
            const item = {
                keyword,
                index: match.index
            };
            const lastItem = opStack[opStack.length - 1];
            if ((match[4] || match[6] || match[8]) && lastItem && lastItem.keyword === item.keyword) { // match 'end' with its 'begin'
                opStack.pop();
                ranges.push(new vscode.FoldingRange(document.positionAt(lastItem.index).line, document.positionAt(item.index).line - 1));
            }
            else {
                opStack.push(item);
            }
        }
    }
}
exports.FoldingProvider = FoldingProvider;
class WeaveFoldingProvider {
    constructor(extension) {
        this.extension = extension;
    }
    provideFoldingRanges(document, _context, _token) {
        const ranges = [];
        const opStack = [];
        const text = document.getText();
        const envRegex = /^([\t ]*<<.*>>=)\s*$|[\t ]*(@)\s*$/gm;
        while (true) {
            const match = envRegex.exec(text);
            if (match === null) {
                return ranges;
            }
            let keyword = '';
            if (match[1]) {
                keyword = 'begin';
            }
            else if (match[2]) {
                keyword = 'end';
            }
            const item = {
                keyword,
                index: match.index
            };
            const lastItem = opStack[opStack.length - 1];
            if (keyword === 'end' && lastItem && lastItem.keyword === 'begin') { // match 'end' with its 'begin'
                opStack.pop();
                ranges.push(new vscode.FoldingRange(document.positionAt(lastItem.index).line, document.positionAt(item.index).line - 1));
            }
            else {
                opStack.push(item);
            }
        }
    }
}
exports.WeaveFoldingProvider = WeaveFoldingProvider;
//# sourceMappingURL=folding.js.map
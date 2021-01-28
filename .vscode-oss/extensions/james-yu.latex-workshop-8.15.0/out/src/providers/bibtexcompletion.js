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
exports.BibtexCompleter = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs-extra"));
class BibtexCompleter {
    constructor(extension) {
        this.entryItems = [];
        this.optFieldItems = {};
        this.extension = extension;
        try {
            this.loadDefaultItems();
        }
        catch (err) {
            this.extension.logger.addLogMessage(`Error reading data: ${err}.`);
        }
    }
    loadDefaultItems() {
        const entries = JSON.parse(fs.readFileSync(`${this.extension.extensionRoot}/data/bibtex-entries.json`, { encoding: 'utf8' }));
        const optFields = JSON.parse(fs.readFileSync(`${this.extension.extensionRoot}/data/bibtex-optional-entries.json`, { encoding: 'utf8' }));
        const entriesReplacements = vscode.workspace.getConfiguration('latex-workshop').get('intellisense.bibtexJSON.replace');
        const config = vscode.workspace.getConfiguration('latex-workshop');
        const leftright = config.get('bibtex-format.surround') === 'Curly braces' ? ['{', '}'] : ['"', '"'];
        const tabs = { '2 spaces': '  ', '4 spaces': '    ', 'tab': '\t' };
        const bibtexFormat = {
            tab: tabs[config.get('bibtex-format.tab')],
            case: config.get('bibtex-format.case'),
            left: leftright[0],
            right: leftright[1],
            trailingComma: config.get('bibtex-format.trailingComma'),
            sort: config.get('bibtex-format.sortby')
        };
        const maxLengths = this.computeMaxLengths(entries, optFields);
        const entriesList = [];
        Object.keys(entries).forEach(entry => {
            if (entry in entriesList) {
                return;
            }
            if (entry in entriesReplacements) {
                this.entryItems.push(this.entryToCompletion(entry, entriesReplacements[entry], bibtexFormat, maxLengths));
            }
            else {
                this.entryItems.push(this.entryToCompletion(entry, entries[entry], bibtexFormat, maxLengths));
            }
            entriesList.push(entry);
        });
        Object.keys(optFields).forEach(entry => {
            this.optFieldItems[entry] = this.fieldsToCompletion(entry, optFields[entry], bibtexFormat, maxLengths);
        });
    }
    computeMaxLengths(entries, optFields) {
        const maxLengths = {};
        Object.keys(entries).forEach(key => {
            let maxFieldLength = 0;
            entries[key].forEach(field => {
                maxFieldLength = Math.max(maxFieldLength, field.length);
            });
            if (key in optFields) {
                optFields[key].forEach(field => {
                    maxFieldLength = Math.max(maxFieldLength, field.length);
                });
            }
            maxLengths[key] = maxFieldLength;
        });
        return maxLengths;
    }
    entryToCompletion(itemName, itemFields, config, maxLengths) {
        const suggestion = new vscode.CompletionItem(itemName, vscode.CompletionItemKind.Snippet);
        suggestion.detail = itemName;
        suggestion.documentation = `Add a @${itemName} entry`;
        let count = 1;
        // The following code is copied from bibtexutils.ts:bibtexFormat
        // Find the longest field name in entry
        let s = itemName + '{${0:key}';
        itemFields.forEach(field => {
            s += ',\n' + config.tab + (config.case === 'lowercase' ? field : field.toUpperCase());
            s += ' '.repeat(maxLengths[itemName] - field.length) + ' = ';
            s += config.left + `$${count}` + config.right;
            count++;
        });
        s += '\n}';
        suggestion.insertText = new vscode.SnippetString(s);
        return suggestion;
    }
    fieldsToCompletion(itemName, fields, config, maxLengths) {
        const suggestions = [];
        fields.forEach(field => {
            const suggestion = new vscode.CompletionItem(field, vscode.CompletionItemKind.Snippet);
            suggestion.detail = field;
            suggestion.documentation = `Add ${field} = ${config.left}${config.right}`;
            suggestion.insertText = new vscode.SnippetString(`${field}` + ' '.repeat(maxLengths[itemName] - field.length) + ` = ${config.left}$1${config.right},`);
            suggestions.push(suggestion);
        });
        return suggestions;
    }
    provideCompletionItems(document, position) {
        const currentLine = document.lineAt(position.line).text;
        const prevLine = document.lineAt(position.line - 1).text;
        if (currentLine.match(/@[a-zA-Z]*$/)) {
            // Complete an entry name
            return this.entryItems;
        }
        else if (currentLine.match(/^\s*[a-zA-Z]*/) && prevLine.match(/(?:@[a-zA-Z]{)|(?:["}0-9],\s*$)/)) {
            // Add optional fields
            const optFields = this.provideOptFields(document, position);
            return optFields;
        }
        return;
    }
    provideOptFields(document, position) {
        const pattern = /^\s*@([a-zA-Z]+)\{(?:[^,]*,)?\s$/m;
        const content = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        const reversedContent = content.replace(/(\r\n)|\r/g, '\n').split('\n').reverse().join('\n');
        const match = reversedContent.match(pattern);
        if (match) {
            const entryType = match[1].toLowerCase();
            if (entryType in this.optFieldItems) {
                return this.optFieldItems[entryType];
            }
        }
        return [];
    }
}
exports.BibtexCompleter = BibtexCompleter;
//# sourceMappingURL=bibtexcompletion.js.map
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
exports.BibtexFormatterProvider = exports.BibtexFormatter = void 0;
const vscode = __importStar(require("vscode"));
const latex_utensils_1 = require("latex-utensils");
const perf_hooks_1 = require("perf_hooks");
const bibtexUtils = __importStar(require("../utils/bibtexutils"));
class BibtexFormatter {
    constructor(extension) {
        this.extension = extension;
        this.duplicatesDiagnostics = vscode.languages.createDiagnosticCollection('BibTeX');
        this.diags = [];
    }
    async bibtexFormat(sort, align) {
        if (!vscode.window.activeTextEditor) {
            this.extension.logger.addLogMessage('Exit formatting. The active textEditor is undefined.');
            return;
        }
        if (vscode.window.activeTextEditor.document.languageId !== 'bibtex') {
            this.extension.logger.addLogMessage('Exit formatting. The active textEditor is not of bibtex type.');
            return;
        }
        const doc = vscode.window.activeTextEditor.document;
        const t0 = perf_hooks_1.performance.now(); // Measure performance
        this.duplicatesDiagnostics.clear();
        this.extension.logger.addLogMessage('Start bibtex formatting on user request.');
        const edits = await this.formatDocument(doc, sort, align);
        if (edits.length === 0) {
            return;
        }
        const edit = new vscode.WorkspaceEdit();
        edits.forEach(e => {
            edit.replace(doc.uri, e.range, e.newText);
        });
        vscode.workspace.applyEdit(edit).then(success => {
            if (success) {
                this.duplicatesDiagnostics.set(doc.uri, this.diags);
                const t1 = perf_hooks_1.performance.now();
                this.extension.logger.addLogMessage(`BibTeX action successful. Took ${t1 - t0} ms.`);
            }
            else {
                this.extension.logger.showErrorMessage('Something went wrong while processing the bibliography.');
            }
        });
    }
    async formatDocument(document, sort, align, range) {
        // Get configuration
        const config = vscode.workspace.getConfiguration('latex-workshop');
        const handleDuplicates = config.get('bibtex-format.handleDuplicates');
        const leftright = config.get('bibtex-format.surround') === 'Curly braces' ? ['{', '}'] : ['"', '"'];
        const tabs = { '2 spaces': '  ', '4 spaces': '    ', 'tab': '\t' };
        const configuration = {
            tab: tabs[config.get('bibtex-format.tab')],
            case: config.get('bibtex-format.case'),
            left: leftright[0],
            right: leftright[1],
            trailingComma: config.get('bibtex-format.trailingComma'),
            sort: config.get('bibtex-format.sortby')
        };
        const lineOffset = range ? range.start.line : 0;
        const columnOffset = range ? range.start.character : 0;
        const ast = await this.extension.pegParser.parseBibtex(document.getText(range)).catch((error) => {
            if (error instanceof (Error)) {
                this.extension.logger.addLogMessage('Bibtex parser failed.');
                this.extension.logger.addLogMessage(error.message);
                this.extension.logger.showErrorMessage('Bibtex parser failed with error: ' + error.message);
            }
            return undefined;
        });
        if (!ast) {
            return [];
        }
        // Create an array of entries and of their starting locations
        const entries = [];
        const entryLocations = [];
        ast.content.forEach(item => {
            if (latex_utensils_1.bibtexParser.isEntry(item)) {
                entries.push(item);
                // latex-utilities uses 1-based locations whereas VSCode uses 0-based
                entryLocations.push(new vscode.Range(item.location.start.line - 1, item.location.start.column - 1, item.location.end.line - 1, item.location.end.column - 1));
            }
        });
        // Get the sorted locations
        let sortedEntryLocations = [];
        const duplicates = new Set();
        if (sort) {
            entries.sort(bibtexUtils.bibtexSort(configuration.sort, duplicates)).forEach(entry => {
                sortedEntryLocations.push((new vscode.Range(entry.location.start.line - 1, entry.location.start.column - 1, entry.location.end.line - 1, entry.location.end.column - 1)));
            });
        }
        else {
            sortedEntryLocations = entryLocations;
        }
        // Successively replace the text in the current location from the sorted location
        this.duplicatesDiagnostics.clear();
        const edits = [];
        this.diags = [];
        let lineDelta = 0;
        let text;
        let isDuplicate;
        for (let i = 0; i < entries.length; i++) {
            if (align) {
                text = bibtexUtils.bibtexFormat(entries[i], configuration);
            }
            else {
                text = document.getText(sortedEntryLocations[i]);
            }
            isDuplicate = duplicates.has(entries[i]);
            if (isDuplicate && handleDuplicates !== 'Ignore Duplicates') {
                if (handleDuplicates === 'Highlight Duplicates') {
                    const highlightRange = new vscode.Range(entryLocations[i].start.line + lineDelta + lineOffset, entryLocations[i].start.character + columnOffset, entryLocations[i].start.line + lineDelta + (sortedEntryLocations[i].end.line - sortedEntryLocations[i].start.line) + lineOffset, entryLocations[i].end.character);
                    this.diags.push(new vscode.Diagnostic(highlightRange, `Duplicate entry "${entries[i].internalKey}".`, vscode.DiagnosticSeverity.Warning));
                }
                else { // 'Comment Duplicates'
                    // Log duplicate entry since we aren't highlighting it
                    this.extension.logger.addLogMessage(`BibTeX-format: Duplicate entry "${entries[i].internalKey}" at line ${entryLocations[i].start.line + lineDelta + 1 + lineOffset}.`);
                    text = text.replace(/@/, '');
                }
            }
            // Put text from entry[i] into (sorted)location[i]
            edits.push(new vscode.TextEdit(new vscode.Range(entryLocations[i].start.translate(range === null || range === void 0 ? void 0 : range.start.line, range === null || range === void 0 ? void 0 : range.start.character), entryLocations[i].end.translate(range === null || range === void 0 ? void 0 : range.start.line)), text));
            // We need to figure out the line changes in order to highlight properly
            lineDelta += (sortedEntryLocations[i].end.line - sortedEntryLocations[i].start.line) - (entryLocations[i].end.line - entryLocations[i].start.line);
        }
        this.extension.logger.addLogMessage('Formatted ' + document.fileName);
        return edits;
    }
}
exports.BibtexFormatter = BibtexFormatter;
class BibtexFormatterProvider {
    constructor(extension) {
        this.extension = extension;
        this.formatter = new BibtexFormatter(extension);
    }
    provideDocumentFormattingEdits(document, _options, _token) {
        const sort = vscode.workspace.getConfiguration('latex-workshop').get('bibtex-format.sort.enabled');
        this.extension.logger.addLogMessage('Start bibtex formatting on behalf of VSCode\'s formatter.');
        return this.formatter.formatDocument(document, sort, true);
    }
    provideDocumentRangeFormattingEdits(document, range, _options, _token) {
        const sort = vscode.workspace.getConfiguration('latex-workshop').get('bibtex-format.sort.enabled');
        this.extension.logger.addLogMessage('Start bibtex selection formatting on behalf of VSCode\'s formatter.');
        return this.formatter.formatDocument(document, sort, true, range);
    }
}
exports.BibtexFormatterProvider = BibtexFormatterProvider;
//# sourceMappingURL=bibtexformatter.js.map
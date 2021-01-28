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
exports.Extension = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const commander_1 = require("./commander");
const commander_2 = require("./components/commander");
const logger_1 = require("./components/logger");
const buildinfo_1 = require("./components/buildinfo");
const manager_1 = require("./components/manager");
const builder_1 = require("./components/builder");
const viewer_1 = require("./components/viewer");
const server_1 = require("./components/server");
const locator_1 = require("./components/locator");
const linter_1 = require("./components/linter");
const cleaner_1 = require("./components/cleaner");
const counter_1 = require("./components/counter");
const texmagician_1 = require("./components/texmagician");
const envpair_1 = require("./components/envpair");
const section_1 = require("./components/section");
const log_1 = require("./components/parser/log");
const syntax_1 = require("./components/parser/syntax");
const completion_1 = require("./providers/completion");
const bibtexcompletion_1 = require("./providers/bibtexcompletion");
const codeactions_1 = require("./providers/codeactions");
const hover_1 = require("./providers/hover");
const graphicspreview_1 = require("./providers/preview/graphicspreview");
const mathpreview_1 = require("./providers/preview/mathpreview");
const mathpreviewpanel_1 = require("./components/mathpreviewpanel");
const docsymbol_1 = require("./providers/docsymbol");
const projectsymbol_1 = require("./providers/projectsymbol");
const structure_1 = require("./providers/structure");
const definition_1 = require("./providers/definition");
const latexformatter_1 = require("./providers/latexformatter");
const folding_1 = require("./providers/folding");
const snippetpanel_1 = require("./components/snippetpanel");
const bibtexformatter_1 = require("./providers/bibtexformatter");
const snippetview_1 = require("./providers/snippetview");
const config_1 = require("./config");
function conflictExtensionCheck() {
    function check(extensionID, name, suggestion) {
        if (vscode.extensions.getExtension(extensionID) !== undefined) {
            vscode.window.showWarningMessage(`LaTeX Workshop is incompatible with extension "${name}". ${suggestion}`);
        }
    }
    check('tomoki1207.pdf', 'vscode-pdf', 'Please consider disabling either extension.');
}
function selectDocumentsWithId(ids) {
    const selector = ids.map((id) => {
        return { scheme: 'file', language: id };
    });
    return selector;
}
function activate(context) {
    const extension = new Extension();
    vscode.commands.executeCommand('setContext', 'latex-workshop:enabled', true);
    // let configuration = vscode.workspace.getConfiguration('latex-workshop')
    // if (configuration.get('bind.altKeymap.enabled')) {
    //     vscode.commands.executeCommand('setContext', 'latex-workshop:altkeymap', true)
    // } else {
    //     vscode.commands.executeCommand('setContext', 'latex-workshop:altkeymap', false)
    // }
    vscode.commands.registerCommand('latex-workshop.saveWithoutBuilding', () => extension.commander.saveWithoutBuilding());
    vscode.commands.registerCommand('latex-workshop.build', () => extension.commander.build());
    vscode.commands.registerCommand('latex-workshop.recipes', (recipe) => extension.commander.recipes(recipe));
    vscode.commands.registerCommand('latex-workshop.view', (mode) => extension.commander.view(mode));
    vscode.commands.registerCommand('latex-workshop.refresh-viewer', () => extension.commander.refresh());
    vscode.commands.registerCommand('latex-workshop.tab', () => extension.commander.view('tab'));
    vscode.commands.registerCommand('latex-workshop.viewInBrowser', () => extension.commander.view('browser'));
    vscode.commands.registerCommand('latex-workshop.viewExternal', () => extension.commander.view('external'));
    vscode.commands.registerCommand('latex-workshop.setViewer', () => extension.commander.view('set'));
    vscode.commands.registerCommand('latex-workshop.kill', () => extension.commander.kill());
    vscode.commands.registerCommand('latex-workshop.synctex', () => extension.commander.synctex());
    vscode.commands.registerCommand('latex-workshop.texdoc', (pkg) => extension.commander.texdoc(pkg));
    vscode.commands.registerCommand('latex-workshop.texdocUsepackages', () => extension.commander.texdocUsepackages());
    vscode.commands.registerCommand('latex-workshop.synctexto', (line, filePath) => extension.commander.synctexonref(line, filePath));
    vscode.commands.registerCommand('latex-workshop.clean', () => extension.commander.clean());
    vscode.commands.registerCommand('latex-workshop.actions', () => extension.commander.actions());
    vscode.commands.registerCommand('latex-workshop.citation', () => extension.commander.citation());
    vscode.commands.registerCommand('latex-workshop.addtexroot', () => extension.commander.addTexRoot());
    vscode.commands.registerCommand('latex-workshop.wordcount', () => extension.commander.wordcount());
    vscode.commands.registerCommand('latex-workshop.log', () => extension.commander.log());
    vscode.commands.registerCommand('latex-workshop.compilerlog', () => extension.commander.log('compiler'));
    vscode.commands.registerCommand('latex-workshop.code-action', (d, r, c, m) => extension.codeActions.runCodeAction(d, r, c, m));
    vscode.commands.registerCommand('latex-workshop.goto-section', (filePath, lineNumber) => extension.commander.gotoSection(filePath, lineNumber));
    vscode.commands.registerCommand('latex-workshop.navigate-envpair', () => extension.commander.navigateToEnvPair());
    vscode.commands.registerCommand('latex-workshop.select-envcontent', () => extension.commander.selectEnvContent());
    vscode.commands.registerCommand('latex-workshop.select-envname', () => extension.commander.selectEnvName());
    vscode.commands.registerCommand('latex-workshop.multicursor-envname', () => extension.commander.multiCursorEnvName());
    vscode.commands.registerCommand('latex-workshop.toggle-equation-envname', () => extension.commander.toggleEquationEnv());
    vscode.commands.registerCommand('latex-workshop.close-env', () => extension.commander.closeEnv());
    vscode.commands.registerCommand('latex-workshop.wrap-env', () => extension.commander.insertSnippet('wrapEnv'));
    vscode.commands.registerCommand('latex-workshop.onEnterKey', () => extension.commander.onEnterKey());
    vscode.commands.registerCommand('latex-workshop.onAltEnterKey', () => extension.commander.onEnterKey('alt'));
    vscode.commands.registerCommand('latex-workshop.revealOutputDir', () => extension.commander.revealOutputDir());
    vscode.commands.registerCommand('latex-workshop-dev.parselog', () => extension.commander.devParseLog());
    vscode.commands.registerCommand('latex-workshop-dev.parsetex', () => extension.commander.devParseTeX());
    vscode.commands.registerCommand('latex-workshop-dev.parsebib', () => extension.commander.devParseBib());
    vscode.commands.registerCommand('latex-workshop.shortcut.item', () => extension.commander.insertSnippet('item'));
    vscode.commands.registerCommand('latex-workshop.shortcut.emph', () => extension.commander.toggleSelectedKeyword('emph'));
    vscode.commands.registerCommand('latex-workshop.shortcut.textbf', () => extension.commander.toggleSelectedKeyword('textbf'));
    vscode.commands.registerCommand('latex-workshop.shortcut.textit', () => extension.commander.toggleSelectedKeyword('textit'));
    vscode.commands.registerCommand('latex-workshop.shortcut.underline', () => extension.commander.toggleSelectedKeyword('underline'));
    vscode.commands.registerCommand('latex-workshop.shortcut.textrm', () => extension.commander.toggleSelectedKeyword('textrm'));
    vscode.commands.registerCommand('latex-workshop.shortcut.texttt', () => extension.commander.toggleSelectedKeyword('texttt'));
    vscode.commands.registerCommand('latex-workshop.shortcut.textsl', () => extension.commander.toggleSelectedKeyword('textsl'));
    vscode.commands.registerCommand('latex-workshop.shortcut.textsc', () => extension.commander.toggleSelectedKeyword('textsc'));
    vscode.commands.registerCommand('latex-workshop.shortcut.textnormal', () => extension.commander.toggleSelectedKeyword('textnormal'));
    vscode.commands.registerCommand('latex-workshop.shortcut.textsuperscript', () => extension.commander.toggleSelectedKeyword('textsuperscript'));
    vscode.commands.registerCommand('latex-workshop.shortcut.textsubscript', () => extension.commander.toggleSelectedKeyword('textsubscript'));
    vscode.commands.registerCommand('latex-workshop.shortcut.mathbf', () => extension.commander.toggleSelectedKeyword('mathbf'));
    vscode.commands.registerCommand('latex-workshop.shortcut.mathit', () => extension.commander.toggleSelectedKeyword('mathit'));
    vscode.commands.registerCommand('latex-workshop.shortcut.mathrm', () => extension.commander.toggleSelectedKeyword('mathrm'));
    vscode.commands.registerCommand('latex-workshop.shortcut.mathtt', () => extension.commander.toggleSelectedKeyword('mathtt'));
    vscode.commands.registerCommand('latex-workshop.shortcut.mathsf', () => extension.commander.toggleSelectedKeyword('mathsf'));
    vscode.commands.registerCommand('latex-workshop.shortcut.mathbb', () => extension.commander.toggleSelectedKeyword('mathbb'));
    vscode.commands.registerCommand('latex-workshop.shortcut.mathcal', () => extension.commander.toggleSelectedKeyword('mathcal'));
    vscode.commands.registerCommand('latex-workshop.surround', () => extension.completer.command.surround());
    vscode.commands.registerCommand('latex-workshop.promote-sectioning', () => extension.commander.shiftSectioningLevel('promote'));
    vscode.commands.registerCommand('latex-workshop.demote-sectioning', () => extension.commander.shiftSectioningLevel('demote'));
    vscode.commands.registerCommand('latex-workshop.select-section', () => extension.commander.selectSection());
    vscode.commands.registerCommand('latex-workshop.showCompilationPanel', () => extension.buildInfo.showPanel());
    vscode.commands.registerCommand('latex-workshop.showSnippetPanel', () => extension.snippetPanel.showPanel());
    vscode.commands.registerCommand('latex-workshop.bibsort', () => extension.bibtexFormatter.bibtexFormat(true, false));
    vscode.commands.registerCommand('latex-workshop.bibalign', () => extension.bibtexFormatter.bibtexFormat(false, true));
    vscode.commands.registerCommand('latex-workshop.bibalignsort', () => extension.bibtexFormatter.bibtexFormat(true, true));
    vscode.commands.registerCommand('latex-workshop.openMathPreviewPanel', () => extension.commander.openMathPreviewPanel());
    vscode.commands.registerCommand('latex-workshop.closeMathPreviewPanel', () => extension.commander.closeMathPreviewPanel());
    vscode.commands.registerCommand('latex-workshop.toggleMathPreviewPanel', () => extension.commander.toggleMathPreviewPanel());
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((e) => {
        if (extension.manager.hasTexId(e.languageId)) {
            extension.linter.lintRootFileIfEnabled();
            extension.structureProvider.refresh();
            extension.structureProvider.update();
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            if (configuration.get('latex.autoBuild.run') === "onSave" /* onSave */) {
                if (extension.builder.disableBuildAfterSave) {
                    extension.logger.addLogMessage('Auto Build Run is temporarily disabled during a second.');
                    return;
                }
                extension.logger.addLogMessage(`Auto build started on saving file: ${e.fileName}`);
                extension.commander.build(true);
            }
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((e) => {
        // This function will be called when a new text is opened, or an inactive editor is reactivated after vscode reload
        if (extension.manager.hasTexId(e.languageId)) {
            config_1.obsoleteConfigCheck(extension);
            extension.manager.findRoot();
            extension.structureProvider.refresh();
            extension.structureProvider.update();
        }
        if (e.languageId === 'pdf') {
            extension.manager.watchPdfFile(e.uri.fsPath);
            vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(() => {
                extension.commander.pdf(e.uri);
            });
        }
    }));
    let updateCompleter;
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        if (!extension.manager.hasTexId(e.document.languageId)) {
            return;
        }
        extension.linter.lintActiveFileIfEnabledAfterInterval();
        if (extension.manager.cachedContent[e.document.fileName] === undefined) {
            return;
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const content = e.document.getText();
        extension.manager.cachedContent[e.document.fileName].content = content;
        if (configuration.get('intellisense.update.aggressive.enabled')) {
            if (updateCompleter) {
                clearTimeout(updateCompleter);
            }
            updateCompleter = setTimeout(() => {
                const file = e.document.uri.fsPath;
                extension.manager.updateCompleter(file, content);
            }, configuration.get('intellisense.update.delay', 1000));
        }
    }));
    let isLaTeXActive = false;
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((e) => {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (vscode.window.visibleTextEditors.filter(editor => extension.manager.hasTexId(editor.document.languageId)).length > 0) {
            extension.logger.status.show();
            vscode.commands.executeCommand('setContext', 'latex-workshop:enabled', true).then(() => {
                const gits = vscode.window.visibleTextEditors.filter(editor => editor.document.uri.scheme === 'git');
                if (configuration.get('view.autoFocus.enabled') && !isLaTeXActive && gits.length === 0) {
                    vscode.commands.executeCommand('workbench.view.extension.latex').then(() => vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup'));
                }
                else if (gits.length > 0) {
                    vscode.commands.executeCommand('workbench.view.scm').then(() => vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup'));
                }
                isLaTeXActive = true;
            });
        }
        else if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId.toLowerCase() === 'log') {
            extension.logger.status.show();
            vscode.commands.executeCommand('setContext', 'latex-workshop:enabled', true);
        }
        if (e && extension.manager.hasTexId(e.document.languageId)) {
            extension.linter.lintActiveFileIfEnabled();
            extension.manager.findRoot();
        }
        else {
            isLaTeXActive = false;
        }
    }));
    const latexSelector = selectDocumentsWithId(['latex', 'latex-expl3', 'jlweave', 'rsweave']);
    const weaveSelector = selectDocumentsWithId(['jlweave', 'rsweave']);
    const latexDoctexSelector = selectDocumentsWithId(['latex', 'latex-expl3', 'jlweave', 'rsweave', 'doctex']);
    const latexFormatter = new latexformatter_1.LatexFormatterProvider(extension);
    const bibtexFormatter = new bibtexformatter_1.BibtexFormatterProvider(extension);
    vscode.languages.registerDocumentFormattingEditProvider(latexSelector, latexFormatter);
    vscode.languages.registerDocumentFormattingEditProvider({ scheme: 'file', language: 'bibtex' }, bibtexFormatter);
    vscode.languages.registerDocumentRangeFormattingEditProvider(latexSelector, latexFormatter);
    vscode.languages.registerDocumentRangeFormattingEditProvider({ scheme: 'file', language: 'bibtex' }, bibtexFormatter);
    context.subscriptions.push(vscode.window.registerTreeDataProvider('latex-commands', new commander_2.LaTeXCommander(extension)));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection((e) => {
        if (!extension.manager.hasTexId(e.textEditor.document.languageId)) {
            return;
        }
        extension.structureViewer.showCursorIteme(e);
    }));
    context.subscriptions.push(vscode.window.registerWebviewPanelSerializer('latex-workshop-pdf', extension.viewer.pdfViewerPanelSerializer));
    context.subscriptions.push(vscode.window.registerWebviewPanelSerializer('latex-workshop-mathpreview', extension.mathPreviewPanel.mathPreviewPanelSerializer));
    context.subscriptions.push(vscode.languages.registerHoverProvider(latexSelector, new hover_1.HoverProvider(extension)));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(latexSelector, new definition_1.DefinitionProvider(extension)));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(latexSelector, new docsymbol_1.DocSymbolProvider(extension)));
    context.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(new projectsymbol_1.ProjectSymbolProvider(extension)));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'tex' }, extension.completer, '\\', '{'));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(latexDoctexSelector, extension.completer, '\\', '{', ',', '(', '['));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'bibtex' }, new bibtexcompletion_1.BibtexCompleter(extension), '@'));
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(latexSelector, extension.codeActions));
    context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(latexSelector, new folding_1.FoldingProvider(extension)));
    context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(weaveSelector, new folding_1.WeaveFoldingProvider(extension)));
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('latex-snippet-view', new snippetview_1.SnippetViewProvider(extension), { webviewOptions: { retainContextWhenHidden: true } }));
    extension.manager.findRoot();
    extension.linter.lintRootFileIfEnabled();
    config_1.obsoleteConfigCheck(extension);
    conflictExtensionCheck();
    config_1.checkDeprecatedFeatures(extension);
    config_1.newVersionMessage(context.extensionPath, extension);
    // If VS Code started with PDF files, we must explicitly execute `commander.pdf` for the PDF files.
    vscode.window.visibleTextEditors.forEach(editor => {
        const e = editor.document;
        if (e.languageId === 'pdf') {
            vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(() => {
                extension.commander.pdf(e.uri);
            });
        }
    });
    return {
        getGraphicsPath: () => extension.completer.input.graphicsPath,
        builder: {
            isBuildFinished: process.env['LATEXWORKSHOP_CI'] ? (() => extension.builder.isBuildFinished()) : undefined
        },
        viewer: {
            clients: extension.viewer.clients,
            getViewerStatus: process.env['LATEXWORKSHOP_CI'] ? ((pdfFilePath) => extension.viewer.getViewerState(pdfFilePath)) : undefined,
            refreshExistingViewer: (sourceFile, viewer) => extension.viewer.refreshExistingViewer(sourceFile, viewer),
            openTab: (sourceFile, respectOutDir = true, column = 'right') => extension.viewer.openTab(sourceFile, respectOutDir, column)
        },
        manager: {
            findRoot: () => extension.manager.findRoot(),
            rootDir: () => extension.manager.rootDir,
            rootFile: () => extension.manager.rootFile,
            setEnvVar: () => extension.manager.setEnvVar(),
            cachedContent: () => extension.manager.cachedContent
        },
        completer: {
            command: {
                usedPackages: () => {
                    console.warn('`completer.command.usedPackages` is deprecated. Consider use `manager.cachedContent`.');
                    let allPkgs = [];
                    extension.manager.getIncludedTeX().forEach(tex => {
                        const pkgs = extension.manager.cachedContent[tex].element.package;
                        if (pkgs === undefined) {
                            return;
                        }
                        allPkgs = allPkgs.concat(pkgs);
                    });
                    return allPkgs;
                }
            },
            provideCompletionItems: process.env['LATEXWORKSHOP_CI'] ? ((document, position, token, cxt) => extension.completer.provideCompletionItems(document, position, token, cxt)) : undefined
        }
    };
}
exports.activate = activate;
class Extension {
    constructor() {
        this.packageInfo = {};
        this.extensionRoot = path.resolve(`${__dirname}/../../`);
        // We must create an instance of Logger first to enable
        // adding log messages during initialization.
        this.logger = new logger_1.Logger();
        this.logger.addLogMessage(`Extension root: ${this.extensionRoot}`);
        this.buildInfo = new buildinfo_1.BuildInfo(this);
        this.commander = new commander_1.Commander(this);
        this.manager = new manager_1.Manager(this);
        this.builder = new builder_1.Builder(this);
        this.viewer = new viewer_1.Viewer(this);
        this.server = new server_1.Server(this);
        this.locator = new locator_1.Locator(this);
        this.logParser = new log_1.Parser(this);
        this.completer = new completion_1.Completer(this);
        this.linter = new linter_1.Linter(this);
        this.cleaner = new cleaner_1.Cleaner(this);
        this.counter = new counter_1.Counter(this);
        this.codeActions = new codeactions_1.CodeActions(this);
        this.texMagician = new texmagician_1.TeXMagician(this);
        this.envPair = new envpair_1.EnvPair(this);
        this.section = new section_1.Section(this);
        this.structureProvider = new structure_1.SectionNodeProvider(this);
        this.structureViewer = new structure_1.StructureTreeView(this);
        this.snippetPanel = new snippetpanel_1.SnippetPanel(this);
        this.pegParser = new syntax_1.UtensilsParser();
        this.graphicsPreview = new graphicspreview_1.GraphicsPreview(this);
        this.mathPreview = new mathpreview_1.MathPreview(this);
        this.bibtexFormatter = new bibtexformatter_1.BibtexFormatter(this);
        this.mathPreviewPanel = new mathpreviewpanel_1.MathPreviewPanel(this);
        this.logger.addLogMessage('LaTeX Workshop initialized.');
    }
}
exports.Extension = Extension;
//# sourceMappingURL=main.js.map
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
exports.MathPreview = void 0;
const vscode = __importStar(require("vscode"));
const mathjaxpool_1 = require("./mathjaxpool");
const utils = __importStar(require("../../utils/utils"));
const theme_1 = require("../../utils/theme");
const cursorrenderer_1 = require("./mathpreviewlib/cursorrenderer");
const textdocumentlike_1 = require("./mathpreviewlib/textdocumentlike");
const newcommandfinder_1 = require("./mathpreviewlib/newcommandfinder");
const texmathenvfinder_1 = require("./mathpreviewlib/texmathenvfinder");
const hoverpreviewonref_1 = require("./mathpreviewlib/hoverpreviewonref");
const mathpreviewutils_1 = require("./mathpreviewlib/mathpreviewutils");
class MathPreview {
    constructor(extension) {
        this.color = '#000000';
        this.extension = extension;
        this.mj = new mathjaxpool_1.MathJaxPool();
        vscode.workspace.onDidChangeConfiguration(() => this.getColor());
        this.cursorRenderer = new cursorrenderer_1.CursorRenderer();
        this.mputils = new mathpreviewutils_1.MathPreviewUtils();
        this.newCommandFinder = new newcommandfinder_1.NewCommandFinder(extension);
        this.texMathEnvFinder = new texmathenvfinder_1.TeXMathEnvFinder();
        this.hoverPreviewOnRefProvider = new hoverpreviewonref_1.HoverPreviewOnRefProvider(extension, this.mj, this.mputils);
    }
    findProjectNewCommand(ctoken) {
        return this.newCommandFinder.findProjectNewCommand(ctoken);
    }
    async provideHoverOnTex(document, tex, newCommand) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const scale = configuration.get('hover.preview.scale');
        let s = this.cursorRenderer.renderCursor(document, tex.range, this.color);
        s = this.mputils.mathjaxify(s, tex.envname);
        const typesetArg = {
            math: newCommand + this.mputils.stripTeX(s),
            format: 'TeX',
            svgNode: true,
        };
        const typesetOpts = { scale, color: this.color };
        try {
            const xml = await this.mj.typeset(typesetArg, typesetOpts);
            const md = utils.svgToDataUrl(xml);
            return new vscode.Hover(new vscode.MarkdownString(this.mputils.addDummyCodeBlock(`![equation](${md})`)), tex.range);
        }
        catch (e) {
            this.extension.logger.logOnRejected(e);
            this.extension.logger.addLogMessage(`Error when MathJax is rendering ${typesetArg.math}`);
            throw e;
        }
    }
    async provideHoverOnRef(document, position, refData, token, ctoken) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const line = refData.position.line;
        const link = vscode.Uri.parse('command:latex-workshop.synctexto').with({ query: JSON.stringify([line, refData.file]) });
        const mdLink = new vscode.MarkdownString(`[View on pdf](${link})`);
        mdLink.isTrusted = true;
        if (configuration.get('hover.ref.enabled')) {
            const tex = this.texMathEnvFinder.findHoverOnRef(document, position, refData, token);
            if (tex) {
                const newCommands = await this.findProjectNewCommand(ctoken);
                return this.hoverPreviewOnRefProvider.provideHoverPreviewOnRef(tex, newCommands, refData, this.color);
            }
        }
        const md = '```latex\n' + refData.documentation + '\n```\n';
        const refRange = document.getWordRangeAtPosition(position, /\{.*?\}/);
        const refNumberMessage = this.refNumberMessage(refData);
        if (refNumberMessage !== undefined && configuration.get('hover.ref.number.enabled')) {
            return new vscode.Hover([md, refNumberMessage, mdLink], refRange);
        }
        return new vscode.Hover([md, mdLink], refRange);
    }
    refNumberMessage(refData) {
        if (refData.prevIndex) {
            const refNum = refData.prevIndex.refNumber;
            const refMessage = `numbered ${refNum} at last compilation`;
            return refMessage;
        }
        return undefined;
    }
    async generateSVG(document, tex, newCommands0) {
        const newCommands = newCommands0 !== null && newCommands0 !== void 0 ? newCommands0 : (await this.newCommandFinder.findNewCommand(document.getText())).join('');
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const scale = configuration.get('hover.preview.scale');
        const s = this.mputils.mathjaxify(tex.texString, tex.envname);
        const xml = await this.mj.typeset({
            math: newCommands + this.mputils.stripTeX(s),
            format: 'TeX',
            svgNode: true,
        }, { scale, color: this.color });
        return { svgDataUrl: utils.svgToDataUrl(xml), newCommands };
    }
    getColor() {
        const lightness = theme_1.getCurrentThemeLightness();
        if (lightness === 'light') {
            this.color = '#000000';
        }
        else {
            this.color = '#ffffff';
        }
    }
    renderCursor(document, range) {
        return this.cursorRenderer.renderCursor(document, range, this.color);
    }
    findHoverOnTex(document, position) {
        return this.texMathEnvFinder.findHoverOnTex(document, position);
    }
    findHoverOnRef(refData, token) {
        const document = textdocumentlike_1.TextDocumentLike.load(refData.file);
        const position = refData.position;
        return this.texMathEnvFinder.findHoverOnRef(document, position, refData, token);
    }
    async renderSvgOnRef(tex, refData, ctoken) {
        const newCommand = await this.findProjectNewCommand(ctoken);
        return this.hoverPreviewOnRefProvider.renderSvgOnRef(tex, newCommand, refData, this.color);
    }
    findMathEnvIncludingPosition(document, position) {
        return this.texMathEnvFinder.findMathEnvIncludingPosition(document, position);
    }
}
exports.MathPreview = MathPreview;
//# sourceMappingURL=mathpreview.js.map
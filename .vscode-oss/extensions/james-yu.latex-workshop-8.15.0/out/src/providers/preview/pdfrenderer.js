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
exports.PDFRenderer = void 0;
const path = __importStar(require("path"));
const workerpool = __importStar(require("workerpool"));
class PDFRenderer {
    constructor() {
        this.pool = workerpool.pool(path.join(__dirname, 'pdfrenderer_worker.js'), { maxWorkers: 1, workerType: 'process' });
        this.proxy = this.pool.proxy();
    }
    async renderToSVG(pdfPath, options) {
        return (await this.proxy).renderToSvg(pdfPath, options).timeout(3000);
    }
    async getNumPages(pdfPath) {
        return (await this.proxy).getNumPages(pdfPath).timeout(3000);
    }
}
exports.PDFRenderer = PDFRenderer;
//# sourceMappingURL=pdfrenderer.js.map
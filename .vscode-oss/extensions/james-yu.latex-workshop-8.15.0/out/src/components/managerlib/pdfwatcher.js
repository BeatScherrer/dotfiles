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
exports.PdfWatcher = void 0;
const vscode = __importStar(require("vscode"));
const chokidar = __importStar(require("chokidar"));
class PdfWatcher {
    constructor(extension) {
        this.pdfsWatched = [];
        this.extension = extension;
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const usePolling = configuration.get('latex.watch.usePolling');
        const interval = configuration.get('latex.watch.interval');
        const pdfDelay = configuration.get('latex.watch.pdfDelay');
        this.pdfWatcherOptions = {
            useFsEvents: false,
            usePolling,
            interval,
            binaryInterval: Math.max(interval, 1000),
            awaitWriteFinish: { stabilityThreshold: pdfDelay }
        };
        this.initiatePdfWatcher();
    }
    initiatePdfWatcher() {
        if (this.pdfWatcher !== undefined) {
            return;
        }
        this.extension.logger.addLogMessage('Creating PDF file watcher.');
        this.pdfWatcher = chokidar.watch([], this.pdfWatcherOptions);
        this.pdfWatcher.on('change', (file) => this.onWatchedPdfChanged(file));
        this.pdfWatcher.on('unlink', (file) => this.onWatchedPdfDeleted(file));
    }
    onWatchedPdfChanged(file) {
        this.extension.logger.addLogMessage(`PDF file watcher - file changed: ${file}`);
        this.extension.viewer.refreshExistingViewer();
    }
    onWatchedPdfDeleted(file) {
        this.extension.logger.addLogMessage(`PDF file watcher - file deleted: ${file}`);
        if (this.pdfWatcher) {
            this.pdfWatcher.unwatch(file);
        }
        this.pdfsWatched.splice(this.pdfsWatched.indexOf(file), 1);
    }
    watchPdfFile(pdfPath) {
        if (this.pdfWatcher && !this.pdfsWatched.includes(pdfPath)) {
            this.extension.logger.addLogMessage(`Added to PDF file watcher: ${pdfPath}`);
            this.pdfWatcher.add(pdfPath);
            this.pdfsWatched.push(pdfPath);
        }
    }
}
exports.PdfWatcher = PdfWatcher;
//# sourceMappingURL=pdfwatcher.js.map
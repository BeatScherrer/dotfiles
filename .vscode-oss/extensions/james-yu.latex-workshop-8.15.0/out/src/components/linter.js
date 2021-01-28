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
exports.Linter = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const os_1 = require("os");
class Linter {
    constructor(extension) {
        this.currentProcesses = {};
        this.extension = extension;
    }
    get rcPath() {
        let rcPath;
        // 0. root file folder
        const root = this.extension.manager.rootFile;
        if (root) {
            rcPath = path.resolve(path.dirname(root), './.chktexrc');
        }
        else {
            return;
        }
        if (fs.existsSync(rcPath)) {
            return rcPath;
        }
        // 1. project root folder
        const ws = vscode.workspace.workspaceFolders;
        if (ws && ws.length > 0) {
            rcPath = path.resolve(ws[0].uri.fsPath, './.chktexrc');
        }
        if (fs.existsSync(rcPath)) {
            return rcPath;
        }
        return undefined;
    }
    lintRootFileIfEnabled() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('chktex.enabled')) {
            this.lintRootFile();
        }
    }
    lintActiveFileIfEnabled() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('chktex.enabled') &&
            configuration.get('chktex.run') === 'onType') {
            this.lintActiveFile();
        }
    }
    lintActiveFileIfEnabledAfterInterval() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('chktex.enabled') &&
            configuration.get('chktex.run') === 'onType') {
            const interval = configuration.get('chktex.delay');
            if (this.linterTimeout) {
                clearTimeout(this.linterTimeout);
            }
            this.linterTimeout = setTimeout(() => { this.lintActiveFile(); }, interval);
        }
    }
    async lintActiveFile() {
        if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document.getText()) {
            return;
        }
        this.extension.logger.addLogMessage('Linter for active file started.');
        const filePath = vscode.window.activeTextEditor.document.fileName;
        const content = vscode.window.activeTextEditor.document.getText();
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const command = configuration.get('chktex.path');
        const args = [...configuration.get('chktex.args.active')];
        if (!args.includes('-l')) {
            const rcPath = this.rcPath;
            if (rcPath) {
                args.push('-l', rcPath);
            }
        }
        const requiredArgs = ['-I0', '-f%f:%l:%c:%d:%k:%n:%m\n'];
        let stdout;
        try {
            stdout = await this.processWrapper('active file', command, args.concat(requiredArgs).filter(arg => arg !== ''), { cwd: path.dirname(filePath) }, content);
        }
        catch (err) {
            if ('stdout' in err) {
                stdout = err.stdout;
            }
            else {
                return;
            }
        }
        // provide the original path to the active file as the second argument, so
        // we report this second path in the diagnostics instead of the temporary one.
        this.extension.logParser.parseLinter(stdout, filePath);
    }
    async lintRootFile() {
        this.extension.logger.addLogMessage('Linter for root file started.');
        if (this.extension.manager.rootFile === undefined) {
            this.extension.logger.addLogMessage('No root file found for linting.');
            return;
        }
        const filePath = this.extension.manager.rootFile;
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const command = configuration.get('chktex.path');
        const args = [...configuration.get('chktex.args.active')];
        if (!args.includes('-l')) {
            const rcPath = this.rcPath;
            if (rcPath) {
                args.push('-l', rcPath);
            }
        }
        const requiredArgs = ['-f%f:%l:%c:%d:%k:%n:%m\n', filePath];
        let stdout;
        try {
            stdout = await this.processWrapper('root file', command, args.concat(requiredArgs).filter(arg => arg !== ''), { cwd: path.dirname(this.extension.manager.rootFile) });
        }
        catch (err) {
            if ('stdout' in err) {
                stdout = err.stdout;
            }
            else {
                return;
            }
        }
        this.extension.logParser.parseLinter(stdout);
    }
    processWrapper(linterId, command, args, options, stdin) {
        this.extension.logger.addLogMessage(`Linter for ${linterId} running command ${command} with arguments ${args}`);
        return new Promise((resolve, reject) => {
            if (this.currentProcesses[linterId]) {
                this.currentProcesses[linterId].kill();
            }
            const startTime = process.hrtime();
            this.currentProcesses[linterId] = child_process_1.spawn(command, args, options);
            const proc = this.currentProcesses[linterId];
            proc.stdout.setEncoding('binary');
            proc.stderr.setEncoding('binary');
            let stdout = '';
            proc.stdout.on('data', newStdout => {
                stdout += newStdout;
            });
            let stderr = '';
            proc.stderr.on('data', newStderr => {
                stderr += newStderr;
            });
            proc.on('error', err => {
                this.extension.logger.addLogMessage(`Linter for ${linterId} failed to spawn command, encountering error: ${err.message}`);
                return reject(err);
            });
            proc.on('exit', exitCode => {
                if (exitCode !== 0) {
                    this.extension.logger.addLogMessage(`Linter for ${linterId} failed with exit code ${exitCode} and error:\n  ${stderr}`);
                    return reject({ exitCode, stdout, stderr });
                }
                else {
                    const [s, ms] = process.hrtime(startTime);
                    this.extension.logger.addLogMessage(`Linter for ${linterId} successfully finished in ${s}s ${Math.round(ms / 1000000)}ms`);
                    return resolve(stdout);
                }
            });
            if (stdin !== undefined) {
                proc.stdin.write(stdin);
                if (!stdin.endsWith(os_1.EOL)) {
                    // Always ensure we end with EOL otherwise ChkTeX will report line numbers as off by 1.
                    proc.stdin.write(os_1.EOL);
                }
                proc.stdin.end();
            }
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=linter.js.map
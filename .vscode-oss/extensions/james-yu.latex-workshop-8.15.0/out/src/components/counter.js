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
exports.Counter = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
class Counter {
    constructor(extension) {
        this.extension = extension;
    }
    async count(file, merge = true) {
        if (this.extension.manager.rootFile !== undefined) {
            await this.extension.manager.findRoot();
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const args = configuration.get('texcount.args');
        if (merge) {
            args.push('-merge');
        }
        let command = configuration.get('texcount.path');
        if (configuration.get('docker.enabled')) {
            this.extension.logger.addLogMessage('Use Docker to invoke the command.');
            if (process.platform === 'win32') {
                command = path.resolve(this.extension.extensionRoot, './scripts/texcount.bat');
            }
            else {
                command = path.resolve(this.extension.extensionRoot, './scripts/texcount');
                fs.chmodSync(command, 0o755);
            }
        }
        this.extension.manager.setEnvVar();
        const proc = cp.spawn(command, args.concat([path.basename(file)]), { cwd: path.dirname(file) });
        proc.stdout.setEncoding('utf8');
        proc.stderr.setEncoding('utf8');
        let stdout = '';
        proc.stdout.on('data', newStdout => {
            stdout += newStdout;
        });
        let stderr = '';
        proc.stderr.on('data', newStderr => {
            stderr += newStderr;
        });
        proc.on('error', err => {
            this.extension.logger.addLogMessage(`Cannot count words: ${err.message}, ${stderr}`);
            this.extension.logger.showErrorMessage('TeXCount failed. Please refer to LaTeX Workshop Output for details.');
        });
        proc.on('exit', exitCode => {
            if (exitCode !== 0) {
                this.extension.logger.addLogMessage(`Cannot count words, code: ${exitCode}, ${stderr}`);
                this.extension.logger.showErrorMessage('TeXCount failed. Please refer to LaTeX Workshop Output for details.');
            }
            else {
                const words = /Words in text: ([0-9]*)/g.exec(stdout);
                const floats = /Number of floats\/tables\/figures: ([0-9]*)/g.exec(stdout);
                if (words) {
                    let floatMsg = '';
                    if (floats && parseInt(floats[1]) > 0) {
                        floatMsg = `and ${floats[1]} float${parseInt(floats[1]) > 1 ? 's' : ''} (tables, figures, etc.) `;
                    }
                    vscode.window.showInformationMessage(`There are ${words[1]} words ${floatMsg}in the ${merge ? 'LaTeX project' : 'opened LaTeX file'}.`);
                }
                this.extension.logger.addLogMessage(`TeXCount log:\n${stdout}`);
            }
        });
    }
}
exports.Counter = Counter;
//# sourceMappingURL=counter.js.map
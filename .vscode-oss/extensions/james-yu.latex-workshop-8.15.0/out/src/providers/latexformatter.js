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
exports.LatexFormatterProvider = exports.LaTexFormatter = exports.OperatingSystem = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const cs = __importStar(require("cross-spawn"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const await_semaphore_1 = require("../lib/await-semaphore");
const utils_1 = require("../utils/utils");
const fullRange = (doc) => doc.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
class OperatingSystem {
    constructor(name, fileExt, checker) {
        this.name = name;
        this.fileExt = fileExt;
        this.checker = checker;
    }
}
exports.OperatingSystem = OperatingSystem;
const windows = new OperatingSystem('win32', '.exe', 'where');
const linux = new OperatingSystem('linux', '.pl', 'which');
const mac = new OperatingSystem('darwin', '.pl', 'which');
class LaTexFormatter {
    constructor(extension) {
        this.formatMutex = new await_semaphore_1.Mutex();
        this.formatter = '';
        this.formatterArgs = [];
        this.extension = extension;
        this.machineOs = os.platform();
        if (this.machineOs === windows.name) {
            this.currentOs = windows;
        }
        else if (this.machineOs === linux.name) {
            this.currentOs = linux;
        }
        else if (this.machineOs === mac.name) {
            this.currentOs = mac;
        }
        else {
            this.extension.logger.addLogMessage('LaTexFormatter: Unsupported OS');
        }
    }
    async formatDocument(document, range) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const pathMeta = configuration.get('latexindent.path');
        this.formatterArgs = configuration.get('latexindent.args');
        this.extension.logger.addLogMessage('Start formatting with latexindent.');
        const releaseMutex = await this.formatMutex.acquire();
        try {
            if (pathMeta !== this.formatter) {
                this.formatter = pathMeta;
                const latexindentPresent = await this.checkPath();
                if (!latexindentPresent) {
                    this.extension.logger.addLogMessage(`Can not find latexindent in PATH: ${this.formatter}`);
                    this.extension.logger.showErrorMessage('Can not find latexindent in PATH.');
                    return [];
                }
            }
            const edit = await this.format(document, range);
            return edit;
        }
        finally {
            releaseMutex();
        }
    }
    checkPath() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const useDocker = configuration.get('docker.enabled');
        if (useDocker) {
            this.extension.logger.addLogMessage('Use Docker to invoke the command.');
            if (process.platform === 'win32') {
                this.formatter = path.resolve(this.extension.extensionRoot, './scripts/latexindent.bat');
            }
            else {
                this.formatter = path.resolve(this.extension.extensionRoot, './scripts/latexindent');
                fs.chmodSync(this.formatter, 0o755);
            }
            return Promise.resolve(true);
        }
        if (path.isAbsolute(this.formatter)) {
            if (fs.existsSync(this.formatter)) {
                return Promise.resolve(true);
            }
            else {
                this.extension.logger.addLogMessage(`The path of latexindent is absolute and not found: ${this.formatter}`);
                return Promise.resolve(false);
            }
        }
        if (!this.currentOs) {
            this.extension.logger.addLogMessage('The current platform is undefined.');
            return Promise.resolve(false);
        }
        const checker = this.currentOs.checker;
        const fileExt = this.currentOs.fileExt;
        return new Promise((resolve, _reject) => {
            const checkCommand = checker + ' ' + this.formatter;
            this.extension.logger.addLogMessage(`Checking latexindent: ${checkCommand}`);
            cp.exec(checkCommand, (err, stdout, stderr) => {
                if (err) {
                    this.extension.logger.addLogMessage(`Error when checking latexindent: ${stderr}`);
                    this.formatter += fileExt;
                    const checkCommand1 = checker + ' ' + this.formatter;
                    this.extension.logger.addLogMessage(`Checking latexindent: ${checkCommand1}`);
                    cp.exec(checkCommand1, (err1, stdout1, stderr1) => {
                        if (err1) {
                            this.extension.logger.addLogMessage(`Error when checking latexindent: ${stderr1}`);
                            resolve(false);
                        }
                        else {
                            this.extension.logger.addLogMessage(`Checking latexindent is ok: ${stdout1}`);
                            resolve(true);
                        }
                    });
                }
                else {
                    this.extension.logger.addLogMessage(`Checking latexindent is ok: ${stdout}`);
                    resolve(true);
                }
            });
        });
    }
    format(document, range) {
        return new Promise((resolve, _reject) => {
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            const useDocker = configuration.get('docker.enabled');
            if (!vscode.window.activeTextEditor) {
                this.extension.logger.addLogMessage('Exit formatting. The active textEditor is undefined.');
                return;
            }
            const options = vscode.window.activeTextEditor.options;
            const tabSize = options.tabSize ? +options.tabSize : 4;
            const useSpaces = options.insertSpaces;
            const indent = useSpaces ? ' '.repeat(tabSize) : '\\t';
            const documentDirectory = path.dirname(document.fileName);
            // The version of latexindent shipped with current latex distributions doesn't support piping in the data using stdin, support was
            // only added on 2018-01-13 with version 3.4 so we have to create a temporary file
            const textToFormat = document.getText(range);
            const temporaryFile = documentDirectory + path.sep + '__latexindent_temp.tex';
            fs.writeFileSync(temporaryFile, textToFormat);
            // generate command line arguments
            const rootFile = this.extension.manager.rootFile ? this.extension.manager.rootFile : document.fileName;
            const args = this.formatterArgs.map(arg => {
                return utils_1.replaceArgumentPlaceholders(rootFile, this.extension.builder.tmpDir)(arg)
                    // latexformatter.ts specific tokens
                    .replace(/%TMPFILE%/g, useDocker ? path.basename(temporaryFile) : temporaryFile.split(path.sep).join('/'))
                    .replace(/%INDENT%/g, indent);
            });
            this.extension.logger.addLogMessage(`Formatting with command ${this.formatter} ${args}`);
            this.extension.manager.setEnvVar();
            const worker = cs.spawn(this.formatter, args, { stdio: 'pipe', cwd: documentDirectory });
            // handle stdout/stderr
            const stdoutBuffer = [];
            const stderrBuffer = [];
            worker.stdout.on('data', chunk => stdoutBuffer.push(chunk.toString()));
            worker.stderr.on('data', chunk => stderrBuffer.push(chunk.toString()));
            worker.on('error', err => {
                this.extension.logger.showErrorMessage('Formatting failed. Please refer to LaTeX Workshop Output for details.');
                this.extension.logger.addLogMessage(`Formatting failed: ${err.message}`);
                this.extension.logger.addLogMessage(`stderr: ${stderrBuffer.join('')}`);
                resolve([]);
            });
            worker.on('close', code => {
                if (code !== 0) {
                    this.extension.logger.showErrorMessage('Formatting failed. Please refer to LaTeX Workshop Output for details.');
                    this.extension.logger.addLogMessage(`Formatting failed with exit code ${code}`);
                    this.extension.logger.addLogMessage(`stderr: ${stderrBuffer.join('')}`);
                    return resolve([]);
                }
                const stdout = stdoutBuffer.join('');
                if (stdout !== '') {
                    const edit = [vscode.TextEdit.replace(range ? range : fullRange(document), stdout)];
                    try {
                        fs.unlinkSync(temporaryFile);
                        fs.unlinkSync(documentDirectory + path.sep + 'indent.log');
                    }
                    catch (ignored) {
                    }
                    this.extension.logger.addLogMessage('Formatted ' + document.fileName);
                    return resolve(edit);
                }
                return resolve([]);
            });
        });
    }
}
exports.LaTexFormatter = LaTexFormatter;
class LatexFormatterProvider {
    constructor(extension) {
        this.formatter = new LaTexFormatter(extension);
    }
    provideDocumentFormattingEdits(document, _options, _token) {
        return this.formatter.formatDocument(document);
    }
    provideDocumentRangeFormattingEdits(document, range, _options, _token) {
        return this.formatter.formatDocument(document, range);
    }
}
exports.LatexFormatterProvider = LatexFormatterProvider;
//# sourceMappingURL=latexformatter.js.map
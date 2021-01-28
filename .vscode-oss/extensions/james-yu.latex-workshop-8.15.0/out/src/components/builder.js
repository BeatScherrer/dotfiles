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
exports.Builder = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const cp = __importStar(require("child_process"));
const cs = __importStar(require("cross-spawn"));
const tmp = __importStar(require("tmp"));
const await_semaphore_1 = require("../lib/await-semaphore");
const utils_1 = require("../utils/utils");
const maxPrintLine = '10000';
const texMagicProgramName = 'TeXMagicProgram';
const bibMagicProgramName = 'BibMagicProgram';
class Builder {
    constructor(extension) {
        this.disableBuildAfterSave = false;
        this.disableCleanAndRetry = false;
        this.isMiktex = false;
        this.extension = extension;
        try {
            this.tmpDir = tmp.dirSync({ unsafeCleanup: true }).name.split(path.sep).join('/');
        }
        catch (e) {
            vscode.window.showErrorMessage('Error during making tmpdir to build TeX files. Please check the environment variables, TEMP, TMP, and TMPDIR on your system.');
            throw e;
        }
        this.buildMutex = new await_semaphore_1.Mutex();
        this.waitingForBuildToFinishMutex = new await_semaphore_1.Mutex();
        try {
            const pdflatexVersion = cp.execSync('pdflatex --version');
            if (pdflatexVersion.toString().match(/MiKTeX/)) {
                this.isMiktex = true;
                this.extension.logger.addLogMessage('pdflatex is provided by MiKTeX');
            }
        }
        catch (e) {
            this.extension.logger.addLogMessage('Cannot run pdflatex to determine if we are using MiKTeX');
        }
    }
    /**
     * Kill the current building process.
     */
    kill() {
        const proc = this.currentProcess;
        if (proc) {
            const pid = proc.pid;
            if (process.platform === 'linux' || process.platform === 'darwin') {
                cp.exec(`pkill -P ${pid}`);
            }
            else if (process.platform === 'win32') {
                cp.exec(`taskkill /F /T /PID ${pid}`);
            }
            proc.kill();
            this.extension.logger.addLogMessage(`Kill the current process. PID: ${pid}.`);
        }
        else {
            this.extension.logger.addLogMessage('LaTeX build process to kill is not found.');
        }
    }
    /**
     * Should not use. Only for integration tests.
     */
    isBuildFinished() {
        return this.buildMutex.count === 1;
    }
    isWaitingForBuildToFinish() {
        return this.waitingForBuildToFinishMutex.count < 1;
    }
    async preprocess() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        this.disableBuildAfterSave = true;
        await vscode.workspace.saveAll();
        setTimeout(() => this.disableBuildAfterSave = false, configuration.get('latex.autoBuild.interval', 1000));
        const releaseWaiting = await this.waitingForBuildToFinishMutex.acquire();
        const releaseBuildMutex = await this.buildMutex.acquire();
        releaseWaiting();
        return releaseBuildMutex;
    }
    /**
     * Execute a command building LaTeX files.
     *
     * @param command The name of the command to build LaTeX files.
     * @param args The arguments of the command.
     * @param pwd The path of the working directory of building.
     * @param rootFile The root file to be compiled.
     */
    async buildWithExternalCommand(command, args, pwd, rootFile = undefined) {
        if (this.isWaitingForBuildToFinish()) {
            return;
        }
        const releaseBuildMutex = await this.preprocess();
        this.extension.logger.displayStatus('sync~spin', 'statusBar.foreground');
        let wd = pwd;
        const ws = vscode.workspace.workspaceFolders;
        if (ws && ws.length > 0) {
            wd = ws[0].uri.fsPath;
        }
        if (rootFile !== undefined) {
            args = args.map(utils_1.replaceArgumentPlaceholders(rootFile, this.tmpDir));
        }
        this.extension.logger.addLogMessage(`Build using the external command: ${command} ${args.length > 0 ? args.join(' ') : ''}`);
        this.extension.logger.addLogMessage(`cwd: ${wd}`);
        this.currentProcess = cs.spawn(command, args, { cwd: wd });
        const pid = this.currentProcess.pid;
        this.extension.logger.addLogMessage(`External build process spawned. PID: ${pid}.`);
        let stdout = '';
        this.currentProcess.stdout.on('data', newStdout => {
            stdout += newStdout;
            this.extension.logger.addCompilerMessage(newStdout.toString());
        });
        let stderr = '';
        this.currentProcess.stderr.on('data', newStderr => {
            stderr += newStderr;
            this.extension.logger.addCompilerMessage(newStderr.toString());
        });
        this.currentProcess.on('error', err => {
            this.extension.logger.addLogMessage(`Build fatal error: ${err.message}, ${stderr}. PID: ${pid}. Does the executable exist?`);
            this.extension.logger.displayStatus('x', 'errorForeground', `Build terminated with fatal error: ${err.message}.`, 'error');
            this.currentProcess = undefined;
            releaseBuildMutex();
        });
        this.currentProcess.on('exit', (exitCode, signal) => {
            this.extension.logParser.parse(stdout);
            if (exitCode !== 0) {
                this.extension.logger.addLogMessage(`Build returns with error: ${exitCode}/${signal}. PID: ${pid}.`);
                this.extension.logger.displayStatus('x', 'errorForeground', 'Build terminated with error', 'warning');
                const res = this.extension.logger.showErrorMessage('Build terminated with error.', 'Open compiler log');
                if (res) {
                    res.then(option => {
                        switch (option) {
                            case 'Open compiler log':
                                this.extension.logger.showCompilerLog();
                                break;
                            default:
                                break;
                        }
                    });
                }
            }
            else {
                this.extension.logger.addLogMessage(`Successfully built. PID: ${pid}`);
                this.extension.logger.displayStatus('check', 'statusBar.foreground', 'Build succeeded.');
                try {
                    if (rootFile === undefined) {
                        this.extension.viewer.refreshExistingViewer();
                    }
                    else {
                        this.buildFinished(rootFile);
                    }
                }
                finally {
                    this.currentProcess = undefined;
                    releaseBuildMutex();
                }
            }
            this.currentProcess = undefined;
            releaseBuildMutex();
        });
    }
    buildInitiator(rootFile, languageId, recipeName = undefined, releaseBuildMutex) {
        const steps = this.createSteps(rootFile, languageId, recipeName);
        if (steps === undefined) {
            this.extension.logger.addLogMessage('Invalid toolchain.');
            return;
        }
        this.buildStep(rootFile, steps, 0, recipeName || 'Build', releaseBuildMutex); // use 'Build' as default name
    }
    /**
     * Build a LaTeX file with user-defined recipes.
     *
     * @param rootFile The root file to be compiled.
     * @param languageId The name of the language of a file to be compiled.
     * @param recipeName The name of a recipe to be used.
     */
    async build(rootFile, languageId, recipeName = undefined) {
        if (this.isWaitingForBuildToFinish()) {
            this.extension.logger.addLogMessage('Another LaTeX build processing is already waiting for the current LaTeX build to finish. Exit.');
            return;
        }
        const releaseBuildMutex = await this.preprocess();
        this.disableCleanAndRetry = false;
        this.extension.logger.displayStatus('sync~spin', 'statusBar.foreground');
        this.extension.logger.addLogMessage(`Build root file ${rootFile}`);
        try {
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            if (configuration.get('progress.location') === 'Status Bar') {
                this.extension.buildInfo.buildStarted();
            }
            else {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Running build process',
                    cancellable: true
                }, (progress, token) => {
                    token.onCancellationRequested(this.kill.bind(this));
                    this.extension.buildInfo.buildStarted(progress);
                    const p = new Promise(resolve => {
                        this.extension.buildInfo.setResolveToken(resolve);
                    });
                    return p;
                });
            }
            try {
                const pdfPath = this.extension.manager.tex2pdf(rootFile, true);
                const numPage = await this.extension.graphicsPreview.getPdfNumPages(pdfPath);
                this.extension.buildInfo.setPageTotal(numPage);
            }
            catch (e) {
            }
            // Create sub directories of output directory
            // This was supposed to create the outputDir as latexmk does not
            // take care of it (neither does any of latex command). If the
            //output directory does not exist, the latex commands simply fail.
            const rootDir = path.dirname(rootFile);
            let outDir = this.extension.manager.getOutDir(rootFile);
            if (!path.isAbsolute(outDir)) {
                outDir = path.resolve(rootDir, outDir);
            }
            this.extension.manager.getIncludedTeX(rootFile).forEach(file => {
                const relativePath = path.dirname(file.replace(rootDir, '.'));
                const fullOutDir = path.resolve(outDir, relativePath);
                // To avoid issues when fullOutDir is the root dir
                // Using fs.mkdir() on the root directory even with recursion will result in an error
                if (!(fs.pathExistsSync(fullOutDir) && fs.statSync(fullOutDir).isDirectory())) {
                    fs.ensureDirSync(fullOutDir);
                }
            });
            this.buildInitiator(rootFile, languageId, recipeName, releaseBuildMutex);
        }
        catch (e) {
            this.extension.logger.addLogMessage('Unexpected Error: please see the console log of the Developer Tools of VS Code.');
            this.extension.logger.displayStatus('x', 'errorForeground');
            this.extension.buildInfo.buildEnded();
            releaseBuildMutex();
            throw (e);
        }
    }
    progressString(recipeName, steps, index) {
        if (steps.length < 2) {
            return recipeName;
        }
        else {
            return recipeName + `: ${index + 1}/${steps.length} (${steps[index].name})`;
        }
    }
    buildStep(rootFile, steps, index, recipeName, releaseBuildMutex) {
        if (index === 0) {
            this.extension.logger.clearCompilerMessage();
        }
        if (index > 0) {
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            if (configuration.get('latex.build.clearLog.everyRecipeStep.enabled')) {
                this.extension.logger.clearCompilerMessage();
            }
        }
        this.extension.logger.displayStatus('sync~spin', 'statusBar.foreground', undefined, undefined, ` ${this.progressString(recipeName, steps, index)}`);
        this.extension.logger.addLogMessage(`Recipe step ${index + 1}: ${steps[index].command}, ${steps[index].args}`);
        this.extension.logger.addLogMessage(`Recipe step env: ${JSON.stringify(steps[index].env)}`);
        this.extension.manager.setEnvVar();
        const envVars = {};
        Object.keys(process.env).forEach(key => envVars[key] = process.env[key]);
        const currentEnv = steps[index].env;
        if (currentEnv) {
            Object.keys(currentEnv).forEach(key => envVars[key] = currentEnv[key]);
        }
        envVars['max_print_line'] = maxPrintLine;
        if (steps[index].name === texMagicProgramName || steps[index].name === bibMagicProgramName) {
            // All optional arguments are given as a unique string (% !TeX options) if any, so we use {shell: true}
            let command = steps[index].command;
            const args = steps[index].args;
            if (args) {
                command += ' ' + args[0];
            }
            this.extension.logger.addLogMessage(`cwd: ${path.dirname(rootFile)}`);
            this.currentProcess = cs.spawn(command, [], { cwd: path.dirname(rootFile), env: envVars, shell: true });
        }
        else {
            let workingDirectory;
            if (steps[index].command === 'latexmk' && rootFile === this.extension.manager.localRootFile && this.extension.manager.rootDir) {
                workingDirectory = this.extension.manager.rootDir;
            }
            else {
                workingDirectory = path.dirname(rootFile);
            }
            this.extension.logger.addLogMessage(`cwd: ${workingDirectory}`);
            this.currentProcess = cs.spawn(steps[index].command, steps[index].args, { cwd: workingDirectory, env: envVars });
        }
        const pid = this.currentProcess.pid;
        this.extension.logger.addLogMessage(`LaTeX build process spawned. PID: ${pid}.`);
        let stdout = '';
        this.currentProcess.stdout.on('data', newStdout => {
            stdout += newStdout;
            this.extension.logger.addCompilerMessage(newStdout.toString());
            try {
                this.extension.buildInfo.newStdoutLine(newStdout.toString());
            }
            catch (e) {
            }
        });
        let stderr = '';
        this.currentProcess.stderr.on('data', newStderr => {
            stderr += newStderr;
            this.extension.logger.addCompilerMessage(newStderr.toString());
        });
        this.currentProcess.on('error', err => {
            this.extension.logger.addLogMessage(`LaTeX fatal error: ${err.message}, ${stderr}. PID: ${pid}.`);
            this.extension.logger.addLogMessage(`Does the executable exist? PATH: ${process.env.PATH}`);
            this.extension.logger.addLogMessage(`The environment variable $SHELL: ${process.env.SHELL}`);
            this.extension.logger.displayStatus('x', 'errorForeground', `Recipe terminated with fatal error: ${err.message}.`, 'error');
            this.currentProcess = undefined;
            this.extension.buildInfo.buildEnded();
            releaseBuildMutex();
        });
        this.currentProcess.on('exit', (exitCode, signal) => {
            this.extension.logParser.parse(stdout, rootFile);
            if (exitCode !== 0) {
                this.extension.logger.addLogMessage(`Recipe returns with error: ${exitCode}/${signal}. PID: ${pid}. message: ${stderr}.`);
                this.extension.logger.addLogMessage(`The environment variable $PATH: ${process.env.PATH}`);
                this.extension.logger.addLogMessage(`The environment variable $SHELL: ${process.env.SHELL}`);
                this.extension.buildInfo.buildEnded();
                const configuration = vscode.workspace.getConfiguration('latex-workshop');
                if (!this.disableCleanAndRetry && configuration.get('latex.autoBuild.cleanAndRetry.enabled')) {
                    this.disableCleanAndRetry = true;
                    if (signal !== 'SIGTERM') {
                        this.extension.logger.displayStatus('x', 'errorForeground', 'Recipe terminated with error. Retry building the project.', 'warning');
                        this.extension.logger.addLogMessage('Cleaning auxiliary files and retrying build after toolchain error.');
                        this.extension.cleaner.clean(rootFile).then(() => {
                            this.buildStep(rootFile, steps, 0, recipeName, releaseBuildMutex);
                        });
                    }
                    else {
                        this.extension.logger.displayStatus('x', 'errorForeground');
                        this.currentProcess = undefined;
                        releaseBuildMutex();
                    }
                }
                else {
                    this.extension.logger.displayStatus('x', 'errorForeground');
                    if (['onFailed', 'onBuilt'].includes(configuration.get('latex.autoClean.run'))) {
                        this.extension.cleaner.clean(rootFile);
                    }
                    const res = this.extension.logger.showErrorMessage('Recipe terminated with error.', 'Open compiler log');
                    if (res) {
                        res.then(option => {
                            switch (option) {
                                case 'Open compiler log':
                                    this.extension.logger.showCompilerLog();
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                    this.currentProcess = undefined;
                    releaseBuildMutex();
                }
            }
            else {
                if (index === steps.length - 1) {
                    this.extension.logger.addLogMessage(`Recipe of length ${steps.length} finished. PID: ${pid}.`);
                    try {
                        this.buildFinished(rootFile);
                    }
                    finally {
                        this.currentProcess = undefined;
                        releaseBuildMutex();
                    }
                }
                else {
                    this.extension.logger.addLogMessage(`A step in recipe finished. PID: ${pid}.`);
                    this.buildStep(rootFile, steps, index + 1, recipeName, releaseBuildMutex);
                }
            }
        });
    }
    buildFinished(rootFile) {
        this.extension.buildInfo.buildEnded();
        this.extension.logger.addLogMessage(`Successfully built ${rootFile}.`);
        this.extension.logger.displayStatus('check', 'statusBar.foreground', 'Recipe succeeded.');
        if (this.extension.logParser.isLaTeXmkSkipped) {
            return;
        }
        this.extension.viewer.refreshExistingViewer(rootFile);
        this.extension.completer.reference.setNumbersFromAuxFile(rootFile);
        this.extension.manager.parseFlsFile(rootFile);
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (configuration.get('view.pdf.viewer') === 'external' && configuration.get('synctex.afterBuild.enabled')) {
            const pdfFile = this.extension.manager.tex2pdf(rootFile);
            this.extension.logger.addLogMessage('SyncTex after build invoked.');
            this.extension.locator.syncTeX(undefined, undefined, pdfFile);
        }
        if (configuration.get('latex.autoClean.run') === 'onBuilt') {
            this.extension.logger.addLogMessage('Auto Clean invoked.');
            this.extension.cleaner.clean(rootFile);
        }
    }
    createSteps(rootFile, languageId, recipeName) {
        let steps = [];
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const [magicTex, magicBib] = this.findProgramMagic(rootFile);
        if (recipeName === undefined && magicTex && !configuration.get('latex.build.forceRecipeUsage')) {
            if (!magicTex.args) {
                magicTex.args = configuration.get('latex.magic.args');
                magicTex.name = texMagicProgramName + 'WithArgs';
            }
            if (magicBib) {
                if (!magicBib.args) {
                    magicBib.args = configuration.get('latex.magic.bib.args');
                    magicBib.name = bibMagicProgramName + 'WithArgs';
                }
                steps = [magicTex, magicBib, magicTex, magicTex];
            }
            else {
                steps = [magicTex];
            }
        }
        else {
            const recipes = configuration.get('latex.recipes');
            const defaultRecipeName = configuration.get('latex.recipe.default');
            const tools = configuration.get('latex.tools');
            if (recipes.length < 1) {
                this.extension.logger.addLogMessage('No recipes defined.');
                this.extension.logger.showErrorMessage('No recipes defined.');
                return undefined;
            }
            let recipe = undefined;
            if (this.previousLanguageId !== languageId) {
                this.previouslyUsedRecipe = undefined;
            }
            if (!recipeName && !['first', 'lastUsed'].includes(defaultRecipeName)) {
                recipeName = defaultRecipeName;
            }
            if (recipeName) {
                const candidates = recipes.filter(candidate => candidate.name === recipeName);
                if (candidates.length < 1) {
                    this.extension.logger.addLogMessage(`Failed to resolve build recipe: ${recipeName}`);
                    this.extension.logger.showErrorMessage(`Failed to resolve build recipe: ${recipeName}`);
                }
                recipe = candidates[0];
            }
            if (recipe === undefined) {
                if (defaultRecipeName === 'lastUsed') {
                    recipe = this.previouslyUsedRecipe;
                }
                if (defaultRecipeName === 'first' || recipe === undefined) {
                    let candidates = recipes;
                    if (languageId === 'rsweave') {
                        candidates = recipes.filter(candidate => candidate.name.toLowerCase().match('rnw|rsweave'));
                    }
                    else if (languageId === 'jlweave') {
                        candidates = recipes.filter(candidate => candidate.name.toLowerCase().match('jnw|jlweave|weave.jl'));
                    }
                    if (candidates.length < 1) {
                        this.extension.logger.addLogMessage(`Failed to resolve build recipe: ${recipeName}`);
                        this.extension.logger.showErrorMessage(`Failed to resolve build recipe: ${recipeName}`);
                    }
                    recipe = candidates[0];
                }
            }
            if (recipe === undefined) {
                return undefined;
            }
            this.previouslyUsedRecipe = recipe;
            this.previousLanguageId = languageId;
            recipe.tools.forEach(tool => {
                if (typeof tool === 'string') {
                    const candidates = tools.filter(candidate => candidate.name === tool);
                    if (candidates.length < 1) {
                        this.extension.logger.showErrorMessage(`Skipping undefined tool "${tool}" in recipe "${recipe === null || recipe === void 0 ? void 0 : recipe.name}."`);
                    }
                    else {
                        steps.push(candidates[0]);
                    }
                }
                else {
                    steps.push(tool);
                }
            });
        }
        /**
         * Use JSON.parse and JSON.stringify for a deep copy.
         */
        steps = JSON.parse(JSON.stringify(steps));
        const docker = configuration.get('docker.enabled');
        steps.forEach(step => {
            if (docker) {
                switch (step.command) {
                    case 'latexmk':
                        this.extension.logger.addLogMessage('Use Docker to invoke the command.');
                        if (process.platform === 'win32') {
                            step.command = path.resolve(this.extension.extensionRoot, './scripts/latexmk.bat');
                        }
                        else {
                            step.command = path.resolve(this.extension.extensionRoot, './scripts/latexmk');
                            fs.chmodSync(step.command, 0o755);
                        }
                        break;
                    default:
                        break;
                }
            }
            if (step.args) {
                step.args = step.args.map(utils_1.replaceArgumentPlaceholders(rootFile, this.tmpDir));
            }
            if (step.env) {
                Object.keys(step.env).forEach(v => {
                    const e = step.env && step.env[v];
                    if (step.env && e) {
                        step.env[v] = utils_1.replaceArgumentPlaceholders(rootFile, this.tmpDir)(e);
                    }
                });
            }
            if (configuration.get('latex.option.maxPrintLine.enabled')) {
                if (!step.args) {
                    step.args = [];
                }
                if (this.isMiktex && ((step.command === 'latexmk' && !step.args.includes('-lualatex') && !step.args.includes('-pdflua')) || step.command === 'pdflatex')) {
                    step.args.unshift('--max-print-line=' + maxPrintLine);
                }
            }
        });
        return steps;
    }
    findProgramMagic(rootFile) {
        const regexTex = /^(?:%\s*!\s*T[Ee]X\s(?:TS-)?program\s*=\s*([^\s]*)$)/m;
        const regexBib = /^(?:%\s*!\s*BIB\s(?:TS-)?program\s*=\s*([^\s]*)$)/m;
        const regexTexOptions = /^(?:%\s*!\s*T[Ee]X\s(?:TS-)?options\s*=\s*(.*)$)/m;
        const regexBibOptions = /^(?:%\s*!\s*BIB\s(?:TS-)?options\s*=\s*(.*)$)/m;
        const content = fs.readFileSync(rootFile).toString();
        const tex = content.match(regexTex);
        const bib = content.match(regexBib);
        let texCommand = undefined;
        let bibCommand = undefined;
        if (tex) {
            texCommand = {
                name: texMagicProgramName,
                command: tex[1]
            };
            this.extension.logger.addLogMessage(`Found TeX program by magic comment: ${texCommand.command}`);
            const res = content.match(regexTexOptions);
            if (res) {
                texCommand.args = [res[1]];
                this.extension.logger.addLogMessage(`Found TeX options by magic comment: ${texCommand.args}`);
            }
        }
        if (bib) {
            bibCommand = {
                name: bibMagicProgramName,
                command: bib[1]
            };
            this.extension.logger.addLogMessage(`Found BIB program by magic comment: ${bibCommand.command}`);
            const res = content.match(regexBibOptions);
            if (res) {
                bibCommand.args = [res[1]];
                this.extension.logger.addLogMessage(`Found BIB options by magic comment: ${bibCommand.args}`);
            }
        }
        return [texCommand, bibCommand];
    }
}
exports.Builder = Builder;
//# sourceMappingURL=builder.js.map
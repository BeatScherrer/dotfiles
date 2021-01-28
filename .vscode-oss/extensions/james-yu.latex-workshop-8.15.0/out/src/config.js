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
exports.newVersionMessage = exports.checkDeprecatedFeatures = exports.obsoleteConfigCheck = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function renameConfig(originalConfig, newConfig) {
    const configuration = vscode.workspace.getConfiguration('latex-workshop');
    if (!configuration.has(originalConfig)) {
        return;
    }
    const originalSetting = configuration.inspect(originalConfig);
    if (originalSetting && originalSetting.globalValue !== undefined) {
        configuration.update(newConfig, originalSetting.globalValue, true);
        configuration.update(originalConfig, undefined, true);
    }
    if (originalSetting && originalSetting.workspaceValue !== undefined) {
        configuration.update(newConfig, originalSetting.workspaceValue, false);
        configuration.update(originalConfig, undefined, false);
    }
}
function combineConfig(extension, originalConfig1, originalConfig2, newConfig, truthTable) {
    const configuration = vscode.workspace.getConfiguration('latex-workshop');
    if (!configuration.has(originalConfig1) && !configuration.has(originalConfig2)) {
        return;
    }
    const config1 = configuration.get(originalConfig1, false);
    const config2 = configuration.get(originalConfig2, false);
    if (config1 === undefined || config2 === undefined) {
        return;
    }
    const key = config1.toString() + config2.toString();
    configuration.update(newConfig, truthTable[key], true);
    const msg = `"latex-workshop.${originalConfig1}" and "latex-workshop.${originalConfig2}" have been replaced by "latex-workshop.${newConfig}", which is set to "${truthTable[key]}". Please manually remove the deprecated configs from your settings.`;
    const markdownMsg = `\`latex-workshop.${originalConfig1}\` and \`latex-workshop.${originalConfig2}\` have been replaced by \`latex-workshop.${newConfig}\`, which is set to \`${truthTable[key]}\`.  Please manually remove the deprecated configs from your \`settings.json\``;
    extension.logger.addLogMessage(msg);
    extension.logger.displayStatus('check', 'statusBar.foreground', markdownMsg, 'warning');
    configuration.update(originalConfig1, undefined, true);
    configuration.update(originalConfig1, undefined, false);
    configuration.update(originalConfig2, undefined, true);
    configuration.update(originalConfig2, undefined, false);
}
function splitCommand(extension, config, newCommandConfig, newArgsConfig) {
    const configuration = vscode.workspace.getConfiguration('latex-workshop');
    if (!configuration.has(config)) {
        return;
    }
    const originalConfig = configuration.get(config, {});
    if (originalConfig === undefined || !Object.keys(originalConfig).includes('command')) {
        return;
    }
    configuration.update(newCommandConfig, originalConfig['command']);
    configuration.update(newArgsConfig, originalConfig['args']);
    const msg = `"latex-workshop.${config}" has been replaced by "latex-workshop.${newCommandConfig}" and "latex-workshop.${newArgsConfig}". Please manually remove the deprecated configs from your settings.`;
    const markdownMsg = `\`latex-workshop.${config}\` has been replaced by \`latex-workshop.${newCommandConfig}\` and \`latex-workshop.${newArgsConfig}\`.  Please manually remove the deprecated configs from your \`settings.json\``;
    extension.logger.addLogMessage(msg);
    extension.logger.displayStatus('check', 'statusBar.foreground', markdownMsg, 'warning');
}
function obsoleteConfigCheck(extension) {
    renameConfig('maxPrintLine.option.enabled', 'latex.option.maxPrintLine.enabled');
    renameConfig('chktex.interval', 'chktex.delay');
    renameConfig('latex.outputDir', 'latex.outDir');
    renameConfig('view.autoActivateLatex.enabled', 'view.autoFocus.enabled');
    renameConfig('hoverPreview.enabled', 'hover.preview.enabled');
    renameConfig('hoverReference.enabled', 'hover.ref.enabled');
    renameConfig('hoverCitation.enabled', 'hover.citation.enabled');
    renameConfig('hoverCommandDoc.enabled', 'hover.command.enabled');
    renameConfig('hoverPreview.scale', 'hover.preview.scale');
    renameConfig('hoverPreview.cursor.enabled', 'hover.preview.cursor.enabled');
    renameConfig('hoverPreview.cursor.symbol', 'hover.preview.cursor.symbol');
    renameConfig('hoverPreview.cursor.color', 'hover.preview.cursor.color');
    renameConfig('hoverPreview.ref.enabled', 'hover.ref.enabled');
    combineConfig(extension, 'latex.clean.enabled', 'latex.clean.onFailBuild.enabled', 'latex.autoClean.run', {
        'falsefalse': 'never',
        'falsetrue': 'onFailed',
        'truefalse': 'onBuilt',
        'truetrue': 'onBuilt'
    });
    combineConfig(extension, 'latex.autoBuild.onSave.enabled', 'latex.autoBuild.onTexChange.enabled', 'latex.autoBuild.run', {
        'falsefalse': 'never',
        'falsetrue': 'onFileChange',
        'truefalse': 'onFileChange',
        'truetrue': 'onFileChange'
    });
    renameConfig('hover.ref.numberAtLastCompilation.enabled', 'hover.ref.number.enabled');
    renameConfig('latex-workshop.view.pdf.tab.useNewGroup', 'view.pdf.tab.editorGroup');
    splitCommand(extension, 'latex.external.build.command', 'latex.external.build.command', 'latex.external.build.args');
    splitCommand(extension, 'view.pdf.external.command', 'view.pdf.external.viewer.command', 'view.pdf.external.viewer.args');
    renameConfig('intellisense.preview.enabled', 'intellisense.includegraphics.preview.enabled');
}
exports.obsoleteConfigCheck = obsoleteConfigCheck;
function checkDeprecatedFeatures(extension) {
    const configuration = vscode.workspace.getConfiguration('latex-workshop');
    if (configuration.get('latex.additionalBib') && configuration.get('latex.additionalBib').length > 0) {
        const msg = '"latex-workshop.latex.additionalBib" has been deprecated in favor of "latex-workshop.latex.bibDirs". See https://github.com/James-Yu/LaTeX-Workshop/wiki/Intellisense#Citations.';
        const markdownMsg = '`latex-workshop.latex.additionalBibs` has been deprecated in favor of  `latex-workshop.latex.bibDirs`. See the [wiki](https://github.com/James-Yu/LaTeX-Workshop/wiki/Intellisense#Citations.)';
        extension.logger.addLogMessage(msg);
        extension.logger.displayStatus('check', 'statusBar.foreground', markdownMsg, 'warning');
    }
    if (configuration.get('intellisense.surroundCommand.enabled')) {
        const msg = 'Using "\\" to surround selected text with a LaTeX command is deprecated, use ctrl+l,ctrl+w instead. See https://github.com/James-Yu/LaTeX-Workshop/wiki/Snippets#with-a-command.';
        const markdownMsg = 'Using `\\` to surround selected text with a LaTeX command is deprecated, use `ctrl+l`,`ctrl+w` instead. See the [wiki](https://github.com/James-Yu/LaTeX-Workshop/wiki/Snippets#with-a-command).';
        extension.logger.addLogMessage(msg);
        extension.logger.displayStatus('check', 'statusBar.foreground', markdownMsg, 'warning');
    }
}
exports.checkDeprecatedFeatures = checkDeprecatedFeatures;
function newVersionMessage(extensionPath, extension) {
    fs.readFile(`${extensionPath}${path.sep}package.json`, (err, data) => {
        if (err) {
            extension.logger.addLogMessage('Cannot read package information.');
            return;
        }
        extension.packageInfo = JSON.parse(data.toString());
        extension.logger.addLogMessage(`LaTeX Workshop version: ${extension.packageInfo.version}`);
        if (fs.existsSync(`${extensionPath}${path.sep}VERSION`) &&
            fs.readFileSync(`${extensionPath}${path.sep}VERSION`).toString() === extension.packageInfo.version) {
            return;
        }
        fs.writeFileSync(`${extensionPath}${path.sep}VERSION`, extension.packageInfo.version);
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        if (!configuration.get('message.update.show')) {
            return;
        }
        vscode.window.showInformationMessage(`LaTeX Workshop updated to version ${extension.packageInfo.version}.`, 'Change log', 'Star the project', 'Disable this message')
            .then(option => {
            switch (option) {
                case 'Change log':
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/James-Yu/LaTeX-Workshop/blob/master/CHANGELOG.md'));
                    break;
                case 'Star the project':
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/James-Yu/LaTeX-Workshop'));
                    break;
                case 'Disable this message':
                    configuration.update('message.update.show', false, true);
                    break;
                default:
                    break;
            }
        });
    });
}
exports.newVersionMessage = newVersionMessage;
//# sourceMappingURL=config.js.map
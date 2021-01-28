"use strict";
// Copyright 2018 The Bazel Authors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const bazel_1 = require("../bazel");
const bazel_2 = require("../bazel");
const buildifier_1 = require("../buildifier");
const codelens_1 = require("../codelens");
const symbols_1 = require("../symbols");
const workspace_tree_1 = require("../workspace-tree");
const configuration_1 = require("./configuration");
/**
 * Called when the extension is activated; that is, when its first command is
 * executed.
 *
 * @param context The extension context.
 */
function activate(context) {
    const workspaceTreeProvider = new workspace_tree_1.BazelWorkspaceTreeProvider(context);
    const codeLensProvider = new codelens_1.BazelBuildCodeLensProvider(context);
    const buildifierDiagnostics = new buildifier_1.BuildifierDiagnosticsManager();
    context.subscriptions.push(vscode.window.registerTreeDataProvider("bazelWorkspace", workspaceTreeProvider), 
    // Commands
    vscode.commands.registerCommand("bazel.buildTarget", bazelBuildTarget), vscode.commands.registerCommand("bazel.buildTargetWithDebugging", bazelBuildTargetWithDebugging), vscode.commands.registerCommand("bazel.buildAll", bazelbuildAll), vscode.commands.registerCommand("bazel.buildAllRecursive", bazelbuildAllRecursive), vscode.commands.registerCommand("bazel.testTarget", bazelTestTarget), vscode.commands.registerCommand("bazel.testAll", bazelTestAll), vscode.commands.registerCommand("bazel.testAllRecursive", bazelTestAllRecursive), vscode.commands.registerCommand("bazel.clean", bazelClean), vscode.commands.registerCommand("bazel.refreshBazelBuildTargets", () => {
        workspaceTreeProvider.refresh();
    }), vscode.commands.registerCommand("bazel.copyTargetToClipboard", bazelCopyTargetToClipboard), 
    // CodeLens provider for BUILD files
    vscode.languages.registerCodeLensProvider([{ pattern: "**/BUILD" }, { pattern: "**/BUILD.bazel" }], codeLensProvider), 
    // Buildifier formatting support
    vscode.languages.registerDocumentFormattingEditProvider([
        { language: "starlark" },
        { pattern: "**/BUILD" },
        { pattern: "**/BUILD.bazel" },
        { pattern: "**/WORKSPACE" },
        { pattern: "**/WORKSPACE.bazel" },
        { pattern: "**/*.BUILD" },
        { pattern: "**/*.bzl" },
        { pattern: "**/*.sky" },
    ], new buildifier_1.BuildifierFormatProvider()), buildifierDiagnostics, 
    // Symbol provider for BUILD files
    vscode.languages.registerDocumentSymbolProvider([{ pattern: "**/BUILD" }, { pattern: "**/BUILD.bazel" }], new symbols_1.BazelTargetSymbolProvider()), 
    // Task events.
    vscode.tasks.onDidStartTask(onTaskStart), vscode.tasks.onDidStartTaskProcess(onTaskProcessStart), vscode.tasks.onDidEndTaskProcess(onTaskProcessEnd));
    // Notify the user if buildifier is not available on their path (or where
    // their settings expect it).
    buildifier_1.checkBuildifierIsAvailable();
}
exports.activate = activate;
/** Called when the extension is deactivated. */
function deactivate() {
    // Nothing to do here.
}
exports.deactivate = deactivate;
/**
 * Builds a Bazel target and streams output to the terminal.
 *
 * @param adapter An object that implements {@link IBazelCommandAdapter} from
 *     which the command's arguments will be determined.
 */
function bazelBuildTarget(adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adapter === undefined) {
            // If the command adapter was unspecified, it means this command is being
            // invoked via the command palatte. Provide quickpick build targets for
            // the user to choose from.
            const quickPick = yield vscode.window.showQuickPick(bazel_1.queryQuickPickTargets("kind('.* rule', ...)"), {
                canPickMany: false,
            });
            // If the result was undefined, the user cancelled the quick pick, so don't
            // try again.
            if (quickPick) {
                bazelBuildTarget(quickPick);
            }
            return;
        }
        const commandOptions = adapter.getBazelCommandOptions();
        const task = bazel_1.createBazelTask("build", commandOptions);
        vscode.tasks.executeTask(task);
    });
}
/**
 * Builds a Bazel target and attaches the Starlark debugger.
 *
 * @param adapter An object that implements {@link IBazelCommandAdapter} from
 *     which the command's arguments will be determined.
 */
function bazelBuildTargetWithDebugging(adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adapter === undefined) {
            // If the command adapter was unspecified, it means this command is being
            // invoked via the command palatte. Provide quickpick build targets for
            // the user to choose from.
            const quickPick = yield vscode.window.showQuickPick(bazel_1.queryQuickPickTargets("kind('.* rule', ...)"), {
                canPickMany: false,
            });
            // If the result was undefined, the user cancelled the quick pick, so don't
            // try again.
            if (quickPick) {
                bazelBuildTargetWithDebugging(quickPick);
            }
            return;
        }
        const bazelConfigCmdLine = vscode.workspace.getConfiguration("bazel.commandLine");
        const startupOptions = bazelConfigCmdLine.get("startupOptions");
        const commandArgs = bazelConfigCmdLine.get("commandArgs");
        const commandOptions = adapter.getBazelCommandOptions();
        const fullArgs = commandArgs
            .concat(commandOptions.targets)
            .concat(commandOptions.options);
        vscode.debug.startDebugging(undefined, {
            args: fullArgs,
            bazelCommand: "build",
            bazelExecutablePath: configuration_1.getDefaultBazelExecutablePath(),
            bazelStartupOptions: startupOptions,
            cwd: commandOptions.workspaceInfo.bazelWorkspacePath,
            name: "On-demand Bazel Build Debug",
            request: "launch",
            type: "bazel-launch-build",
        });
    });
}
/**
 * Builds a Bazel package and streams output to the terminal.
 *
 * @param adapter An object that implements {@link IBazelCommandAdapter} from
 *     which the command's arguments will be determined.
 */
function bazelbuildAll(adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        buildPackage(":all", adapter);
    });
}
/**
 * Builds a Bazel package recursively and streams output to the terminal.
 *
 * @param adapter An object that implements {@link IBazelCommandAdapter} from
 *     which the command's arguments will be determined.
 */
function bazelbuildAllRecursive(adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        buildPackage("/...", adapter);
    });
}
function buildPackage(suffix, adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adapter === undefined) {
            // If the command adapter was unspecified, it means this command is being
            // invoked via the command palatte. Provide quickpick build targets for
            // the user to choose from.
            const quickPick = yield vscode.window.showQuickPick(bazel_1.queryQuickPickPackage(), {
                canPickMany: false,
            });
            // If the result was undefined, the user cancelled the quick pick, so don't
            // try again.
            if (quickPick) {
                buildPackage(suffix, quickPick);
            }
            return;
        }
        const commandOptions = adapter.getBazelCommandOptions();
        const allCommandOptions = {
            options: commandOptions.options,
            targets: commandOptions.targets.map((s) => s + suffix),
            workspaceInfo: commandOptions.workspaceInfo,
        };
        const task = bazel_1.createBazelTask("build", allCommandOptions);
        vscode.tasks.executeTask(task);
    });
}
/**
 * Tests a Bazel target and streams output to the terminal.
 *
 * @param adapter An object that implements {@link IBazelCommandAdapter} from
 *     which the command's arguments will be determined.
 */
function bazelTestTarget(adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adapter === undefined) {
            // If the command adapter was unspecified, it means this command is being
            // invoked via the command palatte. Provide quickpick test targets for
            // the user to choose from.
            const quickPick = yield vscode.window.showQuickPick(bazel_1.queryQuickPickTargets("kind('.*_test rule', ...)"), {
                canPickMany: false,
            });
            // If the result was undefined, the user cancelled the quick pick, so don't
            // try again.
            if (quickPick) {
                bazelTestTarget(quickPick);
            }
            return;
        }
        const commandOptions = adapter.getBazelCommandOptions();
        const task = bazel_1.createBazelTask("test", commandOptions);
        vscode.tasks.executeTask(task);
    });
}
/**
 * Tests a Bazel package and streams output to the terminal.
 *
 * @param adapter An object that implements {@link IBazelCommandAdapter} from
 *     which the command's arguments will be determined.
 */
function bazelTestAll(adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        testPackage(":all", adapter);
    });
}
/**
 * Tests a Bazel package recursively and streams output to the terminal.
 *
 * @param adapter An object that implements {@link IBazelCommandAdapter} from
 *     which the command's arguments will be determined.
 */
function bazelTestAllRecursive(adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        testPackage("/...", adapter);
    });
}
function testPackage(suffix, adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adapter === undefined) {
            // If the command adapter was unspecified, it means this command is being
            // invoked via the command palatte. Provide quickpick build targets for
            // the user to choose from.
            const quickPick = yield vscode.window.showQuickPick(bazel_1.queryQuickPickPackage(), {
                canPickMany: false,
            });
            // If the result was undefined, the user cancelled the quick pick, so don't
            // try again.
            if (quickPick) {
                testPackage(suffix, quickPick);
            }
            return;
        }
        const commandOptions = adapter.getBazelCommandOptions();
        const allCommandOptions = {
            options: commandOptions.options,
            targets: commandOptions.targets.map((s) => s + suffix),
            workspaceInfo: commandOptions.workspaceInfo,
        };
        const task = bazel_1.createBazelTask("test", allCommandOptions);
        vscode.tasks.executeTask(task);
    });
}
/**
 * Cleans a Bazel workspace.
 *
 * If there is only a single workspace open, it will be cleaned immediately. If
 * there are multiple workspace folders open, a quick-pick window will be opened
 * asking the user to choose one.
 */
function bazelClean() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaces = vscode.workspace.workspaceFolders;
        let workspaceFolder;
        switch (workspaces.length) {
            case 0:
                vscode.window.showInformationMessage("Please open a Bazel workspace folder to use this command.");
                return;
            case 1:
                workspaceFolder = workspaces[0];
                break;
            default:
                workspaceFolder = yield vscode.window.showWorkspaceFolderPick();
                if (workspaceFolder === undefined) {
                    return;
                }
        }
        const task = bazel_1.createBazelTask("clean", {
            options: [],
            targets: [],
            workspaceInfo: bazel_1.BazelWorkspaceInfo.fromWorkspaceFolder(workspaceFolder),
        });
        vscode.tasks.executeTask(task);
    });
}
/**
 * Copies a target to the clipboard.
 */
function bazelCopyTargetToClipboard(adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (adapter === undefined) {
            // This command should not be enabled in the commands palette, so adapter
            // should always be present.
            return;
        }
        // This can only be called on single targets, so we can assume there is only
        // one of them.
        const target = adapter.getBazelCommandOptions().targets[0];
        vscode.env.clipboard.writeText(target);
    });
}
function onTaskStart(event) {
    const bazelTaskInfo = bazel_1.getBazelTaskInfo(event.execution.task);
    if (bazelTaskInfo) {
        bazelTaskInfo.startTime = process.hrtime();
    }
}
function onTaskProcessStart(event) {
    const bazelTaskInfo = bazel_1.getBazelTaskInfo(event.execution.task);
    if (bazelTaskInfo) {
        bazelTaskInfo.processId = event.processId;
    }
}
function onTaskProcessEnd(event) {
    const bazelTaskInfo = bazel_1.getBazelTaskInfo(event.execution.task);
    if (bazelTaskInfo) {
        const rawExitCode = event.exitCode;
        bazelTaskInfo.exitCode = rawExitCode;
        const exitCode = bazel_2.parseExitCode(rawExitCode, bazelTaskInfo.command);
        if (rawExitCode !== 0) {
            vscode.window.showErrorMessage(`Bazel ${bazelTaskInfo.command} failed: ${bazel_2.exitCodeToUserString(exitCode)}`);
        }
        else {
            const timeInSeconds = measurePerformance(bazelTaskInfo.startTime);
            vscode.window.showInformationMessage(`Bazel ${bazelTaskInfo.command} completed successfully in ${timeInSeconds} seconds.`);
        }
    }
}
/**
 * Returns the number of seconds elapsed with a single decimal place.
 *
 */
function measurePerformance(start) {
    const diff = process.hrtime(start);
    return (diff[0] + diff[1] / 1e9).toFixed(1);
}
//# sourceMappingURL=extension.js.map
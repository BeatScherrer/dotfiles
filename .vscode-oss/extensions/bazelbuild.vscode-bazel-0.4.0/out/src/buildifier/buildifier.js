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
const child_process = require("child_process");
const path = require("path");
const vscode = require("vscode");
/**
 * Invokes buildifier in format mode.
 *
 * @param fileContent The BUILD or .bzl file content to process, which is sent
 *     via stdin.
 * @param type Indicates whether to treat the file content as a BUILD file or a
 *     .bzl file.
 * @param applyLintFixes If true, lint warnings with automatic fixes will be
 *     fixed as well.
 * @returns The formatted file content.
 */
function buildifierFormat(fileContent, type, applyLintFixes) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = [`--mode=fix`, `--type=${type}`];
        if (applyLintFixes) {
            args.push(`--lint=fix`);
        }
        return (yield executeBuildifier(fileContent, args, false)).stdout;
    });
}
exports.buildifierFormat = buildifierFormat;
function buildifierLint(fileContent, type, lintMode) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = [
            `--format=json`,
            `--mode=check`,
            `--type=${type}`,
            `--lint=${lintMode}`,
        ];
        const outputs = yield executeBuildifier(fileContent, args, true);
        switch (lintMode) {
            case "fix":
                return outputs.stdout;
            case "warn":
                const result = JSON.parse(outputs.stdout);
                for (const file of result.files) {
                    if (file.filename === "<stdin>") {
                        return file.warnings;
                    }
                }
                return [];
        }
    });
}
exports.buildifierLint = buildifierLint;
/**
 * Returns the file type of a file with the given path.
 *
 * @param fsPath The file path, whose extension and basename are used to
 *     determine the file type.
 * @returns The buildifier type of the file.
 */
function getBuildifierFileType(fsPath) {
    // TODO(bazelbuild/buildtools#475, bazelbuild/buildtools#681): Switch to
    // `--path=<path>` rather than duplicate the logic from buildifier. The
    // catch is `--path` was already documented, but didn't work with stdin
    // until bazelbuild/buildtools#681, so we'd need to dual code path testing
    // --version to decide how to do things; so it likely is better to just
    // ignore things until the support has been out a while.
    // NOTE: The implementation here should be kept in sync with buildifier's
    // automatic format detection (see:
    // https://github.com/bazelbuild/buildtools/blob/d39e4d/build/lex.go#L88)
    // so that user actions in the IDE are consistent with the behavior they
    // would see running buildifier on the command line.
    const raw = fsPath.toLowerCase();
    let parsedPath = path.parse(raw);
    if (parsedPath.ext === ".oss") {
        parsedPath = path.parse(parsedPath.name);
    }
    if (parsedPath.ext === ".bzl" || parsedPath.ext === ".sky") {
        return "bzl";
    }
    if (parsedPath.ext === ".build" ||
        parsedPath.name === "build" ||
        parsedPath.name.startsWith("build.")) {
        return "build";
    }
    if (parsedPath.ext === ".workspace" ||
        parsedPath.name === "workspace" ||
        parsedPath.name.startsWith("workspace.")) {
        return "workspace";
    }
    return "bzl";
}
exports.getBuildifierFileType = getBuildifierFileType;
/**
 * Gets the path to the buildifier executable specified by the workspace
 * configuration, if present.
 *
 * @returns The path to the buildifier executable specified in the workspace
 *     configuration, or just "buildifier" if not present (in which case the
 *     system path will be searched).
 */
function getDefaultBuildifierExecutablePath() {
    // Try to retrieve the executable from VS Code's settings. If it's not set,
    // just use "buildifier" as the default and get it from the system PATH.
    const bazelConfig = vscode.workspace.getConfiguration("bazel");
    const buildifierExecutable = bazelConfig.get("buildifierExecutable");
    if (buildifierExecutable.length === 0) {
        return "buildifier";
    }
    return buildifierExecutable;
}
exports.getDefaultBuildifierExecutablePath = getDefaultBuildifierExecutablePath;
/**
 * Executes buildifier with the given file content and arguments.
 *
 * @param fileContent The BUILD or .bzl file content to process, which is sent
 *     via stdin.
 * @param args Command line arguments to pass to buildifier.
 * @param acceptNonSevereErrors If true, syntax/lint exit codes will not be
 *     treated as severe tool errors.
 */
function executeBuildifier(fileContent, args, acceptNonSevereErrors) {
    return new Promise((resolve, reject) => {
        const execOptions = {
            maxBuffer: Number.MAX_SAFE_INTEGER,
        };
        const process = child_process.execFile(getDefaultBuildifierExecutablePath(), args, execOptions, (error, stdout, stderr) => {
            if (!error ||
                (acceptNonSevereErrors && shouldTreatBuildifierErrorAsSuccess(error))) {
                resolve({ stdout, stderr });
            }
            else {
                reject(error);
            }
        });
        // Write the file being linted/formatted to stdin and close the stream so
        // that the buildifier process continues.
        process.stdin.write(fileContent);
        process.stdin.end();
    });
}
/**
 * Returns a value indicating whether we need to consider the given error to be
 * a "successful" buildifier exit in the sense that it correctly reported
 * warnings/errors in the file despite the non-zero exit code.
 *
 * @param error The {@code Error} passed to the `child_process.execFile`
 *     callback.
 */
function shouldTreatBuildifierErrorAsSuccess(error) {
    // Some of buildifier's exit codes represent states that we want to treat as
    // "successful" (i.e., the file had warnings/errors but we want to render
    // them), and other exit codes represent legitimate failures (like I/O
    // errors). We have to treat them specifically; see the following section for
    // the specific exit codes we handle (and make sure that this is updated if
    // new failure modes are introduced in the future):
    //
    // tslint:disable-next-line:max-line-length
    // https://github.com/bazelbuild/buildtools/blob/831e4632/buildifier/buildifier.go#L323-L331
    const code = error.code;
    switch (code) {
        case 1: // syntax errors in input
        case 4: // check mode failed
            return true;
        case undefined: // some other type of error, assume it's severe
            return false;
        default:
            return false;
    }
}
//# sourceMappingURL=buildifier.js.map
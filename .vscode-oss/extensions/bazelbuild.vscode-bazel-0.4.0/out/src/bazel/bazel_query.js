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
const crypto = require("crypto");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const protos_1 = require("../protos");
const bazel_command_1 = require("./bazel_command");
const bazel_utils_1 = require("./bazel_utils");
/** Provides a promise-based API around a Bazel query. */
class BazelQuery extends bazel_command_1.BazelCommand {
    /**
     * Initializes a new Bazel query.
     *
     * @param bazelExecutable The path to the Bazel executable.
     * @param workingDirectory The path to the directory from which Bazel will be
     *     spawned.
     * @param query The query to execute.
     * @param options Command line options that will be passed to Bazel (targets,
     *     query strings, flags, etc.).
     * @param ignoresErrors If true, a non-zero exit code for the child process is
     *     ignored and the {@link #run} function's promise is resolved with the
     *     empty string instead.
     */
    constructor(bazelExecutable, workingDirectory, query, options, ignoresErrors = false) {
        super(bazelExecutable, workingDirectory, [query].concat(options));
        this.ignoresErrors = ignoresErrors;
    }
    /**
     * Runs the query and returns a {@code QueryResult} containing the targets
     * that match.
     *
     * @param additionalOptions Additional command line options that should be
     *     passed just to this specific invocation of the query.
     * @returns A {@link QueryResult} object that contains structured information
     *     about the query results.
     */
    queryTargets(additionalOptions = [], sortByRuleName = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield this.run(additionalOptions.concat(["--output=proto"]));
            const result = protos_1.blaze_query.QueryResult.decode(buffer);
            if (sortByRuleName) {
                const sorted = result.target.sort((t1, t2) => {
                    const n1 = t1.rule.name;
                    const n2 = t2.rule.name;
                    if (n1 > n2) {
                        return 1;
                    }
                    if (n1 < n2) {
                        return -1;
                    }
                    return 0;
                });
                result.target = sorted;
            }
            return result;
        });
    }
    /**
     * Runs the query and returns an array of package paths containing the targets
     * that match.
     *
     * @param additionalOptions Additional command line options that should be
     *     passed just to this specific invocation of the query.
     * @returns An sorted array of package paths containing the targets that
     *     match.
     */
    queryPackages(additionalOptions = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield this.run(additionalOptions.concat(["--output=package"]));
            const result = buffer
                .toString("utf-8")
                .trim()
                .split("\n")
                .sort();
            return result;
        });
    }
    bazelCommand() {
        return "query";
    }
    /**
     * Executes the command and returns a promise for the binary contents of
     * standard output.
     *
     * @param additionalOptions Additional command line options that apply only to
     *     this particular invocation of the command.
     * @returns A promise that is resolved with the contents of the process's
     *     standard output, or rejected if the command fails.
     */
    run(additionalOptions = []) {
        const bazelConfig = vscode.workspace.getConfiguration("bazel");
        const queriesShareServer = bazelConfig.get("queriesShareServer");
        let additionalStartupOptions = [];
        if (!queriesShareServer) {
            // If not sharing the Bazel server, use a custom output_base.
            //
            // This helps get the queries out of the way of any other builds (or use
            // of ibazel). The docs suggest using a custom output base for IDE support
            // features, which is what these queries are. See:
            // tslint:disable-next-line: max-line-length
            // https://docs.bazel.build/versions/master/guide.html#choosing-the-output-base
            //
            // NOTE: This does NOT use a random directory for each query instead it
            // uses a generated tmp directory based on the Bazel workspace, this way
            // the server is shared for all the queries.
            const ws = bazel_utils_1.getBazelWorkspaceFolder(this.workingDirectory);
            const hash = crypto.createHash("md5").update(ws).digest("hex");
            const outputBase = path.join(os.tmpdir(), hash);
            additionalStartupOptions = additionalStartupOptions.concat([
                `--output_base=${outputBase}`,
            ]);
        }
        return new Promise((resolve, reject) => {
            const execOptions = {
                cwd: this.workingDirectory,
                // A null encoding causes the callback below to receive binary data as a
                // Buffer instead of text data as strings.
                encoding: null,
                maxBuffer: Number.MAX_SAFE_INTEGER,
            };
            child_process.execFile(this.bazelExecutable, this.execArgs(additionalOptions, additionalStartupOptions), execOptions, (error, stdout, stderr) => {
                if (error) {
                    if (this.ignoresErrors) {
                        resolve(new Buffer(0));
                    }
                    else {
                        reject(error);
                    }
                }
                else {
                    resolve(stdout);
                }
            });
        });
    }
}
exports.BazelQuery = BazelQuery;
//# sourceMappingURL=bazel_query.js.map
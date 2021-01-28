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
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
/**
 * Gets the path to the Bazel executable specified by the workspace
 * configuration, if present.
 *
 * @returns The path to the Bazel executable specified in the workspace
 * configuration, or just "bazel" if not present (in which case the system path
 * will be searched).
 */
function getDefaultBazelExecutablePath() {
    // Try to retrieve the executable from VS Code's settings. If it's not set,
    // just use "bazel" as the default and get it from the system PATH.
    const bazelConfig = vscode.workspace.getConfiguration("bazel");
    const bazelExecutable = bazelConfig.get("executable");
    if (bazelExecutable.length === 0) {
        return "bazel";
    }
    return bazelExecutable;
}
exports.getDefaultBazelExecutablePath = getDefaultBazelExecutablePath;
//# sourceMappingURL=configuration.js.map
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
 * Represents the location of a query item in the BUILD file where it was
 * defined.
 */
class QueryLocation {
    constructor(stringRepresentation) {
        const parts = stringRepresentation.split(":");
        let isWindowsPath = false;
        if (parts.length > 1 && isNaN(Number(parts[1]))) {
            isWindowsPath = true;
        }
        let pathParts = 1;
        if (isWindowsPath) {
            this.path = parts[0] + ":" + parts[1];
            pathParts = 2;
        }
        else {
            this.path = parts[0];
        }
        const partsAfterPath = parts.length - pathParts;
        this.line = partsAfterPath > 0 ? parseInt(parts[pathParts], 10) : 1;
        this.column = partsAfterPath > 1 ? parseInt(parts[pathParts + 1], 10) : 1;
    }
    /**
     * A {@code vscode.Range} value that points to the first character where the
     * given query item is defined.
     *
     * This property handles the conversation from Bazel's 1-based line/column
     * indices to the 0-based indices that VS Code expects.
     */
    get range() {
        return new vscode.Range(this.line - 1, this.column - 1, this.line - 1, this.column - 1);
    }
}
exports.QueryLocation = QueryLocation;
//# sourceMappingURL=query_location.js.map
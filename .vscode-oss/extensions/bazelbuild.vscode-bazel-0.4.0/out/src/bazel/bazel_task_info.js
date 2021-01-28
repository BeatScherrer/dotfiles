"use strict";
// Copyright 2019 The Bazel Authors. All rights reserved.
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
/** Information about a Bazel task. */
class BazelTaskInfo {
    /**
     * Initializes a new Bazel task info instance.
     *
     * @param command The bazel command used (e.g. test, build).
     * @param commandOptions The bazel options used.
     */
    constructor(command, commandOptions) {
        this.command = command;
        this.commandOptions = commandOptions;
    }
}
exports.BazelTaskInfo = BazelTaskInfo;
function setBazelTaskInfo(task, info) {
    task.bazelTaskInfo = info;
}
exports.setBazelTaskInfo = setBazelTaskInfo;
function getBazelTaskInfo(task) {
    return task.bazelTaskInfo;
}
exports.getBazelTaskInfo = getBazelTaskInfo;
//# sourceMappingURL=bazel_task_info.js.map
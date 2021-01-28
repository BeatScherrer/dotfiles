"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simple_git_1 = require("simple-git");
class GitConfig {
    constructor() {
        const git = simple_git_1.default();
        git.listConfig().then((result) => {
            this.gitConfig = result.all;
        });
    }
    /** git config --get user.name */
    get UserName() {
        try {
            return this.gitConfig["user.name"].toString();
        }
        catch (error) {
            return "";
        }
    }
    /** git config --get user.email */
    get UserEmail() {
        try {
            return this.gitConfig["user.email"].toString();
        }
        catch (error) {
            return "";
        }
    }
}
exports.default = GitConfig;
//# sourceMappingURL=GitConfig.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const CodeParserController_1 = require("./CodeParserController");
var Version;
(function (Version) {
    Version["CURRENT"] = "1.1.0";
    Version["PREVIOUS"] = "1.0.1";
    Version["KEY"] = "doxdocgen_version";
})(Version || (Version = {}));
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const parser = new CodeParserController_1.default();
    context.subscriptions.push(parser);
    const version = context.globalState.get(Version.KEY);
    if (version === undefined) {
        context.globalState.update(Version.KEY, Version.CURRENT);
    }
    else if (version !== Version.CURRENT) {
        context.globalState.update(Version.KEY, Version.CURRENT);
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
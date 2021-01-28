"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathPreviewUtils = void 0;
class MathPreviewUtils {
    addDummyCodeBlock(md) {
        // We need a dummy code block in hover to make the width of hover larger.
        const dummyCodeBlock = '```\n```';
        return dummyCodeBlock + '\n' + md + '\n' + dummyCodeBlock;
    }
    stripTeX(tex) {
        if (tex.startsWith('$$') && tex.endsWith('$$')) {
            tex = tex.slice(2, tex.length - 2);
        }
        else if (tex.startsWith('$') && tex.endsWith('$')) {
            tex = tex.slice(1, tex.length - 1);
        }
        else if (tex.startsWith('\\(') && tex.endsWith('\\)')) {
            tex = tex.slice(2, tex.length - 2);
        }
        else if (tex.startsWith('\\[') && tex.endsWith('\\]')) {
            tex = tex.slice(2, tex.length - 2);
        }
        return tex;
    }
    mathjaxify(tex, envname, opt = { stripLabel: true }) {
        // remove TeX comments
        let s = tex.replace(/^\s*%.*\r?\n/mg, '');
        s = s.replace(/^((?:\\.|[^%])*).*$/mg, '$1');
        // remove \label{...}
        if (opt.stripLabel) {
            s = s.replace(/\\label\{.*?\}/g, '');
        }
        if (envname.match(/^(aligned|alignedat|array|Bmatrix|bmatrix|cases|CD|gathered|matrix|pmatrix|smallmatrix|split|subarray|Vmatrix|vmatrix)$/)) {
            s = '\\begin{equation}' + s + '\\end{equation}';
        }
        return s;
    }
}
exports.MathPreviewUtils = MathPreviewUtils;
//# sourceMappingURL=mathpreviewutils.js.map
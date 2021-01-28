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
exports.typeset = void 0;
const workerpool = __importStar(require("workerpool"));
const mj = __importStar(require("mathjax-node"));
mj.config({
    MathJax: {
        jax: ['input/TeX', 'output/SVG'],
        extensions: ['tex2jax.js', 'MathZoom.js'],
        showMathMenu: false,
        showProcessingMessages: false,
        messageStyle: 'none',
        SVG: {
            useGlobalCache: false
        },
        TeX: {
            extensions: ['AMSmath.js', 'AMSsymbols.js', 'autoload-all.js', 'color.js', 'noUndefined.js']
        }
    }
});
mj.start();
function scaleSVG(data, scale) {
    const svgelm = data.svgNode;
    // w0[2] and h0[2] are units, i.e., pt, ex, em, ...
    const w0 = svgelm.getAttribute('width').match(/([.\d]+)(\w*)/);
    const h0 = svgelm.getAttribute('height').match(/([.\d]+)(\w*)/);
    const w = scale * Number(w0[1]);
    const h = scale * Number(h0[1]);
    svgelm.setAttribute('width', w + w0[2]);
    svgelm.setAttribute('height', h + h0[2]);
}
function colorSVG(svg, color) {
    const ret = svg.replace('</title>', `</title><style> * { color: ${color} }</style>`);
    return ret;
}
async function typeset(arg, opts) {
    const data = await mj.typeset(arg);
    scaleSVG(data, opts.scale);
    const xml = colorSVG(data.svgNode.outerHTML, opts.color);
    return xml;
}
exports.typeset = typeset;
const workers = { typeset };
workerpool.worker(workers);
//# sourceMappingURL=mathjaxpool_worker.js.map
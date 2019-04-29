"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mkdirp_raw = require("mkdirp");
function mkdirp(path) {
    return new Promise(function (resolve, reject) {
        mkdirp_raw(path, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.mkdirp = mkdirp;
//# sourceMappingURL=mkdirp.js.map
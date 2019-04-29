"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rimraf_raw = require("rimraf");
function rimraf(path) {
    return new Promise(function (resolve, reject) {
        rimraf_raw(path, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
exports.rimraf = rimraf;
//# sourceMappingURL=rimraf.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
function getMemoryUsage() {
    var freeMemPct = os.freemem() / os.totalmem();
    return {
        pct: Math.round((1 - freeMemPct) * 1000) / 10,
    };
}
exports.getMemoryUsage = getMemoryUsage;
//# sourceMappingURL=getMemoryUsage.js.map
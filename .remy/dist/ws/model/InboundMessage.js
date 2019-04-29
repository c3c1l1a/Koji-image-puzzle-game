"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InboundMessage;
(function (InboundMessage) {
    var Type;
    (function (Type) {
        // Filesystem operations
        Type["LS"] = "fs/ls";
        Type["RM"] = "fs/rm";
        Type["MV"] = "fs/mv";
        Type["TOUCH"] = "fs/touch";
        // File operations
        Type["OPEN_FILE"] = "file/open_file";
        Type["CLOSE_FILE"] = "file/close_file";
        Type["SAVE_FILE"] = "file/save_file";
        Type["SET_SELECTION"] = "file/set_selection";
        Type["APPLY_OPERATION"] = "file/apply_operation";
        Type["JSON_SET_VALUE"] = "file/json_set_value";
        // Terminal operations
        Type["PTY_SPAWN"] = "pty/spawn";
        Type["PTY_KILL"] = "pty/kill";
        Type["PTY_WRITE"] = "pty/write";
        Type["PTY_RESIZE"] = "pty/resize";
    })(Type = InboundMessage.Type || (InboundMessage.Type = {}));
})(InboundMessage = exports.InboundMessage || (exports.InboundMessage = {}));
//# sourceMappingURL=InboundMessage.js.map
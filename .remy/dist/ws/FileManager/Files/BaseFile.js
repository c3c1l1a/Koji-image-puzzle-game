"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OutboundMessage_1 = require("../../model/OutboundMessage");
var BaseFile = /** @class */ (function () {
    function BaseFile(server, projectPath, path) {
        this.sticky = false;
        this.editorType = OutboundMessage_1.EditorType.CODE;
        this.hasUnsavedChanges = false;
        this.hasChangedOnDisk = false;
        this.server = server;
        this.projectPath = projectPath;
        this.path = path;
    }
    Object.defineProperty(BaseFile.prototype, "socketExpression", {
        get: function () {
            return {
                path: this.path,
                sticky: this.sticky,
                editorType: this.editorType,
                hasUnsavedChanges: this.hasUnsavedChanges,
                hasChangedOnDisk: this.hasChangedOnDisk,
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseFile.prototype, "fileLoadedMessage", {
        get: function () {
            if (this.body === undefined) {
                return null;
            }
            return OutboundMessage_1.OutboundMessage.getFileLoadedCommand({
                path: this.path,
                body: this.body,
            });
        },
        enumerable: true,
        configurable: true
    });
    BaseFile.prototype.setSticky = function () {
        this.sticky = true;
    };
    Object.defineProperty(BaseFile.prototype, "isSticky", {
        get: function () {
            return this.sticky;
        },
        enumerable: true,
        configurable: true
    });
    BaseFile.prototype.setHasChangedOnDisk = function () {
        this.hasChangedOnDisk = true;
    };
    BaseFile.prototype.save = function () {
        this.hasChangedOnDisk = false;
        this.hasUnsavedChanges = false;
    };
    BaseFile.prototype.broadcastContents = function () {
        if (this.body === undefined) {
            return;
        }
        var message = this.fileLoadedMessage;
        if (message) {
            this.server.broadcast(message);
        }
    };
    return BaseFile;
}());
exports.BaseFile = BaseFile;
//# sourceMappingURL=BaseFile.js.map
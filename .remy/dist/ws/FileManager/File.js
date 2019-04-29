"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var objectPath = require("object-path");
var OutboundMessage_1 = require("../model/OutboundMessage");
var TextOperation_1 = require("./helpers/TextOperation");
var File = /** @class */ (function () {
    function File(server, projectPath, path) {
        this.sticky = false;
        this.editorType = OutboundMessage_1.EditorType.CODE;
        this.hasUnsavedChanges = false;
        this.server = server;
        this.projectPath = projectPath;
        this.path = path;
    }
    Object.defineProperty(File.prototype, "socketExpression", {
        get: function () {
            return {
                path: this.path,
                sticky: this.sticky,
                editorType: this.editorType,
                hasUnsavedChanges: this.hasUnsavedChanges,
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "fileLoadedMessage", {
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
    File.prototype.open = function (editorType) {
        var _this = this;
        this.editorType = editorType || this.editorType;
        if (this.body !== undefined) {
            this.broadcastContents();
            return;
        }
        var stat = fs.statSync(this.projectPath + "/" + this.path);
        if (stat.size > 5e6) {
            // File is larger than 5 mb, skip!
            console.log('Skipping giant file', stat.size);
            return;
        }
        fs.readFile(this.projectPath + "/" + this.path, { encoding: 'utf8' }, function (err, data) {
            if (!err) {
                _this.body = data;
                _this.broadcastContents();
            }
        });
    };
    File.prototype.setSticky = function () {
        this.sticky = true;
    };
    Object.defineProperty(File.prototype, "isSticky", {
        get: function () {
            return this.sticky;
        },
        enumerable: true,
        configurable: true
    });
    File.prototype.broadcastContents = function () {
        if (this.body === undefined) {
            return;
        }
        var message = this.fileLoadedMessage;
        if (message) {
            this.server.broadcast(message);
        }
    };
    File.prototype.applyOperation = function (fromSessionId, operationString) {
        if (this.body === undefined) {
            return;
        }
        this.hasUnsavedChanges = true;
        // Apply the operation to the server's copy of the file
        var operation = TextOperation_1.TextOperation.fromString(operationString);
        this.body = operation.apply(this.body);
        // Broadcast the operation to all clients
        var message = OutboundMessage_1.OutboundMessage.getOperationReceivedCommand({
            sessionId: fromSessionId,
            path: this.path,
            operation: operationString,
            ts: Date.now(),
        });
        this.server.broadcast(message);
    };
    File.prototype.jsonSetValue = function (fromSessionId, key, newValue) {
        if (this.body === undefined) {
            return;
        }
        try {
            var jsonBody = JSON.parse(this.body);
            objectPath.set(jsonBody, key, newValue);
            this.body = JSON.stringify(jsonBody, null, 2);
            var message = OutboundMessage_1.OutboundMessage.getJsonValueChangedCommand({
                sessionId: fromSessionId,
                path: this.path,
                key: key,
                newValue: newValue,
            });
            this.server.broadcast(message);
        }
        catch (err) {
            //
        }
    };
    File.prototype.save = function () {
        if (this.body === undefined) {
            return;
        }
        this.hasUnsavedChanges = false;
        fs.writeFile(this.projectPath + "/" + this.path, this.body, function (err) {
            // console.log('write err', err);
        });
    };
    return File;
}());
exports.File = File;
//# sourceMappingURL=File.js.map
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var objectPath = require("object-path");
var OutboundMessage_1 = require("../../model/OutboundMessage");
var TextOperation_1 = require("../helpers/TextOperation");
var BaseFile_1 = require("./BaseFile");
var File = /** @class */ (function (_super) {
    __extends(File, _super);
    function File() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    File.prototype.open = function (editorType) {
        return __awaiter(this, void 0, void 0, function () {
            var stat;
            var _this = this;
            return __generator(this, function (_a) {
                this.editorType = editorType || this.editorType;
                if (this.body !== undefined) {
                    this.broadcastContents();
                    return [2 /*return*/];
                }
                stat = fs.statSync(this.projectPath + "/" + this.path);
                if (stat.size > 5e6) {
                    // File is larger than 5 mb, skip!
                    console.log('Skipping giant file', stat.size);
                    return [2 /*return*/];
                }
                fs.readFile(this.projectPath + "/" + this.path, { encoding: 'utf8' }, function (err, data) {
                    if (!err) {
                        _this.body = data;
                        _this.broadcastContents();
                    }
                });
                return [2 /*return*/];
            });
        });
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
        _super.prototype.save.call(this);
        if (this.body === undefined) {
            return;
        }
        fs.writeFile(this.projectPath + "/" + this.path, this.body, function (err) {
            // console.log('write err', err);
        });
    };
    return File;
}(BaseFile_1.BaseFile));
exports.File = File;
//# sourceMappingURL=File.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
var BaseFile_1 = require("./BaseFile");
var GitInfo = /** @class */ (function (_super) {
    __extends(GitInfo, _super);
    function GitInfo(server, projectPath, path, gitManager) {
        var _this = _super.call(this, server, projectPath, path) || this;
        _this.gitManager = gitManager;
        _this.statusChangedCallback = function (status) {
            _this.body = JSON.stringify(status, null, 2);
            _this.broadcastContents();
        };
        _this.gitManager.onStatusChanged(_this.statusChangedCallback);
        return _this;
    }
    GitInfo.prototype.open = function (editorType) {
        this.editorType = editorType || this.editorType;
        if (this.body !== undefined) {
            this.broadcastContents();
            return;
        }
        // Get the body
        this.gitManager.getStatus();
    };
    GitInfo.prototype.close = function () {
        this.gitManager.removeStatusChanged(this.statusChangedCallback);
    };
    return GitInfo;
}(BaseFile_1.BaseFile));
exports.GitInfo = GitInfo;
//# sourceMappingURL=GitInfo.js.map
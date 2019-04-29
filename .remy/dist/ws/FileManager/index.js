"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OutboundMessage_1 = require("../model/OutboundMessage");
var fileFactory_1 = require("./Files/fileFactory");
var FileManager = /** @class */ (function () {
    function FileManager(server, projectPath, gitManager) {
        this.currentFile = null;
        this.files = [];
        this.lastOpenFilesMessage = null;
        this.server = server;
        this.projectPath = projectPath;
        this.gitManager = gitManager;
    }
    Object.defineProperty(FileManager.prototype, "openFilesMessage", {
        get: function () {
            return OutboundMessage_1.OutboundMessage.getOpenFilesChangedCommand({
                openFiles: this.files.map(function (file) { return file.socketExpression; }),
                currentFile: this.currentFile,
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FileManager.prototype, "currentFileMessage", {
        get: function () {
            if (this.currentFile) {
                var file = this.fileForPath(this.currentFile);
                if (file) {
                    return file.fileLoadedMessage;
                }
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    FileManager.prototype.indexForPath = function (path) {
        var index = this.files.findIndex(function (file) { return file.path === path; });
        if (index === -1) {
            return undefined;
        }
        return index;
    };
    FileManager.prototype.fileForPath = function (path) {
        var index = this.indexForPath(path);
        if (index !== undefined) {
            return this.files[index];
        }
        return null;
    };
    FileManager.prototype.onOpenFilesChanged = function () {
        // Don't broadcast if nothing has changed
        var newMessage = this.openFilesMessage;
        if (this.lastOpenFilesMessage) {
            if (JSON.stringify(newMessage) === JSON.stringify(this.lastOpenFilesMessage)) {
                return;
            }
        }
        this.lastOpenFilesMessage = newMessage;
        this.server.broadcast(newMessage);
    };
    FileManager.prototype.open = function (path, editorType) {
        var existingFile = this.fileForPath(path);
        if (existingFile) {
            // File already open, broadcast contents
            existingFile.setSticky();
            existingFile.open(editorType);
        }
        else {
            // If the last item isn't sticky, remove it before pushing
            if (this.files.length > 0) {
                if (!this.files[this.files.length - 1].isSticky) {
                    this.files.pop();
                }
            }
            var file = fileFactory_1.fileFactory(this.server, this.projectPath, path, this.gitManager);
            this.files.push(file);
            file.open(editorType);
        }
        // Set the file as the current file
        this.currentFile = path;
        this.onOpenFilesChanged();
    };
    FileManager.prototype.close = function (path) {
        var index = this.indexForPath(path);
        if (index === undefined) {
            return;
        }
        var file = this.fileForPath(path);
        if (file && file.close) {
            file.close();
        }
        // Set a new current file if we need to
        if (this.currentFile === path) {
            if (index === 0) {
                if (this.files.length > 1) {
                    this.currentFile = this.files[index + 1].path;
                }
                else {
                    this.currentFile = null;
                }
            }
            else {
                this.currentFile = this.files[index - 1].path;
            }
        }
        // Remove the file (closed)
        this.files.splice(index, 1);
        this.onOpenFilesChanged();
        if (this.currentFile) {
            var file_1 = this.fileForPath(this.currentFile);
            if (file_1) {
                file_1.broadcastContents();
            }
        }
    };
    FileManager.prototype.applyOperation = function (sessionId, path, operation) {
        var file = this.fileForPath(path);
        if (!file) {
            return;
        }
        file.setSticky();
        if (file.applyOperation) {
            file.applyOperation(sessionId, operation);
            this.onOpenFilesChanged();
        }
    };
    FileManager.prototype.jsonSetValueAtPath = function (sessionId, path, key, newValue) {
        var file = this.fileForPath(path);
        if (!file) {
            return;
        }
        file.setSticky();
        if (file.jsonSetValue) {
            file.jsonSetValue(sessionId, key, newValue);
            this.onOpenFilesChanged();
        }
    };
    FileManager.prototype.save = function (path) {
        var file = this.fileForPath(path);
        if (!file) {
            return;
        }
        if (file.save) {
            file.save();
            this.onOpenFilesChanged();
        }
    };
    FileManager.prototype.onFilesMoved = function (source, dest) {
        var _this = this;
        this.files
            .filter(function (_a) {
            var path = _a.path;
            return path.startsWith(source);
        })
            .forEach(function (file) {
            var path = file.path;
            var newPath = path.replace(source, dest);
            _this.close(path);
            _this.open(newPath);
        });
    };
    FileManager.prototype.onFileRemoved = function (path) {
        this.close(path);
    };
    FileManager.prototype.onFileChangedOnDisk = function (path) {
        if (path !== this.currentFile) {
            var file = this.fileForPath(path);
            if (file) {
                file.setHasChangedOnDisk();
                this.onOpenFilesChanged();
            }
        }
    };
    return FileManager;
}());
exports.FileManager = FileManager;
//# sourceMappingURL=index.js.map
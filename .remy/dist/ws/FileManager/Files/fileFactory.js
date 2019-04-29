"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var File_1 = require("./File");
var GitInfo_1 = require("./GitInfo");
function fileFactory(server, projectPath, path, gitManager) {
    if (path === '.git-info') {
        return new GitInfo_1.GitInfo(server, projectPath, path, gitManager);
    }
    return new File_1.File(server, projectPath, path);
}
exports.fileFactory = fileFactory;
//# sourceMappingURL=fileFactory.js.map
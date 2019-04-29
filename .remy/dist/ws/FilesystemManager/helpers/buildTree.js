"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function buildTree(paths) {
    var tree = [];
    paths
        .map(function (fileName) { return fileName.split('/'); })
        .forEach(function (file) {
        var itemPointer = tree;
        file.forEach(function (part, i) {
            var exsitingItem = itemPointer.find(function (treePart) { return treePart.name === part; });
            if (exsitingItem) {
                itemPointer = exsitingItem.children;
            }
            else {
                var newItem = {
                    name: part,
                    path: "" + file.slice(0, i + 1).join('/'),
                    children: [],
                };
                itemPointer.push(newItem);
                itemPointer = newItem.children;
            }
        });
    });
    return tree;
}
exports.buildTree = buildTree;
//# sourceMappingURL=buildTree.js.map
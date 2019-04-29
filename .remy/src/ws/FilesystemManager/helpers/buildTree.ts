export interface TreeItem {
  name: string;
  path: string;
  children: TreeItem[];
}

export function buildTree(paths: string[]): TreeItem[] {
  const tree: TreeItem[] = [];

  paths
    .map(fileName => fileName.split('/'))
    .forEach((file) => {
      let itemPointer = tree;

      file.forEach((part, i) => {
        const exsitingItem = itemPointer.find(treePart => treePart.name === part);
        if (exsitingItem) {
          itemPointer = exsitingItem.children;
        } else {
          const newItem = {
            name: part,
            path: `${file.slice(0, i + 1).join('/')}`,
            children: [],
          };
          itemPointer.push(newItem);
          itemPointer = newItem.children;
        }
      });
    });

  return tree;
}

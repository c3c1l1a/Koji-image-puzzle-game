export interface TreeItem {
    name: string;
    path: string;
    children: TreeItem[];
}
export declare function buildTree(paths: string[]): TreeItem[];

export declare class RemoteSync {
    private readonly projectPath;
    private readonly bucketName;
    private readonly prefix;
    private readonly s3;
    private uploadQueueMap;
    private deleteQueueMap;
    private debounceTimer;
    isSyncing: boolean;
    constructor(projectPath: string, bucketName: string, prefix: string);
    private getRelativePath;
    filterIgnoredFiles(paths: string[]): string[];
    upload(path: string): Promise<void>;
    private markForUpload;
    processQueues(): Promise<void>;
    private processUpload;
    delete(path: string): Promise<void>;
    private processDelete;
}

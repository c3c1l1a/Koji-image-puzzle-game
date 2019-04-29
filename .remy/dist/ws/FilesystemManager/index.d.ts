import { Server } from '../Server';
import { GitManager } from '../GitManager';
import { FileManager } from '../FileManager';
export declare class FilesystemManager {
    private readonly server;
    private readonly gitManager;
    private readonly fileManager;
    private readonly projectPath;
    private readonly remoteSync;
    private watcher;
    private files;
    private broadcastDebounceTimer;
    kojifilesBroadcastMessage: object | null;
    private kojifilesBroadcastDebounceTimer;
    private gitfilesChangedDebounceTimer;
    readonly filesystemChangedMessage: object;
    readonly status: 'syncing' | 'synced';
    constructor(server: Server, gitManager: GitManager, fileManager: FileManager, projectPath: string, remoteBucket: string, remotePrefix: string);
    private getRelativePath;
    private onFilesystemChanged;
    private onKojifilesChanged;
    private startWatcher;
    ls(): Promise<void>;
    rm(path: string): Promise<void>;
    mv(source: string, dest: string): Promise<void>;
    touch(fullPath: string): Promise<void>;
    private onGitfilesChanged;
}

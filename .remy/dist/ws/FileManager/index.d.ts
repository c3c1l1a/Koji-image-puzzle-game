import { Server } from '../Server';
import { EditorType } from '../model/OutboundMessage';
import { BaseFile } from './Files/BaseFile';
import { GitManager } from '../GitManager';
export declare class FileManager {
    private readonly server;
    private readonly projectPath;
    private readonly gitManager;
    private currentFile;
    private files;
    private lastOpenFilesMessage;
    constructor(server: Server, projectPath: string, gitManager: GitManager);
    readonly openFilesMessage: object;
    readonly currentFileMessage: object | null;
    indexForPath(path: string): number | undefined;
    fileForPath(path: string): BaseFile | null;
    private onOpenFilesChanged;
    open(path: string, editorType?: EditorType): void;
    close(path: string): void;
    applyOperation(sessionId: string, path: string, operation: string): void;
    jsonSetValueAtPath(sessionId: string, path: string, key: string, newValue: string): void;
    save(path: string): void;
    onFilesMoved(source: string, dest: string): void;
    onFileRemoved(path: string): void;
    onFileChangedOnDisk(path: string): void;
}

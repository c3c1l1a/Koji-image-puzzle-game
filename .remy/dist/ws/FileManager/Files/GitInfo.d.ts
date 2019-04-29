import { BaseFile } from './BaseFile';
import { EditorType } from '../../model/OutboundMessage';
import { Server } from '../../Server';
import { GitManager } from '../../GitManager';
export declare class GitInfo extends BaseFile {
    private readonly gitManager;
    private readonly statusChangedCallback;
    constructor(server: Server, projectPath: string, path: string, gitManager: GitManager);
    open(editorType?: EditorType): void;
    close(): void;
}

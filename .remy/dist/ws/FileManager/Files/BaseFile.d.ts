import { Server } from '../../Server';
import { OpenFile, EditorType } from '../../model/OutboundMessage';
export interface BaseFile {
    open(editorType?: EditorType): void;
    applyOperation?(fromSessionId: string, operationString: string): void;
    jsonSetValue?(fromSessionId: string, key: string, newValue: string): void;
    save(): void;
    close?(): void;
}
export declare class BaseFile {
    protected readonly server: Server;
    protected readonly projectPath: string;
    readonly path: string;
    protected body?: string;
    protected sticky: boolean;
    editorType: EditorType;
    protected hasUnsavedChanges: boolean;
    protected hasChangedOnDisk: boolean;
    constructor(server: Server, projectPath: string, path: string);
    readonly socketExpression: OpenFile;
    readonly fileLoadedMessage: object | null;
    setSticky(): void;
    readonly isSticky: boolean;
    setHasChangedOnDisk(): void;
    broadcastContents(): void;
}

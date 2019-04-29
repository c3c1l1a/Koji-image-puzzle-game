import { Server } from '../Server';
import { OpenFile, EditorType } from '../model/OutboundMessage';
export declare class File {
    private readonly server;
    private readonly projectPath;
    readonly path: string;
    private body?;
    private sticky;
    editorType: EditorType;
    private hasUnsavedChanges;
    constructor(server: Server, projectPath: string, path: string);
    readonly socketExpression: OpenFile;
    readonly fileLoadedMessage: object | null;
    open(editorType?: EditorType): void;
    setSticky(): void;
    readonly isSticky: boolean;
    broadcastContents(): void;
    applyOperation(fromSessionId: string, operationString: string): void;
    jsonSetValue(fromSessionId: string, key: string, newValue: string): void;
    save(): void;
}

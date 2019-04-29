import { Server } from '../Server';
import { PtyFrame } from '../model/OutboundMessage';
export declare class PtyManager {
    private readonly server;
    private readonly projectPath;
    private readonly creatorUsername;
    private ptys;
    constructor(server: Server, projectPath: string, creatorUsername: string);
    spawn(cwdOrNull?: string, nameOrNull?: string): string;
    kill(ptyId: string): void;
    write(ptyId: string, frame: PtyFrame): void;
    resize(ptyId: string, cols: number, rows: number): void;
    readonly ptyStatusChangedMessage: object;
    private updateStatus;
}

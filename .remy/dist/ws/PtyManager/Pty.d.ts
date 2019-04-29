import { PtyExpression, PtyFrame } from '../model/OutboundMessage';
export declare class Pty {
    private id;
    private name;
    private proc;
    private frames;
    onData: ((frame: PtyFrame) => void) | null;
    onExit: ((code: number) => void) | null;
    readonly socketExpression: PtyExpression;
    constructor(id: string, cwd: string, name: string, username: string);
    resize(cols: number, rows: number): void;
    kill(): void;
    write(frame: PtyFrame): void;
}

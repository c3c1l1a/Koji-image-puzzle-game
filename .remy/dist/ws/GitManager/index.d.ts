import { Server } from '../Server';
export declare class GitManager {
    private readonly server;
    private readonly git;
    private isOperationInProgress;
    private isLoading;
    private cachedStatus;
    private statusChangedListeners;
    constructor(server: Server);
    readonly status: {
        [index: string]: any;
    };
    markGitOperationInProgress(isInProgress: boolean): void;
    onStatusChanged(callback: (status: {
        [index: string]: any;
    }) => void): void;
    removeStatusChanged(callback: (status: {
        [index: string]: any;
    }) => void): void;
    statusChanged(): void;
    getStatus(): Promise<void>;
    updateRemotes(): Promise<{}>;
}

import { Server } from '../../Server';
import { BaseFile } from './BaseFile';
import { GitManager } from '../../GitManager';
export declare function fileFactory(server: Server, projectPath: string, path: string, gitManager: GitManager): BaseFile;

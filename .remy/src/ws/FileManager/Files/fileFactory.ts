import { Server } from '../../Server';

import { BaseFile } from './BaseFile';
import { File } from './File';
import { GitInfo } from './GitInfo';
import { GitManager } from '../../GitManager';

export function fileFactory(server: Server, projectPath: string, path: string, gitManager: GitManager): BaseFile {
  console.log(path);
  if (path === '.git-info') {
    return new GitInfo(server, projectPath, path, gitManager);
  }
  return new File(server, projectPath, path);
}

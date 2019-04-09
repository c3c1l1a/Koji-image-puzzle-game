import * as child from 'child_process';

export interface DiskUsage {
  used: string;
  available: string;
  pct: number;
}

export async function getDiskUsage(): Promise<DiskUsage> {
  return new Promise<DiskUsage>((resolve, reject) => {
    child.exec('df -h', (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      const filesystems = res.split('\n');
      const mainFs = filesystems.find(fs => fs.endsWith('/'));
      if (!mainFs) {
        reject('no_root_fs');
        return;
      }
      const [name, size, used, available, pct] = mainFs.trim().split(/\s+/);
      resolve({
        used,
        available,
        pct: parseInt(pct, 10) || 0,
      });
    });
  });
}

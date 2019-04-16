import * as mkdirp_raw from 'mkdirp';

export function mkdirp(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    mkdirp_raw(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

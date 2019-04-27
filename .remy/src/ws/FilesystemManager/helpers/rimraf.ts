import * as rimraf_raw from 'rimraf';

export function rimraf(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    rimraf_raw(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

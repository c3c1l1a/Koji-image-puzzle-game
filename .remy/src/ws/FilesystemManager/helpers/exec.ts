import * as child from 'child_process';

export function exec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {

    child.exec(command, { maxBuffer: Math.pow(1024, 4) }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

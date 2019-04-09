import * as os from 'os';

export interface MemoryUsage {
  pct: number;
}

export function getMemoryUsage(): MemoryUsage {
  const freeMemPct = os.freemem() / os.totalmem();
  return {
    pct: Math.round((1 - freeMemPct) * 1000) / 10,
  };
}

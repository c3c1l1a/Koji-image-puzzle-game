export interface DiskUsage {
    used: string;
    available: string;
    pct: number;
}
export declare function getDiskUsage(): Promise<DiskUsage>;

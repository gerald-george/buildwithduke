export interface CacheAdapter { get(key: string): Promise<string | null>; set(key: string, value: string, ttlSeconds?: number): Promise<void> }

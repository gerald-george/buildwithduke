export interface StorageAdapter { put(key: string, data: ArrayBuffer, contentType: string): Promise<string>; remove(key: string): Promise<void> }

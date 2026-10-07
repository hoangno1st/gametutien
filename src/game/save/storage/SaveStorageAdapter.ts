export interface SaveStorageAdapter {
    load(): Promise<string | null>;
    save(serialized: string): Promise<void>;
    delete(): Promise<void>;
}

export interface SyncSaveStorageAdapter extends SaveStorageAdapter {
    loadSync(): string | null;
    saveSync(serialized: string): void;
    deleteSync(): void;
}

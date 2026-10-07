import type { SyncSaveStorageAdapter } from "./SaveStorageAdapter";

export class LocalSaveStorageAdapter implements SyncSaveStorageAdapter {
    private storage: Storage | null;
    private key: string;

    constructor(storage: Storage | null, key: string) {
        this.storage = storage;
        this.key = key;
    }

    public loadSync(): string | null { return this.storage?.getItem(this.key) ?? null; }
    public saveSync(serialized: string): void {
        if (!this.storage) throw new Error("localStorage unavailable");
        this.storage.setItem(this.key, serialized);
    }
    public deleteSync(): void { this.storage?.removeItem(this.key); }
    public async load(): Promise<string | null> { return this.loadSync(); }
    public async save(serialized: string): Promise<void> { this.saveSync(serialized); }
    public async delete(): Promise<void> { this.deleteSync(); }
}

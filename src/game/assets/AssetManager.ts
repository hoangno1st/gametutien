import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import { ASSET_MANIFEST_BY_KEY } from "./AssetManifest";

export class AssetManager {
    private missingKeys: Set<string>;

    constructor() {
        this.missingKeys = new Set<string>();
    }

    public async loadTextureByPath(path: string): Promise<Texture | null> {
        try {
            return await Assets.load<Texture>(path);
        } catch {
            this.warnMissing(path);
            return null;
        }
    }

    public async loadTexture(key: string): Promise<Texture | null> {
        const entry = ASSET_MANIFEST_BY_KEY.get(key);
        if (!entry) {
            this.warnMissing(key);
            return null;
        }
        return this.loadTextureByPath(entry.src);
    }

    public async createSpriteOrFallback(
        key: string,
        width: number,
        height: number,
        color = 0x6b7280,
    ): Promise<Container> {
        const texture = await this.loadTexture(key);
        if (texture) {
            const sprite = new Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.width = width;
            sprite.height = height;
            return sprite;
        }
        return new Graphics()
            .roundRect(-width / 2, -height / 2, width, height, 6)
            .fill(color)
            .stroke({ color: 0xffffff, width: 1, alpha: 0.35 });
    }

    public getMissingKeys(): string[] { return [...this.missingKeys]; }

    private warnMissing(key: string): void {
        if (this.missingKeys.has(key)) return;
        this.missingKeys.add(key);
        if (import.meta.env.DEV) console.warn(`[AssetManager] Thiếu asset: ${key}`);
    }
}

export const gameAssetManager = new AssetManager();

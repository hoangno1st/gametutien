import gsap from "gsap";
import { Container, Graphics, Sprite } from "pixi.js";
import type { ChapterDefinition } from "../chapters/ChapterDefinition";
import type { AssetManager } from "../assets/AssetManager";

const FALLBACK_PALETTES: ReadonlyArray<readonly [number, number, number]> = [
    [0x14241f, 0x214a3a, 0x426b50],
    [0x171425, 0x302250, 0x4a3568],
    [0x2a1512, 0x5a2819, 0x87391f],
    [0x17171d, 0x30303c, 0x514a58],
    [0x111c2c, 0x213e63, 0x436c91],
    [0x11151d, 0x202d42, 0x34465d],
    [0x241713, 0x533025, 0x74503a],
    [0x292216, 0x5c4a27, 0x77683c],
    [0x161225, 0x34295b, 0x6b55a0],
];

export class ChapterBackgroundSystem {
    private view: Container;
    private backgroundLayer: Container;
    private midgroundLayer: Container;
    private foregroundLayer: Container;
    private assetManager: AssetManager;
    private width: number;
    private height: number;
    private currentKey: string | null;
    private elapsed: number;

    constructor(assetManager: AssetManager, width: number, height: number) {
        this.assetManager = assetManager;
        this.width = width;
        this.height = height;
        this.view = new Container();
        this.backgroundLayer = new Container();
        this.midgroundLayer = new Container();
        this.foregroundLayer = new Container();
        this.currentKey = null;
        this.elapsed = 0;
        this.view.addChild(this.backgroundLayer, this.midgroundLayer, this.foregroundLayer);
    }

    public getView(): Container { return this.view; }

    public async changeChapter(definition: ChapterDefinition, reduceMotion: boolean): Promise<void> {
        if (this.currentKey === definition.backgroundKey) return;
        this.currentKey = definition.backgroundKey;
        const duration = reduceMotion ? 0 : 0.65;
        await new Promise<void>((resolve) => {
            gsap.to(this.view, { alpha: 0, duration: duration / 2, onComplete: resolve });
        });
        this.clearLayers();
        const texture = await this.assetManager.loadTexture(definition.backgroundKey);
        if (texture) {
            const sprite = new Sprite(texture);
            sprite.width = this.width;
            sprite.height = this.height;
            this.backgroundLayer.addChild(sprite);
        } else {
            this.createFallback(definition.chapter);
        }
        gsap.to(this.view, { alpha: 1, duration: duration / 2 });
    }

    public update(deltaSeconds: number, reduceMotion: boolean): void {
        if (reduceMotion) {
            this.midgroundLayer.x = 0;
            this.foregroundLayer.x = 0;
            return;
        }
        this.elapsed += Math.max(0, deltaSeconds);
        this.midgroundLayer.x = Math.sin(this.elapsed * 0.15) * 3;
        this.foregroundLayer.x = Math.sin(this.elapsed * 0.1) * 5;
    }

    public destroy(): void {
        gsap.killTweensOf(this.view);
        this.clearLayers();
        this.view.destroy({ children: true });
    }

    private createFallback(chapter: number): void {
        const palette = FALLBACK_PALETTES[Math.max(0, Math.min(8, chapter - 1))];
        this.backgroundLayer.addChild(new Graphics().rect(0, 0, this.width, this.height).fill(palette[0]));
        this.midgroundLayer.addChild(new Graphics()
            .poly([0, this.height, 0, 120, 240, 85, 430, 135, 650, 70, 900, 125, this.width, 75, this.width, this.height])
            .fill({ color: palette[1], alpha: 0.8 }));
        this.foregroundLayer.addChild(new Graphics()
            .poly([0, this.height, 0, 190, 260, 165, 480, 205, 750, 160, 980, 195, this.width, 150, this.width, this.height])
            .fill({ color: palette[2], alpha: 0.55 }));
    }

    private clearLayers(): void {
        for (const layer of [this.backgroundLayer, this.midgroundLayer, this.foregroundLayer]) {
            layer.removeChildren().forEach((child) => child.destroy());
        }
    }
}

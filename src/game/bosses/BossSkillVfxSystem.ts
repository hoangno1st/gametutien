import { AnimatedSprite, Assets, Container, Graphics, Rectangle, Texture } from "pixi.js";
import gsap from "gsap";
import { BOSS_SKILL_IDS } from "./bossData";

const BOSS_VFX_ASSETS = {
    rageMain: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-1-rage-claw/rage-claw-main.png",
    rageSlash: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-1-rage-claw/rage-claw-slash-alt.png",
    rageImpact: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-1-rage-claw/rage-claw-impact.png",
    roarMain: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-2-wolf-king-roar/wolf-king-roar-main.png",
    roarCharge: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-2-wolf-king-roar/wolf-king-roar-charge.png",
    roarImpact: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-2-wolf-king-roar/wolf-king-roar-impact.png",
    summonMain: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-3-summon/summon-main.png",
    summonPortal: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-3-summon/summon-portal.png",
    summonBurst: "/assets/enemies/bosses/green-wind-wolf-king/skills/phase-3-summon/summon-burst.png",
} as const;

type BossVfxAssetKey = keyof typeof BOSS_VFX_ASSETS;

export class BossSkillVfxSystem {
    private readonly parent: Container;

    public static async loadAssets(): Promise<void> {
        await Promise.all(Object.values(BOSS_VFX_ASSETS).map((path) => Assets.load<Texture>(path)));
    }

    constructor(parent: Container) {
        this.parent = parent;
    }

    public playTelegraph(
        skillId: string,
        bossX: number,
        bossY: number,
        targetX: number,
        targetY: number,
        durationSeconds: number,
    ): void {
        if (skillId === BOSS_SKILL_IDS.RAGE_CLAW) {
            this.playWarning(targetX, targetY, 72, durationSeconds);
            this.playSheet("rageMain", bossX - 30, bossY - 18, 0.28, 0.8);
            return;
        }

        if (skillId === BOSS_SKILL_IDS.WOLF_KING_ROAR) {
            this.playWarning(targetX, targetY, 125, durationSeconds);
            this.playSheet("roarCharge", bossX - 35, bossY - 22, 0.31, 0.95);
        }
    }

    public playImpact(
        skillId: string,
        bossX: number,
        bossY: number,
        targetX: number,
        targetY: number,
    ): void {
        if (skillId === BOSS_SKILL_IDS.RAGE_CLAW) {
            this.playSheet("rageSlash", targetX + 45, targetY - 12, 0.3, 1.05);
            gsap.delayedCall(0.16, () => {
                this.playSheet("rageImpact", targetX + 25, targetY - 4, 0.27, 1.1);
            });
            return;
        }

        if (skillId === BOSS_SKILL_IDS.WOLF_KING_ROAR) {
            this.playSheet("roarMain", bossX - 55, bossY - 25, 0.32, 1.0);
            this.playSheet("roarImpact", targetX + 90, targetY - 5, 0.3, 1.05);
        }
    }

    public playPhaseTransition(bossX: number, bossY: number, phaseIndex: number): void {
        const radius = phaseIndex === 1 ? 86 : 108;
        const ring = new Graphics()
            .circle(0, 0, radius)
            .stroke({ color: 0x9effc3, width: 5, alpha: 0.9 });
        ring.position.set(bossX, bossY - 12);
        ring.alpha = 0.9;
        this.parent.addChild(ring);
        gsap.to(ring.scale, { x: 1.45, y: 1.45, duration: 0.7, ease: "power2.out" });
        gsap.to(ring, {
            alpha: 0,
            duration: 0.75,
            onComplete: () => ring.destroy(),
        });
    }

    public playSummon(
        bossX: number,
        bossY: number,
        onEmerge: () => void,
    ): void {
        const portalX = bossX + 95;
        this.playSheet("summonPortal", portalX, bossY, 0.3, 0.95);
        gsap.delayedCall(0.62, () => {
            this.playSheet("summonMain", portalX + 20, bossY - 4, 0.3, 1.0);
            onEmerge();
        });
        gsap.delayedCall(1.18, () => {
            this.playSheet("summonBurst", portalX, bossY, 0.29, 1.05);
        });
    }

    private playWarning(
        x: number,
        y: number,
        radius: number,
        durationSeconds: number,
    ): void {
        const warning = new Graphics()
            .circle(0, 0, radius)
            .fill({ color: 0xff4d5a, alpha: 0.11 })
            .stroke({ color: 0xffd166, width: 3, alpha: 0.88 });
        warning.position.set(x, y);
        warning.scale.set(0.78);
        this.parent.addChild(warning);
        gsap.to(warning.scale, {
            x: 1,
            y: 1,
            duration: durationSeconds,
            ease: "power1.out",
        });
        gsap.to(warning, {
            alpha: 0.28,
            duration: Math.max(0.1, durationSeconds * 0.5),
            yoyo: true,
            repeat: 1,
            onComplete: () => warning.destroy(),
        });
    }

    private playSheet(
        key: BossVfxAssetKey,
        x: number,
        y: number,
        scale: number,
        speed: number,
    ): void {
        const texture = Assets.get<Texture>(BOSS_VFX_ASSETS[key]);
        if (!texture) return;

        const frameWidth = texture.width / 4;
        const frameHeight = texture.height / 2;
        const frames = Array.from({ length: 8 }, (_, index) => new Texture({
            source: texture.source,
            frame: new Rectangle(
                (index % 4) * frameWidth,
                Math.floor(index / 4) * frameHeight,
                frameWidth,
                frameHeight,
            ),
        }));
        const sprite = new AnimatedSprite(frames);
        sprite.anchor.set(0.5);
        sprite.position.set(x, y);
        sprite.scale.set(scale);
        sprite.animationSpeed = Math.max(0.08, speed / 8);
        sprite.loop = false;
        sprite.onComplete = () => sprite.destroy({ children: true });
        this.parent.addChild(sprite);
        sprite.play();
    }
}

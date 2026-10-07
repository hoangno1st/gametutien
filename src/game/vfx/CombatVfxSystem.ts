import gsap from "gsap";
import { Container, Graphics } from "pixi.js";
import { GameTheme } from "../ui/theme/GameTheme";
import type { VisualSettingsManager } from "../settings/VisualSettings";
import { VfxQuality } from "../settings/VisualSettings";

export class CombatVfxSystem {
    private root: Container;
    private pool: Graphics[];
    private active: Set<Graphics>;
    private settingsManager: VisualSettingsManager;

    constructor(root: Container, settingsManager: VisualSettingsManager) {
        this.root = root;
        this.pool = [];
        this.active = new Set<Graphics>();
        this.settingsManager = settingsManager;
    }

    public playHit(x: number, y: number, critical: boolean): void {
        const slash = this.acquire();
        slash.moveTo(-16, 12).lineTo(16, -12).stroke({ color: critical ? GameTheme.colors.gold : 0xffffff, width: critical ? 5 : 3 });
        slash.position.set(x, y);
        slash.rotation = -0.25;
        this.animateAndRelease(slash, 0.18, { alpha: 0, rotation: 0.35, x: x + 10 });
        this.shake(critical ? 2.5 : 1.2);
    }

    public playSkill(x: number, y: number, multi = false): void {
        const quality = this.settingsManager.getSettings().vfxQuality;
        const count = multi
            ? quality === VfxQuality.LOW ? 2 : quality === VfxQuality.MEDIUM ? 4 : 6
            : 1;
        for (let index = 0; index < count; index += 1) {
            const line = this.acquire();
            line.moveTo(-30, 0).lineTo(30, 0).stroke({ color: 0x7dd3fc, width: 3 });
            line.position.set(x - 20 + index * 8, y - 20 + index * 7);
            line.rotation = -0.5 + index * 0.08;
            this.animateAndRelease(line, 0.25, { alpha: 0, x: line.x + 55 });
        }
    }

    public playHeal(x: number, y: number): void {
        const quality = this.settingsManager.getSettings().vfxQuality;
        const count = quality === VfxQuality.LOW ? 3 : quality === VfxQuality.MEDIUM ? 5 : 8;
        for (let index = 0; index < count; index += 1) {
            const particle = this.acquire();
            particle.circle(0, 0, 2 + index % 2).fill(GameTheme.colors.jade);
            particle.position.set(x - 20 + Math.random() * 40, y + Math.random() * 25);
            this.animateAndRelease(particle, 0.45, { alpha: 0, y: particle.y - 45 });
        }
    }

    public playBossPhase(x: number, y: number): void {
        const pulse = this.acquire();
        pulse.circle(0, 0, 25).stroke({ color: GameTheme.colors.danger, width: 5 });
        pulse.position.set(x, y);
        pulse.scale.set(0.4);
        this.animateAndRelease(pulse, 0.4, { alpha: 0, rotation: 0.6 });
    }

    public destroy(): void {
        for (const view of this.active) {
            gsap.killTweensOf(view);
            gsap.killTweensOf(view.position);
            view.removeFromParent();
            view.destroy();
        }
        this.active.clear();
        this.pool.forEach((view) => view.destroy());
        this.pool = [];
        gsap.killTweensOf(this.root.position);
    }

    private acquire(): Graphics {
        const view = this.pool.pop() ?? new Graphics();
        view.clear(); view.alpha = 1; view.rotation = 0; view.scale.set(1); view.visible = true;
        this.active.add(view); this.root.addChild(view); return view;
    }

    private animateAndRelease(view: Graphics, duration: number, values: gsap.TweenVars): void {
        gsap.to(view, { ...values, duration, ease: "power2.out", onComplete: () => this.release(view) });
    }

    private release(view: Graphics): void {
        gsap.killTweensOf(view); view.removeFromParent(); view.clear(); view.visible = false;
        this.active.delete(view); this.pool.push(view);
    }

    private shake(amount: number): void {
        if (this.settingsManager.getSettings().reduceMotion) return;
        gsap.killTweensOf(this.root.position);
        const originalX = this.root.x;
        gsap.to(this.root.position, { x: originalX + amount, duration: 0.035, yoyo: true, repeat: 1 });
    }
}

import gsap from "gsap";
import type { Graphics } from "pixi.js";

export enum EnemyAnimationState {
    IDLE = "idle",
    MOVE = "move",
    ATTACK = "attack",
    HIT = "hit",
    DEATH = "death",
    SKILL = "skill",
}

export class EnemyAnimationController {
    private body: Graphics;
    private state: EnemyAnimationState;
    private baseScale: number;

    constructor(body: Graphics, baseScale: number) {
        this.body = body;
        this.state = EnemyAnimationState.IDLE;
        this.baseScale = baseScale;
        this.body.scale.set(baseScale);
    }

    public playIdle(): void { this.state = EnemyAnimationState.IDLE; }
    public playMove(): void {
        if (this.state === EnemyAnimationState.DEATH) return;
        this.state = EnemyAnimationState.MOVE;
    }
    public playAttack(): void { this.punch(EnemyAnimationState.ATTACK, 1.12); }
    public playSkill(): void { this.punch(EnemyAnimationState.SKILL, 1.2); }
    public playHit(): void { this.punch(EnemyAnimationState.HIT, 0.92); }
    public playDeath(): void {
        this.state = EnemyAnimationState.DEATH;
        gsap.killTweensOf(this.body);
        gsap.to(this.body, { alpha: 0, rotation: 0.35, duration: 0.2 });
    }
    public destroy(): void { gsap.killTweensOf(this.body); }

    private punch(state: EnemyAnimationState, multiplier: number): void {
        if (this.state === EnemyAnimationState.DEATH) return;
        this.state = state;
        gsap.killTweensOf(this.body.scale);
        gsap.to(this.body.scale, {
            x: this.baseScale * multiplier,
            y: this.baseScale * multiplier,
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            onComplete: () => this.playIdle(),
        });
    }
}

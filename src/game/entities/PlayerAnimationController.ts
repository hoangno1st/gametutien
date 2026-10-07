import { AnimatedSprite, Texture } from "pixi.js";

export enum PlayerAnimationState {
    IDLE = "idle",
    RUN = "run",
    ATTACK = "attack",
    SKILL = "skill",
    HIT = "hit",
    DEATH = "death",
}

export type PlayerAnimationTextures = Readonly<Record<PlayerAnimationState, ReadonlyArray<Texture>>>;

export class PlayerAnimationController {
    private sprite: AnimatedSprite;
    private textures: PlayerAnimationTextures;
    private state: PlayerAnimationState;

    constructor(sprite: AnimatedSprite, textures: PlayerAnimationTextures) {
        this.sprite = sprite;
        this.textures = textures;
        this.state = PlayerAnimationState.IDLE;
        this.playLoop(PlayerAnimationState.IDLE, 0.08);
    }

    public playIdle(): void { this.playLoop(PlayerAnimationState.IDLE, 0.08); }
    public playRun(): void { this.playLoop(PlayerAnimationState.RUN, 0.12); }
    public playAttack(): void { this.playOnce(PlayerAnimationState.ATTACK, 0.35); }
    public playSkill(): void { this.playOnce(PlayerAnimationState.SKILL, 0.22); }
    public playHit(): void { this.playOnce(PlayerAnimationState.HIT, 0.18); }
    public playDeath(): void { this.playOnce(PlayerAnimationState.DEATH, 0.12, false); }
    public getState(): PlayerAnimationState { return this.state; }

    private playLoop(state: PlayerAnimationState, speed: number): void {
        if (this.state === PlayerAnimationState.DEATH) return;
        this.state = state;
        this.sprite.stop();
        this.sprite.onComplete = undefined;
        this.sprite.textures = this.getTextures(state);
        this.sprite.loop = true;
        this.sprite.animationSpeed = speed;
        this.sprite.gotoAndPlay(0);
    }

    private playOnce(state: PlayerAnimationState, speed: number, returnToIdle = true): void {
        if (this.state === PlayerAnimationState.DEATH && state !== PlayerAnimationState.DEATH) return;
        this.state = state;
        this.sprite.stop();
        this.sprite.textures = this.getTextures(state);
        this.sprite.loop = false;
        this.sprite.animationSpeed = speed;
        this.sprite.onComplete = returnToIdle ? () => this.playIdle() : undefined;
        this.sprite.gotoAndPlay(0);
    }

    private getTextures(state: PlayerAnimationState): Texture[] {
        const selected = this.textures[state];
        const fallback = this.textures[PlayerAnimationState.IDLE];
        return [...(selected.length > 0 ? selected : fallback)];
    }
}

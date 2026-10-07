export interface AudioSettings {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
}

export type AudioCue = "normal_hit" | "crit" | "skill" | "boss_phase" | "button" |
    "craft" | "rare_craft" | "breakthrough" | "artifact_craft";

const AUDIO_PATHS: Readonly<Partial<Record<AudioCue | "gameplay_bgm" | "boss_bgm", string>>> = {
    normal_hit: AssetKeys.audio.normalHit,
    crit: AssetKeys.audio.critical,
    skill: AssetKeys.audio.skill,
    boss_phase: AssetKeys.audio.bossPhase,
    button: AssetKeys.audio.button,
    craft: AssetKeys.audio.craft,
    rare_craft: AssetKeys.audio.rareCraft,
    breakthrough: AssetKeys.audio.breakthrough,
    artifact_craft: AssetKeys.audio.artifactCraft,
    gameplay_bgm: AssetKeys.audio.gameplayBgm,
    boss_bgm: AssetKeys.audio.bossBgm,
};

export class AudioManager {
    private settings: AudioSettings;
    private music: HTMLAudioElement | null;

    constructor() {
        this.settings = { masterVolume: 0.8, musicVolume: 0.5, sfxVolume: 0.7, muted: false };
        this.music = null;
    }

    public getSettings(): AudioSettings { return { ...this.settings }; }

    public setSettings(settings: Partial<AudioSettings>): void {
        this.settings = {
            masterVolume: this.clamp(settings.masterVolume ?? this.settings.masterVolume),
            musicVolume: this.clamp(settings.musicVolume ?? this.settings.musicVolume),
            sfxVolume: this.clamp(settings.sfxVolume ?? this.settings.sfxVolume),
            muted: settings.muted ?? this.settings.muted,
        };
        this.applyMusicVolume();
    }

    public playSfx(cue: AudioCue): void {
        const path = AUDIO_PATHS[cue];
        if (!path || this.settings.muted || typeof Audio === "undefined") return;
        const audio = new Audio(path);
        audio.volume = this.settings.masterVolume * this.settings.sfxVolume;
        audio.play().catch(() => undefined);
    }

    public playMusic(boss: boolean): void {
        if (typeof Audio === "undefined") return;
        const path = AUDIO_PATHS[boss ? "boss_bgm" : "gameplay_bgm"];
        if (!path || this.music?.src.endsWith(path)) return;
        this.stopMusic();
        this.music = new Audio(path);
        this.music.loop = true;
        this.applyMusicVolume();
        this.music.play().catch(() => undefined);
    }

    public stopMusic(): void {
        this.music?.pause();
        this.music = null;
    }

    public destroy(): void { this.stopMusic(); }

    private applyMusicVolume(): void {
        if (this.music) {
            this.music.volume = this.settings.muted
                ? 0
                : this.settings.masterVolume * this.settings.musicVolume;
        }
    }

    private clamp(value: number): number {
        return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
    }
}
import { AssetKeys } from "../assets/AssetKeys";

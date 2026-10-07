export enum VfxQuality {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
}

export interface VisualSettings {
    vfxQuality: VfxQuality;
    reduceMotion: boolean;
    highContrast: boolean;
    uiScale: number;
}

export const DEFAULT_VISUAL_SETTINGS: Readonly<VisualSettings> = {
    vfxQuality: VfxQuality.HIGH,
    reduceMotion: false,
    highContrast: false,
    uiScale: 1,
};

export class VisualSettingsManager {
    private settings: VisualSettings;
    private version: number;

    constructor() {
        this.settings = { ...DEFAULT_VISUAL_SETTINGS };
        this.version = 0;
    }

    public getSettings(): VisualSettings { return { ...this.settings }; }
    public getVersion(): number { return this.version; }

    public setSettings(settings: Partial<VisualSettings>): void {
        const qualities = Object.values(VfxQuality);
        const quality = qualities.includes(settings.vfxQuality as VfxQuality)
            ? settings.vfxQuality as VfxQuality
            : this.settings.vfxQuality;
        const requestedScale = settings.uiScale ?? this.settings.uiScale;
        const allowedScales = [0.8, 0.9, 1, 1.1, 1.2];
        const uiScale = allowedScales.reduce((best, candidate) =>
            Math.abs(candidate - requestedScale) < Math.abs(best - requestedScale)
                ? candidate
                : best,
        );
        this.settings = {
            vfxQuality: quality,
            reduceMotion: settings.reduceMotion ?? this.settings.reduceMotion,
            highContrast: settings.highContrast ?? this.settings.highContrast,
            uiScale,
        };
        this.version += 1;
    }
}

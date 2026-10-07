import type { CultivationRealm } from "../cultivation/CultivationRealm";

export interface PrestigeSnapshot {
    realm: CultivationRealm;
    totalEquipmentEnhancement: number;
    artifactStars: number;
    techniqueLevels: number;
}

export interface PrestigePreview {
    available: boolean;
    legacyPoints: number;
    warning: string;
}

export class PrestigeFoundation {
    public createPreview(snapshot: PrestigeSnapshot): PrestigePreview {
        const score = snapshot.totalEquipmentEnhancement + snapshot.artifactStars * 3 +
            snapshot.techniqueLevels;
        return {
            available: false,
            legacyPoints: Math.max(0, Math.floor(score / 25)),
            warning: "Luân Hồi đang khóa trong production cho đến khi hoàn tất cân bằng.",
        };
    }
}

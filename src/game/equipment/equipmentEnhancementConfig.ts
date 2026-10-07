import { getCultivationRealmRank } from "../cultivation/CultivationRealm";
import type { CultivationRealm } from "../cultivation/CultivationRealm";
import { getEquipmentRarityRank } from "./EquipmentRarity";
import type { EquipmentRarity } from "./EquipmentRarity";

export const MAX_EQUIPMENT_ENHANCEMENT = 10;

export const EQUIPMENT_ENHANCEMENT_MULTIPLIER: ReadonlyArray<number> = [
    1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5,
];

export interface EquipmentEnhancementBaseCost {
    essence: number;
    spiritStone: number;
}

export const EQUIPMENT_ENHANCEMENT_BASE_COSTS: ReadonlyArray<EquipmentEnhancementBaseCost> = [
    { essence: 0, spiritStone: 0 },
    { essence: 2, spiritStone: 50 },
    { essence: 3, spiritStone: 80 },
    { essence: 5, spiritStone: 120 },
    { essence: 8, spiritStone: 200 },
    { essence: 12, spiritStone: 350 },
    { essence: 18, spiritStone: 600 },
    { essence: 25, spiritStone: 1000 },
    { essence: 32, spiritStone: 1800 },
    { essence: 40, spiritStone: 3000 },
    { essence: 50, spiritStone: 5000 },
];

export function getEnhancementMultiplier(level: number): number {
    const safeLevel = Math.min(MAX_EQUIPMENT_ENHANCEMENT, Math.max(0, Math.floor(level)));
    return EQUIPMENT_ENHANCEMENT_MULTIPLIER[safeLevel] ?? 1;
}

export function getEffectiveEquipmentStatValue(baseValue: number, level: number): number {
    return baseValue * getEnhancementMultiplier(level);
}

export function getEnhancementCostMultiplier(
    rarity: EquipmentRarity,
    realm: CultivationRealm,
): number {
    return (1 + (getEquipmentRarityRank(rarity) - 1) * 0.25) *
        (1 + (getCultivationRealmRank(realm) - 1) * 0.5);
}

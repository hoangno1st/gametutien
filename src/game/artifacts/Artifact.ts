import type { StatModifier } from "../stats/StatModifier";
import type { ArtifactRarity } from "./ArtifactRarity";

export enum ArtifactPassiveType {
    LOW_HP_ATTACK = "low_hp_attack",
    KILL_HEAL = "kill_heal",
    CULTIVATION_BONUS = "cultivation_bonus",
    BOSS_DAMAGE = "boss_damage",
}

export interface ArtifactPassiveDefinition {
    type: ArtifactPassiveType;
    baseValue: number;
    valuePerStar: number;
    threshold?: number;
    description: string;
}

export interface ArtifactDefinition {
    id: string;
    name: string;
    description: string;
    rarity: ArtifactRarity;
    baseModifiers: StatModifier[];
    passive: ArtifactPassiveDefinition;
}

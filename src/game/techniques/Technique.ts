import type { StatModifier } from "../stats/StatModifier";

export interface TechniqueMilestone {
    requiredLevel: number;
    modifiers: StatModifier[];
    description?: string;
    passiveEffect?: TechniquePassiveEffect;
    skillModifier?: TechniqueSkillModifier;
}

export enum TechniquePassiveEffectType {
    LOW_HP_REGEN_MULTIPLIER = "low_hp_regen_multiplier",
}

export interface TechniquePassiveEffect {
    type: TechniquePassiveEffectType;
    threshold: number;
    multiplier: number;
}

export interface TechniqueSkillModifier {
    skillId: string;
    damageMultiplier: number;
}

export interface TechniqueDefinition {
    id: string;
    name: string;
    description: string;
    maxLevel: number;
    milestones: TechniqueMilestone[];
}

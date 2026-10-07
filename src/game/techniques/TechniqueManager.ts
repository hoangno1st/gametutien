import type { PlayerStatSystem } from "../stats/PlayerStatSystem";
import type {
    TechniqueDefinition,
    TechniqueMilestone,
} from "./Technique";
import type { TechniqueState } from "./TechniqueState";
import type { Inventory } from "../inventory/Inventory";
import { MATERIAL_DATA } from "../materials/materialData";
import { StatModifierType } from "../stats/StatModifier";
import { StatType } from "../stats/StatType";
import { TechniquePassiveEffectType } from "./Technique";
import { getTechniqueUpgradeCost } from "./techniqueConfig";
import type { TechniqueUpgradeCost } from "./techniqueConfig";

export interface TechniqueEconomy {
    inventory: Inventory;
    getSpiritStone: () => number;
    spendSpiritStone: (amount: number) => boolean;
}

export interface TechniqueEntry {
    definition: TechniqueDefinition;
    state: TechniqueState;
}

export class TechniqueManager {
    private statSystem: PlayerStatSystem;
    private syncResourceLimits: () => void;
    private definitions: Map<string, TechniqueDefinition>;
    private states: Map<string, TechniqueState>;
    private version: number;
    private economy: TechniqueEconomy | null;
    private activeTransactions: Set<string>;

    constructor(
        statSystem: PlayerStatSystem,
        definitions: ReadonlyArray<TechniqueDefinition>,
        syncResourceLimits: () => void,
        economy: TechniqueEconomy | null = null,
    ) {
        this.statSystem = statSystem;
        this.syncResourceLimits = syncResourceLimits;
        this.definitions = new Map<string, TechniqueDefinition>();
        this.states = new Map<string, TechniqueState>();
        this.version = 0;
        this.economy = economy;
        this.activeTransactions = new Set<string>();

        for (const definition of definitions) {
            this.definitions.set(definition.id, definition);
            this.states.set(definition.id, {
                techniqueId: definition.id,
                learned: false,
                level: 0,
            });
        }
    }

    public learnTechnique(techniqueId: string): boolean {
        const definition = this.definitions.get(techniqueId);
        const state = this.states.get(techniqueId);

        if (!definition || !state || state.learned) {
            return false;
        }

        if (!this.consumeUpgradeCost(techniqueId, state.level)) return false;
        const previousLevel = state.level;

        state.learned = true;
        state.level = 1;
        this.applyNewMilestones(definition, previousLevel, state.level);
        this.syncResourceLimits();
        this.version += 1;

        return true;
    }

    public upgradeTechnique(techniqueId: string): boolean {
        const definition = this.definitions.get(techniqueId);
        const state = this.states.get(techniqueId);

        if (
            !definition ||
            !state?.learned ||
            state.level >= definition.maxLevel
        ) {
            return false;
        }

        if (!this.consumeUpgradeCost(techniqueId, state.level)) return false;

        const previousLevel = state.level;

        state.level += 1;
        this.applyNewMilestones(definition, previousLevel, state.level);
        this.syncResourceLimits();
        this.version += 1;

        return true;
    }

    public isLearned(techniqueId: string): boolean {
        return this.states.get(techniqueId)?.learned ?? false;
    }

    public getLevel(techniqueId: string): number {
        return this.states.get(techniqueId)?.level ?? 0;
    }

    public getTechniqueState(
        techniqueId: string,
    ): TechniqueState | null {
        const state = this.states.get(techniqueId);

        return state ? { ...state } : null;
    }

    public getTechniqueDefinition(
        techniqueId: string,
    ): TechniqueDefinition | null {
        return this.definitions.get(techniqueId) ?? null;
    }

    public getAllTechniques(): TechniqueEntry[] {
        const entries: TechniqueEntry[] = [];

        for (const definition of this.definitions.values()) {
            const state = this.states.get(definition.id);

            if (state) {
                entries.push({
                    definition,
                    state: { ...state },
                });
            }
        }

        return entries;
    }

    public applyActiveMilestones(techniqueId: string): boolean {
        const definition = this.definitions.get(techniqueId);
        const state = this.states.get(techniqueId);

        if (!definition || !state?.learned) {
            return false;
        }

        this.applyNewMilestones(definition, 0, state.level);
        this.syncResourceLimits();

        return true;
    }

    public getVersion(): number {
        return this.version;
    }

    public getUpgradeCost(techniqueId: string): TechniqueUpgradeCost | null {
        const definition = this.definitions.get(techniqueId);
        const state = this.states.get(techniqueId);
        if (!definition || !state || state.level >= definition.maxLevel) return null;
        return getTechniqueUpgradeCost(state.level);
    }

    public canUpgrade(techniqueId: string): boolean {
        const cost = this.getUpgradeCost(techniqueId);
        if (!cost || this.activeTransactions.has(techniqueId)) return false;
        if (!this.economy) return false;
        return this.economy.inventory.hasItem(MATERIAL_DATA.TECHNIQUE_FRAGMENT.id, cost.fragments) &&
            this.economy.getSpiritStone() >= cost.spiritStone;
    }

    public getSkillDamageMultiplier(skillId: string, baseMultiplier: number): number {
        let multiplier = baseMultiplier;
        for (const definition of this.definitions.values()) {
            const state = this.states.get(definition.id);
            if (!state?.learned) continue;
            for (const milestone of definition.milestones) {
                if (state.level >= milestone.requiredLevel && milestone.skillModifier?.skillId === skillId) {
                    multiplier = milestone.skillModifier.damageMultiplier;
                }
            }
        }
        return multiplier;
    }

    public updateCombatPassives(hpRatio: number): void {
        const modifierId = "technique:passive:low-hp-regen";
        let bonus = 0;
        for (const definition of this.definitions.values()) {
            const state = this.states.get(definition.id);
            if (!state?.learned) continue;
            for (const milestone of definition.milestones) {
                const passive = milestone.passiveEffect;
                if (state.level >= milestone.requiredLevel &&
                    passive?.type === TechniquePassiveEffectType.LOW_HP_REGEN_MULTIPLIER &&
                    hpRatio <= passive.threshold) {
                    bonus = Math.max(bonus, passive.multiplier - 1);
                }
            }
        }
        if (bonus > 0) {
            this.statSystem.addModifier({
                id: modifierId,
                source: "technique:passive",
                stat: StatType.HP_REGEN,
                type: StatModifierType.PERCENT,
                value: bonus,
            });
        } else {
            this.statSystem.removeModifier(modifierId);
        }
    }

    public restoreStates(
        savedStates: ReadonlyArray<TechniqueState>,
    ): void {
        this.removeAllMilestoneModifiers();

        for (const [techniqueId] of this.definitions) {
            this.states.set(techniqueId, {
                techniqueId,
                learned: false,
                level: 0,
            });
        }

        for (const savedState of savedStates) {
            const definition = this.definitions.get(savedState.techniqueId);
            const state = this.states.get(savedState.techniqueId);

            if (!definition || !state) {
                continue;
            }

            state.learned = savedState.learned;
            state.level = savedState.learned
                ? Math.min(Math.max(Math.floor(savedState.level), 1), definition.maxLevel)
                : 0;

            if (state.learned) {
                this.applyNewMilestones(definition, 0, state.level);
            }
        }

        this.syncResourceLimits();
        this.version += 1;
    }

    public reset(): void {
        this.restoreStates([]);
    }

    private applyNewMilestones(
        definition: TechniqueDefinition,
        previousLevel: number,
        currentLevel: number,
    ): void {
        for (const milestone of definition.milestones) {
            if (
                milestone.requiredLevel > previousLevel &&
                milestone.requiredLevel <= currentLevel
            ) {
                this.applyMilestone(definition, milestone);
            }
        }
    }

    private applyMilestone(
        definition: TechniqueDefinition,
        milestone: TechniqueMilestone,
    ): void {
        milestone.modifiers.forEach((modifier, index) => {
            this.statSystem.addModifier({
                ...modifier,
                id:
                    `technique:${definition.id}:milestone:` +
                    `${milestone.requiredLevel}:${index}`,
                source: `technique:${definition.id}`,
            });
        });
    }

    private removeAllMilestoneModifiers(): void {
        for (const definition of this.definitions.values()) {
            for (const milestone of definition.milestones) {
                milestone.modifiers.forEach((_modifier, index) => {
                    this.statSystem.removeModifier(
                        `technique:${definition.id}:milestone:` +
                        `${milestone.requiredLevel}:${index}`,
                    );
                });
            }
        }
    }

    private consumeUpgradeCost(techniqueId: string, currentLevel: number): boolean {
        if (!this.economy || this.activeTransactions.has(techniqueId)) return false;
        const cost = getTechniqueUpgradeCost(currentLevel);
        if (!this.canUpgrade(techniqueId)) return false;
        this.activeTransactions.add(techniqueId);
        try {
            if (!this.economy.spendSpiritStone(cost.spiritStone)) return false;
            if (!this.economy.inventory.removeItem(
                MATERIAL_DATA.TECHNIQUE_FRAGMENT.id,
                cost.fragments,
            )) {
                return false;
            }
            return true;
        } finally {
            this.activeTransactions.delete(techniqueId);
        }
    }
}

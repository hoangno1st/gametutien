import type { EnemyArchetype } from "./EnemyArchetype";

export interface EnemyVisualConfig {
    color: number;
    scale: number;
    animationKeys?: Partial<Record<"idle" | "move" | "attack" | "hit" | "death" | "skill", string>>;
}

export interface EnemyCombatTraits {
    poisonDamagePercent?: number;
    burstChance?: number;
    burstMultiplier?: number;
    summonChance?: number;
    damageReduction?: number;
}

export interface ChapterAvailability {
    minChapter: number;
    maxChapter: number;
}

export interface EnemyDefinition {
    id: string;
    name: string;
    archetype: EnemyArchetype;
    baseHp: number;
    baseAttack: number;
    baseMoveSpeed: number;
    baseAttackInterval: number;
    attackRange: number;
    isBoss: boolean;
    lootTableId: string;
    chapterAvailability: ChapterAvailability;
    visualConfig?: EnemyVisualConfig;
    combatTraits?: EnemyCombatTraits;
}

export interface ChapterEnemyPool {
    chapter: number;
    enemies: ReadonlyArray<EnemyDefinition>;
    boss: EnemyDefinition;
}

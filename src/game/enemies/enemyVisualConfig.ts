import { EnemyArchetype } from "./EnemyArchetype";
import type { EnemyVisualConfig } from "./EnemyDefinition";

export const ENEMY_ARCHETYPE_VISUALS: Readonly<Record<EnemyArchetype, EnemyVisualConfig>> = {
    [EnemyArchetype.BALANCED]: { color: 0xc95b5b, scale: 1 },
    [EnemyArchetype.SWIFT]: { color: 0x58a6a6, scale: 0.9 },
    [EnemyArchetype.TANK]: { color: 0x7a718c, scale: 1.15 },
    [EnemyArchetype.BERSERKER]: { color: 0xb83245, scale: 1.08 },
};

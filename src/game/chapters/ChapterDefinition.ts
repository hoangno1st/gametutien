import type { CultivationRealm } from "../cultivation/CultivationRealm";

export interface ChapterDefinition {
    id: string;
    chapter: number;
    name: string;
    recommendedRealm: CultivationRealm;
    enemyPool: ReadonlyArray<string>;
    bossId: string;
    materialTier: number;
    spiritStoneMultiplier: number;
    enemyStatMultiplier: number;
    backgroundKey: string;
    identity: string;
}

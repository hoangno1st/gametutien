export interface TechniqueUpgradeCost {
    fragments: number;
    spiritStone: number;
    nextLevel: number;
}

export function getTechniqueUpgradeCost(currentLevel: number): TechniqueUpgradeCost {
    const nextLevel = Math.max(1, Math.floor(currentLevel) + 1);
    return {
        nextLevel,
        fragments: Math.max(1, Math.ceil(nextLevel * 0.5)),
        spiritStone: 50 * nextLevel + 10 * nextLevel * nextLevel,
    };
}

export const BalanceConfig = {
    combat: { playerDamageMultiplier: 1, enemyHpMultiplier: 1 },
    loot: { dropMultiplier: 1 },
    crafting: { costMultiplier: 1 },
    alchemy: { costMultiplier: 1 },
    equipment: { statMultiplier: 1 },
    artifact: { passiveMultiplier: 1 },
    technique: { costMultiplier: 1 },
    cultivation: { speedMultiplier: 1 },
    offline: { efficiency: 0.75 },
} as const;

export const DebugBalanceConfig = {
    damageMultiplier: 1,
    dropMultiplier: 1,
    cultivationSpeedMultiplier: 1,
    enemyHpMultiplier: 1,
};

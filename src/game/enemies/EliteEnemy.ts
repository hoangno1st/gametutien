export enum EliteAffix {
    FEROCIOUS = "ferocious",
    TOUGH = "tough",
    SWIFT = "swift",
}

export interface EliteAffixDefinition {
    hpMultiplier: number;
    attackMultiplier: number;
    moveSpeedMultiplier: number;
    label: string;
    auraColor: number;
}

export const ELITE_AFFIX_CONFIG: Readonly<Record<EliteAffix, EliteAffixDefinition>> = {
    [EliteAffix.FEROCIOUS]: { hpMultiplier: 1, attackMultiplier: 1.3, moveSpeedMultiplier: 1, label: "Hung Bạo", auraColor: 0xef4444 },
    [EliteAffix.TOUGH]: { hpMultiplier: 1.5, attackMultiplier: 1, moveSpeedMultiplier: 0.9, label: "Kiên Cố", auraColor: 0xeab308 },
    [EliteAffix.SWIFT]: { hpMultiplier: 0.9, attackMultiplier: 1.1, moveSpeedMultiplier: 1.4, label: "Tật Tốc", auraColor: 0x22d3ee },
};

export const ELITE_SPAWN_CHANCE = 0.05;

export function rollEliteAffix(random: () => number = Math.random): EliteAffix {
    const values = Object.values(EliteAffix);
    return values[Math.floor(random() * values.length)] ?? EliteAffix.FEROCIOUS;
}

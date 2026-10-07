import { CATALYST_DEFINITIONS } from "../crafting/catalystData";
import { RarityRoller } from "../crafting/RarityRoller";
import type { RarityDistribution } from "../crafting/RarityRoller";

export interface CatalystRarityReport {
    catalystId: string;
    rarityLuck: number;
    iterations: number;
    distribution: RarityDistribution;
}

export function runRarityMonteCarlo(
    iterations = 100_000,
    random: () => number = Math.random,
): ReadonlyArray<CatalystRarityReport> {
    const safeIterations = Math.max(1, Math.floor(iterations));
    const roller = new RarityRoller(random);
    const cases = [
        { id: "none", luck: 0 },
        ...CATALYST_DEFINITIONS.map((catalyst) => ({
            id: catalyst.id,
            luck: catalyst.rarityLuckBonus,
        })),
    ];

    return cases.map((entry) => ({
        catalystId: entry.id,
        rarityLuck: entry.luck,
        iterations: safeIterations,
        distribution: roller.simulate(entry.luck, safeIterations),
    }));
}

import type { CraftingRecipe } from "../crafting/CraftingRecipe";
import type { BossCatalystDropTable } from "../loot/catalystDropConfig";
import type { LootTable } from "../loot/LootTable";

export interface ExpectedDrop {
    itemId: string;
    expectedQuantity: number;
}

export interface EconomyReport {
    materialsPer100Kills: ReadonlyArray<ExpectedDrop>;
    catalystsPerBoss: ReadonlyArray<ExpectedDrop>;
    expectedCraftAttempts: number;
}

export function createEconomyReport(
    lootTable: LootTable,
    catalystTable: BossCatalystDropTable,
    recipe: CraftingRecipe,
): EconomyReport {
    const materialsPer100Kills = lootTable.entries.map((entry) => ({
        itemId: entry.itemId,
        expectedQuantity: entry.chance * (entry.minQuantity + entry.maxQuantity) * 50,
    }));
    const totalCatalystWeight = catalystTable.entries.reduce(
        (total, entry) => total + Math.max(0, entry.weight), 0,
    );
    const catalystsPerBoss = catalystTable.entries.map((entry) => ({
        itemId: entry.catalystId,
        expectedQuantity: totalCatalystWeight > 0
            ? catalystTable.dropChance * Math.max(0, entry.weight) / totalCatalystWeight
            : 0,
    }));
    const availableByItem = new Map(
        materialsPer100Kills.map((entry) => [entry.itemId, entry.expectedQuantity]),
    );
    const attemptsByRequirement = recipe.materials.map((requirement) =>
        (availableByItem.get(requirement.itemId) ?? 0) / Math.max(1, requirement.quantity),
    );

    return {
        materialsPer100Kills,
        catalystsPerBoss,
        expectedCraftAttempts: attemptsByRequirement.length > 0
            ? Math.min(...attemptsByRequirement)
            : 0,
    };
}

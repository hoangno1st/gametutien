import { ARTIFACT_DATA } from "../artifacts/artifactData";
import { ASSET_MANIFEST_BY_KEY } from "../assets/AssetManifest";
import { getBossForChapter } from "../bosses/bossData";
import { CHAPTER_DEFINITIONS } from "../chapters/chapterData";
import { CRAFTING_RECIPES } from "../crafting/craftingData";
import { CraftingType } from "../crafting/CraftingType";
import { CULTIVATION_REALM_ORDER } from "../cultivation/cultivationConfig";
import { ENEMY_DATA, getEnemyDefinitionById } from "../enemies/enemyData";
import { EQUIPMENT_DATA } from "../equipment/equipmentData";
import { EquipmentRarity } from "../equipment/EquipmentRarity";
import { SLOT_STAT_POOLS } from "../equipment/equipmentConfig";
import { LOOT_TABLE_DATA } from "../loot/lootTableData";
import { MATERIAL_DEFINITIONS } from "../materials/materialData";
import { PILL_DEFINITIONS } from "../alchemy/pillData";
import { StatType } from "../stats/StatType";
import { runSaveMigrationAudit } from "../qa/SaveMigrationAudit";

export interface GameDataValidationReport {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export function validateGameData(): GameDataValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    const checkDuplicates = (label: string, ids: ReadonlyArray<string>): void => {
        const seen = new Set<string>();
        ids.forEach((id) => seen.has(id)
            ? errors.push(`${label}: ID trùng ${id}`)
            : seen.add(id));
    };

    const enemies = Object.values(ENEMY_DATA);
    const equipment = Object.values(EQUIPMENT_DATA);
    checkDuplicates("Enemy", enemies.map((entry) => entry.id));
    checkDuplicates("Equipment", equipment.map((entry) => entry.id));
    checkDuplicates("Recipe", CRAFTING_RECIPES.map((entry) => entry.id));
    checkDuplicates("Material", MATERIAL_DEFINITIONS.map((entry) => entry.id));
    checkDuplicates("Artifact", ARTIFACT_DATA.map((entry) => entry.id));

    const materialIds = new Set(MATERIAL_DEFINITIONS.map((entry) => entry.id));
    const equipmentIds = new Set(equipment.map((entry) => entry.id));
    const pillIds = new Set(PILL_DEFINITIONS.map((entry) => entry.id));
    enemies.forEach((enemy) => {
        if (!LOOT_TABLE_DATA[enemy.lootTableId]) {
            errors.push(`Enemy ${enemy.id}: thiếu lootTable ${enemy.lootTableId}`);
        }
    });
    CRAFTING_RECIPES.forEach((recipe) => {
        recipe.materials.forEach((material) => {
            if (!materialIds.has(material.itemId)) errors.push(`Recipe ${recipe.id}: thiếu material ${material.itemId}`);
        });
        const outputExists = recipe.type === CraftingType.EQUIPMENT
            ? equipmentIds.has(recipe.outputId)
            : pillIds.has(recipe.outputId);
        if (!outputExists) errors.push(`Recipe ${recipe.id}: thiếu output ${recipe.outputId}`);
        if (recipe.requiredRealm && !CULTIVATION_REALM_ORDER.includes(recipe.requiredRealm)) {
            errors.push(`Recipe ${recipe.id}: realm không hợp lệ`);
        }
    });
    CHAPTER_DEFINITIONS.forEach((chapter) => {
        chapter.enemyPool.forEach((id) => {
            if (!getEnemyDefinitionById(id)) errors.push(`Chapter ${chapter.chapter}: thiếu enemy ${id}`);
        });
        if (getBossForChapter(chapter.chapter).enemy.id !== chapter.bossId) {
            errors.push(`Chapter ${chapter.chapter}: bossId không khớp ${chapter.bossId}`);
        }
        if (!ASSET_MANIFEST_BY_KEY.has(chapter.backgroundKey)) {
            warnings.push(`Chapter ${chapter.chapter}: chưa khai báo asset ${chapter.backgroundKey}`);
        }
    });
    ARTIFACT_DATA.forEach((artifact) => {
        if (!Object.values(EquipmentRarity).includes(artifact.rarity as unknown as EquipmentRarity)) {
            errors.push(`Artifact ${artifact.id}: rarity không hợp lệ`);
        }
    });
    Object.entries(SLOT_STAT_POOLS).forEach(([slot, stats]) => {
        if (stats.length === 0 || stats.some((stat) => !Object.values(StatType).includes(stat))) {
            errors.push(`Stat pool ${slot}: không hợp lệ`);
        }
    });
    runSaveMigrationAudit().forEach((migration) => {
        if (!migration.passed) {
            errors.push(
                `Save migration v${migration.sourceVersion}: ${migration.reason ?? "failed"}`,
            );
        }
    });

    const report = { valid: errors.length === 0, errors, warnings };
    if (import.meta.env.DEV) {
        errors.forEach((message) => console.error(`[DataValidator] ${message}`));
        warnings.forEach((message) => console.warn(`[DataValidator] ${message}`));
        if (report.valid) console.info("[DataValidator] Dữ liệu game hợp lệ");
    }
    return report;
}

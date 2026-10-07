import { CATALYST_DATA } from "../crafting/catalystData";
import type { CultivationSystem } from "../cultivation/CultivationSystem";
import type { Inventory } from "../inventory/Inventory";
import { MATERIAL_DATA, MATERIAL_DEFINITIONS } from "../materials/materialData";

export enum RareStageEventType {
    TREASURE = "treasure",
    SPIRIT_BEAST = "spirit_beast",
    CULTIVATION_OPPORTUNITY = "cultivation_opportunity",
}

export interface RareStageEventResult {
    type: RareStageEventType;
    title: string;
    description: string;
}

export interface RareStageEventDependencies {
    inventory: Inventory;
    cultivationSystem: CultivationSystem;
    addSpiritStone: (amount: number) => void;
}

export class RareStageEventSystem {
    private dependencies: RareStageEventDependencies;
    private random: () => number;

    constructor(dependencies: RareStageEventDependencies, random: () => number = Math.random) {
        this.dependencies = dependencies;
        this.random = random;
    }

    public rollAndApply(chapter: number): RareStageEventResult | null {
        if (this.random() >= 0.06) return null;
        const roll = this.random();
        if (roll < 0.34) return this.applyTreasure(chapter);
        if (roll < 0.67) return this.applySpiritBeast(chapter);
        return this.applyCultivationOpportunity(chapter);
    }

    private applyTreasure(chapter: number): RareStageEventResult {
        const stones = 100 * Math.max(1, chapter);
        this.dependencies.addSpiritStone(stones);
        this.dependencies.inventory.addItem(CATALYST_DATA.LOW_GRADE_FORTUNE_STONE, 1);
        return { type: RareStageEventType.TREASURE, title: "Kỳ Ngộ: Kho Báu", description: `Nhận ${stones} Linh Thạch và Tụ Vận Thạch.` };
    }

    private applySpiritBeast(chapter: number): RareStageEventResult {
        const tierMaterial = MATERIAL_DEFINITIONS.find((material) => material.tier === chapter) ??
            MATERIAL_DATA.MONSTER_CORE;
        this.dependencies.inventory.addItem(tierMaterial, 3);
        this.dependencies.inventory.addItem(MATERIAL_DATA.TECHNIQUE_FRAGMENT, 1);
        return { type: RareStageEventType.SPIRIT_BEAST, title: "Kỳ Ngộ: Linh Thú", description: `Nhận 3 ${tierMaterial.name} và 1 Tàn Trang Công Pháp.` };
    }

    private applyCultivationOpportunity(chapter: number): RareStageEventResult {
        const amount = this.dependencies.cultivationSystem.addCultivation(
            this.dependencies.cultivationSystem.getRequiredCultivation() * (0.08 + chapter * 0.01),
        );
        return {
            type: RareStageEventType.CULTIVATION_OPPORTUNITY,
            title: "Kỳ Ngộ: Linh Khí Hội Tụ",
            description: `Nhận ${amount.toFixed(2)} Tu Vi. Không tự động Đột Phá.`,
        };
    }
}

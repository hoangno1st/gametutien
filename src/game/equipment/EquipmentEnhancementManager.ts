import type { Inventory } from "../inventory/Inventory";
import { MATERIAL_DATA } from "../materials/materialData";
import type { EquipmentManager } from "./EquipmentManager";
import {
    EQUIPMENT_ENHANCEMENT_BASE_COSTS,
    getEnhancementCostMultiplier,
    MAX_EQUIPMENT_ENHANCEMENT,
} from "./equipmentEnhancementConfig";

export interface EquipmentEnhancementCost {
    essence: number;
    spiritStone: number;
    nextLevel: number;
}

export interface EquipmentEnhancementDependencies {
    inventory: Inventory;
    equipmentManager: EquipmentManager;
    getSpiritStone: () => number;
    spendSpiritStone: (amount: number) => boolean;
    refundSpiritStone: (amount: number) => void;
}

export class EquipmentEnhancementManager {
    private dependencies: EquipmentEnhancementDependencies;
    private activeTransactions: Set<string>;

    constructor(dependencies: EquipmentEnhancementDependencies) {
        this.dependencies = dependencies;
        this.activeTransactions = new Set<string>();
    }

    public getEnhancementCost(instanceId: string): EquipmentEnhancementCost | null {
        const equipment = this.dependencies.inventory.getEquipmentInstance(instanceId);
        if (!equipment || equipment.enhancementLevel >= MAX_EQUIPMENT_ENHANCEMENT) return null;
        const nextLevel = equipment.enhancementLevel + 1;
        const base = EQUIPMENT_ENHANCEMENT_BASE_COSTS[nextLevel];
        if (!base) return null;
        const multiplier = getEnhancementCostMultiplier(
            equipment.rarity,
            equipment.definition.requiredRealm,
        );
        return {
            essence: Math.ceil(base.essence * multiplier),
            spiritStone: Math.ceil(base.spiritStone * multiplier),
            nextLevel,
        };
    }

    public canEnhance(instanceId: string): boolean {
        const cost = this.getEnhancementCost(instanceId);
        return Boolean(cost && !this.activeTransactions.has(instanceId) &&
            this.dependencies.inventory.hasItem(MATERIAL_DATA.EQUIPMENT_ESSENCE.id, cost.essence) &&
            this.dependencies.getSpiritStone() >= cost.spiritStone);
    }

    public enhance(instanceId: string): boolean {
        if (!this.canEnhance(instanceId)) return false;
        const equipment = this.dependencies.inventory.getEquipmentInstance(instanceId);
        const cost = this.getEnhancementCost(instanceId);
        if (!equipment || !cost) return false;
        this.activeTransactions.add(instanceId);
        try {
            if (!this.dependencies.spendSpiritStone(cost.spiritStone)) return false;
            if (!this.dependencies.inventory.removeItem(MATERIAL_DATA.EQUIPMENT_ESSENCE.id, cost.essence)) {
                this.dependencies.refundSpiritStone(cost.spiritStone);
                return false;
            }
            equipment.enhancementLevel = cost.nextLevel;
            if (!this.dependencies.inventory.replaceEquipmentInstance(equipment)) {
                this.dependencies.inventory.addItem(MATERIAL_DATA.EQUIPMENT_ESSENCE, cost.essence);
                this.dependencies.refundSpiritStone(cost.spiritStone);
                return false;
            }
            this.dependencies.equipmentManager.refreshEquippedItemModifiers(equipment);
            return true;
        } finally {
            this.activeTransactions.delete(instanceId);
        }
    }
}

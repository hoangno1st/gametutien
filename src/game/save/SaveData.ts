import type { CultivationRealm } from "../cultivation/CultivationRealm";
import type { CultivationStage } from "../cultivation/CultivationStage";
import type { EquipmentRarity } from "../equipment/EquipmentRarity";
import type { EquipmentSlot } from "../equipment/EquipmentSlot";
import type { StatModifierType } from "../stats/StatModifier";
import type { StatType } from "../stats/StatType";
import type { QuestState } from "../quests/Quest";
import type { AchievementState } from "../achievements/AchievementManager";
import type { DailyTaskState } from "../daily/DailyTaskManager";
import type { AudioSettings } from "../audio/AudioManager";
import type { TutorialState } from "../tutorial/TutorialManager";
import type { VisualSettings } from "../settings/VisualSettings";

export interface ProgressSaveData {
    chapter: number;
    stage: number;
}

export interface CurrencySaveData {
    spiritStone: number;
}

export interface InventoryItemSaveData {
    itemId: string;
    quantity: number;
}

export interface PillStackSaveData {
    definitionId: string;
    rarity: EquipmentRarity;
    quantity: number;
}

export interface RolledStatSaveData {
    stat: StatType;
    type: StatModifierType;
    value: number;
}

export interface EquipmentInstanceSaveData {
    instanceId: string;
    definitionId: string;
    rarity: EquipmentRarity;
    rolledStats: RolledStatSaveData[];
    unlockedStatLineCount: number;
    lockedStatIndices: number[];
    enhancementLevel: number;
}

export interface InventorySaveData {
    items: InventoryItemSaveData[];
    pills: PillStackSaveData[];
    equipmentInstances: EquipmentInstanceSaveData[];
}

export interface EquipmentSaveData {
    equippedBySlot: Partial<Record<EquipmentSlot, string>>;
}

export interface ArtifactStateSaveData {
    artifactId: string;
    fragmentCount: number;
    owned: boolean;
    star: number;
}

export interface ArtifactSaveData {
    states: ArtifactStateSaveData[];
    equippedArtifactId: string | null;
}

export interface TechniqueStateSaveData {
    techniqueId: string;
    learned: boolean;
    level: number;
}

export interface TechniqueSaveData {
    states: TechniqueStateSaveData[];
}

export interface CultivationSaveData {
    realm: CultivationRealm;
    stage: CultivationStage;
    layer: number;
    cultivation: number;
}

export interface SkillStateSaveData {
    skillId: string;
    unlocked: boolean;
    level: number;
    autoCastEnabled: boolean;
}

export interface SkillSaveData {
    states: SkillStateSaveData[];
}

export interface GameSaveData {
    version: number;
    createdAt: number;
    updatedAt: number;
    progress: ProgressSaveData;
    currency: CurrencySaveData;
    inventory: InventorySaveData;
    equipment: EquipmentSaveData;
    artifacts: ArtifactSaveData;
    techniques: TechniqueSaveData;
    cultivation: CultivationSaveData;
    skills: SkillSaveData;
    quests: { states: QuestState[] };
    achievements: { states: AchievementState[] };
    daily: { dayKey: string; states: DailyTaskState[] };
    settings: { audio: AudioSettings; visual: VisualSettings };
    tutorial: TutorialState;
}

export interface SaveLoadResult {
    success: boolean;
    reason?: string;
    version?: number;
}

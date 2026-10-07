import type { ArtifactManager } from "../artifacts/ArtifactManager";
import type { BuffManager } from "../buffs/BuffManager";
import { CATALYST_DEFINITIONS } from "../crafting/catalystData";
import type { CultivationSystem } from "../cultivation/CultivationSystem";
import type { Player } from "../entities/Player";
import type { EquipmentInstance } from "../equipment/EquipmentInstance";
import type { EquipmentManager } from "../equipment/EquipmentManager";
import { EquipmentRarity } from "../equipment/EquipmentRarity";
import { EQUIPMENT_DATA } from "../equipment/equipmentData";
import { EQUIPMENT_SLOTS } from "./saveLookups";
import type { Inventory } from "../inventory/Inventory";
import type { ItemDefinition } from "../items/Item";
import { ITEM_DATA } from "../items/itemData";
import { MATERIAL_DEFINITIONS } from "../materials/materialData";
import { PILL_DEFINITIONS } from "../alchemy/pillData";
import type { SkillManager } from "../skills/SkillManager";
import { StatModifierType } from "../stats/StatModifier";
import { StatType } from "../stats/StatType";
import type { StageSystem } from "../systems/StageSystem";
import type { TechniqueManager } from "../techniques/TechniqueManager";
import {
    AUTOSAVE_INTERVAL_SECONDS,
    SAVE_DEBOUNCE_SECONDS,
    SAVE_STORAGE_KEY,
} from "./saveConfig";
import type {
    ArtifactStateSaveData,
    EquipmentInstanceSaveData,
    GameSaveData,
    SaveLoadResult,
} from "./SaveData";
import { migrateSaveData } from "./SaveMigration";
import { CURRENT_SAVE_VERSION } from "./SaveVersion";
import type { QuestManager } from "../quests/QuestManager";
import type { AchievementManager } from "../achievements/AchievementManager";
import type { DailyTaskManager } from "../daily/DailyTaskManager";
import type { AudioManager } from "../audio/AudioManager";
import type { TutorialManager } from "../tutorial/TutorialManager";
import type { VisualSettingsManager } from "../settings/VisualSettings";
import { LocalSaveStorageAdapter } from "./storage/LocalSaveStorageAdapter";
import type { SyncSaveStorageAdapter } from "./storage/SaveStorageAdapter";

export interface SaveManagerDependencies {
    stageSystem: StageSystem;
    inventory: Inventory;
    equipmentManager: EquipmentManager;
    artifactManager: ArtifactManager;
    techniqueManager: TechniqueManager;
    cultivationSystem: CultivationSystem;
    skillManager: SkillManager;
    buffManager: BuffManager;
    player: Player;
    getSpiritStone: () => number;
    setSpiritStone: (amount: number) => void;
    questManager: QuestManager;
    achievementManager: AchievementManager;
    dailyTaskManager: DailyTaskManager;
    audioManager: AudioManager;
    tutorialManager: TutorialManager;
    visualSettingsManager: VisualSettingsManager;
}

export class SaveManager {
    private dependencies: SaveManagerDependencies;
    private storageAdapter: SyncSaveStorageAdapter;
    private createdAt: number;
    private lastSavedAt: number | null;
    private autosaveElapsed: number;
    private debounceElapsed: number;
    private dirty: boolean;
    private automaticSaveBlocked: boolean;
    private lastFingerprint: string;
    private itemDefinitions: Map<string, ItemDefinition>;
    private pageHideHandler: () => void;
    private visibilityHandler: () => void;

    constructor(
        dependencies: SaveManagerDependencies,
        storage: Storage | SyncSaveStorageAdapter | null = SaveManager.getDefaultStorage(),
    ) {
        this.dependencies = dependencies;
        this.storageAdapter = SaveManager.toStorageAdapter(storage);
        this.createdAt = 0;
        this.lastSavedAt = null;
        this.autosaveElapsed = 0;
        this.debounceElapsed = 0;
        this.dirty = false;
        this.automaticSaveBlocked = false;
        this.itemDefinitions = new Map();

        for (const definition of [
            ...Object.values(ITEM_DATA),
            ...MATERIAL_DEFINITIONS,
            ...CATALYST_DEFINITIONS,
        ]) {
            this.itemDefinitions.set(definition.id, definition);
        }

        this.lastFingerprint = this.createImportantStateFingerprint();
        this.pageHideHandler = () => {
            this.saveAutomatically();
        };
        this.visibilityHandler = () => {
            if (typeof document !== "undefined" && document.hidden) {
                this.saveAutomatically();
            }
        };

        if (typeof window !== "undefined") {
            window.addEventListener("pagehide", this.pageHideHandler);
        }

        if (typeof document !== "undefined") {
            document.addEventListener("visibilitychange", this.visibilityHandler);
        }
    }

    public createSaveData(): GameSaveData {
        const now = Date.now();

        if (this.createdAt <= 0) {
            this.createdAt = now;
        }

        const {
            stageSystem,
            inventory,
            equipmentManager,
            artifactManager,
            techniqueManager,
            cultivationSystem,
            skillManager,
        } = this.dependencies;
        const equippedBySlot: GameSaveData["equipment"]["equippedBySlot"] = {};

        for (const slot of EQUIPMENT_SLOTS) {
            const equipment = equipmentManager.getEquippedItem(slot);

            if (equipment) {
                equippedBySlot[slot] = equipment.instanceId;
            }
        }

        return {
            version: CURRENT_SAVE_VERSION,
            createdAt: this.createdAt,
            updatedAt: now,
            progress: {
                chapter: stageSystem.getChapter(),
                stage: stageSystem.getStage(),
            },
            currency: {
                spiritStone: this.dependencies.getSpiritStone(),
            },
            inventory: {
                items: inventory.getItems()
                    .filter((entry) => entry.quantity > 0)
                    .map((entry) => ({
                        itemId: entry.item.id,
                        quantity: entry.quantity,
                    })),
                pills: inventory.getPillStacks()
                    .filter((stack) => stack.quantity > 0)
                    .map((stack) => ({ ...stack })),
                equipmentInstances: inventory.getEquipmentInstances().map(
                    (equipment) => ({
                        instanceId: equipment.instanceId,
                        definitionId: equipment.definition.id,
                        rarity: equipment.rarity,
                        unlockedStatLineCount: equipment.unlockedStatLineCount,
                        lockedStatIndices: [...equipment.lockedStatIndices],
                        enhancementLevel: equipment.enhancementLevel,
                        rolledStats: equipment.rolledStats.map((modifier) => ({
                            stat: modifier.stat,
                            type: modifier.type,
                            value: modifier.value,
                        })),
                    }),
                ),
            },
            equipment: { equippedBySlot },
            artifacts: {
                states: artifactManager.getAllArtifactStates().map((state) => ({
                    artifactId: state.artifactId,
                    fragmentCount: state.fragmentCount,
                    owned: state.owned,
                    star: state.star,
                })),
                equippedArtifactId:
                    artifactManager.getEquippedArtifact()?.id ?? null,
            },
            techniques: {
                states: techniqueManager.getAllTechniques().map(
                    ({ state }) => ({ ...state }),
                ),
            },
            cultivation: {
                realm: cultivationSystem.getRealm(),
                stage: cultivationSystem.getStage(),
                layer: cultivationSystem.getLayer(),
                cultivation: cultivationSystem.getCultivation(),
            },
            skills: {
                states: skillManager.getAllSkills().map(({ state }) => ({
                    skillId: state.skillId,
                    unlocked: state.unlocked,
                    level: state.level,
                    autoCastEnabled: state.autoCastEnabled,
                })),
            },
            quests: { states: this.dependencies.questManager.getStates() },
            achievements: { states: this.dependencies.achievementManager.getStates() },
            daily: {
                dayKey: this.dependencies.dailyTaskManager.getDayKey(),
                states: this.dependencies.dailyTaskManager.getStates(),
            },
            settings: {
                audio: this.dependencies.audioManager.getSettings(),
                visual: this.dependencies.visualSettingsManager.getSettings(),
            },
            tutorial: this.dependencies.tutorialManager.getState(),
        };
    }

    public save(): boolean {
        try {
            const data = this.createSaveData();

            this.storageAdapter.saveSync(JSON.stringify(data));
            this.lastSavedAt = data.updatedAt;
            this.dirty = false;
            this.debounceElapsed = 0;
            this.autosaveElapsed = 0;
            this.lastFingerprint = this.createImportantStateFingerprint();
            this.automaticSaveBlocked = false;
            return true;
        } catch (error) {
            console.warn("Failed to save game data", error);
            return false;
        }
    }

    public load(): SaveLoadResult {
        let serialized: string | null;

        try {
            serialized = this.storageAdapter.loadSync();
        } catch (error) {
            console.warn("Failed to read save data", error);
            return { success: false, reason: "Failed to read save data" };
        }

        if (!serialized) {
            return { success: false, reason: "No save data" };
        }

        let parsed: unknown;

        try {
            parsed = JSON.parse(serialized);
        } catch (error) {
            console.warn("Failed to parse save data", error);
            this.automaticSaveBlocked = true;
            return { success: false, reason: "Failed to parse save data" };
        }

        const migration = migrateSaveData(parsed);

        if (!migration.success || !migration.data) {
            console.warn(migration.reason ?? "Failed to migrate save data");
            this.automaticSaveBlocked = true;
            return migration;
        }

        if (!this.hasValidRootSections(migration.data)) {
            console.warn("Invalid save structure");
            this.automaticSaveBlocked = true;
            return { success: false, reason: "Invalid save structure" };
        }

        try {
            this.restore(migration.data);
            this.createdAt = Number.isFinite(migration.data.createdAt)
                ? migration.data.createdAt
                : Date.now();
            this.lastSavedAt = Number.isFinite(migration.data.updatedAt)
                ? migration.data.updatedAt
                : null;
            this.dirty = false;
            this.debounceElapsed = 0;
            this.autosaveElapsed = 0;
            this.lastFingerprint = this.createImportantStateFingerprint();
            this.automaticSaveBlocked = false;
            return { success: true, version: migration.data.version };
        } catch (error) {
            console.warn("Failed to restore save data", error);
            this.automaticSaveBlocked = true;
            return { success: false, reason: "Failed to restore save data" };
        }
    }

    public update(deltaSeconds: number): void {
        if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
            return;
        }

        const fingerprint = this.createImportantStateFingerprint();

        if (fingerprint !== this.lastFingerprint) {
            this.lastFingerprint = fingerprint;
            this.requestSave();
        }

        this.autosaveElapsed += deltaSeconds;

        if (this.dirty) {
            this.debounceElapsed += deltaSeconds;

            if (this.debounceElapsed >= SAVE_DEBOUNCE_SECONDS) {
                this.saveAutomatically();
                return;
            }
        }

        if (this.autosaveElapsed >= AUTOSAVE_INTERVAL_SECONDS) {
            this.saveAutomatically();
        }
    }

    public requestSave(): void {
        if (!this.dirty) {
            this.dirty = true;
            this.debounceElapsed = 0;
        }
    }

    public hasSave(): boolean {
        try {
            return Boolean(this.storageAdapter.loadSync());
        } catch {
            return false;
        }
    }

    public deleteSave(): void {
        try {
            this.storageAdapter.deleteSync();
            this.lastSavedAt = null;
            this.automaticSaveBlocked = false;
        } catch (error) {
            console.warn("Failed to delete save data", error);
        }
    }

    public exportSaveJson(): string | null {
        try {
            return JSON.stringify(this.createSaveData(), null, 2);
        } catch (error) {
            console.warn("Failed to export save data", error);
            return null;
        }
    }

    public blockAutomaticSave(): void {
        this.automaticSaveBlocked = true;
        this.dirty = false;
    }

    public importSaveJson(serialized: string): SaveLoadResult {
        let parsed: unknown;
        try {
            parsed = JSON.parse(serialized);
        } catch {
            return { success: false, reason: "JSON không hợp lệ" };
        }
        const migration = migrateSaveData(parsed);
        if (!migration.success || !migration.data || !this.hasValidRootSections(migration.data)) {
            return { success: false, reason: migration.reason ?? "Cấu trúc save không hợp lệ" };
        }
        try {
            this.restore(migration.data);
            this.createdAt = Number.isFinite(migration.data.createdAt)
                ? migration.data.createdAt
                : Date.now();
            this.automaticSaveBlocked = false;
            if (!this.save()) return { success: false, reason: "Không thể ghi save" };
            return { success: true, version: CURRENT_SAVE_VERSION };
        } catch (error) {
            console.warn("Failed to import save data", error);
            return { success: false, reason: "Không thể khôi phục save" };
        }
    }

    public resetPersistentProgress(): void {
        this.deleteSave();
        this.clearPermanentRuntimeState();
        this.dependencies.inventory.clear();
        this.dependencies.cultivationSystem.reset();
        this.dependencies.skillManager.reset();
        this.dependencies.questManager.reset();
        this.dependencies.achievementManager.reset();
        this.dependencies.dailyTaskManager.reset();
        this.dependencies.tutorialManager.reset();
        this.dependencies.stageSystem.reset();
        this.dependencies.setSpiritStone(0);
        this.dependencies.player.restoreFullResources();
        this.createdAt = 0;
        this.dirty = false;
        this.automaticSaveBlocked = false;
        this.autosaveElapsed = 0;
        this.debounceElapsed = 0;
        this.lastFingerprint = this.createImportantStateFingerprint();
    }

    public getLastSavedAt(): number | null {
        return this.lastSavedAt;
    }

    public destroy(): void {
        if (typeof window !== "undefined") {
            window.removeEventListener("pagehide", this.pageHideHandler);
        }

        if (typeof document !== "undefined") {
            document.removeEventListener("visibilitychange", this.visibilityHandler);
        }
    }

    private restore(data: GameSaveData): void {
        const {
            inventory,
            cultivationSystem,
            equipmentManager,
            artifactManager,
            techniqueManager,
            skillManager,
            stageSystem,
            player,
        } = this.dependencies;

        this.clearPermanentRuntimeState();
        inventory.clear();

        for (const savedItem of data.inventory.items) {
            if (!this.isPositiveFiniteQuantity(savedItem.quantity)) {
                continue;
            }

            const definition = this.itemDefinitions.get(savedItem.itemId);

            if (!definition) {
                console.warn(`Missing item definition: ${savedItem.itemId}`);
                continue;
            }

            inventory.addItem(definition, savedItem.quantity);
        }

        const pillIds = new Set(PILL_DEFINITIONS.map((pill) => pill.id));

        for (const savedPill of data.inventory.pills) {
            if (
                !pillIds.has(savedPill.definitionId) ||
                !this.isEquipmentRarity(savedPill.rarity) ||
                !this.isPositiveFiniteQuantity(savedPill.quantity)
            ) {
                console.warn(`Invalid pill stack: ${savedPill.definitionId}`);
                continue;
            }

            inventory.addPill(
                savedPill.definitionId,
                savedPill.rarity,
                savedPill.quantity,
            );
        }

        for (const savedEquipment of data.inventory.equipmentInstances) {
            const equipment = this.restoreEquipmentInstance(savedEquipment);

            if (equipment) {
                inventory.addEquipmentInstance(equipment);
            }
        }

        const cultivation = data.cultivation;
        const cultivationRestored = cultivationSystem.restoreProgress(
            cultivation.realm,
            cultivation.stage,
            cultivation.layer,
            cultivation.cultivation,
        );

        if (!cultivationRestored) {
            console.warn("Invalid cultivation save data; reset to default");
            cultivationSystem.reset();
        }

        for (const slot of EQUIPMENT_SLOTS) {
            const instanceId = data.equipment.equippedBySlot[slot];
            const equipment = instanceId
                ? inventory.getEquipmentInstance(instanceId)
                : null;

            if (instanceId && !equipment) {
                console.warn(`Missing equipped instance: ${instanceId}`);
                continue;
            }

            if (equipment && equipment.definition.slot === slot) {
                equipmentManager.equip(equipment);
            }
        }

        const artifactStates = data.artifacts.states.filter((state) => {
            if (!artifactManager.getArtifactDefinition(state.artifactId)) {
                console.warn(`Missing artifact definition: ${state.artifactId}`);
                return false;
            }

            return this.isValidArtifactState(state);
        });
        artifactManager.restoreStates(
            artifactStates,
            data.artifacts.equippedArtifactId,
        );

        const techniqueStates = data.techniques.states.filter((state) => {
            if (!techniqueManager.getTechniqueDefinition(state.techniqueId)) {
                console.warn(`Missing technique definition: ${state.techniqueId}`);
                return false;
            }

            return Number.isFinite(state.level);
        });
        techniqueManager.restoreStates(techniqueStates);

        const skillStates = data.skills.states.filter((state) => {
            if (!skillManager.getSkillDefinition(state.skillId)) {
                console.warn(`Missing skill definition: ${state.skillId}`);
                return false;
            }

            return Number.isFinite(state.level);
        });
        skillManager.restoreStates(skillStates);
        skillManager.resetCooldowns();
        this.dependencies.questManager.restore(data.quests.states);
        this.dependencies.achievementManager.restore(data.achievements.states);
        this.dependencies.dailyTaskManager.restore(data.daily.dayKey, data.daily.states);
        this.dependencies.audioManager.setSettings(data.settings.audio);
        this.dependencies.visualSettingsManager.setSettings(data.settings.visual);
        this.dependencies.tutorialManager.restore(data.tutorial);

        if (!stageSystem.restoreProgress(
            data.progress.chapter,
            data.progress.stage,
        )) {
            console.warn("Invalid stage progress; reset to Chapter 1 Stage 1");
            stageSystem.reset();
        }

        this.dependencies.setSpiritStone(
            Number.isFinite(data.currency.spiritStone)
                ? Math.max(0, Math.floor(data.currency.spiritStone))
                : 0,
        );
        player.restoreFullResources();
    }

    private saveAutomatically(): boolean {
        return !this.automaticSaveBlocked && this.save();
    }

    private clearPermanentRuntimeState(): void {
        const {
            buffManager,
            equipmentManager,
            artifactManager,
            techniqueManager,
            player,
        } = this.dependencies;

        buffManager.clear();
        equipmentManager.clearEquipped();
        artifactManager.reset();
        techniqueManager.reset();
        player.getStatSystem().clearModifiers();
    }

    private restoreEquipmentInstance(
        saved: EquipmentInstanceSaveData,
    ): EquipmentInstance | null {
        const definition = Object.values(EQUIPMENT_DATA).find(
            (candidate) => candidate.id === saved.definitionId,
        );

        if (!definition) {
            console.warn(`Missing equipment definition: ${saved.definitionId}`);
            return null;
        }

        if (
            typeof saved.instanceId !== "string" ||
            saved.instanceId.length === 0 ||
            !this.isEquipmentRarity(saved.rarity) ||
            !Number.isFinite(saved.unlockedStatLineCount) ||
            !Number.isFinite(saved.enhancementLevel) ||
            !Array.isArray(saved.rolledStats) ||
            !Array.isArray(saved.lockedStatIndices)
        ) {
            console.warn(`Invalid equipment instance: ${saved.definitionId}`);
            return null;
        }

        const rolledStats = saved.rolledStats.flatMap((modifier, index) => {
            if (
                !Object.values(StatType).includes(modifier.stat) ||
                !Object.values(StatModifierType).includes(modifier.type) ||
                !Number.isFinite(modifier.value)
            ) {
                console.warn(`Invalid equipment stat: ${saved.instanceId}:${index}`);
                return [];
            }

            return [{
                id: `equipment:${saved.instanceId}:${index}`,
                stat: modifier.stat,
                type: modifier.type,
                value: modifier.value,
                source: `equipment:${saved.instanceId}`,
            }];
        });
        const lockedStatIndices = Array.from(new Set(
            saved.lockedStatIndices.filter((index) =>
                Number.isInteger(index) && index >= 0 && index < rolledStats.length,
            ),
        )).sort((left, right) => left - right);

        return {
            instanceId: saved.instanceId,
            definition,
            rarity: saved.rarity,
            rolledStats,
            unlockedStatLineCount: Math.max(
                0,
                Math.floor(saved.unlockedStatLineCount),
            ),
            lockedStatIndices,
            enhancementLevel: Math.min(
                10,
                Math.max(0, Math.floor(saved.enhancementLevel)),
            ),
        };
    }

    private createImportantStateFingerprint(): string {
        const {
            stageSystem,
            inventory,
            equipmentManager,
            artifactManager,
            techniqueManager,
            cultivationSystem,
            skillManager,
        } = this.dependencies;

        return [
            stageSystem.getChapter(),
            stageSystem.getStage(),
            this.dependencies.getSpiritStone(),
            inventory.getVersion(),
            equipmentManager.getVersion(),
            artifactManager.getVersion(),
            techniqueManager.getVersion(),
            cultivationSystem.getRealm(),
            cultivationSystem.getStage(),
            cultivationSystem.getLayer(),
            skillManager.getVersion(),
            this.dependencies.questManager.getVersion(),
            this.dependencies.tutorialManager.getVersion(),
        ].join("|");
    }

    private hasValidRootSections(data: GameSaveData): boolean {
        return this.isRecord(data.progress) &&
            this.isRecord(data.currency) &&
            this.isRecord(data.inventory) &&
            Array.isArray(data.inventory.items) &&
            Array.isArray(data.inventory.pills) &&
            Array.isArray(data.inventory.equipmentInstances) &&
            this.isRecord(data.equipment) &&
            this.isRecord(data.equipment.equippedBySlot) &&
            this.isRecord(data.artifacts) &&
            Array.isArray(data.artifacts.states) &&
            this.isRecord(data.techniques) &&
            Array.isArray(data.techniques.states) &&
            this.isRecord(data.cultivation) &&
            this.isRecord(data.skills) &&
            Array.isArray(data.skills.states) &&
            this.isRecord(data.quests) &&
            Array.isArray(data.quests.states) &&
            this.isRecord(data.achievements) &&
            Array.isArray(data.achievements.states) &&
            this.isRecord(data.daily) &&
            Array.isArray(data.daily.states) &&
            this.isRecord(data.settings) &&
            this.isRecord(data.settings.audio) &&
            this.isRecord(data.settings.visual) &&
            this.isRecord(data.tutorial);
    }

    private isValidArtifactState(state: ArtifactStateSaveData): boolean {
        return Number.isFinite(state.fragmentCount) &&
            state.fragmentCount >= 0 &&
            typeof state.owned === "boolean" &&
            Number.isFinite(state.star);
    }

    private isPositiveFiniteQuantity(quantity: number): boolean {
        return Number.isFinite(quantity) && quantity > 0;
    }

    private isEquipmentRarity(value: unknown): value is EquipmentRarity {
        return Object.values(EquipmentRarity).includes(value as EquipmentRarity);
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }

    private static getDefaultStorage(): Storage | null {
        try {
            return typeof localStorage === "undefined" ? null : localStorage;
        } catch {
            return null;
        }
    }

    private static toStorageAdapter(
        storage: Storage | SyncSaveStorageAdapter | null,
    ): SyncSaveStorageAdapter {
        if (
            storage &&
            typeof (storage as Partial<SyncSaveStorageAdapter>).loadSync === "function"
        ) {
            return storage as SyncSaveStorageAdapter;
        }

        return new LocalSaveStorageAdapter(storage as Storage | null, SAVE_STORAGE_KEY);
    }
}

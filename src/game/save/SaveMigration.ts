import type { GameSaveData, SaveLoadResult } from "./SaveData";
import { CURRENT_SAVE_VERSION } from "./SaveVersion";

export type SaveMigrationResult = SaveLoadResult & {
    data?: GameSaveData;
};

export function migrateSaveData(rawData: unknown): SaveMigrationResult {
    if (!isRecord(rawData) || !Number.isInteger(rawData.version)) {
        return { success: false, reason: "Invalid save structure" };
    }

    const version = rawData.version as number;

    if (version > CURRENT_SAVE_VERSION) {
        return {
            success: false,
            reason: `Unsupported future save version: ${version}`,
            version,
        };
    }

    if (version >= 1 && version <= 7) {
        return migrateLegacySave(rawData, version);
    }

    if (version !== CURRENT_SAVE_VERSION) {
        return {
            success: false,
            reason: `No migration path for save version: ${version}`,
            version,
        };
    }

    return {
        success: true,
        version: CURRENT_SAVE_VERSION,
        data: rawData as unknown as GameSaveData,
    };
}

function migrateLegacySave(
    rawData: Record<string, unknown>,
    version: number,
): SaveMigrationResult {
    const inventory = isRecord(rawData.inventory)
        ? rawData.inventory
        : null;
    const instances = inventory && Array.isArray(inventory.equipmentInstances)
        ? inventory.equipmentInstances
        : null;

    if (!inventory || !instances) {
        return {
            success: false,
            reason: `Invalid version ${version} equipment data`,
            version,
        };
    }

    const migratedInstances = instances.map((instance) => {
        if (!isRecord(instance)) {
            return instance;
        }

        return {
            ...instance,
            lockedStatIndices: version === 1 ? [] : instance.lockedStatIndices,
            enhancementLevel: version < 3 ? 0 : instance.enhancementLevel,
        };
    });
    const artifacts = isRecord(rawData.artifacts) ? rawData.artifacts : null;
    const artifactStates = artifacts && Array.isArray(artifacts.states)
        ? artifacts.states.map((state) => isRecord(state)
            ? { ...state, star: Number.isFinite(state.star) ? state.star : state.level ?? 1 }
            : state)
        : [];
    const migrated = {
        ...rawData,
        version: CURRENT_SAVE_VERSION,
        inventory: {
            ...inventory,
            equipmentInstances: migratedInstances,
        },
        artifacts: artifacts
            ? { ...artifacts, states: artifactStates }
            : rawData.artifacts,
        quests: isRecord(rawData.quests) ? rawData.quests : { states: [] },
        achievements: isRecord(rawData.achievements)
            ? rawData.achievements
            : { states: [] },
        daily: isRecord(rawData.daily)
            ? rawData.daily
            : { dayKey: "", states: [] },
        settings: isRecord(rawData.settings)
            ? {
                ...rawData.settings,
                visual: isRecord(rawData.settings.visual)
                    ? rawData.settings.visual
                    : { vfxQuality: "high", reduceMotion: false, highContrast: false, uiScale: 1 },
            }
            : {
                audio: { masterVolume: 0.8, musicVolume: 0.5, sfxVolume: 0.7, muted: false },
                visual: { vfxQuality: "high", reduceMotion: false, highContrast: false, uiScale: 1 },
            },
        tutorial: isRecord(rawData.tutorial)
            ? rawData.tutorial
            : { tutorialCompleted: false, currentStep: 0 },
    };

    return {
        success: true,
        version: CURRENT_SAVE_VERSION,
        data: migrated as unknown as GameSaveData,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

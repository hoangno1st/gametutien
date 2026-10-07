import { migrateSaveData } from "../save/SaveMigration";
import { CURRENT_SAVE_VERSION } from "../save/SaveVersion";

export interface SaveMigrationAuditResult {
    sourceVersion: number;
    passed: boolean;
    reason?: string;
}

export function runSaveMigrationAudit(): ReadonlyArray<SaveMigrationAuditResult> {
    return Array.from({ length: CURRENT_SAVE_VERSION }, (_, index) => index + 1)
        .map((sourceVersion) => {
            const result = migrateSaveData(createFixture(sourceVersion));
            return {
                sourceVersion,
                passed: result.success && result.version === CURRENT_SAVE_VERSION,
                ...(result.reason ? { reason: result.reason } : {}),
            };
        });
}

function createFixture(version: number): Record<string, unknown> {
    return {
        version,
        createdAt: 1,
        updatedAt: 1,
        progress: { chapter: 1, stage: 1 },
        currency: { spiritStone: 0 },
        inventory: { items: [], pills: [], equipmentInstances: [] },
        equipment: { equippedBySlot: {} },
        artifacts: { states: [], equippedArtifactId: null },
        techniques: { states: [] },
        cultivation: { realm: "qi_refining", stage: "early", layer: 1, cultivation: 0 },
        skills: { states: [] },
        quests: { states: [] },
        achievements: { states: [] },
        daily: { dayKey: "", states: [] },
        settings: {
            audio: { masterVolume: 0.8, musicVolume: 0.5, sfxVolume: 0.7, muted: false },
            visual: { vfxQuality: "high", reduceMotion: false, highContrast: false, uiScale: 1 },
        },
        tutorial: { tutorialCompleted: false, currentStep: 0 },
    };
}

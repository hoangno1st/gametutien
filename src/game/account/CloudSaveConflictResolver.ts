import { CloudSaveChoice } from "./AccountModels";
import type { CloudSaveConflict, SaveSummary } from "./AccountModels";

export function detectCloudSaveConflict(
    local: SaveSummary,
    cloud: SaveSummary,
): CloudSaveConflict | null {
    return local.updatedAt === cloud.updatedAt ? null : { local, cloud };
}

export function chooseNewestSave(conflict: CloudSaveConflict): CloudSaveChoice | null {
    if (conflict.local.updatedAt === conflict.cloud.updatedAt) return null;
    return conflict.local.updatedAt > conflict.cloud.updatedAt
        ? CloudSaveChoice.LOCAL
        : CloudSaveChoice.CLOUD;
}

export function formatConflictChoice(conflict: CloudSaveConflict): string {
    const format = (label: string, save: SaveSummary) =>
        `${label}: ${new Date(save.updatedAt).toLocaleString("vi-VN")} | Chương ${save.chapter} | ${save.realm}`;
    return `${format("Save trên thiết bị", conflict.local)}\n${format("Save trên Cloud", conflict.cloud)}`;
}

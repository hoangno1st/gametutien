import { AssetKeys } from "./AssetKeys";

export type AssetCategory = "characters" | "enemies" | "bosses" | "equipment" |
    "artifacts" | "skills" | "ui" | "effects" | "backgrounds" | "audio";

export interface GameAssetEntry {
    key: string;
    category: AssetCategory;
    src: string;
    optional: boolean;
}

const playerEntries = Object.entries(AssetKeys.characters.player).flatMap(
    ([animation, frames]) => frames.map((src, index) => ({
        key: `player_${animation}_${index}`,
        category: "characters" as const,
        src,
        optional: false,
    })),
);

const audioEntries = Object.entries(AssetKeys.audio).map(([key, src]) => ({
    key: `audio_${key}`,
    category: "audio" as const,
    src,
    optional: true,
}));

export const ASSET_MANIFEST: ReadonlyArray<GameAssetEntry> = [
    ...playerEntries,
    ...audioEntries,
    ...Object.values(AssetKeys.backgrounds).map((key) => ({
        key,
        category: "backgrounds" as const,
        src: `/assets/backgrounds/${key}.webp`,
        optional: true,
    })),
];

export const ASSET_MANIFEST_BY_KEY: ReadonlyMap<string, GameAssetEntry> =
    new Map(ASSET_MANIFEST.map((entry) => [entry.key, entry]));

import { CultivationRealm } from "../cultivation/CultivationRealm";
import type { ChapterDefinition } from "./ChapterDefinition";

const REALMS: ReadonlyArray<CultivationRealm> = [
    CultivationRealm.QI_REFINING,
    CultivationRealm.FOUNDATION_ESTABLISHMENT,
    CultivationRealm.GOLDEN_CORE,
    CultivationRealm.NASCENT_SOUL,
    CultivationRealm.SOUL_TRANSFORMATION,
    CultivationRealm.VOID_REFINING,
    CultivationRealm.BODY_INTEGRATION,
    CultivationRealm.MAHAYANA,
    CultivationRealm.TRIBULATION,
];

const CHAPTER_THEMES = [
    ["Thanh Phong Sơn Mạch", "Thanh Phong Lang Vương"],
    ["Huyền Âm Cốc", "Huyền Âm Chu Hậu"],
    ["Liệt Hỏa Sơn", "Xích Viêm Ma Viên"],
    ["Vạn Cốt Uyên", "Bạch Cốt Ma Tướng"],
    ["Thiên Lôi Vực", "Lôi Đình Yêu Vương"],
    ["Hư Không Cảnh", "Hư Không Thú"],
    ["Thái Cổ Chiến Trường", "Thái Cổ Ma Tướng"],
    ["Đại Hoang", "Hoang Cổ Long Thú"],
    ["Thiên Kiếp Chi Địa", "Cửu Tiêu Lôi Long"],
] as const;

const CHAPTER_IDENTITIES = [
    "Yêu lang nhanh nhẹn",
    "Độc âm bào mòn sinh lực",
    "Sát thương bộc phát cao",
    "Triệu hồi bạch cốt",
    "Lôi đình bạo phát",
    "Khiên Hư Không giảm sát thương",
    "Cuồng chiến tăng tốc",
    "Cổ thú có sức bền cao",
    "Thiên kiếp đa cơ chế",
] as const;

export const CHAPTER_DEFINITIONS: ReadonlyArray<ChapterDefinition> =
    CHAPTER_THEMES.map(([name], index) => {
        const chapter = index + 1;
        return {
            id: `chapter_${chapter}`,
            chapter,
            name,
            recommendedRealm: REALMS[index],
            enemyPool: chapter === 1
                ? ["green_wind_wolf", "fire_spirit_snake", "iron_shell_beetle", "blood_frenzy_wolf"]
                : [1, 2, 3, 4].map((enemy) => `chapter_${chapter}_enemy_${enemy}`),
            bossId: chapter === 1 ? "green_wind_wolf_king" : `chapter_${chapter}_boss`,
            materialTier: chapter,
            spiritStoneMultiplier: 1 + index * 0.75,
            enemyStatMultiplier: Math.pow(2.1, index),
            backgroundKey: `chapter_${chapter}_background`,
            identity: CHAPTER_IDENTITIES[index],
        };
    });

export const CHAPTER_BOSS_NAMES: ReadonlyArray<string> =
    CHAPTER_THEMES.map(([, bossName]) => bossName);

export function getChapterDefinition(chapter: number): ChapterDefinition {
    const safeIndex = Math.min(
        CHAPTER_DEFINITIONS.length - 1,
        Math.max(0, Math.floor(chapter) - 1),
    );
    return CHAPTER_DEFINITIONS[safeIndex];
}

export const MAX_CHAPTER = CHAPTER_DEFINITIONS.length;

import { ENEMY_DATA } from "../enemies/enemyData";
import type { BossDefinition } from "./BossDefinition";
import { BossSkillType } from "./BossSkill";
import { CHAPTER_DEFINITIONS } from "../chapters/chapterData";
import { getChapterEnemyPool } from "../enemies/enemyData";

export const BOSS_SKILL_IDS = {
    RAGE_CLAW: "rage_claw",
    WOLF_KING_ROAR: "wolf_king_roar",
} as const;

export const BOSS_DATA = {
    GREEN_WIND_WOLF_KING: {
        enemy: ENEMY_DATA.GREEN_WIND_WOLF_KING,
        minimumSkillGap: 1,
        phases: [
            {
                id: "phase_1",
                hpThreshold: 1,
                attackMultiplier: 1,
                moveSpeedMultiplier: 1,
                attackSpeedMultiplier: 1,
                enabledSkillIds: [BOSS_SKILL_IDS.RAGE_CLAW],
            },
            {
                id: "phase_2",
                hpThreshold: 0.7,
                attackMultiplier: 1.2,
                moveSpeedMultiplier: 1.1,
                attackSpeedMultiplier: 1.15,
                enabledSkillIds: [
                    BOSS_SKILL_IDS.RAGE_CLAW,
                    BOSS_SKILL_IDS.WOLF_KING_ROAR,
                ],
            },
            {
                id: "phase_3",
                hpThreshold: 0.35,
                attackMultiplier: 1.4,
                moveSpeedMultiplier: 1.15,
                attackSpeedMultiplier: 1.35,
                enabledSkillIds: [
                    BOSS_SKILL_IDS.RAGE_CLAW,
                    BOSS_SKILL_IDS.WOLF_KING_ROAR,
                ],
                summonOnEnter: {
                    enemyId: ENEMY_DATA.GREEN_WIND_WOLF.id,
                    count: 2,
                },
            },
        ],
        skills: [
            {
                id: BOSS_SKILL_IDS.RAGE_CLAW,
                name: "Nộ Trảo",
                type: BossSkillType.HEAVY_ATTACK,
                cooldown: 6,
                initialCooldown: 3,
                damageMultiplier: 1.8,
                enabledFromPhase: "phase_1",
                priority: 50,
            },
            {
                id: BOSS_SKILL_IDS.WOLF_KING_ROAR,
                name: "Lang Vương Hống",
                type: BossSkillType.SELF_BUFF,
                cooldown: 10,
                initialCooldown: 3,
                enabledFromPhase: "phase_2",
                priority: 80,
                buffAttackMultiplier: 1.2,
                buffDuration: 5,
            },
        ],
    },
} as const satisfies Record<string, BossDefinition>;

const mechanicNames = [
    "Triệu Hồi Lang Quần",
    "Huyền Âm Độc Vụ",
    "Xích Viêm Trọng Kích",
    "Bạch Cốt Triệu Hoán",
    "Lôi Đình Bạo Phát",
    "Hư Không Hộ Thể",
    "Chiến Ý Cuồng Tăng",
    "Hoang Cổ Nộ Khí",
    "Cửu Tiêu Thiên Kiếp",
] as const;

const generatedBosses = new Map<number, BossDefinition>();
for (const chapter of CHAPTER_DEFINITIONS.slice(1)) {
    const pool = getChapterEnemyPool(chapter.chapter);
    const skillId = `chapter_${chapter.chapter}_signature`;
    const summonChapter = chapter.chapter === 4;
    const finalBoss = chapter.chapter === 9;
    generatedBosses.set(chapter.chapter, {
        enemy: pool.boss as BossDefinition["enemy"],
        minimumSkillGap: Math.max(0.6, 1.2 - chapter.chapter * 0.05),
        phases: [
            {
                id: "phase_1",
                hpThreshold: 1,
                attackMultiplier: 1,
                moveSpeedMultiplier: 1,
                attackSpeedMultiplier: 1,
                enabledSkillIds: [skillId],
            },
            {
                id: "phase_2",
                hpThreshold: finalBoss ? 0.7 : 0.5,
                attackMultiplier: chapter.chapter === 6 ? 0.75 : 1.25,
                moveSpeedMultiplier: 1.05,
                attackSpeedMultiplier: chapter.chapter === 7 ? 1.6 : 1.2,
                enabledSkillIds: [skillId],
                summonOnEnter: summonChapter
                    ? { enemyId: chapter.enemyPool[0], count: 3 }
                    : undefined,
            },
            ...(finalBoss ? [{
                id: "phase_3",
                hpThreshold: 0.3,
                attackMultiplier: 1.8,
                moveSpeedMultiplier: 1.2,
                attackSpeedMultiplier: 1.5,
                enabledSkillIds: [skillId],
            }] : []),
        ],
        skills: [{
            id: skillId,
            name: mechanicNames[chapter.chapter - 1],
            type: chapter.chapter === 6 || chapter.chapter === 7
                ? BossSkillType.SELF_BUFF
                : BossSkillType.HEAVY_ATTACK,
            cooldown: chapter.chapter === 2 || chapter.chapter === 5 ? 3 : 6,
            initialCooldown: 2,
            damageMultiplier: 1.3 + chapter.chapter * 0.1,
            buffAttackMultiplier: 1.15 + chapter.chapter * 0.03,
            buffDuration: 5,
            priority: 50,
        }],
    });
}

const BOSS_BY_CHAPTER: ReadonlyMap<number, BossDefinition> = new Map([
    [1, BOSS_DATA.GREEN_WIND_WOLF_KING],
    ...generatedBosses,
]);

export function getBossForChapter(chapter: number): BossDefinition {
    const exactBoss = BOSS_BY_CHAPTER.get(chapter);

    if (exactBoss) {
        return exactBoss;
    }

    const configuredChapters = [...BOSS_BY_CHAPTER.keys()]
        .filter((configuredChapter) => configuredChapter <= chapter)
        .sort((left, right) => right - left);
    const fallbackChapter = configuredChapters[0] ?? 1;
    const fallbackBoss = BOSS_BY_CHAPTER.get(fallbackChapter) ??
        BOSS_DATA.GREEN_WIND_WOLF_KING;

    console.warn(
        `Chưa có Boss cho Chương ${chapter}; dùng Boss Chương ${fallbackChapter}.`,
    );

    return fallbackBoss;
}

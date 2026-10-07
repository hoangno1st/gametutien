import type {
    ChapterEnemyPool,
    EnemyDefinition,
} from "./EnemyDefinition";
import { EnemyArchetype } from "./EnemyArchetype";
import { CHAPTER_BOSS_NAMES, CHAPTER_DEFINITIONS } from "../chapters/chapterData";

const CHAPTER_ONE_AVAILABILITY = {
    minChapter: 1,
    maxChapter: Number.POSITIVE_INFINITY,
} as const;

const BASE_ENEMY_DATA = {
    GREEN_WIND_WOLF: {
        id: "green_wind_wolf",
        name: "Thanh Phong Lang",
        archetype: EnemyArchetype.SWIFT,
        baseHp: 30,
        baseAttack: 4,
        baseMoveSpeed: 1.5,
        baseAttackInterval: 1.2,
        attackRange: 170,
        isBoss: false,
        lootTableId: "green_wind_wolf_loot",
        chapterAvailability: CHAPTER_ONE_AVAILABILITY,
    },
    FIRE_SPIRIT_SNAKE: {
        id: "fire_spirit_snake",
        name: "Hỏa Linh Xà",
        archetype: EnemyArchetype.BALANCED,
        baseHp: 30,
        baseAttack: 4,
        baseMoveSpeed: 1.5,
        baseAttackInterval: 1.2,
        attackRange: 170,
        isBoss: false,
        lootTableId: "fire_spirit_snake_loot",
        chapterAvailability: CHAPTER_ONE_AVAILABILITY,
    },
    IRON_SHELL_BEETLE: {
        id: "iron_shell_beetle",
        name: "Thiết Giáp Trùng",
        archetype: EnemyArchetype.TANK,
        baseHp: 30,
        baseAttack: 4,
        baseMoveSpeed: 1.5,
        baseAttackInterval: 1.2,
        attackRange: 170,
        isBoss: false,
        lootTableId: "iron_shell_beetle_loot",
        chapterAvailability: CHAPTER_ONE_AVAILABILITY,
    },
    BLOOD_FRENZY_WOLF: {
        id: "blood_frenzy_wolf",
        name: "Cuồng Huyết Lang",
        archetype: EnemyArchetype.BERSERKER,
        baseHp: 30,
        baseAttack: 4,
        baseMoveSpeed: 1.5,
        baseAttackInterval: 1.2,
        attackRange: 170,
        isBoss: false,
        lootTableId: "blood_frenzy_wolf_loot",
        chapterAvailability: CHAPTER_ONE_AVAILABILITY,
    },
    GREEN_WIND_WOLF_KING: {
        id: "green_wind_wolf_king",
        name: "Thanh Phong Lang Vương",
        archetype: EnemyArchetype.BALANCED,
        baseHp: 1000,
        baseAttack: 30,
        baseMoveSpeed: 1,
        baseAttackInterval: 1.2,
        attackRange: 170,
        isBoss: true,
        lootTableId: "green_wind_wolf_king_loot",
        chapterAvailability: CHAPTER_ONE_AVAILABILITY,
    },
} as const satisfies Record<string, EnemyDefinition>;

const GENERATED_ENEMIES: Record<string, EnemyDefinition> = {};
const archetypes = [
    EnemyArchetype.SWIFT,
    EnemyArchetype.BALANCED,
    EnemyArchetype.TANK,
    EnemyArchetype.BERSERKER,
] as const;
const enemySuffixes = ["Linh Thú", "Yêu Binh", "Hộ Vệ", "Cuồng Ma"] as const;
const chapterColors = [0x4f8f6a, 0x7154a3, 0xc74b2d, 0xa5a5b5, 0x4f86d9, 0x55708c, 0xa64832, 0x8c7548, 0x8c6ad1];
const chapterProfiles = [
    { hp: 1, attack: 1, speed: 1.15, interval: 0.9, traits: {} },
    { hp: 1, attack: 0.9, speed: 1, interval: 1, traits: { poisonDamagePercent: 0.015 } },
    { hp: 0.9, attack: 1.45, speed: 0.95, interval: 1.15, traits: { burstChance: 0.15, burstMultiplier: 1.5 } },
    { hp: 1.05, attack: 0.95, speed: 0.9, interval: 1.1, traits: { summonChance: 0.08 } },
    { hp: 1, attack: 1.1, speed: 1, interval: 1, traits: { burstChance: 0.2, burstMultiplier: 1.8 } },
    { hp: 1.2, attack: 0.9, speed: 0.85, interval: 1.15, traits: { damageReduction: 0.2 } },
    { hp: 1, attack: 1.2, speed: 1.2, interval: 0.72, traits: {} },
    { hp: 1.75, attack: 1, speed: 0.78, interval: 1.15, traits: { damageReduction: 0.1 } },
    { hp: 1.35, attack: 1.35, speed: 1.05, interval: 0.8, traits: { burstChance: 0.25, burstMultiplier: 2 } },
] as const;

for (const chapter of CHAPTER_DEFINITIONS.slice(1)) {
    const profile = chapterProfiles[chapter.chapter - 1];
    chapter.enemyPool.forEach((id, index) => {
        GENERATED_ENEMIES[id] = {
            id,
            name: `${chapter.name} ${enemySuffixes[index]}`,
            archetype: archetypes[index],
            baseHp: 30 * profile.hp,
            baseAttack: 4 * profile.attack,
            baseMoveSpeed: 1.5 * profile.speed,
            baseAttackInterval: 1.2 * profile.interval,
            attackRange: 170,
            isBoss: false,
            lootTableId: [
                "green_wind_wolf_loot",
                "fire_spirit_snake_loot",
                "iron_shell_beetle_loot",
                "blood_frenzy_wolf_loot",
            ][index],
            chapterAvailability: {
                minChapter: chapter.chapter,
                maxChapter: chapter.chapter,
            },
            visualConfig: { color: chapterColors[chapter.chapter - 1], scale: 1 },
            combatTraits: profile.traits,
        };
    });
    GENERATED_ENEMIES[chapter.bossId] = {
        id: chapter.bossId,
        name: CHAPTER_BOSS_NAMES[chapter.chapter - 1],
        archetype: EnemyArchetype.BALANCED,
        baseHp: 1000,
        baseAttack: 30,
        baseMoveSpeed: 1,
        baseAttackInterval: 1.2,
        attackRange: 170,
        isBoss: true,
        lootTableId: "green_wind_wolf_king_loot",
        chapterAvailability: {
            minChapter: chapter.chapter,
            maxChapter: chapter.chapter,
        },
    };
}

export const ENEMY_DATA = {
    ...BASE_ENEMY_DATA,
    ...GENERATED_ENEMIES,
};

export const CHAPTER_ENEMY_POOLS: ReadonlyArray<ChapterEnemyPool> = [
    {
        chapter: 1,
        enemies: [
            ENEMY_DATA.GREEN_WIND_WOLF,
            ENEMY_DATA.FIRE_SPIRIT_SNAKE,
            ENEMY_DATA.IRON_SHELL_BEETLE,
            ENEMY_DATA.BLOOD_FRENZY_WOLF,
        ],
        boss: ENEMY_DATA.GREEN_WIND_WOLF_KING,
    },
    ...CHAPTER_DEFINITIONS.slice(1).map((chapter) => ({
        chapter: chapter.chapter,
        enemies: chapter.enemyPool
            .map((id) => GENERATED_ENEMIES[id])
            .filter((enemy): enemy is EnemyDefinition => Boolean(enemy)),
        boss: GENERATED_ENEMIES[chapter.bossId],
    })),
];

export function getChapterEnemyPool(chapter: number): ChapterEnemyPool {
    const exactPool = CHAPTER_ENEMY_POOLS.find(
        (pool) => pool.chapter === chapter,
    );

    return exactPool ?? CHAPTER_ENEMY_POOLS[CHAPTER_ENEMY_POOLS.length - 1];
}

export function getEnemyDefinitionById(
    enemyId: string,
): EnemyDefinition | undefined {
    return Object.values(ENEMY_DATA).find(
        (definition) => definition.id === enemyId,
    );
}

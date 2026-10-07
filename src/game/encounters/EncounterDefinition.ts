import { ENEMY_DATA } from "../enemies/enemyData";

export type EncounterKind = "normal" | "elite" | "gauntlet" | "boss";

export interface EncounterWave {
    enemyIds: readonly string[];
    hpMultiplier?: number;
    attackMultiplier?: number;
    speedMultiplier?: number;
    spacing?: number;
}

export interface EncounterDefinition {
    chapter: number;
    stage: number;
    kind: EncounterKind;
    label: string;
    subtitle: string;
    waves: readonly EncounterWave[];
}

const WOLF = ENEMY_DATA.GREEN_WIND_WOLF.id;
const SNAKE = ENEMY_DATA.FIRE_SPIRIT_SNAKE.id;
const BEETLE = ENEMY_DATA.IRON_SHELL_BEETLE.id;
const BLOOD_WOLF = ENEMY_DATA.BLOOD_FRENZY_WOLF.id;

function cycle(stage: number, options: readonly string[], count: number): string[] {
    return Array.from({ length: count }, (_, index) =>
        options[(stage + index) % options.length],
    );
}

export function getEncounterDefinition(chapter: number, stage: number): EncounterDefinition {
    if (stage === 50) {
        return {
            chapter,
            stage,
            kind: "boss",
            label: chapter === 1 ? "Thanh Phong Lang Vương" : "Boss",
            subtitle: "Quyết chiến cuối chương",
            waves: [],
        };
    }

    if (chapter !== 1) {
        return {
            chapter,
            stage,
            kind: "normal",
            label: "Yêu Thú Hỗn Chiến",
            subtitle: "Yêu thú hỗn hợp",
            waves: [{ enemyIds: cycle(stage, [WOLF, SNAKE, BEETLE, BLOOD_WOLF], 4) }],
        };
    }

    if (stage <= 9) {
        return {
            chapter,
            stage,
            kind: "normal",
            label: stage <= 4 ? "Phong Lang Ngoại Vi" : "Linh Thú Sơn Cốc",
            subtitle: stage <= 4 ? "Nhập môn · làm quen nhịp chiến đấu" : "Nhập môn · đội hình linh hoạt hơn",
            waves: [{
                enemyIds: cycle(stage, [WOLF, SNAKE], stage >= 7 ? 4 : 3),
                hpMultiplier: stage <= 3 ? 0.9 : 1,
            }],
        };
    }

    if (stage === 10) {
        return {
            chapter,
            stage,
            kind: "elite",
            label: "Tinh Anh · Song Lang",
            subtitle: "Mốc 10 · kiểm tra sát thương đơn mục tiêu",
            waves: [{ enemyIds: [WOLF, WOLF], hpMultiplier: 1.6, attackMultiplier: 1.2 }],
        };
    }

    if (stage <= 19) {
        const lateTankBand = stage >= 15;
        return {
            chapter,
            stage,
            kind: "normal",
            label: "Thiết Giáp Địa Vực",
            subtitle: lateTankBand ? "Tank xuất hiện dày hơn · cần xuyên qua tuyến trước" : "Thiết Giáp Trùng gia nhập đội hình",
            waves: [{
                enemyIds: lateTankBand
                    ? cycle(stage, [BEETLE, WOLF, BEETLE, SNAKE], 4)
                    : cycle(stage, [WOLF, SNAKE, BEETLE], 4),
                hpMultiplier: lateTankBand ? 1.05 : 1,
            }],
        };
    }

    if (stage === 20) {
        return {
            chapter,
            stage,
            kind: "elite",
            label: "Tinh Anh · Thiết Giáp Trùng",
            subtitle: "Mốc 20 · bài kiểm tra chống chịu",
            waves: [{ enemyIds: [BEETLE], hpMultiplier: 2.6, attackMultiplier: 1.35 }],
        };
    }

    if (stage <= 29) {
        const frenzyBand = stage >= 25;
        return {
            chapter,
            stage,
            kind: "normal",
            label: "Cuồng Huyết Lâm",
            subtitle: frenzyBand ? "Berserker áp đảo · ưu tiên mục tiêu nguy hiểm" : "Cuồng Huyết Lang bắt đầu săn theo bầy",
            waves: [{
                enemyIds: frenzyBand
                    ? cycle(stage, [BLOOD_WOLF, BEETLE, BLOOD_WOLF, SNAKE, WOLF], 5)
                    : cycle(stage, [SNAKE, BLOOD_WOLF, BEETLE, WOLF], 4),
                attackMultiplier: frenzyBand ? 1.06 : 1,
            }],
        };
    }

    if (stage === 30) {
        return {
            chapter,
            stage,
            kind: "elite",
            label: "Tinh Anh · Cuồng Huyết Lang",
            subtitle: "Mốc 30 · sát thương bùng nổ và tốc độ",
            waves: [{ enemyIds: [BLOOD_WOLF], hpMultiplier: 2.4, attackMultiplier: 1.55, speedMultiplier: 1.08 }],
        };
    }

    if (stage <= 39) {
        return {
            chapter,
            stage,
            kind: "gauntlet",
            label: "Song Trận Yêu Thú",
            subtitle: "Gauntlet · hai đợt liên tiếp",
            waves: [
                { enemyIds: cycle(stage, [WOLF, SNAKE, BEETLE], 3) },
                { enemyIds: cycle(stage + 1, [BLOOD_WOLF, BEETLE, WOLF], 3), hpMultiplier: 1.14, attackMultiplier: 1.1 },
            ],
        };
    }

    if (stage === 40) {
        return {
            chapter,
            stage,
            kind: "gauntlet",
            label: "Tiểu Thủ Lĩnh · Huyết Giáp",
            subtitle: "Mốc 40 · gauntlet hỗn hợp Tank + Berserker",
            waves: [
                { enemyIds: [BEETLE, WOLF, WOLF], hpMultiplier: 1.2 },
                { enemyIds: [BLOOD_WOLF, BEETLE], hpMultiplier: 1.9, attackMultiplier: 1.35 },
            ],
        };
    }

    if (stage <= 44) {
        return {
            chapter,
            stage,
            kind: "gauntlet",
            label: "Lang Vương Cấm Địa",
            subtitle: "Gauntlet · đội hình hỗn hợp tinh nhuệ",
            waves: [
                { enemyIds: cycle(stage, [BEETLE, WOLF, SNAKE, BLOOD_WOLF], 4), hpMultiplier: 1.08 },
                { enemyIds: cycle(stage + 2, [BLOOD_WOLF, BEETLE, BLOOD_WOLF, WOLF], 4), hpMultiplier: 1.2, attackMultiplier: 1.14 },
            ],
        };
    }

    return {
        chapter,
        stage,
        kind: "gauntlet",
        label: "Lang Vương Nội Điện",
        subtitle: "Gauntlet · ba đợt trước cửa Lang Vương",
        waves: [
            { enemyIds: cycle(stage, [WOLF, SNAKE, BEETLE, BLOOD_WOLF], 3), hpMultiplier: 1.08 },
            { enemyIds: cycle(stage + 1, [BEETLE, BLOOD_WOLF, SNAKE], 3), hpMultiplier: 1.16, attackMultiplier: 1.1 },
            { enemyIds: cycle(stage + 2, [BLOOD_WOLF, BEETLE, BLOOD_WOLF], 3), hpMultiplier: 1.28, attackMultiplier: 1.18 },
        ],
    };
}

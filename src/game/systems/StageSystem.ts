export interface StageConfig {
    chapter: number;
    stage: number;

    enemyCount: number;

    enemyHp: number;
    enemyAttack: number;
    enemySpeed: number;

    isBossStage: boolean;
}

export class StageSystem {
    private chapter: number;
    private stage: number;

    constructor() {
        this.chapter = 1;
        this.stage = 1;
    }

    public getChapter(): number {
        return this.chapter;
    }

    public getStage(): number {
        return this.stage;
    }

    public nextStage(): void {
        if (this.stage >= 50) {
            this.chapter += 1;
            this.stage = 1;

            return;
        }

        this.stage += 1;
    }

    public reset(): void {
        this.chapter = 1;
        this.stage = 1;
    }

    public restoreProgress(chapter: number, stage: number): boolean {
        if (
            !Number.isInteger(chapter) ||
            !Number.isInteger(stage) ||
            chapter < 1 ||
            stage < 1 ||
            stage > 50
        ) {
            return false;
        }

        this.chapter = chapter;
        this.stage = stage;
        return true;
    }

    public getConfig(): StageConfig {
        const isBossStage =
            this.stage === 50;

        const chapterDifficulty =
            this.chapter - 1;

        if (isBossStage) {
            return {
                chapter: this.chapter,
                stage: this.stage,

                enemyCount: 1,

                enemyHp:
                    1000 +
                    chapterDifficulty * 1500,

                enemyAttack:
                    30 +
                    chapterDifficulty * 20,

                enemySpeed: 1,

                isBossStage: true,
            };
        }

        return this.getNormalEnemyConfig(this.chapter, this.stage);
    }

    public getNormalEnemyConfig(
        chapter = this.chapter,
        stage = this.stage,
    ): StageConfig {
        const chapterDifficulty = chapter - 1;
        const stageDifficulty = stage - 1;

        const enemyCount =
            3 +
            Math.floor(
                stageDifficulty / 10,
            );

        const chapterOneCurve = this.getChapterOneDifficulty(stage);
        const enemyHp = chapter === 1
            ? chapterOneCurve.hp
            : 30 + stageDifficulty * 4 + chapterDifficulty * 50;

        const enemyAttack = chapter === 1
            ? chapterOneCurve.attack
            : 4 + Math.floor(stageDifficulty * 0.4) + chapterDifficulty * 5;

        const enemySpeed = chapter === 1
            ? chapterOneCurve.speed
            : 1.5 + Math.min(stageDifficulty * 0.01, 0.5) +
                Math.min(chapterDifficulty * 0.05, 0.5);

        return {
            chapter,
            stage,

            enemyCount,

            enemyHp,
            enemyAttack,
            enemySpeed,

            isBossStage: false,
        };
    }

    private getChapterOneDifficulty(stage: number): {
        hp: number;
        attack: number;
        speed: number;
    } {
        const clampedStage = Math.max(1, Math.min(49, stage));

        if (clampedStage <= 9) {
            return {
                hp: 30 + (clampedStage - 1) * 2.5,
                attack: 4 + (clampedStage - 1) * 0.22,
                speed: 1.5 + (clampedStage - 1) * 0.006,
            };
        }

        if (clampedStage <= 19) {
            return {
                hp: 52 + (clampedStage - 10) * 3.3,
                attack: 6 + (clampedStage - 10) * 0.28,
                speed: 1.56 + (clampedStage - 10) * 0.007,
            };
        }

        if (clampedStage <= 29) {
            return {
                hp: 84 + (clampedStage - 20) * 4.1,
                attack: 8.5 + (clampedStage - 20) * 0.34,
                speed: 1.63 + (clampedStage - 20) * 0.008,
            };
        }

        if (clampedStage <= 39) {
            return {
                hp: 122 + (clampedStage - 30) * 4.8,
                attack: 11.5 + (clampedStage - 30) * 0.4,
                speed: 1.71 + (clampedStage - 30) * 0.008,
            };
        }

        return {
            hp: 168 + (clampedStage - 40) * 5.6,
            attack: 15.2 + (clampedStage - 40) * 0.46,
            speed: 1.79 + (clampedStage - 40) * 0.009,
        };
    }
}

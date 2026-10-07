import { Enemy } from "../entities/Enemy";
import type { EnemyRuntimeOptions } from "../entities/Enemy";
import type { EnemyDefinition } from "./EnemyDefinition";
import type { StageConfig } from "../systems/StageSystem";
import { ENEMY_ARCHETYPE_CONFIG } from "./enemyArchetypeConfig";
import { ELITE_AFFIX_CONFIG } from "./EliteEnemy";

const NORMAL_BASELINE_HP = 30;
const NORMAL_BASELINE_ATTACK = 4;
const NORMAL_BASELINE_MOVE_SPEED = 1.5;
const BOSS_BASELINE_HP = 1000;
const BOSS_BASELINE_ATTACK = 30;
const BOSS_BASELINE_MOVE_SPEED = 1;

export class EnemyFactory {
    public create(
        definition: EnemyDefinition,
        stageConfig: StageConfig,
        options: EnemyRuntimeOptions = {},
    ): Enemy {
        const archetype = ENEMY_ARCHETYPE_CONFIG[definition.archetype];
        const hpBaseline = definition.isBoss
            ? BOSS_BASELINE_HP
            : NORMAL_BASELINE_HP;
        const attackBaseline = definition.isBoss
            ? BOSS_BASELINE_ATTACK
            : NORMAL_BASELINE_ATTACK;
        const speedBaseline = definition.isBoss
            ? BOSS_BASELINE_MOVE_SPEED
            : NORMAL_BASELINE_MOVE_SPEED;
        const elite = options.eliteAffix
            ? ELITE_AFFIX_CONFIG[options.eliteAffix]
            : null;

        return new Enemy(definition, {
            maxHp: this.round(
                definition.baseHp * archetype.hpMultiplier *
                (stageConfig.enemyHp / hpBaseline) *
                (options.eliteAffix ? 2 : 1) * (elite?.hpMultiplier ?? 1),
            ),
            attack: this.round(
                definition.baseAttack * archetype.attackMultiplier *
                (stageConfig.enemyAttack / attackBaseline) *
                (options.eliteAffix ? 1.5 : 1) * (elite?.attackMultiplier ?? 1),
            ),
            moveSpeed: this.round(
                definition.baseMoveSpeed * archetype.moveSpeedMultiplier *
                (stageConfig.enemySpeed / speedBaseline) * (elite?.moveSpeedMultiplier ?? 1),
            ),
            attackInterval: this.round(
                definition.baseAttackInterval *
                archetype.attackIntervalMultiplier,
            ),
            attackRange: definition.attackRange,
        }, options);
    }

    private round(value: number): number {
        return Math.max(0.01, Math.round(value * 1000) / 1000);
    }
}

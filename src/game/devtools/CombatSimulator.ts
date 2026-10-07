export interface CombatSimulationInput {
    playerDamagePerHit: number;
    playerAttackIntervalSeconds: number;
    playerHp: number;
    enemyHp: number;
    enemyDamagePerHit: number;
    enemyAttackIntervalSeconds: number;
    enemyDamageReduction?: number;
}

export interface CombatSimulationReport {
    playerDps: number;
    incomingDps: number;
    timeToKillSeconds: number;
    timeToDefeatSeconds: number;
    projectedWinner: "player" | "enemy" | "draw";
}

export function simulateCombat(input: CombatSimulationInput): CombatSimulationReport {
    const positive = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
    const interval = (value: number) => Number.isFinite(value) ? Math.max(0.001, value) : 0.001;
    const reduction = Math.min(0.95, positive(input.enemyDamageReduction ?? 0));
    const playerDps = positive(input.playerDamagePerHit) * (1 - reduction) /
        interval(input.playerAttackIntervalSeconds);
    const incomingDps = positive(input.enemyDamagePerHit) /
        interval(input.enemyAttackIntervalSeconds);
    const timeToKillSeconds = playerDps > 0 ? positive(input.enemyHp) / playerDps : Infinity;
    const timeToDefeatSeconds = incomingDps > 0 ? positive(input.playerHp) / incomingDps : Infinity;
    const projectedWinner = Math.abs(timeToKillSeconds - timeToDefeatSeconds) < 0.001
        ? "draw"
        : timeToKillSeconds < timeToDefeatSeconds ? "player" : "enemy";

    return { playerDps, incomingDps, timeToKillSeconds, timeToDefeatSeconds, projectedWinner };
}

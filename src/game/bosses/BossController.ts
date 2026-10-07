import type { Enemy } from "../entities/Enemy";
import type { BossDefinition } from "./BossDefinition";
import type { BossPhaseDefinition, BossSummonConfig } from "./BossPhase";
import type { BossSkillDefinition, BossSkillState } from "./BossSkill";
import { BossSkillType } from "./BossSkill";

export interface BossControllerCallbacks {
    isPlayerAlive: () => boolean;
    canUseTargetedSkill: () => boolean;
    dealDamageToPlayer: (damage: number) => void;
    onSkillTelegraph?: (skill: BossSkillDefinition) => void;
    onSkillImpact?: (skill: BossSkillDefinition) => void;
    onPhaseChanged?: (phase: BossPhaseDefinition, phaseIndex: number) => void;
    onSummonRequested?: (summon: BossSummonConfig) => void;
}

interface PendingBossSkill {
    skill: BossSkillDefinition;
    remainingSeconds: number;
}

export class BossController {
    private boss: Enemy;
    private definition: BossDefinition;
    private callbacks: BossControllerCallbacks;
    private currentPhaseIndex: number;
    private enteredPhaseIds: Set<string>;
    private skillStates: Map<string, BossSkillState>;
    private globalSkillCooldown: number;
    private remainingBuffDuration: number;
    private pendingSkill: PendingBossSkill | null;
    private phaseTransitionLock = 0;
    private destroyed: boolean;

    constructor(
        boss: Enemy,
        definition: BossDefinition,
        callbacks: BossControllerCallbacks,
    ) {
        this.boss = boss;
        this.definition = definition;
        this.callbacks = callbacks;
        this.currentPhaseIndex = -1;
        this.enteredPhaseIds = new Set();
        this.skillStates = new Map(
            definition.skills.map((skill) => [
                skill.id,
                {
                    skillId: skill.id,
                    remainingCooldown: skill.initialCooldown ?? skill.cooldown,
                },
            ]),
        );
        this.globalSkillCooldown = 0;
        this.remainingBuffDuration = 0;
        this.pendingSkill = null;
        this.destroyed = false;

        this.updatePhase();
    }

    public update(deltaSeconds: number): void {
        if (this.destroyed || this.boss.isDead()) {
            return;
        }

        const delta = Math.max(0, deltaSeconds);

        this.updateTemporaryBuff(delta);
        this.phaseTransitionLock = Math.max(0, this.phaseTransitionLock - delta);
        this.updatePhase();
        this.updateCooldowns(delta);

        if (this.pendingSkill) {
            this.updatePendingSkill(delta);
            return;
        }

        if (this.globalSkillCooldown > 0) {
            return;
        }

        this.tryCastSkill();
    }

    public getBoss(): Enemy {
        return this.boss;
    }

    public getCurrentPhaseIndex(): number {
        return Math.max(0, this.currentPhaseIndex);
    }

    public getCurrentPhase(): BossPhaseDefinition {
        return this.definition.phases[this.getCurrentPhaseIndex()];
    }

    public getEnteredPhaseIds(): ReadonlySet<string> {
        return this.enteredPhaseIds;
    }

    public getSkillState(skillId: string): BossSkillState | null {
        const state = this.skillStates.get(skillId);

        return state ? { ...state } : null;
    }

    public getRemainingBuffDuration(): number {
        return this.remainingBuffDuration;
    }

    public destroy(): void {
        if (this.destroyed) {
            return;
        }

        this.destroyed = true;
        this.skillStates.clear();
        this.enteredPhaseIds.clear();
        this.remainingBuffDuration = 0;
        this.globalSkillCooldown = 0;
        this.pendingSkill = null;
    }

    private updatePhase(): void {
        if (this.phaseTransitionLock > 0) {
            return;
        }

        const hpRatio = this.boss.getHp() / this.boss.getMaxHp();
        let nextPhaseIndex = 0;

        for (let index = 0; index < this.definition.phases.length; index += 1) {
            if (hpRatio <= this.definition.phases[index].hpThreshold) {
                nextPhaseIndex = index;
            }
        }

        if (nextPhaseIndex === this.currentPhaseIndex) {
            return;
        }

        if (this.currentPhaseIndex >= 0) {
            nextPhaseIndex = Math.min(nextPhaseIndex, this.currentPhaseIndex + 1);
        }

        this.enterPhase(nextPhaseIndex);
    }

    private enterPhase(phaseIndex: number): void {
        const phase = this.definition.phases[phaseIndex];

        this.currentPhaseIndex = phaseIndex;
        this.boss.releasePhaseHpFloor(phaseIndex);
        this.boss.setPhaseMultipliers({
            attack: phase.attackMultiplier ?? 1,
            moveSpeed: phase.moveSpeedMultiplier ?? 1,
            attackSpeed: phase.attackSpeedMultiplier ?? 1,
        });

        if (this.enteredPhaseIds.has(phase.id)) {
            return;
        }

        this.enteredPhaseIds.add(phase.id);
        this.phaseTransitionLock = phaseIndex > 0 ? 2.2 : 0;
        this.globalSkillCooldown = Math.max(this.globalSkillCooldown, phaseIndex > 0 ? 2.2 : 0.6);
        this.callbacks.onPhaseChanged?.(phase, phaseIndex);

        if (phase.summonOnEnter) {
            this.callbacks.onSummonRequested?.(phase.summonOnEnter);
        }
    }

    private updateTemporaryBuff(deltaSeconds: number): void {
        if (this.remainingBuffDuration <= 0) {
            return;
        }

        this.remainingBuffDuration = Math.max(
            0,
            this.remainingBuffDuration - deltaSeconds,
        );

        if (this.remainingBuffDuration === 0) {
            this.boss.setTemporaryAttackMultiplier(1);
        }
    }

    private updateCooldowns(deltaSeconds: number): void {
        this.globalSkillCooldown = Math.max(
            0,
            this.globalSkillCooldown - deltaSeconds,
        );

        const enabledSkillIds = new Set(
            this.getCurrentPhase().enabledSkillIds ?? [],
        );

        for (const state of this.skillStates.values()) {
            if (!enabledSkillIds.has(state.skillId)) {
                continue;
            }

            state.remainingCooldown = Math.max(
                0,
                state.remainingCooldown - deltaSeconds,
            );
        }
    }

    private tryCastSkill(): void {
        const enabledSkillIds = new Set(
            this.getCurrentPhase().enabledSkillIds ?? [],
        );
        const readySkills = this.definition.skills
            .filter((skill) => {
                const state = this.skillStates.get(skill.id);

                return enabledSkillIds.has(skill.id) &&
                    Boolean(state) &&
                    (state?.remainingCooldown ?? 1) <= 0;
            })
            .sort((left, right) => (right.priority ?? 0) - (left.priority ?? 0));

        for (const skill of readySkills) {
            if (!this.castSkill(skill)) {
                continue;
            }

            const state = this.skillStates.get(skill.id);

            if (state) {
                state.remainingCooldown = skill.cooldown;
            }

            this.globalSkillCooldown = Math.max(
                this.definition.minimumSkillGap,
                skill.telegraphDuration ?? 0.65,
            );
            return;
        }
    }

    private castSkill(skill: BossSkillDefinition): boolean {
        if (skill.type === BossSkillType.HEAVY_ATTACK) {
            if (
                !this.callbacks.isPlayerAlive() ||
                !this.callbacks.canUseTargetedSkill()
            ) {
                return false;
            }

            this.beginTelegraphedSkill(skill);
            return true;
        }

        if (skill.type === BossSkillType.SELF_BUFF) {
            this.beginTelegraphedSkill(skill);
            return true;
        }

        return false;
    }

    private beginTelegraphedSkill(skill: BossSkillDefinition): void {
        this.pendingSkill = {
            skill,
            remainingSeconds: Math.max(0.1, skill.telegraphDuration ?? 0.65),
        };
        this.callbacks.onSkillTelegraph?.(skill);
    }

    private updatePendingSkill(deltaSeconds: number): void {
        if (!this.pendingSkill) return;

        this.pendingSkill.remainingSeconds -= deltaSeconds;
        if (this.pendingSkill.remainingSeconds > 0) return;

        const skill = this.pendingSkill.skill;
        this.pendingSkill = null;
        this.callbacks.onSkillImpact?.(skill);

        if (skill.type === BossSkillType.HEAVY_ATTACK) {
            if (
                this.callbacks.isPlayerAlive() &&
                this.callbacks.canUseTargetedSkill()
            ) {
                this.callbacks.dealDamageToPlayer(
                    this.boss.getAttack() * (skill.damageMultiplier ?? 1),
                );
            }
        } else if (skill.type === BossSkillType.SELF_BUFF) {
            this.boss.setTemporaryAttackMultiplier(skill.buffAttackMultiplier ?? 1);
            this.remainingBuffDuration = skill.buffDuration ?? 0;

            if (
                (skill.damageMultiplier ?? 0) > 0 &&
                this.callbacks.isPlayerAlive()
            ) {
                this.callbacks.dealDamageToPlayer(
                    this.boss.getAttack() * (skill.damageMultiplier ?? 0),
                );
            }
        }

        this.globalSkillCooldown = Math.max(
            this.globalSkillCooldown,
            this.definition.minimumSkillGap,
        );
    }
}

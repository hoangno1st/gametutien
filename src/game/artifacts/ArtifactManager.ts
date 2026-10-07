import type { Player } from "../entities/Player";
import type { ArtifactDefinition } from "./Artifact";
import { ArtifactPassiveType } from "./Artifact";
import type { ArtifactState } from "./ArtifactState";
import {
    ARTIFACT_FRAGMENTS_REQUIRED,
    ARTIFACT_STAR_COSTS,
    ARTIFACT_STAR_MULTIPLIERS,
    MAX_ARTIFACT_STAR,
} from "./artifactConfig";
import { StatModifierType } from "../stats/StatModifier";
import { StatType } from "../stats/StatType";

export class ArtifactManager {
    private player: Player;
    private definitions: Map<string, ArtifactDefinition>;
    private states: Map<string, ArtifactState>;
    private equippedArtifactId: string | null;
    private version: number;

    constructor(
        player: Player,
        definitions: ReadonlyArray<ArtifactDefinition>,
    ) {
        this.player = player;
        this.definitions = new Map<string, ArtifactDefinition>();
        this.states = new Map<string, ArtifactState>();
        this.equippedArtifactId = null;
        this.version = 0;

        for (const definition of definitions) {
            this.definitions.set(definition.id, definition);
            this.states.set(definition.id, {
                artifactId: definition.id,
                fragmentCount: 0,
                owned: false,
                equipped: false,
                star: 1,
            });
        }
    }

    public addFragments(
        artifactId: string,
        amount: number,
    ): void {
        const state = this.states.get(artifactId);
        const fragmentAmount = Math.floor(amount);

        if (!state || fragmentAmount <= 0) {
            return;
        }

        state.fragmentCount += fragmentAmount;
        this.version += 1;
    }

    public getFragmentCount(artifactId: string): number {
        return this.states.get(artifactId)?.fragmentCount ?? 0;
    }

    public canCraft(artifactId: string): boolean {
        const state = this.states.get(artifactId);

        return Boolean(
            state &&
            !state.owned &&
            state.fragmentCount >= ARTIFACT_FRAGMENTS_REQUIRED,
        );
    }

    public craft(artifactId: string): boolean {
        const state = this.states.get(artifactId);

        if (!state || !this.canCraft(artifactId)) {
            return false;
        }

        state.fragmentCount -= ARTIFACT_FRAGMENTS_REQUIRED;
        state.owned = true;
        this.version += 1;

        return true;
    }

    public isOwned(artifactId: string): boolean {
        return this.states.get(artifactId)?.owned ?? false;
    }

    public getStarUpgradeCost(artifactId: string): number | null {
        const state = this.states.get(artifactId);
        if (!state?.owned || state.star >= MAX_ARTIFACT_STAR) return null;
        return ARTIFACT_STAR_COSTS[state.star + 1] ?? null;
    }

    public canUpgradeStar(artifactId: string): boolean {
        const state = this.states.get(artifactId);
        const cost = this.getStarUpgradeCost(artifactId);
        return Boolean(state && cost !== null && state.fragmentCount >= cost);
    }

    public upgradeStar(artifactId: string): boolean {
        const state = this.states.get(artifactId);
        const definition = this.definitions.get(artifactId);
        const cost = this.getStarUpgradeCost(artifactId);
        if (!state || !definition || cost === null || !this.canUpgradeStar(artifactId)) return false;
        if (state.equipped) this.removeArtifactModifiers(artifactId);
        state.fragmentCount -= cost;
        state.star += 1;
        if (state.equipped) this.addArtifactModifiers(definition);
        this.player.syncCurrentResourcesWithMaxStats();
        this.version += 1;
        return true;
    }

    public getPassiveValue(artifactId: string): number {
        const definition = this.definitions.get(artifactId);
        const state = this.states.get(artifactId);
        if (!definition || !state) return 0;
        return definition.passive.baseValue +
            Math.max(0, state.star - 1) * definition.passive.valuePerStar;
    }

    public getBossDamageMultiplier(): number {
        const definition = this.getEquippedArtifact();
        if (!definition || definition.passive.type !== ArtifactPassiveType.BOSS_DAMAGE) return 1;
        return 1 + this.getPassiveValue(definition.id);
    }

    public updateCombatPassives(): void {
        const modifierId = "artifact:passive:low-hp-attack";
        const definition = this.getEquippedArtifact();
        const active = Boolean(definition &&
            definition.passive.type === ArtifactPassiveType.LOW_HP_ATTACK &&
            this.player.getHp() / Math.max(1, this.player.getMaxHp()) <=
                (definition.passive.threshold ?? 0.4));
        if (active && definition) {
            this.player.getStatSystem().addModifier({
                id: modifierId,
                source: `artifact:${definition.id}:passive`,
                stat: StatType.ATTACK,
                type: StatModifierType.PERCENT,
                value: this.getPassiveValue(definition.id),
            });
        } else {
            this.player.getStatSystem().removeModifier(modifierId);
        }
    }

    public equip(artifactId: string): boolean {
        const definition = this.definitions.get(artifactId);
        const state = this.states.get(artifactId);

        if (!definition || !state?.owned) {
            return false;
        }

        if (this.equippedArtifactId === artifactId) {
            return true;
        }

        if (this.equippedArtifactId) {
            this.removeArtifactModifiers(this.equippedArtifactId);
            const previousState = this.states.get(this.equippedArtifactId);

            if (previousState) {
                previousState.equipped = false;
            }
        }

        this.equippedArtifactId = artifactId;
        state.equipped = true;
        this.addArtifactModifiers(definition);
        this.player.syncCurrentResourcesWithMaxStats();
        this.version += 1;

        return true;
    }

    public unequip(): boolean {
        if (!this.equippedArtifactId) {
            return false;
        }

        const state = this.states.get(this.equippedArtifactId);

        this.removeArtifactModifiers(this.equippedArtifactId);
        if (state) {
            state.equipped = false;
        }

        this.equippedArtifactId = null;
        this.player.syncCurrentResourcesWithMaxStats();
        this.version += 1;

        return true;
    }

    public getEquippedArtifact(): ArtifactDefinition | null {
        if (!this.equippedArtifactId) {
            return null;
        }

        return this.definitions.get(this.equippedArtifactId) ?? null;
    }

    public getArtifactState(artifactId: string): ArtifactState {
        const state = this.states.get(artifactId);

        if (!state) {
            throw new Error(`Unknown artifact: ${artifactId}`);
        }

        return { ...state };
    }

    public getAllArtifactStates(): ArtifactState[] {
        return Array.from(
            this.states.values(),
            (state) => ({ ...state }),
        );
    }

    public getArtifactDefinition(
        artifactId: string,
    ): ArtifactDefinition | null {
        return this.definitions.get(artifactId) ?? null;
    }

    public getAllArtifactDefinitions(): ArtifactDefinition[] {
        return Array.from(this.definitions.values());
    }

    public getVersion(): number {
        return this.version;
    }

    public restoreStates(
        states: ReadonlyArray<{
            artifactId: string;
            fragmentCount: number;
            owned: boolean;
            star: number;
        }>,
        equippedArtifactId: string | null,
    ): void {
        if (this.equippedArtifactId) {
            this.removeArtifactModifiers(this.equippedArtifactId);
        }

        this.equippedArtifactId = null;

        for (const [artifactId] of this.definitions) {
            this.states.set(artifactId, {
                artifactId,
                fragmentCount: 0,
                owned: false,
                equipped: false,
                star: 1,
            });
        }

        for (const savedState of states) {
            const state = this.states.get(savedState.artifactId);

            if (!state) {
                continue;
            }

            state.fragmentCount = Math.max(0, Math.floor(savedState.fragmentCount));
            state.owned = savedState.owned;
            state.star = Math.min(MAX_ARTIFACT_STAR, Math.max(1, Math.floor(savedState.star)));
        }

        const equippedState = equippedArtifactId
            ? this.states.get(equippedArtifactId)
            : null;
        const equippedDefinition = equippedArtifactId
            ? this.definitions.get(equippedArtifactId)
            : null;

        if (equippedState?.owned && equippedDefinition) {
            equippedState.equipped = true;
            this.equippedArtifactId = equippedArtifactId;
            this.addArtifactModifiers(equippedDefinition);
        }

        this.player.syncCurrentResourcesWithMaxStats();
        this.version += 1;
    }

    public reset(): void {
        this.restoreStates([], null);
    }

    private addArtifactModifiers(
        definition: ArtifactDefinition,
    ): void {
        const state = this.states.get(definition.id);
        const starMultiplier = ARTIFACT_STAR_MULTIPLIERS[state?.star ?? 1] ?? 1;
        definition.baseModifiers.forEach((modifier, index) => {
            this.player.getStatSystem().addModifier({
                ...modifier,
                value: modifier.value * starMultiplier,
                id: `artifact:${definition.id}:${index}`,
                source: `artifact:${definition.id}`,
            });
        });
        if (definition.passive.type === ArtifactPassiveType.CULTIVATION_BONUS) {
            this.player.getStatSystem().addModifier({
                id: `artifact:${definition.id}:passive`,
                source: `artifact:${definition.id}`,
                stat: StatType.CULTIVATION_SPEED,
                type: StatModifierType.FLAT,
                value: this.getPassiveValue(definition.id),
            });
        }
    }

    private removeArtifactModifiers(artifactId: string): void {
        const definition = this.definitions.get(artifactId);

        definition?.baseModifiers.forEach((_modifier, index) => {
            this.player
                .getStatSystem()
                .removeModifier(`artifact:${artifactId}:${index}`);
        });
        this.player.getStatSystem().removeModifier(`artifact:${artifactId}:passive`);
        this.player.getStatSystem().removeModifier("artifact:passive:low-hp-attack");
    }
}

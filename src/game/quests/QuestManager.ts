import type { GameEvent, GameEventBus } from "../events/GameEvent";
import type { Inventory } from "../inventory/Inventory";
import type { ItemDefinition } from "../items/Item";
import type { QuestDefinition, QuestState } from "./Quest";

export interface QuestManagerDependencies {
    eventBus: GameEventBus;
    inventory: Inventory;
    itemDefinitions: ReadonlyArray<ItemDefinition>;
    addSpiritStone: (amount: number) => void;
}

export class QuestManager {
    private definitions: Map<string, QuestDefinition>;
    private states: Map<string, QuestState>;
    private dependencies: QuestManagerDependencies;
    private unsubscribe: () => void;
    private version: number;

    constructor(definitions: ReadonlyArray<QuestDefinition>, dependencies: QuestManagerDependencies) {
        this.definitions = new Map(definitions.map((definition) => [definition.id, definition]));
        this.states = new Map(definitions.map((definition) => [definition.id, {
            questId: definition.id,
            progress: 0,
            completed: false,
            claimed: false,
        }]));
        this.dependencies = dependencies;
        this.unsubscribe = dependencies.eventBus.subscribe((event) => this.handleEvent(event));
        this.version = 0;
    }

    public getEntries(): Array<{ definition: QuestDefinition; state: QuestState }> {
        return Array.from(this.definitions.values(), (definition) => ({
            definition,
            state: { ...this.states.get(definition.id)! },
        }));
    }

    public claim(questId: string): boolean {
        const state = this.states.get(questId);
        const definition = this.definitions.get(questId);
        if (!state?.completed || state.claimed || !definition) return false;
        const itemMap = new Map(this.dependencies.itemDefinitions.map((item) => [item.id, item]));
        for (const reward of definition.reward.materials ?? []) {
            const item = itemMap.get(reward.itemId);
            if (item) this.dependencies.inventory.addItem(item, reward.quantity);
        }
        this.dependencies.addSpiritStone(definition.reward.spiritStone ?? 0);
        state.claimed = true;
        this.version += 1;
        return true;
    }

    public restore(states: ReadonlyArray<QuestState>): void {
        for (const saved of states) {
            const state = this.states.get(saved.questId);
            const definition = this.definitions.get(saved.questId);
            if (!state || !definition) continue;
            state.progress = Math.min(definition.target, Math.max(0, Math.floor(saved.progress)));
            state.completed = saved.completed || state.progress >= definition.target;
            state.claimed = saved.claimed && state.completed;
        }
        this.version += 1;
    }

    public getStates(): QuestState[] {
        return Array.from(this.states.values(), (state) => ({ ...state }));
    }

    public getVersion(): number { return this.version; }
    public reset(): void {
        for (const state of this.states.values()) {
            state.progress = 0;
            state.completed = false;
            state.claimed = false;
        }
        this.version += 1;
    }
    public destroy(): void { this.unsubscribe(); }

    private handleEvent(event: GameEvent): void {
        for (const definition of this.definitions.values()) {
            const state = this.states.get(definition.id)!;
            if (state.completed || definition.eventType !== event.type) continue;
            state.progress = definition.id === "clear_stage_10"
                ? Math.min(definition.target, Math.max(state.progress, event.stage ?? 0))
                : Math.min(definition.target, state.progress + (event.amount ?? 1));
            state.completed = state.progress >= definition.target;
            this.version += 1;
        }
    }
}

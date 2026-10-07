import { GameEventType } from "../events/GameEvent";
import type { GameEvent, GameEventBus } from "../events/GameEvent";

export interface AchievementState {
    id: string;
    name: string;
    progress: number;
    target: number;
    unlocked: boolean;
}

const DEFINITIONS: ReadonlyArray<Omit<AchievementState, "progress" | "unlocked"> & { event: GameEventType }> = [
    { id: "first_blood", name: "Nhất Kích", target: 1, event: GameEventType.ENEMY_KILLED },
    { id: "hunter", name: "Thợ Săn", target: 1000, event: GameEventType.ENEMY_KILLED },
    { id: "master_refiner", name: "Luyện Khí Đại Sư", target: 100, event: GameEventType.EQUIPMENT_CRAFTED },
    { id: "red_destiny", name: "Xích Mệnh", target: 1, event: GameEventType.EQUIPMENT_CRAFTED },
    { id: "alchemist", name: "Đan Sư", target: 100, event: GameEventType.PILL_CRAFTED },
    { id: "immortal_path", name: "Tiên Lộ", target: 1, event: GameEventType.BREAKTHROUGH },
];

export class AchievementManager {
    private states: Map<string, AchievementState>;
    private unsubscribe: () => void;

    constructor(eventBus: GameEventBus) {
        this.states = new Map(DEFINITIONS.map((definition) => [definition.id, {
            id: definition.id,
            name: definition.name,
            progress: 0,
            target: definition.target,
            unlocked: false,
        }]));
        this.unsubscribe = eventBus.subscribe((event) => this.handleEvent(event));
    }

    public getStates(): AchievementState[] {
        return Array.from(this.states.values(), (state) => ({ ...state }));
    }

    public restore(states: ReadonlyArray<AchievementState>): void {
        for (const saved of states) {
            const state = this.states.get(saved.id);
            if (!state) continue;
            state.progress = Math.min(state.target, Math.max(0, Math.floor(saved.progress)));
            state.unlocked = saved.unlocked || state.progress >= state.target;
        }
    }

    public destroy(): void { this.unsubscribe(); }
    public reset(): void {
        for (const state of this.states.values()) {
            state.progress = 0;
            state.unlocked = false;
        }
    }

    private handleEvent(event: GameEvent): void {
        DEFINITIONS.forEach((definition) => {
            const state = this.states.get(definition.id)!;
            if (state.unlocked || definition.event !== event.type) return;
            if (definition.id === "red_destiny" && event.rarity !== "red") return;
            state.progress = Math.min(state.target, state.progress + (event.amount ?? 1));
            state.unlocked = state.progress >= state.target;
        });
    }
}

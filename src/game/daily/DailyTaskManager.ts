import { GameEventType } from "../events/GameEvent";
import type { GameEvent, GameEventBus } from "../events/GameEvent";

export interface DailyTaskState {
    id: string;
    name: string;
    eventType: GameEventType;
    progress: number;
    target: number;
    claimed: boolean;
}

const DAILY_DEFINITIONS: ReadonlyArray<Omit<DailyTaskState, "progress" | "claimed">> = [
    { id: "daily_kill", name: "Diệt 50 yêu thú", eventType: GameEventType.ENEMY_KILLED, target: 50 },
    { id: "daily_equipment", name: "Luyện 3 trang bị", eventType: GameEventType.EQUIPMENT_CRAFTED, target: 3 },
    { id: "daily_pill", name: "Luyện 3 đan dược", eventType: GameEventType.PILL_CRAFTED, target: 3 },
    { id: "daily_boss", name: "Diệt 1 Boss", eventType: GameEventType.BOSS_KILLED, target: 1 },
    { id: "daily_use_pill", name: "Dùng 5 đan dược", eventType: GameEventType.PILL_USED, target: 5 },
];

export function getLocalDayKey(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export class DailyTaskManager {
    private states: Map<string, DailyTaskState>;
    private dayKey: string;
    private addSpiritStone: (amount: number) => void;
    private unsubscribe: () => void;

    constructor(eventBus: GameEventBus, addSpiritStone: (amount: number) => void) {
        this.states = new Map();
        this.dayKey = getLocalDayKey();
        this.addSpiritStone = addSpiritStone;
        this.resetStates();
        this.unsubscribe = eventBus.subscribe((event) => this.handleEvent(event));
    }

    public checkLocalDay(): void {
        const current = getLocalDayKey();
        if (current !== this.dayKey) {
            this.dayKey = current;
            this.resetStates();
        }
    }

    public claim(taskId: string): boolean {
        this.checkLocalDay();
        const state = this.states.get(taskId);
        if (!state || state.claimed || state.progress < state.target) return false;
        state.claimed = true;
        this.addSpiritStone(100 + state.target * 5);
        return true;
    }

    public getStates(): DailyTaskState[] {
        this.checkLocalDay();
        return Array.from(this.states.values(), (state) => ({ ...state }));
    }

    public getDayKey(): string { return this.dayKey; }

    public restore(dayKey: string, states: ReadonlyArray<DailyTaskState>): void {
        if (dayKey !== getLocalDayKey()) return;
        this.dayKey = dayKey;
        for (const saved of states) {
            const state = this.states.get(saved.id);
            if (!state) continue;
            state.progress = Math.min(state.target, Math.max(0, Math.floor(saved.progress)));
            state.claimed = saved.claimed && state.progress >= state.target;
        }
    }

    public destroy(): void { this.unsubscribe(); }
    public reset(): void {
        this.dayKey = getLocalDayKey();
        this.resetStates();
    }

    private resetStates(): void {
        this.states = new Map(DAILY_DEFINITIONS.map((definition) => [definition.id, {
            ...definition,
            progress: 0,
            claimed: false,
        }]));
    }

    private handleEvent(event: GameEvent): void {
        this.checkLocalDay();
        for (const state of this.states.values()) {
            if (state.claimed || state.eventType !== event.type) continue;
            state.progress = Math.min(state.target, state.progress + (event.amount ?? 1));
        }
    }
}

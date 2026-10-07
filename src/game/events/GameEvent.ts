export enum GameEventType {
    ENEMY_KILLED = "enemy_killed",
    BOSS_KILLED = "boss_killed",
    EQUIPMENT_CRAFTED = "equipment_crafted",
    PILL_CRAFTED = "pill_crafted",
    EQUIPMENT_ENHANCED = "equipment_enhanced",
    ARTIFACT_CRAFTED = "artifact_crafted",
    TECHNIQUE_UPGRADED = "technique_upgraded",
    BREAKTHROUGH = "breakthrough",
    STAGE_CLEARED = "stage_cleared",
    PILL_USED = "pill_used",
    EQUIPMENT_EQUIPPED = "equipment_equipped",
    TUTORIAL_COMPLETED = "tutorial_completed",
}

export interface GameEvent {
    type: GameEventType;
    amount?: number;
    chapter?: number;
    stage?: number;
    rarity?: string;
}

export type GameEventListener = (event: GameEvent) => void;

export class GameEventBus {
    private listeners: Set<GameEventListener>;

    constructor() {
        this.listeners = new Set<GameEventListener>();
    }

    public subscribe(listener: GameEventListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    public emit(event: GameEvent): void {
        for (const listener of [...this.listeners]) listener(event);
    }

    public clear(): void {
        this.listeners.clear();
    }
}

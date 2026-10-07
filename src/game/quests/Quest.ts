import type { GameEventType } from "../events/GameEvent";

export interface QuestReward {
    spiritStone?: number;
    materials?: ReadonlyArray<{ itemId: string; quantity: number }>;
}

export interface QuestDefinition {
    id: string;
    name: string;
    description: string;
    eventType: GameEventType;
    target: number;
    reward: QuestReward;
}

export interface QuestState {
    questId: string;
    progress: number;
    completed: boolean;
    claimed: boolean;
}

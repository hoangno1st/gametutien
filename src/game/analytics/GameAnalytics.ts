import { GameEventType } from "../events/GameEvent";
import type { GameEvent, GameEventBus } from "../events/GameEvent";

export type AnalyticsEventName =
    | "game_start"
    | "stage_clear"
    | "boss_kill"
    | "equipment_craft"
    | "equipment_red_craft"
    | "pill_craft"
    | "breakthrough"
    | "artifact_craft"
    | "tutorial_complete";

export interface GameAnalytics {
    track(event: AnalyticsEventName, properties?: Readonly<Record<string, string | number | boolean>>): void;
}

export class NoopGameAnalytics implements GameAnalytics {
    public track(
        _event: AnalyticsEventName,
        _properties?: Readonly<Record<string, string | number | boolean>>,
    ): void {
        // Intentionally empty. A consent-aware provider can replace this adapter later.
    }
}

export class GameAnalyticsEventBridge {
    private unsubscribe: () => void;

    constructor(eventBus: GameEventBus, analytics: GameAnalytics) {
        this.unsubscribe = eventBus.subscribe((event) => this.forward(event, analytics));
    }

    public destroy(): void {
        this.unsubscribe();
    }

    private forward(event: GameEvent, analytics: GameAnalytics): void {
        const properties = {
            ...(event.chapter === undefined ? {} : { chapter: event.chapter }),
            ...(event.stage === undefined ? {} : { stage: event.stage }),
            ...(event.rarity === undefined ? {} : { rarity: event.rarity }),
        };

        switch (event.type) {
            case GameEventType.STAGE_CLEARED:
                analytics.track("stage_clear", properties);
                break;
            case GameEventType.BOSS_KILLED:
                analytics.track("boss_kill", properties);
                break;
            case GameEventType.EQUIPMENT_CRAFTED:
                analytics.track("equipment_craft", properties);
                if (event.rarity === "red") analytics.track("equipment_red_craft", properties);
                break;
            case GameEventType.PILL_CRAFTED:
                analytics.track("pill_craft", properties);
                break;
            case GameEventType.BREAKTHROUGH:
                analytics.track("breakthrough", properties);
                break;
            case GameEventType.ARTIFACT_CRAFTED:
                analytics.track("artifact_craft", properties);
                break;
            case GameEventType.TUTORIAL_COMPLETED:
                analytics.track("tutorial_complete");
                break;
            default:
                break;
        }
    }
}

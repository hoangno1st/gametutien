import { GameEventType } from "../events/GameEvent";
import type { GameEvent, GameEventBus } from "../events/GameEvent";

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetKey: string;
    eventType?: GameEventType;
}

export interface TutorialState {
    tutorialCompleted: boolean;
    currentStep: number;
}

export const TUTORIAL_STEPS: ReadonlyArray<TutorialStep> = [
    { id: "combat", title: "Auto Combat", description: "Nhân vật tự động chiến đấu và thu chiến lợi phẩm.", targetKey: "combat", eventType: GameEventType.ENEMY_KILLED },
    { id: "inventory", title: "Túi Đồ", description: "Mở Túi Đồ để xem nguyên liệu vừa nhận.", targetKey: "inventory" },
    { id: "material", title: "Nguyên Liệu", description: "Nguyên liệu dùng cho Luyện Khí và Luyện Đan.", targetKey: "inventory" },
    { id: "craft", title: "Luyện Khí", description: "Luyện trang bị đầu tiên.", targetKey: "refining", eventType: GameEventType.EQUIPMENT_CRAFTED },
    { id: "equip", title: "Trang Bị", description: "Trang bị vật phẩm vừa luyện.", targetKey: "equipment", eventType: GameEventType.EQUIPMENT_EQUIPPED },
    { id: "cultivation", title: "Tu Luyện", description: "Tu vi tự tăng theo thời gian.", targetKey: "cultivation" },
    { id: "breakthrough", title: "Đột Phá", description: "Khi tu vi đầy, hãy Đột Phá.", targetKey: "cultivation", eventType: GameEventType.BREAKTHROUGH },
    { id: "artifact", title: "Pháp Bảo", description: "Thu thập mảnh để ghép và nâng sao Pháp Bảo.", targetKey: "artifacts" },
    { id: "technique", title: "Công Pháp", description: "Dùng Tàn Trang và Linh Thạch để nâng Công Pháp.", targetKey: "techniques" },
];

export class TutorialManager {
    private state: TutorialState;
    private eventBus: GameEventBus;
    private unsubscribe: () => void;
    private version: number;

    constructor(eventBus: GameEventBus) {
        this.state = { tutorialCompleted: false, currentStep: 0 };
        this.eventBus = eventBus;
        this.unsubscribe = eventBus.subscribe((event) => this.handleEvent(event));
        this.version = 0;
    }

    public getCurrentStep(): TutorialStep | null {
        if (this.state.tutorialCompleted) return null;
        return TUTORIAL_STEPS[this.state.currentStep] ?? null;
    }

    public notifyTarget(targetKey: string): void {
        const step = this.getCurrentStep();
        if (step && !step.eventType && step.targetKey === targetKey) this.advance();
    }

    public advance(): void {
        if (this.state.tutorialCompleted) return;
        const wasCompleted = this.state.tutorialCompleted;
        this.state.currentStep += 1;
        if (this.state.currentStep >= TUTORIAL_STEPS.length) {
            this.state.currentStep = TUTORIAL_STEPS.length;
            this.state.tutorialCompleted = true;
        }
        this.version += 1;
        if (!wasCompleted && this.state.tutorialCompleted) {
            this.eventBus.emit({ type: GameEventType.TUTORIAL_COMPLETED });
        }
    }

    public skip(): void {
        if (this.state.tutorialCompleted) return;
        this.state = { tutorialCompleted: true, currentStep: TUTORIAL_STEPS.length };
        this.version += 1;
        this.eventBus.emit({ type: GameEventType.TUTORIAL_COMPLETED });
    }

    public getState(): TutorialState { return { ...this.state }; }
    public getVersion(): number { return this.version; }

    public restore(state: TutorialState): void {
        const currentStep = Number.isFinite(state.currentStep)
            ? Math.min(TUTORIAL_STEPS.length, Math.max(0, Math.floor(state.currentStep)))
            : 0;
        this.state = {
            tutorialCompleted: Boolean(state.tutorialCompleted) || currentStep >= TUTORIAL_STEPS.length,
            currentStep,
        };
        this.version += 1;
    }

    public reset(): void { this.state = { tutorialCompleted: false, currentStep: 0 }; this.version += 1; }
    public destroy(): void { this.unsubscribe(); }

    private handleEvent(event: GameEvent): void {
        const step = this.getCurrentStep();
        if (step?.eventType === event.type) this.advance();
    }
}

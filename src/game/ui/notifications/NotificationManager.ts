import gsap from "gsap";
import { Container, Graphics, Text } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";

export enum NotificationType {
    INFO = "info",
    SUCCESS = "success",
    WARNING = "warning",
    ERROR = "error",
    RARE_DROP = "rare_drop",
}

export interface GameNotification {
    type: NotificationType;
    title: string;
    message: string;
}

const TYPE_COLORS: Readonly<Record<NotificationType, number>> = {
    [NotificationType.INFO]: 0x60a5fa,
    [NotificationType.SUCCESS]: GameTheme.colors.jade,
    [NotificationType.WARNING]: GameTheme.colors.gold,
    [NotificationType.ERROR]: GameTheme.colors.danger,
    [NotificationType.RARE_DROP]: 0xc084fc,
};

export class NotificationManager {
    private view: Container;
    private queue: GameNotification[];
    private showing: boolean;
    private recentKeys: Map<string, number>;

    constructor() {
        this.view = new Container();
        this.view.position.set(840, 82);
        this.queue = [];
        this.showing = false;
        this.recentKeys = new Map<string, number>();
    }

    public getView(): Container { return this.view; }

    public notify(notification: GameNotification): void {
        const key = `${notification.type}:${notification.title}:${notification.message}`;
        const now = Date.now();
        if (now - (this.recentKeys.get(key) ?? 0) < 1500) return;
        this.recentKeys.set(key, now);
        this.queue.push(notification);
        if (this.queue.length > 5) this.queue.shift();
        this.showNext();
    }

    public destroy(): void {
        gsap.killTweensOf(this.view.children);
        this.view.destroy({ children: true });
        this.queue = [];
        this.recentKeys.clear();
    }

    private showNext(): void {
        if (this.showing) return;
        const notification = this.queue.shift();
        if (!notification) return;
        this.showing = true;
        const card = new Container();
        const color = TYPE_COLORS[notification.type];
        const background = new Graphics()
            .roundRect(0, 0, 410, 58, 8)
            .fill({ color: GameTheme.colors.panel, alpha: 0.97 })
            .stroke({ color, width: notification.type === NotificationType.RARE_DROP ? 3 : 1 });
        const text = new Text({
            text: `${notification.title}\n${notification.message}`,
            style: { fill: GameTheme.colors.text, fontSize: 12, fontWeight: "bold" },
        });
        text.position.set(10, 8);
        card.addChild(background, text);
        card.x = 440;
        this.view.addChild(card);
        gsap.to(card, {
            x: 0,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => gsap.to(card, {
                alpha: 0,
                y: -12,
                delay: notification.type === NotificationType.RARE_DROP ? 2.5 : 1.8,
                duration: 0.25,
                onComplete: () => {
                    card.destroy({ children: true });
                    this.showing = false;
                    this.showNext();
                },
            }),
        });
    }
}

import gsap from "gsap";
import { Container, Graphics, Text } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";

export class GameButton extends Container {
    constructor(label: string, width: number, height: number, action: () => void) {
        super();
        const background = new Graphics()
            .roundRect(0, 0, width, height, GameTheme.radius.sm)
            .fill(GameTheme.colors.panelLight)
            .stroke({ color: GameTheme.colors.jade, width: 1 });
        const text = new Text({ text: label, style: { fill: GameTheme.colors.text, fontSize: 12, fontWeight: "bold" } });
        text.anchor.set(0.5);
        text.position.set(width / 2, height / 2);
        this.eventMode = "static";
        this.cursor = "pointer";
        this.addChild(background, text);
        this.on("pointerover", () => gsap.to(this.scale, { x: 1.025, y: 1.025, duration: GameTheme.animation.fast }));
        this.on("pointerout", () => gsap.to(this.scale, { x: 1, y: 1, duration: GameTheme.animation.fast }));
        this.on("pointerdown", () => gsap.to(this.scale, { x: 0.97, y: 0.97, duration: 0.06 }));
        this.on("pointerup", () => gsap.to(this.scale, { x: 1.025, y: 1.025, duration: 0.06 }));
        this.on("pointertap", action);
    }
}

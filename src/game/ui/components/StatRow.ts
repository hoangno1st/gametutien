import { Container, Text } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";
export class StatRow extends Container {
    constructor(label: string, value: string, width = 240) {
        super();
        const left = new Text({ text: label, style: { fill: GameTheme.colors.muted, fontSize: 12 } });
        const right = new Text({ text: value, style: { fill: GameTheme.colors.text, fontSize: 12, fontWeight: "bold" } });
        right.anchor.set(1, 0); right.x = width; this.addChild(left, right);
    }
}

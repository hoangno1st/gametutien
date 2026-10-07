import { Text } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";
export class SectionHeader extends Text {
    constructor(value: string) {
        super({ text: value, style: { fill: GameTheme.colors.gold, fontSize: 18, fontWeight: "bold" } });
    }
}

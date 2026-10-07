import { Text } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";
export class CurrencyDisplay extends Text {
    constructor(label: string, value: number) { super({ text: `${label}: ${value}`, style: { fill: GameTheme.colors.gold, fontSize: 14, fontWeight: "bold" } }); }
    public setAmount(label: string, value: number): void { this.text = `${label}: ${Math.max(0, Math.floor(value))}`; }
}

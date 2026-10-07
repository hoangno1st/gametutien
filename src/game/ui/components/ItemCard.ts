import { Container, Graphics, Text } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";
export class ItemCard extends Container {
    constructor(name: string, details: string, color: number, width = 180, height = 58) {
        super();
        this.addChild(new Graphics().roundRect(0, 0, width, height, 6).fill(GameTheme.colors.panelLight).stroke({ color, width: 2 }));
        const nameText = new Text({ text: name, style: { fill: color, fontSize: 12, fontWeight: "bold" } });
        const detailText = new Text({ text: details, style: { fill: GameTheme.colors.muted, fontSize: 10 } });
        nameText.position.set(8, 7); detailText.position.set(8, 28); this.addChild(nameText, detailText);
    }
}

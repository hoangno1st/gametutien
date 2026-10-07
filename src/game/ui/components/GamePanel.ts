import { Container, Graphics } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";

export class GamePanel extends Container {
    constructor(width: number, height: number) {
        super();
        this.addChild(new Graphics()
            .roundRect(0, 0, width, height, GameTheme.radius.md)
            .fill({ color: GameTheme.colors.panel, alpha: 0.96 })
            .stroke({ color: GameTheme.colors.gold, width: 1, alpha: 0.45 }));
    }
}

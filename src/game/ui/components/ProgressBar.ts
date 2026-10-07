import { Container, Graphics, Text } from "pixi.js";
import { GameTheme } from "../theme/GameTheme";

export class ProgressBar extends Container {
    private fillView: Graphics;
    private labelText: Text;
    private barWidth: number;
    private barHeight: number;
    private fillColor: number;

    constructor(width: number, height: number, fillColor: number = GameTheme.colors.jade) {
        super();
        this.barWidth = width;
        this.barHeight = height;
        this.fillColor = fillColor;
        const background = new Graphics()
            .roundRect(0, 0, width, height, height / 2)
            .fill(GameTheme.colors.background)
            .stroke({ color: GameTheme.colors.panelLight, width: 1 });
        this.fillView = new Graphics();
        this.labelText = new Text({
            text: "",
            style: { fill: GameTheme.colors.text, fontSize: 11, fontWeight: "bold" },
        });
        this.labelText.anchor.set(0.5);
        this.labelText.position.set(width / 2, height / 2);
        this.addChild(background, this.fillView, this.labelText);
    }

    public setValue(current: number, maximum: number, label?: string): void {
        const safeMax = Number.isFinite(maximum) && maximum > 0 ? maximum : 1;
        const safeCurrent = Number.isFinite(current) ? Math.min(safeMax, Math.max(0, current)) : 0;
        const ratio = safeCurrent / safeMax;
        this.fillView.clear()
            .roundRect(1, 1, Math.max(0, (this.barWidth - 2) * ratio), this.barHeight - 2, (this.barHeight - 2) / 2)
            .fill(this.fillColor);
        this.labelText.text = label ?? `${safeCurrent.toFixed(2)} / ${safeMax.toFixed(2)}`;
    }
}

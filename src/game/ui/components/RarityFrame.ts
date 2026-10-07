import { Graphics } from "pixi.js";
export class RarityFrame extends Graphics {
    constructor(width: number, height: number, color: number) { super(); this.roundRect(0, 0, width, height, 6).stroke({ color, width: 2 }); }
}

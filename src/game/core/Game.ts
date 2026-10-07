import { Application } from "pixi.js";
import { MainScene } from "../scenes/MainScene.ts";
import { validateGameData } from "../validation/validateGameData";
import { FatalErrorBoundary } from "../errors/FatalErrorBoundary";

export class Game {
    private app: Application;
    private mainScene: MainScene | null;
    private fatalErrorBoundary: FatalErrorBoundary;

    constructor() {
        this.app = new Application();
        this.mainScene = null;
        this.fatalErrorBoundary = new FatalErrorBoundary({
            onFatal: () => this.mainScene?.blockSavingForFatalError(),
            getSaveJson: () => this.mainScene?.exportSaveJson() ?? null,
        });
    }

    public async init(): Promise<void> {
        try {
            if (import.meta.env.DEV) validateGameData();
            await this.app.init({
                width: 1280,
                height: 240,
                background: "#18181f",
                antialias: false,
            });

            document.body.appendChild(this.app.canvas);

            this.mainScene = new MainScene(this.app);
            await this.mainScene.init();
        } catch (error) {
            this.fatalErrorBoundary.show(error);
            throw error;
        }
    }
}

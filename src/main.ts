import "./style.css";
import { Game } from "./game/core/Game";

async function main(): Promise<void> {
    const game = new Game();

    await game.init();
}

void main().catch(() => {
    // FatalErrorBoundary owns the recovery UI.
});

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
            console.warn("Không thể đăng ký service worker", error);
        });
    });
}

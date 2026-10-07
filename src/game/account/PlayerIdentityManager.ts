import { AccountType } from "./AccountModels";
import type { PlayerAccount } from "./AccountModels";

const PLAYER_ID_KEY = "tien-lo-idle-player-id";

export class PlayerIdentityManager {
    private account: PlayerAccount;

    constructor(storage: Storage | null = PlayerIdentityManager.getStorage()) {
        let localPlayerId = storage?.getItem(PLAYER_ID_KEY) ?? "";
        if (!localPlayerId) {
            localPlayerId = typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            try { storage?.setItem(PLAYER_ID_KEY, localPlayerId); } catch { /* local-only fallback */ }
        }
        this.account = { localPlayerId, type: AccountType.GUEST };
    }

    public getAccount(): PlayerAccount { return { ...this.account }; }

    private static getStorage(): Storage | null {
        try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; }
    }
}

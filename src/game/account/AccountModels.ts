export enum AccountType {
    GUEST = "guest",
    AUTHENTICATED = "authenticated",
}

export interface PlayerAccount {
    localPlayerId: string;
    type: AccountType;
    externalAccountId?: string;
}

export interface SaveSummary {
    updatedAt: number;
    chapter: number;
    realm: string;
}

export interface CloudSaveConflict {
    local: SaveSummary;
    cloud: SaveSummary;
}

export enum CloudSaveChoice {
    LOCAL = "local",
    CLOUD = "cloud",
}

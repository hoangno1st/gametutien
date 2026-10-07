export const ARTIFACT_FRAGMENTS_REQUIRED = 40;
export const ARTIFACT_FRAGMENT_DROP_CHANCE = 0.2;
export const ARTIFACT_FRAGMENT_DROP_MIN = 1;
export const ARTIFACT_FRAGMENT_DROP_MAX = 3;
export const MAX_ARTIFACT_STAR = 5;
export const ARTIFACT_STAR_COSTS: Readonly<Record<number, number>> = {
    2: 20,
    3: 40,
    4: 80,
    5: 160,
};
export const ARTIFACT_STAR_MULTIPLIERS: Readonly<Record<number, number>> = {
    1: 1,
    2: 1.2,
    3: 1.45,
    4: 1.75,
    5: 2.1,
};

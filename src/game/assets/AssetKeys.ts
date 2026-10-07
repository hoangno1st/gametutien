const heroFrames = (animation: string, count: number): ReadonlyArray<string> =>
    Array.from({ length: count }, (_, index) =>
        `/assets/hero/${animation}/frame_${String(index).padStart(3, "0")}.png`);

export const AssetKeys = {
    characters: {
        player: {
            idle: heroFrames("walk", 6),
            run: heroFrames("run", 8),
            attack: heroFrames("slash", 6),
            skill: heroFrames("spell", 6),
            hit: heroFrames("walk", 6),
            death: heroFrames("walk", 6),
        },
    },
    enemies: {
        generic: "enemy_generic",
        eliteAura: "effect_elite_aura",
    },
    bosses: { generic: "boss_generic" },
    equipment: { weapon: "icon_weapon", armor: "icon_armor", bracelet: "icon_bracelet" },
    artifacts: { generic: "icon_artifact" },
    skills: { swordQi: "skill_sword_qi", swordArray: "skill_sword_array", heal: "skill_heal" },
    ui: { panel: "ui_panel", button: "ui_button", rarityFrame: "ui_rarity_frame" },
    effects: { hit: "effect_hit", critical: "effect_critical", heal: "effect_heal" },
    backgrounds: Object.fromEntries(
        Array.from({ length: 9 }, (_, index) => [
            `chapter${index + 1}`,
            `chapter_${index + 1}_background`,
        ]),
    ) as Readonly<Record<string, string>>,
    audio: {
        normalHit: "/audio/normal-hit.ogg",
        critical: "/audio/crit.ogg",
        skill: "/audio/skill.ogg",
        bossPhase: "/audio/boss-phase.ogg",
        button: "/audio/button.ogg",
        craft: "/audio/craft.ogg",
        rareCraft: "/audio/rare-craft.ogg",
        breakthrough: "/audio/breakthrough.ogg",
        artifactCraft: "/audio/artifact-craft.ogg",
        gameplayBgm: "/audio/gameplay-bgm.ogg",
        bossBgm: "/audio/boss-bgm.ogg",
    },
} as const;

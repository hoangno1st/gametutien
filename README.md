# Tiên Lộ Idle

Tiên Lộ Idle is a local-first browser cultivation game. The hero fights automatically, gathers loot, crafts equipment and pills, develops Techniques and Artifacts, accumulates cultivation, then breaks through to harder realms.

Current release: **0.1.0**.

## Features

- Auto combat with HP/MP, skills, VFX, diverse enemies, elites, rare events and multi-phase bosses.
- Nine chapters × 50 stages, aligned with nine cultivation realms.
- Equipment rarity, random stats, unlock, reroll/lock, enhancement and salvage.
- Refining, alchemy, pills, timed buffs and crafting catalysts.
- Artifacts with stars/passives, Techniques with milestones, cultivation and breakthrough.
- Quests, achievements, daily tasks, tutorial and offline cultivation.
- Versioned local save, migrations, import/export, responsive UI, accessibility settings and PWA shell.

## Game Loop

Auto Combat → Loot → Refining/Alchemy → Equipment/Pills → Artifacts/Techniques → Cultivation/Breakthrough → Boss → Next Chapter.

Rare quality is an exciting accelerator, not a Chapter 1 completion requirement.

## Controls

Combat is automatic. Use mouse or touch to navigate the bottom menu, craft/equip items, use pills, configure skills and trigger breakthroughs. Important terms support hover and tap tooltips.

## Tech Stack

- Vite 8 and TypeScript 6
- PixiJS 8 for gameplay and game UI
- GSAP for transitions and combat/UI effects
- Browser localStorage and a minimal service worker; no backend is required

## Development

```bash
npm install
npm run dev
```

Optional future API configuration is documented in `.env.example`. Never commit a real `.env` file.

## Build and Preview

```bash
npx tsc --noEmit
npm run build
npm run preview
```

The static output is written to `dist/`. `vercel.json` supplies build settings and SPA fallback for Vercel.

## Save System

- Local-first autosave with debounce plus page-hide/visibility saving.
- Current schema version: **8**, with sequential legacy migration support.
- Settings provides manual save/load, JSON export/import validation and confirmed reset.
- Offline cultivation is stored; static PWA caching never caches localStorage data.
- Storage, guest identity and cloud conflict models are abstracted, but cloud sync/login is not enabled in 0.1.0.

## Architecture

- `src/game/core`, `scenes`: application bootstrap and gameplay orchestration.
- `assets`, `backgrounds`, `entities`, `enemies`, `bosses`, `vfx`, `audio`: presentation and combat runtime.
- `chapters`, `loot`, `materials`, `balance`: data-driven content and progression balance.
- `equipment`, `crafting`, `refining`, `alchemy`, `artifacts`, `techniques`: power systems.
- `cultivation`, `stats`, `buffs`, `skills`: character state and combat calculations.
- `events`, `quests`, `achievements`, `daily`, `tutorial`: objectives and onboarding.
- `inventory`, `save`, `account`, `analytics`, `errors`: persistence and production foundations.
- `devtools`, `validation`, `qa`: pure-data balance tools and release audits; never used by production combat.
- `ui`: PixiJS menu, reusable components, notifications and tooltips.

Definitions/configs are immutable data; mutable runtime state lives in managers/entities. UI does not own gameplay calculations.

## Screenshots

No verified release screenshots are committed yet. Add real captures under `docs/screenshots/` in a future release; this project intentionally does not use generated mock screenshots.

## Roadmap

- Replace remaining fallback graphics and placeholder audio with final licensed assets.
- Split the main bundle and extend automated simulation/regression coverage.
- Balance full Chapter 1–9 progression from playtest telemetry.
- Optionally connect consent-aware analytics, authentication and conflict-safe cloud saves.
- Evaluate the production-locked Luân Hồi/Chuyển Sinh foundation after endgame balance is stable.

See [QA_PLAYTHROUGH.md](QA_PLAYTHROUGH.md) for the full release checklist and [CHANGELOG.md](CHANGELOG.md) for release notes.

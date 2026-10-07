# Tiên Lộ Idle 0.1.0 — Manual QA Checklist

Run this checklist against a production preview (`npm run build`, then `npm run preview`). Use browser DevTools only to accelerate progression; do not ship debug controls.

## New-save critical path

- [ ] Clear site data and start at Chapter 1, Stage 1 with no console error.
- [ ] Tutorial advances through combat, inventory, crafting, equip, cultivation, breakthrough, Artifact and Technique guidance.
- [ ] Player auto-attacks; normal/critical hits, skills, HP, MP, death and recovery behave correctly.
- [ ] Enemies drop Spirit Stones/materials once; inventory quantities never become negative or non-finite.
- [ ] Craft an equipment item, equip it, and verify stats apply exactly once.
- [ ] Craft/use pills and verify their cost, recovery/buff and duration.
- [ ] Fill cultivation, break through manually, and verify no event auto-breaks through.
- [ ] Defeat Stage 50 boss, verify boss reward once, then enter the next chapter.

## Chapters 1–9 accelerated audit

For each chapter, restore an exported QA save at stages 1, 49 and 50.

- [ ] Exactly four normal enemy definitions resolve and one boss ID resolves.
- [ ] Normal stages and boss stage load without missing-data errors.
- [ ] Chapter identity mechanic is observable (speed, poison, burst, summon, lightning, reduction, berserk, durability, tribulation).
- [ ] Loot tables, chapter materials, boss materials, Artifact fragments and catalysts resolve.
- [ ] Three equipment and at least two pill recipes resolve with valid realm requirements.
- [ ] Background transitions without recreating the Pixi application.
- [ ] Quest/achievement/daily progress increments once per event.
- [ ] Save/reload restores the same chapter and stage.

## Save and recovery

- [ ] Load fixtures from schema versions 1–7; each migrates to version 8.
- [ ] Export save, reset with two-step confirmation, import it, and compare chapter, realm, currency, inventory, equipment and settings.
- [ ] Corrupt imported JSON and verify it is rejected without overwriting the good save.
- [ ] Trigger a test runtime exception in development; fatal overlay appears, autosave stops, Export Save and Reload work.
- [ ] Close/reopen after offline time; cultivation gain is capped and no automatic breakthrough occurs.

## UX, PWA and technical

- [ ] Desktop and 320px-wide viewport retain access to every menu and action.
- [ ] Touch/tap opens important term tooltips; disabled actions explain missing requirements.
- [ ] Reduce Motion, High Contrast, UI Scale and VFX Quality persist after reload.
- [ ] Purple/Gold/Red crafting and rare events show queued notifications without flooding the screen.
- [ ] Install manifest is detected; a second load can use cached static shell while localStorage remains uncached.
- [ ] No per-tick, damage, spawn or loot console spam in production.
- [ ] Ten-minute combat soak shows no obvious listener/tween/container growth.
- [ ] Currency, stats and timers never become negative, `NaN` or `Infinity`.

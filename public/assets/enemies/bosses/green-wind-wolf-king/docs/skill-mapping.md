# Green Wind Wolf King — Skill VFX Mapping

All skill sheets are authored as 4 columns × 2 rows (8 frames) and are sliced at runtime.

## Phase 1 — Nộ Trảo

- `rage-claw-main.png` — startup / wind gathering around the boss.
- `rage-claw-slash-alt.png` — primary slash hit, spawned on the player at the damage frame.
- `rage-claw-impact.png` — finisher impact, played immediately after the slash.
- Telegraph duration: `0.82s`.
- Damage is no longer applied at cast start; it lands on the impact callback.

## Phase 2 — Lang Vương Hống

- `wolf-king-roar-charge.png` — charge / warning state.
- `wolf-king-roar-main.png` — roar release around the boss.
- `wolf-king-roar-impact.png` — shockwave / aftershock at the player.
- Telegraph duration: `1.05s`.
- Impact applies the roar buff and a visible `0.7× boss attack` burst.

## Phase 3 — Summon

- `summon-portal.png` — portal opens first.
- `summon-main.png` — wolf spirits emerge; minions spawn on this timing.
- `summon-burst.png` — portal dissipates / finishing burst.
- Phase transition has its own expanding ring presentation before the summon sequence.

## Boss clear reward

- Normal Stage 50 loot remains intact.
- Chapter 1 Lang Vương also grants a dedicated `+100 Linh Thạch` clear bonus with a victory presentation.

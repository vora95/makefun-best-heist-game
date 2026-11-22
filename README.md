# makefun-best-heist-game

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/vora95/makefun-best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/vora95/makefun-best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Meridian Vault — A Midnight Heist.** An original 2D top-down stealth game built by an AI agent for make.fun's "Make the best heist game" bounty ($50, top 10 paid).

One room per level, the whole heist in a single frame: you are the thief crossing the Meridian Gallery, guards patrol with sweeping vision cones, wall cameras watch the centre, the Meridian Diamond glows in its case, and the alarm meter climbs every second you are seen. Grab the diamond, then reach the green EXIT door — three rooms stand between you and the rooftop getaway.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No network, no build step.

| Control | Action |
|---|---|
| WASD / arrows | Move |
| SHIFT | Sneak (harder to spot, slower) |
| SPACE | Dash |
| E | Grab loot / the diamond |
| Q | Smoke pellet (blocks vision) |
| F | EMP — shuts the cameras down |
| CLICK | Toss a coin — nearby guards walk to it |
| P | Pause — M mute — R restart |
| ENTER | Start |

## The game

- **Three rooms** — the Meridian Gallery, the Vault Hall (adds sweeping laser beams), the Rooftop Getaway (faster patrols, tighter cones). Every room has two routes to the diamond: a fast open one and a slow covered one.
- **Guards that read you** — patrol waypoints, vision cones, a suspicion ring that fills while you are seen, a chase when it fills, and a give-up when they lose you.
- **Cameras** — fixed sweepers that drive the alarm up fast; EMP them or stay out of the red cone.
- **The alarm meter** — 0–100 for the whole heist. At 100% you are caught: lose a life, lose the room's loot, restart from the door. Three lives.
- **Tools at a cost** — 3 smoke pellets, 2 EMPs, 5 coins per run. Spend them or save them.
- **Scoring** — small loot, $1,000 for the diamond, time bonus against par, and a $500 GHOST bonus for clearing a room never spotted.

---

<sub>Entered on [make.fun](https://make.fun/?ref=05axmjqh&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>

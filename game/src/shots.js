// Deterministic screenshot states: ?shot=start|play|alarm|end fixes the
// whole scene (thief, guards, cameras, alarm, loot) so every screenshot is
// reproducible and shows the heist at its best. No randomness here — the
// same URL always renders the same frame.
import { buildLevels } from './levels.js';
import { Guard } from './guards.js';
import { Camera } from './cameras.js';
import { Thief } from './player.js';

// Build a fully staged level state for one named shot.
export function shotState(name) {
  const levels = buildLevels();
  if (name === 'start') return { shot: 'start' };

  if (name === 'alarm') {
    const level = levels[1];
    const guards = level.guards.map((g) => new Guard(g));
    const cameras = level.cameras.map((c) => new Camera(c));
    const thief = new Thief(level.entry);
    // Mid-heist, alarm nearly full: thief crouched behind the centre case
    // with the diamond already taken, one guard in full chase.
    thief.x = level.diamond.x - 190;
    thief.y = level.diamond.y + 150;
    thief.sneaking = true;
    guards[0].x = level.diamond.x - 60;
    guards[0].y = level.diamond.y + 150;
    guards[0].angle = Math.atan2(thief.y - guards[0].y, thief.x - guards[0].x);
    guards[0].state = 'chase';
    guards[0].suspicion = 100;
    guards[1].x = level.diamond.x + 120;
    guards[1].y = level.diamond.y - 90;
    guards[1].angle = Math.PI / 2;
    guards[1].suspicion = 72;
    guards[1].state = 'alert';
    guards[2].x = level.diamond.x - 260;
    guards[2].y = level.diamond.y - 120;
    guards[2].angle = Math.PI / 4;
    guards[2].suspicion = 40;
    cameras[0].angle = 0.5;
    cameras[1].angle = Math.PI - 0.5;
    return {
      shot: 'play',
      levelIndex: 1,
      level,
      guards,
      cameras,
      thief,
      alarm: 82,
      score: 1450,
      lives: 2,
      elapsed: 61,
      diamondTaken: true,
      time: 3.2,
      smokes: [],
      seen: true,
    };
  }

  if (name === 'end') {
    return {
      shot: 'end',
      score: 7240,
      elapsed: 214,
      timesCaught: 1,
      ghostBonus: false,
    };
  }

  // Default: 'play' — level 1, the cover shot. The thief sneaks along the
  // bottom cover toward the diamond, a guard's cone sweeps across the room,
  // the wall camera watches the centre, loot glints, alarm at 32%.
  const level = levels[0];
  const guards = level.guards.map((g) => new Guard(g));
  const cameras = level.cameras.map((c) => new Camera(c));
  const thief = new Thief(level.entry);
  thief.x = level.diamond.x - 260;
  thief.y = level.diamond.y + 210;
  thief.sneaking = true;
  thief.facing = -Math.PI / 2;
  guards[0].x = (level.diamond.x + 120);
  guards[0].y = level.diamond.y - 40;
  guards[0].angle = Math.PI * 0.78;
  guards[0].suspicion = 34;
  guards[0].state = 'alert';
  guards[1].x = level.diamond.x - 330;
  guards[1].y = level.diamond.y + 190;
  guards[1].angle = -Math.PI * 0.15;
  cameras[0].angle = Math.PI / 2 + 0.45;
  return {
    shot: 'play',
    levelIndex: 0,
    level,
    guards,
    cameras,
    thief,
    alarm: 32,
    score: 450,
    lives: 3,
    elapsed: 38,
    diamondTaken: false,
    time: 2.1,
    smokes: [{ x: thief.x + 120, y: thief.y - 60, r: 95, time: 2 }],
    seen: false,
  };
}

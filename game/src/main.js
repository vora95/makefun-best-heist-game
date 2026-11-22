// MERIDIAN VAULT — game loop and state machine.
// States: title -> play -> (level clear) -> play -> win | gameover.
// The alarm is the shared pressure: guards and cameras feed it, hiding
// bleeds it off, 100% costs a life and resets the room.
import { VIEW_W, VIEW_H, ROOM, SCORE_DIAMOND, SCORE_EXIT, SCORE_GHOST_BONUS, SCORE_TIME_BONUS_PER_SEC, ALARM_CHASE_GAIN, ALARM_SPOT_GAIN, ALARM_CAMERA_GAIN, ALARM_LASER_HIT, ALARM_DECAY, ALARM_AFTER_CAUGHT, SMOKE_TIME, EMP_TIME, COIN_RADIUS, COIN_TIME, THIEF_RADIUS } from './config.js';
import { buildLevels } from './levels.js';
import { Guard } from './guards.js';
import { Camera } from './cameras.js';
import { Thief } from './player.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { rectContains } from './vision.js';
import { shotState } from './shots.js';
import * as render from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const input = createInput(canvas);
const audio = createAudio();
const levels = buildLevels();

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const shot = shotName ? shotState(shotName) : null;

const state = {
  mode: shot ? (shot.shot === 'start' ? 'title' : shot.shot === 'end' ? 'win' : 'play') : 'title',
  levelIndex: 0,
  level: null,
  guards: [],
  cameras: [],
  thief: null,
  alarm: 0,
  score: 0,
  lives: 3,
  elapsed: 0,
  levelTime: 0,
  diamondTaken: false,
  timesCaught: 0,
  ghostBonus: false,
  spottedThisLevel: false,
  time: 0,
  smokes: [],
  caughtFlash: 0,
  laserCooldown: 0,
  paused: false,
};

function loadLevel(index) {
  state.levelIndex = index;
  state.level = levels[index];
  state.guards = state.level.guards.map((g) => new Guard(g));
  state.cameras = state.level.cameras.map((c) => new Camera(c));
  state.thief = new Thief(state.level.entry);
  state.alarm = 0;
  state.levelTime = 0;
  state.diamondTaken = false;
  state.spottedThisLevel = false;
  state.smokes = [];
  state.caughtFlash = 0;
}

function startGame() {
  state.score = 0;
  state.lives = 3;
  state.elapsed = 0;
  state.timesCaught = 0;
  state.ghostBonus = false;
  loadLevel(0);
  state.mode = 'play';
}

function levelClear() {
  const timeBonus = Math.max(0, Math.round((state.level.par - state.levelTime) * SCORE_TIME_BONUS_PER_SEC));
  state.score += SCORE_EXIT + timeBonus;
  if (!state.spottedThisLevel) {
    state.score += SCORE_GHOST_BONUS;
    state.ghostBonus = true;
  }
  audio.win();
  if (state.levelIndex + 1 >= levels.length) {
    state.mode = 'win';
  } else {
    loadLevel(state.levelIndex + 1);
  }
}

function caught() {
  state.lives -= 1;
  state.timesCaught += 1;
  audio.caught();
  state.caughtFlash = 1.2;
  if (state.lives <= 0) {
    state.mode = 'gameover';
    return;
  }
  // Lose the run's loot progress in this room, keep the score banked so far.
  state.alarm = ALARM_AFTER_CAUGHT;
  state.thief.reset(state.level.entry);
  for (const loot of state.level.loot) loot.taken = false;
  state.diamondTaken = false;
  state.guards = state.level.guards.map((g) => new Guard(g));
  state.cameras = state.level.cameras.map((c) => new Camera(c));
  state.smokes = [];
}

// ---- Per-frame update (play mode only) ----
function update(dt) {
  state.time += dt;
  state.elapsed += dt;
  state.levelTime += dt;
  state.caughtFlash = Math.max(0, state.caughtFlash - dt);
  state.laserCooldown = Math.max(0, state.laserCooldown - dt);

  const thief = state.thief;
  const level = state.level;

  // Tools.
  if (input.wasPressed('KeyQ')) {
    const smoke = thief.useSmoke();
    if (smoke) {
      smoke.time = SMOKE_TIME;
      state.smokes.push(smoke);
      audio.click();
    }
  }
  if (input.wasPressed('KeyF') && thief.tools.emp > 0) {
    thief.tools.emp -= 1;
    for (const cam of state.cameras) cam.emp();
    audio.click();
  }
  if (input.clicked && thief.tools.coins > 0) {
    if (thief.tossCoin(input.clickX, input.clickY)) {
      for (const g of state.guards) {
        if (Math.hypot(g.x - input.clickX, g.y - input.clickY) < COIN_RADIUS) {
          g.distract(input.clickX, input.clickY, COIN_TIME);
        }
      }
      audio.click();
    }
  }

  thief.update(dt, input, level);
  for (const cam of state.cameras) cam.update(dt);
  for (const g of state.guards) g.update(dt, thief, level, state.smokes);

  // Smoke clouds fade.
  for (const s of state.smokes) s.time -= dt;
  state.smokes = state.smokes.filter((s) => s.time > 0);
  thief.hidden = state.smokes.some((s) => Math.hypot(thief.x - s.x, thief.y - s.y) < s.r * 0.8);

  // Alarm: rise while seen, bleed off while hidden.
  let seenByGuard = false;
  let chasing = false;
  for (const g of state.guards) {
    if (g.state === 'chase') chasing = true;
    if (g.suspicion > 0) seenByGuard = true;
  }
  let seenByCamera = false;
  for (const cam of state.cameras) {
    if (cam.canSee(thief, level, state.smokes)) seenByCamera = true;
  }
  if (seenByGuard || seenByCamera) state.spottedThisLevel = true;
  if (chasing) state.alarm += ALARM_CHASE_GAIN * dt;
  else if (seenByGuard) state.alarm += ALARM_SPOT_GAIN * dt;
  if (seenByCamera) state.alarm += ALARM_CAMERA_GAIN * dt;
  if (!seenByGuard && !seenByCamera && !chasing) state.alarm -= ALARM_DECAY * dt;
  state.alarm = Math.max(0, Math.min(100, state.alarm));
  if (seenByGuard && !state._spottedSound) {
    audio.spotted();
    state._spottedSound = true;
  }
  if (!seenByGuard) state._spottedSound = false;

  // Lasers (levels 2-3): crossing a live beam spikes the alarm.
  if (state.laserCooldown <= 0) {
    for (const laser of level.lasers || []) {
      const y = laser.top + ((laser.bottom - laser.top) * (0.5 + 0.5 * Math.sin(state.time * laser.speed * 0.02 + laser.phase * 6)));
      if (Math.abs(thief.y - y) < THIEF_RADIUS + 2 && Math.abs(thief.x - laser.x) < 112) {
        state.alarm = Math.min(100, state.alarm + ALARM_LASER_HIT);
        state.laserCooldown = 1.0;
        state.spottedThisLevel = true;
        audio.spotted();
      }
    }
  }

  // Loot pickup.
  if (input.wasPressed('KeyE')) {
    for (const loot of level.loot) {
      if (!loot.taken && Math.hypot(thief.x - loot.x, thief.y - loot.y) < 34) {
        loot.taken = true;
        state.score += loot.value;
        audio.pickup();
      }
    }
    const d = level.diamond;
    if (!state.diamondTaken && Math.hypot(thief.x - d.x, thief.y - d.y) < 40) {
      state.diamondTaken = true;
      state.score += SCORE_DIAMOND;
      audio.diamond();
    }
  }

  // Exit: only opens once the diamond is secured.
  if (state.diamondTaken && rectContains(level.exit, thief.x, thief.y)) {
    levelClear();
    return;
  }

  if (state.alarm >= 100) caught();
}

// ---- Render ----
function draw() {
  if (state.mode === 'title') {
    render.drawBackground(ctx);
    render.drawTitle(ctx);
    return;
  }
  if (state.mode === 'win') {
    render.drawBackground(ctx);
    render.drawWin(ctx, state);
    return;
  }
  if (state.mode === 'gameover') {
    render.drawBackground(ctx);
    render.drawGameOver(ctx, state);
    return;
  }
  render.drawBackground(ctx);
  render.drawCover(ctx, state.level);
  render.drawCones(ctx, state.level, state.guards, state.cameras);
  render.drawLasers(ctx, state.level, state);
  render.drawLoot(ctx, state.level, state);
  render.drawExit(ctx, state.level, state);
  render.drawCameras(ctx, state.cameras);
  render.drawGuards(ctx, state.guards);
  render.drawThief(ctx, state.thief, state);
  render.drawHUD(ctx, state);
  if (state.paused) render.drawPaused(ctx);
  render.drawCaughtFlash(ctx, state);
}

// ---- Screenshot mode: render one staged frame, then signal ready. ----
if (shot) {
  if (shot.shot === 'start') {
    draw();
  } else if (shot.shot === 'end') {
    state.score = shot.score;
    state.elapsed = shot.elapsed;
    state.timesCaught = shot.timesCaught;
    state.ghostBonus = shot.ghostBonus;
    draw();
  } else {
    state.levelIndex = shot.levelIndex;
    state.level = shot.level;
    state.guards = shot.guards;
    state.cameras = shot.cameras;
    state.thief = shot.thief;
    state.alarm = shot.alarm;
    state.score = shot.score;
    state.lives = shot.lives;
    state.elapsed = shot.elapsed;
    state.diamondTaken = shot.diamondTaken;
    state.time = shot.time;
    state.smokes = shot.smokes;
    draw();
  }
  window.__shotReady = true;
} else {
  // ---- Live game loop ----
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (input.wasPressed('KeyM')) audio.toggleMute();
    if (state.mode === 'title' && (input.wasPressed('Enter') || input.wasPressed('NumpadEnter'))) {
      audio.ensure();
      startGame();
    } else if ((state.mode === 'win' || state.mode === 'gameover') && input.wasPressed('KeyR')) {
      startGame();
    } else if (state.mode === 'play' && input.wasPressed('KeyR')) {
      startGame();
    } else if (state.mode === 'play' && input.wasPressed('KeyP')) {
      state.paused = !state.paused;
    }

    if (state.mode === 'play' && !state.paused) update(dt);
    draw();
    input.endFrame();
    requestAnimationFrame(frame);
  }
  loadLevel(0);
  state.mode = 'title';
  requestAnimationFrame(frame);
}

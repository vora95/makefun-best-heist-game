// All canvas drawing: the room, its cover, the vision cones, the thief,
// the guards, the cameras, the loot, the HUD with the alarm meter, and the
// title / win / game-over screens. The play frame is composed so one
// screenshot shows the whole heist at a glance.
import { VIEW_W, VIEW_H, HUD_H, ROOM, COLORS, GUARD_FOV, GUARD_RANGE, CAMERA_FOV, CAMERA_RANGE } from './config.js';

export function drawBackground(ctx) {
  ctx.fillStyle = '#0a0e1c';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Floor tiles.
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);
  ctx.strokeStyle = COLORS.floorTile;
  ctx.lineWidth = 1;
  for (let x = ROOM.x; x <= ROOM.x + ROOM.w; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, ROOM.y);
    ctx.lineTo(x, ROOM.y + ROOM.h);
    ctx.stroke();
  }
  for (let y = ROOM.y; y <= ROOM.y + ROOM.h; y += 60) {
    ctx.beginPath();
    ctx.moveTo(ROOM.x, y);
    ctx.lineTo(ROOM.x + ROOM.w, y);
    ctx.stroke();
  }
  // Outer wall.
  ctx.strokeStyle = COLORS.wallEdge;
  ctx.lineWidth = 5;
  ctx.strokeRect(ROOM.x - 2, ROOM.y - 2, ROOM.w + 4, ROOM.h + 4);
}

export function drawCover(ctx, level) {
  for (const c of level.cover) {
    ctx.fillStyle = COLORS.cover;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = COLORS.coverTop;
    ctx.fillRect(c.x, c.y, c.w, 7);
    ctx.strokeStyle = COLORS.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    if (c.kind === 'case') {
      // Glass display case: a pale shine across the top.
      ctx.fillStyle = 'rgba(127, 212, 255, 0.14)';
      ctx.fillRect(c.x + 6, c.y + 6, c.w - 12, c.h - 12);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(c.x + 10, c.y + 8, c.w / 3, 4);
    } else if (c.kind === 'pillar') {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fillRect(c.x + c.w / 2 - 4, c.y + 4, 8, c.h - 8);
    }
  }
}

function drawCone(ctx, x, y, angle, fov, range, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - fov / 2, angle + fov / 2);
  ctx.closePath();
  ctx.fill();
}

export function drawCones(ctx, level, guards, cameras) {
  for (const cam of cameras) {
    if (!cam.active) continue;
    drawCone(ctx, cam.x, cam.y, cam.angle, CAMERA_FOV, CAMERA_RANGE, COLORS.cameraCone);
  }
  for (const g of guards) {
    const range = g.state === 'chase' ? GUARD_RANGE + 40 : GUARD_RANGE;
    const fill = g.state === 'chase' || g.suspicion > 55 ? COLORS.guardConeAlert : COLORS.guardCone;
    drawCone(ctx, g.x, g.y, g.angle, GUARD_FOV, range, fill);
  }
}

export function drawLoot(ctx, level, state) {
  // The diamond case: the heist target, glowing gold in the middle of the room.
  const d = level.diamond;
  const pulse = 0.55 + 0.35 * Math.sin(state.time * 3);
  ctx.save();
  ctx.globalAlpha = 0.35 * pulse;
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(d.x, d.y, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#1b2340';
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(d.x, d.y, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = state.diamondTaken ? '#5b6478' : COLORS.goldGlow;
  ctx.beginPath();
  ctx.moveTo(d.x, d.y - 14);
  ctx.lineTo(d.x + 11, d.y);
  ctx.lineTo(d.x, d.y + 14);
  ctx.lineTo(d.x - 11, d.y);
  ctx.closePath();
  ctx.fill();
  if (!state.diamondTaken) {
    label(ctx, 'THE MERIDIAN DIAMOND', d.x, d.y - 40, COLORS.goldGlow, 13);
  }
  for (const loot of level.loot) {
    if (loot.taken) continue;
    ctx.fillStyle = loot.kind === 'gold' ? COLORS.gold : '#e8ecf8';
    ctx.beginPath();
    ctx.arc(loot.x, loot.y, loot.kind === 'gold' ? 11 : 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#141a2e';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(loot.kind === 'gold' ? '$' : '◆', loot.x, loot.y + 0.5);
  }
}

export function drawExit(ctx, level, state) {
  const e = level.exit;
  const open = state.diamondTaken;
  ctx.fillStyle = open ? COLORS.exit : '#3a435f';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = open ? '#a7f3d0' : COLORS.wallEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  label(ctx, open ? 'EXIT — GO!' : 'EXIT (LOCKED)', e.x + e.w / 2, e.y + e.h + 16, open ? COLORS.exit : COLORS.dim, 12);
}

export function drawGuards(ctx, guards) {
  for (const g of guards) {
    // Body: amber circle with a dark visor line facing the look direction.
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * 14, g.y + Math.sin(g.angle) * 14);
    ctx.stroke();
    // Suspicion arc above the guard.
    if (g.suspicion > 2) {
      ctx.strokeStyle = g.suspicion > 70 ? '#ff5d5d' : COLORS.gold;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 21, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * g.suspicion) / 100);
      ctx.stroke();
    }
    if (g.suspicion > 2) label(ctx, g.state === 'chase' ? '!' : '?', g.x, g.y - 30, '#ff8a8a', 16);
  }
}

export function drawCameras(ctx, cameras) {
  for (const cam of cameras) {
    ctx.fillStyle = cam.active ? COLORS.camera : '#5b6478';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cam.active ? '#fff' : '#3a435f';
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 5, cam.y + Math.sin(cam.angle) * 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
    if (!cam.active) label(ctx, 'EMP', cam.x, cam.y - 20, '#9aa5c4', 11);
  }
}

export function drawThief(ctx, thief, state) {
  for (const s of state.smokes) {
    ctx.fillStyle = COLORS.smoke;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const coin of thief.coins) {
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  // The thief: teal circle, black mask band, facing tick.
  ctx.fillStyle = thief.sneaking ? COLORS.thiefSneak : COLORS.thief;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, thief.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(thief.x - 9, thief.y - 4, 18, 7);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(thief.x, thief.y);
  ctx.lineTo(thief.x + Math.cos(thief.facing) * 14, thief.y + Math.sin(thief.facing) * 14);
  ctx.stroke();
  if (thief.sneaking) label(ctx, 'SNEAKING', thief.x, thief.y - 24, COLORS.thiefSneak, 11);
}

export function drawLasers(ctx, level, state) {
  for (const laser of level.lasers || []) {
    const y = laser.top + ((laser.bottom - laser.top) * (0.5 + 0.5 * Math.sin(state.time * laser.speed * 0.02 + laser.phase * 6)));
    const on = state.time % 1 < 0.85;
    // A live beam reads as a hazard line across the corridor, with an
    // emitter post at each end.
    ctx.strokeStyle = on ? COLORS.laser : 'rgba(255, 46, 99, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(laser.x - 110, y);
    ctx.lineTo(laser.x + 110, y);
    ctx.stroke();
    ctx.fillStyle = COLORS.laser;
    ctx.fillRect(laser.x - 118, y - 5, 8, 10);
    ctx.fillRect(laser.x + 110, y - 5, 8, 10);
    label(ctx, 'LASER', laser.x, y - 18, COLORS.laser, 10);
  }
}

function label(ctx, text, x, y, color, size) {
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(10, 14, 28, 0.75)';
  const w = ctx.measureText(text).width + 10;
  ctx.fillRect(x - w / 2, y - size / 2 - 2, w, size + 4);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// ---- HUD ----
export function drawHUD(ctx, state) {
  ctx.fillStyle = COLORS.hudBg;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.strokeStyle = COLORS.hudLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H);
  ctx.lineTo(VIEW_W, HUD_H);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('MERIDIAN VAULT', 20, 24);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '12px sans-serif';
  ctx.fillText(state.level.name, 20, 46);

  // Loot counter.
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(`LOOT $${state.score.toLocaleString('en-US')}`, 330, 24);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '12px sans-serif';
  ctx.fillText(state.diamondTaken ? 'DIAMOND SECURED — REACH THE EXIT' : 'STEAL THE DIAMOND, THEN REACH THE EXIT', 330, 46);

  // Alarm meter: the heart of the HUD.
  const ax = 700;
  const ay = 16;
  const aw = 240;
  const ah = 18;
  ctx.fillStyle = COLORS.dim;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ALARM', ax, ay - 2 + 0);
  ctx.fillStyle = '#1b2340';
  ctx.fillRect(ax, ay + 8, aw, ah);
  const frac = state.alarm / 100;
  ctx.fillStyle = frac < 0.4 ? COLORS.alarmLow : frac < 0.75 ? COLORS.alarmMid : COLORS.alarmHigh;
  ctx.fillRect(ax, ay + 8, aw * frac, ah);
  ctx.strokeStyle = COLORS.wallEdge;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ax, ay + 8, aw, ah);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`${Math.round(state.alarm)}%`, ax + aw + 10, ay + 17);
  ctx.fillStyle = state.alarm > 75 ? COLORS.alarmHigh : COLORS.dim;
  ctx.font = '11px sans-serif';
  ctx.fillText(state.alarm > 75 ? 'THEY ARE ONTO YOU!' : state.alarm > 35 ? 'SUSPICIOUS…' : 'UNDETECTED', ax, ay + 40);

  // Lives (masks) + tools.
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 15px sans-serif';
  let lx = 1010;
  ctx.fillText('♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, 3 - state.lives)), lx, 24);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '12px sans-serif';
  ctx.fillText(`SMOKE ${state.thief.tools.smoke}   EMP ${state.thief.tools.emp}   COIN ${state.thief.tools.coins}`, lx, 46);

  // Timer.
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(fmtTime(state.elapsed), VIEW_W - 18, 24);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '11px sans-serif';
  ctx.fillText(`PAR ${fmtTime(state.level.par)}`, VIEW_W - 18, 46);
  ctx.textAlign = 'left';
}

function fmtTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---- Screens ----
function dimScreen(ctx) {
  ctx.fillStyle = 'rgba(6, 9, 18, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function bigTitle(ctx, text, y, color, size) {
  ctx.font = `bold ${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, VIEW_W / 2, y);
}

function lines(ctx, rows, y0, step, color, size) {
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  rows.forEach((row, i) => ctx.fillText(row, VIEW_W / 2, y0 + i * step));
}

export function drawTitle(ctx) {
  dimScreen(ctx);
  bigTitle(ctx, 'MERIDIAN VAULT', 150, COLORS.gold, 64);
  bigTitle(ctx, 'A MIDNIGHT HEIST', 205, COLORS.text, 26);
  lines(
    ctx,
    [
      'One room. Two guards. One diamond. Get in, stay out of the cones, get out rich.',
      'Guards patrol with vision cones — cameras sweep the walls. If the alarm hits 100%, you are caught.',
      'Grab the Meridian Diamond, then reach the green EXIT door. Small loot along the way pays extra.',
    ],
    280,
    30,
    COLORS.dim,
    17,
  );
  lines(
    ctx,
    [
      'WASD / ARROWS — move      SHIFT — sneak (harder to spot)      SPACE — dash',
      'E — grab loot      Q — smoke pellet      F — EMP the cameras      CLICK — toss a coin to distract',
      'P — pause      M — mute      R — restart',
    ],
    400,
    30,
    COLORS.text,
    17,
  );
  bigTitle(ctx, 'PRESS ENTER TO START THE HEIST', 540, COLORS.thief, 24);
  lines(ctx, ['3 levels: the Gallery, the Vault Hall, the Rooftop Getaway. Finish unseen for a GHOST bonus.'], 600, 26, COLORS.dim, 15);
}

export function drawWin(ctx, state) {
  dimScreen(ctx);
  bigTitle(ctx, 'CLEAN GETAWAY!', 170, COLORS.exit, 56);
  lines(
    ctx,
    [
      `Final score: $${state.score.toLocaleString('en-US')} — all three rooms cleared.`,
      `Time ${fmtTime(state.elapsed)}   Caught ${state.timesCaught} time${state.timesCaught === 1 ? '' : 's'}   Ghost bonus ${state.ghostBonus ? 'earned (+$500)' : 'missed'}`,
      'The Meridian Diamond is yours. The museum will notice in the morning.',
    ],
    260,
    32,
    COLORS.text,
    18,
  );
  bigTitle(ctx, 'PRESS R TO RUN IT AGAIN', 470, COLORS.thief, 24);
}

export function drawGameOver(ctx, state) {
  dimScreen(ctx);
  bigTitle(ctx, 'CAUGHT!', 170, COLORS.alarmHigh, 56);
  lines(
    ctx,
    [
      'The alarm hit 100% three times. The guards have your mask — and your diamond.',
      `Score: $${state.score.toLocaleString('en-US')} — the vault keeps the rest.`,
    ],
    260,
    32,
    COLORS.text,
    18,
  );
  bigTitle(ctx, 'PRESS R TO TRY AGAIN', 420, COLORS.thief, 24);
}

export function drawCaughtFlash(ctx, state) {
  if (state.caughtFlash <= 0) return;
  ctx.fillStyle = `rgba(255, 45, 45, ${Math.min(0.4, state.caughtFlash * 0.35)})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  bigTitle(ctx, 'CAUGHT!', VIEW_H / 2 - 10, '#ffffff', 54);
}

export function drawPaused(ctx) {
  dimScreen(ctx);
  bigTitle(ctx, 'PAUSED', VIEW_H / 2 - 10, COLORS.text, 48);
  lines(ctx, ['P — resume      R — restart      M — mute'], VIEW_H / 2 + 50, 28, COLORS.dim, 16);
}

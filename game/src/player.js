// The thief: moves with WASD/arrows, sneaks with Shift, dashes with Space,
// grabs loot with E, and spends tools — smoke (Q), EMP (F), coin toss
// (click). The thief is a circle that slides along cover and room walls.
import {
  ROOM,
  THIEF_SPEED,
  THIEF_SNEAK_SPEED,
  THIEF_DASH_SPEED,
  DASH_TIME,
  DASH_COOLDOWN,
  THIEF_RADIUS,
  TOOLS_START,
} from './config.js';
import { resolveCircleRect } from './vision.js';

export class Thief {
  constructor(entry) {
    this.x = entry.x;
    this.y = entry.y;
    this.radius = THIEF_RADIUS;
    this.sneaking = false;
    this.hidden = false; // true while fully inside a smoke cloud
    this.facing = -Math.PI / 2;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.dashDir = { x: 0, y: -1 };
    this.tools = { ...TOOLS_START };
    this.coins = [];
  }

  reset(entry) {
    this.x = entry.x;
    this.y = entry.y;
    this.sneaking = false;
    this.hidden = false;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.coins = [];
  }

  update(dt, input, level) {
    const mv = input.moveVector();
    this.sneaking = input.sneaking();
    if (mv.x !== 0 || mv.y !== 0) this.facing = Math.atan2(mv.y, mv.x);

    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    if (input.wasPressed('Space') && this.dashCooldown <= 0 && (mv.x !== 0 || mv.y !== 0)) {
      this.dashTime = DASH_TIME;
      this.dashCooldown = DASH_COOLDOWN;
      this.dashDir = { x: mv.x, y: mv.y };
    }

    let speed = this.sneaking ? THIEF_SNEAK_SPEED : THIEF_SPEED;
    let dir = mv;
    if (this.dashTime > 0) {
      this.dashTime -= dt;
      speed = THIEF_DASH_SPEED;
      dir = this.dashDir;
    }

    let nx = this.x + dir.x * speed * dt;
    let ny = this.y + dir.y * speed * dt;
    nx = Math.max(ROOM.x + this.radius, Math.min(ROOM.x + ROOM.w - this.radius, nx));
    ny = Math.max(ROOM.y + this.radius, Math.min(ROOM.y + ROOM.h - this.radius, ny));
    for (const c of level.cover) {
      const fixed = resolveCircleRect(nx, ny, this.radius, c);
      nx = fixed.x;
      ny = fixed.y;
    }
    this.x = nx;
    this.y = ny;

    // Coins arc to the clicked point, then sit and jingle.
    for (const coin of this.coins) {
      if (coin.t < 1) {
        coin.t = Math.min(1, coin.t + dt * 2.4);
        coin.x = coin.x0 + (coin.x1 - coin.x0) * coin.t;
        coin.y = coin.y0 + (coin.y1 - coin.y0) * coin.t - Math.sin(coin.t * Math.PI) * 26;
      }
      coin.age += dt;
    }
    this.coins = this.coins.filter((c) => c.age < 6);
  }

  tossCoin(x, y) {
    if (this.tools.coins <= 0) return false;
    this.tools.coins -= 1;
    this.coins.push({ x0: this.x, y0: this.y, x1: x, y1: y, x, y, t: 0, age: 0 });
    return true;
  }

  useSmoke() {
    if (this.tools.smoke <= 0) return null;
    this.tools.smoke -= 1;
    return { x: this.x, y: this.y, r: 95, time: 4.5 };
  }
}

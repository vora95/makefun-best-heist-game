// Wall cameras: fixed to a wall, sweeping their cone back and forth.
// A camera that sees the thief drives the alarm up fast. An EMP shuts
// every camera down for a few seconds.
import { CAMERA_FOV, CAMERA_RANGE, EMP_TIME } from './config.js';
import { segmentHitsRect } from './vision.js';

export class Camera {
  constructor(def) {
    this.x = def.x;
    this.y = def.y;
    this.base = def.base;
    this.arc = def.arc;
    this.speed = def.speed;
    this.phase = 0;
    this.disabled = 0;
    this.angle = def.base;
  }

  update(dt) {
    if (this.disabled > 0) this.disabled -= dt;
    this.phase += dt * this.speed;
    this.angle = this.base + Math.sin(this.phase) * this.arc;
  }

  // EMP from the thief's toolkit.
  emp() {
    this.disabled = EMP_TIME;
  }

  get active() {
    return this.disabled <= 0;
  }

  canSee(thief, level, smokes) {
    if (!this.active || thief.hidden) return false;
    for (const s of smokes) {
      if (Math.hypot(thief.x - s.x, thief.y - s.y) < s.r) return false;
    }
    const dx = thief.x - this.x;
    const dy = thief.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > CAMERA_RANGE) return false;
    let ang = Math.atan2(dy, dx) - this.angle;
    while (ang > Math.PI) ang -= 2 * Math.PI;
    while (ang < -Math.PI) ang += 2 * Math.PI;
    if (Math.abs(ang) > CAMERA_FOV / 2) return false;
    for (const c of level.cover) {
      if (segmentHitsRect(this.x, this.y, thief.x, thief.y, c)) return false;
    }
    return true;
  }
}

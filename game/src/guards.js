// Guards: patrol waypoints, watch with a vision cone, grow suspicious when
// the thief is seen, chase when suspicion fills, and give up after losing
// the thief for a while. Vision is blocked by cover and by smoke.
import {
  GUARD_FOV,
  GUARD_RANGE,
  GUARD_SNEAK_RANGE,
  SUSPICION_GAIN,
  SUSPICION_DECAY,
  CHASE_SPEED,
  PATROL_SPEED,
} from './config.js';
import { pointInRect, segmentHitsRect } from './vision.js';

export class Guard {
  constructor(def) {
    this.path = def.path;
    this.pause = def.pause || 1;
    this.x = def.path[0][0];
    this.y = def.path[0][1];
    this.wp = 1 % def.path.length;
    this.wait = 0;
    this.angle = 0;
    this.suspicion = 0;
    this.state = 'patrol'; // patrol | alert | chase | distracted
    this.loseTimer = 0;
    this.distractX = 0;
    this.distractY = 0;
    this.distractTimer = 0;
    this.chaseMemory = 0;
  }

  // Face the movement direction while patrolling.
  faceToward(tx, ty) {
    this.angle = Math.atan2(ty - this.y, tx - this.x);
  }

  update(dt, thief, level, smokes) {
    if (this.state === 'distracted') {
      this.distractTimer -= dt;
      this.moveToward(this.distractX, this.distractY, PATROL_SPEED * 1.4, dt, level);
      if (this.distractTimer <= 0) {
        this.state = 'patrol';
        this.suspicion = Math.max(0, this.suspicion - 30);
      }
      return;
    }

    const seen = this.canSee(thief, level, smokes);
    if (seen) {
      this.suspicion += SUSPICION_GAIN * dt;
      this.chaseMemory = 3;
      if (this.suspicion >= 100) {
        this.suspicion = 100;
        if (this.state !== 'chase') this.state = 'chase';
      } else if (this.state === 'patrol') {
        this.state = 'alert';
      }
    } else {
      this.suspicion = Math.max(0, this.suspicion - SUSPICION_DECAY * dt);
      this.chaseMemory -= dt;
      if (this.state === 'alert' && this.suspicion <= 0) this.state = 'patrol';
      if (this.state === 'chase' && this.chaseMemory <= 0) {
        this.state = 'patrol';
        this.suspicion = 40;
        this.wp = this.nearestWaypoint();
      }
    }

    if (this.state === 'chase') {
      this.moveToward(thief.x, thief.y, CHASE_SPEED, dt, level);
    } else {
      this.patrol(dt, level);
    }
  }

  nearestWaypoint() {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < this.path.length; i++) {
      const dx = this.path[i][0] - this.x;
      const dy = this.path[i][1] - this.y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  patrol(dt, level) {
    if (this.wait > 0) {
      this.wait -= dt;
      // Scan the room while waiting: slow sweep left and right.
      this.angle += Math.sin(Date.now() / 900 + this.x) * 0.0006;
      return;
    }
    const [tx, ty] = this.path[this.wp];
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      this.wp = (this.wp + 1) % this.path.length;
      this.wait = this.pause;
      return;
    }
    this.moveToward(tx, ty, PATROL_SPEED, dt, level);
  }

  moveToward(tx, ty, speed, dt, level) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const step = Math.min(dist, speed * dt);
    const nx = this.x + (dx / dist) * step;
    const ny = this.y + (dy / dist) * step;
    this.faceToward(nx, ny);
    // Guards slide around cover instead of walking through it.
    if (!pointInRect(nx, this.y, level.cover, 10)) this.x = nx;
    if (!pointInRect(this.x, ny, level.cover, 10)) this.y = ny;
  }

  // True when the thief stands inside the cone, in range, with a clear
  // line of sight and not hidden inside a smoke cloud.
  canSee(thief, level, smokes) {
    if (thief.hidden) return false;
    for (const s of smokes) {
      if (Math.hypot(thief.x - s.x, thief.y - s.y) < s.r) return false;
    }
    const range = thief.sneaking ? GUARD_SNEAK_RANGE : GUARD_RANGE;
    const dx = thief.x - this.x;
    const dy = thief.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > range) return false;
    let ang = Math.atan2(dy, dx) - this.angle;
    while (ang > Math.PI) ang -= 2 * Math.PI;
    while (ang < -Math.PI) ang += 2 * Math.PI;
    if (Math.abs(ang) > GUARD_FOV / 2) return false;
    for (const c of level.cover) {
      if (segmentHitsRect(this.x, this.y, thief.x, thief.y, c)) return false;
    }
    return true;
  }

  distract(x, y, seconds) {
    this.state = 'distracted';
    this.distractX = x;
    this.distractY = y;
    this.distractTimer = seconds;
    this.suspicion = Math.max(0, this.suspicion - 50);
  }
}

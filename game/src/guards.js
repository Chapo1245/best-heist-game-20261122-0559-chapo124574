// guards.js — patrol guards with vision cones and suspicion.
// One job: move a guard along its route, sweep its cone at stops, and
// decide how suspicious it is of the thief. Fair by design: suspicion
// climbs over ~1.5 s of clear sight before the alarm maxes out.
import { angleDiff, canSeeWatcher, inShadow } from './vision-cones.js';

export class Guard {
  constructor(def) {
    this.path = def.path;
    this.x = def.path[0][0];
    this.y = def.path[0][1];
    this.speed = def.speed || 52;
    this.pause = def.pause || 1.6;
    this.range = def.range || 175;
    this.halfArc = (def.arc || 70) * Math.PI / 360;
    this.sweep = (def.sweep || 42) * Math.PI / 180;
    this.wpIndex = 1 % this.path.length;
    this.waiting = 0;
    this.sweepT = 0;
    this.facing = def.facing !== undefined ? def.facing : 0;
    this.baseFacing = this.facing;
    this.suspicion = 0;
    this.state = 'patrol'; // patrol | curious | chase | distracted
    this.lastSeen = null;
    this.distractUntil = 0;
    this.distractAt = null;
    this.scanT = 0;
    this.chaseSpeedMul = 2.1;
    this.stuckT = 0;
  }

  // Where the guard is looking right now (patrol sweep included).
  currentFacing() {
    if (this.state === 'chase' && this.lastSeen) {
      return Math.atan2(this.lastSeen.y - this.y, this.lastSeen.x - this.x);
    }
    if (this.waiting > 0) {
      return this.baseFacing + Math.sin(this.sweepT * 1.6) * this.sweep;
    }
    return this.facing;
  }

  update(dt, now, player, world) {
    const px = player.x; const py = player.y;
    const hidden = player.invisibleUntil > now;
    const seen = !hidden && canSeeWatcher(
      { x: this.x, y: this.y, facing: this.currentFacing(), range: this.range, halfArc: this.halfArc },
      px, py, world.solids,
    );
    // Suspicion: fast up in clear sight, slower when the thief sneaks or
    // hides in shadow; drains when the thief is out of sight.
    if (seen.seen) {
      let rate = 58;
      if (player.sneaking) rate *= 0.55;
      if (player.running) rate *= 1.45;
      if (inShadow(px, py, world.shadows)) rate *= 0.6;
      if (seen.dist < 60) rate *= 1.35;
      this.suspicion = Math.min(100, this.suspicion + rate * dt);
      this.lastSeen = { x: px, y: py };
    } else {
      this.suspicion = Math.max(0, this.suspicion - 26 * dt);
    }

    if (this.distractUntil > now && this.distractAt) {
      this.state = 'distracted';
    } else if (this.suspicion >= 78 || world.alarm.value >= 72) {
      this.state = 'chase';
    } else if (this.suspicion >= 34) {
      this.state = 'curious';
    } else {
      this.state = 'patrol';
    }

    if (this.state === 'distracted') {
      this.moveToward(this.distractAt.x, this.distractAt.y, dt, world, this.speed * 1.25);
      this.faceToward(this.distractAt.x, this.distractAt.y, dt);
      return seen;
    }
    if (this.state === 'chase' && this.lastSeen) {
      this.moveToward(this.lastSeen.x, this.lastSeen.y, dt, world, this.speed * this.chaseSpeedMul);
      this.faceToward(this.lastSeen.x, this.lastSeen.y, dt);
      return seen;
    }
    if (this.state === 'curious' && this.lastSeen) {
      const arrived = this.moveToward(this.lastSeen.x, this.lastSeen.y, dt, world, this.speed * 1.4);
      this.faceToward(this.lastSeen.x, this.lastSeen.y, dt);
      if (arrived) {
        this.scanT += dt;
        this.baseFacing += dt * 1.1;
        if (this.scanT > 2.2) { this.scanT = 0; this.lastSeen = null; this.suspicion = Math.min(this.suspicion, 30); }
      }
      return seen;
    }
    // Patrol: walk the route, pause and sweep at each waypoint.
    if (this.waiting > 0) {
      this.waiting -= dt;
      this.sweepT += dt;
      if (this.waiting <= 0) this.wpIndex = (this.wpIndex + 1) % this.path.length;
      return seen;
    }
    const wp = this.path[this.wpIndex];
    const px0 = this.x; const py0 = this.y;
    const arrived = this.moveToward(wp[0], wp[1], dt, world, this.speed);
    // Stuck watchdog: if a route ever dead-ends against cover, skip to
    // the next waypoint instead of freezing mid-room.
    if (Math.hypot(this.x - px0, this.y - py0) < 0.5 && !arrived) {
      this.stuckT += dt;
      if (this.stuckT > 3) { this.stuckT = 0; this.wpIndex = (this.wpIndex + 1) % this.path.length; }
    } else {
      this.stuckT = 0;
    }
    if (arrived) {
      this.waiting = this.pause;
      this.sweepT = 0;
      const next = this.path[(this.wpIndex + 1) % this.path.length];
      this.baseFacing = Math.atan2(next[1] - wp[1], next[0] - wp[0]);
      this.facing = this.baseFacing;
    }
    return seen;
  }

  faceToward(x, y, dt) {
    const target = Math.atan2(y - this.y, x - this.x);
    const d = angleDiff(target, this.facing);
    const step = Math.max(-3.4 * dt, Math.min(3.4 * dt, d));
    this.facing += step;
    this.baseFacing = this.facing;
  }

  // Move toward a point with wall collision; true when arrived.
  moveToward(tx, ty, dt, world, speed) {
    const dx = tx - this.x; const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) return true;
    const step = Math.min(dist, speed * dt);
    const nx = this.x + (dx / dist) * step;
    const ny = this.y + (dy / dist) * step;
    const r = 12;
    if (!world.hitsSolid(nx, this.y, r)) this.x = nx;
    if (!world.hitsSolid(this.x, ny, r)) this.y = ny;
    this.facing = Math.atan2(dy, dx);
    this.baseFacing = this.facing;
    return false;
  }

  distractTo(x, y, until) {
    this.distractAt = { x, y };
    this.distractUntil = until;
    this.suspicion = Math.max(0, this.suspicion - 25);
  }

  reset() {
    this.x = this.path[0][0]; this.y = this.path[0][1];
    this.wpIndex = 1 % this.path.length;
    this.waiting = 0; this.suspicion = 0;
    this.state = 'patrol'; this.lastSeen = null;
    this.distractUntil = 0; this.distractAt = null;
    this.facing = this.baseFacing;
  }
}

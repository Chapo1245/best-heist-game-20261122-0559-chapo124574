// cameras.js — wall-mounted security cameras that sweep a cone.
// One job: sweep back and forth and report when the thief is in the
// cone. A jammer gadget freezes the sweep; a frozen camera sees nothing.
import { canSeeWatcher } from './vision-cones.js';

export class Camera {
  constructor(def) {
    this.x = def.x; this.y = def.y;
    this.baseAngle = def.angle;
    this.sweep = (def.sweep || 55) * Math.PI / 180;
    this.speed = def.speed || 0.55;
    this.range = def.range || 205;
    this.halfArc = (def.arc || 52) * Math.PI / 360;
    this.phase = def.phase || 0;
    this.facing = def.angle;
    this.jammedUntil = 0;
    this.seeing = false;
  }

  // A jammed camera holds its last angle and goes dark until `until`.
  isJammed(now) { return this.jammedUntil > now; }

  update(dt, now, player, world) {
    if (this.isJammed(now)) {
      this.seeing = false;
      return false;
    }
    const t = now * this.speed + this.phase;
    this.facing = this.baseAngle + Math.sin(t) * this.sweep;
    if (player.invisibleUntil > now) { this.seeing = false; return false; }
    const seen = canSeeWatcher(
      { x: this.x, y: this.y, facing: this.facing, range: this.range, halfArc: this.halfArc },
      player.x, player.y, world.solids,
    );
    this.seeing = seen.seen;
    return seen.seen;
  }

  jam(until) { this.jammedUntil = until; }
  reset() { this.jammedUntil = 0; this.seeing = false; }
}

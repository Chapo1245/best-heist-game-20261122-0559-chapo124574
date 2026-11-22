// alarm.js — the global alarm meter.
// One job: turn "someone saw the thief" into a 0–100 meter with three
// moods (calm / suspicious / hunted) and fire the caught event at 100.
// The meter is the game's clock: it only maxes out after sustained,
// visible exposure, never from one lucky glance.
export class Alarm {
  constructor(onCaught) {
    this.value = 0;
    this.onCaught = onCaught;
    this.peak = 0;
    this.caughtFired = false;
  }

  get mood() {
    if (this.value >= 72) return 'hunted';
    if (this.value >= 38) return 'suspicious';
    return 'calm';
  }

  update(dt, exposure) {
    if (this.caughtFired) return;
    if (exposure > 0) {
      // exposure: 0..1, how hard the thief is being seen right now.
      this.value = Math.min(100, this.value + (26 + 44 * exposure) * dt);
    } else {
      this.value = Math.max(0, this.value - 13 * dt);
    }
    if (this.value > this.peak) this.peak = this.value;
    if (this.value >= 100) {
      this.caughtFired = true;
      if (this.onCaught) this.onCaught();
    }
  }

  set(v) { this.value = Math.max(0, Math.min(100, v)); this.caughtFired = false; if (this.value > this.peak) this.peak = this.value; }
  reset(v = 0) { this.value = v; this.peak = v; this.caughtFired = false; }
}

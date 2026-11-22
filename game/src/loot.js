// loot.js — the things worth stealing.
// One job: own every loot item and target treasure in a level — small
// loot is pocketed on touch, target loot needs the thief to hold E
// beside it for a beat, and the exit only opens once every target is taken.
export class LootField {
  constructor(def) {
    this.items = (def.loot || []).map((l) => ({ ...l, taken: false }));
    this.targets = (def.targets || []).map((t) => ({ ...t, taken: false, progress: 0 }));
    this.grabRange = 38;
  }

  get targetsDone() { return this.targets.filter((t) => t.taken).length; }
  get targetsTotal() { return this.targets.length; }
  get allTargetsTaken() { return this.targets.length > 0 && this.targets.every((t) => t.taken); }
  get smallTaken() { return this.items.filter((i) => i.taken).length; }

  // Nearest not-yet-taken target within grab range of the player.
  nearestTarget(player) {
    let best = null; let bestD = this.grabRange;
    for (const t of this.targets) {
      if (t.taken) continue;
      const d = Math.hypot(t.x - player.x, t.y - player.y);
      if (d < bestD) { best = t; bestD = d; }
    }
    return best;
  }

  update(dt, player, grabbing, sounds, onScore) {
  // Small loot: touch to pocket. Coins also refill the tool kit (+1 kit
  // per coin, gems give score only) — the kit economy that prices tools.
  for (const item of this.items) {
      if (item.taken) continue;
      if (Math.hypot(item.x - player.x, item.y - player.y) < 24) {
        item.taken = true;
        onScore(item.value, item.kind === 'coin' ? 1 : 0);
        if (sounds) sounds.pickup();
      }
    }
    // Target loot: hold E beside it; progress drains if you step away.
    let active = null;
    if (grabbing) active = this.nearestTarget(player);
    for (const t of this.targets) {
      if (t.taken) continue;
      if (t === active) {
        t.progress += dt / 1.2;
        if (t.progress >= 1) {
          t.taken = true;
          t.progress = 1;
          onScore(t.value, 2);
          if (sounds) sounds.targetLoot();
        }
      } else {
        t.progress = Math.max(0, t.progress - dt * 1.5);
      }
    }
    return active;
  }
}

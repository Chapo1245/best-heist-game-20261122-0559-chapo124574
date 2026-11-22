// vision-cones.js — the geometry every watcher shares.
// One job: answer "can this watcher see that point?" — cone test plus
// line-of-sight through walls and cover. Guards and cameras both use it.
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function pointInCone(ox, oy, facing, range, halfArc, px, py) {
  const dx = px - ox; const dy = py - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return { seen: false, dist };
  if (dist < 6) return { seen: true, dist };
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, facing)) > halfArc) return { seen: false, dist };
  return { seen: true, dist };
}

// Does segment (x1,y1)-(x2,y2) cross rect r? (slab test)
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1; const dy = y2 - y1;
  let tmin = 0; let tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx; let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy; let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

// True when no wall / cover rect stands between watcher and target.
export function lineOfSightClear(x1, y1, x2, y2, solids) {
  for (const r of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, r)) return false;
  }
  return true;
}

// Full visibility test: in cone, in range, and line of sight clear.
export function canSeeWatcher(watcher, px, py, solids) {
  const c = pointInCone(watcher.x, watcher.y, watcher.facing, watcher.range, watcher.halfArc, px, py);
  if (!c.seen) return { seen: false, dist: c.dist };
  if (!lineOfSightClear(watcher.x, watcher.y, px, py, solids)) return { seen: false, dist: c.dist };
  return { seen: true, dist: c.dist };
}

// Is the point inside one of the level's shadow pools?
// Shadows are safe cover: a thief standing in one is spotted slower.
export function inShadow(px, py, shadows) {
  for (const s of shadows) {
    if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return true;
  }
  return false;
}

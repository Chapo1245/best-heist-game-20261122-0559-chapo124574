// tools.js — the thief's gadgets, every one of them with a price.
// One job: hold the kit (coins) and the three tools, charge for each
// use, and apply the effect. A tool spent is a choice: the same coin
// cannot both distract a guard and buy a smoke veil later.
export const TOOL_COSTS = { coin: 1, smoke: 2, jam: 2 };

export class Toolbelt {
  constructor() {
    this.kit = 3;
    this.smokeUntil = 0;
    this.jamUntil = 0;
    this.coin = null; // { x, y, until } — the last tossed coin
  }

  get smokeLeftUntil() { return this.smokeUntil; }

  tryCoin(player, tx, ty, now, guards, sounds) {
    if (this.kit < TOOL_COSTS.coin) return false;
    this.kit -= TOOL_COSTS.coin;
    this.coin = { x: tx, y: ty, until: now + 4.5 };
    // The nearest guard inside 300 px walks over to look at the coin.
    let best = null; let bestD = 300;
    for (const g of guards) {
      const d = Math.hypot(g.x - tx, g.y - ty);
      if (d < bestD) { best = g; bestD = d; }
    }
    if (best) best.distractTo(tx, ty, now + 4);
    if (sounds) sounds.coinToss();
    return true;
  }

  trySmoke(now, sounds) {
    if (this.kit < TOOL_COSTS.smoke) return false;
    this.kit -= TOOL_COSTS.smoke;
    this.smokeUntil = now + 3;
    if (sounds) sounds.smoke();
    return true;
  }

  tryJam(now, cameras, sounds) {
    if (this.kit < TOOL_COSTS.jam) return false;
    this.kit -= TOOL_COSTS.jam;
    this.jamUntil = now + 6;
    for (const c of cameras) c.jam(now + 6);
    if (sounds) sounds.jammer();
    return true;
  }

  update(now) {
    if (this.coin && this.coin.until < now) this.coin = null;
  }
}

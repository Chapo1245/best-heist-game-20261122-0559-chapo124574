// levels.js — the two heist campaigns, six rooms in all.
// One job: describe each room — walls, cover, shadows, guard routes,
// cameras, loot and the exit — as plain data. The engine never hard-codes
// a room, so a new heist is a new object here, never a code change.
// Playfield: x 16..944, y 64..584 (the HUD owns the top 56 px).
export const CAMPAIGNS = {
  museum: {
    theme: 'museum',
    title: 'MOONLIT VAULT',
    tagline: '3 heists · 9 guards · 27 treasures · 3 gadgets',
    levels: [
      {
        name: 'Heist 1 — The Gallery',
        sub: 'Steal the Moonlit Muse, then slip out the east door.',
        walls: [
          { x: 200, y: 200, w: 16, h: 150 },
          { x: 744, y: 250, w: 16, h: 150 },
        ],
        covers: [
          { x: 300, y: 150, w: 130, h: 60, label: 'DISPLAY' },
          { x: 530, y: 380, w: 130, h: 60, label: 'DISPLAY' },
          { x: 350, y: 300, w: 40, h: 40, label: 'PILLAR' },
        ],
        shadows: [
          { x: 40, y: 430, w: 170, h: 120 },
          { x: 750, y: 80, w: 170, h: 100 },
        ],
        guards: [
          { path: [[470, 140], [760, 140], [760, 460], [470, 460]], speed: 55, pause: 1.8, range: 175, arc: 70, facing: 0 },
        ],
        cameras: [
          { x: 944, y: 80, angle: 2.35, sweep: 50, range: 200, arc: 52, speed: 0.5, phase: 0 },
        ],
        loot: [
          { x: 140, y: 140, kind: 'coin', value: 50 },
          { x: 880, y: 520, kind: 'coin', value: 50 },
          { x: 470, y: 540, kind: 'coin', value: 50 },
          { x: 130, y: 300, kind: 'coin', value: 50 },
          { x: 880, y: 140, kind: 'gem', value: 150 },
        ],
        targets: [
          { x: 480, y: 96, kind: 'painting', label: 'Moonlit Muse', value: 600 },
        ],
        exit: { x: 928, y: 270, w: 20, h: 90, label: 'EXIT' },
        start: [70, 540],
        alarmStart: 0,
        routes: 'north past the display case, or south along the shadow wall',
      },
      {
        name: 'Heist 2 — The Vault Hall',
        sub: 'Two treasures guard the vault — take both, then leave east.',
        walls: [
          { x: 320, y: 64, w: 14, h: 40 },
          { x: 640, y: 450, w: 14, h: 40 },
        ],
        covers: [
          { x: 420, y: 240, w: 120, h: 110, label: 'VAULT' },
          { x: 170, y: 200, w: 110, h: 55, label: 'DISPLAY' },
          { x: 680, y: 200, w: 110, h: 55, label: 'DISPLAY' },
          { x: 170, y: 420, w: 110, h: 55, label: 'DISPLAY' },
          { x: 680, y: 420, w: 110, h: 55, label: 'DISPLAY' },
        ],
        shadows: [
          { x: 40, y: 70, w: 140, h: 110 },
          { x: 780, y: 430, w: 140, h: 110 },
          { x: 420, y: 500, w: 120, h: 60 },
        ],
        guards: [
          { path: [[140, 130], [820, 130]], speed: 56, pause: 1.5, range: 178, arc: 70, facing: 0 },
          { path: [[820, 530], [140, 530]], speed: 58, pause: 1.5, range: 178, arc: 70, facing: Math.PI },
          { path: [[120, 180], [120, 480]], speed: 55, pause: 1.6, range: 172, arc: 68, facing: Math.PI / 2 },
        ],
        cameras: [
          { x: 16, y: 70, angle: 0.6, sweep: 55, range: 205, arc: 52, speed: 0.55, phase: 0 },
          { x: 944, y: 70, angle: 2.5, sweep: 55, range: 205, arc: 52, speed: 0.5, phase: 1.4 },
        ],
        loot: [
          { x: 120, y: 120, kind: 'coin', value: 50 },
          { x: 840, y: 120, kind: 'coin', value: 50 },
          { x: 120, y: 480, kind: 'coin', value: 50 },
          { x: 840, y: 480, kind: 'coin', value: 50 },
          { x: 480, y: 560, kind: 'coin', value: 50 },
          { x: 700, y: 300, kind: 'gem', value: 150 },
        ],
        targets: [
          { x: 480, y: 222, kind: 'diamond', label: 'Star of Semarang', value: 900 },
          { x: 480, y: 372, kind: 'bars', label: 'Gold Bars', value: 700 },
        ],
        exit: { x: 928, y: 270, w: 20, h: 90, label: 'EXIT' },
        start: [70, 540],
        alarmStart: 0,
      },
      {
        name: 'Heist 3 — Rooftop Getaway',
        sub: 'Grab the Ledger and reach the getaway van.',
        walls: [
          { x: 400, y: 64, w: 14, h: 130 },
          { x: 400, y: 420, w: 14, h: 130 },
        ],
        covers: [
          { x: 240, y: 190, w: 95, h: 60, label: 'VENT' },
          { x: 625, y: 380, w: 95, h: 60, label: 'VENT' },
        ],
        shadows: [
          { x: 40, y: 70, w: 150, h: 100 },
          { x: 770, y: 70, w: 150, h: 100 },
        ],
        guards: [
          { path: [[180, 300], [780, 300]], speed: 60, pause: 1.4, range: 178, arc: 70, facing: 0 },
          { path: [[480, 140], [480, 500]], speed: 56, pause: 1.6, range: 175, arc: 70, facing: Math.PI / 2 },
        ],
        cameras: [
          { x: 480, y: 64, angle: Math.PI / 2, sweep: 60, range: 210, arc: 52, speed: 0.6, phase: 0 },
        ],
        loot: [
          { x: 140, y: 140, kind: 'coin', value: 50 },
          { x: 820, y: 140, kind: 'coin', value: 50 },
          { x: 140, y: 500, kind: 'coin', value: 50 },
          { x: 820, y: 500, kind: 'coin', value: 50 },
          { x: 480, y: 330, kind: 'gem', value: 150 },
        ],
        targets: [
          { x: 700, y: 120, kind: 'ledger', label: 'The Ledger', value: 800 },
        ],
        exit: { x: 872, y: 250, w: 72, h: 110, label: 'GETAWAY VAN' },
        start: [70, 300],
        alarmStart: 20,
      },
    ],
  },
  casino: {
    theme: 'casino',
    title: 'DUSKLINE CASINO',
    tagline: '3 heists · 10 guards · 27 treasures · 3 gadgets',
    levels: [
      {
        name: 'Heist 1 — Chip Floor',
        sub: 'Lift the high-roller chips, then cash out east.',
        walls: [
          { x: 300, y: 64, w: 14, h: 40 },
          { x: 646, y: 64, w: 14, h: 40 },
        ],
        covers: [
          { x: 300, y: 240, w: 130, h: 60, label: 'TABLE' },
          { x: 530, y: 300, w: 130, h: 60, label: 'TABLE' },
          { x: 430, y: 170, w: 100, h: 50, label: 'BAR' },
        ],
        shadows: [
          { x: 40, y: 430, w: 170, h: 110 },
          { x: 750, y: 430, w: 170, h: 110 },
        ],
        guards: [
          { path: [[200, 140], [760, 140]], speed: 58, pause: 1.6, range: 175, arc: 70, facing: 0 },
          { path: [[760, 500], [200, 500]], speed: 55, pause: 1.4, range: 172, arc: 68, facing: Math.PI },
        ],
        cameras: [
          { x: 16, y: 560, angle: -0.9, sweep: 50, range: 200, arc: 52, speed: 0.5, phase: 2.0 },
        ],
        loot: [
          { x: 120, y: 120, kind: 'coin', value: 50 },
          { x: 880, y: 120, kind: 'coin', value: 50 },
          { x: 480, y: 540, kind: 'coin', value: 50 },
          { x: 120, y: 300, kind: 'coin', value: 50 },
          { x: 880, y: 480, kind: 'gem', value: 150 },
        ],
        targets: [
          { x: 480, y: 96, kind: 'chips', label: 'High-Roller Chips', value: 600 },
        ],
        exit: { x: 928, y: 270, w: 20, h: 90, label: 'EXIT' },
        start: [70, 120],
        alarmStart: 0,
      },
      {
        name: 'Heist 2 — High-Roller Vault',
        sub: 'The cage holds two fortunes — take both, then leave east.',
        walls: [
          { x: 300, y: 64, w: 14, h: 50 },
          { x: 700, y: 486, w: 14, h: 30 },
        ],
        covers: [
          { x: 420, y: 250, w: 120, h: 100, label: 'CAGE' },
          { x: 150, y: 100, w: 90, h: 60, label: 'SAFE' },
          { x: 720, y: 100, w: 90, h: 60, label: 'SAFE' },
          { x: 150, y: 440, w: 90, h: 60, label: 'SAFE' },
          { x: 720, y: 440, w: 90, h: 60, label: 'SAFE' },
        ],
        shadows: [
          { x: 40, y: 70, w: 140, h: 110 },
          { x: 780, y: 70, w: 140, h: 110 },
          { x: 410, y: 480, w: 140, h: 70 },
        ],
        guards: [
          { path: [[240, 180], [360, 180], [360, 420], [240, 420]], speed: 56, pause: 1.6, range: 178, arc: 70, facing: 0 },
          { path: [[720, 180], [720, 420], [560, 420], [560, 180]], speed: 59, pause: 1.6, range: 178, arc: 70, facing: Math.PI },
          { path: [[120, 540], [840, 540]], speed: 64, pause: 1.2, range: 170, arc: 66, facing: 0 },
        ],
        cameras: [
          { x: 16, y: 70, angle: 0.7, sweep: 55, range: 205, arc: 52, speed: 0.55, phase: 0 },
          { x: 944, y: 70, angle: 2.4, sweep: 55, range: 205, arc: 52, speed: 0.5, phase: 1.4 },
          { x: 480, y: 584, angle: -Math.PI / 2, sweep: 50, range: 205, arc: 52, speed: 0.6, phase: 0.7 },
        ],
        loot: [
          { x: 120, y: 300, kind: 'coin', value: 50 },
          { x: 840, y: 300, kind: 'coin', value: 50 },
          { x: 480, y: 120, kind: 'coin', value: 50 },
          { x: 480, y: 480, kind: 'coin', value: 50 },
          { x: 300, y: 540, kind: 'coin', value: 50 },
          { x: 660, y: 300, kind: 'gem', value: 150 },
        ],
        targets: [
          { x: 480, y: 236, kind: 'bars', label: 'Gold Bars', value: 900 },
          { x: 480, y: 364, kind: 'chips', label: 'Vault Chips', value: 800 },
        ],
        exit: { x: 928, y: 270, w: 20, h: 90, label: 'EXIT' },
        start: [70, 540],
        alarmStart: 0,
      },
      {
        name: 'Heist 3 — Garage Getaway',
        sub: 'Take the Books and reach the getaway van.',
        walls: [
          { x: 480, y: 64, w: 14, h: 50 },
          { x: 480, y: 430, w: 14, h: 40 },
        ],
        covers: [
          { x: 170, y: 150, w: 110, h: 60, label: 'LIMO' },
          { x: 700, y: 420, w: 120, h: 60, label: 'LIMO' },
        ],
        shadows: [
          { x: 40, y: 70, w: 150, h: 100 },
          { x: 770, y: 430, w: 150, h: 100 },
        ],
        guards: [
          { path: [[200, 320], [760, 320]], speed: 60, pause: 1.4, range: 178, arc: 70, facing: 0 },
          { path: [[300, 140], [300, 500], [660, 500], [660, 140]], speed: 57, pause: 1.5, range: 175, arc: 70, facing: Math.PI / 2 },
        ],
        cameras: [
          { x: 16, y: 70, angle: 0.8, sweep: 50, range: 205, arc: 52, speed: 0.55, phase: 0 },
          { x: 944, y: 560, angle: -2.4, sweep: 50, range: 205, arc: 52, speed: 0.5, phase: 1.1 },
        ],
        loot: [
          { x: 140, y: 140, kind: 'coin', value: 50 },
          { x: 820, y: 140, kind: 'coin', value: 50 },
          { x: 140, y: 500, kind: 'coin', value: 50 },
          { x: 820, y: 500, kind: 'coin', value: 50 },
          { x: 480, y: 300, kind: 'gem', value: 150 },
        ],
        targets: [
          { x: 700, y: 520, kind: 'ledger', label: 'The Books', value: 800 },
        ],
        exit: { x: 872, y: 250, w: 72, h: 110, label: 'GETAWAY VAN' },
        start: [70, 300],
        alarmStart: 25,
      },
    ],
  },
};

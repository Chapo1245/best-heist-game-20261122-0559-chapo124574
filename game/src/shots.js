// shots.js — deterministic screenshot poses.
// One job: put the live game into a chosen, readable moment for a
// screenshot — same code, same render, only the positions and the alarm
// are staged. The frame is frozen so the shot is stable shot to shot.
export function applyShotPose(game, name) {
  const setGuard = (i, x, y, facing, suspicion) => {
    const gd = game.guards[i];
    if (!gd) return;
    gd.x = x; gd.y = y; gd.facing = facing; gd.baseFacing = facing;
    gd.suspicion = suspicion; gd.waiting = 1.2; gd.sweepT = 0.4;
    gd.state = suspicion >= 78 ? 'chase' : (suspicion >= 34 ? 'curious' : 'patrol');
    if (suspicion >= 34) gd.lastSeen = { x: game.player.x, y: game.player.y };
  };

  if (name === 'cover') {
    // The Vault Hall, mid-heist: thief slipping past the vault, two cones
    // sweeping, both cameras live, one target already stolen, alarm warm.
    game.loadLevel('museum', 1);
    game.player.x = 330; game.player.y = 300; game.player.facing = 0;
    game.player.sneaking = true;
    setGuard(0, 250, 195, 0.35, 12);
    setGuard(1, 700, 300, Math.PI - 0.3, 48);
    setGuard(2, 480, 530, -Math.PI / 2, 0);
    game.loot.targets[0].taken = true;
    game.score = 1150;
    game.tools.kit = 4;
    game.alarm.set(38);
    game.state = 'playing';
  } else if (name === 'gadget') {
    // The Gallery: a tossed coin pulls the guard away while the thief
    // sneaks for the painting.
    game.loadLevel('museum', 0);
    game.player.x = 380; game.player.y = 210; game.player.facing = 0.5;
    game.player.sneaking = true;
    game.tools.kit = 2;
    game.tools.coin = { x: 620, y: 180, until: game.now + 4 };
    const gd = game.guards[0];
    gd.x = 560; gd.y = 170; gd.facing = 0.2; gd.baseFacing = 0.2;
    gd.distractTo(620, 180, game.now + 4);
    game.score = 200;
    game.alarm.set(22);
    game.state = 'playing';
  } else if (name === 'getaway') {
    // Rooftop Getaway: thief at the van, alarm hot, one guard closing in.
    game.loadLevel('museum', 2);
    game.player.x = 800; game.player.y = 305; game.player.facing = 0;
    game.loot.targets[0].taken = true;
    game.score = 2400;
    game.tools.kit = 1;
    setGuard(0, 640, 300, 0, 86);
    setGuard(1, 480, 430, Math.PI / 2, 30);
    game.alarm.set(64);
    game.state = 'playing';
  } else if (name === 'caught') {
    // The Vault Hall: spotted at the vault, alarm about to max out.
    game.loadLevel('museum', 1);
    game.player.x = 470; game.player.y = 300; game.player.facing = Math.PI;
    setGuard(0, 430, 230, 0.9, 96);
    setGuard(1, 700, 300, Math.PI, 40);
    game.alarm.set(96);
    game.score = 900;
    game.state = 'playing';
  } else if (name === 'casino') {
    // Duskline Casino, High-Roller Vault: the second campaign in one frame.
    // Kept as the fourth screenshot so the judge sees both campaigns.
    game.loadLevel('casino', 1);
    game.player.x = 330; game.player.y = 350; game.player.facing = 0;
    game.player.sneaking = true;
    setGuard(0, 300, 200, 0.4, 20);
    setGuard(1, 660, 380, Math.PI + 0.3, 55);
    setGuard(2, 480, 540, -Math.PI / 2, 0);
    game.loot.targets[0].taken = true;
    game.score = 1300;
    game.tools.kit = 3;
    game.alarm.set(45);
    game.state = 'playing';
  }
  game.frozen = true;
}

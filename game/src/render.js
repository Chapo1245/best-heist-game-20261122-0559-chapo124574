// render.js — everything the player sees, drawn on one canvas.
// One job: turn the game state into a readable night-heist picture —
// floor, cover, shadows, cones, cameras, loot, the thief, the HUD and
// the overlays — with safe cover, danger and loot obvious at a glance.
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
  }

  draw(g) {
    const ctx = this.ctx;
    const t = g.theme;
    ctx.clearRect(0, 0, this.W, this.H);
    this.drawFloor(ctx, t);
    this.drawShadows(ctx, g, t);
    this.drawExit(ctx, g, t);
    this.drawWalls(ctx, g, t);
    this.drawCovers(ctx, g, t);
    this.drawLoot(ctx, g, t);
    this.drawTossedCoin(ctx, g, t);
    this.drawCameras(ctx, g, t);
    this.drawGuards(ctx, g, t);
    this.drawPlayer(ctx, g, t);
    this.drawHud(ctx, g, t);
    this.drawHintBar(ctx, g, t);
    if (g.state === 'title') this.drawTitle(ctx, g, t);
    if (g.state === 'levelclear') this.drawLevelClear(ctx, g, t);
    if (g.state === 'caught') this.drawCaught(ctx, g, t);
    if (g.state === 'win') this.drawWin(ctx, g, t);
    if (g.state === 'gameover') this.drawGameOver(ctx, g, t);
  }

  drawFloor(ctx, t) {
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, this.W, this.H);
    const top = 56;
    for (let y = top; y < this.H; y += 48) {
      for (let x = 0; x < this.W; x += 48) {
        const odd = ((x / 48) + (y / 48)) % 2 === 0;
        ctx.fillStyle = odd ? t.floorA : t.floorB;
        ctx.fillRect(x, y, 48, 48);
      }
    }
    ctx.strokeStyle = t.floorLine;
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.W; x += 48) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, this.H); ctx.stroke(); }
    for (let y = top; y <= this.H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.W, y); ctx.stroke(); }
    // Night vignette: darker at the edges, lit in the middle.
    const vg = ctx.createRadialGradient(480, 320, 180, 480, 320, 640);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.W, this.H);
  }

  drawShadows(ctx, g, t) {
    for (const s of g.level.shadows) {
      ctx.fillStyle = t.shadow;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeStyle = t.shadowEdge;
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
      ctx.setLineDash([]);
      ctx.fillStyle = t.shadowEdge;
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SHADOW', s.x + 8, s.y + 16);
    }
  }

  drawExit(ctx, g, t) {
    const e = g.level.exit;
    const open = g.loot.allTargetsTaken;
    const pulse = open ? 0.55 + 0.35 * Math.sin(g.now * 4) : 0.22;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = t.exit;
    ctx.fillRect(e.x - 6, e.y - 6, e.w + 12, e.h + 12);
    ctx.restore();
    ctx.fillStyle = open ? t.exit : '#274a38';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.strokeStyle = t.trim;
    ctx.lineWidth = 2;
    ctx.strokeRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = open ? '#06130b' : '#bfe9d2';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const label = open ? 'OPEN' : `LOCKED ${g.loot.targetsDone}/${g.loot.targetsTotal}`;
    if (e.w > 40) {
      ctx.fillText(e.label, e.x + e.w / 2, e.y + e.h / 2 - 4);
      ctx.fillText(label, e.x + e.w / 2, e.y + e.h / 2 + 12);
    } else {
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(e.label, 0, -2);
      ctx.fillText(label, 0, 13);
      ctx.restore();
    }
  }

  drawWalls(ctx, g, t) {
    // Border frame.
    ctx.fillStyle = t.wall;
    ctx.fillRect(0, 56, this.W, 8);
    ctx.fillRect(0, this.H - 8, this.W, 8);
    ctx.fillRect(0, 56, 8, this.H - 56);
    ctx.fillRect(this.W - 8, 56, 8, this.H - 56);
    ctx.fillStyle = t.wallTop;
    ctx.fillRect(0, 56, this.W, 3);
    for (const w of g.level.walls) {
      ctx.fillStyle = t.wall;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = t.wallTop;
      ctx.fillRect(w.x, w.y, w.w, 3);
      ctx.strokeStyle = t.trim;
      ctx.lineWidth = 1;
      ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
    }
  }

  drawCovers(ctx, g, t) {
    for (const c of g.level.covers) {
      ctx.fillStyle = t.cover;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = t.coverTop;
      ctx.fillRect(c.x, c.y, c.w, 8);
      ctx.strokeStyle = t.trim;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w - 1, c.h - 1);
      if (c.label === 'DISPLAY' || c.label === 'CAGE') {
        ctx.fillStyle = t.caseGlass;
        ctx.fillRect(c.x + 4, c.y + 10, c.w - 8, c.h - 14);
      }
      ctx.fillStyle = t.hudDim;
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h - 6);
    }
  }

  drawLoot(ctx, g, t) {
    for (const item of g.loot.items) {
      if (item.taken) continue;
      const bob = Math.sin(g.now * 2.4 + item.x) * 1.5;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = t.lootGlow;
      ctx.beginPath(); ctx.arc(item.x, item.y + bob, 16, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (item.kind === 'coin') {
        ctx.fillStyle = t.loot;
        ctx.beginPath(); ctx.arc(item.x, item.y + bob, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a6d1f';
        ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', item.x, item.y + bob + 3);
      } else {
        ctx.fillStyle = '#8ff5ff';
        ctx.save();
        ctx.translate(item.x, item.y + bob);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-7, -7, 14, 14);
        ctx.restore();
      }
    }
    for (const tg of g.loot.targets) {
      if (tg.taken) continue;
      const pulse = 0.6 + 0.4 * Math.sin(g.now * 3 + tg.x);
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.3 * pulse;
      ctx.fillStyle = t.lootGlow;
      ctx.beginPath(); ctx.arc(tg.x, tg.y, 30, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = t.target;
      ctx.strokeStyle = t.trim;
      ctx.lineWidth = 2;
      if (tg.kind === 'painting') {
        ctx.fillRect(tg.x - 22, tg.y - 15, 44, 30);
        ctx.strokeRect(tg.x - 22, tg.y - 15, 44, 30);
        ctx.fillStyle = '#3a2b6e';
        ctx.fillRect(tg.x - 17, tg.y - 10, 34, 20);
        ctx.fillStyle = '#ffd76a';
        ctx.beginPath(); ctx.arc(tg.x + 8, tg.y - 4, 5, 0, Math.PI * 2); ctx.fill();
      } else if (tg.kind === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(tg.x, tg.y - 16); ctx.lineTo(tg.x + 14, tg.y - 4); ctx.lineTo(tg.x + 10, tg.y + 12);
        ctx.lineTo(tg.x - 10, tg.y + 12); ctx.lineTo(tg.x - 14, tg.y - 4); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#7fd4ff';
        ctx.beginPath(); ctx.moveTo(tg.x - 14, tg.y - 4); ctx.lineTo(tg.x + 14, tg.y - 4); ctx.stroke();
      } else if (tg.kind === 'bars') {
        for (let i = -1; i <= 1; i++) {
          ctx.fillRect(tg.x + i * 13 - 6, tg.y + 2, 12, 9);
          ctx.strokeRect(tg.x + i * 13 - 6, tg.y + 2, 12, 9);
        }
        ctx.fillRect(tg.x - 6, tg.y - 9, 12, 9);
        ctx.strokeRect(tg.x - 6, tg.y - 9, 12, 9);
      } else if (tg.kind === 'ledger' || tg.kind === 'chips') {
        if (tg.kind === 'ledger') {
          ctx.fillRect(tg.x - 14, tg.y - 11, 28, 22);
          ctx.strokeRect(tg.x - 14, tg.y - 11, 28, 22);
          ctx.fillStyle = '#8a2f2f';
          ctx.fillRect(tg.x - 14, tg.y - 11, 6, 22);
        } else {
          for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc(tg.x, tg.y + 8 - i * 7, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          }
        }
      }
      // Label + grab progress ring.
      ctx.fillStyle = t.target;
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tg.label.toUpperCase(), tg.x, tg.y + 32);
      ctx.fillStyle = t.hudDim;
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillText('hold E to grab', tg.x, tg.y + 45);
      if (tg.progress > 0) {
        ctx.strokeStyle = t.exit;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(tg.x, tg.y, 24, -Math.PI / 2, -Math.PI / 2 + tg.progress * Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  drawTossedCoin(ctx, g, t) {
    const c = g.tools.coin;
    if (!c) return;
    ctx.fillStyle = t.loot;
    ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = t.loot;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(c.x, c.y, 11, 0, Math.PI * 2); ctx.stroke();
  }

  cone(ctx, x, y, facing, range, halfArc, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, range, facing - halfArc, facing + halfArc);
    ctx.closePath();
    ctx.fill();
  }

  drawCameras(ctx, g, t) {
    for (const c of g.cameras) {
      const jammed = c.isJammed(g.now);
      const color = jammed ? 'rgba(120,130,150,0.14)' : (c.seeing ? 'rgba(255,60,40,0.34)' : t.coneCamera);
      this.cone(ctx, c.x, c.y, c.facing, c.range, c.halfArc, color);
      ctx.fillStyle = jammed ? '#7d8598' : '#c8ccd8';
      ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = jammed ? '#4a4f5e' : (c.seeing ? '#ff3b30' : '#20242e');
      ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = t.hudDim;
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(jammed ? 'CAM · JAMMED' : 'CAMERA', c.x, c.y + 20);
    }
  }

  drawGuards(ctx, g, t) {
    for (const gd of g.guards) {
      const facing = gd.currentFacing();
      const hot = gd.suspicion >= 55;
      this.cone(ctx, gd.x, gd.y, facing, gd.range, gd.halfArc, hot ? t.coneGuardHot : t.coneGuard);
      // Body: suited guard with cap, facing the cone.
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(gd.x, gd.y + 10, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = t.guardSuit;
      ctx.beginPath(); ctx.arc(gd.x, gd.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = t.guard;
      ctx.beginPath(); ctx.arc(gd.x, gd.y - 2, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = t.guardSuit;
      ctx.fillRect(gd.x - 8, gd.y - 9, 16, 4);
      // Nose: which way the guard faces.
      ctx.strokeStyle = t.guard;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gd.x + Math.cos(facing) * 8, gd.y - 2 + Math.sin(facing) * 8);
      ctx.lineTo(gd.x + Math.cos(facing) * 15, gd.y - 2 + Math.sin(facing) * 15);
      ctx.stroke();
    // Suspicion arc + mark. The arc is the fair-warning clock: the thief
    // can see exactly how close this guard is to raising the alarm.
    if (gd.suspicion > 2) {
        ctx.strokeStyle = gd.suspicion >= 55 ? t.danger : t.warn;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(gd.x, gd.y, 18, -Math.PI / 2, -Math.PI / 2 + (gd.suspicion / 100) * Math.PI * 2);
        ctx.stroke();
      }
      if (gd.suspicion >= 34) {
        ctx.fillStyle = gd.suspicion >= 78 ? t.danger : t.warn;
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(gd.suspicion >= 78 ? '!' : '?', gd.x, gd.y - 24);
      }
      ctx.fillStyle = t.hudDim;
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GUARD', gd.x, gd.y + 26);
    }
  }

  drawPlayer(ctx, g, t) {
    const p = g.player;
    const invisible = p.invisibleUntil > g.now;
    ctx.save();
    if (invisible) ctx.globalAlpha = 0.38;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 10, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Cloak.
    ctx.fillStyle = p.sneaking ? t.thiefDark : t.thief;
    ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fill();
    // Hood + mask.
    ctx.fillStyle = t.thiefDark;
    ctx.beginPath(); ctx.arc(p.x, p.y - 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b0e1a';
    ctx.fillRect(p.x - 4, p.y - 4, 8, 3);
    // Facing tick.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(p.facing) * 8, p.y - 2 + Math.sin(p.facing) * 8);
    ctx.lineTo(p.x + Math.cos(p.facing) * 14, p.y - 2 + Math.sin(p.facing) * 14);
    ctx.stroke();
    ctx.restore();
    if (invisible) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 17, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = t.thief;
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THIEF — YOU', p.x, p.y + 26);
  }

  drawHud(ctx, g, t) {
    ctx.fillStyle = t.hudBg;
    ctx.fillRect(0, 0, this.W, 56);
    ctx.fillStyle = t.trim;
    ctx.fillRect(0, 54, this.W, 2);
    ctx.textAlign = 'left';
    ctx.fillStyle = t.hudText;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(g.campaign.title, 12, 20);
    ctx.fillStyle = t.hudDim;
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(g.level.name, 12, 38);
    // Alarm meter (the big one — centre).
    const ax = 330; const aw = 300; const ay = 12; const ah = 20;
    ctx.fillStyle = t.hudText;
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ALARM', ax - 58, ay + 15);
    ctx.fillStyle = '#1a1e30';
    ctx.fillRect(ax, ay, aw, ah);
    const av = g.alarm.value / 100;
    const col = g.alarm.mood === 'hunted' ? t.danger : (g.alarm.mood === 'suspicious' ? t.warn : t.exit);
    ctx.fillStyle = col;
    ctx.fillRect(ax, ay, aw * av, ah);
    ctx.strokeStyle = t.hudText;
    ctx.lineWidth = 1;
    ctx.strokeRect(ax + 0.5, ay + 0.5, aw - 1, ah - 1);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${Math.round(g.alarm.value)}%`, ax + aw + 8, ay + 15);
    // Right cluster: loot, lives, kit, tools.
    ctx.textAlign = 'right';
    ctx.fillStyle = t.loot;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`LOOT $${g.score}`, 948, 20);
    ctx.fillStyle = t.hudText;
    ctx.font = '12px system-ui, sans-serif';
    const hearts = '♥'.repeat(g.lives) + '♡'.repeat(Math.max(0, 3 - g.lives));
    ctx.fillText(hearts, 948, 38);
    ctx.fillStyle = t.accent;
    ctx.textAlign = 'left';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText(`KIT ${g.tools.kit}  [1] coin 1 · [2] smoke 2 · [3] jam 2`, 668, 38);
    ctx.fillStyle = t.hudDim;
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`TARGETS ${g.loot.targetsDone}/${g.loot.targetsTotal}`, 668, 20);
  }

  drawHintBar(ctx, g, t) {
    ctx.fillStyle = 'rgba(5,6,14,0.72)';
    ctx.fillRect(0, this.H - 22, this.W, 22);
    ctx.fillStyle = t.hudDim;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    const obj = g.loot.allTargetsTaken ? 'All targets stolen — reach the EXIT!' : g.level.sub;
    ctx.fillText(obj, 12, this.H - 7);
    ctx.textAlign = 'right';
    const mm = Math.floor(g.time / 60); const ss = Math.floor(g.time % 60);
    ctx.fillText(`${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, 948, this.H - 7);
  }

  overlayPanel(ctx, title, lines, accent) {
    ctx.fillStyle = 'rgba(4,5,12,0.78)';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.fillStyle = accent;
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 480, 240);
    ctx.fillStyle = '#e8ecf7';
    ctx.font = '16px system-ui, sans-serif';
    lines.forEach((ln, i) => ctx.fillText(ln, 480, 278 + i * 26));
  }

  drawTitle(ctx, g, t) {
    ctx.fillStyle = 'rgba(4,5,12,0.82)';
    ctx.fillRect(0, 0, this.W, this.H);
    ctx.fillStyle = t.loot;
    ctx.font = 'bold 46px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.campaign.title, 480, 170);
    ctx.fillStyle = t.accent;
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(g.campaign.tagline, 480, 200);
    ctx.fillStyle = '#e8ecf7';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText('Cross the room unseen. Dodge vision cones and cameras.', 480, 250);
    ctx.fillText('Steal every target, then reach the exit before the alarm hits 100.', 480, 274);
    ctx.fillStyle = t.exit;
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('ENTER — play Moonlit Vault (museum)', 480, 330);
    ctx.fillStyle = t.accent;
    ctx.fillText('2 — play Duskline Casino (neon casino)', 480, 358);
    ctx.fillStyle = t.hudDim;
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('WASD move · Shift sneak · E grab loot · 1 coin toss · 2 smoke veil · 3 jam cameras · Click: toss coin · M mute', 480, 410);
    ctx.fillText('Sneak through shadows. A guard needs ~1.5 s of clear sight to raise the alarm — break line of sight to cool it down.', 480, 436);
  }

  drawLevelClear(ctx, g, t) {
    this.overlayPanel(ctx, 'HEIST COMPLETE', [
      `${g.level.name} — loot banked: $${g.score}`,
      g.levelIndex + 1 < g.campaign.levels.length ? 'Next room loading…' : 'One last room…',
    ], t.exit);
  }

  drawCaught(ctx, g, t) {
    const flash = 0.25 + 0.15 * Math.sin(g.now * 10);
    ctx.fillStyle = `rgba(255,30,20,${Math.max(0, flash)})`;
    ctx.fillRect(0, 0, this.W, this.H);
    this.overlayPanel(ctx, 'CAUGHT!', [
      'The alarm hit 100 — the guards closed in.',
      g.lives > 0 ? `Lives left: ${g.lives} — back to the room entrance.` : 'No lives left.',
    ], t.danger);
  }

  drawWin(ctx, g, t) {
    const mins = Math.floor(g.time / 60); const secs = Math.floor(g.time % 60);
    this.overlayPanel(ctx, 'CLEAN GETAWAY!', [
      `${g.campaign.title} — all 3 heists done.`,
      `Final loot: $${g.score}   ·   Time: ${mins}:${String(secs).padStart(2, '0')}   ·   Alarm peak: ${Math.round(g.alarm.peak)}%`,
      `Lives left: ${g.lives} — ${g.lives === 3 ? 'Ghost: never caught once.' : g.lives === 2 ? 'One close call.' : 'Scraped through.'}`,
      'Press ENTER to play again.',
    ], t.exit);
  }

  drawGameOver(ctx, g, t) {
    this.overlayPanel(ctx, 'THE VAULT WINS', [
      'Three strikes — the crew is in custody.',
      `Loot kept: $${g.score} — press R to try again.`,
    ], t.danger);
  }
}

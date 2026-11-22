// main.js — the game itself: state machine, loop, and wiring.
// One job: own the Game — load levels, move the thief, run guards,
// cameras, loot, tools and the alarm, and hand the state to the renderer.
// Playfield: x 8..952, y 56..592 (the HUD owns the top 56 px).
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { THEMES } from './theme.js';
import { CAMPAIGNS } from './levels.js';
import { Guard } from './guards.js';
import { Camera } from './cameras.js';
import { LootField } from './loot.js';
import { Toolbelt } from './tools.js';
import { Alarm } from './alarm.js';
import { Renderer } from './render.js';
import { applyShotPose } from './shots.js';

const BOUNDS = { x0: 8, y0: 56, x1: 952, y1: 592 };

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.renderer = new Renderer(canvas);
    this.campaignKey = 'museum';
    this.campaign = CAMPAIGNS.museum;
    this.theme = THEMES.museum;
    this.levelIndex = 0;
    this.level = this.campaign.levels[0];
    this.state = 'title'; // title | playing | levelclear | caught | win | gameover
    this.player = { x: 70, y: 540, r: 11, facing: 0, sneaking: false, running: false, invisibleUntil: 0 };
    this.guards = [];
    this.cameras = [];
    this.loot = new LootField(this.level);
    this.tools = new Toolbelt();
    this.alarm = new Alarm(() => this.onCaught());
    this.lives = 3;
    this.score = 0;
    this.time = 0;
    this.levelTime = 0;
    this.now = 0;
    this.frozen = false;
    this.stateTimer = 0;
    this.activeTarget = null;
    this.message = '';
    this.world = { solids: [], shadows: [] };
    // Guards move through the world object; bind the game's collision test
    // onto it so Guard.moveToward can call world.hitsSolid.
    this.world.hitsSolid = (x, y, r) => this.hitsSolid(x, y, r);
    this.loadLevel(this.campaignKey, 0);
    this.state = 'title';
    // Headless / test hook: read-only snapshot of the live state.
    window.__game = {
      state: () => this.state,
      campaign: () => this.campaignKey,
      levelIndex: () => this.levelIndex,
      player: () => ({ x: this.player.x, y: this.player.y }),
      alarm: () => this.alarm.value,
      lives: () => this.lives,
      score: () => this.score,
      targets: () => `${this.loot.targetsDone}/${this.loot.targetsTotal}`,
      kit: () => this.tools.kit,
      guards: () => this.guards.map((g) => ({ x: Math.round(g.x), y: Math.round(g.y), facing: +g.currentFacing().toFixed(2), suspicion: Math.round(g.suspicion), state: g.state })),
      errors: [],
    };
    window.addEventListener('error', (e) => window.__game.errors.push(String(e.message || e.error)));
  }

  loadLevel(campaignKey, idx) {
    this.campaignKey = campaignKey;
    this.campaign = CAMPAIGNS[campaignKey];
    this.theme = THEMES[this.campaign.theme];
    this.levelIndex = idx;
    this.level = this.campaign.levels[idx];
    const def = this.level;
    this.guards = def.guards.map((d) => new Guard(d));
    this.cameras = def.cameras.map((d) => new Camera(d));
    this.loot = new LootField(def);
    this.world.solids = [...def.walls, ...def.covers];
    this.world.shadows = def.shadows;
    this.world.alarm = this.alarm; // guards read the live alarm off the world
    this.player.x = def.start[0];
    this.player.y = def.start[1];
    this.player.facing = 0;
    this.player.invisibleUntil = 0;
    this.alarm.reset(def.alarmStart || 0);
    this.levelTime = 0;
    this.activeTarget = null;
  }

  startCampaign(campaignKey) {
    this.score = 0;
    this.lives = 3;
    this.time = 0;
    this.tools = new Toolbelt();
    this.loadLevel(campaignKey, 0);
    this.state = 'playing';
    this.sounds.ensure();
  }

  hitsSolid(x, y, r) {
    if (x - r < BOUNDS.x0 || x + r > BOUNDS.x1 || y - r < BOUNDS.y0 || y + r > BOUNDS.y1) return true;
    for (const s of this.world.solids) {
      const cx = Math.max(s.x, Math.min(x, s.x + s.w));
      const cy = Math.max(s.y, Math.min(y, s.y + s.h));
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r) return true;
    }
    return false;
  }

  movePlayer(dt) {
    const v = this.input.moveVector();
    const p = this.player;
    p.sneaking = this.input.sneaking;
    p.running = !p.sneaking && (v.x !== 0 || v.y !== 0);
    if (v.x === 0 && v.y === 0) return;
    const speed = p.sneaking ? 78 : 152;
    p.facing = Math.atan2(v.y, v.x);
    const nx = p.x + v.x * speed * dt;
    const ny = p.y + v.y * speed * dt;
    if (!this.hitsSolid(nx, p.y, p.r)) p.x = nx;
    if (!this.hitsSolid(p.x, ny, p.r)) p.y = ny;
  }

  onCaught() {
    if (this.state !== 'playing') return;
    this.state = 'caught';
    this.stateTimer = 1.4;
    this.sounds.caught();
  }

  update(dt) {
    const now = this.now;
    const input = this.input;
    if (input.hit('m')) this.sounds.muted = !this.sounds.muted;

    if (this.state === 'title') {
      if (input.hit('enter')) this.startCampaign('museum');
      else if (input.hit('2')) this.startCampaign('casino');
      return;
    }
    if (this.state === 'win' || this.state === 'gameover') {
      if (input.hit('enter') || input.hit('r')) {
        this.loadLevel('museum', 0);
        this.state = 'title';
      }
      return;
    }
    if (this.state === 'levelclear') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (this.levelIndex + 1 < this.campaign.levels.length) {
          this.loadLevel(this.campaignKey, this.levelIndex + 1);
          this.state = 'playing';
        } else {
          this.state = 'win';
          this.sounds.win();
        }
      }
      return;
    }
    if (this.state === 'caught') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.lives -= 1;
        if (this.lives <= 0) {
          this.state = 'gameover';
        } else {
          this.loadLevel(this.campaignKey, this.levelIndex);
          this.state = 'playing';
        }
      }
      return;
    }
    if (this.state !== 'playing') return;

    // --- playing ---
    this.time += dt;
    this.levelTime += dt;
    this.sounds.ensure();
    const p = this.player;
    // Smoke veil hides the thief: mirror the toolbelt timer onto the player
    // so guards, cameras and the renderer all read the same value.
    p.invisibleUntil = this.tools.smokeUntil;
    this.movePlayer(dt);
    this.tools.update(now);

    // Tools: keys 1/2/3, or click to toss a coin at that spot.
    if (input.hit('1')) {
      const tx = p.x + Math.cos(p.facing) * 130;
      const ty = p.y + Math.sin(p.facing) * 130;
      this.tools.tryCoin(p, Math.max(20, Math.min(940, tx)), Math.max(70, Math.min(580, ty)), now, this.guards, this.sounds);
    }
    if (input.mouse.clicked) {
      this.tools.tryCoin(p, input.mouse.clickX, input.mouse.clickY, now, this.guards, this.sounds);
    }
    if (input.hit('2')) this.tools.trySmoke(now, this.sounds);
    if (input.hit('3')) this.tools.tryJam(now, this.cameras, this.sounds);

    // Loot: hold E beside a target to grab it.
    const grabbing = input.down('e');
    this.activeTarget = this.loot.update(dt, p, grabbing, this.sounds, (value, kitGain) => {
      this.score += value;
      this.tools.kit += kitGain;
    });

    // Watchers. The smoke timer is the single source of invisibility:
    // guards, cameras and the renderer all read player.invisibleUntil.
    let anyGuardSeen = false;
    let maxSuspicion = 0;
    for (const gd of this.guards) {
      const seen = gd.update(dt, now, p, this.world);
      if (seen && seen.seen) { anyGuardSeen = true; maxSuspicion = Math.max(maxSuspicion, gd.suspicion); }
    }
    let anyCameraSeen = false;
    for (const cam of this.cameras) {
      if (cam.update(dt, now, p, this.world)) anyCameraSeen = true;
    }

    // Alarm: rises while seen, cools while hidden.
    let exposure = 0;
    if (anyGuardSeen) exposure = 0.55 + 0.45 * (maxSuspicion / 100);
    else if (anyCameraSeen) exposure = 0.6;
    this.alarm.update(dt, exposure);
    if (this.alarm.mood === 'hunted') this.sounds.alarmTick(now * 1000);

    // Exit: only open once every target is stolen.
    if (this.loot.allTargetsTaken) {
      const e = this.level.exit;
      if (p.x > e.x - 6 && p.x < e.x + e.w + 6 && p.y > e.y - 6 && p.y < e.y + e.h + 6) {
        this.state = 'levelclear';
        this.stateTimer = 1.8;
        this.sounds.doorOpen();
      }
    }
  }

  frame(tms) {
    const dt = Math.min(0.05, (tms - (this.lastT ?? tms)) / 1000 || 0.016);
    this.lastT = tms;
    this.now = tms / 1000;
    if (!this.frozen) {
      try {
        this.update(dt);
      } catch (err) {
        // One bad frame must never kill the game loop (the stealth-v2
        // lesson): record it (capped) and keep rendering.
        if (window.__game.errors.length < 10) window.__game.errors.push(String((err && err.message) || err));
      }
    }
    this.renderer.draw(this);
    this.input.endFrame();
    requestAnimationFrame((t) => this.frame(t));
  }

  boot() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    const campaign = params.get('campaign') || 'museum';
    const level = Math.max(0, Math.min(2, parseInt(params.get('level') || '0', 10)));
    if (shot) {
      applyShotPose(this, shot);
      this.frozen = true;
    } else if (params.get('autostart') === '1') {
      this.startCampaign(campaign);
      if (params.get('level')) this.loadLevel(campaign, level);
    } else {
      this.loadLevel(campaign, level);
      this.state = 'title';
    }
    requestAnimationFrame((t) => this.frame(t));
  }
}

const game = new Game(document.getElementById('game'));
game.boot();

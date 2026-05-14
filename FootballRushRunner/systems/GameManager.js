import { createPerspective } from './PerspectiveSystem';
import { createPlayerController } from './PlayerController';
import { createTrackManager } from './TrackManager';
import { createSpawnManager } from './SpawnManager';
import { createDifficultyManager } from './DifficultyManager';
import { createPowerUpManager } from './PowerUpManager';
import { createChasePressureSystem } from './ChasePressureSystem';
import { createCollisionSystem } from './CollisionSystem';
import { renderObstacle } from './ObstacleSystem';
import { renderCollectible } from './CollectibleSystem';
import { StorageSystem } from './StorageSystem';

export const GAME_STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
};

export function createGameManager({ ctx, width, height, onStateChange }) {
  let W = width;
  let H = height;
  let persp = createPerspective(W, H);

  const player = createPlayerController();
  const track = createTrackManager();
  const difficulty = createDifficultyManager();
  const spawn = createSpawnManager({ difficulty });
  const powerups = createPowerUpManager(player);
  const chase = createChasePressureSystem();
  const collision = createCollisionSystem();

  const stats = {
    score: 0,
    coins: 0,
    yards: 0,
    multiplier: 1,
    streak: 0,
    nearMisses: 0,
    highScore: StorageSystem.loadHighScore(),
    highYards: StorageSystem.loadHighYards(),
  };

  let state = GAME_STATE.IDLE;
  const screenShake = { x: 0, y: 0, intensity: 0 };
  const flashFx = { color: null, alpha: 0 };
  const popups = [];

  function setState(next) {
    state = next;
    if (typeof onStateChange === 'function') onStateChange(next, getSnapshot());
  }

  function getState() { return state; }

  function getSnapshot() {
    return {
      state,
      score: stats.score,
      coins: stats.coins,
      yards: difficulty.getYards(),
      multiplier: stats.multiplier,
      streak: stats.streak,
      nearMisses: stats.nearMisses,
      speed: difficulty.getSpeed(),
      tier: difficulty.getTier(),
      pressure: chase.getPressurePct(),
      chaserDepth: chase.getChaserDepth(),
      power: powerups.getStatus(),
      highScore: stats.highScore,
      highYards: stats.highYards,
    };
  }

  function resize(w, h) {
    W = w; H = h;
    persp = createPerspective(W, H);
  }

  function start() {
    player.reset();
    track.reset();
    spawn.reset();
    difficulty.reset();
    chase.reset();
    stats.score = 0;
    stats.coins = 0;
    stats.yards = 0;
    stats.multiplier = 1;
    stats.streak = 0;
    stats.nearMisses = 0;
    popups.length = 0;
    flashFx.color = null;
    flashFx.alpha = 0;
    screenShake.intensity = 0;
    setState(GAME_STATE.RUNNING);
  }

  function pause() {
    if (state === GAME_STATE.RUNNING) setState(GAME_STATE.PAUSED);
  }
  function resume() {
    if (state === GAME_STATE.PAUSED) setState(GAME_STATE.RUNNING);
  }
  function togglePause() {
    if (state === GAME_STATE.RUNNING) pause();
    else if (state === GAME_STATE.PAUSED) resume();
  }

  function gameOver() {
    if (state === GAME_STATE.GAME_OVER) return;
    stats.yards = difficulty.getYards();
    if (stats.score > stats.highScore) {
      stats.highScore = stats.score;
      StorageSystem.saveHighScore(stats.score);
    }
    if (stats.yards > stats.highYards) {
      stats.highYards = stats.yards;
      StorageSystem.saveHighYards(stats.yards);
    }
    setState(GAME_STATE.GAME_OVER);
  }

  function handleAction(action) {
    if (state === GAME_STATE.IDLE) {
      if (action === 'tap' || action === 'jump') start();
      return;
    }
    if (state === GAME_STATE.GAME_OVER) {
      if (action === 'tap' || action === 'jump') start();
      return;
    }
    if (state === GAME_STATE.PAUSED) {
      if (action === 'pause' || action === 'tap') resume();
      return;
    }
    if (state !== GAME_STATE.RUNNING) return;
    switch (action) {
      case 'left': player.moveLeft(); break;
      case 'right': player.moveRight(); break;
      case 'jump': player.jump(); break;
      case 'slide': player.slide(); break;
      case 'pause': pause(); break;
    }
  }

  function addPopup(text, color) {
    popups.push({ text, color: color || '#FFFFFF', life: 1.0, t: 0 });
    if (popups.length > 5) popups.shift();
  }

  function processCollisions() {
    const bounds = player.getCollisionBounds();
    const speed = difficulty.getSpeed();

    const obstacles = spawn.getObstacles();
    for (const o of obstacles) {
      if (o.passed && !collision.inCollisionZone(o.z) && !collision.inNearMissZone(o.z)) continue;
      const result = collision.checkObstacle(bounds, o, o.def);
      if (!result) continue;
      if (result.type === 'cleared' && !o.passed) {
        o.passed = true;
        stats.streak += 1;
        stats.score += 10 * stats.multiplier;
        if (stats.streak % 5 === 0) {
          stats.multiplier = Math.min(5, stats.multiplier + 1);
          addPopup(`x${stats.multiplier}!`, '#FBBF24');
        }
      } else if (result.type === 'nearmiss' && !o.passed && !o.nearMissed) {
        o.nearMissed = true;
        stats.nearMisses += 1;
        chase.addNearMiss();
      } else if (result.type === 'stumble') {
        if (player.isInvincible() || player.isShielded()) {
          if (player.isShielded()) player.consumeShield();
          o.passed = true;
          o.flash = 0.4;
        } else if (chase.isAtMax()) {
          screenShake.intensity = 16;
          flashFx.color = '#7C3AED';
          flashFx.alpha = 0.7;
          player.tackle();
          gameOver();
          return;
        } else {
          o.passed = true;
          o.flash = 0.4;
          player.stumble();
          stats.streak = 0;
          stats.multiplier = 1;
          chase.addStumble();
          screenShake.intensity = 8;
          flashFx.color = '#EF4444';
          flashFx.alpha = 0.4;
          player.applyInvincibility(0.5);
        }
      } else if (result.type === 'tackle') {
        if (player.isInvincible()) {
          o.passed = true;
        } else if (player.isShielded()) {
          player.consumeShield();
          o.passed = true;
          o.flash = 0.4;
          player.applyInvincibility(0.6);
          screenShake.intensity = 6;
          flashFx.color = '#22D3EE';
          flashFx.alpha = 0.5;
        } else {
          screenShake.intensity = 16;
          flashFx.color = '#EF4444';
          flashFx.alpha = 0.7;
          player.tackle();
          gameOver();
          return;
        }
      }
    }

    const collectibles = spawn.getCollectibles();
    const magnetActive = player.isMagnetActive();
    for (const c of collectibles) {
      if (c.collected) continue;
      if (magnetActive && c.z < 0.45 && c.z > 0) {
        const targetX = player.currentLaneFloat();
        c.lane += (targetX - c.lane) * 0.18;
      }
      if (collision.checkCollectible(bounds, c)) {
        c.collected = true;
        if (c.def.kind === 'powerup') {
          powerups.applyPickup(c.def.powerup);
          if (c.def.powerup === 'boost') chase.addBoostPickup();
          addPopup(c.def.powerup.toUpperCase(), c.def.color);
        } else {
          const value = c.def.value * stats.multiplier;
          stats.coins += c.def.value;
          stats.score += value * (c.def.id === 'goldFootball' ? 4 : 1);
          if (c.def.id === 'goldFootball') addPopup(`+${value * 4}`, '#FBBF24');
        }
      }
    }
    void speed;
  }

  function update(dt) {
    if (state !== GAME_STATE.RUNNING) return;

    const speedBoost = powerups.getBoostMultiplier();
    const speed = difficulty.getSpeed() * speedBoost;

    difficulty.update(dt * speedBoost);
    chase.update(dt);
    if (chase.isAtMax()) {
      flashFx.color = '#7C3AED';
      flashFx.alpha = Math.max(flashFx.alpha, 0.25);
    }

    player.update(dt);
    track.update(dt, speed);
    spawn.advance(dt, speed);
    spawn.update(dt);
    processCollisions();

    stats.score += dt * 8 * stats.multiplier * speedBoost;

    if (screenShake.intensity > 0) {
      screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
      screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
      screenShake.intensity = Math.max(0, screenShake.intensity - dt * 30);
    } else {
      screenShake.x = 0;
      screenShake.y = 0;
    }
    if (flashFx.alpha > 0) {
      flashFx.alpha = Math.max(0, flashFx.alpha - dt * 1.4);
    }

    for (let i = popups.length - 1; i >= 0; i--) {
      popups[i].t += dt;
      if (popups[i].t >= popups[i].life) popups.splice(i, 1);
    }
  }

  function render() {
    if (!ctx) return;
    ctx.save();
    ctx.translate(screenShake.x, screenShake.y);

    track.render(ctx, persp);
    renderChaser(ctx, persp, chase, player);

    const renderables = [];
    for (const o of spawn.getObstacles()) renderables.push({ kind: 'o', ref: o, z: o.z });
    for (const c of spawn.getCollectibles()) renderables.push({ kind: 'c', ref: c, z: c.z });
    renderables.push({ kind: 'p', z: 0 });
    renderables.sort((a, b) => b.z - a.z);

    for (const r of renderables) {
      if (r.kind === 'o') renderObstacle(ctx, r.ref, persp);
      else if (r.kind === 'c') renderCollectible(ctx, r.ref, persp, 0);
      else renderPlayer(ctx, persp, player);
    }

    renderPressureBar(ctx, persp, chase);
    renderPopups(ctx, persp, popups);

    ctx.restore();

    if (flashFx.alpha > 0) {
      ctx.fillStyle = flashFx.color || '#FFFFFF';
      ctx.globalAlpha = flashFx.alpha;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  return {
    getState,
    getSnapshot,
    start,
    pause,
    resume,
    togglePause,
    handleAction,
    update,
    render,
    resize,
    GAME_STATE,
  };
}

function renderPlayer(ctx, persp, player) {
  const lane = player.currentLaneFloat();
  const z = 0;
  const x = persp.getLaneX(lane, z);
  const baseY = persp.PLAYER_Y;
  const scale = persp.getScaleFromDepth(z);
  const sz = persp.LANE_WIDTH_NEAR * 0.5 * scale;
  const lift = player.state.jumpHeight * sz * 1.6;
  const slide = player.state.slideOffset;
  const y = baseY - lift;

  if (player.isShielded()) {
    ctx.save();
    ctx.shadowColor = '#22D3EE';
    ctx.shadowBlur = sz * 0.7;
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
    ctx.lineWidth = sz * 0.08;
    ctx.beginPath();
    ctx.arc(x, y - sz * 0.6, sz * 1.05, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (player.isInvincible()) ctx.globalAlpha = 0.6 + 0.4 * Math.sin(performance.now() * 0.04);

  const crouchScale = 1 - slide * 0.55;
  const bodyH = sz * 1.7 * crouchScale;
  const bodyW = sz * 0.7;
  const cycle = Math.sin(player.state.runCycle);

  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(x, baseY + 4, sz * 0.55, sz * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(player.state.facing * 0.4);

  ctx.fillStyle = '#0F172A';
  const legSpread = cycle * sz * 0.3;
  ctx.fillRect(-bodyW * 0.35 + legSpread, -bodyH * 0.15, bodyW * 0.3, bodyH * 0.35);
  ctx.fillRect(bodyW * 0.05 - legSpread, -bodyH * 0.15, bodyW * 0.3, bodyH * 0.35);

  ctx.fillStyle = '#22D3EE';
  ctx.fillRect(-bodyW / 2, -bodyH * 0.7, bodyW, bodyH * 0.6);
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(-bodyW / 2, -bodyH * 0.5, bodyW, bodyH * 0.08);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.max(7, sz * 0.55)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('1', 0, -bodyH * 0.32);

  ctx.fillStyle = '#22D3EE';
  ctx.beginPath();
  ctx.arc(0, -bodyH * 0.85, bodyW * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(-bodyW * 0.35, -bodyH * 0.85, bodyW * 0.7, bodyW * 0.08);
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(-bodyW * 0.32, -bodyH * 0.83, bodyW * 0.64, bodyW * 0.05);

  ctx.fillStyle = '#A16207';
  const ballX = bodyW * 0.45;
  const ballY = -bodyH * 0.4 + cycle * sz * 0.1;
  ctx.beginPath();
  ctx.ellipse(ballX, ballY, sz * 0.18, sz * 0.11, -0.4, 0, Math.PI * 2);
  ctx.fill();

  const armSwing = cycle * sz * 0.25;
  ctx.fillStyle = '#22D3EE';
  ctx.fillRect(-bodyW * 0.65, -bodyH * 0.55 + armSwing, bodyW * 0.18, bodyH * 0.4);
  ctx.fillRect(bodyW * 0.47, -bodyH * 0.55 - armSwing, bodyW * 0.18, bodyH * 0.4);

  ctx.restore();
  ctx.globalAlpha = 1;
}

function renderChaser(ctx, persp, chase, player) {
  const z = chase.getChaserDepth();
  if (z < 0.2 || z > 1.05) return;
  const x = persp.CENTER_X;
  const y = persp.getYFromDepth(Math.min(1, z));
  const scale = persp.getScaleFromDepth(Math.min(1, z));
  const sz = persp.LANE_WIDTH_NEAR * 0.55 * scale;

  ctx.save();
  ctx.globalAlpha = Math.min(1, 0.4 + (1 - z) * 1.2);
  ctx.fillStyle = '#7C3AED';
  ctx.fillRect(x - sz * 0.4, y - sz * 1.5, sz * 0.8, sz * 0.9);
  ctx.fillStyle = '#1F2937';
  ctx.beginPath();
  ctx.arc(x, y - sz * 1.55, sz * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FBBF24';
  ctx.font = `bold ${Math.max(6, sz * 0.45)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('99', x, y - sz * 0.7);
  ctx.shadowColor = '#7C3AED';
  ctx.shadowBlur = sz * 0.5;
  ctx.restore();
}

function renderPressureBar(ctx, persp, chase) {
  const pct = chase.getPressurePct();
  if (pct <= 0.01) return;
  const W = persp.W;
  const padding = W * 0.06;
  const barH = 6;
  const y = 8;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(padding, y, W - padding * 2, barH);
  const grad = ctx.createLinearGradient(padding, 0, W - padding, 0);
  grad.addColorStop(0, '#FBBF24');
  grad.addColorStop(0.6, '#F97316');
  grad.addColorStop(1, '#EF4444');
  ctx.fillStyle = grad;
  ctx.fillRect(padding, y, (W - padding * 2) * pct, barH);
  if (chase.getWarningFlash() > 0) {
    ctx.fillStyle = `rgba(239, 68, 68, ${chase.getWarningFlash()})`;
    ctx.fillRect(0, 0, W, 20);
  }
}

function renderPopups(ctx, persp, popups) {
  ctx.textAlign = 'center';
  for (let i = 0; i < popups.length; i++) {
    const p = popups[i];
    const t = p.t / p.life;
    const alpha = 1 - t;
    const yOff = -t * 80;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.font = `bold ${22 + i * 2}px sans-serif`;
    ctx.fillText(p.text, persp.CENTER_X, persp.PLAYER_Y - 100 + yOff);
  }
  ctx.globalAlpha = 1;
}

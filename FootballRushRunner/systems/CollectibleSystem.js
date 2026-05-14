export const COLLECTIBLE_TYPES = {
  football: { id: 'football', value: 1, color: '#A16207', accent: '#FFFFFF' },
  goldFootball: { id: 'goldFootball', value: 5, color: '#FBBF24', accent: '#FFFFFF' },
  helmet: { id: 'helmet', value: 0, kind: 'powerup', powerup: 'shield', color: '#22D3EE', accent: '#0EA5E9' },
  jersey: { id: 'jersey', value: 0, kind: 'powerup', powerup: 'magnet', color: '#A855F7', accent: '#7C3AED' },
  whistle: { id: 'whistle', value: 0, kind: 'powerup', powerup: 'boost', color: '#10B981', accent: '#065F46' },
};

export function getCollectibleDef(typeId) {
  return COLLECTIBLE_TYPES[typeId];
}

export function makeCollectible(typeId, lane, z, opts = {}) {
  const def = COLLECTIBLE_TYPES[typeId];
  return {
    kind: 'collectible',
    type: typeId,
    lane,
    z,
    yOffset: opts.yOffset ?? 0,
    collected: false,
    bob: Math.random() * Math.PI * 2,
    def,
  };
}

export function pickRandomCollectible(rngSeed) {
  const r = Math.random();
  if (r < 0.04) return 'helmet';
  if (r < 0.07) return 'jersey';
  if (r < 0.10) return 'whistle';
  if (r < 0.18) return 'goldFootball';
  return 'football';
}

export function renderCollectible(ctx, c, persp, dt) {
  if (c.collected) return;
  const { z, lane, def } = c;
  if (z < -0.05 || z > 1.05) return;
  c.bob += dt * 4;

  const x = persp.getLaneX(lane, z);
  const y = persp.getYFromDepth(z) - (c.yOffset || 0) * persp.getScaleFromDepth(z) * 60;
  const scale = persp.getScaleFromDepth(z);
  const sz = persp.LANE_WIDTH_NEAR * 0.18 * scale;

  ctx.save();
  const bobOffset = Math.sin(c.bob) * sz * 0.18;

  if (def.kind === 'powerup') {
    drawPowerUp(ctx, x, y - sz * 0.6 + bobOffset, sz, def);
  } else if (def.id === 'goldFootball') {
    drawFootball(ctx, x, y - sz * 0.6 + bobOffset, sz * 1.15, def, true);
  } else {
    drawFootball(ctx, x, y - sz * 0.6 + bobOffset, sz, def, false);
  }
  ctx.restore();
}

function drawFootball(ctx, x, y, sz, def, gold) {
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.ellipse(x, y, sz * 0.95, sz * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = def.accent;
  ctx.lineWidth = Math.max(0.8, sz * 0.08);
  ctx.beginPath();
  ctx.moveTo(x - sz * 0.45, y);
  ctx.lineTo(x + sz * 0.45, y);
  ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * sz * 0.16, y - sz * 0.12);
    ctx.lineTo(x + i * sz * 0.16, y + sz * 0.12);
    ctx.stroke();
  }
  if (gold) {
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = sz * 0.6;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = sz * 0.08;
    ctx.beginPath();
    ctx.ellipse(x, y, sz * 1.05, sz * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPowerUp(ctx, x, y, sz, def) {
  ctx.shadowColor = def.color;
  ctx.shadowBlur = sz * 0.8;
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.arc(x, y, sz * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = def.accent;
  ctx.beginPath();
  ctx.arc(x, y, sz * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.max(6, sz * 0.85)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let label = '?';
  if (def.powerup === 'shield') label = 'H';
  else if (def.powerup === 'magnet') label = 'J';
  else if (def.powerup === 'boost') label = 'W';
  ctx.fillText(label, x, y);
}

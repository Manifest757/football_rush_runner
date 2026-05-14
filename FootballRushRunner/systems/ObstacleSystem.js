export const OBSTACLE_TYPES = {
  defender: {
    id: 'defender',
    requiredAction: 'jump',
    severity: 'fatal',
    color: '#1F2937',
    accent: '#EF4444',
    label: 'LB',
    height: 1.0,
    width: 0.55,
    weight: 5,
  },
  hurdle: {
    id: 'hurdle',
    requiredAction: 'jump',
    severity: 'stumble',
    color: '#FBBF24',
    accent: '#92400E',
    label: 'CONE',
    height: 0.32,
    width: 0.58,
    weight: 4,
  },
  blockingSled: {
    id: 'blockingSled',
    requiredAction: 'slide',
    severity: 'fatal',
    color: '#7C3AED',
    accent: '#FBBF24',
    label: 'SLED',
    height: 0.85,
    width: 0.7,
    weight: 3,
  },
  bench: {
    id: 'bench',
    requiredAction: 'slide',
    severity: 'fatal',
    color: '#374151',
    accent: '#9CA3AF',
    label: 'BAR',
    height: 0.9,
    width: 0.78,
    weight: 2,
  },
  cone: {
    id: 'cone',
    requiredAction: 'slide',
    severity: 'stumble',
    color: '#F97316',
    accent: '#FFFFFF',
    label: 'C',
    height: 0.42,
    width: 0.4,
    weight: 3,
  },
};

export function getObstacleDefinition(typeId) {
  return OBSTACLE_TYPES[typeId];
}

export function makeObstacle(typeId, lane, z) {
  const def = OBSTACLE_TYPES[typeId];
  return {
    kind: 'obstacle',
    type: typeId,
    lane,
    z,
    dead: false,
    passed: false,
    nearMissed: false,
    flash: 0,
    def,
  };
}

export function pickWeightedObstacle(complexity) {
  let pool;
  if (complexity <= 1) {
    pool = ['hurdle', 'cone', 'defender'];
  } else if (complexity <= 2) {
    pool = ['hurdle', 'cone', 'defender', 'blockingSled'];
  } else if (complexity <= 3) {
    pool = ['hurdle', 'cone', 'defender', 'blockingSled', 'bench'];
  } else {
    pool = ['hurdle', 'cone', 'defender', 'defender', 'blockingSled', 'bench'];
  }
  const weighted = pool.flatMap(id => Array(OBSTACLE_TYPES[id].weight).fill(id));
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function renderObstacle(ctx, obstacle, persp) {
  const { z, lane, def } = obstacle;
  if (z < -0.05 || z > 1.05) return;
  const x = persp.getLaneX(lane, z);
  const y = persp.getYFromDepth(z);
  const scale = persp.getScaleFromDepth(z);
  const baseSize = persp.LANE_WIDTH_NEAR * 0.42;
  const w = baseSize * scale * def.width;
  const h = baseSize * scale * def.height * 1.6;

  ctx.save();
  if (obstacle.flash > 0) {
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(obstacle.flash * 30);
  }

  switch (def.id) {
    case 'defender':
      drawDefender(ctx, x, y, w, h, def);
      break;
    case 'hurdle':
      drawHurdle(ctx, x, y, w, h, def);
      break;
    case 'blockingSled':
      drawSled(ctx, x, y, w, h, def);
      break;
    case 'bench':
      drawBench(ctx, x, y, w, h, def);
      break;
    case 'cone':
      drawCone(ctx, x, y, w, h, def);
      break;
  }

  if (z > 0.05) {
    ctx.globalAlpha = Math.min(0.35, 0.35 * (1 - z));
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, w * 0.65, w * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDefender(ctx, x, y, w, h, def) {
  const bodyTop = y - h;
  ctx.fillStyle = def.color;
  ctx.fillRect(x - w / 2, bodyTop + h * 0.3, w, h * 0.55);
  ctx.fillStyle = def.accent;
  ctx.fillRect(x - w / 2, bodyTop + h * 0.5, w, h * 0.08);
  ctx.fillStyle = '#1F2937';
  ctx.beginPath();
  ctx.arc(x, bodyTop + h * 0.2, w * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(x - w * 0.22, bodyTop + h * 0.18, w * 0.44, h * 0.04);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.max(6, w * 0.45)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('D', x, bodyTop + h * 0.62);
  ctx.fillStyle = '#111827';
  ctx.fillRect(x - w * 0.45, bodyTop + h * 0.85, w * 0.4, h * 0.18);
  ctx.fillRect(x + w * 0.05, bodyTop + h * 0.85, w * 0.4, h * 0.18);
}

function drawHurdle(ctx, x, y, w, h, def) {
  ctx.fillStyle = def.accent;
  ctx.fillRect(x - w / 2, y - h * 0.15, w, h * 0.15);
  ctx.fillStyle = def.color;
  ctx.fillRect(x - w / 2, y - h, w, h * 0.85);
  ctx.fillStyle = '#1F2937';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x - w / 2 + (w / 4) * i, y - h, w * 0.05, h);
  }
}

function drawSled(ctx, x, y, w, h, def) {
  ctx.fillStyle = def.color;
  ctx.fillRect(x - w / 2, y - h, w, h * 0.7);
  ctx.fillStyle = def.accent;
  ctx.fillRect(x - w / 2, y - h, w, h * 0.15);
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(x - w / 2, y - h * 0.3, w, h * 0.15);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.max(5, w * 0.3)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('SLED', x, y - h * 0.55);
}

function drawBench(ctx, x, y, w, h, def) {
  ctx.fillStyle = def.color;
  ctx.fillRect(x - w / 2, y - h * 0.7, w, h * 0.18);
  ctx.fillStyle = def.accent;
  ctx.fillRect(x - w * 0.45, y - h * 0.15, w * 0.1, h * 0.6);
  ctx.fillRect(x + w * 0.35, y - h * 0.15, w * 0.1, h * 0.6);
}

function drawCone(ctx, x, y, w, h, def) {
  ctx.fillStyle = def.color;
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  ctx.lineTo(x + w * 0.45, y);
  ctx.lineTo(x - w * 0.45, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = def.accent;
  ctx.fillRect(x - w * 0.42, y - h * 0.45, w * 0.84, h * 0.12);
}

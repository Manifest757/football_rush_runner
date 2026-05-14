const SECTION_LENGTH = 0.18;
const NUM_SECTIONS = 12;

export function createTrackManager() {
  const sections = [];
  let nextYardLine = 50;

  function reset() {
    sections.length = 0;
    nextYardLine = 50;
    for (let i = 0; i < NUM_SECTIONS; i++) {
      sections.push({
        z: 1.0 - i * SECTION_LENGTH,
        yardLine: nextYardLine,
        accent: i % 2 === 0,
      });
      nextYardLine = (nextYardLine + 10) % 100;
    }
  }

  function update(dt, speed) {
    for (const s of sections) s.z -= speed * dt;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].z < -SECTION_LENGTH) {
        const farthest = sections.reduce((acc, s) => s.z > acc.z ? s : acc, sections[0]);
        sections[i].z = farthest.z + SECTION_LENGTH;
        sections[i].yardLine = (farthest.yardLine + 10) % 100;
        sections[i].accent = !farthest.accent;
      }
    }
  }

  function render(ctx, persp, opts = {}) {
    const { CENTER_X, HORIZON_Y, PLAYER_Y, W, H } = persp;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
    skyGrad.addColorStop(0, opts.skyTop || '#0F172A');
    skyGrad.addColorStop(1, opts.skyBottom || '#1E293B');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, HORIZON_Y);

    drawCrowd(ctx, persp);

    const fieldGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, H);
    fieldGrad.addColorStop(0, '#0E5C2C');
    fieldGrad.addColorStop(0.4, '#107A37');
    fieldGrad.addColorStop(1, '#16A34A');
    ctx.fillStyle = fieldGrad;
    ctx.fillRect(0, HORIZON_Y, W, H - HORIZON_Y);

    drawSidelines(ctx, persp);
    drawLaneStripes(ctx, persp);
    drawYardLines(ctx, persp, sections);
  }

  function drawCrowd(ctx, persp) {
    const { W, HORIZON_Y } = persp;
    const stripH = HORIZON_Y * 0.18;
    const grad = ctx.createLinearGradient(0, HORIZON_Y - stripH, 0, HORIZON_Y);
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.18)');
    grad.addColorStop(1, 'rgba(34, 211, 238, 0.04)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, HORIZON_Y - stripH, W, stripH);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < W; i += 4) {
      const h = (i % 13) * 0.6 + 2;
      ctx.fillRect(i, HORIZON_Y - h, 2, h);
    }
  }

  function drawSidelines(ctx, persp) {
    const leftEdge = (z) => persp.getLaneX(-1.7, z);
    const rightEdge = (z) => persp.getLaneX(1.7, z);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(leftEdge(1), persp.getYFromDepth(1));
    ctx.lineTo(leftEdge(0) - 4, persp.getYFromDepth(0));
    ctx.lineTo(leftEdge(0) + 4, persp.getYFromDepth(0));
    ctx.lineTo(leftEdge(1) + 1, persp.getYFromDepth(1));
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rightEdge(1), persp.getYFromDepth(1));
    ctx.lineTo(rightEdge(0) - 4, persp.getYFromDepth(0));
    ctx.lineTo(rightEdge(0) + 4, persp.getYFromDepth(0));
    ctx.lineTo(rightEdge(1) - 1, persp.getYFromDepth(1));
    ctx.closePath();
    ctx.fill();
  }

  function drawLaneStripes(ctx, persp) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (const lane of [-0.5, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(persp.getLaneX(lane, 1), persp.getYFromDepth(1));
      ctx.lineTo(persp.getLaneX(lane, 0), persp.getYFromDepth(0));
      ctx.stroke();
    }
  }

  function drawYardLines(ctx, persp, sections) {
    for (const s of sections) {
      if (s.z < -0.05 || s.z > 1.05) continue;
      const y = persp.getYFromDepth(s.z);
      const left = persp.getLaneX(-1.7, s.z);
      const right = persp.getLaneX(1.7, s.z);
      const scale = persp.getScaleFromDepth(s.z);
      ctx.strokeStyle = s.accent ? '#FFFFFF' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = Math.max(1, scale * 4);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();

      if (scale > 0.18) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(7, scale * 18)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(String(s.yardLine), persp.getLaneX(-1.55, s.z), y - 2);
        ctx.fillText(String(s.yardLine), persp.getLaneX(1.55, s.z), y - 2);
      }
    }
  }

  return {
    reset,
    update,
    render,
    sections,
  };
}

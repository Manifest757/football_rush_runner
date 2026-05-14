export const HORIZON_Y_RATIO = 0.30;
export const PLAYER_Y_RATIO = 0.82;
export const LANE_WIDTH_NEAR_RATIO = 0.22;
export const LANE_WIDTH_FAR_RATIO = 0.012;
export const MIN_SCALE = 0.04;
export const MAX_SCALE = 1.0;
export const PERSP_POW = 1.7;

export function createPerspective(W, H) {
  const HORIZON_Y = H * HORIZON_Y_RATIO;
  const PLAYER_Y = H * PLAYER_Y_RATIO;
  const LANE_WIDTH_NEAR = W * LANE_WIDTH_NEAR_RATIO;
  const LANE_WIDTH_FAR = W * LANE_WIDTH_FAR_RATIO;
  const CENTER_X = W / 2;

  function getYFromDepth(z) {
    const t = clamp01(1 - z);
    const eased = Math.pow(t, 1 / PERSP_POW);
    return HORIZON_Y + (PLAYER_Y - HORIZON_Y) * eased;
  }

  function getScaleFromDepth(z) {
    const t = clamp01(1 - z);
    const eased = Math.pow(t, PERSP_POW);
    return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * eased;
  }

  function getLaneWidthAtDepth(z) {
    const t = clamp01(1 - z);
    const eased = Math.pow(t, PERSP_POW);
    return LANE_WIDTH_FAR + (LANE_WIDTH_NEAR - LANE_WIDTH_FAR) * eased;
  }

  function getLaneX(lane, z) {
    return CENTER_X + lane * getLaneWidthAtDepth(z);
  }

  function getDepthFromY(y) {
    const t = clamp01((y - HORIZON_Y) / (PLAYER_Y - HORIZON_Y));
    const z = 1 - Math.pow(t, PERSP_POW);
    return clamp01(z);
  }

  function sortByDepth(objects) {
    objects.sort((a, b) => b.z - a.z);
    return objects;
  }

  return {
    W, H,
    HORIZON_Y, PLAYER_Y,
    LANE_WIDTH_NEAR, LANE_WIDTH_FAR,
    CENTER_X,
    MIN_SCALE, MAX_SCALE,
    getYFromDepth,
    getScaleFromDepth,
    getLaneX,
    getLaneWidthAtDepth,
    getDepthFromY,
    sortByDepth,
  };
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

import { makeObstacle, pickWeightedObstacle } from './ObstacleSystem';
import { makeCollectible, pickRandomCollectible } from './CollectibleSystem';

const SPAWN_DEPTH = 1.0;
const POOL_SIZE = 80;

export function createSpawnManager({ difficulty }) {
  const obstacles = [];
  const collectibles = [];
  const obstaclePool = [];
  const collectiblePool = [];

  let spawnCooldown = 0.6;
  let patternCooldown = 0;

  function reset() {
    obstacles.length = 0;
    collectibles.length = 0;
    obstaclePool.length = 0;
    collectiblePool.length = 0;
    spawnCooldown = 0.6;
    patternCooldown = 0;
  }

  function acquireObstacle(typeId, lane, z) {
    const recycled = obstaclePool.pop();
    const fresh = makeObstacle(typeId, lane, z);
    if (recycled) {
      Object.assign(recycled, fresh);
      obstacles.push(recycled);
      return recycled;
    }
    obstacles.push(fresh);
    return fresh;
  }

  function acquireCollectible(typeId, lane, z, opts) {
    const recycled = collectiblePool.pop();
    const fresh = makeCollectible(typeId, lane, z, opts);
    if (recycled) {
      Object.assign(recycled, fresh);
      collectibles.push(recycled);
      return recycled;
    }
    collectibles.push(fresh);
    return fresh;
  }

  function releaseObstacle(o) {
    o.dead = true;
    if (obstaclePool.length < POOL_SIZE) obstaclePool.push(o);
  }
  function releaseCollectible(c) {
    c.collected = true;
    if (collectiblePool.length < POOL_SIZE) collectiblePool.push(c);
  }
  function recycleObstacle(o) {
    if (obstaclePool.length < POOL_SIZE) obstaclePool.push(o);
  }
  function recycleCollectible(c) {
    if (collectiblePool.length < POOL_SIZE) collectiblePool.push(c);
  }

  function spawnObstacleRow(lanesUsed) {
    const complexity = difficulty.getPatternComplexity();
    for (const lane of lanesUsed) {
      const typeId = pickWeightedObstacle(complexity);
      acquireObstacle(typeId, lane, SPAWN_DEPTH);
    }
  }

  function spawnCoinTrail(lane, count, opts = {}) {
    const spacing = 0.06;
    for (let i = 0; i < count; i++) {
      const z = SPAWN_DEPTH + i * spacing;
      const typeId = opts.special && i === Math.floor(count / 2) ? 'goldFootball' : 'football';
      acquireCollectible(typeId, lane, z, opts);
    }
  }

  function spawnPowerUp() {
    const lane = pickLane();
    const r = Math.random();
    let typeId = 'helmet';
    if (r < 0.34) typeId = 'helmet';
    else if (r < 0.67) typeId = 'jersey';
    else typeId = 'whistle';
    acquireCollectible(typeId, lane, SPAWN_DEPTH);
  }

  function pickLane() {
    return Math.floor(Math.random() * 3) - 1;
  }

  function emitPattern() {
    const complexity = difficulty.getPatternComplexity();
    const r = Math.random();

    if (r < 0.30) {
      const lane = pickLane();
      spawnCoinTrail(lane, 5 + Math.floor(Math.random() * 3));
    } else if (r < 0.50) {
      const lane = pickLane();
      acquireObstacle(pickWeightedObstacle(complexity), lane, SPAWN_DEPTH);
    } else if (r < 0.70) {
      const used = new Set();
      while (used.size < Math.min(2, complexity)) used.add(pickLane());
      spawnObstacleRow([...used]);
      const free = [-1, 0, 1].filter(l => !used.has(l));
      if (free.length) spawnCoinTrail(free[0], 4);
    } else if (r < 0.82) {
      const blockerLane = pickLane();
      acquireObstacle('hurdle', blockerLane, SPAWN_DEPTH);
      spawnCoinTrail(blockerLane, 4, { yOffset: 0.6 });
    } else if (r < 0.93) {
      const blockerLane = pickLane();
      acquireObstacle('bench', blockerLane, SPAWN_DEPTH);
      spawnCoinTrail(blockerLane, 4, { yOffset: 0 });
    } else {
      spawnPowerUp();
      const lane = pickLane();
      spawnCoinTrail(lane, 3, { special: true });
    }
  }

  function update(dt) {
    spawnCooldown -= dt;
    patternCooldown -= dt;

    if (spawnCooldown <= 0) {
      spawnCooldown = difficulty.getSpawnInterval() * (0.85 + Math.random() * 0.4);
      emitPattern();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      if (o.flash > 0) o.flash = Math.max(0, o.flash - dt);
      if (o.z < -0.08 || o.dead) {
        obstacles.splice(i, 1);
        recycleObstacle(o);
      }
    }
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const c = collectibles[i];
      if (c.z < -0.08 || c.collected) {
        collectibles.splice(i, 1);
        recycleCollectible(c);
      }
    }
  }

  function advance(dt, speed) {
    for (const o of obstacles) o.z -= speed * dt;
    for (const c of collectibles) c.z -= speed * dt;
  }

  function getObstacles() { return obstacles; }
  function getCollectibles() { return collectibles; }

  return {
    reset,
    update,
    advance,
    getObstacles,
    getCollectibles,
    releaseObstacle,
    releaseCollectible,
    poolStats: () => ({ obstaclePool: obstaclePool.length, collectiblePool: collectiblePool.length }),
  };
}

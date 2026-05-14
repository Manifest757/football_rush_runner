const BASE_SPEED = 0.42;
const SPEED_PER_RAMP = 0.06;
const RAMP_INTERVAL = 10;
const MAX_SPEED = 1.6;

const BASE_SPAWN_INTERVAL = 0.95;
const MIN_SPAWN_INTERVAL = 0.32;
const SPAWN_RAMP_PER_TIER = 0.07;

export function createDifficultyManager() {
  let elapsed = 0;
  let yards = 0;
  let speed = BASE_SPEED;
  let tier = 0;

  function reset() {
    elapsed = 0;
    yards = 0;
    speed = BASE_SPEED;
    tier = 0;
  }

  function update(dt) {
    elapsed += dt;
    yards += speed * 22 * dt;
    const newTier = Math.floor(elapsed / RAMP_INTERVAL);
    if (newTier !== tier) {
      tier = newTier;
      speed = Math.min(MAX_SPEED, BASE_SPEED + tier * SPEED_PER_RAMP);
    }
  }

  function getSpawnInterval() {
    const interval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - tier * SPAWN_RAMP_PER_TIER);
    return interval;
  }

  function getPatternComplexity() {
    if (tier <= 1) return 1;
    if (tier <= 4) return 2;
    if (tier <= 8) return 3;
    return 4;
  }

  function getYards() { return Math.floor(yards); }
  function getSpeed() { return speed; }
  function getTier() { return tier; }
  function getElapsed() { return elapsed; }

  return {
    reset,
    update,
    getSpawnInterval,
    getPatternComplexity,
    getYards,
    getSpeed,
    getTier,
    getElapsed,
  };
}

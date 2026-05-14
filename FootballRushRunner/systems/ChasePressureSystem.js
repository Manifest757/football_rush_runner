const PRESSURE_MAX = 100;
const PRESSURE_DECAY_PER_SEC = 5;
const PRESSURE_PER_STUMBLE = 24;
const PRESSURE_PER_NEAR_MISS = -4;
const PRESSURE_PER_BOOST_PICKUP = -22;
const PRESSURE_PER_TIME = 1.4;

export function createChasePressureSystem() {
  let pressure = 0;
  let chaserDepth = 1.05;
  let warningFlash = 0;

  function reset() {
    pressure = 0;
    chaserDepth = 1.05;
    warningFlash = 0;
  }

  function addStumble() {
    pressure = Math.min(PRESSURE_MAX, pressure + PRESSURE_PER_STUMBLE);
    warningFlash = 0.6;
  }

  function addNearMiss() {
    pressure = Math.max(0, pressure + PRESSURE_PER_NEAR_MISS);
  }

  function addBoostPickup() {
    pressure = Math.max(0, pressure + PRESSURE_PER_BOOST_PICKUP);
  }

  function addCustom(amount) {
    pressure = Math.max(0, Math.min(PRESSURE_MAX, pressure + amount));
  }

  function update(dt) {
    pressure = Math.max(0, Math.min(PRESSURE_MAX,
      pressure + PRESSURE_PER_TIME * dt - PRESSURE_DECAY_PER_SEC * dt
    ));
    const target = 1.05 - (pressure / PRESSURE_MAX) * 0.95;
    chaserDepth += (target - chaserDepth) * Math.min(1, dt * 2.2);
    warningFlash = Math.max(0, warningFlash - dt * 1.5);
  }

  function getPressure() { return pressure; }
  function getPressurePct() { return pressure / PRESSURE_MAX; }
  function getChaserDepth() { return chaserDepth; }
  function getWarningFlash() { return warningFlash; }

  function isAtMax() { return pressure >= PRESSURE_MAX - 0.01; }

  return {
    reset,
    update,
    addStumble,
    addNearMiss,
    addBoostPickup,
    addCustom,
    getPressure,
    getPressurePct,
    getChaserDepth,
    getWarningFlash,
    isAtMax,
  };
}

export const PRESSURE_CONST = { PRESSURE_MAX };

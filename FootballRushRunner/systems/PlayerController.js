const LANE_SWITCH_DURATION = 0.16;
const JUMP_DURATION = 0.62;
const SLIDE_DURATION = 0.55;
const STUMBLE_DURATION = 0.45;

export function createPlayerController() {
  const player = {
    lane: 0,
    laneTarget: 0,
    laneFrom: 0,
    laneT: 1,
    state: 'run',
    stateTimer: 0,
    jumpHeight: 0,
    slideOffset: 0,
    runCycle: 0,
    facing: 0,
    shieldUntil: 0,
    magnetUntil: 0,
    boostUntil: 0,
    invincibleUntil: 0,
  };

  function reset() {
    player.lane = 0;
    player.laneTarget = 0;
    player.laneFrom = 0;
    player.laneT = 1;
    player.state = 'run';
    player.stateTimer = 0;
    player.jumpHeight = 0;
    player.slideOffset = 0;
    player.runCycle = 0;
    player.facing = 0;
    player.shieldUntil = 0;
    player.magnetUntil = 0;
    player.boostUntil = 0;
    player.invincibleUntil = 0;
  }

  function moveLane(delta) {
    const next = clamp(player.laneTarget + delta, -1, 1);
    if (next === player.laneTarget) return;
    player.laneFrom = currentLaneFloat();
    player.laneTarget = next;
    player.laneT = 0;
    if (player.state === 'run') {
      player.state = delta > 0 ? 'jukeRight' : 'jukeLeft';
      player.stateTimer = LANE_SWITCH_DURATION;
    }
    player.facing = delta > 0 ? 0.3 : -0.3;
  }

  function jump() {
    if (player.state === 'jump' || player.state === 'tackled') return;
    player.state = 'jump';
    player.stateTimer = JUMP_DURATION;
    player.slideOffset = 0;
  }

  function slide() {
    if (player.state === 'slide' || player.state === 'tackled') return;
    player.state = 'slide';
    player.stateTimer = SLIDE_DURATION;
    player.jumpHeight = 0;
  }

  function truck() {
    slide();
    player.state = 'truck';
    player.stateTimer = SLIDE_DURATION * 0.7;
  }

  function stumble() {
    if (player.state === 'tackled' || player.state === 'stumble') return;
    player.state = 'stumble';
    player.stateTimer = STUMBLE_DURATION;
  }

  function tackle() {
    player.state = 'tackled';
    player.stateTimer = 1.0;
  }

  function applyShield(durationSec) {
    const now = performance.now() / 1000;
    player.shieldUntil = Math.max(player.shieldUntil, now + durationSec);
  }
  function applyMagnet(durationSec) {
    const now = performance.now() / 1000;
    player.magnetUntil = Math.max(player.magnetUntil, now + durationSec);
  }
  function applyBoost(durationSec) {
    const now = performance.now() / 1000;
    player.boostUntil = Math.max(player.boostUntil, now + durationSec);
  }
  function applyInvincibility(durationSec) {
    const now = performance.now() / 1000;
    player.invincibleUntil = Math.max(player.invincibleUntil, now + durationSec);
  }

  function consumeShield() {
    player.shieldUntil = 0;
  }

  function isShielded() {
    return performance.now() / 1000 < player.shieldUntil;
  }
  function isMagnetActive() {
    return performance.now() / 1000 < player.magnetUntil;
  }
  function isBoosted() {
    return performance.now() / 1000 < player.boostUntil;
  }
  function isInvincible() {
    return performance.now() / 1000 < player.invincibleUntil;
  }

  function update(dt) {
    if (player.laneT < 1) {
      player.laneT = Math.min(1, player.laneT + dt / LANE_SWITCH_DURATION);
      player.lane = lerp(player.laneFrom, player.laneTarget, easeOutCubic(player.laneT));
    } else {
      player.lane = player.laneTarget;
    }

    player.facing *= 0.9;
    player.runCycle = (player.runCycle + dt * 9) % (Math.PI * 2);

    if (player.state === 'jump') {
      const t = 1 - player.stateTimer / JUMP_DURATION;
      player.jumpHeight = Math.sin(t * Math.PI);
    } else {
      player.jumpHeight = Math.max(0, player.jumpHeight - dt * 4);
    }

    if (player.state === 'slide' || player.state === 'truck') {
      player.slideOffset = 1;
    } else {
      player.slideOffset = Math.max(0, player.slideOffset - dt * 4);
    }

    if (player.stateTimer > 0) {
      player.stateTimer = Math.max(0, player.stateTimer - dt);
      if (player.stateTimer === 0 && player.state !== 'tackled') {
        player.state = 'run';
      }
    }
  }

  function getCollisionBounds() {
    const halfW = 0.45;
    const fullH = 1.0;
    const slideH = 0.45;
    const jumpLift = player.jumpHeight * 1.0;
    return {
      lane: player.laneTarget,
      laneFloat: currentLaneFloat(),
      yLift: jumpLift,
      h: player.slideOffset > 0.5 ? slideH : fullH,
      halfW,
      crouching: player.slideOffset > 0.5,
      airborne: player.jumpHeight > 0.25,
    };
  }

  function currentLaneFloat() {
    if (player.laneT >= 1) return player.laneTarget;
    return lerp(player.laneFrom, player.laneTarget, easeOutCubic(player.laneT));
  }

  return {
    state: player,
    reset,
    update,
    moveLane,
    moveLeft: () => moveLane(-1),
    moveRight: () => moveLane(1),
    jump,
    slide,
    truck,
    stumble,
    tackle,
    applyShield,
    applyMagnet,
    applyBoost,
    applyInvincibility,
    consumeShield,
    isShielded,
    isMagnetActive,
    isBoosted,
    isInvincible,
    getCollisionBounds,
    currentLaneFloat,
  };
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

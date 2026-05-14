export const POWERUP_DURATION = {
  shield: 8,
  magnet: 7,
  boost: 5,
};

export function createPowerUpManager(player) {
  function applyPickup(kind) {
    switch (kind) {
      case 'shield':
        player.applyShield(POWERUP_DURATION.shield);
        return true;
      case 'magnet':
        player.applyMagnet(POWERUP_DURATION.magnet);
        return true;
      case 'boost':
        player.applyBoost(POWERUP_DURATION.boost);
        return true;
      default:
        return false;
    }
  }

  function getStatus() {
    const now = performance.now() / 1000;
    return {
      shield: {
        active: player.isShielded(),
        remaining: Math.max(0, player.state.shieldUntil - now),
        total: POWERUP_DURATION.shield,
      },
      magnet: {
        active: player.isMagnetActive(),
        remaining: Math.max(0, player.state.magnetUntil - now),
        total: POWERUP_DURATION.magnet,
      },
      boost: {
        active: player.isBoosted(),
        remaining: Math.max(0, player.state.boostUntil - now),
        total: POWERUP_DURATION.boost,
      },
    };
  }

  function getBoostMultiplier() {
    return player.isBoosted() ? 1.45 : 1.0;
  }

  return { applyPickup, getStatus, getBoostMultiplier };
}

const COLLISION_MIN_Z = 0.0;
const COLLISION_MAX_Z = 0.085;
const LANE_SNAP_TOLERANCE = 0.45;
const VERTICAL_TOLERANCE = 0.65;
const NEAR_MISS_Z = 0.13;

export function createCollisionSystem() {
  function inCollisionZone(z) {
    return z >= COLLISION_MIN_Z && z <= COLLISION_MAX_Z;
  }

  function inNearMissZone(z) {
    return z > COLLISION_MAX_Z && z <= NEAR_MISS_Z;
  }

  function laneOverlap(playerLaneFloat, objectLane) {
    return Math.abs(playerLaneFloat - objectLane) <= LANE_SNAP_TOLERANCE;
  }

  function checkObstacle(playerBounds, obstacle, definition) {
    if (obstacle.dead || obstacle.passed) return null;
    if (!inCollisionZone(obstacle.z)) {
      if (inNearMissZone(obstacle.z) && laneOverlap(playerBounds.laneFloat, obstacle.lane)) {
        return { type: 'nearmiss', obstacle };
      }
      return null;
    }
    if (!laneOverlap(playerBounds.laneFloat, obstacle.lane)) return null;

    const requiredAction = definition.requiredAction;
    if (requiredAction === 'jump') {
      if (playerBounds.airborne) return { type: 'cleared', obstacle };
      return { type: definition.severity === 'fatal' ? 'tackle' : 'stumble', obstacle, def: definition };
    }
    if (requiredAction === 'slide') {
      if (playerBounds.crouching) return { type: 'cleared', obstacle };
      return { type: definition.severity === 'fatal' ? 'tackle' : 'stumble', obstacle, def: definition };
    }
    if (definition.severity === 'fatal') {
      return { type: 'tackle', obstacle, def: definition };
    }
    return { type: 'stumble', obstacle, def: definition };
  }

  function checkCollectible(playerBounds, collectible) {
    if (collectible.collected) return false;
    if (!inCollisionZone(collectible.z)) return false;
    if (Math.abs(playerBounds.laneFloat - collectible.lane) > LANE_SNAP_TOLERANCE * 1.2) return false;
    if (collectible.yOffset && Math.abs(collectible.yOffset - playerBounds.yLift) > VERTICAL_TOLERANCE) {
      return false;
    }
    return true;
  }

  return {
    inCollisionZone,
    inNearMissZone,
    laneOverlap,
    checkObstacle,
    checkCollectible,
  };
}

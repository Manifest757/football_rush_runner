const HIGH_SCORE_KEY = 'fr_runner_highscore_v1';
const HIGH_YARDS_KEY = 'fr_runner_highyards_v1';

function safeGet(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch (e) {}
}

export const StorageSystem = {
  loadHighScore() {
    const raw = safeGet(HIGH_SCORE_KEY);
    const n = parseInt(raw || '0', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  },
  saveHighScore(score) {
    if (!Number.isFinite(score) || score <= 0) return;
    safeSet(HIGH_SCORE_KEY, String(Math.floor(score)));
  },
  loadHighYards() {
    const raw = safeGet(HIGH_YARDS_KEY);
    const n = parseInt(raw || '0', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  },
  saveHighYards(yards) {
    if (!Number.isFinite(yards) || yards <= 0) return;
    safeSet(HIGH_YARDS_KEY, String(Math.floor(yards)));
  },
};

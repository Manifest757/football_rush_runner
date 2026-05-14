import React from 'react';

export default function GameHUD({ snapshot, onPause }) {
  const score = Math.floor(snapshot?.score ?? 0);
  const yards = Math.floor(snapshot?.yards ?? 0);
  const power = snapshot?.power || {};
  const mult = snapshot?.multiplier ?? 1;

  return (
    <div style={styles.root} data-testid="runner-hud">
      <div style={styles.topRow}>
        <div style={styles.scoreBox}>
          <div style={styles.label}>SCORE</div>
          <div style={styles.score}>{score.toLocaleString()}</div>
        </div>
        <div style={styles.middleStack}>
          <div style={styles.yardsBox}>
            <span style={styles.yardsValue}>{yards}</span>
            <span style={styles.yardsLabel}>YDS</span>
          </div>
          {mult > 1 ? <div style={styles.multiplier}>x{mult}</div> : null}
        </div>
        <button
          onClick={onPause}
          style={styles.pauseBtn}
          aria-label="Pause"
          data-testid="runner-pause-btn"
        >
          ⏸
        </button>
      </div>

      <div style={styles.powerRow}>
        <PowerIcon label="H" name="shield" status={power.shield} color="#22D3EE" />
        <PowerIcon label="J" name="magnet" status={power.magnet} color="#A855F7" />
        <PowerIcon label="W" name="boost" status={power.boost} color="#10B981" />
      </div>
    </div>
  );
}

function PowerIcon({ label, name, status, color }) {
  if (!status?.active) return null;
  const pct = Math.max(0, Math.min(1, status.remaining / status.total));
  return (
    <div style={{ ...styles.power, borderColor: color, boxShadow: `0 0 10px ${color}66` }}>
      <div style={{ ...styles.powerCircle, background: color }}>{label}</div>
      <div style={styles.powerBarBg}>
        <div style={{ ...styles.powerBarFg, width: `${pct * 100}%`, background: color }} />
      </div>
    </div>
  );
}

const styles = {
  root: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    fontFamily: 'Montserrat, system-ui, sans-serif',
    color: '#FFFFFF', zIndex: 3,
  },
  topRow: {
    position: 'absolute', top: 16, left: 12, right: 12,
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
    pointerEvents: 'none',
  },
  scoreBox: {
    background: 'rgba(15,23,42,0.55)',
    border: '1px solid rgba(34,211,238,0.3)',
    borderRadius: 10, padding: '6px 10px', minWidth: 72,
  },
  label: { color: '#22D3EE', fontSize: 9, letterSpacing: 2, fontWeight: 700 },
  score: { color: '#FFFFFF', fontSize: 18, fontWeight: 800, lineHeight: 1.1 },
  middleStack: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  yardsBox: {
    background: 'rgba(15,23,42,0.55)',
    border: '1px solid rgba(251,191,36,0.4)',
    borderRadius: 999, padding: '6px 14px',
    display: 'flex', alignItems: 'baseline', gap: 4,
  },
  yardsValue: { color: '#FBBF24', fontSize: 22, fontWeight: 800, lineHeight: 1 },
  yardsLabel: { color: '#FBBF24', fontSize: 10, fontWeight: 700, letterSpacing: 1 },
  multiplier: {
    background: 'rgba(251,191,36,0.2)',
    color: '#FBBF24',
    fontSize: 12, fontWeight: 800,
    padding: '2px 8px', borderRadius: 999,
    border: '1px solid rgba(251,191,36,0.5)',
  },
  pauseBtn: {
    pointerEvents: 'auto',
    background: 'rgba(15,23,42,0.65)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 10, color: '#FFFFFF',
    width: 36, height: 36, fontSize: 16,
    cursor: 'pointer', padding: 0,
  },
  powerRow: {
    position: 'absolute', top: 70, left: 12,
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  power: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(15,23,42,0.55)',
    border: '1px solid', borderRadius: 999,
    padding: '3px 8px 3px 3px',
  },
  powerCircle: {
    width: 22, height: 22, borderRadius: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#0B1220', fontWeight: 800, fontSize: 11,
  },
  powerBarBg: {
    width: 38, height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 999,
  },
  powerBarFg: { height: '100%', borderRadius: 999, transition: 'width 0.1s linear' },
};

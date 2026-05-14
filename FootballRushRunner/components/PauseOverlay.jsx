import React from 'react';

export default function PauseOverlay({ snapshot, onResume, onRestart, onExit }) {
  return (
    <div style={styles.overlay} data-testid="runner-pause-overlay">
      <div style={styles.card}>
        <div style={styles.kicker}>PAUSED</div>
        <div style={styles.title}>TIMEOUT</div>
        <div style={styles.statRow}>
          <Stat label="SCORE" value={Math.floor(snapshot?.score ?? 0)} />
          <Stat label="YARDS" value={Math.floor(snapshot?.yards ?? 0)} />
          <Stat label="x" value={snapshot?.multiplier ?? 1} />
        </div>
        <button style={styles.primary} onClick={onResume} data-testid="runner-resume-btn">▶  RESUME</button>
        <div style={styles.row}>
          <button style={styles.secondary} onClick={onRestart} data-testid="runner-restart-btn">RESTART</button>
          {onExit ? <button style={styles.danger} onClick={onExit} data-testid="runner-exit-btn">EXIT</button> : null}
        </div>
        <div style={styles.hint}>Press P or ESC to resume</div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(15,23,42,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Montserrat, system-ui, sans-serif',
    zIndex: 4,
    color: '#FFFFFF',
  },
  card: {
    width: 'min(340px, 86vw)',
    padding: '24px 20px',
    background: 'rgba(17, 24, 39, 0.95)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    textAlign: 'center',
  },
  kicker: { color: '#FBBF24', fontSize: 11, letterSpacing: 3, fontWeight: 700 },
  title: { fontSize: 26, fontWeight: 800, marginTop: 4 },
  statRow: { display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' },
  stat: { flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 8 },
  statLabel: { color: '#9CA3AF', fontSize: 9, letterSpacing: 1, fontWeight: 700 },
  statValue: { color: '#FFFFFF', fontSize: 15, fontWeight: 800, marginTop: 2 },
  primary: {
    marginTop: 18, width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%)',
    border: 'none', borderRadius: 10,
    color: '#0B1220', fontWeight: 800, letterSpacing: 1.2, fontSize: 13,
    cursor: 'pointer',
  },
  row: { display: 'flex', gap: 8, marginTop: 10 },
  secondary: {
    flex: 1, padding: '10px',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 10, color: '#FFFFFF', fontWeight: 700, fontSize: 12, cursor: 'pointer',
  },
  danger: {
    flex: 1, padding: '10px',
    background: 'transparent', border: '1px solid rgba(239,68,68,0.5)',
    borderRadius: 10, color: '#EF4444', fontWeight: 700, fontSize: 12, cursor: 'pointer',
  },
  hint: { color: '#6B7280', fontSize: 10, marginTop: 8 },
};

import React from 'react';

export default function GameOverOverlay({ snapshot, onRestart, onExit }) {
  const score = Math.floor(snapshot?.score ?? 0);
  const isNewBest = score > 0 && score >= (snapshot?.highScore ?? 0);
  return (
    <div style={styles.overlay} data-testid="runner-gameover-overlay">
      <div style={styles.card}>
        <div style={styles.kicker}>{isNewBest ? 'NEW HIGH SCORE!' : 'TACKLED'}</div>
        <div style={styles.title}>{isNewBest ? 'TOUCHDOWN!' : 'DOWN'}</div>

        <div style={styles.bigRow}>
          <BigStat label="SCORE" value={score} accent="#22D3EE" />
          <BigStat label="YARDS" value={Math.floor(snapshot?.yards ?? 0)} accent="#FBBF24" />
        </div>

        <div style={styles.statRow}>
          <Stat label="COINS" value={snapshot?.coins ?? 0} />
          <Stat label="STREAK" value={snapshot?.streak ?? 0} />
          <Stat label="NEAR MISS" value={snapshot?.nearMisses ?? 0} />
        </div>

        <div style={styles.bestRow}>
          <span style={styles.bestText}>Best Score: </span>
          <span style={styles.bestVal}>{Math.floor(snapshot?.highScore ?? 0).toLocaleString()}</span>
          <span style={{ ...styles.bestText, marginLeft: 12 }}>Best Yards: </span>
          <span style={styles.bestVal}>{Math.floor(snapshot?.highYards ?? 0).toLocaleString()}</span>
        </div>

        <button style={styles.primary} onClick={onRestart} data-testid="runner-replay-btn">
          ↻  RUN IT BACK
        </button>
        {onExit ? (
          <button style={styles.secondary} onClick={onExit} data-testid="runner-gameover-exit">
            EXIT
          </button>
        ) : null}
      </div>
    </div>
  );
}

function BigStat({ label, value, accent }) {
  return (
    <div style={{ ...styles.bigStat, borderColor: accent + '55', boxShadow: `0 0 18px ${accent}22` }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.bigValue, color: accent }}>{value.toLocaleString()}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value.toLocaleString()}</div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(7, 11, 22, 0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Montserrat, system-ui, sans-serif',
    zIndex: 4, color: '#FFFFFF',
  },
  card: {
    width: 'min(360px, 88vw)',
    padding: '24px 20px',
    background: 'rgba(17, 24, 39, 0.96)',
    border: '1px solid rgba(34, 211, 238, 0.4)',
    borderRadius: 18,
    textAlign: 'center',
    boxShadow: '0 18px 60px rgba(0,0,0,0.6)',
  },
  kicker: { color: '#22D3EE', fontSize: 11, letterSpacing: 3, fontWeight: 700 },
  title: { fontSize: 28, fontWeight: 800, marginTop: 4 },
  bigRow: { display: 'flex', gap: 10, marginTop: 16 },
  bigStat: {
    flex: 1, padding: '12px 6px',
    background: 'rgba(0,0,0,0.4)', border: '1px solid', borderRadius: 12,
  },
  bigValue: { fontSize: 24, fontWeight: 800, marginTop: 4 },
  statRow: { display: 'flex', gap: 8, marginTop: 12 },
  stat: { flex: 1, padding: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 8 },
  statLabel: { color: '#9CA3AF', fontSize: 9, letterSpacing: 1.2, fontWeight: 700 },
  statValue: { color: '#FFFFFF', fontSize: 14, fontWeight: 800, marginTop: 2 },
  bestRow: { marginTop: 12, fontSize: 11 },
  bestText: { color: '#9CA3AF' },
  bestVal: { color: '#FBBF24', fontWeight: 800 },
  primary: {
    marginTop: 18, width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%)',
    border: 'none', borderRadius: 12,
    color: '#0B1220', fontWeight: 800, letterSpacing: 1.2, fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 8px 22px rgba(34,211,238,0.45)',
  },
  secondary: {
    marginTop: 8, width: '100%', padding: '10px',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 10, color: '#FFFFFF', fontWeight: 700, fontSize: 12, cursor: 'pointer',
  },
};

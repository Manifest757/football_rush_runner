import React from 'react';

export default function StartScreen({ snapshot, onStart }) {
  return (
    <div
      onPointerDown={(e) => { e.stopPropagation(); onStart(); }}
      style={styles.overlay}
      data-testid="runner-start-screen"
    >
      <div style={styles.card}>
        <div style={styles.kicker}>FANTASY ROYALE</div>
        <div style={styles.title}>FOOTBALL RUSH</div>
        <div style={styles.tagline}>Endless run. Dodge defenders. Stack yards.</div>

        <div style={styles.controlsRow}>
          <ControlChip label="Swipe" detail="Lanes / Jump / Slide" />
          <ControlChip label="Tap" detail="Begin" />
        </div>

        <div style={styles.bestRow}>
          <BestStat label="BEST SCORE" value={snapshot?.highScore ?? 0} />
          <BestStat label="BEST YARDS" value={snapshot?.highYards ?? 0} />
        </div>

        <button style={styles.cta} onClick={onStart} data-testid="runner-start-btn">
          ▶  HIKE THE BALL
        </button>
        <div style={styles.hint}>Or press SPACE</div>
      </div>
    </div>
  );
}

function ControlChip({ label, detail }) {
  return (
    <div style={styles.chip}>
      <div style={styles.chipLabel}>{label}</div>
      <div style={styles.chipDetail}>{detail}</div>
    </div>
  );
}

function BestStat({ label, value }) {
  return (
    <div style={styles.bestStat}>
      <div style={styles.bestLabel}>{label}</div>
      <div style={styles.bestValue}>{Math.floor(value).toLocaleString()}</div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.78) 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Montserrat, system-ui, sans-serif',
    zIndex: 4,
    color: '#FFFFFF',
    cursor: 'pointer',
    userSelect: 'none',
  },
  card: {
    width: 'min(360px, 88vw)',
    padding: '28px 22px',
    background: 'rgba(17, 24, 39, 0.85)',
    border: '1px solid rgba(34, 211, 238, 0.4)',
    borderRadius: 18,
    textAlign: 'center',
    boxShadow: '0 18px 50px rgba(0,0,0,0.55), 0 0 30px rgba(34, 211, 238, 0.15)',
  },
  kicker: { color: '#22D3EE', fontSize: 11, letterSpacing: 3, fontWeight: 700 },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: 800, letterSpacing: 1, marginTop: 6 },
  tagline: { color: '#9CA3AF', fontSize: 13, marginTop: 6, lineHeight: 1.4 },
  controlsRow: { display: 'flex', gap: 8, marginTop: 18, justifyContent: 'center' },
  chip: {
    padding: '8px 12px',
    borderRadius: 10,
    background: 'rgba(34,211,238,0.1)',
    border: '1px solid rgba(34,211,238,0.3)',
    minWidth: 110,
  },
  chipLabel: { color: '#22D3EE', fontSize: 11, fontWeight: 700, letterSpacing: 1 },
  chipDetail: { color: '#FFFFFF', fontSize: 11, marginTop: 2 },
  bestRow: { display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center' },
  bestStat: {
    flex: 1, padding: '8px 10px',
    background: 'rgba(0,0,0,0.3)', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  bestLabel: { color: '#9CA3AF', fontSize: 9, letterSpacing: 1.4, fontWeight: 700 },
  bestValue: { color: '#FBBF24', fontSize: 18, fontWeight: 800, marginTop: 2 },
  cta: {
    marginTop: 20, width: '100%',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%)',
    border: 'none', borderRadius: 12,
    color: '#0B1220', fontWeight: 800, letterSpacing: 1.2, fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 8px 22px rgba(34,211,238,0.45)',
  },
  hint: { color: '#6B7280', fontSize: 10, marginTop: 8 },
};

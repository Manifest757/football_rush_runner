import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import GameCanvas from './components/GameCanvas';
import GameHUD from './components/GameHUD';
import StartScreen from './components/StartScreen';
import PauseOverlay from './components/PauseOverlay';
import GameOverOverlay from './components/GameOverOverlay';
import { GAME_STATE } from './systems/GameManager';

export default function FootballRushRunner({ onExit }) {
  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#22D3EE', fontSize: 12, letterSpacing: 3, fontWeight: '700' }}>FANTASY ROYALE</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 6 }}>FOOTBALL RUSH</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8, textAlign: 'center', maxWidth: 280 }}>
          Open this project URL in a desktop or mobile browser to play the endless runner.
        </Text>
      </View>
    );
  }
  return <FootballRushRunnerWeb onExit={onExit} />;
}

function FootballRushRunnerWeb({ onExit }) {
  const [size, setSize] = useState(() => measureViewport());
  const [snapshot, setSnapshot] = useState({
    state: GAME_STATE.IDLE, score: 0, yards: 0, multiplier: 1, coins: 0,
    streak: 0, nearMisses: 0, power: {}, highScore: 0, highYards: 0,
  });
  const controlRef = useRef(null);

  useEffect(() => {
    function onResize() {
      setSize(measureViewport());
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function dispatch(action) {
    const ctrl = controlRef.current;
    if (!ctrl) return;
    if (action === 'start' || action === 'restart') ctrl.start();
    else if (action === 'pause') ctrl.pause();
    else if (action === 'resume') ctrl.resume();
  }

  return (
    <div
      style={{
        position: 'relative', width: size.w, height: size.h,
        background: '#0F172A', overflow: 'hidden',
        margin: '0 auto',
      }}
      data-testid="football-rush-runner"
    >
      <GameCanvas
        width={size.w}
        height={size.h}
        controlRef={controlRef}
        onSnapshot={setSnapshot}
      />
      {snapshot.state === GAME_STATE.RUNNING ? (
        <GameHUD snapshot={snapshot} onPause={() => dispatch('pause')} />
      ) : null}
      {snapshot.state === GAME_STATE.IDLE ? (
        <StartScreen snapshot={snapshot} onStart={() => dispatch('start')} />
      ) : null}
      {snapshot.state === GAME_STATE.PAUSED ? (
        <PauseOverlay
          snapshot={snapshot}
          onResume={() => dispatch('resume')}
          onRestart={() => dispatch('restart')}
          onExit={onExit}
        />
      ) : null}
      {snapshot.state === GAME_STATE.GAME_OVER ? (
        <GameOverOverlay
          snapshot={snapshot}
          onRestart={() => dispatch('restart')}
          onExit={onExit}
        />
      ) : null}
    </div>
  );
}

function measureViewport() {
  if (typeof window === 'undefined') return { w: 400, h: 720 };
  const maxW = 480;
  const maxH = Math.min(900, window.innerHeight - 40);
  const w = Math.min(maxW, window.innerWidth - 16);
  const h = Math.max(420, Math.min(maxH, Math.round(w * 1.78)));
  return { w, h };
}

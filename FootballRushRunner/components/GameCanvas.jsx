import React, { useEffect, useRef } from 'react';
import { createGameManager, GAME_STATE } from '../systems/GameManager';
import { createInputSystem } from '../systems/InputSystem';

export default function GameCanvas({ width, height, onSnapshot, controlRef }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const managerRef = useRef(null);
  const inputRef = useRef(null);
  const rafRef = useRef(null);
  const lastTRef = useRef(0);
  const sizeRef = useRef({ w: width, h: height });
  const snapshotTimerRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const w = sizeRef.current.w;
    const h = sizeRef.current.h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const manager = createGameManager({
      ctx, width: w, height: h,
      onStateChange: (_, snap) => { if (onSnapshot) onSnapshot(snap); },
    });
    managerRef.current = manager;
    if (controlRef) controlRef.current = manager;

    const input = createInputSystem({
      target: containerRef.current,
      onAction: (action) => manager.handleAction(action),
    });
    input.attach();
    inputRef.current = input;

    if (onSnapshot) onSnapshot(manager.getSnapshot());

    let mounted = true;
    lastTRef.current = performance.now();

    function loop(t) {
      if (!mounted) return;
      let dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;
      if (dt > 0.05) dt = 0.05;

      const m = managerRef.current;
      if (m) {
        m.update(dt);
        const ctx2 = canvas.getContext('2d');
        const w2 = sizeRef.current.w;
        const h2 = sizeRef.current.h;
        ctx2.clearRect(0, 0, w2, h2);
        m.render();

        snapshotTimerRef.current += dt;
        if (snapshotTimerRef.current > 0.1 || m.getState() !== GAME_STATE.RUNNING) {
          snapshotTimerRef.current = 0;
          if (onSnapshot) onSnapshot(m.getSnapshot());
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      input.detach();
      managerRef.current = null;
      inputRef.current = null;
      if (controlRef) controlRef.current = null;
    };
  }, []);

  useEffect(() => {
    sizeRef.current = { w: width, h: height };
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (managerRef.current) managerRef.current.resize(width, height);
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute', inset: 0,
        touchAction: 'none', overflow: 'hidden',
        background: '#0F172A',
        cursor: 'pointer',
      }}
      data-testid="runner-game-canvas-container"
    >
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0 }} />
    </div>
  );
}

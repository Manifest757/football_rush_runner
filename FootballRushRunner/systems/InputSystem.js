const SWIPE_MIN = 28;
const TAP_MAX_MS = 250;

export function createInputSystem({ target, onAction }) {
  let pointerDown = null;
  let consumed = false;

  function fire(action) {
    if (typeof onAction === 'function') onAction(action);
  }

  function onPointerDown(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    pointerDown = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
    };
    consumed = false;
  }

  function onPointerMove(e) {
    if (!pointerDown || consumed) return;
    const dx = e.clientX - pointerDown.x;
    const dy = e.clientY - pointerDown.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (Math.max(adx, ady) < SWIPE_MIN) return;
    if (adx > ady) {
      fire(dx > 0 ? 'right' : 'left');
    } else {
      fire(dy > 0 ? 'slide' : 'jump');
    }
    consumed = true;
  }

  function onPointerUp(e) {
    if (!pointerDown) return;
    const dt = performance.now() - pointerDown.t;
    const dx = (e.clientX ?? pointerDown.x) - pointerDown.x;
    const dy = (e.clientY ?? pointerDown.y) - pointerDown.y;
    if (!consumed && dt < TAP_MAX_MS && Math.hypot(dx, dy) < SWIPE_MIN) {
      fire('tap');
    }
    pointerDown = null;
    consumed = false;
  }

  function onPointerCancel() {
    pointerDown = null;
    consumed = false;
  }

  function onKeyDown(e) {
    switch (e.key) {
      case 'ArrowLeft': case 'a': case 'A': fire('left'); break;
      case 'ArrowRight': case 'd': case 'D': fire('right'); break;
      case 'ArrowUp': case 'w': case 'W': case ' ': fire('jump'); break;
      case 'ArrowDown': case 's': case 'S': fire('slide'); break;
      case 'p': case 'P': case 'Escape': fire('pause'); break;
      case 'Enter': fire('tap'); break;
      default: return;
    }
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }

  function attach() {
    if (!target) return;
    target.addEventListener('pointerdown', onPointerDown);
    target.addEventListener('pointermove', onPointerMove);
    target.addEventListener('pointerup', onPointerUp);
    target.addEventListener('pointercancel', onPointerCancel);
    target.addEventListener('pointerleave', onPointerCancel);
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onKeyDown);
    }
  }

  function detach() {
    if (!target) return;
    target.removeEventListener('pointerdown', onPointerDown);
    target.removeEventListener('pointermove', onPointerMove);
    target.removeEventListener('pointerup', onPointerUp);
    target.removeEventListener('pointercancel', onPointerCancel);
    target.removeEventListener('pointerleave', onPointerCancel);
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', onKeyDown);
    }
  }

  return { attach, detach, fire };
}

export function emitAction(handler, action) {
  if (typeof handler === 'function') handler(action);
}

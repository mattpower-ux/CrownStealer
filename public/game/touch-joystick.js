const DEAD_ZONE = 0.24;
const MOVEMENT_MODES = ['world', 'town', 'dungeon'];

export function joystickIntent(mode, x, y, radius, pressure = 0.5) {
  const distance = Math.hypot(x, y) / radius;
  if (distance <= DEAD_ZONE || !MOVEMENT_MODES.includes(mode)) return null;
  const horizontal = Math.abs(x) > Math.abs(y);
  const direction = Math.sign(horizontal ? x : y);
  const action = mode === 'dungeon'
    ? horizontal ? { type: 'strafe', delta: direction } : { type: direction < 0 ? 'forward' : 'back' }
    : { type: 'mapStep', dx: horizontal ? direction : 0, dy: horizontal ? 0 : direction };
  const displacement = (distance - DEAD_ZONE) / (1 - DEAD_ZONE);
  // Pointer Events use 0.5 on touch hardware without pressure sensing.
  const force = pressure === 0.5 ? 0 : pressure;
  return { action, strength: Math.min(1, Math.max(displacement, force)) };
}

export const joystickStepDelay = (terrainDelay, strength) => Math.round(terrainDelay * (1 + (1 - strength) * 0.9));

export function attachTouchJoystick(container, { readState, canMove, dispatch, stepDelay, pause = () => false }) {
  const stick = document.createElement('div');
  stick.className = 'touch-joystick';
  stick.setAttribute('role', 'group');
  stick.setAttribute('aria-label', 'Touch movement joystick');
  stick.innerHTML = '<span class="touch-joystick-knob" aria-hidden="true"></span>';
  container.prepend(stick);

  let pointer = null;
  let timer = null;
  let originMode;
  let intent;

  function clearStep() {
    clearTimeout(timer);
    timer = null;
  }

  function stop() {
    const previous = pointer;
    pointer = null;
    intent = null;
    clearStep();
    stick.style.removeProperty('--stick-x');
    stick.style.removeProperty('--stick-y');
    if (previous !== null && stick.hasPointerCapture(previous)) stick.releasePointerCapture(previous);
  }

  function step() {
    timer = null;
    const state = readState();
    if (pointer === null || !intent || state?.mode !== originMode || !canMove()) return stop();
    const { action, strength } = intent;
    dispatch(action);
    const next = readState();
    if (next?.mode !== originMode || !canMove() || pause()) return stop();
    timer = setTimeout(step, joystickStepDelay(stepDelay(next, action), strength));
  }

  function drag(event) {
    const bounds = stick.getBoundingClientRect();
    const radius = Math.min(bounds.width, bounds.height) * 0.32;
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    const scale = Math.min(1, radius / Math.hypot(x, y));
    stick.style.setProperty('--stick-x', `${x * scale}px`);
    stick.style.setProperty('--stick-y', `${y * scale}px`);
    intent = joystickIntent(originMode, x, y, radius, event.pressure);
    if (!intent) clearStep();
    else if (timer === null) step();
  }

  stick.addEventListener('pointerdown', event => {
    const state = readState();
    if (pointer !== null || event.pointerType === 'mouse' || !MOVEMENT_MODES.includes(state?.mode) || !canMove()) return;
    event.preventDefault();
    pointer = event.pointerId;
    originMode = state.mode;
    stick.setPointerCapture(pointer);
    drag(event);
  });
  stick.addEventListener('pointermove', event => {
    if (pointer === event.pointerId) drag(event);
  });
  for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    stick.addEventListener(eventName, event => {
      if (pointer === event.pointerId) stop();
    });
  }
  window.addEventListener('blur', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
}

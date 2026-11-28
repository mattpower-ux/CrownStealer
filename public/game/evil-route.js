export const EVIL_ROUTE_PHASES = Object.freeze([
  'empowered', 'conquering', 'enthroned', 'percivalChoice',
  'percivalBattle', 'exiled', 'darkVictory',
]);

const empoweredPhases = new Set(EVIL_ROUTE_PHASES.filter(phase => phase !== 'exiled'));
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function prepareEvilRoute(state) {
  if (state.evilRoute === undefined && state.flags?.redGlobeCurse === true) {
    state.evilRoute = {version: 1, phase: 'empowered'};
  }
  return state;
}

export function validateEvilRoute(state) {
  const route = state.evilRoute;
  return route === undefined || (isRecord(route) && route.version === 1 && EVIL_ROUTE_PHASES.includes(route.phase));
}

export const evilEmpowered = state => empoweredPhases.has(state.evilRoute?.phase)
  || (state.evilRoute === undefined && state.flags?.redGlobeCurse === true);

export const evilAppearance = state => state.alignmentPoints === 0 || state.alignment <= -100
  || evilEmpowered(state);

export const evilStrengthBonus = state => evilEmpowered(state) ? 10 : 0;

export function purifyEvilRoute(state, note) {
  delete state.evilRoute;
  delete state.flags.redGlobeCurse;
  delete state.flags.redGlobeSworn;
  state.flags.redGlobePurified = true;
  state.alignment = 0;
  state.alignmentPoints = 500;
  delete state.flags.evilAlignmentLocked;
  note?.(state, 'The White Mountain burns away the curse. Your horns, tail, and borrowed strength vanish. You are free.');
  return state;
}

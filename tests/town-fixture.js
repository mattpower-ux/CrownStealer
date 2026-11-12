import assert from 'node:assert/strict';
import { townPlaces } from '../public/game/town.js';

export function atTownPlace(state, placeId) {
  const place = townPlaces(state).find(entry => entry.id === placeId);
  assert.ok(place, `${state.location} has ${placeId}`);
  return { ...state, townPosition: { x: place.x, y: place.y } };
}

import {TOWNS} from './content.js';

export const championTitle = townId => `CHAMPION OF ${TOWNS.find(town => town.id === townId)?.name.toUpperCase() ?? townId.toUpperCase()}`;
export const championTitles = s => (s.championTowns ?? []).map(championTitle);

export function awardChampionTitle(s, townId, note) {
  s.championTowns ??= [];
  if (s.championTowns.includes(townId)) return;
  s.championTowns.push(townId);
  note(s, `Ten gladiators defeated! You earn the title ${championTitle(townId)}.`);
}

export function validateChampionState(s) {
  if (s.enemy?.championTown !== undefined && (s.mode !== 'battle' || s.returnMode !== 'world' ||
      s.arena || s.dungeon || !s.championTowns?.includes(s.enemy.championTown))) throw Error('Invalid champion challenge.');
  if (s.championTowns !== undefined && (!Array.isArray(s.championTowns) ||
      new Set(s.championTowns).size !== s.championTowns.length ||
      s.championTowns.some(id => !TOWNS.some(town => town.id === id)))) throw Error('Invalid champion titles.');
}

export function finishChampionChallenge(s, won, note, events) {
  const town = s.enemy?.championTown;
  if (!town) return false;
  if (!won) s.championTowns = (s.championTowns ?? []).filter(id => id !== town);
  else s.flags.victories++;
  s.mode = s.returnMode = 'world';
  s.enemy = null;
  s.flags.guarded = false;
  s.flags.combo = 0;
  s.spellEffects.stunnedTurns = 0;
  if (!won) s.hp = s.maxHp;
  note(s, won ? `The challenger yields. You retain ${championTitle(town)}.` :
    `The gladiator defeats you and tends your wounds. You lose ${championTitle(town)}.`);
  events.push({kind:'championResult', outcome:won ? 'win' : 'loss', town});
  return true;
}

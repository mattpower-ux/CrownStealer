import { ARENA_ENTRY_WARNING, ARENA_LEVEL_REFUSAL, ARENA_WINS_REQUIRED, arenaLevelRange, arenaOpponent } from './gladiator-arena.js';
import { itemById } from './items.js';
import { townPlaces } from './town.js';

function heldEquipment(state, stash, escape) {
  const counts = new Map();
  for (const id of stash?.bag ?? []) counts.set(id, (counts.get(id) || 0) + 1);
  if (!counts.size) return '';
  return '<details class="arena-stash"><summary>Confiscated equipment</summary><ul>' +
    [...counts].map(([id, count]) => '<li>' + escape(itemById(id, state)?.name || id) + (count > 1 ? ' × ' + count : '') + '</li>').join('') +
    '</ul></details>';
}

function permanentReward(reward) {
  if (!reward) return '';
  const gained = [['Strength', reward.strength], ['Dexterity', reward.dexterity]]
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => '+' + amount + ' ' + name);
  return gained.length ? '<p class="arena-perk">Permanent reward · ' + gained.join(' and ') + '</p>' : '';
}

function opponentPreview(opponent, escape) {
  const name = escape(opponent.name);
  return '<section class="arena-opponent" aria-label="Next opponent">' +
    '<canvas class="arena-opponent-portrait" width="144" height="160" role="img" aria-label="Portrait of ' + name + '"></canvas>' +
    '<div><p class="eyebrow">Next opponent</p><h3>' + name + '</h3>' +
    (opponent.weapon ? '<p><strong>Weapon</strong> · ' + escape(opponent.weapon) + '</p>' : '') +
    (opponent.description ? '<p>' + escape(opponent.description) + '</p>' : '') + '</div></section>';
}

export function arenaView(state, { button, escape, result }) {
  const run = state.arena;
  const townId = run?.town ?? result?.town ?? state.location;
  const title = townPlaces({ location: townId }).find(place => place.id === 'arena')?.name ?? 'Gladiator Pit';
  const wins = run?.wins ?? result?.wins ?? 0;
  const completed = wins >= ARENA_WINS_REQUIRED;
  const range = arenaLevelRange(townId);
  const levels = range ? '<p class="arena-range">Your level ' + state.level + (run?.prisoner ? ' · Voluntary range ' : ' · Arena levels ') + range.min + '–' + range.max + '</p>' : '';
  const refused = range && !run?.prisoner && !result?.released && state.level > range.max;
  const warning = run?.entryWarning && !refused;
  const ring = '<img class="arena-ring" src="/assets/gladiator-ring.webp" alt="Sand-covered fighting ring inside a stone coliseum">';
  const progress = '<div class="arena-progress"><label for="arena-wins">Victories</label><strong>' +
    wins + ' / ' + ARENA_WINS_REQUIRED + '</strong><progress id="arena-wins" value="' + wins + '" max="' + ARENA_WINS_REQUIRED + '"></progress></div>';

  let status, opponent;
  if (warning) {
    status = '<p role="status">' + ARENA_ENTRY_WARNING + '</p><div class="panel-actions">' +
      button('YES', { type: 'confirmArenaEntry', accept: true }, 'primary') +
      button('NO', { type: 'confirmArenaEntry', accept: false }) + '</div>';
  } else if (refused) {
    status = '<p role="status">' + ARENA_LEVEL_REFUSAL + '</p><div class="panel-actions">' +
      (run ? button('Leave arena', { type: 'leaveArena' }, 'primary') :
        '<button class="primary" data-dismiss-arena>Back to town</button>') + '</div>';
  } else if (result?.released && !run) {
    status = '<p role="status">You are free. The wardens have returned your confiscated equipment.</p>' +
      permanentReward(result.reward) + '<button class="primary" data-dismiss-arena>Continue</button>';
  } else if (run) {
    opponent = arenaOpponent(wins + 1, townId);
    const nextOpponent = opponent ? opponentPreview(opponent, escape) : '';
    const narrative = run.prisoner
      ? 'Win ten bouts to earn your freedom. Your belongings are held by the wardens until then.'
      : 'Challenge the arena’s fighters. You can leave between bouts.';
    const last = result?.outcome === 'loss' ? '<p class="arena-loss" role="status">You lost the last bout. Your previous wins still count.</p>' : '';
    const perk = run.prisoner
      ? '<div class="arena-perk"><strong>Basic gear reward</strong><p>Win all ten bouts wearing Basic Leather Armor and using nonmagical weapons to earn +2 permanent Strength and +2 permanent Dexterity.</p><p>' +
        (state.flags.arenaBasicPerk ? 'You already earned this reward.' : run.qualifies ? 'Your run qualifies.' : 'This run no longer qualifies.') + '</p></div>'
      : '';
    const loan = run.prisoner ? '<p>Loan gear · ' + escape(itemById('road-sword', state).name) + ' (grade ' +
      (run.loanWeaponRank ?? 1) + ') and Basic Leather Armor.</p>' : '';
    status = '<p>' + narrative + '</p>' + last + nextOpponent + loan + perk + heldEquipment(state, run.stash, escape) +
      '<div class="panel-actions">' +
      (completed ? '' : button('Fight bout ' + (wins + 1), { type: 'startArenaFight' }, 'primary')) +
      (run.prisoner ? '' : button('Leave arena', { type: 'leaveArena' })) + '</div>';
  } else {
    status = '<p>Enter the ring to challenge local fighters.</p>' + button('Enter arena', { type: 'enterArena' }, 'primary');
  }
  const showProgress = !warning && !refused;
  return { title, opponent, html: '<section class="arena-panel">' + ring + '<div>' + levels + (showProgress ? progress : '') + status + '</div></section>' };
}


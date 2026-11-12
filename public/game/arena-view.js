import { ARENA_WINS_REQUIRED, arenaOpponent } from './gladiator-arena.js';
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

export function arenaView(state, { button, escape, result }) {
  const run = state.arena;
  const townId = run?.town ?? result?.town ?? state.location;
  const title = townPlaces({ location: townId }).find(place => place.id === 'arena')?.name ?? 'Gladiator Pit';
  const wins = run?.wins ?? result?.wins ?? 0;
  const completed = wins >= ARENA_WINS_REQUIRED;
  const ring = '<img class="arena-ring" src="/assets/gladiator-ring.webp" alt="Sand-covered fighting ring inside a stone coliseum">';
  const progress = '<div class="arena-progress"><label for="arena-wins">Victories</label><strong>' +
    wins + ' / ' + ARENA_WINS_REQUIRED + '</strong><progress id="arena-wins" value="' + wins + '" max="' + ARENA_WINS_REQUIRED + '"></progress></div>';

  let status;
  if (result?.released && !run) {
    status = '<p role="status">You are free. The wardens have returned your confiscated equipment.</p>' +
      permanentReward(result.reward) + '<button class="primary" data-dismiss-arena>Continue</button>';
  } else if (run) {
    const opponent = arenaOpponent(wins + 1);
    const nextOpponent = opponent ? '<p>Next opponent · <strong>' + escape(opponent.name) + '</strong></p>' : '';
    const narrative = run.prisoner
      ? 'Win ten bouts to earn your freedom. Your belongings are held by the wardens until then.'
      : 'Challenge the arena’s fighters. You can leave between bouts.';
    const last = result?.outcome === 'loss' ? '<p class="arena-loss" role="status">You lost the last bout. Your previous wins still count.</p>' : '';
    const perk = run.prisoner
      ? '<div class="arena-perk"><strong>Basic gear reward</strong><p>Win all ten bouts wearing Basic Leather Armor and using nonmagical weapons to earn +2 permanent Strength and +2 permanent Dexterity.</p><p>' +
        (state.flags.arenaBasicPerk ? 'You already earned this reward.' : run.qualifies ? 'Your run qualifies.' : 'This run no longer qualifies.') + '</p></div>'
      : '';
    status = '<p>' + narrative + '</p>' + last + nextOpponent + perk + heldEquipment(state, run.stash, escape) +
      '<div class="panel-actions">' +
      (completed ? '' : button('Fight bout ' + (wins + 1), { type: 'startArenaFight' }, 'primary')) +
      (run.prisoner ? '' : button('Leave arena', { type: 'leaveArena' })) + '</div>';
  } else {
    status = '<p>Enter the ring to challenge local fighters.</p>' + button('Enter arena', { type: 'enterArena' }, 'primary');
  }
  return { title, html: '<section class="arena-panel">' + ring + '<div>' + progress + status + '</div></section>' };
}


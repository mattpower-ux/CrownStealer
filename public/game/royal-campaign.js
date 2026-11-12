import {TOWNS} from './content.js';

const capital = 'bellwether';
export const ROYAL_COURIER_TOWN = 'salt-choir';
export const ROYAL_DISPATCH_ID = 'royal-dispatch';
export const DRAGONSTONE_ID = 'dragonstone';
export const DRAGONSTONE_CHEST_ID = 'firedrak:9:dragonstone';
const stages = ['opening', 'banished', 'imprisoned', 'sewers', 'commission', 'courier', 'report-delivery', 'dragonstone', 'pit', 'audience', 'resolved'];
const admittedStages = ['commission', 'courier', 'report-delivery', 'dragonstone', 'pit', 'audience', 'resolved'];
const king = 'King Malachi the Ineffable';
const recipient = 'Dame Isobel Crowfoot';
const bow = 'They bow in silence. You are far too cool to interrupt.';

export const royalCampaignItems = {
  [ROYAL_DISPATCH_ID]: {id: ROYAL_DISPATCH_ID, name: 'Sealed Royal Dispatch', kind: 'key', shape: 'scroll',
    rarity: 'rare', unique: true, notForSale: true, color: '#dcc183', value: 0,
    description: 'King Malachi’s sealed message for Dame Isobel Crowfoot at Salt Choir, two regions east of Bellwether.'},
  [DRAGONSTONE_ID]: {id: DRAGONSTONE_ID, name: 'Dragonstone', kind: 'key', shape: 'relic',
    rarity: 'epic', unique: true, notForSale: true, color: '#ef8755', value: 0,
    description: 'A stone warm as a banked fire, recovered from the lowest level of Mount Firedrake. Return it to King Malachi.'},
};

export const ROYAL_CAMPAIGN_ENDINGS = {
  marriage: 'Princess Bunnyfoot takes your hand in the throne room. The wedding lasts three days, and the court has already started practicing how to address you when you become King. Bunnyfoot asks you to remember the names of the people who helped you. You promise that neither of you will forget.',
  farmer: 'You leave the palace and buy a small farm. You marry a plain, pleasant peasant woman who laughs at your stories and expects you to finish the milking anyway. The two of you share supper at the kitchen table, and for the first time in years nobody needs saving before breakfast.',
  captain: 'Malachi gives you command of the royal guard. Your first order sends the watch to protect the roads that carried you here. Recruits learn how to hold a shield, when to draw a sword, and why the best captain comes home with everyone who left.',
  hero: 'You leave the throne room with no title but Hero. In every town people bow. Monsters flee when they see you. Nobody dares make conversation with someone this cool. The world is still open, and the roads are yours.',
};

export const isRoyalCampaign = s => s.flags?.royalStoryVersion === 2;
export const royalCampaignAdmission = s => isRoyalCampaign(s) && admittedStages.includes(s.flags.royalQuest);

export function royalCampaignTownAdmission(s, townId) {
  return s.flags?.royalHero === true || isRoyalCampaign(s) && townId === ROYAL_COURIER_TOWN &&
    ['courier', 'report-delivery'].includes(s.flags.royalQuest);
}

export function royalCampaignObjective(s) {
  if (!isRoyalCampaign(s) || s.dungeon?.royal) return null;
  switch (s.flags.royalQuest) {
    case 'opening': return 'Hear King Malachi’s first task.';
    case 'banished': return s.gold >= 500 ? 'Return to Bellwether Court (96, 28) with your 500 gold.' : 'Earn 500 gold and return to King Malachi at Bellwether Castle.';
    case 'commission': return 'Report to King Malachi in Bellwether Castle’s throne room.';
    case 'courier': return 'Deliver the sealed royal dispatch to Dame Isobel Crowfoot in Salt Choir, two regions east of Bellwether.';
    case 'report-delivery': return 'Return to King Malachi and report that Dame Isobel received the dispatch.';
    case 'dragonstone': return s.bag?.includes(DRAGONSTONE_ID) ? 'Bring the Dragonstone to King Malachi at Bellwether Castle.' : 'Recover the Dragonstone on level 10, the lowest level of Mount Firedrake in the Cinder Dominion (108, 68).';
    case 'pit': return s.flags.balrogDefeated ? 'Return to King Malachi and report the Balrog’s defeat.' : 'Defeat the dark creature on level 100 of the Bottomless Pit in the Whispering Barrens.';
    case 'audience': return 'Choose your future at the royal audience in Bellwether Castle.';
    case 'resolved': return s.flags.royalHero ? 'Roam the world as its hero. People bow and monsters flee.' : 'Your royal story is complete.';
    default: return null;
  }
}

export function royalCampaignReportAvailable(s) {
  if (!isRoyalCampaign(s)) return false;
  const stage = s.flags.royalQuest;
  return stage === 'commission' || stage === 'report-delivery' ||
    stage === 'dragonstone' && s.bag?.includes(DRAGONSTONE_ID) || stage === 'pit' && s.flags.balrogDefeated === true;
}

function nearThrone(s, town, x = 9) {
  return s.mode === 'town' && s.location === town && s.castle && !s.castle.alarm &&
    Math.abs(s.castle.x - x) + Math.abs(s.castle.y - 2) <= 1;
}

function removeProof(s, id) {
  s.bag.splice(s.bag.indexOf(id), 1);
  s.pendingLoot = s.pendingLoot.filter(item => item !== id);
}

export function reportRoyalCampaign(s, note) {
  if (!nearThrone(s, capital) || !royalCampaignReportAvailable(s)) return false;
  const say = line => note(s, `${king}: ${line}`);
  switch (s.flags.royalQuest) {
    case 'commission':
      s.bag.push(ROYAL_DISPATCH_ID);
      s.pendingLoot.push(ROYAL_DISPATCH_ID);
      s.flags.royalQuest = 'courier';
      say('You brought five hundred gold, as I asked. Keep it for the journey. Deliver this sealed dispatch to Dame Isobel Crowfoot at Salt Choir, two regions east. The eastward gates require both relics from the land you are leaving. A riding dragon can fly past them. Come straight back when Dame Isobel receives the dispatch.');
      break;
    case 'report-delivery':
      s.flags.royalQuest = 'dragonstone';
      say('Dame Isobel has my message. Now go to Mount Firedrake in the Cinder Dominion. The Dragonstone lies on its lowest level. Bring the stone back to me.');
      break;
    case 'dragonstone':
      removeProof(s, DRAGONSTONE_ID);
      s.flags.royalQuest = 'pit';
      say('The Dragonstone is real, and still warm. There is one last task. Enter the Bottomless Pit in the Whispering Barrens, defeat the dark creature on its deepest level, and return to tell me.');
      break;
    case 'pit':
      s.flags.royalQuest = 'audience';
      say('The Balrog is defeated. You kept your word every time I sent you away. Now tell us what future you want for yourself.');
      break;
  }
  return true;
}

export function deliverRoyalMessage(s, note) {
  if (!isRoyalCampaign(s) || s.flags.royalQuest !== 'courier' || !nearThrone(s, ROYAL_COURIER_TOWN) || !s.bag.includes(ROYAL_DISPATCH_ID)) return false;
  removeProof(s, ROYAL_DISPATCH_ID);
  s.flags.royalQuest = 'report-delivery';
  note(s, `${recipient}: The seal is intact. Tell King Malachi that I received his dispatch and will see to it.`);
  return true;
}

export function dragonstoneChest(s, map, chests) {
  const d = s.dungeon;
  if (!isRoyalCampaign(s) || s.flags.royalQuest !== 'dragonstone' || d?.site !== 'firedrak' || d.floor !== 9) return null;
  const occupied = new Set(['1,1', '13,13', ...chests.map(chest => `${chest.x},${chest.y}`)]);
  const queue = [{x: 13, y: 13}], visited = new Set(['13,13']);
  for (const {x, y} of queue) {
    if (map[y]?.[x] === 0 && !occupied.has(`${x},${y}`)) {
      return {id: DRAGONSTONE_CHEST_ID, x, y, item: DRAGONSTONE_ID, items: [DRAGONSTONE_ID], rarity: 'epic',
        gold: 0, opened: s.openedChests?.includes(DRAGONSTONE_CHEST_ID) || false};
    }
    for (const [dx, dy] of [[-1, 0], [0, -1], [1, 0], [0, 1]]) {
      const nx = x + dx, ny = y + dy, key = `${nx},${ny}`, tile = map[ny]?.[nx];
      if (tile === undefined || tile === 1 || visited.has(key)) continue;
      visited.add(key);
      queue.push({x: nx, y: ny});
    }
  }
  return null;
}

export function royalCampaignEndingAvailable(s) {
  return isRoyalCampaign(s) && s.flags.royalQuest === 'audience' && s.flags.balrogDefeated === true &&
    (nearThrone(s, capital) || nearThrone(s, capital, 10));
}

export function chooseRoyalCampaignEnding(s, choice, note, events) {
  if (!royalCampaignEndingAvailable(s) || !Object.hasOwn(ROYAL_CAMPAIGN_ENDINGS, choice)) return false;
  const text = ROYAL_CAMPAIGN_ENDINGS[choice];
  s.flags.royalQuest = 'resolved';
  s.flags.royalEnding = choice;
  if (choice === 'hero') {
    const town = TOWNS.find(town => town.id === capital);
    s.flags.royalHero = true;
    s.mode = s.returnMode = 'world';
    s.location = null;
    s.x = town.x - 1;
    s.y = town.y;
    s.ending = null;
    s.wanted = s.wanted.map(() => 0);
    for (const key of Object.keys(s.flags)) {
      if (key.startsWith('castleBan:') || key.startsWith('palaceBan:')) delete s.flags[key];
    }
    delete s.flags.guardTauntPending;
    delete s.flags.borderTauntPending;
    delete s.flags.pennilessTown;
    delete s.flags.peacefulEncounter;
    events.push({kind: 'royalHeroEnding', choice, text});
  } else {
    if (choice === 'marriage') s.flags.married = true;
    s.mode = 'ending';
    s.ending = choice;
  }
  delete s.castle;
  note(s, text);
  return true;
}

const socialActions = new Set(['talk', 'gossipBegin', 'gossipNext', 'gossipGuardAttack', 'castlePraise', 'castleThreaten', 'castleBribe',
  'attackCastleRoyal', 'attackCastleGuard', 'challenge', 'steal', 'royalDungeonTalk', 'royalDungeonInsult', 'royalDungeonAttack']);

export function royalHeroAction(s, action, note) {
  if (!s.flags.royalHero || !socialActions.has(action.type)) return false;
  note(s, bow);
  return true;
}

export function dismissHeroEncounter(s, note) {
  if (!s.flags.royalHero || s.mode !== 'battle' || !s.enemy || s.enemy.arenaFighter || s.enemy.championTown) return;
  const message = s.enemy.guard ? `${s.enemy.name} bows and lowers their weapon.` : `${s.enemy.name} sees the hero and flees.`;
  s.mode = s.returnMode;
  s.enemy = null;
  s.flags.guarded = false;
  s.flags.combo = 0;
  note(s, message);
}

export function migrateRoyalCampaign(s) {
  const flags = s.flags;
  if (flags?.royalHero === true) delete flags.peacefulEncounter;
  if (!flags || flags.royalStoryVersion !== undefined || !flags.royalQuest || flags.royalQuest === 'resolved' || s.mode === 'ending') return;
  if (['opening', 'banished', 'imprisoned', 'sewers', 'escaped', 'wang', 'trial', 'audience'].includes(flags.royalQuest)) {
    flags.royalStoryVersion = 2;
    if (['escaped', 'wang', 'trial', 'audience'].includes(flags.royalQuest) ||
        ['imprisoned', 'sewers'].includes(flags.royalQuest) && !s.dungeon?.royal) flags.royalQuest = 'commission';
  }
}

export function validRoyalCampaignState(s) {
  const f = s.flags;
  if (f.royalStoryVersion !== undefined && ![1, 2].includes(f.royalStoryVersion)) return false;
  if (!isRoyalCampaign(s)) return f.royalHero === undefined;
  if (!stages.includes(f.royalQuest)) return false;
  const bag = [...(Array.isArray(s.bag) ? s.bag : []), ...(s.arena?.stash?.bag || [])];
  if (bag.filter(id => id === ROYAL_DISPATCH_ID).length !== Number(f.royalQuest === 'courier')) return false;
  const stones = bag.filter(id => id === DRAGONSTONE_ID).length;
  if (stones > 1 || stones && (f.royalQuest !== 'dragonstone' || !s.openedChests?.includes(DRAGONSTONE_CHEST_ID))) return false;
  if (['audience', 'resolved'].includes(f.royalQuest) && f.balrogDefeated !== true) return false;
  if (f.royalQuest !== 'resolved') return f.royalHero === undefined && f.royalEnding === undefined && s.mode !== 'ending';
  if (!Object.hasOwn(ROYAL_CAMPAIGN_ENDINGS, f.royalEnding)) return false;
  if (f.royalEnding === 'hero') return f.royalHero === true && s.mode !== 'ending' && !s.ending;
  return f.royalHero === undefined && s.mode === 'ending' && s.ending === f.royalEnding;
}

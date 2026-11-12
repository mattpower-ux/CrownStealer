import test from 'node:test';
import assert from 'node:assert/strict';
import {act, createGame, createRoyalGame, dungeonMap, loadGame, nextObjective, saveGame} from '../public/game/engine.js';
import {DUNGEONS, TOWNS} from '../public/game/content.js';
import {dungeonChests} from '../public/game/treasure.js';
import {BOTTOMLESS_PIT} from '../public/game/bottomless-pit.js';
import {areaSites, branchGates} from '../public/game/exploration.js';
import {DRAGONSTONE_CHEST_ID, ROYAL_CAMPAIGN_ENDINGS, ROYAL_COURIER_TOWN} from '../public/game/royal-campaign.js';

const roundTrip = s => loadGame(saveGame(s));
const atTown = (s, id) => {
  const town = TOWNS.find(t => t.id === id);
  return {...s, mode: 'world', location: null, region: town.region, x: town.x, y: town.y};
};
const atRuler = (s, id) => ({...atTown(s, id), mode: 'town', location: id, returnMode: 'town',
  dungeon: null, castle: {x: 9, y: 2, alarm: false}});
const report = s => act(atRuler(s, 'bellwether'), {type: 'castleReport', id: 'king'});
const relicsFor = region => DUNGEONS.filter(dungeon => dungeon.region === region).map(dungeon => dungeon.id);
const atEastGate = (s, region) => ({...s, region, mode: 'world', location: null, castle: undefined, x: 120, y: 48});
const enter = {type: 'enter'};

function commissioned() {
  const expelled = act(createRoyalGame('Courier'), {type: 'royalIntroSkip'});
  assert.equal(act({...atTown(expelled, 'bellwether'), gold: 499}, {type: 'enter'}).mode, 'world');
  const admitted = roundTrip(act({...atTown(expelled, 'bellwether'), gold: 500}, {type: 'enter'}));
  assert.equal(admitted.flags.royalQuest, 'commission');
  assert.equal(admitted.gold, 500);
  assert.equal(admitted.dungeon, null);
  const courier = roundTrip(report(admitted));
  assert.equal(courier.flags.royalQuest, 'courier');
  assert.equal(courier.bag.filter(id => id === 'royal-dispatch').length, 1);
  return courier;
}

function afterDispatch() {
  let courier = commissioned();
  assert.equal(report(courier).flags.royalQuest, 'courier');
  assert.equal(act(atRuler(courier, 'redhaven'), {type: 'royalDeliverMessage', id: 'governor'}).flags.royalQuest, 'courier');
  for (let region = 0; region < 2; region++) {
    const [first, second] = relicsFor(region);
    const gate = atEastGate(courier, region);
    assert.equal(act(gate, enter).region, region);
    assert.equal(act({...gate, relics: [...gate.relics, first]}, enter).region, region);
    courier = act({...gate, relics: [...gate.relics, first, second]}, enter);
    assert.equal(courier.region, region + 1);
  }
  assert.deepEqual(courier.relics, [...relicsFor(0), ...relicsFor(1)]);
  courier = roundTrip(act(atRuler(courier, ROYAL_COURIER_TOWN), {type: 'royalDeliverMessage', id: 'governor'}));
  assert.equal(courier.flags.royalQuest, 'report-delivery');
  assert.ok(!courier.bag.includes('royal-dispatch'));
  const adventurer = roundTrip(report(courier));
  assert.equal(adventurer.flags.royalQuest, 'dragonstone');
  return adventurer;
}

test('returning with 500 gold starts the courier commission and each eastward gate still requires both local relics', () => {
  const result = afterDispatch();
  assert.match(nextObjective(result), /Mount Firedrake/);
  assert.equal(result.flags.galenFreed, undefined);
  assert.equal(result.flags.wangTrialComplete, undefined);
  assert.equal(result.flags['garrison:0'], undefined);
});

test('neither the courier dispatch nor the roaming hero unlocks gates, but a riding dragon can cross', () => {
  const courier = atEastGate(commissioned(), 0);
  assert.equal(act(courier, enter).region, 0);
  const field = atEastGate(createGame('Roaming hero'), 0);
  const hero = {...field, flags: {...field.flags, royalStoryVersion: 2, royalQuest: 'resolved', royalEnding: 'hero',
    royalHero: true, balrogDefeated: true}};
  assert.equal(act(hero, enter).region, 0);
  for (const traveler of [courier, hero]) {
    const flying = {...traveler, flags: {...traveler.flags, mounts: ['dragon'], mount: 'dragon'}};
    const crossed = act(flying, enter);
    assert.equal(crossed.region, 1);
    assert.deepEqual(crossed.relics, []);
    assert.equal(crossed.flags['gateAccess:east-gate-0'], undefined);
  }
});

test('caravans check each crossed region and equipped dragons can take the direct route', () => {
  const courier = commissioned();
  const town = {...atTown(courier, 'bellwether'), mode: 'town', location: 'bellwether', gold: 500};
  const travelEast = {type: 'travel', region: 2};
  assert.equal(act({...town, relics: [...relicsFor(1), ...relicsFor(2)]}, travelEast).region, 0);
  assert.equal(act({...town, relics: relicsFor(0)}, travelEast).region, 0);
  assert.equal(act({...town, relics: [...relicsFor(0), ...relicsFor(1)]}, travelEast).region, 2);
  const dragonOwner = {...town, flags: {...town.flags, mounts: ['dragon']}};
  assert.equal(act(dragonOwner, travelEast).region, 0);
  const mounted = act(dragonOwner, {type: 'equipMount', id: 'dragon'});
  assert.equal(act(mounted, travelEast).region, 2);
  const returning = {...atTown(courier, ROYAL_COURIER_TOWN), mode: 'town', location: ROYAL_COURIER_TOWN, gold: 500};
  assert.equal(act(returning, {type: 'travel', region: 0}).region, 0);
  assert.equal(act({...returning, mode: 'world', location: null, x: 4, y: 48}, enter).region, 1);
});

function afterDragonstone() {
  let s = afterDispatch();
  assert.equal(report(s).flags.royalQuest, 'dragonstone');
  s = act({...s, mode: 'world', location: null, castle: undefined, region: 1, x: 108, y: 68}, {type: 'enter'});
  assert.equal(s.dungeon.site, 'firedrak');
  s.dungeon.floor = 9;
  s.dungeon.x = s.dungeon.y = 13;
  s.openedChests.push('firedrak:9:0', 'firedrak:9:1', 'firedrak:9:2');
  const stone = dungeonChests(s, dungeonMap(s.dungeon)).find(chest => chest.id === DRAGONSTONE_CHEST_ID);
  assert.deepEqual(stone.items, ['dragonstone']);
  Object.assign(s.dungeon, {x: stone.x, y: stone.y});
  s = roundTrip(act(s, {type: 'openChest'}));
  assert.equal(s.bag.filter(id => id === 'dragonstone').length, 1);
  assert.equal(act(s, {type: 'openChest'}).bag.filter(id => id === 'dragonstone').length, 1);
  const pit = roundTrip(report(s));
  assert.equal(pit.flags.royalQuest, 'pit');
  assert.ok(!pit.bag.includes('dragonstone'));
  assert.equal(pit.flags.drakeDefeated, undefined);
  return pit;
}

test('the lowest Firedrake floor guarantees the Dragonstone even after the old chests were opened', () => {
  assert.match(nextObjective(afterDragonstone()), /Bottomless Pit/);
});

test('the Balrog defeat must be reported before the four new endings are available', () => {
  let s = afterDragonstone();
  assert.equal(act(atRuler(s, 'bellwether'), {type: 'royalChoice', choice: 'marriage'}).mode, 'town');
  assert.equal(report(s).flags.royalQuest, 'pit');
  const gate = branchGates(0).find(gate => gate.area === BOTTOMLESS_PIT.area);
  const denied = act({...s, mode: 'world', location: null, castle: undefined, relics: [], x: gate.x, y: gate.y}, enter);
  assert.equal(denied.exploration?.area, undefined);
  s = act({...s, mode: 'world', location: null, castle: undefined, x: gate.x, y: gate.y}, {type: 'enter'});
  assert.equal(s.exploration.area, BOTTOMLESS_PIT.area);
  s = act({...s, x: BOTTOMLESS_PIT.x, y: BOTTOMLESS_PIT.y}, {type: 'enter'});
  assert.equal(s.dungeon.site, BOTTOMLESS_PIT.id);
  s.dungeon.floor = 99;
  s.dungeon.x = s.dungeon.y = 13;
  s = act(s, {type: 'descend'});
  assert.equal(s.enemy.speciesId, 'balrog-of-despair');
  s.enemy.hp = 1;
  s.level = 100;
  s.attributes.wisdom = 50;
  s.rng = 0;
  s = act(s, {type: 'attack'});
  assert.equal(s.flags.balrogDefeated, true);
  s = act(s, {type: 'pitElevator'});
  const exit = areaSites(s).find(point => point.kind === 'returnGate');
  s = act({...s, x: exit.x, y: exit.y}, {type: 'enter'});
  assert.equal(s.exploration.area, null);
  const audience = roundTrip(report(s));
  assert.equal(audience.flags.royalQuest, 'audience');
  assert.deepEqual(Object.keys(ROYAL_CAMPAIGN_ENDINGS), ['marriage', 'farmer', 'captain', 'hero']);
  for (const choice of ['marriage', 'farmer', 'captain']) {
    const end = roundTrip(act(audience, {type: 'royalChoice', choice}));
    assert.equal(end.mode, 'ending');
    assert.equal(end.ending, choice);
    assert.equal(act(end, {type: 'continue'}).mode, 'ending');
  }
  const events = [];
  const staleOffer = {name: 'Tithe Rat', offer: 'trade', amount: 2};
  const chosen = act({...audience, flags: {...audience.flags, peacefulEncounter: staleOffer}}, {type: 'royalChoice', choice: 'hero'}, events);
  assert.equal(chosen.flags.peacefulEncounter, undefined);
  const hero = roundTrip(chosen);
  assert.equal(hero.mode, 'world');
  assert.equal(hero.flags.royalHero, true);
  assert.ok(events.some(event => event.kind === 'royalHeroEnding'));
  assert.match(nextObjective(hero), /roam/i);
  const silent = act(atRuler(hero, 'bellwether'), {type: 'talk'});
  assert.match(silent.log.at(-1), /bows|bow/i);
  const forced = act({...hero, mode: 'dungeon', location: 'firedrak-mountain', region: 1,
    dungeon: {site: 'firedrak', index: 2, floor: 9, x: 13, y: 13, dir: 0}}, {type: 'descend'});
  assert.equal(forced.mode, 'dungeon');
  assert.equal(forced.enemy, null);
  assert.equal(forced.gold, hero.gold);
  assert.match(forced.log.at(-1), /flees/i);
});

test('a roaming hero’s ordinarily peaceful encounters flee without offers, rewards, or movement locks', () => {
  const field = {...createGame(), x: 64, y: 48, turns: 40, rng: 1975};
  const move = {type: 'move', dx: 1, dy: 0};
  const ordinary = act(field, move);
  assert.deepEqual(ordinary.flags.peacefulEncounter, {name: 'Tithe Rat', offer: 'trade', amount: 2});
  const hero = {...field, flags: {...field.flags, royalStoryVersion: 2, royalQuest: 'resolved', royalEnding: 'hero',
    royalHero: true, balrogDefeated: true}};
  const result = act(hero, move);
  assert.equal(result.x, 65);
  assert.equal(result.mode, 'world');
  assert.equal(result.enemy, null);
  assert.equal(result.flags.peacefulEncounter, undefined);
  assert.match(result.log.at(-1), /Tithe Rat.*flees/);
  assert.equal(result.gold, hero.gold);
  assert.equal(result.xp, hero.xp);
  assert.deepEqual(result.bag, hero.bag);
  const restored = roundTrip({...result, flags: {...result.flags, peacefulEncounter: ordinary.flags.peacefulEncounter}});
  assert.equal(restored.flags.peacefulEncounter, undefined);
  assert.equal(act(restored, move, [], {noRandom: true}).x, 66);
});

test('old active campaigns migrate without moving adventurers or confiscating their quest items', () => {
  let old = atRuler(createGame(), 'bellwether');
  old.flags.royalQuest = 'trial';
  old.flags.balrogDefeated = true;
  old.bag.push('balrog-whip', 'wang-sceptre');
  const migrated = roundTrip(old);
  assert.equal(migrated.flags.royalStoryVersion, 2);
  assert.equal(migrated.flags.royalQuest, 'commission');
  assert.deepEqual(migrated.castle, old.castle);
  assert.deepEqual(migrated.bag, old.bag);
  assert.equal(migrated.flags.balrogDefeated, true);
  old = {...old, mode: 'dungeon', location: null, castle: undefined, dungeon: {index: 0, floor: 0, x: 1, y: 1, dir: 1, royal: 'cell'}};
  old.flags.royalQuest = 'imprisoned';
  const cell = roundTrip(old);
  assert.equal(cell.flags.royalStoryVersion, 2);
  assert.equal(cell.flags.royalQuest, 'imprisoned');
  assert.deepEqual(cell.dungeon, old.dungeon);
});

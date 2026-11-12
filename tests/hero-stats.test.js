import test from 'node:test';import assert from 'node:assert/strict';import {createGame} from '../public/game/engine.js';import {heroStats,statsView} from '../public/game/hero-stats.js';import {TREASURE_ITEMS} from '../public/game/treasure.js';
test('inventory totals include weapon, armor, accessories and active meal/strength effects',()=>{const s=createGame(),base=heroStats(s);assert.deepEqual(base.damage,[10,14]);assert.equal(base.protection,1.3);s.equipped='rare-sword-1';s.equippedArmor='rare-armor-1';s.equippedRing='rare-ring-1';s.equippedNecklace='rare-necklace-1';s.buffs={meal:3,strength:2,strengthPower:8};const t=heroStats(s),w=TREASURE_ITEMS[s.equipped];assert.equal(t.damage[0],w.damage[0]+4+2+2+4+8+w.elementDamage);assert.equal(t.protection,TREASURE_ITEMS[s.equippedArmor].protection+TREASURE_ITEMS[s.equippedNecklace].protection);s.equipped=null;s.equippedArmor=null;s.equippedRing=null;s.equippedNecklace=null;s.buffs={};assert.deepEqual(heroStats(s).damage,[3,4]);assert.equal(heroStats(s).protection,0);});

test('wilderness movement reflects mounts and speed boots without consuming a movement step', () => {
  const s = createGame();
  s.equippedBoots = 'boots-speed-2';
  s.flags.mount = 'horse';
  s.flags.snowshoeStep = 1;
  assert.match(statsView(s), /Wilderness movement<\/dt><dd>4 square\(s\) \/ move/);
  assert.equal(s.flags.snowshoeStep, 1);
  s.equippedBoots = 'snowshoes';
  assert.match(statsView(s), /Wilderness movement<\/dt><dd>2 square\(s\) \/ move/);
  delete s.flags.mount;
  assert.match(statsView(s), /Wilderness movement<\/dt><dd>1 square \/ 2 moves/);
});

test('the encounter reduction stat combines the belt and boot modifiers', () => {
  const s = createGame();
  s.equippedBelt = 'belt-sneakiness-3';
  s.equippedBoots = 'boots-slime-skating';
  assert.match(statsView(s), /Encounter reduction<\/dt><dd>44% from gear/);
});

test('the Helm of Thinkiness shows a signed negative spell damage bonus', () => {
  const s = createGame();
  s.equippedHead = 'helm-thinkiness';
  assert.match(statsView(s), /Spell damage bonus<\/dt><dd>-1<\/dd>/);
});

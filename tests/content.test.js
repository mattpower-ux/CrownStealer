import test from 'node:test';
import assert from 'node:assert/strict';

// Missing data is an assertion failure; syntax and other import errors remain visible.
const content = await import('../public/game/content.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const prose = (value, minimum = 12) => {
  assert.equal(typeof value, 'string');
  assert.ok(value.trim().length >= minimum, `Expected at least ${minimum} characters: ${value}`);
};

test('campaign publishes the complete authored collections', () => {
  for (const [name, count] of [['REGIONS', 4], ['TOWNS', 12], ['DUNGEONS', 8], ['CHAPTERS', 20]]) {
    assert.ok(Array.isArray(content[name]), `${name} must be an array`);
    assert.equal(content[name].length, count, name);
  }
  assert.ok(content.SIDE_QUESTS?.length >= 20);
  assert.ok(content.LORE?.length >= 8);
  assert.ok(content.ENEMIES?.length >= 8);
});

test('regions expose numeric ids and usable distinct terrain palettes', () => {
  assert.deepEqual(content.REGIONS?.map(region => region.id), [0, 1, 2, 3]);
  assert.equal(new Set(content.REGIONS.map(region => region.name)).size, 4);
  for (const region of content.REGIONS) {
    for (const key of ['name', 'subtitle', 'description']) prose(region[key]);
    for (const key of ['water', 'land', 'forest', 'mountain', 'accent']) {
      assert.match(region.palette[key], /^#[\da-f]{6}$/i);
    }
    assert.equal(new Set(Object.values(region.palette)).size, 5);
  }
});

test('all locations use unique slugs and safe noncolliding map coordinates', () => {
  assert.ok(content.TOWNS && content.DUNGEONS, 'Location collections are required');
  const locations = [...content.TOWNS, ...content.DUNGEONS];
  assert.equal(new Set(locations.map(location => location.id)).size, locations.length);
  assert.equal(new Set(locations.map(({ region, x, y }) => `${region}:${x}:${y}`)).size, locations.length);
  for (const location of locations) {
    assert.match(location.id, /^[a-z]+(?:-[a-z]+)*$/);
    assert.ok([0, 1, 2, 3].includes(location.region));
    assert.ok(Number.isInteger(location.x) && location.x >= 3 && location.x <= 28);
    assert.ok(Number.isInteger(location.y) && location.y >= 3 && location.y <= 20);
  }
  for (let region = 0; region < 4; region++) {
    assert.equal(content.TOWNS.filter(location => location.region === region).length, 3);
    assert.equal(content.DUNGEONS.filter(location => location.region === region).length, 2);
  }
});

test('towns carry individual characters and meaningful dialogue and hooks', () => {
  assert.ok(content.TOWNS);
  assert.equal(new Set(content.TOWNS.map(town => town.npc)).size, 12);
  for (const town of content.TOWNS) {
    for (const key of ['name', 'npc', 'role']) prose(town[key], 3);
    for (const key of ['greeting', 'rumor', 'quest']) prose(town[key], 80);
  }
});

test('eight dungeons hold distinct relics and bosses', () => {
  assert.ok(content.DUNGEONS);
  assert.equal(new Set(content.DUNGEONS.map(dungeon => dungeon.relic)).size, 8);
  assert.equal(new Set(content.DUNGEONS.map(dungeon => dungeon.boss)).size, 8);
  for (const dungeon of content.DUNGEONS) {
    prose(dungeon.name);
    prose(dungeon.description, 180);
    prose(dungeon.relic, 5);
    prose(dungeon.boss, 5);
  }
});

test('twenty distinct chapters provide substantial story and actionable objectives', () => {
  assert.ok(content.CHAPTERS);
  assert.equal(new Set(content.CHAPTERS.map(chapter => chapter.title)).size, 20);
  for (const chapter of content.CHAPTERS) {
    prose(chapter.title);
    prose(chapter.text, 650);
    prose(chapter.objective, 65);
  }
  const narrative = content.CHAPTERS.map(chapter => chapter.text).join(' ');
  for (const dungeon of content.DUNGEONS) {
    assert.ok(narrative.includes(dungeon.relic), `Campaign must account for ${dungeon.relic}`);
  }
});

test('side quests reference towns, support engine need kinds, and bound rewards', () => {
  assert.ok(content.SIDE_QUESTS);
  assert.equal(new Set(content.SIDE_QUESTS.map(quest => quest.id)).size, content.SIDE_QUESTS.length);
  const towns = new Set(content.TOWNS.map(town => town.id));
  for (const quest of content.SIDE_QUESTS) {
    assert.match(quest.id, /^[a-z]+(?:-[a-z]+)*$/);
    assert.ok(towns.has(quest.town), `Unknown town ${quest.town}`);
    assert.ok(['gold', 'victory', 'relic'].includes(quest.need));
    assert.ok(Number.isSafeInteger(quest.target) && quest.target >= 1);
    if (quest.need === 'relic') assert.ok(quest.target <= content.DUNGEONS.length);
    assert.ok(Number.isSafeInteger(quest.reward) && quest.reward >= 5 && quest.reward <= 500);
    prose(quest.title);
    prose(quest.text, 130);
    prose(quest.conclusion, 100);
  }
  for (const town of towns) assert.ok(content.SIDE_QUESTS.some(quest => quest.town === town));
});

test('lore offers distinct readable accounts rather than placeholder fragments', () => {
  assert.ok(content.LORE);
  assert.equal(new Set(content.LORE.map(entry => entry.title)).size, content.LORE.length);
  for (const entry of content.LORE) {
    prose(entry.title);
    prose(entry.body, 250);
  }
});

test('enemy statistics are finite positive integers and include readable weaknesses', () => {
  assert.ok(content.ENEMIES);
  assert.equal(new Set(content.ENEMIES.map(enemy => enemy.name)).size, content.ENEMIES.length);
  for (const enemy of content.ENEMIES) {
    prose(enemy.name, 4);
    prose(enemy.weakness, 4);
    for (const key of ['hp', 'attack', 'gold']) {
      assert.ok(Number.isSafeInteger(enemy[key]) && enemy[key] > 0, `${enemy.name}.${key}`);
    }
  }
});

test('all four political endings resolve the kingdom and the princess agency', () => {
  assert.ok(content.ENDINGS);
  assert.deepEqual(Object.keys(content.ENDINGS).sort(), ['alliance', 'exile', 'rebel', 'usurper']);
  for (const ending of Object.values(content.ENDINGS)) {
    prose(ending, 600);
    assert.match(ending, /Mara/);
  }
  assert.equal(new Set(Object.values(content.ENDINGS)).size, 4);
});

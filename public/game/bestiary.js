import {DEPTH_SPECIES} from './dungeon-populations.js';
// Original Bar the Gates species. Reference organization: RPG MO monster habitat/stat tables.
export const DUNGEON_LEVELS=[1,2,4,5,7,8,10,11];
export const TRAITS={swift:'Quick-footed: harder to hit',brute:'Brute: greater health and striking power',armored:'Armored: physical damage is reduced',spectral:'Spectral: vulnerable to steady pressure'};
const definitions=[
  {
    "id": "tithe-rat",
    "name": "Tithe Rat",
    "level": 1,
    "region": 0,
    "legacyDungeon": 0,
    "kind": "swift",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 0
    }
  },
  {
    "id": "debt-collector",
    "name": "Debt Collector",
    "level": 2,
    "region": 0,
    "legacyDungeon": 0,
    "kind": "brute",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 1
    }
  },
  {
    "id": "grave-lantern",
    "name": "Grave Lantern",
    "level": 3,
    "region": 0,
    "legacyDungeon": 1,
    "kind": "spectral",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 2
    }
  },
  {
    "id": "ash-road-brigand",
    "name": "Ash Road Brigand",
    "level": 5,
    "region": 1,
    "legacyDungeon": 3,
    "kind": "swift",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 3
    }
  },
  {
    "id": "brass-inquisitor",
    "name": "Brass Inquisitor",
    "level": 6,
    "region": 1,
    "legacyDungeon": 2,
    "kind": "armored",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 4
    }
  },
  {
    "id": "ironroot-stalker",
    "name": "Ironroot Stalker",
    "level": 7,
    "region": 1,
    "legacyDungeon": 3,
    "kind": "brute",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 5
    }
  },
  {
    "id": "memory-eel",
    "name": "Memory Eel",
    "level": 8,
    "region": 2,
    "legacyDungeon": 4,
    "kind": "spectral",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 6
    }
  },
  {
    "id": "coral-bailiff",
    "name": "Coral Bailiff",
    "level": 9,
    "region": 2,
    "legacyDungeon": 5,
    "kind": "armored",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 7
    }
  },
  {
    "id": "starving-automaton",
    "name": "Starving Automaton",
    "level": 11,
    "region": 3,
    "legacyDungeon": 6,
    "kind": "armored",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 8
    }
  },
  {
    "id": "gravity-wraith",
    "name": "Gravity Wraith",
    "level": 12,
    "region": 3,
    "legacyDungeon": 7,
    "kind": "spectral",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 9
    }
  },
  {
    "id": "crown-echo",
    "name": "Crown Echo",
    "level": 14,
    "region": 3,
    "legacyDungeon": 7,
    "kind": "spectral",
    "wild": true,
    "guard": false,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 10
    }
  },
  {
    "id": "royal-pursuer",
    "name": "Royal Pursuer",
    "level": 20,
    "region": 0,
    "legacyDungeon": null,
    "kind": "armored",
    "wild": false,
    "guard": true,
    "art": {
      "sheet": "dungeon-monsters",
      "index": 11
    }
  },
  {
    "id": "granary-mite",
    "name": "Granary Mite",
    "level": 1,
    "region": 0,
    "dungeon": 0,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-hearth",
      "index": 0
    }
  },
  {
    "id": "ledger-leech",
    "name": "Ledger Leech",
    "level": 1,
    "region": 0,
    "dungeon": 0,
    "kind": "spectral",
    "wild": true,
    "art": {
      "sheet": "monsters-hearth",
      "index": 1
    }
  },
  {
    "id": "sack-mimic",
    "name": "Sack Mimic",
    "level": 2,
    "region": 0,
    "dungeon": 0,
    "kind": "brute",
    "wild": false,
    "art": {
      "sheet": "monsters-hearth",
      "index": 2
    }
  },
  {
    "id": "cellar-adder",
    "name": "Cellar Adder",
    "level": 2,
    "region": 0,
    "dungeon": 0,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-hearth",
      "index": 3
    }
  },
  {
    "id": "coin-golem",
    "name": "Coin Golem",
    "level": 3,
    "region": 0,
    "dungeon": 0,
    "kind": "armored",
    "wild": false,
    "art": {
      "sheet": "monsters-hearth",
      "index": 4
    }
  },
  {
    "id": "tally-imp",
    "name": "Tally Imp",
    "level": 3,
    "region": 0,
    "dungeon": 0,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-hearth",
      "index": 5
    }
  },
  {
    "id": "belfry-bat",
    "name": "Belfry Bat",
    "level": 2,
    "region": 0,
    "dungeon": 1,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-hearth",
      "index": 6
    }
  },
  {
    "id": "shroud-spider",
    "name": "Shroud Spider",
    "level": 2,
    "region": 0,
    "dungeon": 1,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-hearth",
      "index": 7
    }
  },
  {
    "id": "mourning-moth",
    "name": "Mourning Moth",
    "level": 3,
    "region": 0,
    "dungeon": 1,
    "kind": "spectral",
    "wild": false,
    "art": {
      "sheet": "monsters-hearth",
      "index": 8
    }
  },
  {
    "id": "crypt-ghoul",
    "name": "Crypt Ghoul",
    "level": 3,
    "region": 0,
    "dungeon": 1,
    "kind": "brute",
    "wild": true,
    "art": {
      "sheet": "monsters-hearth",
      "index": 9
    }
  },
  {
    "id": "bell-gargoyle",
    "name": "Bell Gargoyle",
    "level": 4,
    "region": 0,
    "dungeon": 1,
    "kind": "armored",
    "wild": false,
    "art": {
      "sheet": "monsters-hearth",
      "index": 10
    }
  },
  {
    "id": "widow-wisp",
    "name": "Widow Wisp",
    "level": 4,
    "region": 0,
    "dungeon": 1,
    "kind": "spectral",
    "wild": true,
    "art": {
      "sheet": "monsters-hearth",
      "index": 11
    }
  },
  {
    "id": "verdict-scarab",
    "name": "Verdict Scarab",
    "level": 4,
    "region": 1,
    "dungeon": 2,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-cinder",
      "index": 0
    }
  },
  {
    "id": "chain-scorpion",
    "name": "Chain Scorpion",
    "level": 4,
    "region": 1,
    "dungeon": 2,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-cinder",
      "index": 1
    }
  },
  {
    "id": "ink-ooze",
    "name": "Ink Ooze",
    "level": 5,
    "region": 1,
    "dungeon": 2,
    "kind": "spectral",
    "wild": false,
    "art": {
      "sheet": "monsters-cinder",
      "index": 2
    }
  },
  {
    "id": "oathbound-skeleton",
    "name": "Oathbound Skeleton",
    "level": 5,
    "region": 1,
    "dungeon": 2,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-cinder",
      "index": 3
    }
  },
  {
    "id": "brass-minotaur",
    "name": "Brass Minotaur",
    "level": 6,
    "region": 1,
    "dungeon": 2,
    "kind": "brute",
    "wild": false,
    "art": {
      "sheet": "monsters-cinder",
      "index": 4
    }
  },
  {
    "id": "blind-basilisk",
    "name": "Blind Basilisk",
    "level": 6,
    "region": 1,
    "dungeon": 2,
    "kind": "brute",
    "wild": true,
    "art": {
      "sheet": "monsters-cinder",
      "index": 5
    }
  },
  {
    "id": "cinder-salamander",
    "name": "Cinder Salamander",
    "level": 5,
    "region": 1,
    "dungeon": 3,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-cinder",
      "index": 6
    }
  },
  {
    "id": "boiler-crab",
    "name": "Boiler Crab",
    "level": 5,
    "region": 1,
    "dungeon": 3,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-cinder",
      "index": 7
    }
  },
  {
    "id": "soot-mephit",
    "name": "Soot Mephit",
    "level": 6,
    "region": 1,
    "dungeon": 3,
    "kind": "spectral",
    "wild": false,
    "art": {
      "sheet": "monsters-cinder",
      "index": 8
    }
  },
  {
    "id": "furnace-slug",
    "name": "Furnace Slug",
    "level": 6,
    "region": 1,
    "dungeon": 3,
    "kind": "brute",
    "wild": true,
    "art": {
      "sheet": "monsters-cinder",
      "index": 9
    }
  },
  {
    "id": "ironroot-centipede",
    "name": "Ironroot Centipede",
    "level": 7,
    "region": 1,
    "dungeon": 3,
    "kind": "armored",
    "wild": false,
    "art": {
      "sheet": "monsters-cinder",
      "index": 10
    }
  },
  {
    "id": "ember-drake",
    "name": "Ember Drake",
    "level": 7,
    "region": 1,
    "dungeon": 3,
    "kind": "brute",
    "wild": true,
    "art": {
      "sheet": "monsters-cinder",
      "index": 11
    }
  },
  {
    "id": "glass-anemone",
    "name": "Glass Anemone",
    "level": 7,
    "region": 2,
    "dungeon": 4,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-tide",
      "index": 0
    }
  },
  {
    "id": "memory-jelly",
    "name": "Memory Jelly",
    "level": 7,
    "region": 2,
    "dungeon": 4,
    "kind": "spectral",
    "wild": true,
    "art": {
      "sheet": "monsters-tide",
      "index": 1
    }
  },
  {
    "id": "coral-spider",
    "name": "Coral Spider",
    "level": 8,
    "region": 2,
    "dungeon": 4,
    "kind": "swift",
    "wild": false,
    "art": {
      "sheet": "monsters-tide",
      "index": 2
    }
  },
  {
    "id": "kelp-revenant",
    "name": "Kelp Revenant",
    "level": 8,
    "region": 2,
    "dungeon": 4,
    "kind": "brute",
    "wild": true,
    "art": {
      "sheet": "monsters-tide",
      "index": 3
    }
  },
  {
    "id": "siren-orchid",
    "name": "Siren Orchid",
    "level": 9,
    "region": 2,
    "dungeon": 4,
    "kind": "spectral",
    "wild": false,
    "art": {
      "sheet": "monsters-tide",
      "index": 4
    }
  },
  {
    "id": "tideglass-golem",
    "name": "Tideglass Golem",
    "level": 9,
    "region": 2,
    "dungeon": 4,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-tide",
      "index": 5
    }
  },
  {
    "id": "valve-barnacle",
    "name": "Valve Barnacle",
    "level": 8,
    "region": 2,
    "dungeon": 5,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-tide",
      "index": 6
    }
  },
  {
    "id": "siphon-lamprey",
    "name": "Siphon Lamprey",
    "level": 8,
    "region": 2,
    "dungeon": 5,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-tide",
      "index": 7
    }
  },
  {
    "id": "bilge-slime",
    "name": "Bilge Slime",
    "level": 9,
    "region": 2,
    "dungeon": 5,
    "kind": "spectral",
    "wild": false,
    "art": {
      "sheet": "monsters-tide",
      "index": 8
    }
  },
  {
    "id": "pressure-nautilus",
    "name": "Pressure Nautilus",
    "level": 9,
    "region": 2,
    "dungeon": 5,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-tide",
      "index": 9
    }
  },
  {
    "id": "bone-angler",
    "name": "Bone Angler",
    "level": 10,
    "region": 2,
    "dungeon": 5,
    "kind": "brute",
    "wild": false,
    "art": {
      "sheet": "monsters-tide",
      "index": 10
    }
  },
  {
    "id": "juvenile-leviathan",
    "name": "Juvenile Leviathan",
    "level": 10,
    "region": 2,
    "dungeon": 5,
    "kind": "brute",
    "wild": true,
    "art": {
      "sheet": "monsters-tide",
      "index": 11
    }
  },
  {
    "id": "gear-mite",
    "name": "Gear Mite",
    "level": 10,
    "region": 3,
    "dungeon": 6,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-star",
      "index": 0
    }
  },
  {
    "id": "rust-scarab",
    "name": "Rust Scarab",
    "level": 10,
    "region": 3,
    "dungeon": 6,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-star",
      "index": 1
    }
  },
  {
    "id": "winding-serpent",
    "name": "Winding Serpent",
    "level": 11,
    "region": 3,
    "dungeon": 6,
    "kind": "swift",
    "wild": false,
    "art": {
      "sheet": "monsters-star",
      "index": 2
    }
  },
  {
    "id": "pendulum-sentinel",
    "name": "Pendulum Sentinel",
    "level": 11,
    "region": 3,
    "dungeon": 6,
    "kind": "armored",
    "wild": true,
    "art": {
      "sheet": "monsters-star",
      "index": 3
    }
  },
  {
    "id": "clockwork-scorpion",
    "name": "Clockwork Scorpion",
    "level": 12,
    "region": 3,
    "dungeon": 6,
    "kind": "armored",
    "wild": false,
    "art": {
      "sheet": "monsters-star",
      "index": 4
    }
  },
  {
    "id": "copper-lich",
    "name": "Copper Lich",
    "level": 12,
    "region": 3,
    "dungeon": 6,
    "kind": "spectral",
    "wild": true,
    "art": {
      "sheet": "monsters-star",
      "index": 5
    }
  },
  {
    "id": "ash-moth",
    "name": "Ash Moth",
    "level": 11,
    "region": 3,
    "dungeon": 7,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-star",
      "index": 6
    }
  },
  {
    "id": "vacuum-jellyfish",
    "name": "Vacuum Jellyfish",
    "level": 11,
    "region": 3,
    "dungeon": 7,
    "kind": "spectral",
    "wild": true,
    "art": {
      "sheet": "monsters-star",
      "index": 7
    }
  },
  {
    "id": "vote-devourer",
    "name": "Vote Devourer",
    "level": 12,
    "region": 3,
    "dungeon": 7,
    "kind": "brute",
    "wild": false,
    "art": {
      "sheet": "monsters-star",
      "index": 8
    }
  },
  {
    "id": "star-husk",
    "name": "Star Husk",
    "level": 12,
    "region": 3,
    "dungeon": 7,
    "kind": "spectral",
    "wild": true,
    "art": {
      "sheet": "monsters-star",
      "index": 9
    }
  },
  {
    "id": "crown-hydra",
    "name": "Crown Hydra",
    "level": 13,
    "region": 3,
    "dungeon": 7,
    "kind": "brute",
    "wild": false,
    "art": {
      "sheet": "monsters-star",
      "index": 10
    }
  },
  {
    "id": "void-wyrm",
    "name": "Void Wyrm",
    "level": 13,
    "region": 3,
    "dungeon": 7,
    "kind": "brute",
    "wild": true,
    "art": {
      "sheet": "monsters-star",
      "index": 11
    }
  },
  {
    "id": "thornback-boar",
    "name": "Thornback Boar",
    "level": 4,
    "region": 0,
    "dungeon": null,
    "kind": "brute",
    "wild": true,
    "art": {
      "sheet": "monsters-wild",
      "index": 0
    }
  },
  {
    "id": "frostfang-wolf",
    "name": "Frostfang Wolf",
    "level": 14,
    "region": 3,
    "dungeon": null,
    "kind": "swift",
    "wild": true,
    "art": {
      "sheet": "monsters-wild",
      "index": 1
    }
  }
];
// Ordinary foes use 75% of a same-level adventurer's baseline health and strike.
// Baseline: 80 HP (+14/level), equipped starter strike averages 10 + 2*level.
export function monsterStats(species,level){const kind=species.kind;return {hp:Math.round((80+14*(level-1))*.75*(kind==='brute'?1.1:1)),attack:Math.round((10+level*2)*.75),armor:kind==='armored'?2+Math.floor(level*.4):Math.floor(level*.12),gold:level,xp:14+level*4};}
export const ENEMIES=[...definitions,...DEPTH_SPECIES].map(m=>({...m,...monsterStats(m,m.level),weakness:m.kind==='spectral'?'steady pressure':m.kind==='brute'?'guard then counter':m.kind==='armored'?'steady pressure':'quick strikes'}));
export const MONSTER_BY_ID=Object.fromEntries(ENEMIES.map(m=>[m.id,m]));

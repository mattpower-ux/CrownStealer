import test from 'node:test';
import assert from 'node:assert/strict';
import {minorDungeonMap,minorDungeonChests,minorGuardian} from '../public/game/minor-dungeons.js';
import {minorSiteDefinition} from '../public/game/minor-sites.js';

function visit(minorId,floor) {
  const site=minorSiteDefinition(minorId);
  return {
    region:site.region,treasureSeed:99,openedChests:[],
    dungeon:{site:'minor-site',minorId,index:site.index,floor:floor??site.floors-1},
  };
}

const loot={
  'common-ring-1':{id:'common-ring-1',kind:'ring',rarity:'common',tier:1},
  'rare-armor-1':{id:'rare-armor-1',kind:'armor',rarity:'rare',tier:1},
  'common-ring-3':{id:'common-ring-3',kind:'ring',rarity:'common',tier:3},
  'rare-armor-3':{id:'rare-armor-3',kind:'armor',rarity:'rare',tier:3},
  'ring-wisdom-1':{id:'ring-wisdom-1',kind:'ring',rarity:'rare',tier:1,unique:true,minLevel:5},
  'small-emerald':{id:'small-emerald',kind:'gem',rarity:'rare'},
};

test('minor layouts are small, distinct, deterministic and fully connected',()=>{
  const maps=['minor-r0-0','minor-r0-1','minor-r0-5'].map(id=>minorDungeonMap(visit(id,0).dungeon));
  assert.equal(new Set(maps.map(map=>JSON.stringify(map))).size,3);
  const nearbyCaves=[0,3,6,9,12,15,18,21].map(slot=>minorDungeonMap(visit('minor-r0-'+slot).dungeon));
  assert.ok(new Set(nearbyCaves.map(map=>JSON.stringify(map))).size>=5);
  const cemetery=visit('minor-r0-5');
  const later=minorDungeonMap(cemetery.dungeon);
  assert.notDeepEqual(later,maps[2]);
  assert.deepEqual(later,minorDungeonMap(cemetery.dungeon));
  for(const map of [...maps,later]){
    assert.equal(map.length,15);
    assert.ok(map.every(row=>row.length===15));
    assert.ok(map.every((row,y)=>row[0]===1&&row[14]===1&&(y>0&&y<14||row.every(tile=>tile===1))));
    assert.equal(map[1][1],3);
    assert.equal(map[13][13],2);
    const reachable=[[1,1]],visited=new Set(['1,1']);
    for(const [x,y] of reachable)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const next=[x+dx,y+dy],key=next.join(',');
      const tile=map[next[1]]?.[next[0]];
      if(tile===undefined||tile===1||visited.has(key))continue;
      visited.add(key);
      reachable.push(next);
    }
    assert.ok(visited.has('13,13'));
    assert.equal(visited.size,map.flat().filter(tile=>tile!==1).length);
    assert.ok(visited.size<90);
  }
});

test('minor treasure and trap-only chests have one stable identity on the last floor',()=>{
  assert.deepEqual(minorDungeonChests(visit('minor-r0-5',0),loot),[]);
  for(const id of ['minor-r0-1','minor-r0-4'])assert.deepEqual(minorDungeonChests(visit(id),loot),[]);

  const bait=minorDungeonChests(visit('minor-r0-13'),loot);
  assert.equal(bait.length,1);
  assert.equal(bait[0].trap,true);
  assert.equal(bait[0].gold,0);
  assert.deepEqual(bait[0].items,[]);

  for(const id of ['minor-r0-0','minor-r0-7','minor-r0-22','minor-r3-0']){
    const state=visit(id),[chest]=minorDungeonChests(state,loot);
    assert.equal(chest.id,`minor:${id}:${state.dungeon.floor}`);
    assert.deepEqual([chest.x,chest.y],[13,13]);
    assert.equal(chest.trap,minorSiteDefinition(id).trapped);
    assert.ok(chest.gold>=20);
    assert.ok(chest.items.length>0);
    assert.ok(chest.items.every(item=>item!=='ring-wisdom-1'&&(!loot[item].tier||loot[item].tier===Math.min(3,state.region+1))));
    assert.equal(chest.opened,false);
    assert.deepEqual(minorDungeonChests({...state,level:100,openedChests:[chest.id]},loot),[{...chest,opened:true}]);
  }
});

test('guarded minor sites have themed non-boss encounters independent of treasure',()=>{
  assert.equal(minorGuardian(visit('minor-r0-1')),null);
  assert.equal(minorGuardian(visit('minor-r0-7')),null);
  assert.equal(minorGuardian(visit('minor-r0-5',0)),null);
  for(const [id,name] of [['minor-r0-0',/kobold/i],['minor-r0-4',/shrine/i],['minor-r0-2',/skeleton/i]]){
    const guardian=minorGuardian(visit(id));
    assert.equal(guardian.minorGuardian,id);
    assert.match(guardian.name,name);
    assert.ok(guardian.art.sheet);
    assert.ok(!guardian.boss&&!guardian.guard);
    assert.ok(guardian.hp===guardian.maxHp&&guardian.gold>0&&guardian.xp>0);
  }
  assert.ok(minorGuardian(visit('minor-r3-2')).level>minorGuardian(visit('minor-r0-2')).level);
});

test('mountain tunnels connect the entrance and exit without treasure or a guardian',()=>{
  const state=visit('minor-r0-24');
  const map=minorDungeonMap(state.dungeon);
  assert.equal(map[1][1],3);
  assert.equal(map[13][13],2);
  assert.equal(map.flat().filter(tile=>tile!==1).length,25);
  assert.deepEqual(minorDungeonChests(state,loot),[]);
  assert.equal(minorGuardian(state),null);
});

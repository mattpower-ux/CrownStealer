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
    assert.ok(visited.size<150);
  }
});

test('kobold burrows form broad connected chambers across every land and preserve old saved positions',()=>{
 const legacy=[
  [0,[0,30,56,56,56,32,32,32,112,2032,15472,8192,12288,12288,0]],
  [3,[0,2,2,30,3614,4092,3584,1024,1024,1024,1024,1024,13312,15360,0]],
  [6,[0,30,56,56,56,32,32,112,2032,1136,15360,8192,12288,12288,0]],
  [9,[0,2,2,30,1822,2044,1792,512,512,512,1536,1024,13312,15360,0]],
  [12,[0,30,56,56,56,32,32,32,32,112,16368,8304,12288,12288,0]],
  [15,[0,2,2,30,926,1020,896,256,256,256,1792,1024,13312,15360,0]],
 ];
 for(const [slot,rows] of legacy){
  const map=minorDungeonMap(visit('minor-r0-'+slot,0).dungeon);
  for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(rows[y]&(1<<x))assert.notEqual(map[y][x],1,'legacy position '+slot+':'+x+','+y);
 }
 for(const land of [...Array.from({length:4},(_,i)=>'r'+i),...Array.from({length:12},(_,i)=>'w'+i)]){
  for(let slot=0;slot<24;slot++){
   const id='minor-'+land+'-'+slot,site=minorSiteDefinition(id);
   if(site.kind!=='koboldCave')continue;
   for(let floor=0;floor<site.floors;floor++){
    const map=minorDungeonMap(visit(id,floor).dungeon),open=map.flat().filter(t=>t!==1).length;
    assert.ok(open>=95&&open<150,id+': open chamber area '+open);
    let broad=0;
    for(let y=1;y<13;y++)for(let x=1;x<13;x++)if([map[y][x],map[y+1][x],map[y][x+1],map[y+1][x+1]].every(t=>t!==1))broad++;
    assert.ok(broad>=60,id+': broad chamber coverage '+broad);
    const queue=[[1,1]],seen=new Set(['1,1']);
    for(const [x,y] of queue)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
     const nx=x+dx,ny=y+dy,key=nx+','+ny;
     if(map[ny]?.[nx]===undefined||map[ny][nx]===1||seen.has(key))continue;
     seen.add(key);queue.push([nx,ny]);
    }
    assert.equal(seen.size,open);assert.ok(seen.has('13,13'));
    assert.equal(map[1][1],3);assert.equal(map[13][13],2);
    assert.ok(map[0].every(t=>t===1)&&map[14].every(t=>t===1)&&map.every(row=>row[0]===1&&row[14]===1));
   }
  }
 }
});

test('shrines, cemeteries and tunnels retain their existing map geometry',()=>{
 for(const [slot,want] of [
  [1,[0,2,2,2,2,2,2,2014,2014,2046,2012,2012,13312,15360,0]],
  [2,[0,14,8,8,28,28,2044,1052,7964,7936,7936,14336,12288,12288,0]],
  [24,[0,126,64,64,1984,1024,1024,1024,1024,1024,1024,15360,8192,8192,0]],
 ]){
  const map=minorDungeonMap(visit('minor-r0-'+slot,0).dungeon);
  assert.deepEqual(map.map(row=>row.reduce((mask,tile,x)=>mask+(tile===1?0:2**x),0)),want);
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

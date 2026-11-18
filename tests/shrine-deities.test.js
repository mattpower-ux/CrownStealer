import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,saveGame,loadGame,minorSiteList,dungeonMap} from '../public/game/engine.js';
import {minorSiteDefinition} from '../public/game/minor-sites.js';
import {minorGuardian,minorDungeonChests} from '../public/game/minor-dungeons.js';
import {TREASURE_ITEMS} from '../public/game/treasure.js';
import {itemById} from '../public/game/items.js';
import {effectiveAttributes} from '../public/game/attributes.js';
import {merchantBuyPrice} from '../public/game/items.js';
import {shrineForDungeon,charityAudienceAvailable} from '../public/game/shrine-deities.js';
function charity(){let s=createGame();const p=minorSiteList(s).find(p=>p.id==='minor-r0-1');s.x=p.x;s.y=p.y;s=act(s,{type:'enter'});s.dungeon.x=7;s.dungeon.y=9;s.gold=800;return s;}
test('shrines have wide central rooms and deities change guardians and treasure',()=>{
 const forms=new Set();
 for(const slot of [1,4,7,10,13]){const d={site:'minor-site',minorId:'minor-r0-'+slot,index:0,floor:0},profile=shrineForDungeon(d),map=dungeonMap(d);forms.add(profile.form);for(let y=4;y<=11;y++)for(let x=3;x<=11;x++)assert.notEqual(map[y][x],1);}
 assert.deepEqual([...forms].sort(),['giant','goddess','kobold','lizard']);
 assert.equal(shrineForDungeon({site:'minor-site',minorId:'minor-r1-9',index:2,floor:0}).id,'oozul');
 const legacy=[0,2,2,2,2,2,2,2014,2014,2046,2012,2012,13312,15360,0],expanded=dungeonMap({site:'minor-site',minorId:'minor-r0-1',index:0,floor:0});
 for(let y=0;y<15;y++)for(let x=0;x<15;x++)if(legacy[y]&(1<<x))assert.notEqual(expanded[y][x],1);
 for(const land of ['r0','r1','r2','r3',...Array.from({length:12},(_,i)=>'w'+i)])for(let slot=0;slot<24;slot++){const site=minorSiteDefinition('minor-'+land+'-'+slot);if(site.kind!=='ruinedShrine')continue;const profile=shrineForDungeon({site:'minor-site',minorId:site.id,index:site.index,floor:0});assert.equal(site.guarded,profile.alignment==='evil');}
 const state=slot=>({...createGame(),dungeon:{site:'minor-site',minorId:'minor-r0-'+slot,index:0,floor:0}});
 assert.equal(minorGuardian(state(4)),null);assert.equal(minorGuardian(state(10)),null);assert.equal(minorGuardian(state(7)),null);
 assert.ok(minorDungeonChests(state(7),TREASURE_ITEMS)[0].items.includes('common-lesser-healing'));
 assert.ok(minorDungeonChests(state(10),TREASURE_ITEMS)[0].items.includes('common-lesser-healing'));
});
test('only three Oozul shrines remain and all are beyond Hearthmarch',()=>{
 const ids=[];for(const land of ['r0','r1','r2','r3',...Array.from({length:12},(_,i)=>'w'+i)])for(let slot=0;slot<24;slot++){
  const site=minorSiteDefinition('minor-'+land+'-'+slot);if(site.kind==='ruinedShrine'&&shrineForDungeon({site:'minor-site',minorId:site.id,index:site.index,floor:0}).id==='oozul')ids.push(site.id);
 }
 assert.deepEqual(ids.sort(),['minor-r1-9','minor-r2-11','minor-r3-10']);
});
test('Percival tests absolute truth and awards the Helm of Handsomness',()=>{
 let s=createGame();s.mode='dungeon';s.dungeon={site:'minor-site',minorId:'minor-r1-12',index:2,floor:0,x:7,y:8,dir:0};
 for(const answer of ['yes','yes','no'])s=act(s,{type:'percivalTrial',answer});
 assert.equal(s.flags.percivalTrial,'passed');
 assert.ok(s.bag.includes('helm-of-handsomness'));
 assert.ok(s.pendingLoot.includes('helm-of-handsomness'));
 s.equippedHead='helm-of-handsomness';
 assert.equal(effectiveAttributes(s,itemById).charisma,17);
});
test('a false answer fails Percival, darkens alignment, gives coal and strips Paladin status',()=>{
 let s=createGame();s.mode='dungeon';s.dungeon={site:'minor-site',minorId:'minor-r1-12',index:2,floor:0,x:7,y:8,dir:0};s.flags.percivalOath='accepted';
 s=act(s,{type:'percivalTrial',answer:'no'});
 assert.equal(s.flags.percivalTrial,'failed');
 assert.equal(s.flags.percivalOath,'fallen');
 assert.ok(s.alignment<0);
 assert.ok(s.bag.includes('lump-of-coal'));
});
test('Lady Charity donation is explicit, costs500 once and permanently improves charisma and town standing',()=>{
 let s=charity();assert.ok(charityAudienceAvailable(s));const charisma=s.attributes.charisma;
 const closed=act(s,{type:'rename',name:'Donor'});assert.equal(closed.gold,s.gold);assert.equal(closed.flags.charityChoice,undefined);
 s=act(s,{type:'shrineCharity',choice:'donate'});assert.equal(s.gold,300);assert.equal(s.attributes.charisma,charisma+1);assert.equal(s.flags.charityChoice,'donated');
 const inTown={...s,location:'mothbridge'},without={...inTown,flags:{...s.flags,charityStanding:false}};assert.ok(merchantBuyPrice(inTown,100)<merchantBuyPrice(without,100));
 const again=act(loadGame(saveGame(s)),{type:'shrineCharity',choice:'donate'});assert.equal(again.gold,s.gold);assert.equal(again.attributes.charisma,s.attributes.charisma);
});
test('insufficient funds do not force punishment; explicit refusal falls into a persistent escapable pit',()=>{
 let s=charity();s.gold=499;s.hp=s.maxHp=200;s.rng=0;
 s=act(s,{type:'shrineCharity',choice:'donate'});assert.equal(s.flags.charityChoice,undefined);assert.equal(s.gold,499);
 const hp=s.hp;s=act(s,{type:'shrineCharity',choice:'refuse'});assert.equal(s.flags.charityChoice,'refused');assert.equal(s.dungeon.charityPit,true);assert.ok(hp-s.hp>=1&&hp-s.hp<=150);s=loadGame(saveGame(s));
 Object.assign(s.dungeon,{x:1,y:1});s=act(s,{type:'leave'});assert.equal(s.mode,'dungeon');assert.equal(s.dungeon.charityPit,undefined);assert.deepEqual([s.dungeon.x,s.dungeon.y],[7,9]);assert.equal(charityAudienceAvailable(s),false);
});
test('Lady Charity accepts 10 gold for full healing only after the first donation',()=>{
 let s=charity();
 const offering={type:'shrineOffering',amount:10};
 assert.equal(act(s,offering).gold,800);
 s=act(s,{type:'shrineCharity',choice:'donate'});
 s.hp=2;
 s.flags['shrineStrength:minor-r0-1']=true;
 const events=[];
 const healed=act(loadGame(saveGame(s)),offering,events);
 assert.equal(healed.hp,healed.maxHp);
 assert.equal(healed.gold,290);
 assert.deepEqual(healed.attributes,s.attributes);
 assert.equal(events.filter(event=>event.kind==='charityHealed').length,1);
 healed.gold=9;
 healed.hp=2;
 const broke=act(healed,offering);
 assert.equal(broke.hp,2);
 assert.equal(broke.gold,9);
});
test('fatal charity falls use normal recovery and keep valid saves',()=>{
 let s=charity();s.hp=1;s=act(s,{type:'shrineCharity',choice:'refuse'});assert.ok(s.hp>0);assert.equal(s.mode,'world');assert.equal(s.flags.rescuePending,true);assert.doesNotThrow(()=>loadGame(saveGame(s)));
});

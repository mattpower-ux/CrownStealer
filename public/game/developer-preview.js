import {atlasView,chartLands} from './atlas-view.js';
import {areaSites} from './exploration.js';
import {WILD_SITES} from './wild-sites.js';
import {wildernessDiscoverySites} from './wilderness-discoveries.js';
import {percivalCastleSite} from './percival-castle.js';
import {twinklestarTowerSite} from './twinklestar-tower.js';
import {ROYAL_DUNGEON_STAIR} from './royal-dungeon.js';
import {AREAS} from './exploration.js';
import {dungeonFloors} from './dungeon-depths.js';
import {createGame,dungeonMap,dungeonNavigation,act,minorSiteList,shipyardList} from './engine.js';
import {REGIONS,TOWNS,DUNGEONS} from './content.js';
import {ENEMIES} from './bestiary.js';
import {GROVE_ENEMIES} from './wild-sites.js';
import {TREASURE_ITEMS} from './treasure.js';
import {WEAPONS} from './items.js';
export const PREVIEW_KEYS={save:'crownstealer-developer-save-v1',checkpoint:'crownstealer-developer-checkpoint-v1'};
export const previewDestinations=[
 ...REGIONS.map((r,i)=>({id:'land:'+i,name:r.name,region:i})),
 ...TOWNS.map(t=>({id:'town:'+t.id,name:t.name,region:t.region})),
 ...DUNGEONS.map((d,i)=>({id:'dungeon:'+i,name:d.name,region:d.region,floors:dungeonFloors({index:i})})),
 {id:'ship',name:'Alien Spacecraft · Command Deck',region:0,floors:1},
 ...AREAS.filter(a=>a.kind==='planet').flatMap(a=>[{id:'area:'+a.id,name:a.name,region:a.region},...Array.from({length:3},(_,i)=>({id:'expedition:'+a.id+'-cave-'+i,name:a.name+' · '+['Prism Vault','Spore Catacombs','Echo Laboratory'][i],region:a.region,floors:3}))]),
 {id:'firedrak',name:'Firedrak Mountain',region:1,floors:10},
 {id:'elf',name:'Abandoned Elven Village',region:0,floors:4},
 {id:'royal-dungeon',name:'Royal Dungeon · Bellwether castle ladder',region:0},
 {id:'cell',name:'Story prison cell · hidden sewer escape',region:0,floors:1},
 {id:'sewer',name:'Royal sewers',region:0,floors:1}
];
export function previewCharacter(){const s=createGame('Preview adventurer');s.level=12;s.maxHp=s.hp=234;s.gold=5000;return s;}
function clearEncounter(s){delete s.flags.halChallenge;delete s.flags.halOutcome;delete s.flags.dragonWatch;delete s.flags.dragonNotice;delete s.flags.dragonGreeting;if(s.spellEffects)s.spellEffects.stunnedTurns=0;for(const key of ['rescuePending','rescueMessage','boatReveal','gagReveal','gossipGuardTown'])delete s.flags[key];s.enemy=null;s.ending=null;s.pendingLoot=[];delete s.casino;delete s.flags.borderTauntPending;delete s.flags.guardTauntPending;delete s.flags.royalQuest;delete s.flags.goldLoot;return s;}
export function previewJump(input,id,floor=1){
 const target=previewDestinations.find(d=>d.id===id);if(!target)throw Error('Choose a destination.');
 const s=clearEncounter(structuredClone(input));delete s.castle;s.region=target.region;s.mode='world';s.returnMode='world';s.dungeon=null;s.location=null;s.x=23;s.y=28;
 if(id.startsWith('area:')){s.exploration={...(s.exploration||{artifacts:[]}),area:id.slice(5),home:{region:0,x:23,y:28}};s.x=16;s.y=21;}else if(s.exploration)s.exploration.area=null;
 if(id.startsWith('town:')){const t=TOWNS.find(t=>t.id===id.slice(5));s.mode='town';s.location=t.id;s.x=t.x;s.y=t.y;s.townPosition={x:6,y:11};}
 if(id==='royal-dungeon'){const t=TOWNS.find(t=>t.id==='bellwether');s.mode='town';s.location=t.id;s.x=t.x;s.y=t.y;s.townPosition={x:4,y:3};s.castle={...ROYAL_DUNGEON_STAIR,alarm:false};}
 if(target.floors){const index=id.startsWith('dungeon:')?Number(id.slice(8)):0;const d={index,floor:Math.max(0,Math.min(target.floors-1,Math.floor(floor||1)-1)),x:1,y:1,dir:1};if(id==='ship'){d.ship=true;d.x=7;d.y=12;d.dir=0;s.exploration={...(s.exploration||{artifacts:[]}),area:null,home:{region:0,x:23,y:28}};}if(id.startsWith('expedition:')){d.expedition=id.slice(11);const a=AREAS.find(a=>d.expedition.startsWith(a.id+'-cave-'));d.index=a.region*2;s.exploration={...(s.exploration||{artifacts:[]}),area:a.id,home:{region:0,x:23,y:28}};}if(id==='firedrak'){d.site='firedrak';d.index=2;}if(id==='elf')d.site='elf-village';if(['cell','sewer'].includes(id))d.royal=id;
 const map=dungeonMap(d);if(map[d.y]?.[d.x]===1){outer:for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++)if(map[y][x]!==1){d.x=x;d.y=y;break outer;}}
 for(let dir=0;dir<4;dir++){d.dir=dir;if(dungeonNavigation(d).forward)break;}d.dir%=4;
 s.mode='dungeon';s.dungeon=d;s.location=id==='firedrak'?'firedrak-mountain':id==='ship'?null:id==='elf'?'elf-village':DUNGEONS[d.index].id;const point=id==='firedrak'?{x:108,y:68}:id==='elf'?{x:28,y:68}:DUNGEONS[index];s.x=d.expedition?.startsWith('planet-')?7:point.x;s.y=d.expedition?.startsWith('planet-')?7:point.y;
 }
 s.returnMode=s.mode;s.log.push('Developer preview: arrived at '+target.name+'.');return s;
}
export const previewMonsters=[...ENEMIES,...GROVE_ENEMIES,
 {id:'haghilda',name:'Haghilda the Snot',level:12,hp:260,attack:29,armor:8,gold:350,xp:150},
 {id:'ghost-dragon',name:'Ghost Dragon',level:12,hp:220,attack:28,armor:9,gold:260,xp:150},
 {id:'royal-pursuer',name:'Royal Guard',level:50,hp:900,attack:110,armor:45,gold:170,xp:200},
 {id:'rock-troll',name:'Rock Troll',level:12,hp:260,attack:29,armor:10,gold:250,xp:150}
];
export function previewEncounter(input,id){let monster=previewMonsters.find(m=>m.id===id);if(monster?.planetBoss)monster={...monster,hp:Math.round(monster.hp*1.6),attack:Math.round(monster.attack*1.2),armor:monster.armor+6,gold:monster.level*3,xp:monster.level*15};if(!monster)throw Error('Choose a monster.');const s=structuredClone(input);if(s.mode==='battle')s.mode=s.returnMode;clearEncounter(s);s.returnMode=s.mode;if(s.dungeon){for(let i=0;i<4&&!dungeonNavigation(s.dungeon).forward;i++)s.dungeon.dir=(s.dungeon.dir+1)%4;}s.enemy={...monster,speciesId:id,hp:monster.hp||80,maxHp:monster.hp||80,attack:monster.attack||12,armor:monster.armor||0,gold:monster.gold||20,xp:monster.xp||20,weakness:monster.weakness||'Experiment with your gear',boss:!!monster.planetBoss,guard:false,firstContact:true};s.mode='battle';return s;}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function previewMapState(s){return {...s,flags:{...s.flags,previewFullMap:true,visitedLands:[0,1,2,3,...AREAS.map(a=>a.id)]}};}
export function previewMapLocations(s){
 return chartLands(previewMapState(s)).flatMap(land=>{
  const local={...s,region:land.branch?land.region:land.id,dungeon:null,exploration:{area:land.branch?land.id:null}};
  const points=[...land.sites,...minorSiteList(local),...shipyardList(local),...wildernessDiscoverySites(local),...(land.branch?areaSites(local):WILD_SITES.filter(p=>p.region===land.id)),percivalCastleSite(local),twinklestarTowerSite(local)].filter(Boolean);
  const seen=new Set();return points.filter(p=>!seen.has(p.id)&&seen.add(p.id)).map(p=>({...p,region:local.region,area:local.exploration.area,key:`map:${land.id}:${p.id}:${p.x}:${p.y}`,mapX:land.x+p.x/(land.kind==='planet'?32:128)*land.width,mapY:land.y+p.y/(land.kind==='planet'?24:96)*land.height}));
 });
}
export function previewMapJump(input,key,rules={}){
 const p=previewMapLocations(input).find(p=>p.key===key);if(!p)throw Error('Choose a map location.');
 let s=previewJump(input,'land:'+p.region);s.x=p.x;s.y=p.y;s.exploration={artifacts:[],...s.exploration,area:p.area,home:{region:p.region,x:p.x,y:p.y}};
 if(p.id==='twinklestar-tower')s.flags.rowboatReady=true;
 delete s.arena;delete s.flags.bridgeTroll;delete s.flags.bridgeTrollApproach;
 // Enter using the normal location handler so caves, towns and story sites keep their own rules.
 s=act(s,{type:'enter'},[],rules);return s;
}
export function previewView(s,rules){
 const markers=previewMapLocations(s).map(p=>`<button class="preview-map-pin" style="left:${p.mapX/15}%;top:${p.mapY/9.8}%" data-preview="map" data-destination="${esc(p.key)}" title="${esc(p.name)}" aria-label="Jump to ${esc(p.name)}"><span>${p.mark==='town'?'♜':'◆'}</span><small>${esc(p.name)}</small></button>`).join('');
 const map=atlasView(previewMapState(s)).replace('<canvas data-atlas-world','<div class="preview-map-sheet"><canvas data-atlas-world').replace('</canvas>','</canvas>'+markers+previewDestinations.filter(d=>['ship','royal-dungeon','cell','sewer'].includes(d.id)).map((d,i)=>`<button class="preview-map-pin preview-map-special" style="left:${4+i*24}%;top:72%" data-preview="destination" data-destination="${d.id}">${esc(d.name)}</button>`).join('')+'</div>');
 return `<div class="preview-map-toolbar"><p>Click a location to jump there and play.</p><div role="group" aria-label="NPC encounters"><button data-preview="encounters-off" aria-pressed="${!!rules.noEncounters}" class="${rules.noEncounters?'primary':''}">Shut Off NPC Encounters</button><button data-preview="encounters-on" aria-pressed="${!rules.noEncounters}" class="${!rules.noEncounters?'primary':''}">Include NPC Encounters</button></div></div>${map}<p class="fine">Separate preview character · <a href="/">Return to normal game</a></p>`;
}

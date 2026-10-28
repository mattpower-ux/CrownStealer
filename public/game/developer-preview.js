import {createGame,dungeonMap,dungeonNavigation} from './engine.js';
import {REGIONS,TOWNS,DUNGEONS} from './content.js';
import {ENEMIES} from './bestiary.js';
import {GROVE_ENEMIES} from './wild-sites.js';
import {TREASURE_ITEMS} from './treasure.js';
import {WEAPONS} from './items.js';
export const PREVIEW_KEYS={save:'crownstealer-developer-save-v1',checkpoint:'crownstealer-developer-checkpoint-v1'};
export const previewDestinations=[
 ...REGIONS.map((r,i)=>({id:'land:'+i,name:r.name,region:i})),
 ...TOWNS.map(t=>({id:'town:'+t.id,name:t.name,region:t.region})),
 ...DUNGEONS.map((d,i)=>({id:'dungeon:'+i,name:d.name,region:d.region,floors:i===1?10:3})),
 {id:'elf',name:'Abandoned Elven Village',region:0,floors:4},
 {id:'cell',name:'Royal dungeon cell',region:0,floors:1},
 {id:'sewer',name:'Royal sewers',region:0,floors:1}
];
export function previewCharacter(){const s=createGame('Preview adventurer');s.level=12;s.maxHp=s.hp=234;s.gold=5000;return s;}
function clearEncounter(s){s.enemy=null;s.ending=null;s.pendingLoot=[];delete s.casino;delete s.flags.borderTauntPending;delete s.flags.guardTauntPending;delete s.flags.royalQuest;delete s.flags.goldLoot;return s;}
export function previewJump(input,id,floor=1){
 const target=previewDestinations.find(d=>d.id===id);if(!target)throw Error('Choose a destination.');
 const s=clearEncounter(structuredClone(input));s.region=target.region;s.mode='world';s.returnMode='world';s.dungeon=null;s.location=null;s.x=5;s.y=7;
 if(id.startsWith('town:')){const t=TOWNS.find(t=>t.id===id.slice(5));s.mode='town';s.location=t.id;s.x=t.x;s.y=t.y;s.townPosition={x:6,y:11};}
 if(target.floors){const index=id.startsWith('dungeon:')?Number(id.slice(8)):0;const d={index,floor:Math.max(0,Math.min(target.floors-1,Math.floor(floor||1)-1)),x:1,y:1,dir:1};if(id==='elf')d.site='elf-village';if(['cell','sewer'].includes(id))d.royal=id;
 const map=dungeonMap(d);if(map[d.y]?.[d.x]===1){outer:for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++)if(map[y][x]!==1){d.x=x;d.y=y;break outer;}}
 for(let dir=0;dir<4;dir++){d.dir=dir;if(dungeonNavigation(d).forward)break;}d.dir%=4;
 s.mode='dungeon';s.dungeon=d;s.location=id==='elf'?'elf-village':DUNGEONS[index].id;const point=id==='elf'?{x:7,y:17}:DUNGEONS[index];s.x=point.x;s.y=point.y;
 }
 s.returnMode=s.mode;s.log.push('Developer preview: arrived at '+target.name+'.');return s;
}
export const previewMonsters=[...ENEMIES,...GROVE_ENEMIES,
 {id:'haghilda',name:'Haghilda the Snot',level:12,hp:260,attack:29,armor:8,gold:350,xp:150},
 {id:'ghost-dragon',name:'Ghost Dragon',level:12,hp:220,attack:28,armor:9,gold:260,xp:150},
 {id:'royal-pursuer',name:'Royal Guard',level:20,hp:320,attack:45,armor:18,gold:170,xp:200},
 {id:'rock-troll',name:'Rock Troll',level:12,hp:260,attack:29,armor:10,gold:250,xp:150}
];
export function previewEncounter(input,id){const monster=previewMonsters.find(m=>m.id===id);if(!monster)throw Error('Choose a monster.');const s=structuredClone(input);if(s.mode==='battle')s.mode=s.returnMode;clearEncounter(s);s.returnMode=s.mode;if(s.dungeon){for(let i=0;i<4&&!dungeonNavigation(s.dungeon).forward;i++)s.dungeon.dir=(s.dungeon.dir+1)%4;}s.enemy={...monster,speciesId:id,hp:monster.hp||80,maxHp:monster.hp||80,attack:monster.attack||12,armor:monster.armor||0,gold:monster.gold||20,xp:monster.xp||20,weakness:monster.weakness||'Experiment with your gear',boss:false,guard:false,firstContact:true};s.mode='battle';return s;}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function previewView(s,rules){const options=items=>items.map(i=>`<option value="${esc(i.id)}">${esc(i.name)}</option>`).join('');return `<p class="fine">Separate test character and checkpoint. Your three adventurers are untouched. Changes here test gameplay; describe artwork or story changes in chat.</p><div class="preview-grid">
<section><h3>Go anywhere</h3><label>Destination<select id="preview-destination">${options(previewDestinations)}</select></label><label>Floor (1 = first)<input id="preview-floor" type="number" min="1" max="1" value="1"></label><button data-preview="jump" class="primary">Jump to location</button><button data-preview="unlock">Grant all border relics</button></section>
<section><h3>Stage a fight</h3><label>Monster<select id="preview-monster">${options(previewMonsters)}</select></label><button data-preview="encounter">Start encounter here</button><label class="preview-check"><input id="preview-invulnerable" type="checkbox" ${rules.invulnerable?'checked':''}> Invulnerable</label><label class="preview-check"><input id="preview-no-random" type="checkbox" ${rules.noRandom?'checked':''}> Disable random encounters</label><button data-preview="rules">Apply preview rules</button></section>
<section><h3>Test adventurer</h3><label>Level<input id="preview-level" type="number" min="1" max="100" value="${s.level}"></label><label>Gold<input id="preview-gold" type="number" min="0" max="1000000" value="${s.gold}"></label><button data-preview="stats">Apply & restore health</button></section>
<section><h3>Try equipment</h3><label>Item<select id="preview-item">${options(Object.entries({...WEAPONS,...TREASURE_ITEMS}).map(([id,item])=>({...item,id})))}</select></label><button data-preview="item">Add to test bag</button><button data-panel="inventory">Review / equip in Pack</button><p class="fine">Use the normal inventory to equip gear and compare stats.</p></section></div><div class="panel-actions"><button data-preview="reset">Reset test character</button><a class="text-button" href="/">Return to normal game</a></div>`;}

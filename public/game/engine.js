import {casinoAction,validCasino} from './casino.js';
import {townWalkable,townPosition} from './town.js';
import {WEAPONS,itemById,weaponAccuracy} from './items.js';
import {TOWNS,DUNGEONS,CHAPTERS,ENEMIES,ENDINGS,SIDE_QUESTS} from './content.js';
export const DIRS=[[0,-1],[1,0],[0,1],[-1,0]];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rand(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function note(s,text){s.log.push(text);s.log=s.log.slice(-60);}
function advance(s,chapter){if(chapter>s.chapter){s.chapter=chapter;note(s,CHAPTERS[chapter].text);}}
export function createGame(name='Wanderer'){
 const town=TOWNS[0];return {version:1,bag:['road-sword'],equipped:'road-sword',pendingLoot:[],name:String(name).trim().slice(0,24)||'Wanderer',region:0,x:town.x-1,y:town.y,mode:'world',location:null,hp:80,maxHp:80,gold:65,food:90,level:1,xp:0,weapon:1,armor:1,potions:3,chapter:0,relics:[],quests:[],wanted:[0,0,0,0],reputation:0,flags:{victories:0,transport:false},log:['The crown has called for a hero. Unfortunately, it has found you.',CHAPTERS[0].text],rng:187441,turns:0,dungeon:null,enemy:null,returnMode:'world',ending:null};
}
export function worldTile(region,x,y){
 if(x<1||x>30||y<1||y>22)return 'water';
 const points=[...TOWNS,...DUNGEONS].filter(p=>p.region===region);
 if(points.some(p=>Math.abs(x-p.x)<=1&&Math.abs(y-p.y)<=1))return 'grass';
 if(x===16||y===12||points.some(p=>(y===p.y&&x>=Math.min(16,p.x)&&x<=Math.max(16,p.x))))return 'road';
 const n=((x*73856093)^(y*19349663)^(region*83492791))>>>0;
 if(n%19===0)return 'mountain';if(n%7<3)return 'forest';return 'grass';
}
const dungeonCache=new Map();
export function makeDungeon(index,floor){
 const key=index+':'+floor;if(dungeonCache.has(key))return dungeonCache.get(key);
 const m=Array.from({length:15},()=>Array(15).fill(1));let seed=783+index*379+floor*829;
 const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const stack=[[1,1]];m[1][1]=0;
 while(stack.length){const [x,y]=stack.at(-1);const opts=DIRS.filter(([dx,dy])=>{const nx=x+dx*2,ny=y+dy*2;return nx>0&&ny>0&&nx<14&&ny<14&&m[ny][nx]===1;});if(!opts.length){stack.pop();continue;}const [dx,dy]=opts[Math.floor(r()*opts.length)];m[y+dy][x+dx]=0;m[y+dy*2][x+dx*2]=0;stack.push([x+dx*2,y+dy*2]);}
 m[1][1]=3;m[13][13]=2;dungeonCache.set(key,m);return m;
}
function openDungeonDirection(d){const m=makeDungeon(d.index,d.floor);return Math.max(0,DIRS.findIndex(([dx,dy])=>m[d.y+dy]?.[d.x+dx]!==undefined&&m[d.y+dy][d.x+dx]!==1));}
export function dungeonNavigation(d){const m=makeDungeon(d.index,d.floor);const clear=dir=>{const [dx,dy]=DIRS[(dir+4)%4];return m[d.y+dy]?.[d.x+dx]!==undefined&&m[d.y+dy][d.x+dx]!==1;};return {forward:clear(d.dir),back:clear(d.dir+2),left:clear(d.dir-1),right:clear(d.dir+1),facing:['north','east','south','west'][d.dir]};}
export function pointAt(s){return [...TOWNS.map(p=>({...p,kind:'town'})),...DUNGEONS.map((p,index)=>({...p,index,kind:'dungeon'}))].find(p=>p.region===s.region&&p.x===s.x&&p.y===s.y);}
export function nextObjective(s){const d=DUNGEONS.find(d=>!s.relics.includes(d.id));return d?`Recover ${d.relic} from ${d.name}.`:'Return to the royal court and decide the fate of the crown.';}
function encounter(s,boss=false,guard=false){
 const pools=[[0,1,2],[3,4,5],[6,7],[8,9,10]];const pool=pools[s.region];const template=ENEMIES[pool[Math.floor(rand(s)*pool.length)]];
 const hp=boss?65+s.region*32:guard?50+s.region*25:22+s.region*15+s.level*3;
 s.returnMode=s.mode;s.flags.guarded=false;s.flags.combo=0;s.enemy={firstContact:s.mode==='dungeon',name:boss?DUNGEONS[s.dungeon.index].boss:guard?'Royal bailiff':template.name,hp,maxHp:hp,attack:boss?10+s.region*4:5+s.region*3,gold:boss?95:15+s.region*12,weakness:template.weakness||'quick strikes',boss,guard};s.mode='battle';note(s,`${s.enemy.name} bars your way. Weakness: ${s.enemy.weakness}. ${boss?'There will be no quiet passage.':'Fight, defend, use magic, or retreat.'}`);
}
function recover(s){s.hp=s.maxHp;s.gold=Math.floor(s.gold*.8);s.food=Math.max(s.food,25);s.enemy=null;s.dungeon=null;s.mode='world';const town=TOWNS.find(t=>t.region===s.region);s.x=town.x-1;s.y=town.y;note(s,'A weary pilgrim drags you to safety. You lose a fifth of your gold, but your story continues.');}
function clock(s,food=.25){s.turns++;s.food=Math.max(0,s.food-food);if(s.food===0){s.hp-=2;note(s,'Your empty pack offers little encouragement. Find provisions.');}if(s.hp<=0)recover(s);}
function enemyTurn(s,defending=false,events=[]){if(!s.enemy)return;const damage=Math.max(1,Math.floor(s.enemy.attack*(.7+rand(s)*.7)-s.armor*1.3));s.hp-=defending?Math.ceil(damage/3):damage;events.push({kind:defending?'block':'hit',target:'hero',hpAfter:Math.max(0,s.hp),amount:defending?Math.ceil(damage/3):damage,sound:defending?'block':'hurt'});note(s,`${s.enemy.name} strikes for ${defending?Math.ceil(damage/3):damage}.`);if(s.hp<=0){events.push({kind:'defeat',target:'hero',amount:0,sound:'defeat'});recover(s);}}
function victory(s){const e=s.enemy;s.gold+=e.gold;s.xp+=e.boss?60:20;s.flags.victories++;if(e.boss||s.flags.victories%3===1){const pool=Object.keys(WEAPONS).slice(1+s.region*2,3+s.region*2);const found=pool.find(id=>!s.bag?.includes(id));if(found){s.bag??=['road-sword'];s.pendingLoot??=[];s.bag.push(found);s.pendingLoot.push(found);note(s,`You found ${WEAPONS[found].name}.`);}}if(e.boss)s.flags['boss:'+s.dungeon.index]=true;if(e.guard){s.wanted[s.region]=Math.max(0,s.wanted[s.region]-1);s.flags['garrison:'+s.region]=true;s.reputation-=3;}note(s,`${e.name} is defeated. You find ${e.gold} gold.`);s.mode=s.returnMode;s.enemy=null;while(s.xp>=s.level*50){s.xp-=s.level*50;s.level++;s.maxHp+=14;s.hp=Math.min(s.maxHp,s.hp+30);note(s,`Level ${s.level}. Rumors of your competence are becoming difficult to deny.`);}}
export function act(input,action,events=[]){
 const s=actInner(input,action,events);
 if(input.mode==='battle'&&s.enemy&&(events.length||action?.type==='flee'))s.enemy.firstContact=false;
 if(s.mode==='town'&&s.gold===0&&!s.casino?.active){const t=TOWNS.find(t=>t.id===s.location)||TOWNS.find(t=>t.region===s.region);s.mode='world';s.location=null;s.x=t.x-1;s.y=t.y;note(s,'Being escorted out of the town. Return when you have some gold in your possession.');}
 return s;
}
function actInner(input,action,events=[]){
 const s=structuredClone(input);const a=action||{};
 if(s.casino?.active&&s.mode==='town'&&!['casinoHit','casinoStand','casinoHold','casinoDraw','casinoShoot','gamble','rename'].includes(a.type)){note(s,'Finish your current casino game before leaving the table.');return s;}
 if(a.type==='rename'){const name=String(a.name??'').replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,24);if(name)s.name=name;return s;}
 if(a.type==='acknowledgeLoot'){s.pendingLoot?.shift();return s;}
 if(a.type==='equip'){if(s.mode!=='battle'&&s.bag?.includes(a.id)&&Object.hasOwn(WEAPONS,a.id)){s.equipped=a.id;note(s,`Equipped ${WEAPONS[a.id].name}.`);}return s;}
 if(s.mode==='ending'&&!['continue'].includes(a.type))return s;
 if(a.type==='continue'){s.mode='world';s.ending=null;s.dungeon=null;s.location=null;return s;}
 if(a.type==='heal'){if(s.potions>0&&s.hp<s.maxHp){s.potions--;events.push({kind:'heal',target:'hero',amount:Math.min(45,s.maxHp-s.hp),sound:'magic'});s.hp=Math.min(s.maxHp,s.hp+45);note(s,'The tonic tastes like regret. It restores 45 health.');if(s.mode==='battle')enemyTurn(s,false,events);}return s;}
 if(s.mode==='battle'){
  if(a.type==='attack'||a.type==='magic'){if(a.type==='magic'&&s.food<3){note(s,'You need three provisions to focus your spell.');return s;}if(a.type==='magic')s.food-=3;const weakness=s.enemy.weakness;const effective=a.type==='attack'&&(weakness==='quick strikes'||weakness==='guard then counter'&&s.flags.guarded||weakness==='steady pressure'&&s.flags.combo>=1);const gear=WEAPONS[s.equipped]||WEAPONS['road-sword'];if(a.type==='attack'&&rand(s)*100>=weaponAccuracy(s)){s.flags.guarded=false;s.flags.combo=0;events.push({kind:'miss',target:'enemy',amount:0,sound:'miss'});note(s,'Your weapon misses.');enemyTurn(s,false,events);return s;}const base=a.type==='magic'?18+s.level*3:gear.damage[0]+Math.floor(rand(s)*(gear.damage[1]-gear.damage[0]+1))+s.weapon*4+s.level*2;const damage=Math.floor(base*(a.type==='magic'?(.8+rand(s)*.5):1)*(effective?1.4:1));s.flags.guarded=false;s.flags.combo=a.type==='attack'?(s.flags.combo||0)+1:0;s.enemy.hp-=damage;events.push({kind:a.type==='magic'?'magic':'hit',target:'enemy',amount:damage,sound:a.type==='magic'?'magic':'hit'});note(s,`${a.type==='magic'?'Ember spell':'Your weapon'} deals ${damage} damage.${effective?' You exploit its weakness.':''}`);if(s.enemy.hp<=0){events.push({kind:'victory',target:'enemy',amount:0,sound:'victory'});victory(s);}else enemyTurn(s,false,events);}
  else if(a.type==='guard'){s.flags.guarded=true;s.flags.combo=0;s.hp=Math.min(s.maxHp,s.hp+3);enemyTurn(s,true,events);}
  else if(a.type==='flee'){if(rand(s)<.8){s.mode=s.returnMode;s.enemy=null;if(s.dungeon){s.dungeon.x=1;s.dungeon.y=1;s.dungeon.dir=openDungeonDirection(s.dungeon);}note(s,'You retreat. Discretion is a very respectable kind of panic.');}else{note(s,'Your escape is blocked.');enemyTurn(s,false,events);}}
  return s;
 }
 if(a.type==='move'&&s.mode==='world'){
  if(!Number.isInteger(a.dx)||!Number.isInteger(a.dy)||Math.abs(a.dx)+Math.abs(a.dy)!==1)return s;
  const x=s.x+a.dx,y=s.y+a.dy,tile=worldTile(s.region,x,y);if(tile==='water'||tile==='mountain'){note(s,'That route is impassable. Follow the paths around it.');return s;}s.x=x;s.y=y;clock(s,s.flags.transport?.12:.25);if(s.turns>4&&!pointAt(s)&&rand(s)<.08)encounter(s);return s;
 }
 if(a.type==='enter'&&s.mode==='world'){
  const p=pointAt(s);if(!p){note(s,'There is nothing to enter here. Follow the map to a settlement or ruin.');return s;}
  if(p.kind==='town'&&s.gold===0){note(s,'The guards refuse entry. Return with some gold in your possession.');return s;}s.location=p.id;if(p.kind==='town'){s.mode='town';s.townPosition={x:6,y:11};note(s,p.greeting);if(s.flags.legacy)note(s,`The ${s.flags.legacy} settlement has changed the town. People remember the hand that moved the crown.`);if(s.wanted[s.region]>=3&&!s.flags['garrison:'+s.region]){note(s,'Wanted notices bear a surprisingly flattering sketch of you. Guards are watching.');if(s.wanted[s.region]>=4)encounter(s,false,true);}}
  else{s.mode='dungeon';s.dungeon={index:p.index,floor:0,x:1,y:1,dir:1};s.dungeon.dir=openDungeonDirection(s.dungeon);note(s,p.description);}return s;
 }
 if(a.type==='leave'){
  if(s.mode==='town'){s.mode='world';s.location=null;}
  else if(s.mode==='dungeon'){if(s.dungeon.x===1&&s.dungeon.y===1){if(s.dungeon.floor>0){s.dungeon.floor--;s.dungeon.x=13;s.dungeon.y=13;s.dungeon.dir=openDungeonDirection(s.dungeon);}else{s.mode='world';s.dungeon=null;s.location=null;}}else note(s,'Return to the entrance stair to leave this floor.');}return s;
 }
 if(s.mode==='dungeon'){
  const d=s.dungeon,m=makeDungeon(d.index,d.floor);
  if(a.type==='turn'&&[-1,1].includes(a.delta))d.dir=(d.dir+a.delta+4)%4;
  if(a.type==='forward'||a.type==='back'||a.type==='strafe'){const [dx,dy]=DIRS[(d.dir+(a.type==='strafe'?(a.delta<0?-1:1):0)+4)%4],n=a.type==='back'?-1:1;const x=d.x+dx*n,y=d.y+dy*n;if(m[y]?.[x]!==undefined&&m[y][x]!==1){d.x=x;d.y=y;clock(s,.1);if(s.mode==='dungeon'&&!(x===1&&y===1)&&!(x===13&&y===13)&&rand(s)<.055)encounter(s);}else note(s,'Cold stone blocks your path.');}
  if(a.type==='descend'&&d.x===13&&d.y===13){if(d.floor<2){d.floor++;d.x=1;d.y=1;d.dir=openDungeonDirection(d);note(s,`Depth ${d.floor+1}. The air grows still.`);}else if(s.relics.includes(DUNGEONS[d.index].id))note(s,'The empty reliquary remembers you.');else if(!s.flags['boss:'+d.index])encounter(s,true);else claimRelic(s);}
  if(a.type==='claim'&&d.x===13&&d.y===13&&d.floor===2&&s.flags['boss:'+d.index])claimRelic(s);
  return s;
 }
 if(s.mode==='town'){
  if(a.type==='move'){const p=townPosition(s);if(!Number.isInteger(a.dx)||!Number.isInteger(a.dy)||Math.abs(a.dx)+Math.abs(a.dy)!==1)return s;const x=p.x+a.dx,y=p.y+a.dy;if(townWalkable(x,y)){s.townPosition={x,y};s.turns++;if(x===6&&y===12){s.mode='world';s.location=null;}}else note(s,'A building or town wall blocks your path. Follow the streets to its entrance.');return s;}
  const town=TOWNS.find(t=>t.id===s.location)||TOWNS.find(t=>t.region===s.region);
  if(a.type==='talk'){note(s,`${town.npc}: ${town.rumor}`);const n=s.relics.length;if(n===1)advance(s,2);if(n===2&&town.id==='bellwether'){advance(s,4);s.flags.courtBriefing=true;}if(n===4)advance(s,8);if(n===5)advance(s,11);if(n===7)advance(s,15);if(n===8&&town.id==='bellwether')advance(s,18);note(s,town.quest);}
  if(a.type==='rest'){const price=s.wanted[s.region]>=3?20:8;if(s.gold>=price){s.gold-=price;s.hp=s.maxHp;note(s,'A bed, a bowl of soup, and eight hours without prophecy. Health restored.');}else{ s.hp=Math.min(s.maxHp,s.hp+20);s.food=Math.max(s.food,20);note(s,'You work in the kitchens for a meal and a bench. Some health and provisions restored.');}}
  if(a.type==='buy'){
   const prices={food:10,potion:18,weapon:45*s.weapon,armor:40*s.armor,transport:150};const price=prices[a.item];if(!price||s.gold<price){note(s,'Your purse declines on your behalf.');return s;}if(s.wanted[s.region]>=4&&!s.flags['garrison:'+s.region]){note(s,'The merchant closes the shutters. Settle your bounty first.');return s;}
   if(a.item==='transport'&&s.flags.transport)return s;s.gold-=price;if(a.item==='food')s.food=Math.min(999,s.food+40);if(a.item==='potion')s.potions++;if(a.item==='weapon')s.weapon++;if(a.item==='armor')s.armor++;if(a.item==='transport')s.flags.transport=true;note(s,`Purchased ${a.item}.`);
  }
  if(a.type==='steal'){s.wanted[s.region]++;s.reputation-=2;const haul=12+Math.floor(rand(s)*30);s.gold+=haul;note(s,`You lift ${haul} gold. A witness develops an inconvenient memory. Local bounty: ${s.wanted[s.region]*25} gold.`);if(s.wanted[s.region]>=4&&!s.flags['garrison:'+s.region])encounter(s,false,true);}
  if(a.type==='pardon'){const cost=s.wanted[s.region]*25;if(s.gold>=cost){s.gold-=cost;s.wanted[s.region]=0;note(s,'Your fine is paid. The law discovers your excellent character.');}else note(s,`The clerk requires ${cost} gold. Kitchen work and wilderness treasure remain available.`);}
  if(a.type==='challenge'){if(s.flags['garrison:'+s.region])note(s,'The garrison has surrendered. Its empty barracks are a monument to poor career advice.');else encounter(s,false,true);}
  if(a.type==='gamble'||a.type?.startsWith('casino'))casinoAction(s,a,()=>rand(s),text=>note(s,text));
  if(a.type==='quest'){const q=SIDE_QUESTS.find(q=>q.id===a.id&&q.town===town.id);if(!q||s.quests.includes(q.id))return s;const value=q.need==='gold'?s.gold:q.need==='victory'?s.flags.victories:s.relics.length;if(value<q.target){note(s,`${q.title}: ${q.text} [Need ${q.target} ${q.need}.]`);}else{if(q.need==='gold')s.gold-=q.target;s.gold+=q.reward;s.quests.push(q.id);s.reputation+=2;note(s,q.conclusion);note(s,`Quest complete: ${q.title}. ${q.reward} gold; reputation +2.`);}}
  if(a.type==='travel'){const region=Number(a.region);if(!Number.isInteger(region)||region<0||region>3)return s;if(region>Math.floor(s.relics.length/2)){note(s,'The route is sealed. Recover both relics of the preceding land.');return s;}s.region=region;const p=TOWNS.find(t=>t.region===region);s.x=p.x-1;s.y=p.y;s.mode='world';s.location=null;note(s,'You cross into a different sky. The road remembers no titles.');if(region===1&&s.relics.length>=2)advance(s,5);if(region===2&&s.relics.length>=4)advance(s,9);if(region===3&&s.relics.length>=6)advance(s,13);if(region===0&&s.relics.length===8)advance(s,17);}
  if(a.type==='ending'){if(s.relics.length<8||town.id!=='bellwether'){note(s,'The final audience awaits at Bellwether Court with all eight relics.');return s;}if(!Object.hasOwn(ENDINGS,a.choice))return s;s.ending=a.choice;s.flags.legacy=a.choice;s.mode='ending';advance(s,19);if(a.choice==='alliance'){s.reputation+=10;s.wanted=[0,0,0,0];}if(a.choice==='rebel'){s.flags['garrison:0']=true;s.wanted[0]=0;}if(a.choice==='usurper'){s.flags['garrison:0']=true;s.reputation-=10;}note(s,ENDINGS[a.choice]);}
 }
 return s;
}
function claimRelic(s){const d=DUNGEONS[s.dungeon.index];if(s.relics.includes(d.id))return;s.relics.push(d.id);s.pendingLoot??=[];s.pendingLoot.push(d.id);s.gold+=100;s.hp=s.maxHp;s.food=Math.max(s.food,50);note(s,`You recover ${d.relic}.`);advance(s,[0,1,3,6,7,10,12,14,16][s.relics.length]);s.mode='world';s.dungeon=null;s.location=null;}
export function availableActions(s){if(s.mode==='battle')return ['attack','guard','magic','heal','flee'];if(s.mode==='town')return ['talk','rest','buy','gamble','steal','pardon','quest','travel','leave'];if(s.mode==='dungeon')return ['forward','back','strafe','turn','descend','leave','heal'];return ['move','enter','heal'];}
export function saveGame(s){return JSON.stringify({...s,savedAt:Date.now()});}
export function loadGame(json){
 const s=JSON.parse(json);if(!s||s.version!==1||typeof s.name!=='string'||s.name.length>24)throw Error('This is not a valid CrownStealer save.');
 const bounds={region:[0,3],x:[0,31],y:[0,23],hp:[0,100000],maxHp:[1,100000],gold:[0,10000000],food:[0,999],level:[1,1000],xp:[0,1000000],weapon:[1,1000],armor:[1,1000],potions:[0,100000],chapter:[0,19],rng:[0,4294967295],turns:[0,100000000]};
 for(const [k,[min,max]] of Object.entries(bounds))if(typeof s[k]!=='number'||!Number.isFinite(s[k])||s[k]<min||s[k]>max||k!=='food'&&!Number.isInteger(s[k]))throw Error('Invalid save field: '+k);
 if(s.hp>s.maxHp||!['world','town','dungeon','battle','ending'].includes(s.mode))throw Error('Invalid character state.');
 if(!Array.isArray(s.log)||s.log.length>60||s.log.some(x=>typeof x!=='string'||x.length>10000))throw Error('Invalid journal.');
 for(const [key,allowed] of [['relics',DUNGEONS.map(d=>d.id)],['quests',SIDE_QUESTS.map(q=>q.id)]])if(!Array.isArray(s[key])||s[key].length>allowed.length||new Set(s[key]).size!==s[key].length||s[key].some(x=>!allowed.includes(x)))throw Error('Invalid campaign progress.');
 if(!Array.isArray(s.wanted)||s.wanted.length!==4||s.wanted.some(n=>!Number.isInteger(n)||n<0||n>10000)||!Number.isFinite(s.reputation)||!s.flags||typeof s.flags!=='object'||!Number.isInteger(s.flags.victories)||s.flags.victories<0)throw Error('Invalid reputation data.');
 if(s.mode==='town'&&!TOWNS.some(t=>t.id===s.location&&t.region===s.region))throw Error('Unknown settlement.');
 if(s.dungeon!==null){const d=s.dungeon;if(!d||!Number.isInteger(d.index)||!DUNGEONS[d.index]||DUNGEONS[d.index].region!==s.region||!Number.isInteger(d.floor)||d.floor<0||d.floor>2||!Number.isInteger(d.x)||!Number.isInteger(d.y)||!Number.isInteger(d.dir)||d.dir<0||d.dir>3||makeDungeon(d.index,d.floor)[d.y]?.[d.x]===undefined||makeDungeon(d.index,d.floor)[d.y][d.x]===1)throw Error('Invalid dungeon position.');}
 if(s.mode==='dungeon'&&!s.dungeon)throw Error('Missing dungeon.');
 if(s.mode==='battle'){if(!s.enemy||!['world','town','dungeon'].includes(s.returnMode)||s.returnMode==='dungeon'&&!s.dungeon||s.enemy.boss&&(s.returnMode!=='dungeon'||!s.dungeon)||s.returnMode==='town'&&!TOWNS.some(t=>t.id===s.location&&t.region===s.region))throw Error('Invalid encounter.');for(const k of ['hp','maxHp','attack','gold'])if(!Number.isFinite(s.enemy[k])||s.enemy[k]<0||s.enemy[k]>100000)throw Error('Invalid enemy.');if(typeof s.enemy.name!=='string'||s.enemy.name.length>100)throw Error('Invalid enemy name.');}
 if(s.mode==='town'||s.returnMode==='town'){s.townPosition??={x:6,y:11};const p=s.townPosition;if(!p||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!townWalkable(p.x,p.y))throw Error('Invalid town position.');}
 if(!validCasino(s.casino,s))throw Error('Invalid casino save.');
 s.bag??=['road-sword'];s.equipped??='road-sword';s.pendingLoot??=[];
 if(!Array.isArray(s.bag)||s.bag.length>Object.keys(WEAPONS).length||new Set(s.bag).size!==s.bag.length||s.bag.some(id=>!Object.hasOwn(WEAPONS,id))||!s.bag.includes(s.equipped)||!Array.isArray(s.pendingLoot)||s.pendingLoot.length>20||s.pendingLoot.some(id=>!itemById(id)||!s.bag.includes(id)&&!s.relics.includes(id)))throw Error('Invalid equipment.');
 if(s.mode==='ending'&&!Object.hasOwn(ENDINGS,s.ending))throw Error('Unknown ending.');if(!s.savedAt&&s.mode==='dungeon'&&s.dungeon.x===1&&s.dungeon.y===1&&!dungeonNavigation(s.dungeon).forward)s.dungeon.dir=openDungeonDirection(s.dungeon);return s;
}

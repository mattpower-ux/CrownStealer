import {monsterStats} from './bestiary.js';
import {BOTTOMLESS_PIT} from './bottomless-pit.js';

export const BRIAR_AREA = 'wild-0';
export const BATTLE_BEAR_HP = 540;
const ANDROS = {name:'Andros, the Great Bear of the North',speciesId:'andros',level:40,offer:'andros',kind:'brute'};
const animals = [
 {name:'Bramble Hare',speciesId:'tithe-rat',offer:'food',line:'“Take these roots and berries for the road. The Thegns used to breed us for their tables.”'},
 {name:'Hill Doe',speciesId:'thornback-boar',offer:'medicine',line:'“Take this healing potion. The hunters forged armor for their war beasts. In the Pit, you may need it more than I do.”'},
 {name:'Gray Wolf',speciesId:'frostfang-wolf',offer:'advice',line:'“The Bottomless Pit lies far out at sea. The Lizard Thegns feared it too, and even their oldest tales give no name to the thing that dug it.”'},
 {name:'Briar Boar',speciesId:'thornback-boar',offer:'warning',line:'“The Thegns once bred us to pull their wagons. The land grew colder and most died out. The survivors still hunt in the old warrens. Watch for them underground.”'},
];

export function briarAnimalMeeting(s, temperament, kind) {
 const walksWithAndros = s.flags.andros !== undefined;
 const selected = !walksWithAndros && temperament < .9 && kind < .12
  ? ANDROS
  : animals[Math.min(animals.length-1,Math.floor(kind*animals.length))];
 return {...selected,kind:selected.kind||'brute',level:selected.level||Math.min(22,Math.max(5,s.level)),
  peaceful:temperament<.9};
}

export function briarEnemy(animal,provoked) {
 const stats=monsterStats(animal,animal.level);
 const hp=animal.offer==='andros'?BATTLE_BEAR_HP:stats.hp;
 return {...stats,name:animal.name,speciesId:animal.speciesId,level:animal.level,
  hp,maxHp:hp,kind:animal.kind,good:provoked&&animal.peaceful,
  weakness:'guard then counter',firstContact:true,androsWild:animal.offer==='andros'};
}

export function enterBriarBattle(s,animal,provoked,note) {
 s.enemy=briarEnemy(animal,provoked);
 s.returnMode='world';s.mode='battle';s.flags.guarded=false;s.flags.combo=0;
 note(s,animal.name+(provoked?' defends against your attack.':' charges at you.'));
}

export function acceptBriarHelp(s,animal,note) {
 if(animal.offer==='food')s.meals=Math.min(999,s.meals+2);
 if(animal.offer==='medicine')s.bag.push('starter-healing');
 if(animal.offer==='andros'){
  if(s.flags.andros!==undefined)return;
  s.flags.andros=BATTLE_BEAR_HP;
  note(s,'Andros joins you as a level 40 bodyguard. He will fight beside you in the Bottomless Pit.');
  return;
 }
 note(s,'You thank '+animal.name+' for the help.');
}

export function briarMeetingView(animal,button,esc){
 const andros=animal.offer==='andros';
 const line=andros?'“If you mean to face what lives in the Bottomless Pit, speak to me with respect and I will stand beside you.”':animal.line;
 return (andros?'<img class="andros-portrait" src="/assets/andros.webp" alt="Andros in his battle harness">':'')+'<h3>'+esc(animal.name)+'</h3><p>'+esc(line)+'</p><div class="panel-actions">'+
  button(andros?'Greet Andros with respect':'Accept help',{type:'peacefulAccept'},'primary')+
  button('Walk away',{type:'peacefulLeave'})+button('Attack',{type:'peacefulProvoke'})+'</div>';
}

const androsInFight=s=>s.mode==='battle'&&s.dungeon?.site===BOTTOMLESS_PIT.id&&s.flags.andros>0;

export function androsStrike(s,events,note){
 if(!androsInFight(s)||s.enemy.hp<=0||s.enemy.combatDistance>1)return;
 const amount=Math.max(15,56-Math.floor(s.enemy.armor||0));
 s.enemy.hp-=amount;
 const message='Andros mauls '+s.enemy.name+' for '+amount+' damage.';
 note(s,message);events.push({kind:'hit',target:'enemy',amount,sound:'hit',andros:true,message});
}

export function androsHurt(s,damage,note){
 if(!androsInFight(s)||damage<=0||s.enemy.combatDistance>1)return;
 s.flags.andros=Math.max(0,s.flags.andros-Math.max(1,Math.ceil(damage/3)));
 if(!s.flags.andros)note(s,'Andros falls defending you.');
}

export function briarThegn(s,roll,boss){
 const name=boss?'Lizard Thegn Warlord':roll<.5?'Lizard Thegn Hunter':'Lizard Thegn Wagonguard';
 const level=(boss?11:7)+s.dungeon.floor*2+(roll>=.5?1:0),kind=boss||roll>=.5?'armored':'swift';
 const stats=monsterStats({kind},level),hp=boss?Math.round(stats.hp*1.4):stats.hp;
 return {...stats,speciesId:'lizard-thegn',name,level,hp,maxHp:hp,kind,boss,firstContact:true,
  attackType:!boss&&roll<.5?'ranged':undefined,weakness:'guard then counter'};
}

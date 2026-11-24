import {adjustAlignment} from './alignment.js';

export const CAVE_STORIES={
 'werebear-dogs':{id:'werebear-dogs',title:'The Werebear and His Dogs',siteId:'minor-w1-1',name:'Moonpaw Cave',reward:'small-emerald'},
 'kobold-hoard':{id:'kobold-hoard',title:'Grub’s Private Larder',siteId:'minor-r0-6',name:'Fullbelly Burrow',reward:'common-lesser-healing'},
 'rabbit-dinner':{id:'rabbit-dinner',title:'A Rabbit for Dinner',siteId:'minor-r1-5',name:'Long-Ear Cave',reward:'small-pearl'},
 'flowerhaven-children':{id:'flowerhaven-children',title:'The Children of Flowerhaven',siteId:'minor-r1-11',name:'Flowerhaven Hollow',reward:'scroll-return'},
 'beaver-household':{id:'beaver-household',title:'The Beaver Household',siteId:'minor-w1-4',name:'Timbertooth Lodge',reward:'small-sapphire'},
};
export const CAVE_STORY_BY_SITE=Object.fromEntries(Object.values(CAVE_STORIES).map(story=>[story.siteId,story]));

export function caveStoryAt(s,{includeResolved=false}={}){
 if(s?.mode!=='dungeon'||s.dungeon?.site!=='minor-site'||s.dungeon.floor!==0)return null;
 const story=CAVE_STORY_BY_SITE[s.dungeon.minorId];
 if(!story||Math.abs(s.dungeon.x-13)+Math.abs(s.dungeon.y-13)>2)return null;
 return !includeResolved&&s.flags?.caveStories?.[story.id]?null:story;
}

export function caveStoryView(story,s,button){
 const index=Object.keys(CAVE_STORIES).indexOf(story.id),position=index*25;
 const copy={
  'werebear-dogs':'A broad-shouldered woodsman trembles between human and bear while three lean hunting dogs guard him. He begs for food to settle the pack until the moon-sickness passes.',
  'kobold-hoard':'Grub sits on a mountain of bread, cheese, roots, and smoked fish while hungry kobolds scratch at the barred larder. He offers six meals for ten gold and insists this is charity.',
  'rabbit-dinner':'A white rabbit hangs in a cook’s snare above a simmering pot. The cave cook raises a cleaver and asks whether you are staying for dinner or interfering with it.',
  'flowerhaven-children':'Five frightened children from Flowerhaven huddle behind a crude gate. Their captor sleeps beside the key, certain nobody followed the trail this far.',
  'beaver-household':'An anxious beaver family braces a cracked timber wall as underground water pours into its lodge. They need another pair of hands and enough food to finish the repair.',
 }[story.id];
 const help={'werebear-dogs':'Feed the dogs · 1 meal','kobold-hoard':'Buy six meals · 10 gold','rabbit-dinner':'Free the rabbit','flowerhaven-children':'Rescue the children','beaver-household':'Repair the lodge · 1 meal'}[story.id];
 return `<div class="cave-story-art" role="img" aria-label="${story.title}" style="background-image:url('/assets/cave-stories.webp');background-position:${position}% center"></div><p>${copy}</p><div class="panel-actions">${button(help,{type:'caveStoryChoice',choice:'help'},'primary')}${button('Attack',{type:'caveStoryChoice',choice:'attack'})}${button('Leave',{type:'caveStoryChoice',choice:'leave'})}</div>`;
}

function reward(s,story,note){
 if(!story.reward)return;
 s.bag.push(story.reward);s.pendingLoot.push(story.reward);
 const messages={'rabbit-dinner':'The grateful rabbit digs up a small pearl before bounding away.','flowerhaven-children':'The children give you their emergency Return Scroll.','beaver-household':'The beavers press a polished sapphire into your palm.','werebear-dogs':'The werebear gives you an emerald from his collar.','kobold-hoard':'Behind the smoked fish, you find a sealed Lesser Healing potion.'};
 note(s,messages[story.id]);
}
function fight(s,story,note){
 const enemy={
  'werebear-dogs':{name:'The Moon-Cursed Werebear',speciesId:'cave-werebear',level:12,hp:190,attack:31,armor:8,kind:'brute',weakness:'guard then counter'},
  'kobold-hoard':{name:'Grub the Food-Hoarder',speciesId:'grove-goblin',level:5,hp:75,attack:16,armor:3,kind:'swift',weakness:'quick strikes'},
  'rabbit-dinner':{name:'The Hungry Cave Cook',speciesId:'cave-troll',level:10,hp:160,attack:27,armor:7,kind:'brute',weakness:'guard then counter'},
  'flowerhaven-children':{name:'The Flowerhaven Kidnapper',speciesId:'grove-goblin',level:16,hp:230,attack:38,armor:10,kind:'armored',weakness:'steady pressure'},
  'beaver-household':{name:'The Dam-Breaker',speciesId:'cave-troll',level:18,hp:290,attack:43,armor:12,kind:'brute',weakness:'guard then counter'},
 }[story.id];
 s.enemy={...enemy,maxHp:enemy.hp,gold:20+enemy.level*4,xp:40+enemy.level*9,firstContact:true,combatDistance:1,caveStory:story.id,art:enemy.speciesId==='grove-goblin'?{sheet:'monsters-grove',index:0}:{sheet:'bridge-troll',index:0}};
 s.returnMode='dungeon';s.mode='battle';s.flags.guarded=false;s.flags.combo=0;note(s,enemy.name+' attacks!');
}

export function caveStoryAction(s,a,note){
 if(a.type!=='caveStoryChoice')return false;
 const story=caveStoryAt(s);if(!story)return true;
 s.flags.caveStories??={};
 if(a.choice==='leave'){s.flags.caveStories[story.id]='left';note(s,'You leave '+story.title.toLowerCase()+' behind.');return true;}
 if(a.choice==='attack'){s.flags.caveStories[story.id]='attacked';fight(s,story,note);return true;}
 if(a.choice!=='help')return true;
 if(story.id==='werebear-dogs'){
  if(s.meals<1){note(s,'The dogs need a meal, but your pack is empty.');return true;}
  s.meals--;s.flags.caveStories[story.id]='helped';reward(s,story,note);note(s,'You feed the dogs. Their master steadies himself until the moon-sickness passes.');return true;
 }
 if(story.id==='kobold-hoard'){
  if(s.gold<10){note(s,'Grub demands ten gold for six meals.');return true;}
  s.gold-=10;s.meals+=6;s.flags.caveStories[story.id]='bargained';reward(s,story,note);note(s,'Grub parts with six meals and counts your ten coins twice.');return true;
 }
 if(story.id==='beaver-household'&&s.meals<1){note(s,'You need one meal to keep the household fed while everyone repairs the dam.');return true;}
 if(story.id==='beaver-household'){
  s.meals--;
  adjustAlignment(s,15);
 }
 s.flags.caveStories[story.id]='helped';reward(s,story,note);
 note(s,story.id==='rabbit-dinner'?'You cut the rabbit loose before it becomes dinner.':story.id==='flowerhaven-children'?'You guide every child through the cave and point them toward Flowerhaven.':'You brace the broken timbers until the beaver family seals its underground home. Good alignment +15.');
 return true;
}

export function finishCaveStoryBattle(s,note){
 const id=s.enemy?.caveStory,story=CAVE_STORIES[id];if(!story)return false;
 s.flags.caveStories??={};s.flags.caveStories[id]='defeated';reward(s,story,note);return true;
}

export function validCaveStories(flags){
 if(flags===undefined)return true;
 if(!flags||typeof flags!=='object'||Array.isArray(flags))return false;
 return Object.entries(flags).every(([id,outcome])=>CAVE_STORIES[id]&&['helped','bargained','left','attacked','defeated'].includes(outcome));
}

export function validCaveStoryBattle(s){
 const id=s.enemy?.caveStory;if(id===undefined)return true;
 const story=CAVE_STORIES[id];
 return !!story&&s.mode==='battle'&&s.returnMode==='dungeon'&&s.dungeon?.site==='minor-site'&&s.dungeon.minorId===story.siteId&&s.flags.caveStories?.[id]==='attacked';
}

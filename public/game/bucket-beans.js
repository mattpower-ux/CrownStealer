export const BEANS_MESSAGE="A bleating noise followed by a horrid odor permeates the air around you, igniting any nearby flames, stunning small animals and causing all sentient living creatures to flee for their lives. for 3 rounds. You gasp, but somehow you're ok with having dealt it.";
export const BUCKET_BEANS={id:'bucket-of-beans',name:'Bucket of Beans',kind:'food',shape:'food',rarity:'rare',unique:true,encounterOnly:true,bottomOnly:true,value:20,color:'#bc9455',description:'Eat to unleash an unbearable odor for three rounds. Living foes flee and small animals are stunned; undead and constructs are immune. You are unharmed.'};
const creatureText=e=>[e?.name,e?.speciesId,e?.kind,e?.race,e?.type].filter(Boolean).join(' ');
export function beansEnemyAffected(enemy){
 if(!enemy||enemy.undead||enemy.construct||enemy.living===false)return false;
 return !/\b(?:undead|spectral|ghost|ghosts|ghoul|ghouls|zombie|zombies|skeleton|skeletons|skeletal|lich|liche|liches|wraith|wraiths|revenant|vampire|mummy|construct|golem|golems|automaton|animated armor|animated armour|animated statue)\b/i.test(creatureText(enemy));
}
export const beansEnemyReaction=enemy=>!beansEnemyAffected(enemy)?'immune':/\b(?:rat|rats|mouse|mice|bat|bats|rabbit|squirrel|frog|toad|small animal)\b/i.test(creatureText(enemy))?'stunned':'fleeing';
export const beansBlocksEnemy=s=>(s.flags?.beansRounds||0)>0&&beansEnemyAffected(s.enemy);
export function handleBeansAction(s,a,note,events=[]){
 if(!(a.type==='eatBeans'||a.type==='useItem'&&a.id===BUCKET_BEANS.id))return false;
 const index=s.bag.indexOf(BUCKET_BEANS.id);
 if(index<0||s.mode==='ending'||s.flags.royalQuest==='opening')return true;
 s.bag.splice(index,1);s.pendingLoot=(s.pendingLoot||[]).filter(id=>id!==BUCKET_BEANS.id||s.bag.includes(id));
 s.flags.beansRounds=3;note(s,BEANS_MESSAGE);
 events.push({kind:'beans',target:'hero',amount:0,message:BEANS_MESSAGE,rounds:3});return true;
}
// The engine calls this only AFTER a paid round or successful movement step.
// Keeping the original enemy object preserves wounds, guardian identity and loot.
export function tickBeansRound(s,note){
 if(!(s.flags?.beansRounds>0))return;
 s.flags.beansRounds--;
 if(!s.flags.beansRounds)note(s,'The odor clears. Creatures can approach you again.');
}
export const validBeansState=s=>s.flags?.beansRounds===undefined||Number.isInteger(s.flags.beansRounds)&&s.flags.beansRounds>=0&&s.flags.beansRounds<=3;

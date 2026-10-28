import {TOWNS} from './content.js';
import {gameDay} from './wild-sites.js';
export const MAYORS=['Osbert Quill','Lady Prudence Pout','Barnaby Ribbons','Vera Redbrick','Magnus Rivet','Saffron Haggles','Coraline Whelk','Tobias Wick','Dame Periwinkle','Asta Snowcap','Edmund Cog','Morrow Grey'];
export const DISPUTES=[
 {title:'The Kielbasa Incident',text:'A dog has peed on a man’s Kielbasa Cart. The dog’s owner calls it a review. The sausage seller demands justice.',choices:['Order the owner to clean the cart','Declare the dog an unlicensed food critic','Buy everyone fresh sausages · 10 gold'],reply:['The owner scrubs. The dog receives a stern look and remains unmoved.','The dog is fined one biscuit. The sausage guild promises to remember this.','The crowd cheers. The dog joins the queue.']},
 {title:'The Hat That Wasn’t',text:'A hat vendor sold a hat that immediately fell apart. He insists the customer purchased a portable nest.',choices:['Order a refund','Make the vendor wear it for a week','Pay for a replacement · 10 gold'],reply:['The buyer receives a refund. The vendor calls you an enemy of innovation.','The vendor leaves wearing three feathers and a terrible expression.','Everyone is satisfied except the treasury.']},
 {title:'The Widow’s Basement',text:'A grieving widow’s husband is alive in her locked basement. He has been shouting through the potato hatch for eleven years.',choices:['Free him and order an investigation','Ask Giacomo to investigate the marriage','Pay a locksmith · 10 gold'],reply:['The husband emerges. His first complaint concerns the soup.','Giacomo already has a dossier. Of course she does.','The door opens. The widow asks whether the locksmith offers a loyalty discount.']}
];
export const cityOf=(s,id=s.location)=>s.cities?.[id];
export function claimCity(s,note){const id=s.location;if(cityOf(s,id))return;const day=gameDay(s);s.cities??={};s.cities[id]={claimed:day,paidThrough:day,tribute:'waiting',deadline:day+10,guards:0,destroyed:false,disputes:0,case:null};note(s,MAYORS[TOWNS.findIndex(t=>t.id===id)]+' yields the Key to '+TOWNS.find(t=>t.id===id).name+'. You receive a free house, 500 gold each 30-day month, and Giacomo: maid, royal spy, and collector of other people’s business.');}
export function cityTick(s,note,random){
 const day=gameDay(s);
 for(const [id,city] of Object.entries(s.cities||{})){
  const town=TOWNS.find(t=>t.id===id);
  if(city.tribute==='waiting'&&day>=city.claimed+7){city.tribute='demand';note(s,'Giacomo’s message from '+town.name+': two level-50 royal guards demand 300 gold. Pay 300 gold before refusing, or send 1,000 gold to the King through Giacomo by day '+(city.deadline+1)+'. Refusal risks a 50% chance they burn the town.');}
  if(['demand','refused'].includes(city.tribute)&&day>=city.deadline&&s.enemy?.tributeTown!==id){city.tribute='resolved';city.destroyed=random()<.5;note(s,city.destroyed?town.name+' burns. Shops and monthly income stop until you rebuild. Giacomo saved your house keys, and suspiciously little else.':town.name+' escapes the threatened fire. The guards drank their lamp oil money and went home.');if(city.destroyed&&s.location===id&&s.mode==='town'){s.mode='world';s.location=null;s.x=town.x-1;s.y=town.y;delete s.casino;}if(city.destroyed)city.paidThrough=day;}
  if(!city.destroyed){const months=Math.floor((day-city.paidThrough)/30);if(months>0){const amount=months*500;s.gold=Math.min(10000000,s.gold+amount);city.paidThrough+=months*30;note(s,town.name+' pays '+amount+' gold in mayoral income.');}}
 }
}
export function cityAction(s,a,note,startGuard){
 if(!['claimCity','cityRest','cityDispute','cityPay','cityRoyalPayment','cityFight','cityRefuse','cityRebuild'].includes(a.type))return false;
 if(s.casino?.active)return true;
 if(s.mode!=='town'&&!(s.mode==='world'&&a.type==='cityRebuild'))return true;
 const town=TOWNS.find(t=>t.id===s.location)||(a.type==='cityRebuild'?TOWNS.find(t=>t.region===s.region&&t.x===s.x&&t.y===s.y):null);if(!town)return true;
 const city=cityOf(s,town.id);
 if(a.type==='claimCity'){if(s.flags['townGarrison:'+town.id])claimCity(s,note);else note(s,'Defeat this town’s guards before demanding its key.');return true;}
 if(!city)return true;
 if(a.type==='cityRebuild'){if(city.destroyed&&s.gold>=500){s.gold-=500;city.destroyed=false;city.paidThrough=gameDay(s);note(s,'The townspeople rebuild. Shops reopen and the monthly income clock resumes.');}else note(s,'Rebuilding requires 500 gold.');return true;}
 if(city.destroyed)return true;
 if(a.type==='cityRest'){s.turns++;s.hp=s.maxHp;city.case=city.disputes%DISPUTES.length;note(s,'Giacomo wakes you at '+['2 a.m.','midnight','4 a.m.'][city.disputes%3]+': “Your Worship! Another emergency. And the king sends his regards.” '+DISPUTES[city.case].text);}
 if(a.type==='cityDispute'&&city.case!==null&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<3){if(a.choice===2&&s.gold<10){note(s,'You need 10 gold to settle this from your purse.');return true;}if(a.choice===2)s.gold-=10;s.reputation+=a.choice===1?-1:1;note(s,DISPUTES[city.case].reply[a.choice]);city.disputes++;city.case=null;}
 if(['demand','refused'].includes(city.tribute)){
  if(a.type==='cityPay'&&city.tribute==='demand'&&gameDay(s)<city.deadline){if(s.gold>=300){s.gold-=300;city.tribute='paid';note(s,'The two guards take 300 gold and withdraw their threat.');}else note(s,'The guards demand the full 300 gold.');}
  if(a.type==='cityRoyalPayment'&&city.tribute==='refused'&&gameDay(s)<city.deadline){if(s.gold>=1000){s.gold-=1000;city.tribute='pardoned';note(s,'Giacomo delivers 1,000 gold to King Malachi the Ineffable and returns with his sealed pardon. This town is guaranteed safe from the threatened burning.');}else note(s,'Giacomo requires the full 1,000 gold for the King. The fire threat remains.');}
  if(a.type==='cityRefuse'){city.tribute='refused';note(s,'The guards promise to return. Only sending 1,000 gold to the King through Giacomo before day '+(city.deadline+1)+' guarantees safety. Killing the guards will not cancel the 50% fire risk.');}
  if(a.type==='cityFight'&&city.guards<2){city.tribute='refused';note(s,'Fighting refuses the initial payment. Even victory leaves the royal fire threat in force. Only 1,000 gold sent through Giacomo before the deadline guarantees safety.');startGuard(s);s.enemy.tributeTown=town.id;s.enemy.name='Royal Tax Guard '+(city.guards+1)+' of 2';}
 }
 return true;
}
export function validateCities(s){
 s.cities??={};if(!s.cities||typeof s.cities!=='object'||Array.isArray(s.cities))throw Error('Invalid cities.');
 for(const [id,c] of Object.entries(s.cities)){if(!TOWNS.some(t=>t.id===id)||!c||!['waiting','demand','refused','paid','defeated','pardoned','resolved'].includes(c.tribute)||typeof c.destroyed!=='boolean'||![0,1,2].includes(c.guards)||!(c.case===null||[0,1,2].includes(c.case)))throw Error('Invalid city rule.');for(const key of ['claimed','paidThrough','deadline','disputes'])if(!Number.isInteger(c[key])||c[key]<0||c[key]>100000000)throw Error('Invalid city calendar.');}
}

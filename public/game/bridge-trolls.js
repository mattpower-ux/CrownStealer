import {itemById} from './items.js';
const gearKinds=new Set(['weapon','armor','shield','head','hands','boots','ring','necklace']);
export function startBridgeTroll(s,key,note,previous={x:s.x,y:s.y}){
 if(s.mode!=='world'||s.flags.bridgeTrollPaid?.includes(key)||s.flags.bridgeTroll)return false;
 s.flags.bridgeTroll={key,x:s.x,y:s.y,backX:previous.x,backY:previous.y,toll:500+s.region*250};
 note(s,'A bridge troll blocks the crossing. Pay '+s.flags.bridgeTroll.toll+' gold, surrender a piece of gear, or hear his alternatives.');return true;
}
export function maybeBridgeTroll(s,previous,tileAt,note){
 if(s.mode!=='world'||previous.mode!=='world'||s.region!==previous.region||(s.exploration?.area??null)!==(previous.exploration?.area??null)||s.x===previous.x&&s.y===previous.y||tileAt(s.x,s.y)!=='bridge'||tileAt(previous.x,previous.y)==='bridge')return false;
 // Both banks belong to one toll crossing, including three-tile-wide rivers.
 const queue=[{x:s.x,y:s.y}],seen=new Set();
 for(const p of queue){const key=p.x+','+p.y;if(seen.has(key))continue;seen.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy;if(x>0&&x<127&&y>0&&y<95&&!seen.has(x+','+y)&&tileAt(x,y)==='bridge')queue.push({x,y});}}
 queue.sort((a,b)=>a.y-b.y||a.x-b.x);const anchor=queue[0];
 return startBridgeTroll(s,(s.exploration?.area??'r'+s.region)+':'+anchor.x+':'+anchor.y,note,previous);
}
export function bridgeTrollGear(s){return s.bag.filter(id=>gearKinds.has(itemById(id,s)?.kind)&&!Object.entries(s).some(([key,value])=>key.startsWith('equipped')&&value===id)&&!itemById(id,s)?.unique);}
export function bridgeTrollAction(s,a,note){
 const troll=s.flags.bridgeTroll;if(!troll||s.mode!=='world')return false;
 if(a.type!=='bridgeTroll')return ['move','mapStep','enter'].includes(a.type);
 if(a.choice==='leave'){s.x=troll.backX;s.y=troll.backY;delete s.flags.bridgeTroll;note(s,'You retreat from the troll bridge.');return true;}
 if(a.choice==='quest'){troll.quest=true;note(s,'“Bring me the shadow of tomorrow, bottled before yesterday. Then I shall consider a discount.” The errand is impossible.');return true;}
 if(a.choice==='gold'){if(s.gold<troll.toll){note(s,'The troll insists on the entire toll.');return true;}s.gold-=troll.toll;}
 else if(a.choice==='gear'){if(!bridgeTrollGear(s).includes(a.id)){note(s,'Choose an unequipped piece of gear to surrender.');return true;}s.bag.splice(s.bag.indexOf(a.id),1);s.pendingLoot=s.pendingLoot.filter(id=>id!==a.id||s.bag.includes(id));}
 else if(a.choice==='sleep'||a.choice==='fight'){
  s.returnMode='world';s.mode='battle';const level=4+s.region*6,hp=90+s.region*65;
  s.enemy={speciesId:'bridge-troll',name:'Bridge Troll',level,hp,maxHp:hp,attack:12+s.region*7,armor:3+s.region*3,gold:troll.toll,xp:55+s.region*45,kind:'brute',weakness:'quick strikes',firstContact:true,bridgeTrollKey:troll.key,bridgeApproach:{x:troll.backX,y:troll.backY,atX:troll.x,atY:troll.y,region:s.region,area:s.exploration?.area??null},art:{sheet:'monsters-grove',index:4}};
  delete s.flags.bridgeTroll;s.flags.guarded=false;s.flags.combo=0;
  if(a.choice==='sleep'){s.hp=Math.max(1,s.hp-Math.ceil(s.maxHp*.15));note(s,'The troll offers a free bed in his cave. As you drift off he leaps from the shadows! You scramble awake, wounded, beside the bridge.');}else note(s,'The bridge troll raises his club.');return true;
 }else return true;
 s.flags.bridgeTrollPaid??=[];s.flags.bridgeTrollPaid.push(troll.key);delete s.flags.bridgeTroll;s.turns++;note(s,'The troll pockets your toll and allows you across.');return true;
}
export function bridgeTrollView(s,button,esc){const t=s.flags.bridgeTroll;if(!t)return '';return '<h3>The keeper of the bridge</h3><p>“'+t.toll+' gold. Or a piece of your gear. I also have a little errand—or a perfectly safe cave where you can sleep.”</p>'+(t.quest?'<p>Bring the shadow of tomorrow, bottled before yesterday. No such object exists.</p>':'')+'<div class="panel-actions">'+button('Pay '+t.toll+' gold',{type:'bridgeTroll',choice:'gold'},'primary',s.gold<t.toll)+bridgeTrollGear(s).map(id=>button('Give '+esc(itemById(id,s).name),{type:'bridgeTroll',choice:'gear',id})).join('')+button('Ask about the errand',{type:'bridgeTroll',choice:'quest'})+button('Sleep in his cave',{type:'bridgeTroll',choice:'sleep'})+button('Fight the troll',{type:'bridgeTroll',choice:'fight'})+button('Turn back',{type:'bridgeTroll',choice:'leave'})+'</div>';}
export function validBridgeTrollState(s){
 const validKey=key=>typeof key==='string'&&/^(?:r[0-3]|wild-(?:[0-9]|1[01])):[0-9]{1,3}:[0-9]{1,3}$/.test(key);
 const paid=s.flags.bridgeTrollPaid;
 if(paid!==undefined&&(!Array.isArray(paid)||paid.length>2000||paid.some(key=>!validKey(key))||new Set(paid).size!==paid.length))return false;
 const bank=s.enemy?.bridgeApproach;if(bank&&(!Number.isInteger(bank.x)||bank.x<1||bank.x>126||!Number.isInteger(bank.y)||bank.y<1||bank.y>94||!Number.isInteger(bank.atX)||bank.atX<1||bank.atX>126||!Number.isInteger(bank.atY)||bank.atY<1||bank.atY>94||bank.region!==s.region||(bank.area??null)!==(s.exploration?.area??null)))return false;
 const t=s.flags.bridgeTroll;
 return t===undefined||!!t&&s.mode==='world'&&validKey(t.key)&&['x','y','backX','backY'].every(k=>Number.isInteger(t[k])&&t[k]>=1&&t[k]<=126)&&t.x===s.x&&t.y===s.y&&Number.isInteger(t.toll)&&t.toll===500+s.region*250&&(t.quest===undefined||t.quest===true);
}

export const FIREHAVEN_AREA='wild-4';
export const FIREHAVEN_SITE={
 id:'firehaven',kind:'firehaven',name:'Firehaven',region:1,x:92,y:52,
};

export const FIREHAVEN_STOCK=[
 {id:'wyrmbane-spear',kind:'weapon',family:'spear',shape:'spear',tier:3,rarity:'epic',name:'Wyrmbane Spear',damage:[20,30],toHit:4,dragonMultiplier:2,color:'#f4d48a',value:900,description:'A ballista-smith’s spear. Deals double damage to dragons, drakes, wyrms and fire lizards.'},
 {id:'potion-cinder-ward',kind:'potion',shape:'potion',rarity:'rare',name:'Cinder-Ward Draught',effect:'heatWard',durationMoves:20,fireResistance:.5,color:'#d76234',value:180,description:'Reduces fire damage by 50% for 20 moves or combat actions.'},
 {id:'scroll-everlight',kind:'scroll',shape:'scroll',rarity:'rare',name:'Scroll of Everlight',effect:'everlight',durationMoves:60,color:'#ffe7a0',value:240,description:'Fills volcanic lairs with steady magical light for 60 moves or combat actions.'},
];

export const FIREHAVEN_ITEMS=Object.fromEntries(FIREHAVEN_STOCK.map(item=>[item.id,item]));

export function firehavenTerrain(area,x,y){
 if(area!==FIREHAVEN_AREA)return null;
 const dx=x-FIREHAVEN_SITE.x,dy=y-FIREHAVEN_SITE.y;
 if(Math.abs(dy)<=1&&dx>=-28&&dx<=2)return dx<-10?'grass':dx<-2?'bridge':'grass';
 if(dx*dx/100+dy*dy/36<=1)return dx*dx+dy*dy<=9?'grass':'water';
 return null;
}

const atFirehaven=s=>s?.mode==='world'&&s.exploration?.area===FIREHAVEN_AREA&&s.x===FIREHAVEN_SITE.x&&s.y===FIREHAVEN_SITE.y;
const removeOne=(s,id)=>{const index=s.bag.indexOf(id);if(index<0)return false;s.bag.splice(index,1);s.pendingLoot=s.pendingLoot?.filter(item=>item!==id||s.bag.includes(id))??[];return true;};

export function firehavenAction(s,a,note=()=>{}){
 if(a?.type==='buyFirehaven'){
  const item=FIREHAVEN_ITEMS[a.id];
  if(!atFirehaven(s)||!item)return false;
  if(s.gold<item.value){note('The quartermaster requires '+item.value+' gold.');return true;}
  s.gold-=item.value;s.bag.push(item.id);note('Purchased '+item.name+'.');return true;
 }
 if(a?.type==='useItem'&&a.id==='potion-cinder-ward'&&s.bag.includes(a.id)){
  removeOne(s,a.id);s.flags.heatWardMoves=20;note('Cinder-Ward cools your blood. Fire cannot bite as deeply.');return true;
 }
 if(a?.type==='useItem'&&a.id==='scroll-everlight'&&s.bag.includes(a.id)){
  removeOne(s,a.id);s.flags.everlightMoves=60;note('Everlight gathers around you and reveals the dark volcanic stone.');return true;
 }
 return false;
}

export const firehavenFireResistance=s=>s?.flags?.heatWardMoves>0?.5:0;
export const firehavenLightMultiplier=(s,profile)=>profile?.meltedStone&&s?.flags?.everlightMoves>0?1.55:1;
export const wyrmbaneMultiplier=(weapon,enemy)=>{
 const multiplier=weapon?.dragonMultiplier??(weapon?.id==='wyrmbane-spear'?2:1);
 return multiplier>1&&/dragon|drake|wyrm|fire[ -]?lizard/i.test(enemy?.speciesId+' '+enemy?.name)?multiplier:1;
};

export function firehavenView(state,itemArt,button){
 const wares=FIREHAVEN_STOCK.map(item=>`<article class="shop-item">${itemArt(item)}<h3>${item.name}</h3><p>${item.description}</p>${button('Buy · '+item.value+' gold',{type:'buyFirehaven',id:item.id},'',state.gold<item.value)}</article>`).join('');
 return `<div class="firehaven-view"><div class="firehaven-fort" role="img" aria-label="Firehaven palisade and lake-facing ballistas"><span class="firehaven-ballista left"></span><span class="firehaven-ballista right"></span></div><h3>The last holdfast of Ashen Reach</h3><p>Firehaven stands inside a lake behind a timber palisade. Crews keep loaded ballistas trained on the smoky sky while descendants of the horse-kings prepare hunters for the melted tunnels.</p><div class="shop-grid">${wares}</div></div>`;
}

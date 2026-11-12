import {ARENA_LAYOUTS,SPECIALTY_SHOP_LAYOUTS,TOWN_LAYOUTS} from './town-layouts.js';
import {merchantPlaces} from './merchant-catalog.js';
// Shared town geometry keeps entrances, collision, touch movement and art aligned.
export const TOWN_SIZE=13;
export const TOWN_PLACES=[
 {id:'inn',name:'The Lantern Inn',x:3,y:5,art:0,bx:2,by:3,bw:2,bh:2},
 {id:'shop',name:'Market',x:9,y:5,art:1,bx:8,by:3,bw:2,bh:2},
 {id:'casino',name:'The Gilded Goose Gambling House',x:3,y:8,art:2,bx:2,by:6,bw:2,bh:2},
 {id:'court',name:'Court & Watch',x:9,y:8,art:3,bx:8,by:6,bw:2,bh:2},
 {id:'quests',name:'Odd Jobs',x:3,y:11,art:0,bx:2,by:9,bw:2,bh:2},
 {id:'talk',name:'Gossip in the Square',x:6,y:4,art:3,bx:5,by:2,bw:2,bh:2},
 {id:'fortune',name:'Fortune Teller',x:10,y:11,art:5,bx:9,by:9,bw:2,bh:2},
 {id:'gate',name:'Leave town',x:6,y:12,art:7}
];
export function townPosition(s){return s.townPosition||{x:6,y:11};}
export function townPlace(s){const p=townPosition(s);return townPlaces(s).find(b=>b.x===p.x&&b.y===p.y);}
// The painted northeast bridge crosses Mothbridge's east wall on row two.
export function townExitAt(x,y,s=null){return x===6&&y===12||s?.location==='mothbridge'&&x===12&&y===2;}
export function townWalkable(x,y,s=null){if(townExitAt(x,y,s))return true;if(x<1||x>11||y<1||y>11)return false;return !townPlaces(s).some(b=>b.bw&&x>=b.bx&&x<b.bx+b.bw&&y>=b.by&&y<b.by+b.bh);}

function placeAt(place,footprint){
 if(!footprint)return {...place};
 const [bx,by]=footprint;
 return {...place,bx,by,x:bx+Math.floor(place.bw/2),y:by+place.bh};
}

export function townPlaces(s){
 const town=s?.location;
 const layout=TOWN_LAYOUTS[town];
 const [primary,secondary]=merchantPlaces(town);
 const result=TOWN_PLACES.map(place=>{
  const building=place.id==='shop'&&primary?{...place,...primary}:place;
  const narrowCasino=town==='mothbridge'&&place.id==='casino';
  return placeAt(narrowCasino?{...building,bw:1,artWidth:2}:building,layout?.[place.id]);
 });
 const specialty=Object.hasOwn(SPECIALTY_SHOP_LAYOUTS,town)?SPECIALTY_SHOP_LAYOUTS[town]:null;
 if(secondary&&specialty)result.push(placeAt({...secondary,art:1,bw:2,bh:2},specialty));
 const arena=Object.hasOwn(ARENA_LAYOUTS,town)?ARENA_LAYOUTS[town]:null;
 if(arena)result.push(placeAt({id:'arena',name:town==='bellwether'?'Coliseum':'Gladiator Pit',art:3,bw:2,bh:2},arena));
 if(town==='mothbridge')result.find(place=>place.id==='fortune').name='Sage of Wonk';
 return result;
}

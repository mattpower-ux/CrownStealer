export const PEBBLE_RUN_ID='minor-r0-15';
export const EARTH_DEGREE={
 id:'peebles-mit-degree',name:'Honorary Degree from MIT',kind:'curio',shape:'book',
 rarity:'rare',unique:true,bottomOnly:true,notForSale:true,value:0,color:'#e3cf9d',
 description:'Professor Peebles made good on his promise. You still have no idea what a degree is.'
};
export const EARTH_COORDINATES='Sol · third planet · dimensional offset zero';
export const isPebbleRun=d=>d?.site==='minor-site'&&d.minorId===PEBBLE_RUN_ID;
export const peeblesTravelsWith=s=>s.flags?.peebles==='traveling';
export const canVisitEarth=s=>s.mode==='dungeon'&&s.dungeon?.ship&&Math.abs(s.dungeon.x-7)+Math.abs(s.dungeon.y-5)<=7&&s.flags?.earthCoordinates===true;

export function peeblesResident(s){
 if(!isPebbleRun(s.dungeon)||['traveling','home'].includes(s.flags?.peebles))return null;
 return {x:13,y:13,name:'Professor Peebles'};
}

export function canSpeakToPeebles(s){
 const resident=peeblesResident(s);
 return s.mode==='dungeon'&&resident&&Math.abs(resident.x-s.dungeon.x)+Math.abs(resident.y-s.dungeon.y)<=1;
}

export function peeblesAction(s,a,note){
 if(a.type==='peeblesRelease'){
  if(peeblesTravelsWith(s)&&['world','town','dungeon'].includes(s.mode)){
   s.flags.peebles='waiting';delete s.flags.peeblesStride;
   note(s,'Professor Peebles returns to Pebble Run Cave. You keep his coordinates for Earth.');
  }
  return true;
 }
 if(a.type==='visitEarth'){
  if(!canVisitEarth(s))return true;
  if(peeblesTravelsWith(s)){
   s.flags.peebles='home';delete s.flags.peeblesStride;
   if(!s.bag.includes(EARTH_DEGREE.id))s.bag.push(EARTH_DEGREE.id);
   note(s,'Professor Peebles steps onto Earth and keeps his promise. You receive an honorary degree from MIT.');
  }else note(s,'The spacecraft touches down on Earth, the world named in the professor’s equations.');
  return true;
 }
 if(a.type==='attack'&&canSpeakToPeebles(s)){
  s.flags.peeblesSurrender=true;
  note(s,'Professor Peebles drops his chalk and throws up his hands. “I surrender! Please, have mercy!”');
  return true;
 }
 if(!['peeblesRecruit','peeblesDecline'].includes(a.type))return false;
 if(!canSpeakToPeebles(s))return true;
 if(a.type==='peeblesDecline'){
  s.flags.peebles='declined';
  note(s,'Professor Peebles sits in a corner and starts to cry.');
 }else{
  s.flags.peebles='traveling';s.flags.earthCoordinates=true;
  note(s,'Professor Peebles joins you and gives you Earth’s interdimensional coordinates. Your travel speed is halved.');
 }
 return true;
}

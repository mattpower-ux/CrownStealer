export const WORLD_SCALE=4,WORLD_WIDTH=128,WORLD_HEIGHT=96,WORLD_MAP_VERSION=2;
export const worldSize=s=>s.exploration?.area?.startsWith('planet-')?{width:32,height:24}:{width:WORLD_WIDTH,height:WORLD_HEIGHT};
export const scaleWorldPoint=p=>({...p,x:p.x*WORLD_SCALE,y:p.y*WORLD_SCALE});
export function migrateWorldSize(s){
 if(s.worldMapVersion===WORLD_MAP_VERSION)return;
 if(s.worldMapVersion!==undefined&&s.worldMapVersion!==1)throw Error('Invalid world map version.');
 if(!s.exploration?.area?.startsWith('planet-')){s.x*=WORLD_SCALE;s.y*=WORLD_SCALE;}
 if(s.exploration?.home)s.exploration.home=scaleWorldPoint(s.exploration.home);
 if(s.flags.travelMerchant)s.flags.travelMerchant=scaleWorldPoint(s.flags.travelMerchant);
 for(const key of Object.keys(s.flags)){
  const match=/^metalTree:(wild-\d+|[0-3]):(\d+):(\d+)$/.exec(key);
  if(match){const value=s.flags[key];delete s.flags[key];s.flags[`metalTree:${match[1]}:${Number(match[2])*4}:${Number(match[3])*4}`]=value;}
 }
 s.worldMapVersion=WORLD_MAP_VERSION;
}

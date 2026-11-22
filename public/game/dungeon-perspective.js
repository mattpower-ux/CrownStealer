export function dungeonFloorBaseline(height,depth){
 return Math.min(height*.95,height*.5+height*.41/Math.max(.01,depth));
}

import {REGIONS,TOWNS,DUNGEONS} from './content.js';
// Original short motifs; each location gets its own contour, harmony and pauses.
const motifs=[[0,2,4,2,5,4,1,0],[4,3,1,2,0,2,3,1],[0,4,3,5,2,1,4,0],[2,1,0,3,4,6,5,2],[0,1,3,2,4,2,5,3],[4,2,0,1,3,5,2,0]];
function compose(index,kind){const dark=kind==='dungeon',warm=kind==='town',scale=dark?[0,1,3,5,7,8,10]:warm?[0,2,4,5,7,9,11]:[[0,2,4,7,9,12,14],[0,2,3,5,7,8,10],[0,2,4,6,7,9,11],[0,2,3,5,7,9,10]][index%4];const tonic=(dark?48:warm?60:57)+[0,2,5,-2,3,7][index%6];const melody=[];for(let bar=0;bar<4;bar++){const motif=motifs[(index+bar)%motifs.length];for(let beat=0;beat<8;beat++){const rest=dark?(beat%3!==0||(bar+beat+index)%5===0):(beat+bar+index)%7===6;const degree=(motif[beat]+(bar===2?2:0))%7;melody.push(rest?null:tonic+scale[degree]);}}return {bpm:dark?50+(index%6)*3:warm?78+(index%7)*3:92+index*6,melody,roots:[tonic-24,tonic-24+scale[(index+3)%7],tonic-24+scale[(index+5)%7],tonic-17],mood:dark?'hushed':warm?'warm':'walking',gain:dark?.55:warm?.65:.8,third:dark?3:4,lead:dark?'sine':'triangle'};}
export const LOCATION_THEMES=Object.freeze(Object.fromEntries([
 ...REGIONS.map((r,i)=>['land:'+r.id,compose(i,'land')]),
 ...TOWNS.map((t,i)=>['town:'+t.id,compose(i,'town')]),
 ...DUNGEONS.map((d,i)=>['dungeon:'+i,compose(i,'dungeon')]),
 ['dungeon:elf-village',compose(10,'dungeon')],['dungeon:cell',compose(8,'dungeon')],['dungeon:sewer',compose(9,'dungeon')]
]));
export function musicScene(s,panel){if(panel==='casino')return 'casino';if(!s)return 'title';if(s.mode==='battle')return 'battle';if(s.mode==='ending')return 'victory';if(s.mode==='dungeon')return 'dungeon:'+(s.dungeon?.site||s.dungeon?.royal||s.dungeon?.index||0);if(s.mode==='town')return 'town:'+s.location;return 'land:'+s.region;}


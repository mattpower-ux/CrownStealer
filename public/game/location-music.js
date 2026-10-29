import {areaFor} from './exploration.js';
import {REGIONS,TOWNS,DUNGEONS} from './content.js';
// Original short motifs; each location gets its own contour, harmony and pauses.
const motifs=[[0,2,4,2,5,4,1,0],[4,3,1,2,0,2,3,1],[0,4,3,5,2,1,4,0],[2,1,0,3,4,6,5,2],[0,1,3,2,4,2,5,3],[4,2,0,1,3,5,2,0]];
function compose(index,kind){if(kind==='dungeon')return dungeonScore(index);const dark=kind==='dungeon',warm=kind==='town',scale=dark?[0,1,3,5,7,8,10]:warm?[0,2,4,5,7,9,11]:[[0,2,4,7,9,12,14],[0,2,3,5,7,8,10],[0,2,4,6,7,9,11],[0,2,3,5,7,9,10]][index%4];const tonic=(dark?60:warm?60:57)+[0,2,5,-2,3,7][index%6]+(dark?Math.floor(index/6)*2:0);const melody=[];for(let bar=0;bar<4;bar++){const motif=motifs[(index+bar)%motifs.length];for(let beat=0;beat<8;beat++){const rest=dark?(beat%2!==0):(beat+bar+index)%7===6;const degree=(motif[beat]+(bar===2?2:0))%7;melody.push(rest?null:tonic+scale[degree]);}}return {bpm:dark?50+(index%6)*3:warm?78+(index%7)*3:92+index*6,melody,roots:[tonic-24,tonic-24+scale[(index+3)%7],tonic-24+scale[(index+5)%7],tonic-17],mood:dark?'hushed':warm?'warm':'walking',gain:dark?1.15:warm?.8:.9,third:dark?3:4,lead:dark?'triangle':warm?(index%3===0?'sine':'triangle'):['triangle','sawtooth','sine','sine'][index%4],bass:dark?'sine':warm?'triangle':['triangle','sawtooth','sine','sine'][index%4],noteLength:dark?2.2:warm?.38:[.8,.42,1.6,1.9][index%4],drums:!dark&&!warm&&index<2,bells:!dark&&(warm||index>1),drone:dark||!warm&&index===3};}
export const LOCATION_THEMES=Object.freeze(Object.fromEntries([
 ...REGIONS.map((r,i)=>['land:'+r.id,compose(i,'land')]),
 ...TOWNS.map((t,i)=>['town:'+t.id,compose(i,'town')]),
 ...DUNGEONS.map((d,i)=>['dungeon:'+i,compose(i,'dungeon')]),
 ['dungeon:elf-village',compose(10,'dungeon')],['dungeon:cell',compose(8,'dungeon')],['dungeon:sewer',compose(9,'dungeon')]
]));
export function musicScene(s,panel){if(panel==='casino')return 'casino';if(!s)return 'title';if(s.mode==='battle')return 'battle';if(s.mode==='ending')return 'victory';if(s.mode==='dungeon')return 'dungeon:'+(s.dungeon?.site||s.dungeon?.royal||s.dungeon?.index||0);if(s.mode==='town')return s.location==='bellwether'?'title':'town:'+s.location;const area=areaFor(s);if(area?['planet-0','wild-2','wild-3','wild-4','wild-8'].includes(area.id):s.region===1)return 'desert';return 'land:'+s.region;}


// Sixteen evolving phrases, rather than a four-bar tune. No recorded audio assets.
function dungeonScore(index){
 const tonic=45+[0,2,-2,3,1,-4][index%6],scale=[0,1,3,6,7,8,10];
 let seed=9187+index*733;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const melody=[],roots=[];
 for(let phrase=0;phrase<16;phrase++){
  const root=tonic-12+[0,-1,-5,-3,0,1,-6,-1][(phrase+index)%8];roots.push(root,root);
  for(let beat=0;beat<16;beat++){
   const sparse=phrase%4===3?.85:.62;
   melody.push(beat===15||random()<sparse?null:tonic+scale[Math.floor(random()*scale.length)]+(phrase%5===4?12:0));
  }
 }
 return {bpm:50+index%4*2,melody,roots,mood:'hushed',gain:1.05,ambient:true,lead:'triangle',bass:'sine',noteLength:3.6,drums:false,bells:false,drone:true};
}

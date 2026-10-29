const atlas=new Image();atlas.src='/assets/salt-choir-buildings.webp';
export const saltChoirReady=()=>atlas.complete&&atlas.naturalWidth>0;
const cells={inn:0,shop:1,casino:2,court:3,quests:4,fortune:5,gate:6,well:7};
export function drawSaltChoirIcon(c,kind,x,y,w,h){if(!saltChoirReady()||cells[kind]===undefined)return false;const i=cells[kind],sw=atlas.naturalWidth/4,sh=atlas.naturalHeight/2;c.drawImage(atlas,i%4*sw+8,Math.floor(i/4)*sh+8,sw-16,sh-16,x,y,w,h);return true;}

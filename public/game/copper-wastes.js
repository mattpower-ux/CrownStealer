export const COPPER_WASTES='wild-3';
export const COPPER_WASTES_HISTORY='The goblin clans stole the Copper Wastes from the dwarves after a generation-long siege. The surviving dwarves sealed their forges and marched away, leaving deep copper and gold mines, vaulted roads, carved halls, and beautiful underground cities beneath the goblin camps.';

const species=[
 ['copper-goblin-scout','Copper Wastes Goblin Scout','swift',12],
 ['copper-goblin-miner','Goblin Miner','brute',13],
 ['copper-goblin-sapper','Goblin Tunnel Sapper','swift',14,'fire'],
 ['copper-goblin-shield','Goblin Dwarf-Shield Thief','armored',15],
 ['copper-goblin-rune','Goblin Rune Defacer','spectral',16],
 ['copper-goblin-cart','Goblin Minecart Raider','swift',16],
 ['copper-goblin-forge','Goblin Forge Robber','armored',17,'fire'],
 ['copper-goblin-city','Goblin Under-City Guard','armored',18],
 ['copper-goblin-boss','Goblin Mine Boss','brute',19],
 ['copper-goblin-king','Goblin King of the Stolen Halls','brute',20],
];
export const COPPER_GOBLINS=species.map(([id,name,kind,level,element])=>({id,name,kind,level,element,region:1,wild:true,goblin:true,weakness:kind==='armored'?'steady pressure':kind==='brute'?'guard then counter':'quick strikes'}));
export const COPPER_GOBLIN_LAIRS=['Goblin Copper Dig','Goblin-Occupied Dwarven Mine','Goblin Minecart Shaft','Goblin Forge Camp','Goblin Under-City Gate','Goblin Smelter Den','Goblin Gold-Seam Dig','Goblin Hall of Stolen Hammers'];
export const isCopperWastes=state=>state?.exploration?.area===COPPER_WASTES||state?.dungeon?.expedition?.startsWith(COPPER_WASTES+'-cave-')||state?.dungeon?.minorId?.startsWith('minor-w3-');

export function drawCopperWastesOccupation(c,w,h,state){
 if(!isCopperWastes(state)||!state.dungeon)return;
 c.save();
 // Surviving dwarven architecture: nested bronze arches and disciplined masonry.
 c.strokeStyle='#b88950aa';c.lineWidth=Math.max(3,w/260);for(let i=0;i<4;i++){const inset=w*(.08+i*.045),base=h*(.83-i*.035);c.beginPath();c.moveTo(inset,base);c.lineTo(inset,h*.34);c.quadraticCurveTo(w/2,h*(.08+i*.02),w-inset,h*.34);c.lineTo(w-inset,base);c.stroke();}
 c.fillStyle='#d3a45d';for(let i=0;i<7;i++){const x=w*(.18+i*.105);c.fillRect(x,h*.19,w*.008,h*.18);c.beginPath();c.arc(x+w*.004,h*.19,w*.012,0,Math.PI*2);c.fill();}
 // Goblin occupation: patched banners and crude paint laid over the precise halls.
 for(const [x,color] of [[.23,'#6e321f'],[.72,'#4e5e25']]){c.fillStyle=color;c.beginPath();c.moveTo(w*x,h*.2);c.lineTo(w*(x+.09),h*.22);c.lineTo(w*(x+.07),h*.43);c.lineTo(w*(x+.045),h*.39);c.lineTo(w*(x+.02),h*.44);c.closePath();c.fill();c.strokeStyle='#d9c16b';c.lineWidth=2;c.beginPath();c.moveTo(w*(x+.02),h*.26);c.lineTo(w*(x+.065),h*.36);c.moveTo(w*(x+.065),h*.26);c.lineTo(w*(x+.02),h*.36);c.stroke();}
 c.strokeStyle='#596047';c.lineWidth=Math.max(2,w/400);c.beginPath();c.moveTo(w*.12,h*.82);c.lineTo(w*.42,h*.59);c.lineTo(w*.58,h*.59);c.lineTo(w*.88,h*.82);c.moveTo(w*.18,h*.86);c.lineTo(w*.45,h*.64);c.lineTo(w*.55,h*.64);c.lineTo(w*.82,h*.86);c.stroke();
 c.restore();
}

export const WHISPERING_BARRENS='wild-2';

const infernal=[
 ['barrens-imp','Cinder Imp','swift',16,'fire'],
 ['barrens-gargoyle','Defiled Gargoyle','armored',17],
 ['barrens-harpy','Ash-Wing Harpy','swift',18],
 ['barrens-dark-spirit','Barrens Dark Spirit','spectral',19],
 ['barrens-abyss-tender','Abyss Tender','spectral',20,'fire'],
 ['barrens-lesser-demon','Lesser Demon','brute',21,'fire'],
 ['barrens-lesser-devil','Lesser Devil','armored',22,'fire'],
 ['barrens-succubus','Barrens Succubus','swift',23],
 ['barrens-soul-crusher','Soul Crusher','brute',24],
 ['barrens-ash-elemental','Ash Elemental','spectral',25,'fire'],
 ['barrens-stone-elemental','Grieving Stone Elemental','armored',26],
];

export const BARRENS_ENEMIES=infernal.map(([id,name,kind,level,element])=>({id,name,kind,level,element,region:0,wild:true,demon:true,weakness:kind==='armored'?'steady pressure':kind==='brute'?'guard then counter':'quick strikes'}));

export const BARRENS_LAIR_NAMES=['Abyss Tender Warren','Soul Crusher Hollow','Infernal Scar','Cinder Imp Den','Gargoyle Roost','Ash-Wing Cavern','Black Spirit Vault','Devil’s Throat'];

export const BARRENS_HISTORY=`The last hand of Sir Aldren, Knight of Justice: The Whispering Barrens were once an island of lawful sanctuaries. We kept the images of Lancemol, Galahad, Tristan and Bedever until the demons came from the Bottomless Pit. They toppled the statues, defiled the graves and extinguished every living thing. Our hidden chapels still burn with perpetual candles. Let a good soul find the walls we sealed, take the DemonSlayer arms within, and finish what we could not.`;

export const isWhisperingBarrens=state=>state?.exploration?.area===WHISPERING_BARRENS||state?.dungeon?.expedition?.startsWith(WHISPERING_BARRENS+'-cave-')||state?.dungeon?.minorId?.startsWith('minor-w2-');
export const isBarrensShrine=d=>d?.site==='minor-site'&&/^minor-w2-/.test(d.minorId||'');
export const infernalEnemy=enemy=>!!enemy?.demon||/\b(?:demon|devil|imp|succubus|abyss tender|soul crusher)\b/i.test(`${enemy?.speciesId||''} ${enemy?.name||''}`);
export const demonWeaponMultiplier=(weapon,enemy)=>weapon?.demonMultiplier&&infernalEnemy(enemy)?weapon.demonMultiplier:1;
export function truthArrowStrike(state,weapon){
 if(!['bow','crossbow'].includes(weapon?.family)||!infernalEnemy(state.enemy)||!state.bag?.includes('arrows-of-truth'))return false;
 state.flags??={};if(state.flags.truthArrows===undefined)state.flags.truthArrows=12;if(state.flags.truthArrows<1)return false;
 state.flags.truthArrows--;state.enemy.truthBurn=true;return true;
}
export const truthBurnDamage=random=>1+Math.floor(random()*20);

export function drawBarrensDesecration(c,w,h,state,time=0){
 if(!isWhisperingBarrens(state)||!state.dungeon)return;
 c.save();c.fillStyle='#3b000018';c.fillRect(0,0,w,h);
 // Bloody angular sigils cover the conquered sanctuaries and mine walls.
 c.strokeStyle='#b3262dcc';c.shadowColor='#ff3128';c.shadowBlur=4;c.lineWidth=Math.max(2,w/520);c.lineCap='round';
 for(const side of [-1,1])for(let i=0;i<3;i++){const x=w*.5+side*w*(.25+i*.095),y=h*(.24+i*.13),r=Math.min(w,h)*(.035+i*.004);c.beginPath();c.moveTo(x-r,y+r);c.lineTo(x,y-r);c.lineTo(x+r,y+r);c.moveTo(x-r*.7,y);c.lineTo(x+r*.7,y);c.moveTo(x,y-r);c.lineTo(x+side*r*.55,y+r*.55);c.stroke();}
 c.shadowBlur=0;
 // Four toppled emblems recall Lancemol, Galahad, Tristan and Bedever.
 c.fillStyle='#756c60';c.strokeStyle='#29251f';c.lineWidth=3;for(let i=0;i<4;i++){const x=w*(.16+i*.22),y=h*.79+(i%2)*h*.035;c.save();c.translate(x,y);c.rotate((i%2?-.28:.22));c.fillRect(-w*.045,-h*.018,w*.09,h*.036);c.strokeRect(-w*.045,-h*.018,w*.09,h*.036);c.beginPath();c.arc(0,-h*.027,h*.022,0,Math.PI*2);c.fill();c.stroke();c.restore();}
 if(state.dungeon.secretRoom){for(let i=0;i<7;i++){const x=w*(.31+i*.063),y=h*.77+Math.sin(i)*5,flame=5+Math.sin(time*.008+i)*2;c.fillStyle='#d7c394';c.fillRect(x-2,y,4,h*.045);c.fillStyle='#ffda62';c.shadowColor='#ff7b24';c.shadowBlur=12;c.beginPath();c.ellipse(x,y-flame*.5,flame*.38,flame,0,0,Math.PI*2);c.fill();}c.shadowBlur=0;}
 c.restore();
}

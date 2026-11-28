import {evilAppearance} from './evil-route.js';

// Coordinates match the square avatar art. Alternate looks are padded at the top.
const horns=['M42 6 Q39 1 39 -5 Q35 2 38 11 L43 13Z','M58 6 Q61 1 61 -5 Q65 2 62 11 L57 13Z'];
const brows='M43 10 Q46 7 49 9 M51 9 Q54 7 57 10';
const tail='M64 66 Q77 65 78 75 Q79 81 73 84';
const tip='M73 84 L82 80 L77 91Z';

export const devilHornsMarkup=(s,headOffset=0)=>evilAppearance(s)?`<svg class="avatar-devil-horns" viewBox="0 0 100 100" role="img" aria-label="Player avatar with horns and raised black eyebrows"><g transform="translate(0 ${headOffset})"><g fill="#a72b31" stroke="#411216" stroke-width=".8">${horns.map(path=>`<path d="${path}"/>`).join('')}</g><path d="${brows}" fill="none" stroke="#100d0b" stroke-width="1.3" stroke-linecap="round"/></g></svg>`:'';
export const devilTailMarkup=s=>evilAppearance(s)?`<svg class="avatar-evil-tail" viewBox="0 0 100 100" role="img" aria-label="Slim forked red devil tail"><path d="${tail}" fill="none" stroke="#361316" stroke-width="3" stroke-linecap="round"/><path d="${tail}" fill="none" stroke="#b52c35" stroke-width="2" stroke-linecap="round"/><path d="${tip}" fill="#b52c35" stroke="#361316" stroke-width=".8" stroke-linejoin="round"/></svg>`:'';

export function drawDevilHorns(c,s,x,y,size,headOffset=0){
 if(!evilAppearance(s))return;
 c.save();c.translate(x-size/2,y-size/2);c.scale(size/100,size/100);c.translate(0,headOffset);
 c.fillStyle='#a72b31';c.strokeStyle='#411216';c.lineWidth=.8;
 for(const side of [-1,1]){c.save();if(side===1){c.translate(100,0);c.scale(-1,1);}c.beginPath();c.moveTo(42,6);c.quadraticCurveTo(39,1,39,-5);c.quadraticCurveTo(35,2,38,11);c.lineTo(43,13);c.closePath();c.fill();c.stroke();c.restore();}
 c.strokeStyle='#100d0b';c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(43,10);c.quadraticCurveTo(46,7,49,9);c.moveTo(51,9);c.quadraticCurveTo(54,7,57,10);c.stroke();c.restore();
}
export function drawDevilTail(c,s,x,y,size){
 if(!evilAppearance(s))return;
 c.save();c.translate(x-size/2,y-size/2);c.scale(size/100,size/100);c.lineCap='round';
 for(const [color,width] of [['#361316',3],['#b52c35',2]]){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(64,66);c.quadraticCurveTo(77,65,78,75);c.quadraticCurveTo(79,81,73,84);c.stroke();}
 c.beginPath();c.moveTo(73,84);c.lineTo(82,80);c.lineTo(77,91);c.closePath();c.fillStyle='#b52c35';c.strokeStyle='#361316';c.lineWidth=.8;c.fill();c.stroke();c.restore();
}

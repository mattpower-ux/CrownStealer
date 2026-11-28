import {evilAppearance} from './evil-route.js';

// Coordinates match the square avatar art. Alternate looks are padded at the top.
const horns=['M44 8 Q41 4 41 0 Q38 6 41 13 L45 15Z','M56 8 Q59 4 59 0 Q62 6 59 13 L55 15Z'];
const brows='M44 7 Q46 5 49 7 M51 7 Q54 5 56 7';
const tail='M62 67 Q73 65 75 75 Q76 80 72 83';
const tip='M72 83 L79 80 L75 88Z';

export const devilHornsMarkup=(s,headOffset=0)=>evilAppearance(s)?`<svg class="avatar-devil-horns" viewBox="0 0 100 100" role="img" aria-label="Player avatar with horns and raised black eyebrows"><g transform="translate(0 ${headOffset})"><g fill="#a72b31" stroke="#411216" stroke-width=".8">${horns.map(path=>`<path d="${path}"/>`).join('')}</g><path d="${brows}" fill="none" stroke="#100d0b" stroke-width="1.3" stroke-linecap="round"/></g></svg>`:'';
export const devilTailMarkup=s=>evilAppearance(s)?`<svg class="avatar-evil-tail" viewBox="0 0 100 100" role="img" aria-label="Slim forked red devil tail"><path d="${tail}" fill="none" stroke="#361316" stroke-width="3" stroke-linecap="round"/><path d="${tail}" fill="none" stroke="#b52c35" stroke-width="2" stroke-linecap="round"/><path d="${tip}" fill="#b52c35" stroke="#361316" stroke-width=".8" stroke-linejoin="round"/></svg>`:'';

export function drawDevilHorns(c,s,x,y,size,headOffset=0){
 if(!evilAppearance(s))return;
 c.save();c.translate(x-size/2,y-size/2);c.scale(size/100,size/100);c.translate(0,headOffset);
 c.fillStyle='#a72b31';c.strokeStyle='#411216';c.lineWidth=.8;
 for(const side of [-1,1]){c.save();if(side===1){c.translate(100,0);c.scale(-1,1);}c.beginPath();c.moveTo(44,8);c.quadraticCurveTo(41,4,41,0);c.quadraticCurveTo(38,6,41,13);c.lineTo(45,15);c.closePath();c.fill();c.stroke();c.restore();}
 c.strokeStyle='#100d0b';c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(44,7);c.quadraticCurveTo(46,5,49,7);c.moveTo(51,7);c.quadraticCurveTo(54,5,56,7);c.stroke();c.restore();
}
export function drawDevilTail(c,s,x,y,size){
 if(!evilAppearance(s))return;
 c.save();c.translate(x-size/2,y-size/2);c.scale(size/100,size/100);c.lineCap='round';
 for(const [color,width] of [['#361316',3],['#b52c35',2]]){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(62,67);c.quadraticCurveTo(73,65,75,75);c.quadraticCurveTo(76,80,72,83);c.stroke();}
 c.beginPath();c.moveTo(72,83);c.lineTo(79,80);c.lineTo(75,88);c.closePath();c.fillStyle='#b52c35';c.strokeStyle='#361316';c.lineWidth=.8;c.fill();c.stroke();c.restore();
}

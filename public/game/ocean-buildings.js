// Compact sea-creature architecture shared by ocean towns.
export function drawOceanBuilding(c,kind,x,y,w,h){
 const types={inn:0,shop:1,casino:2,court:3,quests:4,fortune:5,talk:6,gate:7};if(types[kind]===undefined)return false;
 const t=types[kind];c.save();c.translate(x,y);c.scale(w,h);c.lineWidth=.018;c.strokeStyle='#665c65';
 const oval=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();c.stroke();};
 oval(.5,.9,.43,.07,'#344e4b');
 if(t===5){for(let i=0;i<13;i++){c.strokeStyle=i%2?'#db9baf':'#8fbcb6';c.lineWidth=.065;c.beginPath();c.moveTo(.5,.75);c.quadraticCurveTo(i/12,.35,(i+.5)/14,.14+Math.sin(i)*.07);c.stroke();}oval(.5,.69,.3,.23,'#cb9b95');}
 else if(t===0||t===2){oval(.5,.49,.42,.39,t===0?'#c6a58a':'#8eb8b5');c.strokeStyle='#766879';c.lineWidth=.025;c.beginPath();for(let i=0;i<100;i++){const a=i*.19,r=.30*(1-i/110);const xx=.5+Math.cos(a)*r,yy=.45+Math.sin(a)*r;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}
 else{c.fillStyle=['#d7b5a8','#a8c3b8','#d2b3c4'][t%3];c.beginPath();c.moveTo(.17,.8);for(let i=0;i<=12;i++){const a=Math.PI+i*Math.PI/12;c.lineTo(.5+Math.cos(a)*.43,.55+Math.sin(a)*.43);}c.lineTo(.83,.8);c.closePath();c.fill();c.stroke();for(let i=1;i<9;i++){c.beginPath();c.moveTo(.5,.8);const a=Math.PI+i*Math.PI/9;c.lineTo(.5+Math.cos(a)*.39,.55+Math.sin(a)*.39);c.stroke();}}
 oval(.5,.75,.115,.19,'#344845');oval(.27,.57,.055,.07,'#edce8d');oval(.73,.57,.055,.07,'#edce8d');c.restore();return true;
}

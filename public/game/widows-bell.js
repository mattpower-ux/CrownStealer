export function isWidowsBell(d){
 return !!d&&!d.site&&!d.royal&&!d.ship&&!d.expedition&&d.index===1;
}

export function widowsBellArrowSlitInk(face,u,v){
 if(face%3===0)return null;
 const halfWidth=.022+Math.max(0,.16-Math.abs(v-.43))*.08;
 if(v<.19||v>.69||Math.abs(u-.5)>halfWidth)return null;
 if(Math.abs(u-.5)<halfWidth*.58)return v<.28?'#eef8ff':'#b9d9e8';
 return '#66757a';
}

export function widowsBellHasBrokenBell(d){return isWidowsBell(d)&&d.floor===9;}

export function drawWidowsBellTop(c,w,h,d){
 if(!widowsBellHasBrokenBell(d)||Math.abs(d.x-13)+Math.abs(d.y-13)>5)return;
 c.save();
 const x=w*.55,y=h*.64,scale=Math.min(w,h)/620;
 c.translate(x,y);c.rotate(-.24);c.scale(scale,scale);
 c.fillStyle='#171512aa';c.beginPath();c.ellipse(0,108,190,35,0,0,Math.PI*2);c.fill();
 const bronze=c.createLinearGradient(-150,-80,150,90);bronze.addColorStop(0,'#49311f');bronze.addColorStop(.38,'#a56d31');bronze.addColorStop(.68,'#5c371f');bronze.addColorStop(1,'#241b18');
 c.fillStyle=bronze;c.strokeStyle='#c28a45';c.lineWidth=7;c.beginPath();c.moveTo(-128,-68);c.quadraticCurveTo(-102,44,-164,72);c.quadraticCurveTo(0,126,164,72);c.quadraticCurveTo(102,44,128,-68);c.closePath();c.fill();c.stroke();
 c.fillStyle='#17120f';c.beginPath();c.ellipse(0,72,145,42,0,0,Math.PI*2);c.fill();c.strokeStyle='#b57b3c';c.stroke();
 c.fillStyle='#80603d';c.fillRect(-18,60,36,80);c.beginPath();c.arc(0,143,28,0,Math.PI*2);c.fill();
 c.strokeStyle='#d5a35c';c.lineWidth=5;c.beginPath();c.moveTo(-116,-45);c.lineTo(-45,-12);c.lineTo(5,-45);c.lineTo(57,-5);c.stroke();
 c.restore();
}

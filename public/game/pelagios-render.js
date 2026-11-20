const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const pixel=(r,g,b)=>(255<<24)|(clamp(Math.floor(b),0,255)<<16)|(clamp(Math.floor(g),0,255)<<8)|clamp(Math.floor(r),0,255);

export function pelagiosPalette(floor=0){
 if(floor<3)return {occupation:'goblin',stone:[191,187,169],accent:'#a76532',glass:'#79aeb6'};
 if(floor<6)return {occupation:'orc',stone:[205,202,188],accent:'#6f4330',glass:'#b87c5c'};
 if(floor<9)return {occupation:'arcane',stone:[188,190,188],accent:'#554471',glass:'#7f73b5'};
 return {occupation:'scornraven',stone:[156,157,164],accent:'#382846',glass:'#a35ad0'};
}

export function pelagiosWallPixel(floor,face,tex,v,light){
 const palette=pelagiosPalette(floor),[r,g,b]=palette.stone;
 const joint=(v*8)%1<.055||((tex*7+(Math.floor(v*8)%2)*.5)%1)<.04;
 const crack=Math.abs(Math.sin(tex*37+v*71+face*2.1))>.982;
 const soot=floor<6&&v<.3&&Math.sin(tex*29+face)>.72?22:0;
 const corruption=floor>=6?Math.max(0,Math.sin(tex*23+v*17+face)*(.08+(floor-5)*.025)):0;
 const shade=(joint?-42:crack?-27:Math.sin(tex*91+v*59+face)*5)-soot;
 return pixel((r+shade)*(light-corruption),(g+shade)*(light-corruption*.8),(b+shade)*(light+corruption*.2));
}

export function drawPelagiosTower(c,x,y,size){
 c.save();c.translate(x,y);c.fillStyle='#181c1b99';c.beginPath();c.ellipse(0,size*.5,size*.72,size*.18,0,0,Math.PI*2);c.fill();
 c.fillStyle='#d7d2c0';c.strokeStyle='#777468';c.lineWidth=Math.max(1,size*.045);
 c.beginPath();for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,r=size*(i%2?.55:.6),px=Math.cos(a)*r,py=Math.sin(a)*r*.62-size*.05;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fill();c.stroke();
 for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,px=Math.cos(a)*size*.53,py=Math.sin(a)*size*.53*.62-size*.05;c.fillStyle=i>3?'#aaa6a0':'#ebe4cf';c.beginPath();c.arc(px,py,size*.13,0,Math.PI*2);c.fill();c.stroke();}
 c.fillStyle='#291f31';c.beginPath();c.moveTo(-size*.1,size*.45);c.lineTo(-size*.1,size*.15);c.quadraticCurveTo(0,0,size*.1,size*.15);c.lineTo(size*.1,size*.45);c.fill();
 c.strokeStyle='#8e72a6';c.beginPath();c.moveTo(-size*.38,-size*.05);c.lineTo(size*.38,-size*.05);c.stroke();c.restore();
}

export function drawPelagiosVault(c,w,h,d){
 const palette=pelagiosPalette(d.floor);c.save();c.strokeStyle=d.floor>=9?'#67507799':'#ded8c899';c.lineWidth=Math.max(2,w*.004);
 for(let i=0;i<6;i++){const inset=i*w*.075;c.beginPath();c.moveTo(inset,h*.51);c.quadraticCurveTo(w/2,h*(.04+i*.018),w-inset,h*.51);c.stroke();}
 if(d.floor>=3&&d.floor<9){for(let i=0;i<5;i++){c.fillStyle=[palette.glass+'35','#d4a74a28','#6c9eb428'][i%3];c.beginPath();c.moveTo(w*(.14+i*.18),h*.5);c.lineTo(w*(.21+i*.16),h*.16);c.lineTo(w*(.3+i*.14),h*.5);c.fill();}}
 c.restore();
}

export function drawPelagiosAtmosphere(c,w,h,d,time=0){
 const palette=pelagiosPalette(d.floor);c.save();
 const wash=c.createLinearGradient(0,h*.45,w,h);wash.addColorStop(0,palette.accent+'18');wash.addColorStop(.55,'#ffffff00');wash.addColorStop(1,palette.glass+'20');c.fillStyle=wash;c.fillRect(0,0,w,h);
 if(d.floor<6){c.fillStyle='#2b1a1080';for(let i=0;i<5;i++){const x=(i*.23+.08)*w,y=h*(.72+(i%2)*.07);c.fillRect(x,y,w*.065,h*.025);c.fillRect(x+w*.012,y-h*.06,w*.01,h*.06);}}
 if(d.floor>=6){c.strokeStyle=palette.glass+'66';c.lineWidth=2;for(let i=0;i<7;i++){const x=(i+1)*w/8;c.beginPath();c.moveTo(x,h*.56);c.quadraticCurveTo(x+Math.sin(time/800+i)*18,h*.7,x-8,h*.92);c.stroke();}}
 c.restore();
}

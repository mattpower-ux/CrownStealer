// Static, seeded town scenery: one small cached canvas, no additional image downloads.
const cache=new Map();
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function polygon(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.strokeStyle='#423d2c';c.lineWidth=.015;c.stroke();}
function barrel(c,x,y){ellipse(c,x,y+.13,.14,.055,'#18231955');c.fillStyle='#90683c';c.fillRect(x-.11,y-.17,.22,.28);ellipse(c,x,y-.17,.11,.045,'#bc935c');c.strokeStyle='#443e31';c.lineWidth=.025;for(const dy of [-.1,.04]){c.beginPath();c.moveTo(x-.11,y+dy);c.lineTo(x+.11,y+dy);c.stroke();}}
function fence(c,x,y,length){c.strokeStyle='#66523b';c.lineWidth=.045;for(const dy of [-.06,.08]){c.beginPath();c.moveTo(x,y+dy);c.lineTo(x+length,y+dy);c.stroke();}for(let k=0;k<=length;k+=.2){c.fillStyle='#a38c61';c.fillRect(x+k-.025,y-.17,.05,.38);}}
function stall(c,x,y,color){ellipse(c,x+.04,y+.3,.4,.12,'#1c271c33');c.fillStyle='#76512e';c.fillRect(x-.3,y-.17,.04,.53);c.fillRect(x+.28,y-.17,.04,.53);c.fillRect(x-.36,y+.17,.72,.16);polygon(c,[[x-.4,y-.12],[x-.26,y-.42],[x+.28,y-.42],[x+.43,y-.12]],color);for(let k=0;k<3;k++)polygon(c,[[x-.32+k*.24,y-.12],[x-.2+k*.19,y-.42],[x-.12+k*.19,y-.42],[x-.22+k*.24,y-.12]],'#d8c79b');for(let k=0;k<5;k++)ellipse(c,x-.25+k*.12,y+.14,.05,.04,k%2?'#c6a74a':'#a35836');}
function person(c,x,y,color){ellipse(c,x,y+.12,.08,.035,'#18302566');c.fillStyle='#44352c';c.fillRect(x-.055,y+.02,.035,.11);c.fillRect(x+.02,y+.02,.035,.11);polygon(c,[[x-.045,y-.18],[x+.045,y-.18],[x+.09,y+.045],[x-.09,y+.045]],color);ellipse(c,x,y-.22,.055,.065,'#c7a17b');ellipse(c,x,y-.27,.075,.025,'#6b573d');}
function garden(c,x,y){c.fillStyle='#68513a';c.fillRect(x,y,.65,1.2);for(let row=0;row<5;row++)for(let col=0;col<3;col++){ellipse(c,x+.12+col*.2,y+.13+row*.23,.06,.035,'#314e30');ellipse(c,x+.1+col*.2,y+.1+row*.23,.035,.05,'#79934b');}fence(c,x-.04,y+1.25,.75);}
function tree(c,x,y,seed,snow){ellipse(c,x+.06,y+.19,.29,.1,'#1c2f2844');c.fillStyle='#62503c';c.fillRect(x-.045,y-.12,.09,.35);for(let k=0;k<8;k++){const a=k*2.4+seed,r=k%2?.17:.08;ellipse(c,x+Math.cos(a)*r,y-.25+Math.sin(a)*r,.17,.14,snow?(k%2?'#e5e9d6':'#a4b6a1'):(k%2?'#718a46':'#4e6838'));}}
export function drawTownScenery(c,size,region,townIndex){
 const key=region+':'+townIndex;
 if(!cache.has(key)){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1040;const g=canvas.getContext('2d');g.scale(80,80);
  let seed=973+townIndex*103;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const grass=['#7b874e','#b79b67','#77937a','#c1ccc5'][region],dirt=['#a79570','#c0aa7d','#9caa96','#b2beb7'][region];
  g.fillStyle=grass;g.fillRect(0,0,13,13);
  for(let k=0;k<2400;k++){const x=rand()*13,y=rand()*13;g.fillStyle=k%3?'#d1cc8d35':'#344e312b';g.fillRect(x,y,.025+rand()*.045,.015);}
  // Connected lanes lead to every service entrance, with a wider central square.
  const road=(x,y)=>x>0&&x<12&&y>0&&y<13&&(Math.abs(x-6.5)<.58||[5.5,8.5,11.5].some(v=>Math.abs(y-v)<.48&&x>2.5&&x<10.7)||x>4.4&&x<8&&y>5&&y<10.5);
  for(let y=.04;y<13;y+=.15)for(let x=.04;x<13;x+=.21){const xx=x+(Math.round(y/.15)%2)*.1;if(!road(xx,y))continue;g.fillStyle=dirt;g.fillRect(xx-.035,y-.035,.25,.19);g.fillStyle=['#b2ab90','#98967e','#c1b99e','#a7a38a'][Math.floor(rand()*4)];g.beginPath();g.roundRect(xx,y,.17+rand()*.025,.11,.025);g.fill();}
  // Stone perimeter with a clear southern gate.
  for(let i=0;i<13;i++)for(const [x,y] of [[i,0],[i,12],[0,i],[12,i]]){if(y===12&&x===6)continue;g.fillStyle='#5f6955';g.fillRect(x,y,1,1);for(let r=0;r<4;r++)for(let col=0;col<3;col++){g.fillStyle=(r+col+i)%2?'#91927a':'#7e846e';g.fillRect(x+col*.34+(r%2)*.025,y+r*.25,.3,.2);}g.fillStyle='#343e2c44';g.fillRect(x,y+.85,1,.15);}
  for(const [x,y] of [[1.4,1.6],[3.3,1.4],[8.5,1.5],[10.8,1.6],[1.3,4.2],[11.5,4.2],[1.3,7.4],[11.5,7.4],[1.4,10.6],[11.6,10.5]])tree(g,x,y,townIndex,region===3);
  garden(g,1.1,8.8);garden(g,10.8,2.1);
  for(const [x,y] of [[4.2,4.5],[7.8,4.5],[4.2,7.5],[10.2,7.5],[4.2,10.5]]){barrel(g,x,y);barrel(g,x+.22,y+.07);}
  const cloth=['#9d5444','#647a69','#b39553','#666d8c'][townIndex%4];
  stall(g,5.1,6.1,cloth);stall(g,7.7,7.1,'#8a7754');stall(g,5.1,9.5,'#71845e');
  for(const [x,y] of [[1.2,5.8],[10.8,8.6]])fence(g,x,y,.9);
  // The well sits beside the central walking lane, leaving it visually clear.
  ellipse(g,7.5,9.65,.45,.16,'#243b3055');ellipse(g,7.5,9.48,.32,.21,'#b3ad8e');g.fillStyle='#8a8d78';g.fillRect(7.18,9.21,.64,.28);ellipse(g,7.5,9.21,.32,.18,'#c7c2a5');ellipse(g,7.5,9.21,.24,.12,'#2d5659');g.fillStyle='#665136';g.fillRect(7.17,8.78,.05,.48);g.fillRect(7.78,8.78,.05,.48);polygon(g,[[7.06,8.83],[7.5,8.58],[7.92,8.83]],'#8b6344');
  for(const [x,y,col] of [[4.65,5.45,'#876246'],[7.1,8.4,'#697d9c'],[5.8,10.5,'#a5814f'],[10.5,5.5,'#7d5265'],[4.4,8.7,'#65774f']])person(g,x,y,col);
  // Flowers and log piles fill margins instead of cluttering doorways.
  for(let i=0;i<10;i++){const x=10.9+rand()*.7,y=10.9+rand()*.35;ellipse(g,x,y,.025,.025,['#d4bb69','#bc8172','#e7ddab'][i%3]);}
  for(let i=0;i<5;i++){g.fillStyle='#6d5035';g.fillRect(1.12,2.1+i*.1,.55,.07);ellipse(g,1.67,2.13+i*.1,.045,.035,'#b89965');}
  // Keep only the current town background in memory (about four MB).
  cache.clear();cache.set(key,canvas);
 }
 c.drawImage(cache.get(key),0,0,size*13,size*13);
}

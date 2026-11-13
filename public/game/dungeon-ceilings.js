// Stone grit is sampled once per cached corridor; metal retains its structural ribs.
export function drawDungeonCeiling(c,w,h,wall,{metal=false,phase=0}={}){
 if(!metal){drawStoneCeiling(c,w,h,wall,phase);return;}
 c.save();c.beginPath();c.rect(0,0,w,h*.5);c.clip();
 const shade=c.createLinearGradient(0,0,0,h*.5);shade.addColorStop(0,wall.map+'66');shade.addColorStop(.65,wall.ceiling);shade.addColorStop(1,'#07100d');c.fillStyle=shade;c.fillRect(0,0,w,h*.5);
 const horizon=h*.5,cx=w*.5,depths=[1.65,1.12,.78,.54,.37,.25,.17,.11,.07];
 // Curved cross ribs and finer staggered joints suggest a shallow barrel vault.
 for(let i=0;i<depths.length;i++){const t=depths[i],span=w*.56*t,y=horizon-h*.025*t,apex=y-h*.68*t;c.beginPath();c.moveTo(cx-span,y);c.quadraticCurveTo(cx,apex,cx+span,y);c.strokeStyle=wall.map+(metal?'aa':'8c');c.lineWidth=Math.max(1,Math.min(6,t*5));c.stroke();if(i+1<depths.length){const next=depths[i+1],mid=(t+next)*.5;for(let j=-4;j<=4;j++){const u=(j+(i%2)*.5)/5;if(Math.abs(u)>=1)continue;const x1=cx+w*.56*t*u,x2=cx+w*.56*next*u;const y1=y-h*.34*t*(1-u*u),y2=horizon-h*.025*next-h*.34*next*(1-u*u);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=wall.map+'42';c.lineWidth=Math.max(.6,mid);c.stroke();}}}
 if(metal){c.fillStyle='#8dbfbd55';for(let i=0;i<18;i++){const y=(i*37+phase*17)%(h*.45),spread=w*(.08+.4*(1-y/(h*.5)));c.fillRect(cx-spread,y,2,2);c.fillRect(cx+spread,y,2,2);}}
 c.restore();
}

function grit(x,y){let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function stoneNoise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,a=fx*fx*(3-2*fx),b=fy*fy*(3-2*fy);return (grit(ix,iy)*(1-a)+grit(ix+1,iy)*a)*(1-b)+(grit(ix,iy+1)*(1-a)+grit(ix+1,iy+1)*a)*b;}
function drawStoneCeiling(c,w,h,wall,phase){
 const height=Math.ceil(h*.5),img=c.createImageData(w,height),pixels=new Uint32Array(img.data.buffer),tint=wall.tint||[0,0,0];
 for(let y=0;y<height;y+=2){const depth=Math.min(30,h*.425/Math.max(1,h*.5-y)),light=Math.max(.09,.55-depth*.035);
  for(let x=0;x<w;x+=2){const u=(x-w*.5)/w*depth*2+phase*.47,v=depth+phase*.73;
   const broad=stoneNoise(u*3,v*3),chips=stoneNoise(u*15,v*15),fine=grit(Math.floor(u*140),Math.floor(v*140)),crack=Math.abs(Math.sin(u*9+stoneNoise(u*2,v*2)*9+v*3));
   let tone=43+broad*55+chips*40+fine*19;if(fine<.035&&chips<.42)tone*=.64;
   const rgb=tint.map((n,i)=>Math.max(0,Math.min(255,Math.floor((tone+n*.5)*(i===2?.92:1)*light))));const color=(255<<24)|(rgb[2]<<16)|(rgb[1]<<8)|rgb[0];
   for(let yy=y;yy<Math.min(height,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;
  }
 }
 c.putImageData(img,0,0);
}

// Occasional recessed burial cubbies; bones are part of the wall material and obey ray occlusion.
export function shrineWallInk(kind,u,v,light=1){
 if(kind%5!==0)return null;
 const x=(u-.5)/.36,y=(v-.52)/.24;
 const inside=Math.abs(x)<1&&Math.abs(y)<1;if(!inside)return null;
 const lit=(r,g,b)=>'#'+[r,g,b].map(n=>Math.max(0,Math.min(255,Math.floor(n*Math.max(.3,light)))).toString(16).padStart(2,'0')).join('');
 if(Math.abs(x)>.89||y>.8)return lit(116,109,89);
 if(y<-.84)return lit(43,44,37);
 let bone=false;
 const skull=((x+.58)/.13)**2+((y+.03)/.25)**2<1;
 const eyes=skull&&(Math.abs(x+.62)<.024||Math.abs(x+.53)<.024)&&y>-.12&&y<-.02;
 bone=skull||Math.abs(y-.15)<.035&&x>-.48&&x<.3;
 // Rib cage, paired leg bones and jaw give the horizontal skeleton a readable silhouette.
 for(const rib of [-.34,-.23,-.12,-.01])if(Math.abs(((x-rib)/.043)**2+((y-.14)/.19)**2-1)<.28)bone=true;
 if(x>.12&&x<.76&&(Math.abs(y-.08-(x-.12)*.1)<.028||Math.abs(y-.25+(x-.12)*.08)<.028))bone=true;
 if(skull&&y>.14&&Math.abs(Math.sin(x*100))<.25)return lit(76,70,51);
 if(bone&&!eyes)return lit(186,176,137);
 return lit(eyes?8:18,eyes?9:22,eyes?7:18);
}

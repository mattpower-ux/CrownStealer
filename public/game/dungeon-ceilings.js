// Vector vault ribs are drawn once per cached corridor; no added bitmap assets.
export function drawDungeonCeiling(c,w,h,wall,{metal=false,phase=0}={}){
 c.save();c.beginPath();c.rect(0,0,w,h*.5);c.clip();
 const shade=c.createLinearGradient(0,0,0,h*.5);shade.addColorStop(0,wall.map+'66');shade.addColorStop(.65,wall.ceiling);shade.addColorStop(1,'#07100d');c.fillStyle=shade;c.fillRect(0,0,w,h*.5);
 const horizon=h*.5,cx=w*.5,depths=[1.65,1.12,.78,.54,.37,.25,.17,.11,.07];
 // Curved cross ribs and finer staggered joints suggest a shallow barrel vault.
 for(let i=0;i<depths.length;i++){const t=depths[i],span=w*.56*t,y=horizon-h*.025*t,apex=y-h*.68*t;c.beginPath();c.moveTo(cx-span,y);c.quadraticCurveTo(cx,apex,cx+span,y);c.strokeStyle=wall.map+(metal?'aa':'8c');c.lineWidth=Math.max(1,Math.min(6,t*5));c.stroke();if(i+1<depths.length){const next=depths[i+1],mid=(t+next)*.5;for(let j=-4;j<=4;j++){const u=(j+(i%2)*.5)/5;if(Math.abs(u)>=1)continue;const x1=cx+w*.56*t*u,x2=cx+w*.56*next*u;const y1=y-h*.34*t*(1-u*u),y2=horizon-h*.025*next-h*.34*next*(1-u*u);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=wall.map+'42';c.lineWidth=Math.max(.6,mid);c.stroke();}}}
 if(metal){c.fillStyle='#8dbfbd55';for(let i=0;i<18;i++){const y=(i*37+phase*17)%(h*.45),spread=w*(.08+.4*(1-y/(h*.5)));c.fillRect(cx-spread,y,2,2);c.fillRect(cx+spread,y,2,2);}}
 c.restore();
}

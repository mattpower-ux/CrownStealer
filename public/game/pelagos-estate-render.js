import {estateFloorRole,isPelagosEstateDungeon} from './pelagos-estates.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pixel=(r,g,b)=>(255<<24)|(clamp(b,0,255)<<16)|(clamp(g,0,255)<<8)|clamp(r,0,255);

export function estateScenePlan(d,w,h){
 const role=estateFloorRole(d),scale=Math.min(w,h),variant=(Number(d?.minorId?.split('-').at(-1))||0)+(d?.floor||0);
 const vaultRibs=Array.from({length:role==='cellar'?4:6},(_,i)=>({inset:.035+i*.072,apex:.07+i*.018,weight:scale*(role==='cellar'?.012:.009)}));
 const pillars=role==='cellar'?[]:[.105,.32,.68,.895].map((x,i)=>({x,width:.052,top:.17+(i%2)*.025,bottom:.69,capital:i%2?'leaf':'shield'}));
 const windows=role==='cellar'?[]:[.205,.795].map((x,i)=>({x,top:.19,bottom:.55,width:.13,broken:true,depth:1+i*.18,palette:(variant+i)%3}));
 const vines=role==='cellar'?[]:[
  {x:.095,top:.18,length:.39,lean:.035},{x:.31,top:.21,length:.3,lean:-.022},{x:.685,top:.2,length:.36,lean:.03},{x:.9,top:.17,length:.41,lean:-.035},
 ];
 const debris=Array.from({length:role==='cellar'?6:11},(_,i)=>({x:.08+((i*37+variant*11)%84)/100,y:.69+((i*19+variant*7)%24)/100,size:.007+(i%4)*.004,kind:i%4}));
 const lightBeams=windows.map((window,i)=>({sourceWindow:i,x:window.x,top:window.top+.04,floorX:window.x+(i?-.17:.17),floorY:.91,alpha:.075+i*.018,color:['#87bde8','#e0ba68','#b784b8'][window.palette]}));
 const casks=role==='cellar'?Array.from({length:6},(_,i)=>({x:.12+i*.15,y:.69+(i%2)*.08,size:.055})):[];
 return {role,vaultRibs,pillars,windows,vines,debris,lightBeams,casks};
}

export function estateWallPixel(face,u,v,light,role='ground'){
 const cellar=role==='cellar',base=cellar?[116,112,101]:[220,216,202],joint=(v*7)%1<.045||((u*6+(Math.floor(v*7)%2)*.5)%1)<.035,vein=Math.sin(u*61+v*43+face*1.7)>.94;
 const shade=joint?-34:vein?-16:Math.sin(u*83+v*37+face)*4,wet=cellar&&v>.62?12:0;
 return pixel(...base.map((n,i)=>Math.floor((n+shade-(i===0?wet:0))*light)));
}

export function drawEstateVault(c,w,h,d){
 const plan=estateScenePlan(d,w,h);c.save();
 if(plan.role==='cellar'){
  c.fillStyle='#201f1a';c.fillRect(0,h*.13,w,h*.47);
  for(const rib of plan.vaultRibs){c.strokeStyle='#756f6099';c.lineWidth=rib.weight;c.beginPath();c.moveTo(w*rib.inset,h*.57);c.quadraticCurveTo(w*.5,h*rib.apex,w*(1-rib.inset),h*.57);c.stroke();}
  for(const barrel of plan.casks){const x=w*barrel.x,y=h*barrel.y,r=w*barrel.size;c.fillStyle='#513522';c.fillRect(x-r,y-r*.6,r*2,r*1.2);c.strokeStyle='#a17e50';c.lineWidth=Math.max(1,w*.002);c.strokeRect(x-r,y-r*.6,r*2,r*1.2);c.beginPath();c.ellipse(x-r,y,r*.22,r*.58,0,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(x+r,y,r*.22,r*.58,0,0,Math.PI*2);c.stroke();}
 }else{
  const stone=c.createLinearGradient(0,h*.08,0,h*.68);stone.addColorStop(0,'#cbc7b8');stone.addColorStop(1,'#77786f');c.fillStyle=stone;c.fillRect(0,h*.1,w,h*.49);
  // Broken lancet windows are part of the rear architecture, not a screen overlay.
  for(const win of plan.windows){const x=w*win.x,top=h*win.top,bottom=h*win.bottom,half=w*win.width/2;c.fillStyle='#111a1b';c.beginPath();c.moveTo(x-half,bottom);c.lineTo(x-half,top+h*.075);c.quadraticCurveTo(x,top-h*.04,x+half,top+h*.075);c.lineTo(x+half,bottom);c.closePath();c.fill();c.strokeStyle='#ded8c7';c.lineWidth=Math.max(4,w*.008);c.stroke();
   const colors=[['#326f9f','#d2a641','#4f8a6d'],['#8e4f73','#d4b85c','#547c9d'],['#4a779c','#b06d52','#c8b157']][win.palette];
   for(let row=0;row<5;row++)for(let col=0;col<3;col++){if((row*3+col+win.palette)%5===1||(row===0&&col!==1))continue;const cellW=half*.56,cellH=(bottom-top)*.13,px=x+(col-1)*cellW,py=top+h*.085+row*cellH;c.fillStyle=colors[(row+col)%colors.length]+'b8';c.beginPath();c.moveTo(px-cellW*.42,py);c.lineTo(px+cellW*.38,py-cellH*.1);c.lineTo(px+cellW*.35,py+cellH*.74);c.lineTo(px-cellW*.38,py+cellH*.62);c.closePath();c.fill();}
   c.strokeStyle='#343a37';c.lineWidth=Math.max(1,w*.002);c.beginPath();c.moveTo(x,top+h*.03);c.lineTo(x,bottom);c.moveTo(x-half,bottom-(bottom-top)*.46);c.lineTo(x+half,bottom-(bottom-top)*.46);c.stroke();
  }
  for(const beam of plan.lightBeams){c.fillStyle=beam.color+Math.round(beam.alpha*255).toString(16).padStart(2,'0');c.beginPath();c.moveTo(w*(beam.x-.035),h*beam.top);c.lineTo(w*(beam.x+.035),h*beam.top);c.lineTo(w*(beam.floorX+.13),h*beam.floorY);c.lineTo(w*(beam.floorX-.13),h*beam.floorY);c.closePath();c.fill();}
  // Stone ribs and columns share endpoints so the vault reads as supported architecture.
  for(const rib of plan.vaultRibs){c.strokeStyle='#676960';c.lineWidth=rib.weight*2;c.beginPath();c.moveTo(w*rib.inset,h*.58);c.quadraticCurveTo(w*.5,h*rib.apex,w*(1-rib.inset),h*.58);c.stroke();c.strokeStyle='#d8d3c4aa';c.lineWidth=rib.weight*.55;c.stroke();}
  for(const pillar of plan.pillars){const x=w*pillar.x,half=w*pillar.width/2,top=h*pillar.top,bottom=h*pillar.bottom;c.fillStyle='#8f9087';c.beginPath();c.moveTo(x-half*.72,top);c.lineTo(x+half*.72,top);c.lineTo(x+half,bottom);c.lineTo(x-half,bottom);c.closePath();c.fill();c.fillStyle='#b9b5a8';c.fillRect(x-half*1.2,top-h*.018,half*2.4,h*.035);c.fillRect(x-half*1.15,bottom-h*.018,half*2.3,h*.035);c.strokeStyle='#5b5d56';c.lineWidth=Math.max(1,w*.002);for(let f=-.45;f<=.45;f+=.3){c.beginPath();c.moveTo(x+half*f,top+h*.02);c.lineTo(x+half*f*.75,bottom-h*.02);c.stroke();}}
  for(const vine of plan.vines){const x=w*vine.x,top=h*vine.top,bottom=top+h*vine.length;c.strokeStyle='#24452c';c.lineWidth=Math.max(2,w*.004);c.beginPath();c.moveTo(x,top);c.bezierCurveTo(x+w*vine.lean,bottom-h*.22,x-w*vine.lean,bottom-h*.1,x+w*vine.lean*.4,bottom);c.stroke();for(let i=1;i<8;i++){const y=top+(bottom-top)*i/8,side=i%2?1:-1;c.fillStyle=i%3?'#365d37':'#557143';c.beginPath();c.ellipse(x+side*w*(.006+Math.abs(vine.lean)*i/12),y,w*.009,h*.006,side*.55,0,Math.PI*2);c.fill();}}
  // A distant ruined chandelier and fountain provide the scale of a noble hall.
  c.strokeStyle='#3d3429';c.lineWidth=Math.max(2,w*.003);c.beginPath();c.moveTo(w*.5,h*.08);c.lineTo(w*.5,h*.28);c.stroke();c.beginPath();c.arc(w*.5,h*.31,w*.055,0,Math.PI);c.stroke();
  c.fillStyle='#77786f';c.fillRect(w*.45,h*.57,w*.1,h*.035);c.beginPath();c.ellipse(w*.5,h*.61,w*.075,h*.025,0,0,Math.PI*2);c.fill();
 }
 for(const piece of plan.debris){const x=w*piece.x,y=h*piece.y,r=w*piece.size;c.fillStyle=['#7d7b70','#aaa597','#544d43','#8b826e'][piece.kind];c.beginPath();c.moveTo(x-r,y);c.lineTo(x-r*.2,y-r*.55);c.lineTo(x+r,y-r*.15);c.lineTo(x+r*.45,y+r*.5);c.closePath();c.fill();}
 c.restore();
}

export function drawEstateAtmosphere(c,w,h,d,time=0){
 const role=estateFloorRole(d);c.save();
 if(role==='cellar'){c.fillStyle='#342a1b25';c.fillRect(0,h*.5,w,h*.5);for(let i=0;i<6;i++){const x=(i+.4)*w/6;c.fillStyle='#5b3829aa';c.fillRect(x,h*.65,w*.06,h*.16);c.strokeStyle='#9a7655';c.strokeRect(x,h*.65,w*.06,h*.16);}}
 else{const glow=c.createLinearGradient(0,h*.2,w,h*.8);glow.addColorStop(0,'#d8e6df16');glow.addColorStop(.5,'#fff5d608');glow.addColorStop(1,'#51645212');c.fillStyle=glow;c.fillRect(0,0,w,h);for(let i=0;i<28;i++){const x=(i*97.31+time*.004)%w,y=h*(.2+((i*53)%63)/100);c.fillStyle=i%3?'#e8e1c53b':'#ffffff25';c.fillRect(x,y,1+(i%2),1+(i%2));}}
 c.restore();
}

export function drawEstateContainer(c,size,opened,role='ground'){
 c.save();c.fillStyle='#161b1a88';c.beginPath();c.ellipse(0,size*.25,size*.5,size*.12,0,0,Math.PI*2);c.fill();c.fillStyle=role==='cellar'?'#68432d':'#d6cfb8';c.strokeStyle=role==='cellar'?'#a47a50':'#8e8879';c.lineWidth=Math.max(1,size*.035);c.fillRect(-size*.42,-size*.12,size*.84,size*.35);c.strokeRect(-size*.42,-size*.12,size*.84,size*.35);if(opened){c.save();c.translate(0,-size*.13);c.rotate(-.38);c.fillRect(-size*.42,-size*.13,size*.84,size*.15);c.strokeRect(-size*.42,-size*.13,size*.84,size*.15);c.restore();}else{c.fillRect(-size*.42,-size*.25,size*.84,size*.15);c.strokeRect(-size*.42,-size*.25,size*.84,size*.15);}c.fillStyle='#c5a657';c.fillRect(-size*.035,-size*.03,size*.07,size*.12);c.restore();
}

export function estateRenderProfile(d){return isPelagosEstateDungeon(d)?{role:estateFloorRole(d),features:estateFloorRole(d)==='cellar'?['wine racks','casks','damp alabaster','fallen masonry']:['rib-vaulted ceilings','broken stained glass','vine-covered pillars','marble debris','statuary','ballroom']} : null;}

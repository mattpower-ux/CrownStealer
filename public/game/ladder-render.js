// World-space beams share the raycaster's eye height and wall projection scale.
export function projectLadderFace(points,{x,y,dx,dy,w,h,fov}){
 const near=.08,focal=w/(2*Math.tan(fov/2));
 const vertices=points.map(([px,py,z])=>({depth:(px-x)*dx+(py-y)*dy,side:(py-y)*dx-(px-x)*dy,z}));
 const clipped=[];
 for(let i=0;i<vertices.length;i++){
  const a=vertices[(i+vertices.length-1)%vertices.length],b=vertices[i];
  if((a.depth>=near)!==(b.depth>=near)){
   const t=(near-a.depth)/(b.depth-a.depth);
   clipped.push({depth:near,side:a.side+(b.side-a.side)*t,z:a.z+(b.z-a.z)*t});
  }
  if(b.depth>=near)clipped.push(b);
 }
 return clipped.map(p=>({x:w/2+focal*p.side/p.depth,y:h/2+(.5-p.z)*h*.85/p.depth,depth:p.depth}));
}

export function ladderVisibleSpans(points,wallDepth,width){
 if(points.length<3)return [];
 const left=Math.max(0,Math.floor(Math.min(...points.map(p=>p.x)))),right=Math.min(width,Math.ceil(Math.max(...points.map(p=>p.x))));
 const spans=[];let start=-1;
 for(let x=left;x<right;x++){
  let nearest=Infinity;
  for(let i=0;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length];
   if(x+.5<Math.min(a.x,b.x)||x+.5>Math.max(a.x,b.x)||a.x===b.x)continue;
   const t=(x+.5-a.x)/(b.x-a.x);
   nearest=Math.min(nearest,1/((1-t)/a.depth+t/b.depth));
  }
  const visible=nearest<=wallDepth[x]+.018;
  if(visible&&start<0)start=x;
  if(!visible&&start>=0){spans.push([start,x]);start=-1;}
 }
 if(start>=0)spans.push([start,right]);
 return spans;
}

export function drawSolidLadders(c,w,h,d,ladders,dx,dy,fov,wallDepth){
 const camera={x:d.x+.5,y:d.y+.5,dx,dy,w,h,fov},faces=[];
 for(const ladder of ladders){
  const nx=ladder.wallX-ladder.x,ny=ladder.wallY-ladder.y,tx=-ny,ty=nx;
  const point=(u,n,z)=>[ladder.x+.5+nx*n+tx*(u-.5),ladder.y+.5+ny*n+ty*(u-.5),z];
  const add=(vertices,color,layer=0)=>{
   const points=projectLadderFace(vertices,camera);
   if(points.length<3)return;
   faces.push({points,color,layer,depth:points.reduce((sum,p)=>sum+p.depth,0)/points.length});
  };
  const quad=(u0,u1,z0,z1,n,color,layer=0)=>add([point(u0,n,z0),point(u1,n,z0),point(u1,n,z1),point(u0,n,z1)],color,layer);
  const box=(u0,u1,n0,n1,z0,z1,wood=true)=>{
   const p=[point(u0,n0,z0),point(u1,n0,z0),point(u1,n1,z0),point(u0,n1,z0),point(u0,n0,z1),point(u1,n0,z1),point(u1,n1,z1),point(u0,n1,z1)];
   const colors=wood?['#80552f','#3e291c','#533820','#a57945','#ba9058','#39291c']:['#686d67','#272d2c','#353d3c','#7b8279','#a0a397','#252b29'];
   for(const [i,indices] of [[0,[0,1,5,4]],[1,[2,3,7,6]],[2,[3,0,4,7]],[3,[1,2,6,5]],[4,[4,5,6,7]],[5,[3,2,1,0]]])add(indices.map(index=>p[index]),colors[i]);
  };
  const low=ladder.direction==='up'?.10:-.055,high=ladder.direction==='up'?1.055:.90;
  // Offset shadows and mounting blocks put visible air between timber and stone.
  for(const u of [.28,.66]){
   quad(u+.025,u+.105,low-.02,high-.02,.496,'#080b0bb0',-1);
   for(const z of [.22,.76])box(u-.008,u+.068,.425,.49,z-.022,z+.022,false);
  }
  for(let i=1;i<=8;i++){
   const z=i/9;if(z<low+.04||z>high-.04)continue;
   quad(.31,.75,z-.046,z-.017,.494,'#080b0b90',-1);
   box(.30,.70,.351,.414,z-.019,z+.019);
   // Thin worn edge catches the light; the recessed underside stays dark.
   quad(.34,.66,z+.009,z+.014,.350,'#c29c64',1);
   for(const u of [.286,.666]){
    box(u,u+.047,.337,.352,z-.024,z+.024,false);
    quad(u+.014,u+.026,z-.005,z+.007,.336,'#b6b3a0',2);
   }
  }
  for(const u of [.28,.66]){
   box(u,u+.06,.36,.435,low,high);
   // Long irregular strands are projected with the front face, never screen decals.
   for(let strand=0;strand<3;strand++){
    const base=u+.011+strand*.016;
    for(let segment=0;segment<5;segment++){
     const z0=low+(high-low)*segment/5,z1=low+(high-low)*(segment+1)/5;
     const bend=Math.sin(segment*2.1+strand*1.7)*.0028;
     add([point(base,.359,z0),point(base+.002,.359,z0),point(base+bend+.002,.359,z1),point(base+bend,.359,z1)],strand===1?'#aa7e49':'#55381f',1);
    }
   }
  }
 }
 faces.sort((a,b)=>b.depth-a.depth||a.layer-b.layer);
 for(const face of faces){
  const spans=ladderVisibleSpans(face.points,wallDepth,w);
  if(!spans.length)continue;
  c.save();c.beginPath();for(const [left,right] of spans)c.rect(left,0,right-left,h);c.clip();
  c.beginPath();face.points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();
  const light=Math.max(.25,Math.min(1,1-face.depth/14));
  c.fillStyle=face.color;c.fill();
  if(light<1){c.fillStyle=`rgba(3,8,9,${1-light})`;c.fill();}
  c.restore();
 }
}

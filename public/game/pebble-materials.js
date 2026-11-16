import {peeblesResident} from './peebles.js';
const textures = [
  {kind: 'wall', url: '/assets/pebble-run-walls.webp'},
  {kind: 'planes', url: '/assets/pebble-run-floor-ceiling.webp'},
];
const carvings = [
  ['TIME DILATION', 'CLOCKS SLOW NEAR LIGHT SPEED'],
  ['RELATIVITY', 'DISTANCE = SPEED × TIME'],
  ['FOLD SPACE', 'JOIN TWO POINTS IN ONE INSTANT'],
];
const materials = new Map();
let carvedPanels = [];
export let pebbleMaterialRevision = 0;

function pixelsOf(canvas) {
  return {width: canvas.width, height: canvas.height, pixels: canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data};
}

function buildPanels(image) {
  return carvings.map(([label, equation]) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 384;
    const ctx = canvas.getContext('2d');
    const left = 36, top = 100, width = 312, height = 132;
    ctx.drawImage(image, 0, 0, 384, 384);
    ctx.fillStyle = '#b0a890';
    ctx.fillRect(left - 4, top - 4, width + 8, height + 8);
    ctx.fillStyle = '#4e4940';
    ctx.fillRect(left, top, width, height);
    ctx.fillStyle = '#736b5c';
    ctx.fillRect(left + 6, top + 6, width - 12, height - 12);
    ctx.textAlign = 'center';
    ctx.font = 'bold 21px Georgia, serif';
    for (const [text, y] of [[label, top + 49], [equation, top + 90]]) {
      ctx.fillStyle = '#b7a993';
      ctx.fillText(text, 192, y + 2, width - 24);
      ctx.fillStyle = '#251d17';
      ctx.fillText(text, 192, y, width - 24);
    }
    return pixelsOf(canvas);
  });
}

if (typeof Image !== 'undefined') {
  for (const {kind, url} of textures) {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      materials.set(kind, pixelsOf(canvas));
      if (kind === 'wall') carvedPanels = buildPanels(image);
      pebbleMaterialRevision++;
    };
    image.src = url;
  }
}

export function pebblePixel(surface, u, v, light, panel = -1) {
  const material = surface === 'wall' ? carvedPanels[panel] ?? materials.get('wall') : materials.get('planes');
  if (!material) return null;
  const {width, height, pixels} = material;
  const x = Math.floor((u - Math.floor(u)) * width);
  const y = Math.floor((v - Math.floor(v)) * height);
  const index = (y * width + x) * 4;
  return (255 << 24) | (Math.floor(pixels[index + 2] * light) << 16) |
    (Math.floor(pixels[index + 1] * light) << 8) | Math.floor(pixels[index] * light);
}

export function drawPebblePlanes(c,w,h,d,dx,dy,fov){
 const image=c.getImageData(0,0,w,h),pixels=new Uint32Array(image.data.buffer);
 const focal=w/(2*Math.tan(fov/2));
 for(let y=0;y<h;y+=2){
  const depth=Math.min(24,h*.425/Math.max(1,Math.abs(y-h/2)));
  const light=Math.max(.12,.8-depth*.053)*(y<h/2?.76:1);
  for(let x=0;x<w;x+=2){
   const side=(x-w/2)*depth/focal,u=d.x+.5+dx*depth-dy*side,v=d.y+.5+dy*depth+dx*side;
   const color=pebblePixel('plane',u,v,light);
   if(color===null)continue;
   for(let yy=y;yy<Math.min(h,y+2);yy++)for(let xx=x;xx<Math.min(w,x+2);xx++)pixels[yy*w+xx]=color;
  }
 }
 c.putImageData(image,0,0);
}

const portrait=typeof Image==='undefined'?null:new Image();
if(portrait)portrait.src='/assets/professor-peebles.webp';

export function drawPeebles(c,w,h,s,map,[dx,dy]){
 const resident=peeblesResident(s);
 if(!resident||!portrait?.naturalWidth)return;
 const {x,y}=s.dungeon,rx=resident.x-x,ry=resident.y-y;
 const depth=rx*dx+ry*dy,side=-rx*dy+ry*dx,distance=Math.hypot(rx,ry);
 if(distance&&(depth<=0||Math.abs(side/depth)>.67||depth>6))return;
 for(let step=.18;step<distance;step+=.18){
  if(map[Math.floor(y+.5+ry*step/distance)]?.[Math.floor(x+.5+rx*step/distance)]===1)return;
 }
 const viewedDepth=Math.max(1,depth);
 const height=Math.min(h*.62,h*.85/viewedDepth);
 const width=height*portrait.naturalWidth/portrait.naturalHeight;
 const center=w/2+side/viewedDepth*w*.72+w*.065,ground=Math.min(h*.78,h*.5+h*.425/viewedDepth);
 c.drawImage(portrait,center-width/2,ground-height,width,height);
 if(viewedDepth<=3){
  c.save();
  c.font='bold '+Math.max(13,Math.min(24,h*.03))+'px Georgia';
  c.textAlign='center';c.lineWidth=5;c.strokeStyle='#142119';c.fillStyle='#f5e7bd';
  c.strokeText(resident.name,center,ground-height-9);c.fillText(resident.name,center,ground-height-9);
  c.restore();
 }
}

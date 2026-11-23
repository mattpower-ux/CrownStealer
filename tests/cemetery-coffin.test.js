import test from 'node:test';
import assert from 'node:assert/strict';

test('opened cemetery coffins render procedural human remains instead of the legacy fish asset',async()=>{
 const PreviousImage=globalThis.Image;
 class LoadedImage{complete=true;naturalWidth=100;naturalHeight=60;set src(value){this.url=value;}}
 globalThis.Image=LoadedImage;
 try{
  const {drawCemeteryCoffin}=await import('../public/game/cemetery-render.js?human-coffin-test');
  let imageDraws=0,ellipses=0,curves=0,arcs=0;
  const gradient={addColorStop(){}};
  const context={
   save(){},restore(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},translate(){},rotate(){},fillRect(){},clip(){},
   arc(){arcs++;},quadraticCurveTo(){curves++;},
   ellipse(){ellipses++;},drawImage(){imageDraws++;},createLinearGradient(){return gradient;},
   set fillStyle(value){},set strokeStyle(value){},set lineWidth(value){},set lineJoin(value){},set lineCap(value){},set globalAlpha(value){},
  };
  drawCemeteryCoffin(context,120,true,{stone:true});
  assert.equal(imageDraws,0);
  assert.ok(ellipses>=3,'the skull has a cranium and recessed eye sockets');
  assert.ok(curves>=10,'the torso has a curved anatomical rib cage');
  assert.ok(arcs>=8,'the arms and legs have articulated joints');
 }finally{globalThis.Image=PreviousImage;}
});

test('freestanding cemetery tombs and coffins share visible weathered marble veins',async()=>{
 const {drawCemeteryCoffin,drawCemeteryCrypt,drawCemeteryObelisk,drawGothicHeadstone}=await import('../public/game/cemetery-render.js?marble-prop-test');
 const marbleColors=new Set(['#526d61','#708c7e','#9cafa3']);
 const rendered=[];
 for(const draw of [c=>drawCemeteryCoffin(c,120,true,{stone:true}),c=>drawCemeteryCrypt(c,120,'mausoleum',4),c=>drawCemeteryObelisk(c,120,5),c=>drawGothicHeadstone(c,120,6)]){
  let strokeStyle='',marbleStrokes=0;
  const gradient={addColorStop(){}};
  const context={
   save(){},restore(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},translate(){},rotate(){},fillRect(){},arc(){},ellipse(){},quadraticCurveTo(){},clip(){},
   stroke(){if(marbleColors.has(strokeStyle))marbleStrokes++;},createLinearGradient(){return gradient;},
   set fillStyle(value){},set strokeStyle(value){strokeStyle=value;},set lineWidth(value){},set lineJoin(value){},set lineCap(value){},set globalAlpha(value){},
  };
  draw(context);rendered.push(marbleStrokes);
 }
 assert.ok(rendered.every(count=>count>=4),`every stone prop needs layered marble veining; got ${rendered.join(', ')}`);
});

test('cemetery marble remains pale and broadly veined at gameplay scale',async()=>{
 const {drawCemeteryCoffin,drawCemeteryCrypt,drawCemeteryObelisk,drawGothicHeadstone}=await import('../public/game/cemetery-render.js?readable-marble-test');
 for(const [name,draw] of Object.entries({
  coffin:c=>drawCemeteryCoffin(c,120,true),
  crypt:c=>drawCemeteryCrypt(c,120,'mausoleum',4),
  obelisk:c=>drawCemeteryObelisk(c,120,5),
  headstone:c=>drawGothicHeadstone(c,120,6),
 })){
  const colors=[];let strokeStyle='',lineWidth=0,broadVeins=0;
  const gradient={addColorStop(_offset,color){colors.push(color);}};
  const context={
   save(){},restore(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},translate(){},rotate(){},fillRect(){},arc(){},ellipse(){},quadraticCurveTo(){},clip(){},
   stroke(){if(['#526d61','#708c7e','#9cafa3'].includes(strokeStyle)&&lineWidth>=.018)broadVeins++;},createLinearGradient(){return gradient;},
   set fillStyle(value){if(typeof value==='string')colors.push(value);},set strokeStyle(value){strokeStyle=value;},set lineWidth(value){lineWidth=value;},set lineJoin(value){},set lineCap(value){},set globalAlpha(value){},
  };
  draw(context);
  const pale=colors.filter(color=>/^#[0-9a-f]{6}$/i.test(color)).some(color=>{
   const [r,g,b]=color.match(/[0-9a-f]{2}/gi).map(value=>parseInt(value,16));return (r+g+b)/3>=185;
  });
  assert.ok(pale,`${name} needs a dominant pale marble surface`);
  assert.ok(broadVeins>=6,`${name} needs broad readable veining; got ${broadVeins}`);
 }
});

test('coffin skeleton uses heavy full-length limbs that remain readable from the dungeon camera',async()=>{
 const {drawCemeteryCoffin}=await import('../public/game/cemetery-render.js?readable-skeleton-test');
 let strokeStyle='',lineWidth=0,heavyBoneLimbs=0,lowestBone=-Infinity;
 const gradient={addColorStop(){}};
 const context={
  save(){},restore(){},scale(){},beginPath(){},moveTo(_x,y){if(strokeStyle==='#d6d0b4')lowestBone=Math.max(lowestBone,y);},lineTo(_x,y){if(strokeStyle==='#d6d0b4')lowestBone=Math.max(lowestBone,y);},closePath(){},fill(){},translate(){},rotate(){},fillRect(){},arc(){},ellipse(){},quadraticCurveTo(){},clip(){},
  stroke(){if(strokeStyle==='#d6d0b4'&&lineWidth>=.020)heavyBoneLimbs++;},createLinearGradient(){return gradient;},
  set fillStyle(value){},set strokeStyle(value){strokeStyle=value;},set lineWidth(value){lineWidth=value;},set lineJoin(value){},set lineCap(value){},set globalAlpha(value){},
 };
 drawCemeteryCoffin(context,120,true,{stone:true});
 assert.ok(heavyBoneLimbs>=4,`arms and legs need four heavy readable strokes; got ${heavyBoneLimbs}`);
 assert.ok(lowestBone>=-.20,`leg bones need to extend to the foot of the coffin; lowest y was ${lowestBone}`);
});

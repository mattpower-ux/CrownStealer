import test from 'node:test';
import assert from 'node:assert/strict';

test('opened cemetery coffins render the foreshortened skeleton cutout instead of symbolic line art',async()=>{
 const PreviousImage=globalThis.Image;
 const loaded=[];
 class LoadedImage{complete=true;naturalWidth=1024;naturalHeight=1536;set src(value){this.url=value;loaded.push(value);}}
 globalThis.Image=LoadedImage;
 try{
  const {drawCemeteryCoffin}=await import('../public/game/cemetery-render.js?human-coffin-test');
  let imageDraws=0,transforms=0;
  const gradient={addColorStop(){}};
  const context={
   save(){},restore(){},scale(){},transform(){transforms++;},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},translate(){},rotate(){},fillRect(){},clip(){},arc(){},quadraticCurveTo(){},
   ellipse(){},drawImage(){imageDraws++;},createLinearGradient(){return gradient;},
   set fillStyle(value){},set strokeStyle(value){},set lineWidth(value){},set lineJoin(value){},set lineCap(value){},set globalAlpha(value){},set filter(value){},
  };
  drawCemeteryCoffin(context,120,true,{stone:true});
  assert.ok(loaded.some(url=>new URL(url,'http://test').pathname.endsWith('/assets/cemetery-skeleton.png')));
  assert.equal(imageDraws,1);
  assert.ok(transforms>=1,'the flat cutout receives a perspective transform inside the coffin');
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

test('cemetery vaults are monumental wall-height masonry rather than short tent silhouettes',async()=>{
 const {drawCemeteryCrypt}=await import('../public/game/cemetery-render.js?monumental-vault-test');
 let minY=0,strokeStyle='',weathering=0,horizontalCourses=0;
 const context={
  save(){},restore(){},scale(){},beginPath(){},moveTo(_x,y){minY=Math.min(minY,y);},lineTo(_x,y){minY=Math.min(minY,y);},closePath(){},fill(){},stroke(){if(['#6f7c73','#89958b','#4b5b52','#37483f'].includes(strokeStyle))weathering++;},clip(){},fillRect(){},ellipse(){},arc(){},quadraticCurveTo(){},
  createLinearGradient(){return {addColorStop(){}};},
  set fillStyle(value){},set strokeStyle(value){strokeStyle=value;},set lineWidth(value){},set lineJoin(value){},set lineCap(value){},set globalAlpha(value){},
 };
 const originalLineTo=context.lineTo;
 context.lineTo=(x,y)=>{originalLineTo(x,y);if(Math.abs(y-(-.36))<.02||Math.abs(y-(-.72))<.02||Math.abs(y-(-1.08))<.02||Math.abs(y-(-1.44))<.02)horizontalCourses++;};
 drawCemeteryCrypt(context,100,'vault',7);
 assert.ok(minY<=-2.45,`vault should reach nearly the projected wall height; top was ${minY}`);
 assert.ok(horizontalCourses>=4,`vault face needs layered masonry courses; got ${horizontalCourses}`);
 assert.ok(weathering>=8,`vault face needs mineral streaks, chips, and aged joints; got ${weathering}`);
});

test('cemetery headstones use tall slab vault faces instead of tiny peaked tents',async()=>{
 const {drawGothicHeadstone}=await import('../public/game/cemetery-render.js?slab-headstone-test');
 let minY=0,verticalJoints=0;
 const context={
  save(){},restore(){},scale(){},beginPath(){},moveTo(_x,y){minY=Math.min(minY,y);},lineTo(x,y){minY=Math.min(minY,y);if(y<-.4&&Math.abs(x)>.18)verticalJoints++;},closePath(){},fill(){},stroke(){},clip(){},fillRect(){},ellipse(){},arc(){},quadraticCurveTo(){},
  createLinearGradient(){return {addColorStop(){}};},
  set fillStyle(_value){},set strokeStyle(_value){},set lineWidth(_value){},set lineJoin(_value){},set lineCap(_value){},set globalAlpha(_value){}
 };
 drawGothicHeadstone(context,100,6);
 assert.ok(minY<=-1.55,`headstone should read as a tall masonry slab; top was ${minY}`);
 assert.ok(verticalJoints>=2,`headstone needs vertical facade joints, got ${verticalJoints}`);
});

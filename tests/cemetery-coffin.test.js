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
 const marbleColors=new Set(['#60756b','#83978b','#aeb9ae']);
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

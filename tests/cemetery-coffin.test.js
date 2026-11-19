import test from 'node:test';
import assert from 'node:assert/strict';

test('opened cemetery coffins render procedural human remains instead of the legacy fish asset',async()=>{
 const PreviousImage=globalThis.Image;
 class LoadedImage{complete=true;naturalWidth=100;naturalHeight=60;set src(value){this.url=value;}}
 globalThis.Image=LoadedImage;
 try{
  const {drawCemeteryCoffin}=await import('../public/game/cemetery-render.js?human-coffin-test');
  let imageDraws=0,ellipses=0;
  const gradient={addColorStop(){}};
  const context={
   save(){},restore(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},translate(){},rotate(){},fillRect(){},arc(){},quadraticCurveTo(){},
   ellipse(){ellipses++;},drawImage(){imageDraws++;},createLinearGradient(){return gradient;},
   set fillStyle(value){},set strokeStyle(value){},set lineWidth(value){},set lineJoin(value){},
  };
  drawCemeteryCoffin(context,120,true,{stone:true});
  assert.equal(imageDraws,0);
  assert.ok(ellipses>=1,'procedural skull is drawn inside the coffin');
 }finally{globalThis.Image=PreviousImage;}
});

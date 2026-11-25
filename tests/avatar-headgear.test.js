import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.Image=class{complete=true;naturalWidth=1536;naturalHeight=512;};
const {headgearProfile,avatarMarkup,drawGearAvatar}=await import('../public/game/gear-avatar.js');

test('headgear profiles anchor each equipped head shape to the avatar head',()=>{
  assert.equal(headgearProfile({shape:'hat'}).shape,'hat');
  assert.equal(headgearProfile({shape:'helm'}).shape,'helmet');
  assert.equal(headgearProfile({shape:'helmet'}).shape,'helmet');
  assert.equal(headgearProfile({shape:'crown-obedience'}).shape,'crown');
  assert.equal(headgearProfile({shape:'crown'}).shape,'crown');
  assert.deepEqual(headgearProfile({shape:'helm'}).box,[41.5,-2,17,18,0]);
});

test('equipped miner caps render at the helmet head anchor',()=>{
  const html=avatarMarkup({bag:['miners-cap'],equippedHead:'miners-cap',buffExpiry:{},worldTimeMs:0,armor:0,flags:{}});
  assert.match(html,/data-avatar-gear="head"/);
  assert.match(html,/left:41.5%;top:-2%;width:17%;height:18%/);
});

test('canvas avatars draw equipped miner caps at the helmet scale',()=>{
  const calls=[],canvas={drawImage(...args){calls.push(args);},save(){},restore(){},translate(){},rotate(){}};
  drawGearAvatar(canvas,{bag:['miners-cap'],equippedHead:'miners-cap',buffExpiry:{},worldTimeMs:0,armor:0,flags:{}},100,100,100);
  assert.ok(calls.some(args=>args.at(-2)===17&&args.at(-1)===18));
});

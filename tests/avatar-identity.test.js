import test from 'node:test';import assert from 'node:assert/strict';
globalThis.Image=class{complete=true;naturalWidth=1536;naturalHeight=512;};
const {avatarMarkup,drawGearAvatar}=await import('../public/game/gear-avatar.js');
const base={bag:[],buffExpiry:{},worldTimeMs:0,armor:0};
test('inventory sprites use the selected Him, Her or Shim identity',()=>{for(const [gender,index] of [['him',0],['her',1],['shim',2]]){const html=avatarMarkup({...base,gender});assert.match(html,new RegExp('data-avatar-identity="'+gender+'"'));const draws=[];drawGearAvatar({drawImage(...args){draws.push(args);}}, {...base,gender},100,100,100);assert.equal(draws[0][1],index*512);assert.equal(draws[0][3],512);}});
test('pig-face and shrinking effects remain visible over the selected identity',()=>{const html=avatarMarkup({...base,gender:'her',buffExpiry:{pigFace:1000,tiny:1000}});assert.match(html,/avatar-pig-head/);assert.match(html,/tiny-avatar/);assert.match(html,/data-avatar-identity="her"/);});

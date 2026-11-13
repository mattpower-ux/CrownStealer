import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act} from '../public/game/engine.js';
globalThis.Image=class Image{};
const {inventoryView,quickEquipAction}=await import('../public/game/inventory-view.js');
test('bag gear equips directly with separate optional inspection',()=>{
 let s=createGame();s.bag.push('rare-sword-1');
 const html=inventoryView(s,null);
 assert.match(html,/data-quick-equip="rare-sword-1"/);
 assert.match(html,/aria-label="Inspect Runed Sword/);
 assert.match(html,/aria-live="polite" hidden/);
 s=act(s,quickEquipAction(s,'rare-sword-1'));assert.equal(s.equipped,'rare-sword-1');
 assert.equal(quickEquipAction(s,'tonic'),null);
});
test('quick ring equipment fills empty slots and keeps engine combat restrictions',()=>{
 let s=createGame();s.bag.push('ring-wisdom-1','ring-strength-1');
 s=act(s,quickEquipAction(s,'ring-wisdom-1'));assert.equal(s.equippedRing,'ring-wisdom-1');
 s=act(s,quickEquipAction(s,'ring-strength-1'));assert.equal(s.equippedRing2,'ring-strength-1');
 s.mode='battle';const before=s.equipped;s.bag.push('rare-sword-1');s=act(s,quickEquipAction(s,'rare-sword-1'));assert.equal(s.equipped,before);
});

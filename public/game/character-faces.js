import {gagActive,pigFaceSvg} from './gag-potions.js';
import {JUNK_ITEMS,junkArt} from './junk-loot.js';
export const CHARACTER_FACES=[{id:'him',label:'Him',position:0},{id:'her',label:'Her',position:50},{id:'shim',label:'Other',position:100}];
export const CAMEO_ATLAS='/assets/adventurer-cameos.webp';
export const CHARACTER_CAMEOS=[
 ['chestnut-curls','Chestnut curls'],
 ['cropped-coils','Cropped coils'],
 ['swept-gray','Swept-back gray hair and beard'],
 ['close-silver','Close silver hair and beard'],
 ['dark-twists','Short dark twists'],
 ['short-auburn','Short auburn hair'],
 ['braided-crown','Braided crown'],
 ['swept-silver','Swept silver hair'],
 ['silver-coils','Silver coils'],
 ['scarred-brow','Scarred brow'],
 ['pointed-beard','Cropped hair and pointed beard'],
 ['silver-beard','Tied-back silver hair and full beard'],
].map(([id,label],index)=>({id,label,column:index%6,row:Math.floor(index/6),deepSkin:[1,3,4,6,8,10].includes(index)}));
export const characterCameo=id=>CHARACTER_CAMEOS.find(cameo=>cameo.id===id);
export const cameoPosition=({column,row})=>column*20+'% '+row*100+'%';
export const CUSTOMIZATION_JOKES=[{label:'Change face',reply:"Good instinct, but you're stuck with that mug"},{label:'Change Hair',reply:'Cut it off if it bothers you.'},{label:'Change Body',reply:'Try lifting weights'}];
export const characterFace=s=>CHARACTER_FACES.find(f=>f.id===s?.gender)||CHARACTER_FACES[0];
export function faceMarkup(s){if(gagActive(s,'pigFace'))return '<div class="adventurer-face pig-face" role="img" aria-label="Your adventurer now has a pig face">'+pigFaceSvg+'</div>';if(Number.isInteger(s.flags?.visage)&&s.flags.visage>=0&&s.flags.visage<4)return `<div class="adventurer-face" role="img" aria-label="Transformed adventurer" style="background-image:url('/assets/alien-visages.webp');background-size:400% 100%;background-position:${s.flags.visage*100/3}% center"></div>`;const f=characterFace(s),cameo=characterCameo(s?.cameo);
 const art=cameo?'class="adventurer-face cameo-atlas" style="background-position:'+cameoPosition(cameo)+'"':'class="adventurer-face" style="background-position:'+f.position+'% center"';
 return `<div ${art} role="img" aria-label="${cameo?.label||f.label} adventurer portrait">${s?.equippedHead==='straw-hat'?'<span class="portrait-straw-hat">'+junkArt(JUNK_ITEMS['straw-hat'])+'</span>':''}</div>`;}
export function facePickerMarkup(){return `<fieldset class="face-picker"><legend>CHOOSE GENDER:</legend><div class="gender-choices">${CHARACTER_FACES.map(f=>`<label><input type="radio" name="adventurer-gender" value="${f.id}"><span>${f.label.toUpperCase()}</span></label>`).join('')}</div></fieldset><fieldset class="cameo-picker"><legend>CHOOSE YOUR LOOK</legend><div class="cameo-choices">${CHARACTER_CAMEOS.map(cameo=>`<label title="${cameo.label}"><input type="radio" name="adventurer-cameo" value="${cameo.id}" aria-label="${cameo.label}"><span class="cameo-atlas" style="background-position:${cameoPosition(cameo)}" aria-hidden="true"></span></label>`).join('')}</div></fieldset><div class="customization-jokes">${CUSTOMIZATION_JOKES.map((j,i)=>`<button type="button" data-customization-joke="${i}">${j.label}</button>`).join('')}</div>`;}

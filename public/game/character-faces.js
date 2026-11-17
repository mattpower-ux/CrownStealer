import {characterLook,lookPickerMarkup} from './character-looks.js';
import {rootActive} from './druid-grove.js';
import {buffTimeLeft} from './world-clock.js';
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
export const characterCameo=id=>CHARACTER_CAMEOS.find(cameo=>cameo.id===id)||characterLook(id);
export const cameoPosition=({column,row})=>column*20+'% '+row*100+'%';
export const FACE_CHANGE_REFUSAL="Good instinct, but you're stuck with that mug!";
const alienVisage=s=>Number.isInteger(s.flags?.visage)&&s.flags.visage>=0&&s.flags.visage<4;
export const faceChangeBlocked=s=>gagActive(s,'pigFace')||gagActive(s,'tiny')||buffTimeLeft(s,'hairy')>0||rootActive(s)||alienVisage(s)||!!s.flags?.snoutStage;
export const characterFace=s=>CHARACTER_FACES.find(f=>f.id===s?.gender)||CHARACTER_FACES[0];
export function faceMarkup(s){if(gagActive(s,'pigFace'))return '<div class="adventurer-face pig-face" role="img" aria-label="Your adventurer now has a pig face">'+pigFaceSvg+'</div>';if(alienVisage(s))return `<div class="adventurer-face" role="img" aria-label="Transformed adventurer" style="background-image:url('/assets/alien-visages.webp');background-size:400% 100%;background-position:${s.flags.visage*100/3}% center"></div>`;const f=characterFace(s),cameo=characterCameo(s?.cameo);
 if(cameo?.fullBody)return `<div class="adventurer-face" role="img" aria-label="${cameo.label} portrait" style="background-image:url('${cameo.url}');background-size:500% auto;background-position:50% 0"></div>`;
 const art=cameo?'class="adventurer-face cameo-atlas" style="background-position:'+cameoPosition(cameo)+'"':'class="adventurer-face" style="background-position:'+f.position+'% center"';
 return `<div ${art} role="img" aria-label="${cameo?.label||f.label} adventurer portrait">${s?.equippedHead==='straw-hat'?'<span class="portrait-straw-hat">'+junkArt(JUNK_ITEMS['straw-hat'])+'</span>':''}</div>`;}
export function facePickerMarkup(){return `<fieldset class="face-picker"><legend>CHOOSE GENDER:</legend><div class="gender-choices">${CHARACTER_FACES.map(f=>`<label><input type="radio" name="adventurer-gender" value="${f.id}"><span>${f.label.toUpperCase()}</span></label>`).join('')}</div></fieldset>${lookPickerMarkup()}`;}
export function cameoPickerMarkup(selected,name='adventurer-cameo'){return `<fieldset class="cameo-picker"><legend>CHOOSE YOUR LOOK</legend><div class="cameo-choices">${CHARACTER_CAMEOS.map(cameo=>`<label title="${cameo.label}"><input type="radio" name="${name}" value="${cameo.id}" aria-label="${cameo.label}" ${selected===cameo.id?'checked':''}><span class="cameo-atlas" style="background-position:${cameoPosition(cameo)}" aria-hidden="true"></span></label>`).join('')}</div></fieldset>`;}

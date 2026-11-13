const visages=new Image();visages.src='/assets/alien-visages.webp';
import {characterFace} from './character-faces.js';
import {gagActive,pigFaceSvg} from './gag-potions.js';
import {itemById,itemArt} from './items.js';
import {buffTimeLeft} from './world-clock.js';
const cache=new Map();const pigHead=new Image();pigHead.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(pigFaceSvg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
const base=new Image();base.src='/assets/adventurer-identities.webp';
const hairy=new Image();hairy.src='/assets/hairy-adventurer.webp';
const diseaseBandages=s=>s.flags?.leprosy?`<svg class="avatar-bandages" viewBox="0 0 100 100" role="img" aria-label="Bandages cover your head and hands"><g fill="#ded8bd" stroke="#77745f" stroke-width=".55"><path d="M40 8Q50 3 60 8L62 18L58 29Q50 33 41 27L38 17Z"/><path d="M39 12L61 14M39 17L61 19M40 22L60 24M43 27L57 29" fill="none"/><path d="M42 16L58 17L57 20L43 19Z" fill="#423c31"/><path d="M27 51L34 49L38 60L33 66L27 62Z"/><path d="M28 54L35 53M29 58L36 57M29 62L35 61" fill="none"/><path d="M62 51L69 52L72 62L67 67L62 63Z"/><path d="M63 55L70 56M63 59L71 60M64 63L70 64" fill="none"/></g></svg>`:'';
const gearArt = {
 hat: {box: [27, -11, 46, 20, 0], viewBox: '8 49 184 124'},
 helmet: {box: [39, -4, 22, 27, 0], viewBox: '28 14 144 169'},
 crown: {box: [38, -8, 24, 16, 0], viewBox: '22 33 156 150'},
 'thinkiness-helm': {box: [37, -6, 26, 24, 0], viewBox: '28 33 144 137'},
 belt: {box: [38, 51, 23, 8, -2], viewBox: '12 77 176 64'},
};
function layers(s){const head=gearArt[itemById(s.equippedHead,s)?.shape];
 return [['head',s.equippedHead,...(head?.box||[38,9,25,24,0])],['hands',s.equippedHands,27,48,10,16,-10],['ring2',s.equippedRing2,62,51,8,9,0],['armor',s.equippedArmor,37,32,28,29,-8],['belt',s.equippedBelt,...gearArt.belt.box],['weapon',s.equipped,27,44,28,52,['bow','crossbow'].includes(itemById(s.equipped,s)?.shape)?0:155],['boots',s.equippedBoots,34,77,34,22,0],['shield',s.equippedShield,54,39,27,33,-8],['necklace',s.equippedNecklace,44,29,15,19,0],['ring',s.equippedRing,27,52,8,9,0]].filter(l=>l[1]);}
function artImage(s,id){const item=itemById(id,s),key=id+':'+s.armor;if(!cache.has(key)){const source=item.kind==='armor'?`<svg viewBox="0 0 100 120"><defs><linearGradient id="vest"><stop stop-color="#3e4b45"/><stop offset=".4" stop-color="${item.color}"/><stop offset=".65" stop-color="#727e71"/><stop offset="1" stop-color="#293d35"/></linearGradient></defs><path d="M26 9 Q50 29 74 9 L88 22 L79 53 L82 104 Q51 119 18 104 L21 53 L12 22Z" fill="url(#vest)" stroke="#26362c" stroke-width="3"/><path d="M29 13 Q50 35 71 13 M50 29 V107 M21 70 Q50 80 79 70 M20 87 Q50 97 80 87" fill="none" stroke="#d8d4ac88" stroke-width="2"/><path d="M20 96 L80 96 L81 105 L19 105Z" fill="#55402a"/><rect x="43" y="94" width="14" height="13" rx="2" fill="#ad975a"/></svg>`:itemArt(item);const bounds=gearArt[item.shape];
 let svg=source.replace(/<circle cx="100" cy="110" r="86"[^>]*\/>/,'').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
 if(bounds){
  svg=svg.replace(/viewBox="[^"]+"/,'viewBox="'+bounds.viewBox+'"');
  if(item.shape==='helmet'||item.shape==='crown')svg=svg.replace('fill="'+item.color+'33"','fill="'+item.color+'"').replace('stroke="'+item.color+'"','stroke="#57483c"');
  if(item.shape==='belt')svg=svg.replace('fill="'+item.color+'33"','fill="#49372c"');
 }
 const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),image=new Image();image.src=url;cache.set(key,{url,image});}return cache.get(key);}
export function hairyDuration(s){
 const minutes=buffTimeLeft(s,'hairy');
 if(!minutes)return '';
 if(minutes<60)return minutes+' game min left';
 const hours=Math.ceil(minutes/60),days=Math.floor(hours/24),remainder=hours%24;
 if(!days)return hours+' game hour'+(hours===1?'':'s')+' left';
 return days+' game day'+(days===1?'':'s')+(remainder?' '+remainder+' h':'')+' left';
}
export function avatarMarkup(s){
 if(hairyDuration(s))return '<div class="geared-avatar hairy-avatar'+(gagActive(s,'tiny')?' tiny-avatar':'')+'" role="img" aria-label="Adventurer transformed into hairy Bigfoot"><img class="hairy-avatar-art" src="/assets/hairy-adventurer.webp" alt="">'+diseaseBandages(s)+'</div>';
 const face=characterFace(s);return `<div class="geared-avatar ${gagActive(s,'tiny')?'tiny-avatar':''}" role="img" data-avatar-identity="${face.id}" aria-label="${face.label} adventurer wearing current equipment"><span class="avatar-base" style="background-position:${face.position}% center"></span>${layers(s).map(([kind,id,x,y,w,h,angle])=>`<img data-avatar-gear="${kind}" src="${artImage(s,id).url}" alt="" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;transform:rotate(${angle}deg)">`).join('')}${Number.isInteger(s.flags?.visage)?`<span style="position:absolute;left:38%;top:7%;width:25%;height:24%;border-radius:45%;background-image:url('/assets/alien-visages.webp');background-size:400% 100%;background-position:${s.flags.visage*100/3}% center"></span>`:''}${gagActive(s,'pigFace')?'<span class="avatar-pig-head">'+pigFaceSvg+'</span>':''}${diseaseBandages(s)}</div>`;}
export function drawGearAvatar(c,s,x,y,size){if(hairyDuration(s)&&hairy.complete&&hairy.naturalWidth){if(gagActive(s,'tiny'))size*=.45;const width=size*hairy.naturalWidth/hairy.naturalHeight;c.drawImage(hairy,x-width/2,y-size/2,width,size);return true;}if(!base.complete||!base.naturalWidth)return false;if(gagActive(s,'tiny'))size*=.45;const cell=base.naturalWidth/3;c.drawImage(base,characterFace(s).position/50*cell,0,cell,base.naturalHeight,x-size/2,y-size/2,size,size);for(const [,id,l,t,w,h,angle]of layers(s)){const {image}=artImage(s,id);if(!image.complete||!image.naturalWidth)continue;const xx=x-size/2+(l+w/2)*size/100,yy=y-size/2+(t+h/2)*size/100;c.save();c.translate(xx,yy);c.rotate(angle*Math.PI/180);c.drawImage(image,-w*size/200,-h*size/200,w*size/100,h*size/100);c.restore();}if(Number.isInteger(s.flags?.visage)&&visages.complete&&visages.naturalWidth)c.drawImage(visages,s.flags.visage*visages.naturalWidth/4,0,visages.naturalWidth/4,visages.naturalHeight,x-size*.12,y-size*.4,size*.24,size*.24);if(gagActive(s,'pigFace')&&pigHead.complete)c.drawImage(pigHead,x-size*.20,y-size*.46,size*.40,size*.37);return true;}

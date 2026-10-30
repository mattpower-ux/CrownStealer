import {mountFor} from './mounts.js';
const entries=[
 ['cloth-gloves','Cloth Gloves','hands','gloves',12,'+1 defense while worn. Surprisingly good at keeping splinters out.',{protection:1}],
 ['straw-hat','Straw Hat','head','hat',6,'No armor advantage. Keeps the sun off your questionable judgment.',{protection:0}],
 ['rusty-knife','Rusty Knife','weapon','knife',8,'A small rusty blade. The rust is free.',{damage:[1,3],toHit:-1}],
 ['nose-picking-tool','Nose Picking Tool','junk','nose-tool',3,'A precision instrument with an unfortunate speciality.',{}],
 ['broken-compass','Broken Compass','junk','compass',4,'Points confidently in several wrong directions.',{}],
 ['old-boot','Old Boot','junk','old-boot',2,'One boot. Its partner has wisely moved on.',{}],
 ['fishing-pole','Fishing Pole','junk','fishing-pole',10,'For catching fish, or explaining why you have been standing still all afternoon.',{}],
 ['snowshoes','Snowshoes','boots','snowshoes',18,'Move two squares on snowy wilderness terrain. Everywhere else, each square takes two movement commands.',{}],
 ['scroll-find-secrets','Scroll of Find Secret Doors','consumable','scroll',25,'Reveals and opens a hidden potion alcove on every fifth standard dungeon level. Kept if no secret is present.',{}],
 ['scroll-vomit','Scroll of Vomit','consumable','scroll',10,'One use: vomit violently, lose 20 health, and cure poison. Do not read over an open treasure chest.',{}]
];
export const JUNK_ITEMS=Object.fromEntries(entries.map(([id,name,kind,shape,value,description,extra])=>[id,{id,name,kind,shape,value,description,...extra,rarity:'common',tier:1,unique:true,lowLoot:true,color:id==='straw-hat'?'#d5b667':'#b4aa87'}]));
export function lowLevelLoot(level,roll,pick){return level>=1&&level<=5&&roll<.2?entries[Math.min(9,Math.max(0,Math.floor(pick*10)))][0]:null;}
export function footwearSpeed(s){if(s.equippedBoots==='snowshoes')return s.mode==='world'&&s.region===3?2:.5;return s.mode==='world'&&s.equippedBoots==='boots-slime-skating'?2:1;}
export function travelSteps(s){const speed=s.mode==='world'&&mountFor(s)?Math.max(footwearSpeed(s),mountFor(s).speed):footwearSpeed(s);s.flags??={};if(speed===.5){s.flags.snowshoeStep=s.flags.snowshoeStep===1?0:1;return s.flags.snowshoeStep===0?1:0;}s.flags.snowshoeStep=0;return speed;}
export function junkArt(item){const art={
 hat:'<ellipse cx="100" cy="142" rx="88" ry="25" fill="#b79345"/><path d="M48 137 L61 71 Q100 45 139 71 L152 137 Q100 157 48 137Z" fill="#d6b861"/><path d="M52 120 Q100 140 148 120 L151 135 Q100 153 49 135Z" fill="#6e5840"/><path d="M70 76 L62 119 M90 68 L87 126 M112 68 L116 126 M132 77 L141 119" stroke="#ae8f44"/>',
 gloves:'<path d="M60 184 L48 128 L28 100 Q25 81 40 90 L61 113 L52 49 Q58 34 66 51 L78 98 L77 38 Q85 23 92 42 L99 99 L106 44 Q118 31 122 49 L119 110 L134 69 Q151 58 151 77 L138 146 L132 184Z"/><path d="M57 153 H136 M63 170 H132"/>',
 knife:'<path d="M88 143 L97 35 L120 74 L112 143Z" fill="#9e8f77"/><path d="M92 145 H117 V203 H92Z" fill="#65503c"/><path d="M85 145 H125 M104 55 L99 126 M100 167 H111 M100 185 H111"/>',
 'nose-tool':'<path d="M83 190 L106 64 Q114 35 131 53 Q145 75 123 81 L116 77" fill="none" stroke-width="12"/><path d="M80 164 L96 168 M83 148 L99 152"/>',
 compass:'<circle cx="100" cy="109" r="67" fill="#ab9458"/><circle cx="100" cy="109" r="51" fill="#d9cda9"/><path d="M100 63 V76 M100 143 V156 M54 109 H68 M132 109 H146 M100 109 L123 81 L116 121Z"/><path d="M77 61 L103 96 L85 124 L124 156" fill="none" stroke="#534d3f" stroke-width="5"/>',
 'old-boot':'<path d="M58 34 H129 L123 128 Q174 134 177 169 Q130 195 48 172 L58 34Z" fill="#715444"/><path d="M59 59 H127 M53 157 Q112 179 174 159 M87 73 L114 88 M84 92 L110 107 M82 111 L108 126"/><path d="M58 138 L71 125 L77 144Z" fill="#c1b191"/>',
 'fishing-pole':'<path d="M41 195 Q77 69 120 27" fill="none" stroke="#b08a51" stroke-width="9"/><path d="M120 27 Q173 97 151 159 Q147 179 132 164 M151 159 L141 150" fill="none" stroke="#ccc6a1" stroke-width="3"/>',
 snowshoes:'<ellipse cx="62" cy="111" rx="36" ry="91" fill="#80613f"/><ellipse cx="144" cy="111" rx="36" ry="91" fill="#80613f"/><ellipse cx="62" cy="111" rx="27" ry="78" fill="#c6b27d"/><ellipse cx="144" cy="111" rx="27" ry="78" fill="#c6b27d"/><path d="M38 65 L85 154 M39 108 L77 178 M42 156 L83 66 M47 181 L86 105 M120 65 L167 154 M121 108 L159 178 M124 156 L165 66 M129 181 L168 105 M40 112 H83 M122 112 H165" fill="none"/><path d="M49 104 H76 V128 H49Z M131 104 H158 V128 H131Z" fill="#5d4d3c"/>',
 scroll:'<path d="M45 35 H158 Q178 35 170 64 H144 V180 H46 Q23 180 29 156 H55 V58 Q55 35 45 35Z" fill="#d7c39b"/><path d="M55 58 H144 M76 83 H123 M76 106 H123 M76 129 H114 M76 152 H122" stroke="#7e6c55"/>'
 };return `<svg class="item-art" viewBox="0 0 200 220" role="img" aria-label="${item.name}"><g fill="${item.color}" stroke="#4f4938" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${art[item.shape]||art.scroll}</g></svg>`;}

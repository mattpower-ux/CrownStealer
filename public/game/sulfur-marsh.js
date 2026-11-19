export const SULFUR_MARSH='wild-5';
const species=[
 ['sulfur-scale-warrior','Sulfur-Scale Warrior','armored',18],
 ['sulfur-lizard-priest','Lizard Priest of the Fuming Idol','spectral',19,'poison'],
 ['sulfur-swamp-raptor','Swamp Raptor','swift',19],
 ['sulfur-crocodile-guard','Crocodile Temple Guard','brute',20],
 ['sulfur-serpent-seer','Serpent Seer','spectral',21,'poison'],
 ['sulfur-bog-drake','Bog Drake','brute',22,'poison'],
 ['sulfur-frill-stalker','Frill-Neck Stalker','swift',22],
 ['sulfur-scale-champion','Blackscale Champion','armored',23],
 ['sulfur-egg-tender','Raptor Egg Tender','swift',20],
];
export const SULFUR_ENEMIES=species.map(([id,name,kind,level,element])=>({id,name,kind,level,element,region:1,wild:true,reptile:true,weakness:kind==='armored'?'steady pressure':kind==='brute'?'guard then counter':'quick strikes'}));
export const SULFUR_LAIR_NAMES=['Raptor Nest','Blackscale Warren','Lizard Priest Fane','Serpent-Mouth Cave','Bog Drake Den','Fuming Egg Vault','Crocodile Guard Hold','Sulfur-Scale Burrow'];
export const isSulfurMarsh=state=>state?.exploration?.area===SULFUR_MARSH||state?.dungeon?.expedition?.startsWith(SULFUR_MARSH+'-cave-')||state?.dungeon?.minorId?.startsWith('minor-w5-');

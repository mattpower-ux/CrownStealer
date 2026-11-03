const names=['Briarblade Grotto','Amber Ward Barrow','Moss Apothecary','Hollow Rune Sanctum','Whispersteel Mine','Emberjaw Cavern','Copperfrost Hollow','Stormglass Burrow','Ashblade Refuge','Cinder Ward Crypt','Sulfur Still Cavern','Black Rune Hollow','Saltsteel Vault','Coralfire Grotto','Pearlfrost Cave','Tempest Burrow','Starblade Hollow','Moon Ward Barrow','Nightdew Cavern','Silent Rune Sanctum','Fallensteel Mine','Ashfire Hollow','Winterglass Grotto','Thunderbone Cave'];
const themes=[
 {specialty:'blades',wall:0,tint:[12,7,-3],color:'#c5a66b',icon:'cave',description:'Old weapon caches favor swords, axes and spears.'},
 {specialty:'wards',wall:1,tint:[-5,8,15],color:'#8fc9d8',icon:'barrow',description:'Buried offerings favor rings and protective necklaces.'},
 {specialty:'brews',wall:5,tint:[0,16,-2],color:'#9ecb77',icon:'cave',description:'Abandoned stores favor healing and other potions.'},
 {specialty:'arcana',wall:7,tint:[13,-3,18],color:'#c69fe4',icon:'ruined-tower',description:'Sealed caches favor scrolls and charged wands.'},
 {specialty:'armor',wall:6,tint:[5,5,8],color:'#bec8d4',icon:'crypt',description:'Forgotten armories favor armor and protective gear.'},
 {specialty:'fire',wall:3,tint:[20,0,-8],color:'#edab71',icon:'cave',description:'Heat-blackened hoards favor fire-enchanted equipment.'},
 {specialty:'frost',wall:1,tint:[-6,10,22],color:'#b7e5eb',icon:'barrow',description:'Cold caches favor frost-enchanted equipment.'},
 {specialty:'storm',wall:2,tint:[10,5,10],color:'#e7d883',icon:'crypt',description:'Ancient stores favor lightning weapons and electric wands.'}
];
export function caveProfile(id){const m=/^wild-(\d+)-cave-([01])$/.exec(id||'');if(!m)return null;const n=Number(m[1])*2+Number(m[2]);if(n>=24)return null;const theme=themes[n%8],variant=Math.floor(n/8);return {...theme,tint:theme.tint.map((v,i)=>v+variant*[4,-2,3][i]),name:names[n],variant};}
export function caveLootMatches(item,profile){if(!profile)return true;switch(profile.specialty){case 'blades':return item.kind==='weapon'&&['sword','axe','spear'].includes(item.family);case 'wards':return ['ring','necklace'].includes(item.kind);case 'brews':return item.kind==='potion';case 'arcana':return ['scroll','wand'].includes(item.kind);case 'armor':return ['armor','shield','boots','head','hands'].includes(item.kind);case 'fire':return item.element==='fire'||item.resistance==='fire';case 'frost':return item.element==='frost'||item.resistance==='frost';case 'storm':return !!item.stormDamage||item.kind==='wand'&&item.spell==='lightning-strike';default:return true;}}

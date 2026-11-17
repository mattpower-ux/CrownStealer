export const GUARDED_SLEEP={id:'scroll-guarded-sleep',name:'Scroll of Guarded Sleep',kind:'scroll',shape:'scroll',rarity:'rare',tier:1,minLevel:5,value:120,color:'#92b6e2',description:'Read before setting up camp. Reduces the next night’s ambush chance by 90 percent. Consumed when read.'};
export const campAmbushChance=s=>s.flags?.guardedSleep?.025:.25;
export const idleEncounterChance=travelChance=>travelChance/2;
export const canCamp=s=>s.mode==='world'&&s.hp>0&&!s.flags?.impaledMoves&&!s.flags?.wildernessEvent&&!s.flags?.peacefulEncounter;

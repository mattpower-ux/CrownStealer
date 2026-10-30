export const HOUR_MS=3600000,DAY_MS=24*HOUR_MS,TIME_SCALE=48;
export const worldTimeMs=s=>s.worldTimeMs??Math.floor((s.turns||0)*DAY_MS/240);
export const gameDay=s=>Math.floor(worldTimeMs(s)/DAY_MS);
export const isNight=s=>{const hour=Math.floor(worldTimeMs(s)%DAY_MS/HOUR_MS);return hour>=20||hour<6;};
export const wildernessChance=(s,base)=>base*(isNight(s)?1.5:1)*((s.buffExpiry?.tiny||0)>worldTimeMs(s)?.5:1);
export function clockLabel(s){const time=worldTimeMs(s),hour=Math.floor(time%DAY_MS/HOUR_MS),minute=Math.floor(time%HOUR_MS/60000);return `Day ${gameDay(s)+1} · ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')} · ${isNight(s)?'Night':'Daylight'}`;}
export function prepareClock(s){s.worldTimeMs??=worldTimeMs(s);s.buffExpiry??={};for(const effect of ['strength','invisibility','meal','waterBreathing'])if(s.buffs?.[effect]>0&&s.buffExpiry[effect]===undefined)s.buffExpiry[effect]=s.worldTimeMs+(effect==='meal'?30:s.buffs[effect]*5)*60000;}
export function expireBuffs(s){for(const effect of ['pigFace','tiny','helium'])if(s.buffExpiry?.[effect]!==undefined&&s.worldTimeMs>=s.buffExpiry[effect])delete s.buffExpiry[effect];for(const effect of ['strength','invisibility','meal','waterBreathing'])if(s.buffExpiry?.[effect]!==undefined&&s.worldTimeMs>=s.buffExpiry[effect]){s.buffs[effect]=0;delete s.buffExpiry[effect];}}
export function advanceClock(s,realMs){if(!Number.isFinite(realMs)||realMs<0||realMs>3600000)return;prepareClock(s);s.worldTimeMs+=Math.round(realMs*TIME_SCALE);expireBuffs(s);}
export function setTimedBuff(s,effect,durationMinutes){prepareClock(s);s.buffExpiry[effect]=s.worldTimeMs+durationMinutes*60000;}
export function buffTimeLeft(s,effect){return Math.max(0,Math.ceil(((s.buffExpiry?.[effect]||0)-worldTimeMs(s))/60000));}
export function nightEnemy(s,enemy){if(s.mode!=='world'||!isNight(s)||enemy.guard)return enemy;return {...enemy,hp:Math.ceil(enemy.hp*1.25),maxHp:Math.ceil(enemy.maxHp*1.25),attack:Math.ceil(enemy.attack*1.25),armor:Math.ceil((enemy.armor||0)*1.25),nightEmpowered:true};}


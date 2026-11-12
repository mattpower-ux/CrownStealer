import {minorSiteDefinition} from './minor-sites.js';
import {DUNGEONS} from './content.js';
import {BOTTOMLESS_PIT,PIT_FLOORS} from './bottomless-pit.js';
import {PUTRID_PALACE,PUTRID_PALACE_FLOORS} from './royal-trials.js';
import {ROYAL_DUNGEON_ID} from './royal-dungeon.js';
export const REGION_DEPTHS=[10,15,20,100];
export const dungeonFloors=d=>d.site==='minor-site'?(minorSiteDefinition(d.minorId)?.floors||1):d.site==='roadside-crypt'||d.site===ROYAL_DUNGEON_ID?1:d.site===BOTTOMLESS_PIT.id?PIT_FLOORS:d.site===PUTRID_PALACE.id?PUTRID_PALACE_FLOORS:d.site==='firedrak'?10:d.ship||d.royal?1:d.expedition?3:d.site==='elf-village'?4:REGION_DEPTHS[DUNGEONS[d.index]?.region||0];

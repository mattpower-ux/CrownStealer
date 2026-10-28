import {DUNGEONS} from './content.js';
export const REGION_DEPTHS=[10,15,20,100];
export const dungeonFloors=d=>d.ship||d.royal?1:d.expedition?3:d.site==='elf-village'?4:REGION_DEPTHS[DUNGEONS[d.index]?.region||0];

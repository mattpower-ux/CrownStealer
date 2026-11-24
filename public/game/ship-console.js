export const SHIP_CONTROL_STATION={x:7,y:5};

export function atShipConsole(state){
 const d=state?.dungeon;
 return state?.mode==='dungeon'&&d?.ship===true&&d.x===SHIP_CONTROL_STATION.x&&d.y===SHIP_CONTROL_STATION.y;
}

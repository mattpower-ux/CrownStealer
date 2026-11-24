export function atShipConsole(state){
 const d=state?.dungeon;
 return state?.mode==='dungeon'&&d?.ship===true&&d.x===7&&d.y===5;
}

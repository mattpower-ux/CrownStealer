const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function secretSearchMapMarkup(state,map,{chance=0,message=''}={}){
 const d=state.dungeon,radius=6,size=radius*2+1,cells=[];
 for(let row=0;row<size;row++)for(let col=0;col<size;col++){
  const x=d.x+col-radius,y=d.y+row-radius,tile=map[y]?.[x];
  const kind=tile===undefined?'void':tile===1?'wall':'floor';
  cells.push(`<rect class="secret-map-${kind}" x="${col}" y="${row}" width="1" height="1"/>`);
 }
 if(d.secretRoom){
  const col=d.secretRoom.x-d.x+radius,row=d.secretRoom.y-d.y+radius;
  if(col>=0&&col<size&&row>=0&&row<size)cells.push(`<rect class="secret-map-door" x="${col+.08}" y="${row+.08}" width=".84" height=".84" rx=".12"/><path class="secret-map-door-mark" d="M${col+.27} ${row+.68}L${col+.5} ${row+.28}L${col+.73} ${row+.68}"/>`);
 }
 const angle=(Number(d.dir)||0)*90;
 cells.push(`<g class="secret-map-player" transform="translate(${radius+.5} ${radius+.5}) rotate(${angle})"><circle r=".42"/><path d="M0 -.35L.24 .2L0 .1L-.24 .2Z"/></g>`);
 const status=d.secretRoom?'Hidden door revealed in gold.':message||'No hidden door has been revealed in this search.';
 return `<section class="secret-search-window"><div class="secret-search-map"><svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Map of the immediate sixty-foot area around the player"><title>Immediate area search map</title>${cells.join('')}</svg></div><div class="secret-search-legend"><span><i class="legend-player"></i>You</span><span><i class="legend-wall"></i>Wall</span><span><i class="legend-secret"></i>Hidden door</span></div><p class="secret-search-status" role="status">${esc(status)}</p><p class="secret-search-odds">Search chance: <strong>${Math.round(chance*100)}%</strong> · Radius: about 60 feet · Cost: 1 turn / 5 game minutes</p><div class="panel-actions">${d.secretRoom?'':'<button class="primary" data-action="{&quot;type&quot;:&quot;searchSecrets&quot;}">Search this area</button>'}<button type="button" data-close-percival>Return to exploring</button></div></section>`;
}

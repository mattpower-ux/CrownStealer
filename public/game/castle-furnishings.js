const artIndex = {bed: 0, chair: 1, table: 2, throne: 3};
// Decorative furnishings preserve old movement/save coordinates and leave interaction markers clear.
export function castleFurnishings(layout) {
  const blocked = new Set([...(layout.books || []), ...layout.chests, ...layout.guards, ...(layout.patrols || []),
    layout.entrance, layout.dungeonStair, layout.king, layout.princess, layout.governor]
    .filter(Boolean).map(p => p.x + ',' + p.y));
  const result = [];
  const place = (room, kind, dx, dy) => {
    const candidates = [];
    for(let y=room.y;y<room.y+room.height;y++)for(let x=room.x;x<room.x+room.width;x++){
      if(blocked.has(x+','+y)||['wall','door','exit','stair'].includes(layout.tiles[y]?.[x]))continue;
      candidates.push({x,y,d:Math.abs(x-room.x-dx)+Math.abs(y-room.y-dy)});
    }
    candidates.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);
    const p=candidates[0];if(!p)return;
    blocked.add(p.x+','+p.y);result.push({id:room.id+'-'+kind+'-'+result.length,kind,artIndex:artIndex[kind],room:room.id,x:p.x,y:p.y});
  };
  for(const room of layout.rooms){
    const cx=Math.floor(room.width/2),cy=Math.floor(room.height/2);
    if(room.id==='audience'){place(room,'throne',cx,0);continue;}
    if(['royal-fun','chastity','guest','servants','guardroom'].includes(room.id)){
      place(room,'bed',0,0);if(['guardroom','servants'].includes(room.id))place(room,'bed',room.width-1,0);
      place(room,'chair',room.width-1,room.height-1);
    }
    if(['council','banquet','archive','library','kitchen','vestibule','guardroom'].includes(room.id)){
      place(room,'table',cx,cy);place(room,'chair',cx-1,cy);place(room,'chair',cx+1,cy);
    }
    if(room.id==='chapel'){place(room,'chair',1,1);place(room,'chair',room.width-2,2);}
  }
  return result;
}

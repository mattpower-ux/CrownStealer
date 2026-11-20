export const barrensPalette={
  ground:'#332b29',
  light:'#72615a',
  road:'#62504a',
  edge:'#211b1b',
  water:'#263b35',
  waterLight:'#6f7655',
  deadWood:'#211918',
  deadWoodLight:'#55413a',
  ruin:'#756d66',
  ruinDark:'#302b2b',
  mountain:'#252326',
  mountainTop:'#08090b',
};

export function isWhisperingBarrensMap(map){
  return map?.area?.id==='wild-2';
}

function coordinateHash(x,y){
  let value=((x*73856093)^(y*19349663)^0x9e3779b9)>>>0;
  value=(Math.imul(value,1664525)+1013904223)>>>0;
  return value;
}

export function barrensScenery(x,y){
  const value=coordinateHash(x,y);
  if(value%17===0)return 'ruin';
  if(value%3===0)return 'dead-tree';
  return 'ash';
}

export function drawBarrensDeadTree(c,x,y,size,seed=0){
  c.save();
  c.strokeStyle=seed%2?barrensPalette.deadWoodLight:barrensPalette.deadWood;
  c.lineCap='round';
  c.lineJoin='round';
  c.lineWidth=Math.max(1,size*.07);
  c.beginPath();
  c.moveTo(x+size*.5,y+size*.92);
  c.lineTo(x+size*.48,y+size*.34);
  c.lineTo(x+size*.27,y+size*.13);
  c.moveTo(x+size*.47,y+size*.43);
  c.lineTo(x+size*.72,y+size*.22);
  c.lineTo(x+size*.79,y+size*.09);
  c.moveTo(x+size*.34,y+size*.26);
  c.lineTo(x+size*.27,y+size*.06);
  c.moveTo(x+size*.64,y+size*.29);
  c.lineTo(x+size*.88,y+size*.32);
  c.stroke();
  c.fillStyle='#0d0b0b55';
  c.beginPath();c.ellipse(x+size*.53,y+size*.91,size*.28,size*.08,0,0,Math.PI*2);c.fill();
  c.restore();
}

export function drawBarrensRuin(c,x,y,size,seed=0){
  c.save();
  c.fillStyle='#100e0e66';c.fillRect(x+size*.08,y+size*.77,size*.82,size*.12);
  const courses=3+(seed%2);
  for(let row=0;row<courses;row++){
    const yy=y+size*(.76-row*.14),blocks=Math.max(2,5-row);
    for(let block=0;block<blocks;block++){
      if((block+row+seed)%7===0)continue;
      const bx=x+size*(.12+block*.15+(row%2)*.04);
      c.fillStyle=(block+row)%2?barrensPalette.ruin:barrensPalette.ruinDark;
      c.fillRect(bx,yy,size*.14,size*.12);
      c.strokeStyle='#171313';c.lineWidth=Math.max(1,size*.018);c.strokeRect(bx,yy,size*.14,size*.12);
    }
  }
  c.restore();
}

import {SHIP_CONTROL_STATION} from './ship-console.js';

const DIRECTIONS=[[0,-1],[1,0],[0,1],[-1,0]];

export function shipConsoleLayout(d,width,height){
 const [dx,dy]=DIRECTIONS[d?.dir??0];
 const rx=SHIP_CONTROL_STATION.x-(d?.x??0),ry=SHIP_CONTROL_STATION.y-(d?.y??0);
 const depth=rx*dx+ry*dy,side=-rx*dy+ry*dx,here=rx===0&&ry===0;
 if(!here&&(depth<1||depth>4||Math.abs(side/depth)>.38))return {visible:false};
 const scale=here?Math.min(width*.34,height*.38):Math.min(width*.20,height*.24)/Math.max(1,depth*.48);
 const frame={x:width/2+(here?0:side/depth*width*.46)-scale/2,y:height*.61-scale*.52,width:scale,height:scale*.68};
 const screen={x:frame.x+scale*.10,y:frame.y+scale*.09,width:scale*.80,height:scale*.29};
 const count=6,gap=scale*.045,buttonWidth=(scale*.80-gap*(count-1))/count;
 const buttons=Array.from({length:count},(_,index)=>({x:frame.x+scale*.10+index*(buttonWidth+gap),y:frame.y+scale*.47,width:buttonWidth,height:scale*.075,tint:index%2?'#f6c776':'#95b9f1'}));
 return {visible:true,frame,screen,buttons,label:{x:frame.x+frame.width/2,y:frame.y+frame.height+scale*.13,size:Math.max(10,scale*.065)}};
}

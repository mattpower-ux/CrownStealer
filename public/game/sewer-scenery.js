// A compact wet-brick palette and procedural grime; no texture downloads.
export const SEWER_WALL={name:'Wet royal sewer brick',tint:[-25,14,16],rows:11,columns:5,wear:1,ceiling:'#041414',floor:'#12302b',map:'#426a60'};
export function sewerWallInk(kind,u,v,time=0){
 const drip=.10+Math.max(0,Math.sin(u*39+kind*2))**12*.37;
 if(v<drip&&kind%3!==0)return v<.075?'#345f2c':Math.abs(Math.sin(u*59+kind))>.65?'#659344':'#47753a';
 if(v>.82+Math.sin(u*20+kind)*.055&&kind%2===0)return '#32593a';
 if(kind===4||kind===5){const horizontal=Math.abs(v-.3)<.022&&u<.7,pipe=u>.62&&u<.69&&v>.3&&v<.55;
  if(horizontal||pipe)return Math.abs(v-.29)<.006||u>.67?'#79847a':'#414e47';
  if(u>.62&&u<.69&&v>=.55&&v<.73)return '#5b6532';
  const drop=.73+(time*.00012%1)*.2;if(Math.abs(u-.655)<.009&&Math.abs(v-drop)<.018)return '#818b45';
 }
 if(kind===7||kind===8){const x=u-.5,y=v-.28;if(Math.abs(x)<.045&&Math.abs(y)<.07){if(Math.abs(x)>.035||Math.abs(y)>.058||Math.abs(x)<.006)return '#47615c';return '#8bd8c0';}}
 // A few pale glints on wet brick faces.
 if(kind%4===0&&v>.12&&v<.8&&(v*11)%1>.11&&(v*11)%1<.14&&(u*5)%1>.12&&(u*5)%1<.65)return '#517d73';
 return null;
}
export function drawSewerChannel(c,w,h,time=0){
 const horizon=h*.5,channel=c.createLinearGradient(0,horizon,0,h);channel.addColorStop(0,'#082523');channel.addColorStop(1,'#071e1d');
 c.beginPath();c.moveTo(w*.47,horizon);c.lineTo(w*.53,horizon);c.lineTo(w*.79,h);c.lineTo(w*.21,h);c.closePath();c.fillStyle=channel;c.fill();
 for(const side of [-1,1]){c.beginPath();c.moveTo(w*(.5+side*.034),horizon);c.lineTo(w*(.5+side*.305),h);c.strokeStyle='#263e31';c.lineWidth=9;c.stroke();c.strokeStyle='#466944';c.lineWidth=2;c.stroke();}
 c.save();for(let i=0;i<23;i++){const depth=(i+1)/24,yy=horizon+depth*depth*h*.5,spread=(.03+depth*.2)*w,phase=Math.sin(i*2.7+time*.00065),xx=w*.5+phase*spread*.55;c.fillStyle=i%3===0?'#70c1a26b':'#2f796c80';c.fillRect(Math.round(xx),Math.round(yy),Math.max(3,spread*.18),depth>.65?3:2);}
 c.restore();
 // Low curved ceiling ribs give a hint of a vaulted drainage tunnel.
 c.strokeStyle='#33595066';c.lineWidth=4;for(const scale of [.8,1.15,1.6]){c.beginPath();c.moveTo(w*.5-w*.38*scale,h*.5);c.bezierCurveTo(w*.5-w*.4*scale,h*.5-h*.48*scale,w*.5+w*.4*scale,h*.5-h*.48*scale,w*.5+w*.38*scale,h*.5);c.stroke();}
}

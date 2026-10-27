// Shared town geometry keeps entrances, collision, touch movement and art aligned.
export const TOWN_SIZE=13;
export const TOWN_PLACES=[
 {id:'inn',name:'The Lantern Inn',x:3,y:5,art:0,bx:2,by:3,bw:2,bh:2},
 {id:'shop',name:'Market',x:9,y:5,art:1,bx:8,by:3,bw:2,bh:2},
 {id:'casino',name:'The Gilded Goose',x:3,y:9,art:2,bx:2,by:7,bw:2,bh:2},
 {id:'court',name:'Court & Watch',x:9,y:9,art:3,bx:8,by:7,bw:2,bh:2},
 {id:'quests',name:'Story House',x:3,y:11,art:0,bx:2,by:9,bw:2,bh:2},
 {id:'talk',name:'Town Hall',x:6,y:4,art:3,bx:5,by:2,bw:2,bh:2},
 {id:'fortune',name:'Fortune Teller',x:10,y:11,art:5,bx:9,by:9,bw:2,bh:2},
 {id:'gate',name:'Leave town',x:6,y:12,art:7}
];
export function townPosition(s){return s.townPosition||{x:6,y:11};}
export function townPlace(s){const p=townPosition(s);return TOWN_PLACES.find(b=>b.x===p.x&&b.y===p.y);}
export function townWalkable(x,y){if(x===6&&y===12)return true;if(x<1||x>11||y<1||y>11)return false;return !TOWN_PLACES.some(b=>b.bw&&x>=b.bx&&x<b.bx+b.bw&&y>=b.by&&y<b.by+b.bh);}

export function wallDetailKind(x,y,dungeon){return Math.abs(Math.imul(x+1,17)+Math.imul(y+1,31)+dungeon*13)%23;}
export function wallDetail(kind,u,v,time){
 if(kind<4&&v>.22&&v<.72){const cut=u-(v-.22)*.44;for(const x of [.26,.38,.5]){if(Math.abs(cut-x)<.012)return '#101614';if(Math.abs(cut-x-.018)<.007)return '#74786a';}}
 if(kind>=4&&kind<7&&u<.48&&v<.38){const x=u-.025,y=(v-.025)*1.35;if(x>=0&&y>=0){const radius=Math.hypot(x,y);if(radius<.43&&(Math.abs((radius*11)%1)<.07||Math.abs(y-x)<.008||Math.abs(y-x*.4)<.007||Math.abs(y-x*2.4)<.008||x<.007||y<.007))return '#9aab9a99';}}
 if(kind>=7&&kind<9){if(Math.abs(u-.5)<.028&&v>.43&&v<.76)return '#49301c';if(Math.abs(u-.5)<.065&&v>.48&&v<.53)return '#151d1c';const flicker=1+Math.sin(time*.006+kind)*.12;if(((u-.5)/(.055*flicker))**2+((v-.36)/.115)**2<1)return Math.abs(u-.5)<.023?'#ffe49a':'#e88b32';}
 return null;
}

// Find the main connected silhouette once per sprite, excluding neighboring atlas fragments.
export function silhouetteComponents(data,width,height){
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height);const components=[];
 for(let start=0;start<seen.length;start++){
  if(seen[start]||data[start*4+3]<32)continue;
  let head=0,tail=1,minX=width,minY=height,maxX=0,maxY=0;queue[0]=start;seen[start]=1;
  while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   for(const n of [x>0?p-1:-1,x<width-1?p+1:-1,y>0?p-width:-1,y<height-1?p+width:-1])if(n>=0&&!seen[n]&&data[n*4+3]>=32){seen[n]=1;queue[tail++]=n;}
  }
  components.push({x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1,count:tail});
 }
 return components;
}

export function silhouetteBounds(data,width,height){return silhouetteComponents(data,width,height).sort((a,b)=>b.count-a.count)[0]||{x:0,y:0,width,height,count:0};}

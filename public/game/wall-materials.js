const atlas=new Image();atlas.src='/assets/wall-materials.webp';let pixels=null;export let wallMaterialRevision=0;
atlas.onload=()=>{const c=document.createElement('canvas');c.width=atlas.width;c.height=atlas.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(atlas,0,0);pixels=ctx.getImageData(0,0,c.width,c.height).data;wallMaterialRevision++;};
export function wallMaterial(index,u,v,light){if(!pixels)return null;index=(index+8)%8;const size=atlas.width/4,x=Math.min(size-1,Math.floor(u*size))+index%4*size,y=Math.min(size-1,Math.floor(v*size))+Math.floor(index/4)*size,k=(y*atlas.width+x)*4;return `rgb(${Math.floor(pixels[k]*light)},${Math.floor(pixels[k+1]*light)},${Math.floor(pixels[k+2]*light)})`;}
export function alienWallInk(kind,u,v){
 if(kind%4===0&&v>.25&&v<.65){const row=Math.floor((v-.25)*20),col=Math.floor(u*16);if(col>2&&col<14&&((col+row*3+kind)%7<2||row%3===0&&col%3===0))return '#a9c7a0';}
 if(kind%9===1){const ship=((u-.5)/.22)**2+((v-.33)/.04)**2<1,planet=((u-.5)/.24)**2+((v-.68)/.1)**2<1,beam=v>.37&&v<.6&&Math.abs(u-.5)<(v-.3)*.35;if(ship||planet)return '#b6a67c';if(beam)return '#71bdb0';}
 return null;
}

// Packed native RGBA pixels avoid building CSS rgb strings for every wall sample.
export function wallMaterialPixel(index,u,v,light){if(!pixels)return null;index=(index+8)%8;const size=atlas.width/4,x=Math.min(size-1,Math.floor(u*size))+index%4*size,y=Math.min(size-1,Math.floor(v*size))+Math.floor(index/4)*size,k=(y*atlas.width+x)*4;return (255<<24)|(Math.floor(pixels[k+2]*light)<<16)|(Math.floor(pixels[k+1]*light)<<8)|Math.floor(pixels[k]*light);}

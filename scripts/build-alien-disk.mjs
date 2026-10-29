import {readFile,writeFile} from 'node:fs/promises';
const encoded=(await readFile('public/assets/alien-disk.webp')).toString('base64');
const pt=(angle,r,offset=0)=>[128+Math.cos(angle)*r-Math.sin(angle)*offset,128+Math.sin(angle)*r+Math.cos(angle)*offset];
const boundary=k=>Array.from({length:61},(_,j)=>{const r=j*2.5,a=-Math.PI/2+k*Math.PI/5,tab=13*Math.exp(-(((r-76)/9)**2))-6*Math.exp(-(((r-97)/8)**2));return pt(a,r,tab).map(v=>v.toFixed(2)).join(',')});
const pieces=Array.from({length:10},(_,k)=>{const a=boundary(k),b=boundary(k+1).reverse();return 'M'+a.join(' L')+' L'+b.join(' L')+' Z'});
const order=[0,5,2,7,4,9,1,6,3,8];
for(let count=0;count<=10;count++){
 const mask=order.slice(0,count).map(k=>'<path d="'+pieces[k]+'"/>').join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="Ancient alien disk, ${count} of 10 pieces"><defs><clipPath id="pieces">${mask}</clipPath><clipPath id="round"><circle cx="128" cy="128" r="122"/></clipPath></defs><circle cx="128" cy="128" r="121" fill="#102b35" fill-opacity=".16" stroke="#68979f" stroke-opacity=".45" stroke-width="1" stroke-dasharray="3 4"/><g clip-path="url(#round)" fill="none" stroke="#68979f" stroke-opacity=".2" stroke-width=".7">${pieces.map(d=>'<path d="'+d+'"/>').join('')}</g><image width="256" height="256" href="data:image/webp;base64,${encoded}" clip-path="url(#pieces)"/></svg>`;
 await writeFile('public/assets/alien-disk-'+count+'.svg',svg);
}
console.log('Generated 11 consistent jigsaw progress illustrations.');

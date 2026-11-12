const splash=document.getElementById('studio-splash');
if(splash){
 const screens=[document.getElementById('title-screen'),document.getElementById('game')].filter(Boolean);
 const previous=screens.map(screen=>screen.inert);
 screens.forEach(screen=>{screen.inert=true;});
 let finished=false;
 const dismiss=event=>{
  if(finished)return;finished=true;
  if(event){event.preventDefault();event.stopImmediatePropagation();}
  clearTimeout(timer);document.removeEventListener('keydown',dismiss,true);splash.removeEventListener('pointerdown',dismiss);
  splash.classList.add('is-leaving');
  setTimeout(()=>{splash.remove();screens.forEach((screen,index)=>{screen.inert=previous[index];});},matchMedia('(prefers-reduced-motion: reduce)').matches?0:400);
 };
 const timer=setTimeout(dismiss,2400);
 document.addEventListener('keydown',dismiss,true);splash.addEventListener('pointerdown',dismiss);
}

const button=document.createElement('button');
button.id='fullscreen-toggle';button.type='button';
function refresh(){const active=!!document.fullscreenElement;button.textContent=active?'⛶ Exit full screen':'⛶ Full screen';button.setAttribute('aria-label',active?'Exit full screen':'Enter full screen');button.setAttribute('aria-pressed',String(active));}
button.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{button.textContent='Full screen unavailable';}});
document.querySelector('.game-header nav').prepend(button);document.addEventListener('fullscreenchange',refresh);refresh();

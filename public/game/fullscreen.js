const button=document.createElement('button');
button.id='fullscreen-toggle';button.type='button';
function refresh(){const active=!!document.fullscreenElement;button.textContent=active?'⛶ Exit full screen':'⛶ Full screen';button.setAttribute('aria-label',active?'Exit full screen':'Enter full screen');button.setAttribute('aria-pressed',String(active));}
button.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{button.textContent='Full screen unavailable';}});
document.querySelector('.game-header nav').prepend(button);document.addEventListener('fullscreenchange',refresh);refresh();

const info=document.createElement('button');info.id='info-toggle';info.type='button';info.textContent='Info';info.setAttribute('aria-expanded','false');info.setAttribute('aria-controls','adventure-info');const sidebar=document.querySelector('.sidebar');sidebar.id='adventure-info';info.addEventListener('click',()=>{const open=document.body.classList.toggle('info-open');info.setAttribute('aria-expanded',String(open));info.textContent=open?'Close info':'Info';});document.querySelector('.game-header nav').prepend(info);

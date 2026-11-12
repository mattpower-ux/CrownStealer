import {rouletteWheel} from './roulette-wheel.js';
import {DEALER_TAUNT,DEALERS,cardText,blackjackTotal,WINK_TARGET_RADIUS,winkHitsCup} from './casino.js';
import {TOWNS} from './content.js';

const winkColors=['ruby','jade','amber'];
const onBoard=point=>Math.max(0,Math.min(100,point));
const aimText=(power,projected)=>power+' power, projected landing '+projected;
const cupArt=`<svg class="winks-cup" viewBox="0 0 90 74" aria-hidden="true">
 <defs><linearGradient id="winks-brass" x2="1" y2=".15">
  <stop stop-color="#75452b"/><stop offset=".35" stop-color="#df9a4c"/><stop offset=".55" stop-color="#ffcf76"/><stop offset="1" stop-color="#99562d"/>
 </linearGradient></defs>
 <ellipse cx="45" cy="66" rx="37" ry="7" fill="#0b241e" opacity=".68"/>
 <path d="M18 29h54l-7 25c-2 8-9 12-20 12s-18-4-20-12z" fill="url(#winks-brass)" stroke="#73442b" stroke-width="2"/>
 <path d="M24 41c12 7 30 8 42 0M28 53c10 5 24 5 34 0" fill="none" stroke="#82502f" stroke-width="2" opacity=".7"/>
 <path d="M28 39l5 15" fill="none" stroke="#ffe2a0" stroke-linecap="round" stroke-width="3" opacity=".65"/>
 <ellipse class="winks-cup-rim" cx="45" cy="27" rx="32" ry="12" fill="#e7ad5e" stroke="#ffdc91" stroke-width="2"/>
 <ellipse cx="45" cy="27" rx="25" ry="7" fill="#382820"/>
 <path d="M23 24c10-6 31-7 44 0" fill="none" stroke="#f9d384" stroke-linecap="round" stroke-width="2"/>
</svg>`;

export function updateWinkAim(slider) {
 const game=slider.closest('.winks-game');
 const power=Number(slider.value),projected=power+Number(game.dataset.drift);
 game.querySelector('.winks-board').style.setProperty('--aim',onBoard(projected)+'%');
 game.querySelector('[data-wink-power]').textContent=power;
 game.querySelector('[data-wink-projection]').textContent=projected;
 slider.setAttribute('aria-valuetext',aimText(power,projected));
}

function tiddlywinksView(r,esc,animate) {
 const projected=r.target+r.wind;
 const drift=r.wind===0?'No drift':'Drift '+Math.abs(r.wind)+(r.wind<0?' left':' right');
 const lastLanding=Number.isInteger(r.landing)?r.landing:null;
 const hit=lastLanding!==null&&winkHitsCup(lastLanding,r.target);
 const flying=animate&&lastLanding!==null;
 const shots=winkColors.map((color,index)=>{
  const landing=r.landings?.[index]??(index===r.shots-1?lastLanding:null);
  const status=index>=r.shots?'ready':landing===null?'played':winkHitsCup(landing,r.target)?'hit':'miss';
  const label={ready:'Ready to flick',played:'Played',hit:'In the cup',miss:'Missed'}[status];
  const name='Shot '+(index+1)+': '+(status==='ready'?label:label.toLowerCase());
  return `<li class="winks-shot" data-shot-status="${status}" aria-label="${name}">
   <span class="winks-disc winks-disc--${color}" aria-hidden="true"></span><span aria-hidden="true">${label}</span>
  </li>`;
 }).join('');
 const status=lastLanding===null?'':(hit?'In the cup!':'Miss. Landed '+Math.abs(lastLanding-r.target)+' '+(lastLanding<r.target?'left':'right')+' of the cup.')+(r.active?'':' '+r.message);
 const aim=r.active?`<span class="winks-aim" data-wink-aim><i></i></span>
  <span class="winks-launch"><i class="winks-disc winks-disc--${winkColors[r.shots]}"></i></span>`:'';
 const flight=lastLanding===null?'':`<span class="winks-flight" data-wink-flight="${flying}" data-wink-hit="${hit}" style="--landing:${hit?r.target:onBoard(lastLanding)}%">
  <i class="winks-disc winks-disc--${winkColors[r.shots-1]}"></i>
 </span>`;
 return `<section class="winks-game" data-drift="${r.wind}" data-wink-animating="${flying}" aria-labelledby="winks-title">
  <header class="winks-header"><h3 id="winks-title">Tiddlywinks</h3><strong>${r.hits} / 3 in the cup</strong></header>
  <ol class="winks-shots" aria-label="Three shots">${shots}</ol>
  <div class="winks-board" role="img" aria-label="Felt game board. Cup at ${r.target}. ${drift}." style="--cup:${r.target}%;--aim:${onBoard(projected)}%;--target-width:${WINK_TARGET_RADIUS*2}%">
   <div class="winks-lane">
    <div class="winks-ruler">${[0,25,50,75,100].map(n=>`<span style="left:${n}%">${n}</span>`).join('')}</div>
    <span class="winks-zone"></span><span class="winks-cup-position" data-wink-hit="${hit}">${cupArt}</span>
    ${aim}${flight}
   </div>
  </div>
  ${r.active?`<div class="winks-controls">
   <div class="winks-power">
    <label for="wink-power">Shot power <output for="wink-power" data-wink-power>${r.target}</output></label>
    <input id="wink-power" type="range" min="0" max="100" value="${r.target}" aria-valuetext="${aimText(r.target,projected)}" aria-describedby="wink-help">
    <div class="winks-readout"><span>${drift}</span><span>Projected landing <b data-wink-projection>${projected}</b> · Cup <b>${r.target}</b></span></div>
   </div>
   <button id="shoot-wink" class="primary"${flying?' disabled':''}>Flick a wink</button>
  </div>`:''}
  <p id="casino-result" class="winks-result" role="status" data-wink-hit="${hit}">${esc(status)}</p>
  <p class="fine" id="wink-help">${r.active?'Line up the landing marker with the cup. Each shot can bounce a little. ':''}Land two of three winks to return triple your wager.</p>
 </section>`;
}

export function casinoView(s,button,esc,annoyed=false,{animateWink=false}={}){const index=Math.max(0,TOWNS.findIndex(t=>t.id===(s.location??s.casino?.town))),r=s.casino,active=r?.active,bet=Math.max(1,Math.min(r?.bet||5,s.gold));
 const cards=(hand,hold=false)=>`<div class="playing-hand">${hand.map((c,i)=>hold?`<button class="playing-card ${r.held[i]?'held':''}" data-action='{"type":"casinoHold","index":${i}}' aria-pressed="${r.held[i]}">${cardText(c)}<small>${r.held[i]?'HELD':'HOLD?'}</small></button>`:`<span class="playing-card">${cardText(c)}</span>`).join('')}</div>`;
 let game='';
 if(r?.game==='blackjack'){game=`<h3>Blackjack</h3><p>Dealer ${active?'':blackjackTotal(r.dealer)}</p>${cards(active?[r.dealer[0]]:r.dealer)}${active?'<span class="card-back">Hidden card</span>':''}<p>Your hand · ${blackjackTotal(r.hand)}</p>${cards(r.hand)}${active?button('Hit',{type:'casinoHit'})+button('Stand',{type:'casinoStand'},'primary')+(r.hand.length===2&&s.gold>=r.bet?button('DOUBLE DOWN?',{type:'casinoDouble'}):''):''}<p class="fine">Dealer stands on all 17s. Winning 21 pays 2:1: double your wager in winnings plus your stake. Other wins return ×2 total. Double down draws one final card: stake ×2, a 21 returns ×4 the original wager; losing forfeits ×2. Ties return your wager.</p>`;}
 if(r?.game==='poker'){game=`<h3>Five-Card Poker</h3><p>Hold any cards, then draw replacements once.</p>${cards(r.hand,active)}${active?button('Draw cards',{type:'casinoDraw'},'primary'):''}<p class="fine">Jacks or better ×1 · Two pair ×2 · Three of a kind ×3 · Straight ×4 · Flush ×6 · Full house ×9 · Four of a kind ×25 · Straight flush ×50 · Royal flush ×250. Returns include your wager.</p>`;}
 if(r?.game==='roulette'){game=`<h3>Roulette</h3>${rouletteWheel(r.number,r.spinning)}<div class="roulette-result">${r.spinning?'Spinning…':r.number}</div><p>Bet: ${esc(r.choice)}</p>`;}
 if(r?.game==='tiddlywinks')game=tiddlywinksView(r,esc,animateWink);
 return `${annoyed&&r?.won&&r.game!=='tiddlywinks'?`<div class="casino-win" role="status" aria-live="polite"><div class="casino-win-flash"></div><div class="casino-win-banner"><span>♛</span><strong>You WIN ${Math.max(0,r.profit||0)} Gold!</strong><small>${r.payout} gold returned, including your ${r.bet} gold wager.</small></div></div>`:''}<div class="dealer"><div class="dealer-portrait ${annoyed?'is-annoyed':''}" role="img" aria-label="${esc(DEALERS[index])}, the dealer" style="background-position:${index%4*100/3}% ${Math.floor(index/4)*50}%"><span class="dealer-annoyed" aria-hidden="true"></span></div><div><p class="eyebrow">YOUR DEALER IN ${esc(TOWNS[index].name)}</p><h3>${esc(DEALERS[index])}</h3><p>“${DEALER_TAUNT}”</p></div></div><div class="casino-table"><p>Your purse: <b id="casino-gold">${s.gold}</b> gold${active?` · ${r.bet} on the table`:''}</p>${game}${r?.game==='tiddlywinks'?'':`<p id="casino-result" role="status">${esc(r?.message||'Choose your game. All wagers use your adventurer’s gold.')}</p>`}${!active&&s.mode==='town'?`<p><b>1. Set your wager.</b> Then press a Bet button below to pay and start that game. No house limit: bet up to your available gold.</p><label>Gold to wager <input id="wager" type="number" required step="1" min="1" max="${s.gold}" value="${Math.max(1,Math.min(r?.bet||5,s.gold))}"></label><div class="panel-actions"><button data-bet="blackjack">Bet ${bet} Gold &amp; Deal Blackjack</button><button data-bet="poker">Bet ${bet} Gold &amp; Deal Poker</button><button data-bet="tiddlywinks">Bet ${bet} Gold &amp; Play Tiddlywinks</button></div><label>Roulette bet <select id="roulette-choice"><option value="red">Red</option><option value="black">Black</option><option value="odd">Odd</option><option value="even">Even</option>${Array.from({length:37},(_,i)=>`<option value="${i}">Number ${i}</option>`).join('')}</select></label><button data-bet="roulette">Bet ${bet} Gold &amp; Spin Roulette</button><p class="fine">European wheel: 0–36. Red/black/odd/even return ×2; a single number returns ×36. Zero loses even-money bets.</p>`:active&&r.game!=='tiddlywinks'?'<p class="fine">Your wager is already paid and locked for this round. Use the game controls above to finish. Your unfinished round is saved.</p>':''}${active&&r.game==='tiddlywinks'?'':'<p class="fine">Lose your last gold and the guards escort you outside the walls. Earn gold before returning.</p>'}</div>`;
}

import {shrineForDungeon,charityAudienceAvailable,shrineAudienceAvailable,shrineLore} from './shrine-deities.js';
export function shrinePanelMarkup(s,button,esc){
 const god=shrineForDungeon(s.dungeon);if(!god)return '';
 const demand=god.id==='oozul'?'OOZUL, the DARK LORD OF ALL SEEING, DEMANDS TRIBUTE!':god.name.toUpperCase()+' AWAITS YOUR OFFERING!';
 const offering=shrineAudienceAvailable(s)?'<p class="shrine-demand" style="text-align:center;font-size:clamp(28px,3vw,44px);line-height:1.3">'+esc(demand)+'</p>'+(
  god.charity&&s.flags.charityChoice!=='donated'?'':!god.charity&&s.flags['shrineStrength:'+s.dungeon.minorId]?'<p>This shrine has granted you +1 permanent Strength.</p>':
  '<div class="shrine-offering">'+button('Offer 10 gold',{type:'shrineOffering',amount:10},'primary',s.gold<10)+'</div>'
 ):'';
 const art='<canvas id="shrine-portrait" width="640" height="280" style="position:relative;inset:auto;display:block;width:100%;height:auto;max-height:240px;object-fit:contain;pointer-events:none" role="img" aria-label="'+esc(god.name)+' carved statue on a rune-covered pedestal"></canvas>';
 if(god.id==='sseth'){
 const offered=s.flags['ssethTribute:'+s.dungeon.minorId]||[];
 return art+'<p class="shrine-demand" style="text-align:center;font-size:clamp(28px,3vw,44px)">SSETH THE LIZARD GOD ASKS FOR TRIBUTE TO ENRICH THE HARVEST.</p>'+ (s.flags.silverAcornGranted?'<p style="text-align:center">Sseth has bestowed the Silver Acorn.</p>':'<div class="panel-actions">'+button(offered.includes('gold')?'Gold offered':'Offer 10 Gold',{type:'ssethTribute',offering:'gold'},'primary',offered.includes('gold')||s.gold<10)+button(offered.includes('torch')?'Torch offered':'Offer a Torch',{type:'ssethTribute',offering:'torch'},'',offered.includes('torch')||!s.bag.includes('torch'))+button(offered.includes('food')?'Food offered':'Offer Food',{type:'ssethTribute',offering:'food'},'',offered.includes('food')||s.meals<1)+'</div>')+'<button data-close-percival>Return to the shrine</button>';
 }
 if(god.charity&&charityAudienceAvailable(s))return art+offering+'<p class="shrine-demand">“A generous heart opens every door. Will you give <strong>500 gold</strong> to charity?”</p><p>Give once to receive <strong>+1 permanent Charisma</strong> and better standing in <strong>Mothbridge and Bellwether</strong>.</p><p>Refusal opens a twenty-foot pit beneath you, dealing <strong>up to 150 damage</strong>. Other cheapskates wait below; a ladder leads out.</p><p>You carry <strong>'+Number(s.gold).toLocaleString()+' gold</strong>.</p>'+(s.gold<500?'<p role="status">You need '+(500-s.gold)+' more gold to make this offering. You may leave and return.</p>':'')+'<div class="panel-actions">'+button('Give 500 gold',{type:'shrineCharity',choice:'donate'},'primary',s.gold<500)+button('Refuse the offering',{type:'shrineCharity',choice:'refuse'})+'<button type="button" data-close-percival>Decide later</button></div>';
 return art+offering+'<button type="button" data-close-percival>Return to the shrine</button>';
}
export function shrineResultMarkup(s,esc){
 return '<h3>The floor drops away.</h3><p>You fall twenty feet and take <strong>'+Number(s.flags.charityPitDamage||0)+' damage</strong>.</p><p>Other cheapskates huddle below the shrine. '+(s.dungeon?.charityPit?'Find the upward ladder at (1, 1) to climb back out.':'You awaken after the fall.')+'</p><button type="button" data-close-percival>Continue</button>';
}

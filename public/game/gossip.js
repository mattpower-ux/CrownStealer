import {TOWNS,DUNGEONS} from './content.js';
import {dungeonFloors} from './dungeon-depths.js';
const portrait=(src,x=50,size='cover')=>({src:'/assets/'+src+'.webp',position:x+'% 50%',size});
const hag=portrait('haghilda'),dragon=portrait('ghost-dragon'),guards=portrait('royal-guards'),princess=portrait('royal-portraits',100,'200% 100%'),king=portrait('royal-portraits',0,'200% 100%'),fortune=portrait('fortune-teller');
const entry=(id,kind,subject,text,image)=>({id,kind,subject,text,portrait:image});
export function gossipDeck(region){
 const d=DUNGEONS.filter(d=>d.region===region),depth=dungeonFloors({index:region*2});
 const hints=region===0?[
  entry('hearth-seal','hint','Haghilda the Snot','Haghilda has the Hearth Seal on level 4 of the abandoned elven village. Look for the ruined tree fort in the southwest woods. The Tithe Vault no longer holds that relic; she stole it.',hag),
  entry('pepper','hint','Haghilda’s unfortunate nose','A dead elf on level 3 of the tree ruin carries the Holy Pepper Grenade. Use it against Haghilda: her suffocating snot attack loses half its damage. Even monsters ought to carry a handkerchief.',hag),
  entry('witness','hint','The royal watch’s warning',"A level-12 Rock Troll guards the Witness Bell on level 10 of The Widow’s Bell. Ten levels down, one very large problem. Bring healing potions and a weapon better than royal generosity.",guards),
  entry('dragon-warning','hint','The Ghost Dragon','Those dragon bones beside the BEWARE sign are an excellent place to leave alone. Approach too closely and a level-12 Ghost Dragon will introduce itself. The sign is unusually honest.',dragon)
 ]:[
  ...d.map((site,i)=>entry('relic-'+site.id,'hint','Princess Bunnyfoot’s intercepted briefing',site.relic+' is held by '+site.boss+' in '+site.name+', on level '+depth+'. '+(i?'This is the second relic you need from this land.':'This is one of this land’s two gate-opening relics.')+' The princess says to take notes, preferably before being eaten.',princess)),
  entry('depth-'+region,'hint','A guard who has read the map',d.map(x=>x.name).join(' and ')+' both descend '+depth+' levels. The deeper floors have stronger enemies; a clear first corridor is no promise about the bottom. Take healing and a Scroll of Return.',guards),
  entry('gate-'+region,'hint','King Malachi’s border policy','The guards want both local relics: '+d.map(x=>x.relic).join(' and ')+'. Gold and a charming smile do not open the land gates. The King tried charging for smiles, but there was no demand.',king)
 ];
 return hints.flatMap((hint,i)=>[hint,[
  entry('sleeping-dragon','safety','A dragon with strong views on mornings','Important Safety Tip: Never Wake a Sleeping Dragon. It may be dreaming about breakfast, and you have arrived wearing a convenient wrapper.',dragon),
  entry('electric-underwear','safety','King Malachi the Ineffable','Important Safety Tip: Wearing Electric Underwear Can Be Shocking. His Majesty calls the experiment a triumph. His tailor has requested a wooden chair and a new profession.',king),
  entry('honeypot','safety','Old Mother Mould','Important Safety Tip: Feeding a Troll is Like Sharing Your Honeypot with a Bear. You will lose the honey, the pot, and quite possibly the arm holding it. Mother Mould recommends sending your least favourite cousin.',fortune),
  entry('bunnyfoot-rumor','gossip','Princess Bunnyfoot','Bunnyfoot has reportedly rejected a duke because he called his horse Mother. The horse has since denied the relationship. Your own romantic prospects remain under investigation.',princess)
 ][i]]);
}
export function gossipFor(s){const town=TOWNS.find(t=>t.id===s.location)||TOWNS.find(t=>t.region===s.region);const deck=gossipDeck(town.region),count=s.flags['gossip:'+town.id]||0;return deck[(count+TOWNS.indexOf(town)*2)%deck.length];}
export function gossipView(s,button,esc){const g=gossipFor(s);return `<article class="square-gossip"><div class="gossip-portrait" role="img" aria-label="${esc(g.subject)}" style="background-image:url('${g.portrait.src}');background-position:${g.portrait.position};background-size:${g.portrait.size}"></div><div><p class="eyebrow">${g.kind==='hint'?'A LOCAL CLUE':g.kind==='safety'?'IMPORTANT SAFETY TIP':'OVERHEARD IN THE SQUARE'}</p><h3>${esc(g.subject)}</h3><p class="gossip-story">${esc(g.text)}</p>${s.flags.gossipGuardTown?'<p class=fine>Heavy boots approach. Someone has been counting your gossip.</p>':button('Hear more gossip',{type:'gossipNext'},'primary')}</div></article>`;}

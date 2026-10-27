export const DEALERS=['Oswin Copperthumb','Lady Maribel','Madam Vell','Rafi Sandglass','Brinna Brass','Uncle Saffron','Captain Nessa','Old Perrin','Mira Pearl','Hollis Frost','Professor Selene','Vey the Quiet'];
export const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const rank=c=>c%13+2;
export const cardText=c=>(['J','Q','K','A'][rank(c)-11]||rank(c))+['♣','♦','♥','♠'][Math.floor(c/13)];
export function blackjackTotal(cards){let total=0,aces=0;for(const c of cards){const r=rank(c);total+=r===14?11:Math.min(10,r);if(r===14)aces++;}while(total>21&&aces){total-=10;aces--;}return total;}
export function pokerResult(cards){const rs=cards.map(rank).sort((a,b)=>a-b),groups=Object.values(rs.reduce((a,r)=>(a[r]=(a[r]||0)+1,a),{})).sort((a,b)=>b-a),flush=cards.every(c=>Math.floor(c/13)===Math.floor(cards[0]/13)),straight=new Set(rs).size===5&&(rs[4]-rs[0]===4||rs.join(',')==='2,3,4,5,14');if(flush&&straight)return [rs[0]===10?'Royal flush':'Straight flush',rs[0]===10?250:50];if(groups[0]===4)return ['Four of a kind',25];if(groups[0]===3&&groups[1]===2)return ['Full house',9];if(flush)return ['Flush',6];if(straight)return ['Straight',4];if(groups[0]===3)return ['Three of a kind',3];if(groups[0]===2&&groups[1]===2)return ['Two pair',2];if(rs.some((r,i)=>r>=11&&rs[i+1]===r))return ['Jacks or better',1];return ['No paying hand',0];}
function shuffled(random){const deck=Array.from({length:52},(_,i)=>i);for(let i=51;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
export function casinoAction(s,a,random,note){
 let r=s.casino;
 const finish=(mult,text)=>{const payout=Math.floor(r.bet*mult);s.gold+=payout;r.active=false;r.won=payout>r.bet;r.resultId=(s.flags.casinoResults||0)+1;s.flags.casinoResults=r.resultId;r.message=`${text} ${payout?'Returned '+payout+' gold.':'Your wager is lost.'}`;note(r.message);};
 if(a.type==='gamble'){
  if(r?.active){note('Finish your current game before placing another wager.');return;}
  const bet=Number(a.bet),games=['blackjack','poker','roulette','tiddlywinks'];
  if(!Number.isSafeInteger(bet)||bet<1||bet>Math.min(100,s.gold)||!games.includes(a.game)){note('Choose a whole-number wager from 1 to 100 within your purse.');return;}
  if(a.game==='roulette'&&!['red','black','odd','even',...Array.from({length:37},(_,i)=>String(i))].includes(String(a.choice))){note('Choose red, black, odd, even, or a number from 0 to 36.');return;}
  s.gold-=bet;r=s.casino={game:a.game,bet,active:true,town:s.location,message:'Your wager is on the table.'};
  if(a.game==='blackjack'||a.game==='poker'){r.deck=shuffled(random);r.hand=r.deck.splice(0,a.game==='poker'?5:2);if(a.game==='poker'){r.held=[false,false,false,false,false];r.message='Select the cards to hold, then draw once.';}else{r.dealer=r.deck.splice(0,2);if(blackjackTotal(r.hand)===21||blackjackTotal(r.dealer)===21){const yours=blackjackTotal(r.hand),dealer=blackjackTotal(r.dealer);finish(yours===dealer?1:yours===21?2.5:0,yours===dealer?'Both have blackjack: push.':yours===21?'Blackjack!':'Dealer blackjack.');}else r.message='Hit for another card or stand. Dealer stands on all 17s.';}}
  if(a.game==='roulette'){const n=Math.floor(random()*37),choice=String(a.choice),color=n===0?'green':RED.has(n)?'red':'black';r.number=n;r.choice=choice;const straight=/^\d+$/.test(choice),win=straight?Number(choice)===n:n!==0&&(choice===color||choice===(n%2?'odd':'even'));finish(win?(straight?36:2):0,`The wheel lands on ${n} ${color}.`);}
  if(a.game==='tiddlywinks'){r.shots=0;r.hits=0;r.target=40+Math.floor(random()*41);r.wind=Math.floor(random()*17)-8;r.message='Three winks. Land at least two in the cup to win.';}
  return;
 }
 if(!r?.active)return;
 if(r.game==='blackjack'){
  if(a.type==='casinoHit'){r.hand.push(r.deck.shift());if(blackjackTotal(r.hand)>21)finish(0,'You bust with '+blackjackTotal(r.hand)+'.');else r.message='Your total is '+blackjackTotal(r.hand)+'. Hit or stand.';}
  if(a.type==='casinoStand'){while(blackjackTotal(r.dealer)<17)r.dealer.push(r.deck.shift());const yours=blackjackTotal(r.hand),dealer=blackjackTotal(r.dealer);finish(dealer>21||yours>dealer?2:yours===dealer?1:0,`You: ${yours}. Dealer: ${dealer}. ${yours===dealer?'Push.':dealer>21?'Dealer busts.':''}`);}
 }
 if(r.game==='poker'){
  if(a.type==='casinoHold'&&Number.isInteger(a.index)&&a.index>=0&&a.index<5)r.held[a.index]=!r.held[a.index];
  if(a.type==='casinoDraw'){r.hand=r.hand.map((c,i)=>r.held[i]?c:r.deck.shift());const [name,mult]=pokerResult(r.hand);finish(mult,name+'.');}
 }
 if(r.game==='tiddlywinks'&&a.type==='casinoShoot'){
  const power=Number(a.power);if(!Number.isFinite(power)||power<0||power>100)return;
  const landing=Math.round(power+r.wind+(random()-.5)*10),hit=Math.abs(landing-r.target)<=7;r.shots++;if(hit)r.hits++;r.landing=landing;
  if(r.shots===3)finish(r.hits>=2?3:0,`${r.hits}/3 winks in the cup.`);else{r.message=`${hit?'In the cup!':'Miss.'} Landed at ${landing}. ${r.hits} hits, ${3-r.shots} shots left.`;r.wind=Math.floor(random()*17)-8;}
 }
}
export function validCasino(r,s){if(r==null)return true;if(!r||!['blackjack','poker','roulette','tiddlywinks'].includes(r.game)||typeof r.active!=='boolean'||!Number.isInteger(r.bet)||r.bet<1||r.bet>100||typeof r.message!=='string'||r.message.length>1000)return false;if(r.active&&(s.mode!=='town'||r.town!==s.location))return false;
 if(['blackjack','poker'].includes(r.game)){if(!Array.isArray(r.deck)||!Array.isArray(r.hand)||r.hand.length<2||r.hand.length>22)return false;const all=[...r.deck,...r.hand,...(r.dealer||[])];if(all.length>52||new Set(all).size!==all.length||all.some(c=>!Number.isInteger(c)||c<0||c>51))return false;if(r.game==='blackjack'&&(!Array.isArray(r.dealer)||r.dealer.length<2||r.dealer.length>22))return false;if(r.game==='poker'&&(r.hand.length!==5||!Array.isArray(r.held)||r.held.length!==5||r.held.some(h=>typeof h!=='boolean')))return false;}
 if(r.game==='tiddlywinks'&&(!Number.isInteger(r.shots)||r.shots<0||r.shots>3||!Number.isInteger(r.hits)||r.hits<0||r.hits>r.shots||!Number.isInteger(r.target)||r.target<40||r.target>80||!Number.isInteger(r.wind)||Math.abs(r.wind)>8))return false;return true;}

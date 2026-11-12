import {wildernessEventView} from './wilderness-event-view.js';
let halSequenceTimer=null,halPhaseSpoken=null;
import {halView,halOutcomeView,isHal} from './hal-challenge.js';
import {dragonDefenseView} from './dragon.js';
import {renderMerchantView} from './merchant-view.js';
import {arenaView} from './arena-view.js';
import {ARENA_WINS_REQUIRED} from './gladiator-arena.js';
import './panel-pages.js';
import './fullscreen.js';
import {boostGateVoice} from './audio.js';
import {spellsView} from './spell-items.js';
import {GAG_ITEMS,GAG_KEYS,gagActive,pigFaceSvg,HELIUM_REFUSAL} from './gag-potions.js';
import {ladderPrompt} from './dungeon-ladders.js';
import {BALROG_ID,BALROG_WHIP,BOTTOMLESS_PIT,ROYAL_BALROG_TRIAL,pitBottomAction} from './bottomless-pit.js';
import {PUTRID_PALACE,WANG_ID,WANG_TRIAL_DIALOGUE} from './royal-trials.js';
import {castleLayout,castleChestAt,castleFineFor,castleRulerAt,castleGuards,castleLockpickOdds,castleInteractionAt,castleInteractionsAt,castleInteractionActions} from './castle-interiors.js';
import {ROYAL_DUNGEON_ID,royalDungeonActions,royalDungeonAt} from './royal-dungeon.js';
import {ROADSIDE_CRYPT} from './roadside-crypt.js';
import {minorSiteDefinition} from './minor-sites.js';
import {innView,innkeeperFor} from './inn.js';
import {ROULETTE_SPIN_MS} from './roulette-wheel.js';
import {clockLabel,isNight,buffTimeLeft} from './world-clock.js';
import {faceMarkup,facePickerMarkup,CUSTOMIZATION_JOKES} from './character-faces.js';
import {dealerVoice} from './casino.js';
import {gossipView} from './gossip.js';
import {ATTRIBUTE_CAP,effectiveAttributes,effectiveLevel,levelDrainMinutesLeft,syncAttributeHealth} from './attributes.js';
import {atlasView,paintAtlasMaps} from './atlas-view.js';
import {attachTouchJoystick} from './touch-joystick.js';
import {AREAS,areaFor,PLANETS,visitedLands} from './exploration.js';
import {dungeonFloors} from './dungeon-depths.js';
import {PREVIEW_KEYS,previewCharacter,previewJump,previewEncounter,previewView,previewDestinations} from './developer-preview.js';
import {cityOf} from './city-rule.js';
import {cityView,cityJournal} from './city-view.js';
import {avatarMarkup,hairyDuration} from './gear-avatar.js';
import {fortuneFor} from './town-personas.js';
import {SLOT_IDS,slotKeys,selectedSlot,slotSummary} from './save-slots.js';
import {dungeonChests,gearKey} from './treasure.js';
import {musicScene} from './location-music.js';
import {ROYAL_INTRO,ROYAL_CAMPAIGN_INTRO,ROYAL_ENDINGS,royalJournal,hasRoyalAdmission} from './royal-story.js';
import {ROYAL_CAMPAIGN_ENDINGS,royalCampaignEndingAvailable,royalCampaignObjective} from './royal-campaign.js';
import {inventoryView,changeBagPage} from './inventory-view.js';
import {casinoView,updateWinkAim} from './casino-view.js';
import {selectOddJob,nextOddJob,oddJobsView} from './odd-jobs-view.js';
import {townPosition,townPlace,townPlaces,TOWN_SIZE} from './town.js';
import {WEAPONS,UNARMED,itemById,itemArt,merchantBuyPrice,weaponAccuracy} from './items.js';
import {REGIONS,TOWNS,DUNGEONS,CHAPTERS,LORE,ENDINGS} from './content.js';
import {createGame,createRoyalGame,act,pointAt,nextObjective,saveGame,loadGame,dungeonNavigation,dungeonName,dungeonMap,wildernessStepDelay} from './engine.js';
import {undead} from './spell-items.js';
import {render,paintMonster,worldViewport,castleViewport,castlePointVisible,renderCastleOverview,castleGovernorPortrait,castleGuardPortrait,castleChestPortrait} from './render.js';
import {AudioDirector} from './audio.js';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const developerMode=!window.Android&&new URLSearchParams(location.search).get('developer')==='1';
let previewRules={invulnerable:true,noRandom:true};
if(developerMode)try{const savedRules=JSON.parse(localStorage.getItem("crownstealer-developer-rules-v1"));if(savedRules)previewRules={invulnerable:savedRules.invulnerable===true,noRandom:savedRules.noRandom===true};}catch{}
const SETTINGS='crownstealer-settings-v1';
let activeSlot=1;try{activeSlot=selectedSlot(localStorage);}catch{}
let {save:SAVE,checkpoint:CHECKPOINT}=developerMode?PREVIEW_KEYS:slotKeys(activeSlot);
let selectedGender=null,customizationTimer;
const customizationPopup=document.createElement('section');customizationPopup.id='customization-popup';customizationPopup.hidden=true;customizationPopup.setAttribute('role','status');customizationPopup.setAttribute('aria-live','polite');customizationPopup.innerHTML='<p></p><button aria-label="Dismiss customization message">Close</button>';document.body.append(customizationPopup);customizationPopup.querySelector('button').onclick=()=>{customizationPopup.hidden=true;};
$('hero-name').previousElementSibling.insertAdjacentHTML('beforebegin',facePickerMarkup());
document.querySelectorAll('[name="adventurer-gender"]').forEach(input=>input.onchange=()=>{selectedGender=input.value;$('chosen-face').innerHTML=faceMarkup({gender:selectedGender});$('chosen-face').hidden=false;});
document.querySelectorAll('[data-customization-joke]').forEach(button=>button.onclick=()=>{customizationPopup.querySelector('p').textContent=CUSTOMIZATION_JOKES[Number(button.dataset.customizationJoke)].reply;customizationPopup.hidden=false;clearTimeout(customizationTimer);customizationTimer=setTimeout(()=>customizationPopup.hidden=true,4500);});
import {WEBSTER_GREETINGS,websterAnswer} from './webster.js';
let luteTimer;
let inventorySelection=null,innMorning=false,gossipGuardTimer;
let displayedDungeonLevel=null,levelBannerTimer;
function updateLevelBanner(){
 const d=state?.dungeon,inDungeon=d&&(state.mode==='dungeon'||state.mode==='battle'&&state.returnMode==='dungeon');
 const key=inDungeon?`${d.site||d.royal||d.index}:${d.floor}`:null;
 if(key===displayedDungeonLevel)return;displayedDungeonLevel=key;clearTimeout(levelBannerTimer);
 const banner=$('level-banner');banner.hidden=!key;if(!key)return;
 banner.textContent=d.ship?'ALIEN SPACECRAFT':`LEVEL ${d.floor+1}`;levelBannerTimer=setTimeout(()=>{banner.hidden=true;},3000);
}

let dealerReactionUntil=0,dealerReactionTimer,rouletteTimer;
let state=null,activePanel=null,frame=0,lastFrame=0,toastTimer,installPrompt=null;
let volumes={music:.35,effects:.55};try{const v=JSON.parse(localStorage.getItem(SETTINGS));if(v&&Number.isFinite(v.music)&&Number.isFinite(v.effects))volumes={music:Math.max(0,Math.min(1,v.music)),effects:Math.max(0,Math.min(1,v.effects))};}catch{}
const audio=new AudioDirector();audio.setVolumes(volumes.music,volumes.effects);
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3200);}
function persist(){try{localStorage.setItem(SAVE,saveGame(state));$('save-status').textContent='Progress saved on this device';}catch{$('save-status').textContent='Storage unavailable — export your save from Settings';}}
function hasSave(){try{return !!localStorage.getItem(SAVE);}catch{return false;}}
$('continue-game').hidden=!hasSave();
let clockLast=performance.now();
const clockDisplay=document.createElement('div');clockDisplay.id='world-clock';clockDisplay.className='world-clock';clockDisplay.title='15 minutes of active play = 12 game hours. Night: 20:00–06:00. Wilderness encounters are 50% more likely and 25% stronger.';
clockDisplay.innerHTML='<strong></strong><small>15 real minutes = 12 game hours</small><div id="timed-buffs"></div>';document.querySelector('.vitals').after(clockDisplay);
function updateClockDisplay(){if(!state)return;clockDisplay.querySelector('strong').textContent=(isNight(state)?'☾ ':'☀ ')+clockLabel(state);clockDisplay.classList.toggle('is-night',isNight(state));clockDisplay.querySelector('small').textContent=isNight(state)?'Wilderness: +50% encounters · +25% enemy strength':'15 real minutes = 12 game hours';$('timed-buffs').innerHTML=(hairyDuration(state)?'<span>Hairy form · '+hairyDuration(state)+'</span>':'')+(state.weaponCoating?.rounds?'<span>Weapon poison · '+state.weaponCoating.rounds+' round'+(state.weaponCoating.rounds===1?'':'s')+' left</span>':'')+(state.spellEffects?.invisibleMoves?'<span>Scroll invisibility: '+state.spellEffects.invisibleMoves+' moves</span>':'')+(state.spellEffects?.wardTurns?'<span>Protective Ward: '+state.spellEffects.wardTurns+' attacks</span>':'')+GAG_KEYS.filter(key=>gagActive(state,key)).map(key=>'<span>'+({pigFace:'Pig face',tiny:'Mouse-sized',helium:'Helium voice'}[key])+': '+buffTimeLeft(state,key)+' game min</span>').join('')+['strength','invisibility','meal','waterBreathing'].filter(effect=>state.buffs?.[effect]>0).map(effect=>'<span>'+({strength:'Strength',invisibility:'Invisibility',meal:'Meal bonus',waterBreathing:'Water breathing'}[effect])+': '+buffTimeLeft(state,effect)+' game min left</span>').join('');}
function flushClock(refresh=true,allowHidden=false){const now=performance.now(),elapsed=now-clockLast;clockLast=now;if(!state||$('game').hidden||document.hidden&&!allowHidden||elapsed<=0||elapsed>60000)return;const before=state,events=[];state=act(state,{type:'clockTick',elapsedMs:elapsed},events,developerMode?previewRules:{});const returned=events.find(event=>event.kind==='castleGuardReturned');if(returned){if(guardConsultFx?.guardId===returned.guardId)animateGuardConsultation({...returned,path:guardConsultFx.path.slice().reverse()});if(refresh)toast('The guard returns. You may pass.');}updateClockDisplay();if(refresh){const gagsChanged=GAG_KEYS.some(key=>gagActive(before,key)!==gagActive(state,key)),levelChanged=effectiveLevel(before)!==effectiveLevel(state),hairChanged=hairyDuration(before)!==hairyDuration(state),attributesChanged=JSON.stringify(before.attributeBuffs)!==JSON.stringify(state.attributeBuffs);if(before.gold!==state.gold||before.hp!==state.hp||before.maxHp!==state.maxHp||before.log.at(-1)!==state.log.at(-1)||before.mode!==state.mode||gagsChanged||levelChanged||hairChanged)update();if(activePanel==='inventory'&&(JSON.stringify(before.buffs)!==JSON.stringify(state.buffs)||gagsChanged||levelChanged||hairChanged||attributesChanged))openPanel('inventory');if(['shop','travelMerchant'].includes(activePanel)&&!!before.attributeBuffs?.charisma!==!!state.attributeBuffs?.charisma)openPanel(activePanel);persist();}}
setInterval(()=>flushClock(),1000);

let oddJobId=null;
function start(s){oddJobId=null;castleHeadVisit=null;castleHeadReply=null;castleBathReply=null;castleTileVisit=null;castleGuardReply=null;arenaResult=null;guardConsultFx=null;clockLast=performance.now();displayedDungeonLevel=null;finishCombat();cancelAnimationFrame(frame);state=s;$('title-screen').hidden=true;$('game').hidden=false;update();audio.unlock().then(()=>sceneMusic());frame=requestAnimationFrame(draw);if(state.flags.boatReveal)openPanel('boatReveal');else if(state.flags.rescuePending)openPanel('rescue');else if(state.flags.gagReveal)openPanel('gagReveal');else if(state.flags.peacefulEncounter)openPanel('peaceful');else if(state.flags.travelMerchant)openPanel('travelMerchant');else if(state.mode==='town'&&state.flags.gossipGuardTown)openPanel('gossipGuard');else if(state.flags.borderTauntPending)openPanel('borderTaunt');else if(state.flags.guardTauntPending)openPanel('guardTaunt');else if(state.flags.royalQuest==='opening')openPanel('royalIntro');else if(state.mode==='ending')openPanel('ending');else if(state.casino?.active)openPanel('casino');else showLoot();}
$('new-game').onclick=()=>{if(!selectedGender){toast('Choose HIM, HER, or OTHER first.');return;}if(hasSave()){openPanel('new');return;}beginNewAdventurer();};
$('continue-game').onclick=()=>{try{start(loadGame(localStorage.getItem(SAVE)));}catch(e){toast('Cannot read save: '+e.message);}};
$('home').onclick=()=>{audio.stopRoyalDungeonVoice();flushClock(false);clearTimeout(levelBannerTimer);$('level-banner').hidden=true;displayedDungeonLevel=null;finishCombat();persist();$('game').hidden=true;$('title-screen').hidden=false;refreshSlotPicker();audio.setScene('title');cancelAnimationFrame(frame);};
$('title-music').onclick=()=>{audio.setScene('title');audio.unlock();};
$('title-settings').onclick=()=>openPanel('settings');
function sceneMusic(){
 const inGame=!$('game').hidden;
 audio.setScene(inGame?musicScene(state,activePanel):'title');
 if(inGame&&state?.equipped==='lute-of-lousy-lyrics'){
  if(!luteTimer){const phrase=()=>{if(!document.hidden)audio.effect('lousy-ballad');};phrase();luteTimer=setInterval(phrase,2400);}
 }else if(luteTimer){clearInterval(luteTimer);luteTimer=null;}
}
const entryPrompt=document.createElement('section');entryPrompt.id='entry-prompt';entryPrompt.hidden=true;entryPrompt.setAttribute('role','dialog');entryPrompt.setAttribute('aria-labelledby','entry-question');entryPrompt.innerHTML='<h2 id="entry-question"></h2><div><button id="entry-yea" class="primary">YEA</button><button id="entry-nay">NAY</button><button id="entry-aid" hidden>Free first aid</button></div>';document.body.append(entryPrompt);
document.getElementById('entry-aid').onclick=()=>dispatch({type:'mothbridgeAid'});
function showEntryPrompt(){if(state.castle)return;const p=state.mode==='town'?townPlace(state):state.mode==='world'?pointAt(state):null;if(!p||activePanel||combatView)return;document.getElementById('entry-question').textContent='ENTER '+(p.name||'THIS PLACE').toUpperCase()+'?';document.getElementById('entry-aid').hidden=p.id!=='mothbridge'||state.level>3||state.hp>=state.maxHp||!!state.flags.mothbridgeAid;entryPrompt.hidden=false;audio.unlock().then(()=>audio.effect(['dungeon','expedition','forest','minorSite',BOTTOMLESS_PIT.kind,PUTRID_PALACE.kind].includes(p.kind)?'dungeonEntrance':'townEntrance'));}
document.getElementById('entry-yea').onclick=()=>{entryPrompt.hidden=true;dispatch({type:'enter'});};
document.getElementById('entry-nay').onclick=()=>{entryPrompt.hidden=true;audio.unlock().then(()=>audio.effect('whinny'));};
const ladderPopup=document.createElement('section');ladderPopup.id='ladder-prompt';ladderPopup.hidden=true;ladderPopup.setAttribute('role','dialog');ladderPopup.setAttribute('aria-labelledby','ladder-question');ladderPopup.innerHTML='<h2 id="ladder-question">You Found a Ladder</h2><p id="ladder-direction"></p><div><button id="ladder-down" class="primary">Go Down</button><button id="ladder-up">Ascend/Leave</button></div>';document.body.append(ladderPopup);
function showLadderPrompt(){const ladder=state?.mode==='dungeon'&&state.dungeon.site!==ROYAL_DUNGEON_ID&&!activePanel&&!combatView?ladderPrompt(state,dungeonMap(state.dungeon)):null;ladderPopup.hidden=!ladder;if(!ladder)return;const sewer=state.dungeon.royal==='sewer';
 $('ladder-question').textContent=sewer?'Galen’s Cell':'You Found a Ladder';
 $('ladder-direction').textContent=sewer?(state.flags.galenFreed?'The wizard points to the loose stones.':'An old wizard waits behind the bars.'):ladder.direction==='down'?'This ladder leads through the floor.':'This ladder leads through the ceiling.';
 $('ladder-up').textContent=sewer?(state.flags.galenFreed?'Push loose stones':'Free Galen'):'Ascend/Leave';$('ladder-down').disabled=ladder.direction!=='down';$('ladder-up').disabled=ladder.direction!=='up';}
$('ladder-down').onclick=()=>{ladderPopup.hidden=true;dispatch({type:'descend'});};
$('ladder-up').onclick=()=>{const ladder=ladderPrompt(state,dungeonMap(state.dungeon));ladderPopup.hidden=true;if(ladder?.direction==='up')dispatch({type:ladder.upAction});};

let shipInFlight=false;
function launchPlanetFlight(action){
 shipInFlight=true;
 const overlay=document.createElement('div');overlay.className='ship-flight';overlay.setAttribute('role','status');
 const canvas=document.createElement('canvas'),caption=document.createElement('strong');caption.textContent='Bound for '+PLANETS[action.planet].split(',')[0];overlay.append(canvas,caption);document.body.append(overlay);
 audio.unlock().then(()=>{if(shipInFlight)audio.effect('launch');});
 const ctx=canvas.getContext('2d'),start=performance.now(),stars=Array.from({length:130},(_,i)=>({angle:i*2.39996,speed:.5+(i%13)/13,offset:(i%29)/29}));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function frame(now){const elapsed=now-start;if(elapsed>=4000){overlay.remove();shipInFlight=false;dispatch(action);return;}const w=innerWidth,h=innerHeight;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.fillStyle='#030b18';ctx.fillRect(0,0,w,h);for(const star of stars){const t=reduced?star.offset:(star.offset+elapsed*.0005*star.speed)%1,r=t*t*Math.hypot(w,h)*.65,x=w/2+Math.cos(star.angle)*r,y=h/2+Math.sin(star.angle)*r;ctx.strokeStyle=star.offset>.5?'#c2eaff':'#7bc8dd';ctx.lineWidth=1+t*2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(star.angle)*(reduced?2:8+t*95),y-Math.sin(star.angle)*(reduced?2:8+t*95));ctx.stroke();}requestAnimationFrame(frame);}
 requestAnimationFrame(frame);
}
let completingFlight=false;
function dispatch(a){if(!state||combatView||shipInFlight)return;if(a.type==='inspectCastle'){inspectCastle(a.id);return;}if(a.type==='mapTurn'){state.flags.mapFacing=((state.flags.mapFacing||0)+a.delta+4)%4;persist();toast('Facing '+['north','east','south','west'][state.flags.mapFacing]);return;}if(a.type==='mapStep'){const dir=state.castle?0:state.flags.mapFacing||0;let dx=a.dx,dy=a.dy;for(let i=0;i<dir;i++)[dx,dy]=[-dy,dx];a={type:'move',dx,dy};}if(a.type==='navigatePlanet'&&!completingFlight&&state.mode==='dungeon'&&state.dungeon?.ship&&Math.abs(state.dungeon.x-7)+Math.abs(state.dungeon.y-5)<=7&&Number.isInteger(a.planet)&&a.planet>=0&&a.planet<3){completingFlight=true;launchPlanetFlight(a);return;}completingFlight=false;flushClock(false);entryPrompt.hidden=true;ladderPopup.hidden=true;if(state.mode==='world'&&a.type==='enter'&&pointAt(state)?.kind==='teleporter'){openPanel('crystalTravel');return;}if(state.mode==='town'&&a.type==='enter'){interactTown();return;}const before=state,events=[];state=act(state,a,events,developerMode?previewRules:{});const bout=events.find(event=>event.kind==='arenaResult');if(bout)arenaResult={...bout,town:before.arena?.town||state.location};const consultation=events.find(event=>event.kind==='castleGuardConsult');if(consultation)animateGuardConsultation(consultation);if(!before.arena&&state.arena)arenaResult=null;const headReply=events.find(event=>event.kind==='castleHeadReply');if(headReply)castleHeadReply=headReply;const bathReply=events.find(event=>event.kind==='castleBathReply');if(bathReply)castleBathReply=bathReply;if(a.type==='castleGuardVisit')castleGuardReply={id:a.id,text:state.log.at(-1)};const castleMove=a.type==='move'&&!!before.castle;if(castleMove)playCastleFootsteps(before,state);if(before.dungeon?.site===ROYAL_DUNGEON_ID&&state.dungeon?.site!==ROYAL_DUNGEON_ID&&before.mode!=='battle')audio.stopRoyalDungeonVoice();const winkShot=a.type==='casinoShoot'&&state.casino?.game==='tiddlywinks'&&state.casino.shots>before.casino?.shots;const winkResult=winkShot&&state.casino.resultId&&state.casino.resultId!==before.casino?.resultId?state.casino:null;persist();if(['crystalTravel','dungeonElevator'].includes(a.type)&&state.bag.length<before.bag.length)closePanel();if(state.log.at(-1)!==before.log.at(-1)&&/This place looks eerily familiar, and empty.|Someone was here before you/.test(state.log.at(-1)))toast(state.log.at(-1));if(isHal(before)||isHal(state)||state.flags.halOutcome||a.type==='halAcknowledge'){update();sceneMusic();if(state.flags.halOutcome)openPanel('halOutcome');else if(isHal(state))openPanel('halChallenge');else{if(['halChallenge','halOutcome'].includes(activePanel))closePanel();if(before.enemy?.speciesId==='space-hal'&&state.flags['expedition:'+before.dungeon?.expedition])showGoldLoot(before.enemy.gold,state.gold);else showLoot();}return;}if(a.type==='rest')innMorning=state.flags.innStayCount!==before.flags.innStayCount;if(state.dungeon?.royal==='cell'&&before.dungeon?.royal!=='cell'){try{localStorage.setItem(CHECKPOINT+'-royal',saveGame(state));toast('Royal dungeon checkpoint saved automatically.');}catch(e){toast('Royal checkpoint could not be saved: '+e.message);}}if(a.type==='useItem'&&!state.bag.includes(a.id))inventorySelection=null;if(a.type==='useItem'&&(['scroll-find-secrets','scroll-vomit'].includes(a.id)||itemById(a.id,before)?.attributeEffect)&&state.log.at(-1)!==before.log.at(-1))toast(state.log.at(-1));if(a.type==='equip')inventorySelection={id:a.id,source:'slot',slot:a.slot||(state.equippedRing2===a.id?'ring2':itemById(a.id,state)?.kind)};if(a.type==='unequip')inventorySelection={id:before[gearKey(a.slot)],source:'bag'};if(state.casino?.game==='blackjack'&&['gamble','casinoHit','casinoDouble','casinoStand'].includes(a.type)&&(a.type==='gamble'?!before.casino?.active&&state.gold<before.gold||state.casino.resultId!==before.casino?.resultId:before.casino?.active&&(state.casino.hand.length!==before.casino.hand.length||state.casino.dealer.length!==before.casino.dealer.length)))audio.unlock().then(()=>audio.effect('cards'));if(!winkShot&&state.casino?.resultId&&state.casino.resultId!==before.casino?.resultId)showCasinoResult(state.casino);const casinoWin=state.casino?.won&&state.casino.resultId!==before.casino?.resultId;if(casinoWin&&!winkShot){dealerReactionUntil=performance.now()+4000;clearTimeout(dealerReactionTimer);dealerReactionTimer=setTimeout(()=>{document.querySelector('.dealer-portrait')?.classList.remove('is-annoyed');document.querySelector('.casino-win')?.remove();},4000);}if(before.mode==='dungeon'&&['forward','back','strafe'].includes(a.type)&&state.mode==='dungeon'&&state.turns===before.turns)toast(state.equippedBoots==='snowshoes'&&state.flags.snowshoeStep===1?'Snowshoes: one square takes two moves off snow.':'A wall blocks this direction. Use Q/E or the curved buttons to turn.');const approach=events.find(event=>event.kind==='castleGuardApproach');if(before.mode==='battle'&&events.length){if(activePanel)closePanel();persist();playCombat(before,events.filter(event=>event!==approach&&event!==bout),approach);return;}if(approach){if(activePanel)closePanel();playCastleGuardApproach(approach);return;}const hurt=state.hp<before.hp,firstContact=before.mode!=='battle'&&state.mode==='battle'&&!state.enemy.boss&&!state.enemy.guard;const unlocked=audio.unlock();for(const event of events)if(event.voice&&!document.hidden)audio.playRoyalDungeonVoice(event.voice);if(casinoWin&&!winkShot){unlocked.then(()=>{if(activePanel==='casino'&&!document.hidden)audio.effect('applause');});}if(firstContact){const contact=state;unlocked.then(()=>{if(state===contact&&!document.hidden)audio.effect(/\b(?:wolf|wolves|warg|wargs)\b/i.test(contact.enemy.name)?'wolfEncounter':'encounter');});}else if(a.type==='useItem'&&a.id==='scroll-vomit'&&state.bag.filter(id=>id===a.id).length<before.bag.filter(id=>id===a.id).length)audio.effect('vomit');else if(a.type==='attack')audio.effect('hit');else if(hurt)audio.effect('hurt');else if(a.type==='heal')audio.effect('magic');else if(state.gold>before.gold&&!winkShot)audio.effect('coin');else if(state.mode!==before.mode)audio.effect('door');else if(!castleMove&&['move','forward','back','strafe'].includes(a.type)&&state.turns>before.turns)audio.effect('step');else if(!castleMove)audio.effect('click');if(activePanel==='castleHead'&&a.type==='leaveCastleHead')closePanel();if(a.type==='castleGuardIgnore'&&state.castle?.guardConsultation){if(activePanel==='castleInteraction')closePanel();toast('WAIT HERE');}if(activePanel==='castleInteraction'&&['castleLeaveRoom','robCastleChest','leaveCastleChest','leaveCastleBook'].includes(a.type))closePanel();if(activePanel&&(before.mode!==state.mode&&!(activePanel==='casino'&&winkShot)||a.type==='enterCastle'&&state.castle&&!before.castle||!before.arena&&state.arena||a.type==='leaveArena'&&!state.arena))closePanel();if(before.mode==='town'&&state.mode==='world'&&state.gold===0)toast('Being escorted out of the town. Return with some gold.');update();persist();sceneMusic();if(state.mode==='ending'&&before.mode!=='ending')openPanel('ending');if(events.some(event=>event.kind==='royalHeroEnding')){openPanel('royalEpilogue');return;}if(activePanel==='royalIntro'&&state.flags.royalQuest==='opening')openPanel('royalIntro');else if(activePanel==='casino')openPanel('casino',{winkShot,winkResult});else if(['shop','quests','court','inventory','inn','talk','potions','spells','royalDungeonNpc','castleInteraction','castleHead'].includes(activePanel))openPanel(activePanel);if(activePanel==='fortune'&&['sageRemoveHelm','sageBuyIntelligence'].includes(a.type)){
 const sage=$('sage-of-wonk');
 if(sage)sage.outerHTML=sageOfWonkView(state.log.at(-1)===before.log.at(-1)?'':state.log.at(-1));
 }if(activePanel==='loot'&&a.type==='equip')closePanel();else showLoot();if(state.flags.borderTauntPending&&activePanel!=='borderTaunt')openPanel('borderTaunt');if(state.flags.guardTauntPending&&activePanel!=='guardTaunt')openPanel('guardTaunt');if(state.mode==='town'&&['demand','refused'].includes(cityOf(state)?.tribute)&&!['demand','refused'].includes(cityOf(before)?.tribute))openPanel('talk');if(a.type==='rest'&&innMorning&&activePanel==='inn')playInnVoice();if(activePanel==='travelMerchant'&&a.type==='buyCureAll')openPanel('travelMerchant');if(state.flags.boatReveal&&activePanel!=='boatReveal')openPanel('boatReveal');else if(state.flags.gagReveal&&activePanel!=='gagReveal')openPanel('gagReveal');else if(state.flags.travelMerchant&&activePanel!=='travelMerchant'&&activePanel!=='squeakyVoice')openPanel('travelMerchant');if(a.type==='gossipNext'&&state.flags.gossipGuardTown&&!before.flags.gossipGuardTown){clearTimeout(gossipGuardTimer);gossipGuardTimer=setTimeout(()=>{if(activePanel==='talk'&&state.mode==='town'&&state.flags.gossipGuardTown)openPanel('gossipGuard');},4000);}if(a.type.startsWith('gossipGuard')&&!state.flags.gossipGuardTown&&activePanel==='gossipGuard')closePanel();if(state.flags.dragonGreeting&&activePanel!=='dragonGreeting')openPanel('dragonGreeting');if(a.type==='acknowledgeDragon'&&['dragonGreeting','dragonNotice'].includes(activePanel))closePanel();if(state.flags.dragonWatch?.enemy)openPanel('dragonDefense');else if(activePanel==='dragonDefense'){closePanel();showLoot();}if(a.type==='dragonOrder')audio.effect(a.order==='flame'?'fire-whoosh':'hit');if(state.flags.wildernessEvent&&activePanel!=='wildernessEvent')openPanel('wildernessEvent');else if(activePanel==='wildernessEvent'){if(state.flags.wildernessEvent)openPanel('wildernessEvent');else{closePanel();showLoot();}}if(state.flags.peacefulEncounter&&activePanel!=='peaceful')openPanel('peaceful');else if(!state.flags.peacefulEncounter&&activePanel==='peaceful')closePanel();if(['robCastleChest','leaveCastleChest','payCastleFine','royalWang','royalWhip'].includes(a.type)&&state.log.at(-1)!==before.log.at(-1))toast(state.log.at(-1));if(a.type==='enter'&&before.mode==='world'&&state.mode==='town'&&/^The guards (take 2,000 gold and lift the ban|deliver 5,000 gold to the governor)/.test(before.log.at(-1)))toast(palaceDirections()+' Walk to its gold marker.');
 if(a.type==='move'&&before.mode===state.mode&&['town','world'].includes(state.mode)&&state.turns>before.turns)showEntryPrompt();}
function animateGuardConsultation(event){
 const duration=Math.min(1600,Math.max(650,(event.path.length-1)*145));
 guardConsultFx={...event,town:state.location,start:performance.now(),duration};
}

function playCastleFootsteps(before,after){
 if(after.turns<=before.turns)return;
 const distance=after.castle?Math.abs(after.castle.x-before.castle.x)+Math.abs(after.castle.y-before.castle.y):1;
 if(!distance)return;
 audio.unlock().then(()=>{
  if(document.hidden)return;
  audio.effect('castleFootstep');
  for(let step=1;step<distance;step++)setTimeout(()=>{
   if(!document.hidden&&state.castle?.x===after.castle?.x&&state.castle?.y===after.castle?.y)audio.effect('castleFootstep');
  },step*90);
 });
}

function castleAt(point) {
 return state.castle?.x===point.x&&state.castle?.y===point.y;
}
function interactTown(){
 if(state.arena){openPanel('arena');return;}
 if(state.castle){
  const layout=castleLayout(state.location);
  if(castleAt(layout.entrance))dispatch({type:'leaveCastle'});
  else if(!state.castle.alarm&&layout.dungeonStair&&castleAt(layout.dungeonStair))dispatch({type:'enterRoyalDungeon'});
  else if(!state.castle.alarm&&normalCastleInteraction())inspectCastle(normalCastleInteraction().id);
  else if(!state.castle.alarm&&castleAt(layout.throne))openPanel('court');
  return;
 }
 if(state.casino?.active){openPanel('casino');return;}const place=townPlace(state);if(!place){toast('Walk onto a gold entrance marker to visit a building.');return;}if(place.id==='arena')dispatch({type:'enterArena'});else openPanel(place.merchant?'shop':place.id);}
let castleInteractionId=null,castleHeadVisit=null,castleHeadReply=null,castleBathReply=null,castleTileVisit=null,castleGuardReply=null,arenaResult=null,guardConsultFx=null;
const castleRuler=figure=>['king','princess','governor'].includes(figure.kind);
const castleSubject=figure=>figure.id==='king'?'King Malachi':figure.kind==='guard'?figure.name+' '+figure.id.split('-').at(-1):figure.name;
const normalCastleInteraction=()=>castleInteractionsAt(state).find(figure=>figure.kind!=='talking-head');
const castlePromptLabel=figure=>['chest','book','bath'].includes(figure.kind)?'Inspect '+figure.name:'Speak to '+castleSubject(figure);

function inspectCastle(id){
 if(!state.castle||state.castle.alarm)return;
 const figure=castleInteractionAt(state,id);
 if(!figure||figure.kind==='talking-head')return;
 castleInteractionId=figure.id;
 if(['guard','chest','book'].includes(figure.kind)&&castleAt(figure))castleTileVisit=castleTileKey();
 castleBathReply=null;castleGuardReply=null;
 if(castleRuler(figure)){
  const alreadyOpen=activePanel==='castleInteraction';
  dispatch({type:'castleTalk',id:figure.id});
  if(alreadyOpen)return;
 }
 openPanel('castleInteraction');
}

function castleTileKey(){
 return state?.castle?state.location+':'+state.castle.x+','+state.castle.y:null;
}

function showCastleTileInteraction(){
 const tile=castleTileKey();
 if(!tile||castleTileVisit===tile||activePanel||combatView||document.hidden||$('game').hidden||state.pendingLoot?.length||state.castle.guardConsultation)return;
 const points=castleInteractionsAt(state).filter(castleAt);
 for(const kind of ['guard','chest','book']){
  if(kind==='guard'&&state.flags.royalHero)continue;
  const point=points.find(point=>point.kind===kind);
  if(point){inspectCastle(point.id);return;}
 }
}

function nearCastleHead(){
 const point=state?.castle&&castleLayout(state.location)?.talkingHead;
 return point&&Math.abs(point.x-state.castle.x)+Math.abs(point.y-state.castle.y)<=1?point:null;
}

function showCastleHead(){
 const point=nearCastleHead();
 if(!point||castleHeadVisit===point.id||activePanel||combatView||document.hidden||$('game').hidden||state.pendingLoot?.length)return;
 if(!castleInteractionAt(state,point.id))return;
 castleHeadVisit=point.id;
 castleHeadReply=null;
 openPanel('castleHead');
}

function renderCastleHead(body){
 const point=nearCastleHead();
 if(!point)return;
 const name='Talking '+point.species,reply=castleHeadReply?.id===point.id?castleHeadReply.text:null;
 $('panel-title').textContent=reply===null?'Say hello to the '+name+'?':name;
 const position=(point.artIndex%2)*100+'% '+Math.floor(point.artIndex/2)*100+'%';
 const controls=reply===null?castleInteractionActions(state,point.id).map(({label,action})=>button(esc(label),action,action.type==='greetCastleHead'?'primary':'')).join(''):'<button class="primary" data-finish-castle-head>Continue</button>';
 body.innerHTML='<section class="castle-head-conversation"><div class="castle-head-art" role="img" aria-label="'+esc(point.name)+'" style="background-position:'+position+'"></div><div>'+(reply===null?'':'<p class="castle-dialogue-line" role="status">'+esc(reply)+'</p>')+'<div class="panel-actions">'+controls+'</div></div></section>';
 const finish=body.querySelector('[data-finish-castle-head]');
 if(finish)finish.onclick=closePanel;
}

function renderCastleInteraction(body){
 const figure=castleInteractionAt(state,castleInteractionId);
 if(!figure)return;
 $('panel-title').textContent=figure.kind==='guard'?castleSubject(figure):figure.name;
 const ruler=castleRuler(figure),bath=figure.kind==='bath',layout=castleLayout(state.location);
 const receipt=bath&&castleBathReply?.id===figure.id?castleBathReply.text:figure.kind==='guard'&&castleGuardReply?.id===figure.id?castleGuardReply.text:'';
 const actions=castleInteractionActions(state,figure.id);
 const prefix=figure.name+': ';
 const lineIndex=state.log.findLastIndex(entry=>entry.startsWith(prefix));
 const line=state.log[lineIndex]?.slice(prefix.length);
 const lesson=figure.kind==='book'&&figure.rarity==='rare'&&lineIndex>=0?state.log[lineIndex+1]:'';
 const receiptText=receipt.startsWith(prefix)?receipt.slice(prefix.length):receipt;
 const text=receiptText||(figure.kind==='guard'&&state.flags.royalHero?'The guard bows silently as you pass.':figure.kind==='guard'&&castleAt(figure)?'State your business.':bath?'Warm water fills the healing bathtub.':figure.kind==='book'?(figure.read?figure.text:'A bound volume rests here.'):line||(figure.kind==='chest'?'The chest is locked.':'The guard watches the corridor.'));
 const nearby=castleInteractionsAt(state).filter(point=>point.kind!=='talking-head');
 const governor=figure.kind==='governor'?castleGovernorPortrait(state.location):null;
 const guard=figure.kind==='guard'?castleGuardPortrait(state.location,state.region):null;
 const chest=figure.kind==='chest'?castleChestPortrait(figure):null;
 const book=figure.kind==='book'&&Number.isInteger(figure.coverIndex);
 const position=governor?' style="background-position:'+governor.column*100/3+'% '+governor.row*50+'%"':guard?' style="background-position:'+guard.column*100+'% '+guard.row*100+'%"':chest?' style="background-position:'+chest.column*100+'% '+chest.row*100+'%;--chest-portrait-ratio:'+chest.width+'/'+chest.height+'"':book?' style="background-position:'+figure.coverIndex%4*100/3+'% '+Math.floor(figure.coverIndex/4)*100/3+'%"':'';
 const portrait=bath?(receipt?'<div class="castle-bath-receipt-art">'+avatarMarkup(state)+'</div>':'<img class="castle-bath-art" src="/assets/healing-bathtub.webp" alt="Healing bathtub">'):governor||guard||chest||book||['king','princess'].includes(figure.id)?'<div class="castle-dialogue-portrait" data-figure="'+figure.kind+'" role="img" aria-label="'+esc(book?'Cover of '+figure.name:figure.name)+'"'+position+(book?' data-book-category="'+esc(figure.category)+'"':'')+'></div>':'';
 const odds=figure.kind==='chest'?castleLockpickOdds(state,figure,effectiveAttributes(state,itemById).dexterity):null;
 const warning=ruler?'<p class="castle-dialogue-warning">'+layout.guards.length+(layout.governor?' palace guards':' royal guards')+' will intervene if you attack or provoke the ruler.</p>':odds?'<p class="castle-dialogue-warning">Lock difficulty '+odds.lockLevel+' · Lockpicking skill '+odds.skill+' · '+odds.chance+'% chance</p>':'';
 const controls=receipt?'<div class="panel-actions"><button class="primary" data-finish-castle-receipt>Continue</button></div>':ruler?'<form class="castle-dialogue-options"><fieldset><legend>Choose what to do</legend>'+actions.map(({label},i)=>'<label><input type="radio" name="castle-option" value="'+i+'"><span>'+esc(label)+'</span></label>').join('')+'</fieldset><button type="submit" class="primary" disabled>Continue</button></form>':'<div class="panel-actions">'+actions.map(({label,action})=>button(esc(label),action,['robCastleChest','readCastleBook','batheCastle'].includes(action.type)?'primary':'')).join('')+'</div>';
 const choices=!receipt&&nearby.length>1?'<nav class="castle-nearby" aria-label="Nearby in the castle">'+nearby.map(point=>'<button type="button" data-castle-figure="'+esc(point.id)+'" aria-pressed="'+(point.id===figure.id)+'">'+esc(castleSubject(point))+'</button>').join('')+'</nav>':'';
 const audience=figure.id==='king'||figure.id==='princess';
 const endingAudience=audience&&royalCampaignEndingAvailable(state);
 const royalControls=audience?royalAudienceControls(endingAudience):'';
 body.innerHTML=choices+'<section class="castle-conversation'+(portrait?' has-portrait':'')+'">'+portrait+'<div><p class="castle-dialogue-line" role="status">'+esc(text)+'</p>'+(endingAudience?royalControls:'')+(lesson?'<p class="castle-dialogue-effect">'+esc(lesson)+'</p>':'')+warning+controls+'</div></section>'+(endingAudience?'':royalControls);
 for(const option of body.querySelectorAll('[data-castle-figure]'))option.onclick=()=>inspectCastle(option.dataset.castleFigure);
 const finishReceipt=body.querySelector('[data-finish-castle-receipt]');
 if(finishReceipt)finishReceipt.onclick=closePanel;
 const form=body.querySelector('.castle-dialogue-options');
 if(form){
  const submit=form.querySelector('button[type=submit]');
  form.onchange=()=>{submit.disabled=!form.querySelector('input:checked');};
  form.onsubmit=event=>{
   event.preventDefault();
   const selected=form.querySelector('input:checked');
   if(selected)dispatch(actions[Number(selected.value)].action);
  };
 }
}

const palaceAdmission=document.createElement('div');
palaceAdmission.className='palace-admission';
palaceAdmission.hidden=true;
$('panel').querySelector('.dialog-heading').append(palaceAdmission);

function updatePalaceAdmission(name){
 const action=state&&name==='court'?castleEntryAction():'';
 palaceAdmission.hidden=!action;
 if(!action)return;
 const fine=state.wanted[state.region]*25;
 const paid=state.log.at(-1)?.startsWith('Your fine is paid.');
 const message=fine?'Pay the local fine to enter.':paid?'Fine paid. The palace doors are open.':'The palace doors are open.';
 palaceAdmission.innerHTML='<p role="status">'+message+'</p>'+action;
}

function palaceDirections(){
 const court=townPlaces(state).find(place=>place.id==='court');
 const here=townPosition(state);
 const vertical=court.y<here.y?'north':court.y>here.y?'south':'';
 const horizontal=court.x<here.x?'west':court.x>here.x?'east':'';
 const direction=vertical+horizontal;
 const name=state.location==='bellwether'?'The Royal Palace':'The Governor’s Palace';
 return name+(direction?' is '+direction+' of you':' is here')+' at ('+court.x+', '+court.y+').';
}

function castleEntryAction(){
 if(state.castle||townPlace(state)?.id!=='court')return '';
 const fine=state.wanted[state.region]*25;
 if(fine)return button('Pay local fine · '+fine.toLocaleString()+' gold',{type:'pardon'},'primary',state.gold<fine);
 return button(state.location==='bellwether'?'Enter Bellwether Castle':'Enter the governor’s palace',{type:'enterCastle'},'primary');
}

function royalAudienceControls(endingAudience=false) {
 if(state.location!=='bellwether')return '';
 const stage=state.flags.royalQuest;
 if(state.flags.royalStoryVersion===2){
  if(endingAudience){
   const choices=[['marriage','Marry Princess Bunnyfoot'],['farmer','Become a farmer'],['captain','Captain the Royal Guard'],['hero','Keep roaming as a hero']];
   return '<section class="item-comparison"><h3>Choose your future</h3><p>Marry and become heir, settle down on a farm, or lead the guard. Each ends the adventure. Keep roaming and monsters flee while townsfolk bow in silence.</p><div class="panel-actions">'+choices.map(([choice,label])=>button(label,{type:'royalChoice',choice})).join('')+'</div></section>';
  }
  const goal=royalCampaignObjective(state);
  return goal&&stage!=='opening'?'<section class="item-comparison"><h3>Current royal objective</h3><p>'+esc(goal)+'</p></section>':'';
 }
 if(stage==='wang'||stage==='trial'){
  const dialogue=stage==='wang'?WANG_TRIAL_DIALOGUE:ROYAL_BALROG_TRIAL;
  const speech=dialogue.map(line=>'<p><strong>'+esc(line.speaker)+'</strong><br>'+esc(line.text)+'</p>').join('');
  const ready=stage==='wang'?state.gold>=5000&&state.bag.includes('wang-sceptre'):state.flags.balrogDefeated&&state.bag.includes(BALROG_WHIP);
  const handover=stage==='wang'?button('Present the sceptre · 5,000 gold',{type:'royalWang'},'primary'):button('Present the Balrog’s whip',{type:'royalWhip'},'primary');
  return '<section class="item-comparison"><h3>'+ (stage==='wang'?'The Putrid Palace':'The King’s final test')+'</h3>'+speech+'<p>'+esc(nextObjective(state))+'</p>'+(ready?handover:'')+'</section>';
 }
 if(stage==='audience'&&state.flags.balrogTrialComplete){
  return '<section class="item-comparison"><h3>An audience with Princess Bunnyfoot</h3><div class="panel-actions">'+button('Ask Bunnyfoot to marry you',{type:'royalChoice',choice:'marriage'},'primary')+button('Imprison Bunnyfoot and become king',{type:'royalChoice',choice:'tyrant'})+'</div></section>';
 }
 if(stage==='escaped'||stage==='audience')return button('Speak to King Malachi',{type:'talk'},'primary');
 return '';
}
const royalIntroScript=()=>state.flags.royalStoryVersion===2?ROYAL_CAMPAIGN_INTRO:ROYAL_INTRO;
function recordedRoyalIntro(index){
 const line=royalIntroScript()[index],recorded=ROYAL_INTRO[index];
 return !!line&&line.text===recorded?.text&&line.speaker===recorded.speaker;
}
const newRoyalEnding=()=>state.flags.royalStoryVersion===2&&state.flags.royalEnding===state.ending&&Object.hasOwn(ROYAL_CAMPAIGN_ENDINGS,state.ending);
const endingExit=()=>newRoyalEnding()?'<button data-ending-title>Back to title</button>':button('Return to the roads',{type:'continue'});
function button(label,action,cls='',disabled=false){return `<button class="${cls}" data-action='${esc(JSON.stringify(action))}'${disabled?' disabled':''}>${label}</button>`;}
function sageOfWonkView(result='') {
 const cursed=state.equippedHead==='helm-thinkiness',offered=state.flags.sageWonkOffer;
 const capped=state.attributes?.intelligence>=ATTRIBUTE_CAP,canPay=state.gold>=5000;
 const removal=cursed?'<p>“I can get that thing off your head. Hold still while I find my good tongs.”</p>'+button('Remove cursed helm',{type:'sageRemoveHelm'},'primary'):'';
 const lesson=offered?'<p>“For 5,000 gold, I can teach you enough to raise your Intelligence permanently by one point.”</p>'+
  (capped?'<p>Your Intelligence is already at '+ATTRIBUTE_CAP+'.</p>':!canPay?'<p>You have '+state.gold.toLocaleString()+' gold.</p>':'')+
  button('Buy lesson · 5,000 gold',{type:'sageBuyIntelligence'},'primary',capped||!canPay):'';
 return '<section id="sage-of-wonk" class="item-comparison"><h3>Sage of Wonk</h3>'+
  (result?'<p role="status">'+esc(result)+'</p>':'')+(removal||lesson?removal+lesson:'<p>“Bring me a helm that won’t come off. I know where to pull.”</p>')+'</section>';
}
const wildernessHealth=document.createElement('div');
wildernessHealth.id='wilderness-health';
wildernessHealth.className='wilderness-health';
wildernessHealth.hidden=true;
wildernessHealth.innerHTML=`<div class="wilderness-health-label" aria-hidden="true"><span>Health</span><strong></strong></div>
<div class="wilderness-health-track" role="progressbar" aria-label="Wilderness health" aria-valuemin="0"><span></span></div>`;
$('mode-badge').before(wildernessHealth);
const wildernessHealthLabel=wildernessHealth.querySelector('.wilderness-health-label span');
const wildernessHealthValue=wildernessHealth.querySelector('strong');
const wildernessHealthTrack=wildernessHealth.querySelector('[role="progressbar"]');
const wildernessHealthFill=wildernessHealthTrack.firstElementChild;

function updateWildernessHealth(){
 wildernessHealth.hidden=state.mode!=='world'||!!combatView;
 if(wildernessHealth.hidden)return;
 const maxHp=state.maxHp;
 const hp=Math.max(0,Math.min(state.hp,maxHp));
 const fraction=hp/maxHp;
 const low=fraction<=.25;
 wildernessHealth.classList.toggle('is-low',low);
 wildernessHealthLabel.textContent=low?'Low health':'Health';
 wildernessHealthValue.textContent=`${hp} / ${maxHp} HP`;
 wildernessHealthTrack.setAttribute('aria-valuenow',hp);
 wildernessHealthTrack.setAttribute('aria-valuemax',maxHp);
 wildernessHealthTrack.setAttribute('aria-valuetext',`${hp} of ${maxHp} hit points${low?', low health':''}`);
 wildernessHealthFill.style.width=`${fraction*100}%`;
}

function update(){updateClockDisplay();updateWildernessHealth();if(!nearCastleHead())castleHeadVisit=null;if(castleTileVisit!==castleTileKey())castleTileVisit=null;
 const minor=state.dungeon?.site==='minor-site'?minorSiteDefinition(state.dungeon.minorId):null;
 updateLevelBanner();
 document.querySelector('.portrait').innerHTML=faceMarkup(state);
 $('hero-label').textContent=state.name;const level=effectiveLevel(state);$('level-label').textContent=`Level ${level}${level<state.level?' (drained)':''} · ${state.relics.length}/8 relics`;$('level-label').title=level<state.level?`${levelDrainMinutesLeft(state)} game minutes until level ${state.level} returns`:'';$('health-label').textContent=`${state.hp} / ${state.maxHp}`;$('health-bar').style.width=state.hp/state.maxHp*100+'%';$('gold').textContent=state.gold;if($('compact-vitals'))$('compact-vitals').textContent='♥ '+state.hp+'/'+state.maxHp+'   ◈ '+state.gold;$('region-kicker').textContent=REGIONS[state.region].subtitle;$('place-name').textContent=(state.mode==='dungeon'||state.mode==='battle'&&state.returnMode==='dungeon')?(minor?.name||dungeonName(state.dungeon)):state.mode==='town'?TOWNS.find(t=>t.id===state.location)?.name:(areaFor(state)?.name||REGIONS[state.region].name);$('chapter-title').textContent=state.flags.royalQuest&&state.flags.royalQuest!=='resolved'?'The Princess and the Knave':CHAPTERS[state.chapter].title;$('objective').textContent=nextObjective(state);
 $('mode-badge').textContent=state.mode==='dungeon'?(state.dungeon.ship?'ALIEN SPACECRAFT · COMMAND DECK':state.dungeon.site===ROYAL_DUNGEON_ID?'ROYAL DUNGEON · FIRST-PERSON EXPLORATION':state.dungeon.site==='firedrak'?`FIREDRAK MOUNTAIN - LEVEL ${state.dungeon.floor+1} OF 10`:state.dungeon.site==='elf-village'?`ELVEN VILLAGE · LEVEL ${state.dungeon.floor+1} OF 4`:(minor||[BOTTOMLESS_PIT.id,PUTRID_PALACE.id].includes(state.dungeon.site))?`LEVEL ${state.dungeon.floor+1} OF ${dungeonFloors(state.dungeon)}`:`DEPTH ${state.dungeon.floor+1} · FIRST-PERSON EXPLORATION`):state.mode==='battle'?(state.returnMode==='dungeon'?'ENCOUNTER · DUNGEON COMBAT':state.enemy.firstContact?'ENCOUNTER · STUDY YOUR FOE':'ENCOUNTER · TACTICAL MAP'):state.mode==='town'?(state.castle?'CASTLE INTERIOR · 25 FT VIEW':'TOWN STREETS · WALK TO AN ENTRANCE'):'THE OVERLAND ROAD';
 const navigation=state.mode==='dungeon'?dungeonNavigation(state.dungeon):null;const p=pointAt(state);$('scene-caption').textContent=state.mode==='world'?(p?`${p.name} · ${p.boatOnly?'Boat required':'Enter to explore'}`:'The road is yours. Arrow keys or the touch pad to travel.'):state.mode==='dungeon'?`Facing ${navigation.facing}. ${navigation.forward?'Corridor ahead — move forward.':`Wall ahead — ${navigation.left?'turn left':navigation.right?'turn right':'turn around'}.`} Arrow keys step; double-tap Left/Right or use Q/E to turn.`:state.mode==='battle'&&state.enemy.firstContact&&state.returnMode==='dungeon'?`${state.enemy.name} blocks the hallway. Level ${state.enemy.level??'?'} · Armor ${state.enemy.armor??0}. ${state.enemy.guard?'Heavy royal plate: extreme danger.':'Choose your first combat action.'}`:state.mode==='battle'?`Level ${state.enemy.level??'?'} · Armor ${state.enemy.armor??0} · Weakness: ${state.enemy.weakness||'none known'}.`:state.mode==='town'?(townPlace(state)?townPlace(state).name+' · E to interact':palaceDirections()+' Walk to its gold entrance marker.'):'';
 $('movement').hidden=state.mode==='battle'||state.mode==='ending'||!!state.arena;
 $('movement').innerHTML=state.mode==='dungeon'?button('↑',{type:'forward'})+button('↶',{type:'turn',delta:-1})+button('↓',{type:'back'})+button('↷',{type:'turn',delta:1})+button('←',{type:'strafe',delta:-1})+button('→',{type:'strafe',delta:1}):button('↑',{type:'mapStep',dx:0,dy:-1})+button('↶',{type:'mapTurn',delta:-1})+button('↓',{type:'mapStep',dx:0,dy:1})+button('↷',{type:'mapTurn',delta:1})+button('←',{type:'mapStep',dx:-1,dy:0})+button('→',{type:'mapStep',dx:1,dy:0});
 $('movement').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-label',state.mode==='dungeon'?['Move forward','Turn left','Move backward','Turn right','Step left','Step right'][i]:['Move forward','Turn left','Move backward','Turn right','Step left','Step right'][i]));
 $('movement').querySelectorAll('button').forEach((b,i)=>{const paths=['M20 4 4 21h10v15h12V21h10Z','M6 9v15h15l-6-6c12-8 17 2 17 13h7c0-20-16-28-29-18Z','M20 36 4 19h10V4h12v15h10Z','M34 9v15H19l6-6C13 10 8 20 8 31H1C1 11 17 3 30 13Z','M4 20 21 4v10h15v12H21v10Z','M36 20 19 4v10H4v12h15v10Z'];b.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="'+paths[i]+'"/></svg>';});
 if(state.castle){const buttons=$('movement').querySelectorAll('button');buttons[1].hidden=buttons[3].hidden=true;$('place-name').textContent=state.location==='bellwether'?'Bellwether Castle':TOWNS.find(t=>t.id===state.location).name+' Palace';}
 if(navigation){const buttons=$('movement').querySelectorAll('button');buttons[0].disabled=!navigation.forward;buttons[2].disabled=!navigation.back;buttons[0].title=navigation.forward?'Move forward':'Wall ahead — turn left or right';buttons[2].title=navigation.back?'Move backward':'Wall behind you';buttons[1].textContent='↶';buttons[3].textContent='↷';}
 if(state.mode==='battle')$('actions').innerHTML=button('⚔ Strike',{type:'attack'},'primary')+button('Guard',{type:'guard'})+button('USE MAGIC',{type:'useMagic'})+'<button data-panel="potions">Drink potion</button>'+ (state.meals>0?button('Eat meal ('+state.meals+')',{type:'eat'}):'')+(state.arena?.prisoner?'':state.enemy.firstContact&&state.enemy.surprised?button('EVADE',{type:'evade'}):button('Retreat',{type:'flee'}))+(state.bag.includes('galen-fireball-ring')&&state.flags.galenRingCharges>0?button('Galen’s Fireball · '+state.flags.galenRingCharges,{type:'useItem',id:'galen-fireball-ring'}):'')+(state.enemy.speciesId==='haghilda'&&!state.enemy.peppered&&state.bag.includes('holy-pepper-grenade')?button('Throw Holy Pepper Grenade',{type:'pepper'},'primary'):'');
 else if(state.mode==='ending')$('actions').innerHTML='<button data-panel="ending" class="primary">Read your ending</button>'+endingExit();
 else if(state.mode==='town'&&state.castle){
  const layout=castleLayout(state.location),chest=castleChestAt(state);
  const room=layout.rooms.find(room=>room.id===layout.tiles[state.castle.y][state.castle.x]);
  const atDoors=castleAt(layout.entrance),atDungeonStair=layout.dungeonStair&&castleAt(layout.dungeonStair);
  const interaction=state.castle.alarm?null:normalCastleInteraction();
  const canSpeak=!state.castle.alarm&&(castleAt(layout.throne)||castleRulerAt(state));
  const guardsInView=castleGuards(state).filter(guard=>castlePointVisible(state,guard)).length;
  const roomName=room?.name||'Castle corridor';
  $('scene-caption').textContent=state.castle.alarm?'The castle alarm is ringing. Reach the southern doors.':chest?chest.name+' · Locked':atDoors?'Castle doors · E to leave':atDungeonStair?'Royal Dungeon stairs · E to descend':roomName+(guardsInView?' · '+guardsInView+' guard'+(guardsInView===1?'':'s')+' in view':'')+(interaction?' · E to interact':'');
  if(state.castle.guardConsultation){$('mode-badge').textContent='GUARD CONSULTATION · WAIT HERE';$('scene-caption').textContent='WAIT HERE. The guard is consulting the ruler.';}
  const inspect=interaction?button(esc(castlePromptLabel(interaction)),{type:'inspectCastle',id:interaction.id},'primary'):'';
  $('actions').innerHTML=inspect+(canSpeak?'<button data-panel="court">Court & Watch</button>':'')+(atDungeonStair&&!state.castle.alarm?button('Descend to Royal Dungeon',{type:'enterRoyalDungeon'},'primary'):'')+(layout.dungeonStair?'<button data-panel="castleMap">Castle map</button>':'')+(atDoors?button('Leave castle',{type:'leaveCastle'}):'');
 }
 else if(state.mode==='town'&&state.arena)$('actions').innerHTML='<button class="primary" data-panel="arena">Arena bouts</button>';
 else if(state.mode==='town')$('actions').innerHTML=(state.casino?.active?button('Resume casino game',{type:'enter'},'primary'):castleEntryAction())+button('Leave town',{type:'leave'});
 else if(state.mode==='dungeon'&&state.dungeon.site==='elf-village')$('actions').innerHTML=button(state.dungeon.floor===3?'Enter Haghilda’s lair':'Enter tree door / climb up',{type:'descend'},'primary')+button(state.dungeon.floor?'Climb down':'Leave forest',{type:'leave'})+(state.dungeon.floor===2&&state.dungeon.x===7&&state.dungeon.y===7?button('Search fallen elf',{type:'searchElf'}):'')+'<button data-panel="potions">Drink potion</button>';
 else if(state.mode==='dungeon'&&state.dungeon.site===ROYAL_DUNGEON_ID){
  const point=royalDungeonAt(state);
  let controls='';
  if(point?.kind==='npc'){
   $('scene-caption').textContent=point.name+(state.flags.royalHero?' bows in silence.':' · Enter to speak');
   if(!state.flags.royalHero)controls='<button class="primary" data-panel="royalDungeonNpc">Speak to the '+esc(point.name)+'</button>';
  }else{
   controls=royalDungeonActions(state).map(({label,action})=>button(esc(label),action,'primary')).join('');
   if(point?.kind==='cell')$('scene-caption').textContent=point.name+(state.dungeon.cellsOpen?' · The prisoners are free.':' · '+point.prisoners.map(prisoner=>prisoner.name).join(', '));
   if(point?.kind==='stair')$('scene-caption').textContent='Stair to Bellwether Castle';
  }
  $('actions').innerHTML=controls+'<button data-panel="potions">Drink potion</button>';
 }
 else if(state.mode==='dungeon'&&state.dungeon.royal)$('actions').innerHTML=(state.dungeon.royal==='cell'?button('Search cell',{type:'royalSearch'}):'')+button(state.dungeon.royal==='cell'?'Open trapdoor':state.flags.galenFreed?'Push loose stones':'Free Galen',{type:'descend'},'primary')+'<button data-panel="potions">Drink potion</button>';
 else if(state.mode==='dungeon'&&minor){
  const d=state.dungeon,ladder=ladderPrompt(state,dungeonMap(d));
  const atTunnelExit=minor.kind==='tunnel'&&d.x===13&&d.y===13;
  const stairs=atTunnelExit?button('Exit tunnel',{type:'descend'},'primary')
   :ladder?.direction==='down'?button('Descend',{type:'descend'},'primary')
   :ladder?.direction==='up'?button(d.floor?'Ascend':'Leave '+esc(minor.name),{type:'leave'},'primary'):'';
  $('actions').innerHTML=stairs+'<button data-panel="potions">Drink potion</button>';
 }
 else if(state.mode==='dungeon'){
  const d=state.dungeon,bottom=d.floor===dungeonFloors(d)-1;
  const pitAction=pitBottomAction(state);
  const label=pitAction==='pitElevator'?'Ride the surface elevator':d.site===BOTTOMLESS_PIT.id&&bottom?'Face the Balrog':d.site===PUTRID_PALACE.id&&bottom?'Challenge Wang':bottom?'Open reliquary':'Descend';
  $('actions').innerHTML=button(label,{type:pitAction==='pitElevator'?'pitElevator':'descend'},'primary')+button('Ascend / leave',{type:'leave'})+'<button data-panel="potions">Drink potion</button>';
 }
 else $('actions').innerHTML=(state.mode==='world'&&p?.kind==='minorSite'?button('Enter '+esc(p.name),{type:'enter'},'primary'):'')+'<button data-panel="potions">Drink potion</button>';
 const atShipConsole=state.mode==='dungeon'&&state.dungeon?.ship&&Math.abs(state.dungeon.x-7)+Math.abs(state.dungeon.y-5)<=7;
 $('planet-console').hidden=!atShipConsole;
 $('planet-console').innerHTML=atShipConsole?'<p class="eyebrow">SHIP CONTROL STATION</p><h3>Select a planet to land</h3><div class="planet-choices">'+PLANETS.map((name,planet)=>button('<span class="planet-orb planet-'+planet+'" aria-hidden="true"></span><strong>'+esc(name.split(',')[0])+'</strong><span>'+esc(name.split(', ')[1])+'</span>',{type:'navigatePlanet',planet},'planet-choice')).join('')+'</div>':'';
 if(state.dungeon?.ship&&state.mode==='dungeon')$('actions').innerHTML=atShipConsole?'<span>Tap a planet on the control station to land.</span>':'<span>Find the control station at (7, 5).</span>';
 if(state.dungeon?.site===ROADSIDE_CRYPT&&state.mode==='dungeon'){
  const atLadder=state.dungeon.x===1&&state.dungeon.y===1;
  $('actions').innerHTML=(atLadder?button('Leave crypt',{type:'leave'},'primary'):'')+'<button data-panel="potions">Drink potion</button>';
 }
 if(state.dungeon?.expedition&&state.mode==='dungeon')$('actions').innerHTML=button(state.dungeon.floor===2?'Challenge guardian':'Descend',{type:'descend'},'primary')+button('Ascend / leave',{type:'leave'})+'<button data-panel="potions">Drink potion</button>';
 if(state.arena){$('place-name').textContent=townPlace(state)?.name||'Gladiator Pit';$('mode-badge').textContent=(state.arena.prisoner?'ARENA PRISONER':'ARENA')+' · '+state.arena.wins+'/'+ARENA_WINS_REQUIRED+' WINS';if(state.mode==='town')$('scene-caption').textContent=state.arena.prisoner?'Win ten bouts to recover your equipment and leave.':'Choose your next bout or leave the arena.';}
 if(state.mode==='world'&&state.exploration?.artifacts?.length>=10&&!state.exploration?.area)$('actions').innerHTML+=button('Beam to starship',{type:'boardShip'});
 if(state.mode==='world'&&p?.kind==='town'&&state.flags['palaceBan:'+p.id])$('actions').innerHTML=button('Pay entrance guards · 5,000 gold',{type:'payGovernor'},'primary')+'<span>Barred by this governor. Payment restores entry.</span>';
 if(state.mode==='world'&&p?.kind==='town'){
  const fine=castleFineFor(state,p.id);
  if(fine)$('actions').insertAdjacentHTML('afterbegin',button('Pay robbery fine · '+fine.toLocaleString()+' gold',{type:'payCastleFine'},'primary',state.gold<fine));
  else if(!state.flags['palaceBan:'+p.id])$('actions').insertAdjacentHTML('afterbegin',button('Enter '+esc(p.name),{type:'enter'},'primary'));
 }
 if(state.mode==='world'&&p?.kind==='town'&&cityOf(state,p.id)?.destroyed)$('actions').innerHTML=button('Rebuild '+esc(p.name)+' · 500 gold',{type:'cityRebuild'},'primary');
 if(state.mode==='dungeon'){const chest=dungeonChests(state,dungeonMap(state.dungeon)).find(c=>c.x===state.dungeon.x&&c.y===state.dungeon.y);if(chest){const revisit=chest.opened&&(!minor||minor.treasure)&&state.openedChests.indexOf(chest.id)<(state.flags.chestVisitStart??state.openedChests.length)&&!state.flags['missedCoins:'+chest.id];$('scene-caption').textContent=chest.opened?(revisit?'Someone was here before you. They missed a few coins.':'You already opened this chest.'):'A treasure chest lies at your feet. Open it to claim the contents.';$('actions').insertAdjacentHTML('afterbegin',chest.opened?(revisit?button('Search for missed coins',{type:'rummageChest'},'primary'):''):button('Open chest',{type:'openChest'},'primary'));}}
 if(state.mode==='battle'&&state.equipped==='holy-avenger'&&(state.enemy.boss||undead(state.enemy)))$('scene-caption').textContent+=' Your Holy Avenger glows.';
 if(state.mode==='dungeon')$('actions').insertAdjacentHTML('beforeend','<button data-save-checkpoint>Save dungeon checkpoint</button>');
 $('context').innerHTML=state.castle?'':state.mode==='town'?`<div class="context-box"><b>Find your way</b><p>${esc(palaceDirections())} Other buildings have signs and gold entrance markers. The town gate is to the south.</p></div>`:state.wanted[state.region]>0?`<div class="context-box"><b>Wanted by the crown</b><p>Local bounty: ${state.wanted[state.region]*25} gold. A pardon can be purchased in town.</p></div>`:'';
 if(state.location==='bellwether')$('context').innerHTML+=`<p>Royal guards defeated: ${Math.min(20,state.flags.royalGuardWins||0)} / 20</p>`;


 showLadderPrompt();
 updateCombatPanel(state);
 $('event-log').innerHTML=state.log.slice(-5).map(t=>`<p>${esc(t)}</p>`).join('');$('event-log').scrollTop=$('event-log').scrollHeight;
}
function draw(t){
 if($('game').hidden)return;
 if(t-lastFrame>33){
  const consultation=state.mode==='town'&&state.castle&&guardConsultFx?.town===state.location&&t<guardConsultFx.start+guardConsultFx.duration?guardConsultFx:null;
  render($('scene'),combatView||state,t,combatFx||consultation,matchMedia('(prefers-reduced-motion: reduce)').matches);
  lastFrame=t;
 }
 frame=requestAnimationFrame(draw);
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.action){try{dispatch(JSON.parse(b.dataset.action));}catch(err){toast(err.message);}}if(b.dataset.panel)openPanel(b.dataset.panel);if(b.hasAttribute('data-ending-title')){if(activePanel)closePanel();$('home').click();}});
let arrowTap=null;
function cancelArrowTap(){if(arrowTap)clearTimeout(arrowTap.timer);arrowTap=null;}
window.addEventListener('blur',cancelArrowTap);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelArrowTap();});
let nextWildernessStep=0;
document.addEventListener('keydown',e=>{if(!state||$('game').hidden||e.target.matches('input,select,textarea,[contenteditable=true]'))return;
 if(e.key.toLowerCase()==='i'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();if(e.repeat)return;cancelArrowTap();if(activePanel==='inventory')closePanel();else if(!$('panel').open)openPanel('inventory');return;}
 if($('panel').open)return;
 if(e.key==='Enter'&&state.mode==='dungeon'&&state.dungeon.site===ROYAL_DUNGEON_ID){
  const point=royalDungeonAt(state);
  if(point?.kind==='npc'||point?.kind==='stair'){
   e.preventDefault();
   if(e.repeat||combatView)return;
   if(point.kind==='npc')openPanel('royalDungeonNpc');
   else dispatch({type:'leave'});
   return;
  }
 }
 if(state.mode==='dungeon'&&['ArrowLeft','ArrowRight'].includes(e.key)){
  e.preventDefault();if(e.repeat||combatView)return;const delta=e.key==='ArrowLeft'?-1:1,now=performance.now();
  if(arrowTap&&arrowTap.key===e.key&&now-arrowTap.time<240){cancelArrowTap();dispatch({type:'turn',delta});return;}
  cancelArrowTap();const snapshot=state;
  arrowTap={key:e.key,time:now,timer:setTimeout(()=>{arrowTap=null;if(state===snapshot&&!document.hidden&&!$('panel').open&&!$('game').hidden)dispatch({type:'strafe',delta});},240)};return;
 }
 cancelArrowTap();let a;if(state.mode==='dungeon'){a={ArrowUp:{type:'forward'},w:{type:'forward'},ArrowDown:{type:'back'},s:{type:'back'},ArrowLeft:{type:'strafe',delta:-1},a:{type:'strafe',delta:-1},ArrowRight:{type:'strafe',delta:1},d:{type:'strafe',delta:1},q:{type:'turn',delta:-1},e:{type:'turn',delta:1},Enter:{type:'descend'}}[e.key];}else a={ArrowUp:{type:'move',dx:0,dy:-1},w:{type:'move',dx:0,dy:-1},ArrowDown:{type:'move',dx:0,dy:1},s:{type:'move',dx:0,dy:1},ArrowLeft:{type:'move',dx:-1,dy:0},a:{type:'move',dx:-1,dy:0},ArrowRight:{type:'move',dx:1,dy:0},d:{type:'move',dx:1,dy:0},e:{type:'enter'},' ':{type:'attack'}}[e.key];if(a){e.preventDefault();if(state.mode==='world'&&a.type==='move'){const now=performance.now();if(e.repeat&&now<nextWildernessStep)return;nextWildernessStep=now+wildernessStepDelay(state,a);}dispatch(a);}});
$('scene').addEventListener('pointerdown',e=>{
 if(!['world','town'].includes(state?.mode))return;
 if(state.arena&&state.mode==='town'){openPanel('arena');return;}
 const inTown=state.mode==='town';
 const view=state.castle?castleViewport(state):inTown?{left:0,top:0,cols:TOWN_SIZE,rows:TOWN_SIZE}:worldViewport(state);
 const pos=state.castle||(inTown?townPosition(state):state),r=$('scene').getBoundingClientRect();
 const x=view.left+Math.floor((e.clientX-r.left)/r.width*view.cols),y=view.top+Math.floor((e.clientY-r.top)/r.height*view.rows);
 const dx=x-pos.x,dy=y-pos.y;
 if(dx===0&&dy===0)dispatch({type:'enter'});
 else if(Math.abs(dx)>Math.abs(dy))dispatch({type:'move',dx:Math.sign(dx),dy:0});
 else dispatch({type:'move',dx:0,dy:Math.sign(dy)});
});
function gateChallengeAvailable(gate){
 return gate&&['gate','branchGate'].includes(gate.kind)&&!state.flags.royalHero&&
  !state.flags['gateAccess:'+gate.id]&&!state.flags['gateChallengeWon:'+gate.id];
}
function openPanel(name,{winkShot=false,winkResult=null}={}){if(state&&gagActive(state,'helium')&&['shop','talk','court','quests','inn','fortune','casino','borderTaunt','guardTaunt','travelMerchant','gossipGuard'].includes(name))name='squeakyVoice';if(name==='talk'&&activePanel!=='talk'&&!state.flags.royalHero){state=act(state,{type:'gossipBegin'});persist();if(state.flags.gossipGuardTown)name='gossipGuard';}entryPrompt.hidden=true;ladderPopup.hidden=true;if(name!=='casino'||activePanel!=='casino')stopIntroVoice();if(name==='inventory'&&activePanel!=='inventory')inventorySelection=null;activePanel=name;$('panel').dataset.panel=name;updatePalaceAdmission(name);const titles={halChallenge:'Hal 2000',halOutcome:'Termination',dragonGreeting:'Your New Dragon',dragonDefense:'Your Dragon Needs You',dragonNotice:'A Dragon in Trouble',artifactReveal:'The Ancient Alien Disk',boatReveal:'A Boat in Your Pocket',rescue:'A Most Undignified Rescue',journal:'The traveler’s journal',peaceful:'A roadside offer',atlas:'World Map',castleMap:'Bellwether Castle map',castleInteraction:'Castle',arena:'Gladiator Pit',castleHead:'Talking trophy',royalDungeonNpc:'Royal Dungeon',crystalTravel:'Alien Artifact',dungeonElevator:'Dungeon Elevator',inventory:state?.name||'Adventurer',webster:'Ask Webster',settings:'Sound & settings',shop:'The traveling market',casino:'The Gilded Goose Gambling House',quests:'Odd Jobs',court:'The crown & the road',ending:'The shape of your legacy',royalEpilogue:'The hero on the road',inn:'The Lantern Inn',talk:'Gossip in the Square',gossipGuard:'Gossip Ain’t Free',gagReveal:'A Questionable Vintage',squeakyVoice:'A Most Unfortunate Voice',travelMerchant:'A traveling merchant',new:'Begin another story?',loot:'You found something',potions:'Drink a potion',spells:'Scrolls & Wands',fortune:'A thoroughly unwelcome prediction',borderTaunt:'The royal border patrol',guardTaunt:'An unwelcome reception',royalIntro:'An exceptionally poor proposal'};$('panel-title').textContent=titles[name]||name;const body=$('panel-body');
 if(!state&&!['settings','new'].includes(name))return;
 if(gagActive(state,'pigFace')&&['shop','travelMerchant','casino','court','royalIntro','guardTaunt','borderTaunt','gossipGuard'].includes(name))pigTauntPending=playPigTaunt();
 if(name==='developer'&&developerMode){$('panel-title').textContent='Developer preview';body.innerHTML=previewView(state,previewRules);}
 if(name==='borderTaunt'){
  const gate=pointAt(state),challenge=gateChallengeAvailable(gate);
  const requirement='Bring both relics from this land or ride a dragon to cross.';
  body.innerHTML=`<div class="royal-cinematic"><img class="royal-court-scene" src="/assets/border-guards.webp" alt="Three royal guards mock the adventurer and dip his head into a barrel beside the locked border gate"><h3>The border is closed</h3><p>${requirement}</p>${gate?.boatOnly?'<p>Bring a boat if you’re crossing by water.</p>':''}${challenge?'<p>The optional challenge pits you against three level-50 guards in succession.</p>':''}<div class="panel-actions">${challenge?button('Attack the Guards',{type:'attackBorderGuards'}):''}<button id="replay-border">Replay guard</button><button class="primary" id="leave-border">Back to the road</button></div></div>`;
 }
 if(name==='guardTaunt')body.innerHTML=`<div class="royal-cinematic"><img class="royal-court-scene" src="/assets/royal-guards.webp" alt="Two ugly heavily armored guards laughing over the fallen adventurer outside Bellwether."><p class="eyebrow">${state.flags.pennilessTown?esc(TOWNS.find(t=>t.id===state.flags.pennilessTown)?.name||'Town')+' · THE TOWN GATE':'BELLWETHER · THE ROYAL GATE'}</p><p id="guard-dialogue" class="royal-dialogue"></p><p>${state.flags.pennilessTown?'The guards refuse entry. Return with some gold in your pocket.':state.mode==='world'?'The royal gates remain closed.':state.dungeon?.royal==='cell'?'Your gold gets you through the gate—and into the royal dungeon.':'The guards finally let you through.'}</p><div class="panel-actions"><button id="replay-guards">Replay voices</button><button id="leave-guards">Continue</button></div></div>`;
 if(name==='royalIntro'){const n=state.flags.royalIntroLine,script=royalIntroScript(),line=script[n],last=n===script.length-1,door=n===0&&state.flags.royalEntranceSeen===false;body.innerHTML=`<div class="intro-stage"><img class="intro-backdrop" src="/assets/${n===0?'royal-court.webp':'royal-intro-'+(n+1)+'.webp'}" alt="">${door?'<img id="royal-door-still" class="intro-backdrop" src="/assets/royal-doorway.webp" alt="Two grinning guards at the throne room entrance">':''}<div class="intro-caption"><p class="eyebrow">BELLWETHER COURT · ${n+1} / ${script.length}</p><h3>${door?'An exceptionally poor proposal':esc(line.speaker)}</h3><p class="royal-dialogue">${door?'The guards find your ambitions hilarious.':esc(line.text)}</p><div class="panel-actions">${door?button('Skip to the court',{type:'royalEntranceEnd'}):button(last?'Face the world':'Continue',{type:'royalIntroNext'},'primary')}${door?'':(recordedRoyalIntro(n)?'<button id="replay-dialogue">Replay voice</button>':'')+button('Skip introduction',{type:'royalIntroSkip'})}</div></div></div>`;}
 if(name==='inventory'){
  const wasOpen=body.querySelector('.inventory-stats')?.open;
  const attributeFocus=body.contains(document.activeElement)?document.activeElement.dataset.attribute:null;
  body.innerHTML=inventoryView(state,inventorySelection);
  const stats=body.querySelector('.inventory-stats');
  if(wasOpen)stats.open=true;
  if(attributeFocus)(stats.querySelector(`[data-attribute="${attributeFocus}"]`)||stats.querySelector('summary')).focus({preventScroll:true});
 }
 if(name==='webster'){
  const greeting=WEBSTER_GREETINGS[Math.floor(Math.random()*WEBSTER_GREETINGS.length)];
  body.innerHTML='<div class="webster-amulet">'+itemArt(itemById('webster',state))+'</div><h3>'+esc(greeting)+'</h3><form id="webster-question"><label for="webster-input">Your question</label><input id="webster-input" type="text" maxlength="180" required autocomplete="off"><button class="primary">Ask</button></form><p id="webster-answer" role="status"></p><button type="button" id="webster-back">Back to inventory</button>';
  $('webster-question').onsubmit=e=>{e.preventDefault();const question=$('webster-input').value.trim();if(question)$('webster-answer').textContent=websterAnswer(question);};
  $('webster-back').onclick=()=>{openPanel('inventory');inventorySelection={id:'webster',source:state.equippedNecklace==='webster'?'slot':'bag'};openPanel('inventory');};
 }
 if(name==='wildernessEvent')body.innerHTML=wildernessEventView(state,button);
 if(name==='spells')body.innerHTML=spellsView(state,itemById,itemArt,button,esc);
 if(name==='potions'){const potions=[...new Set(state.bag)].map(id=>itemById(id,state)).filter(i=>i?.kind==='potion');body.innerHTML=`<p>Choose a potion. Drinking during combat uses your action; the enemy may respond.</p><div class="shop-grid">${state.potions?`<section class="shop-item">${itemArt({shape:'potion',color:'#d8b778'})}<h3>Bitter tonic ×${state.potions}</h3><p>Restores up to 45 health.</p>${button('Drink tonic',{type:'heal'})}</section>`:''}${potions.map(i=>`<section class="shop-item">${itemArt(i)}<h3>${esc(i.name)} ×${state.bag.filter(id=>id===i.id).length}</h3><p>${esc(i.description)}</p>${button('Drink '+esc(i.name),{type:'useItem',id:i.id})}</section>`).join('')}</div>${!potions.length&&!state.potions?'<p>Your bag has no potions. Find them in dungeon chests or buy them from a merchant.</p>':''}<p role="status">${esc(state.log.at(-1))}</p>`;}

 if(name==='gossipGuard'){body.innerHTML=`<div class="gossip-guard-scene"><img src="/assets/gossip-guard.webp" alt="A huge heavily armored guard looms over you, demanding payment"><div><p class="eyebrow">AN UNWELCOME INTERRUPTION</p><h3>The Square’s Royal Bully</h3><blockquote>Move Along Scum. Gossip Ain’t Free, Except for Me!</blockquote><p>Your purse: ${state.gold} gold.</p><div class="panel-actions"><button data-action='{"type":"gossipGuardPay"}' ${state.gold<5?'disabled':''}>Pay 5 Gold</button>${button('Attack the Guard',{type:'gossipGuardAttack'})}${button('Leave',{type:'gossipGuardLeave'})}</div><button id="replay-gossip-guard" class="text-button">Replay voice ♫</button><p class="fine">A level-50 royal guard. Heavy armour. No manners.</p></div></div>`;body.querySelector('#replay-gossip-guard').onclick=playGossipGuardVoice;playGossipGuardVoice();}
 if(name==='halChallenge'){body.innerHTML=halView(state,button,esc);playHalSequence();}
 if(name==='halOutcome'){body.innerHTML=halOutcomeView(button);audio.unlock().then(()=>audio.effect('hal-crush'));}
 if(name==='bossIntro'){
  const enemy=state.enemy;
  const taunts={
   [BALROG_ID]:'A hundred floors, and still you came. Let us see how long you can stand.',
   [WANG_ID]:'Two hammers, a hundred slugs, and one fool. I like those odds!',
   'drake-defiler':'You should have stayed home with your mama. This mountain is MY roost!',
   'haghilda':'Run back to the henhouse, little chick. I can smell your fear from here!',
   'leviathan-levity':'Your mama warned you about deep water. Now you are the punch line!',
   'ghost-dragon':'You should have hidden with the chickens. I will make ash of your courage!',
   'The Bailiff of Bones':'Your mother should have taught you to pay your debts. I accept payment in bones.',
   'Rock Troll':'Should have stayed in the henhouse. I eat brave little chickens whole!',
   'Justice Without Eyes':'Your mother may think you innocent. This court has already sentenced you.',
   'The Furnace Regent':'You should have stayed by your mama’s hearth. My furnace has room for one more.',
   'The Curator of Drownings':'Your mother told you never to swim alone. I’m collecting that memory next.',
   'depth-6-necromancer':'Your mother told you to come home before dark. Too late. Report for your eternal shift.',
   'The Unanimous King':'We have voted unanimously. You should have stayed home with your mother.',
   'Forgotten Cave Guardian':'Go home to your mama, little trespasser. The last fool is still in the doorway.',
   'Alien Vault Sentinel':'Unauthorized chicken detected. Return to your henhouse or be dismantled.',
   'Brainbot Overseer':'Analysis complete. Your mother raised a remarkably fragile organism.',
   'Crazed Astronaut Captain':'You should have stayed home, cadet. Out here, nobody can hear you call your mama.',
   'space-agi-seven':'Your mother warned you about strangers. I am every stranger on this station.',
   'space-rosie':'Mama sent you down here without a coat? Hold still while I weld you one.'
  };
  const taunt=taunts[enemy.speciesId]||taunts[enemy.name]||'You should have stayed home with your mama. Your adventure ends here!';
  const illustrations={
   [BALROG_ID]:{file:'balrog-of-despair.webp',alt:'The Balrog of Despair raises a flaming sword and a fire whip'},
   [WANG_ID]:{file:'wang-the-sluglord.webp',alt:'Wang the Nauseating lifts two sledgehammers above a swarm of slugs'},
  };
  const illustration=illustrations[enemy.speciesId];
  const backdrop=illustration?'<img class="intro-backdrop" src="/assets/'+illustration.file+'" alt="'+esc(illustration.alt)+'">':'<canvas class="intro-backdrop" width="1000" height="640" aria-label="'+esc(enemy.name)+'"></canvas>';
  body.innerHTML='<div class="intro-stage">'+backdrop+'<div class="intro-caption"><h3>'+esc(enemy.name)+'</h3><p>'+esc(taunt)+'</p><button id="face-boss" class="primary">Face the boss</button></div></div>';
  const canvas=body.querySelector('canvas');
  if(canvas){
   const draw=()=>{if(activePanel==='bossIntro'&&state.enemy===enemy)paintMonster(canvas.getContext('2d'),enemy,212,0,576,576,state.dungeon?.index||0);};
   draw();setTimeout(draw,300);
  }
  const voice = ({'drake-defiler':'drakeVoice','rock-troll':'voice-rock-troll','Rock Troll':'voice-rock-troll','The Bailiff of Bones':'voice-bailiff','haghilda':'voice-haghilda','leviathan-levity':'voice-leviathan','Seer Morgana':'voice-morgana'})[enemy.speciesId] || ({'Rock Troll':'voice-rock-troll','The Bailiff of Bones':'voice-bailiff','Seer Morgana':'voice-morgana'})[enemy.name];
  if(voice)audio.unlock().then(()=>{if(activePanel==='bossIntro'&&state.enemy===enemy)audio.effect(voice);});
  body.querySelector('#face-boss').onclick=()=>closePanel();
 }
 if(name==='dragonGreeting'){body.innerHTML='<div class="dragon-greeting"><span class="dragon-run-in" aria-hidden="true"></span><img src="/assets/dragon-greeting.webp" alt="Your dragon bounds up and licks your face with dreadful breath"><div><h3>GLEEEEEP!</h3><p>Your new dragon runs up, licks your face, and shares its horrifying breath.</p>'+button('Saddle up',{type:'acknowledgeDragon'},'primary')+'</div></div>';audio.unlock().then(()=>audio.effect('dragon-greep'));}
 if(name==='dragonDefense')body.innerHTML=dragonDefenseView(state,button);
 if(name==='dragonNotice'&&state.flags.dragonDeparted&&state.flags.dragonNotice?.startsWith('Gleep found')){
  body.innerHTML='<div class="dragon-greeting"><img src="/assets/dragon-farewell.webp" alt="Gleep embraces his true love and gives you a farewell lick"><p>'+esc(state.flags.dragonNotice)+'</p>'+button('Farewell, Gleep',{type:'acknowledgeDragon'},'primary')+'</div>';
 }else if(name==='dragonNotice'&&state.flags.drakeDefeated&&state.flags.dragonNotice?.startsWith('Drake falls!')){
  body.innerHTML='<div class="dragon-greeting"><img src="/assets/dragon-greeting.webp" alt="Your rescued dragon greets you"><div><h3>GLEEEEEP!</h3><p>'+esc(state.flags.dragonNotice)+'</p>'+button('Understood',{type:'acknowledgeDragon'},'primary')+'</div></div>';
  audio.unlock().then(()=>{if(activePanel==='dragonNotice')audio.effect('dragon-greep');});
 }else if(name==='dragonNotice')body.innerHTML='<h3>'+esc(state.flags.dragonNotice)+'</h3>'+button('Understood',{type:'acknowledgeDragon'});
 if(name==='gagReveal'){const item=GAG_ITEMS[state.flags.gagReveal];if(item?.effect==='helium')playHeliumVoice();body.innerHTML=`<div class="potion-reveal">${item?.effect==='tiny'?'<img src="/assets/mouse-adventurer.webp" alt="Your mouse-sized adventurer hides beside a dandelion from a giant hornet">':item?.effect==='pigFace'?'<div class="potion-pig">'+pigFaceSvg+'</div>':''}<h3>${esc(item?.name)}</h3><p class="royal-dialogue">${esc(item?.reveal)}</p><button id="accept-gag">Oh, splendid.</button></div>`;body.querySelector('#accept-gag').onclick=closePanel;const revealed=state.flags.gagReveal;setTimeout(()=>{if(activePanel==='gagReveal'&&state.flags.gagReveal===revealed)closePanel();},6500);}
 if(name==='squeakyVoice')body.innerHTML=`<div class="potion-reveal"><h3>“${HELIUM_REFUSAL}”</h3><p>Nobody will do business with you until the helium wears off. ${buffTimeLeft(state,'helium')} game minutes remain. There is no cure.</p>${state.flags.borderTauntPending&&gateChallengeAvailable(pointAt(state))?button('Attack the Guards',{type:'attackBorderGuards'}):''}<button id="leave-squeak">Leave</button></div>`;
 if(name==='travelMerchant'){const price=merchantBuyPrice(state,5000);body.innerHTML=`<h3>Quentin Quack, itinerant apothecary</h3><p>“A small price for a face your mother recognises.”</p>${itemArt(GAG_ITEMS['potion-cure-all'])}<h3>Potion of Cure-All</h3><p>${esc(GAG_ITEMS['potion-cure-all'].description)}</p><p>Your purse: ${state.gold} gold.</p><button data-action='{"type":"buyCureAll"}' ${state.gold<price||state.flags.travelMerchant?.sold?'disabled':''}>${state.flags.travelMerchant?.sold?'Sold out':'Buy · '+price.toLocaleString()+' gold'}</button><button id="leave-travel-merchant">Leave</button>`;}
 body.querySelector('#leave-squeak')?.addEventListener('click',closePanel);body.querySelector('#leave-travel-merchant')?.addEventListener('click',closePanel);
 if(name==='inn'){
  body.innerHTML=innView(state,button,esc,innMorning);
  if(townPlace(state)?.id==='inn'){
   const price=merchantBuyPrice(state,10);
   body.insertAdjacentHTML('beforeend','<section class="inn-rations"><h3>Trail rations</h3>'+button('<span aria-hidden="true">'+itemArt({id:'food',kind:'food'})+'</span>Buy 3 meals · '+price+' gold',{type:'buy',item:'food',merchant:'inn'},'',state.gold<price||state.meals>996)+'</section>');
  }
  body.querySelector('#replay-inn')?.addEventListener('click',playInnVoice);
 }
 if(name==='talk')body.innerHTML=state.flags.royalHero?'<h3>The square falls silent</h3><p>People bow as you pass. When you stop to speak, no one will meet your eyes or answer.</p>':gossipView(state,button,esc);
 if(name==='talk'&&state.location==='bellwether'&&state.flags.princessImprisoned)body.innerHTML+='<h3>The royal chamberlain</h3><p>Princess Bunnyfoot remains imprisoned by your order. The court awaits its new king’s commands.</p>';
 if(name==='talk'&&state.location==='bellwether'&&state.flags.royalStoryVersion!==2&&['escaped','wang','trial'].includes(state.flags.royalQuest))body.innerHTML+='<p>'+esc(nextObjective(state))+'</p>';
 if(name==='talk'&&(!state.flags.royalHero||cityOf(state)))body.innerHTML+=cityView(state,button,esc);
 if(name==='journal')body.innerHTML=`<p class="eyebrow">CHAPTER ${state.chapter+1} OF 20 · ${state.relics.length}/8 RELICS</p><h3>${esc(nextObjective(state))}</h3>${CHAPTERS.slice(0,state.chapter+1).map((c,i)=>`<article class="journal-entry"><span class="eyebrow">CHAPTER ${i+1}</span><h3>${esc(c.title)}</h3>${i===0?'<figure class="journal-illustration"><img src="/assets/waxed-moths.webp" alt="A peasant girl holding out a basket of moths preserved in wax" loading="lazy"><figcaption>Waxed moths. Tuppence each. A bargain, allegedly.</figcaption></figure>':''}<p>${esc(c.text)}</p><p><em>${esc(c.objective)}</em></p></article>`).join('')}<h3 style="margin-top:30px">Letters & fragments</h3>${LORE.slice(0,Math.min(LORE.length,state.relics.length+2)).map(l=>`<details class="journal-entry"><summary>${esc(l.title)}</summary><p>${esc(l.body)}</p></details>`).join('')}`;
 if(name==='journal'&&state.flags.royalQuest)body.innerHTML=`<section class="journal-entry"><h3>The Princess and the Knave</h3><p>${esc(royalJournal(state))}</p></section>`+body.innerHTML;
 if(name==='journal')body.innerHTML=cityJournal(state,esc)+body.innerHTML;
 if(name==='journal'&&state.equippedHead==='helm-thinkiness'){
  const sage=townPlaces({location:'mothbridge'}).find(place=>place.id==='fortune');
  body.insertAdjacentHTML('afterbegin','<p>The Helm of Thinkiness is stuck. Visit the Sage of Wonk in Mothbridge ('+sage.x+', '+sage.y+') to remove it.</p>');
 }
 if(name==='inventory')body.innerHTML+=cityJournal(state,esc);
 if(name==='inn'&&cityOf(state))body.innerHTML+=cityView(state,button,esc);
 if(name==='peaceful'){
  const {name:creature,offer,amount}=state.flags.peacefulEncounter;
  const line=offer==='gold'?'“Take '+amount+' gold and let me be.”':offer==='trade'?'“A healing potion for a meal?”':'“A healing potion for '+amount+' gold?”';
  const canAccept=offer==='gold'||(offer==='trade'?state.meals>0:state.gold>=amount);
  body.innerHTML='<h3>'+esc(creature)+'</h3><p>'+esc(line)+'</p>'+(canAccept?button('Accept',{type:'peacefulAccept'},'primary'):'')+button('Walk away',{type:'peacefulLeave'});
 }
 if(name==='dungeonElevator'){
  const d=state.dungeon,available=state.mode==='dungeon'&&d&&!d.ship&&!d.royal;
  body.innerHTML=available?'<form id="travel-selection"><label>Destination <select name="destination"><option value="0">Surface</option>'+Array.from({length:dungeonFloors(d)},(_,i)=>i===d.floor?'':'<option value="'+(i+1)+'">Level '+(i+1)+'</option>').join('')+'</select></label> <button class="primary">Use scroll</button></form>':'<p>Read this scroll while exploring a regular dungeon or cave.</p>';
  if(available)body.querySelector('form').onsubmit=e=>{e.preventDefault();dispatch({type:'dungeonElevator',floor:Number(e.currentTarget.elements.destination.value)});};
 }
 if(name==='crystalTravel'){
  const lands=visitedLands(state).filter(id=>id!==(areaFor(state)?.id??state.region));
  const available=state.bag.includes('teleporter-crystal')&&lands.length;
  body.innerHTML=available?'<form><label>Visited land <select name="destination">'+lands.map(id=>'<option value="'+esc(id)+'">'+esc(typeof id==='number'?REGIONS[id]?.name:AREAS.find(a=>a.id===id)?.name)+'</option>').join('')+'</select></label> <button class="primary">Use crystal</button></form>':'<p>This booth needs a Teleporter Crystal and a previously visited destination.</p>';
  if(available)body.querySelector('form').onsubmit=e=>{e.preventDefault();const id=e.currentTarget.elements.destination.value;dispatch({type:'crystalTravel',land:id.startsWith('wild-')?id:Number(id)});};
 }
 if(name==='arena'){
  const view=arenaView(state,{button,escape:esc,result:arenaResult});
  $('panel-title').textContent=view.title;body.innerHTML=view.html;
  const dismiss=body.querySelector('[data-dismiss-arena]');
  if(dismiss)dismiss.onclick=closePanel;
 }
 if(name==='castleInteraction')renderCastleInteraction(body);
 if(name==='castleHead')renderCastleHead(body);
 if(name==='royalDungeonNpc'){
  const npc=royalDungeonAt(state);
  if(npc?.kind==='npc'){
   $('panel-title').textContent=npc.name;
   const lastLine=state.log.at(-1)||'';
   const prefix=npc.name+': ';
   const dialogue=state.flags.royalHero?'The '+npc.name+' bows silently.':lastLine.startsWith(prefix)?lastLine.slice(prefix.length):'The '+npc.name+' lets you pass.';
   const actions=(state.flags.royalHero?[]:royalDungeonActions(state)).map(({label,action})=>button(esc(label),action,action.type==='royalDungeonTalk'?'primary':'castle-assault')).join('');
   body.innerHTML='<section class="royal-dungeon-conversation"><img src="/assets/'+npc.id+'.webp" alt="'+esc(npc.name)+'"><div><p role="status">'+esc(dialogue)+'</p><div class="panel-actions">'+actions+'</div></div></section>';
  }
 }
 if(name==='atlas'){body.innerHTML=atlasView(state);paintAtlasMaps(body,state);}
 if(name==='castleMap'&&state.castle){
  const layout=castleLayout(state.location);
  const rooms=layout.rooms.map(room=>room.name).join(', ');
  body.innerHTML='<div class="castle-map-scroll" style="--castle-map-min:'+Math.round(layout.width*17)+'px" tabindex="0" aria-label="Scrollable castle map"><canvas role="img" aria-label="'+esc(rooms)+'. The Royal Dungeon stairs are in the Front Foyer."></canvas></div><ul class="castle-map-key"><li><i class="castle-map-hero"></i> You</li><li><i class="castle-map-chest"></i> Chest</li><li><i class="castle-map-book"></i> Readable book</li><li><i class="castle-map-head"></i> Talking trophy</li><li><i class="castle-map-bath"></i> Healing bathtub</li><li><i class="castle-map-stair"></i> Royal Dungeon stairs</li></ul>';
  renderCastleOverview(body.querySelector('canvas'),state);
 }
 if(name==='shop'){
  const place=townPlace(state);
  if(place?.merchant){
   $('panel-title').textContent=place.name;
   renderMerchantView(body,state,place,dispatch);
  }
 }
 if(name==='fortune')body.innerHTML=`<div class="fortune-visit"><img src="/assets/fortune-teller.webp" alt="Old Mother Mould, a toothless one-eyed fortune teller leering over her crystal ball"><div><p class="eyebrow">YOUR FUTURE IS MOSTLY MUD</p><h3>Old Mother Mould</h3><p class="fortune-speech" role="status">${esc(fortuneFor(state.name))}</p><div class="panel-actions"><button id="replay-fortune">Replay her greeting</button><button id="another-fortune">Another prediction · free</button></div><p class="fine">Her opinions are free. Her manners are missing.</p></div></div>`;
 if(name==='casino'){
  const animateWink=winkShot&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  body.innerHTML=casinoView(state,button,esc,performance.now()<dealerReactionUntil,{animateWink});
  if(winkShot){
   const game=body.querySelector('.winks-game'),nextShot=$('shoot-wink');
   const settle=()=>{
    if(!game?.isConnected)return;
    game.dataset.winkAnimating='false';
    if(nextShot){nextShot.disabled=false;if(!game.contains(document.activeElement))nextShot.focus();}
    if(winkResult&&state.casino?.resultId===winkResult.resultId){
     if(winkResult.won){
      const portrait=body.querySelector('.dealer-portrait');
      portrait?.classList.add('is-annoyed');
      clearTimeout(dealerReactionTimer);
      dealerReactionTimer=setTimeout(()=>portrait?.classList.remove('is-annoyed'),4000);
     }
     showCasinoResult(winkResult,$('panel'));
    }
   };
   if(animateWink)setTimeout(settle,680);
   else settle();
  }
  clearTimeout(rouletteTimer);if(state.casino?.spinning)rouletteTimer=setTimeout(()=>{rouletteTimer=null;if(state?.casino?.spinning&&!document.hidden)dispatch({type:'casinoRouletteReveal'});},ROULETTE_SPIN_MS);}
 if(name==='quests'){oddJobId=selectOddJob(state,oddJobId);body.innerHTML=oddJobsView(state,oddJobId,button,esc);}
 if(name==='court'){
  const court=state.flags.royalHero?'<p>The watch bows and admits you.</p>':`<p>Pay any outstanding fine, then enter to explore peacefully. Challenge the garrison to take control of the city. ${state.location==='bellwether'?' Royal guards wear heavy plate and are level 50.':''}</p><div class="panel-actions">${button('Lift a purse',{type:'steal'})}${state.castle&&state.wanted[state.region]>0?button('Pay local fine · '+(state.wanted[state.region]*25).toLocaleString()+' gold',{type:'pardon'}):''}${button('Challenge the garrison',{type:'challenge'})}</div>`;
  body.innerHTML=`<p>Reputation: ${state.reputation} · Local bounty: ${state.wanted[state.region]*25} gold</p>${court}<h3>Caravans & star gates</h3><p>Collect both relics in each preceding land to advance. You can also fly a dragon over locked gates.</p><div class="panel-actions">${REGIONS.map(r=>button(esc(r.name),{type:'travel',region:r.id})).join('')}</div>${state.relics.length>=8&&state.location===TOWNS[1].id&&state.flags.royalStoryVersion!==2?`<h3>The final audience</h3><p>Eight relics. A kingdom listening. Decide what your victories were for.</p><div class="panel-actions">${Object.keys(ENDINGS).map(k=>button(esc(k.charAt(0).toUpperCase()+k.slice(1)),{type:'ending',choice:k})).join('')}</div>`:''}<p>${esc(state.log.at(-1))}</p>`;
 }
 if(name==='court'){const town=TOWNS.find(t=>t.id===state.location);if(town){$('panel-title').textContent=town.id==='bellwether'?'The Royal Palace':`${town.name} · Governor’s Palace`;body.innerHTML=`<figure class="palace-entrance"><img src="/assets/palace-${town.id}.webp" alt="${esc(town.name)} palace gate and five heavily armored guards"><figcaption>${town.id==='bellwether'?'Taking control of Bellwether requires 20 victories':'Taking control of the city requires five consecutive victories'}</figcaption></figure>`+body.innerHTML;}}
 if(name==='court'){
  const faction=state.flags['townFaction:'+state.location];
  const rescueGalen=state.flags.royalStoryVersion!==2&&hasRoyalAdmission(state,state.location)&&!state.flags.galenFreed?button('Return to Galen’s cell',{type:'royalSewerReturn'}):'';
  body.insertAdjacentHTML('afterbegin',royalAudienceControls()+rescueGalen+(faction!==undefined?'<p>Town faction '+faction+'</p>':''));
 }
 if(name==='ending')body.innerHTML=`<div class="ending">${esc(newRoyalEnding()?ROYAL_CAMPAIGN_ENDINGS[state.ending]:ROYAL_ENDINGS[state.ending]||ENDINGS[state.ending])}</div><p>${state.quests.length} local stories resolved. ${state.flags.victories} battles won.</p><div class="panel-actions">${endingExit()}</div>`;
 if(name==='royalEpilogue'){
  body.innerHTML='<div class="ending">'+esc(ROYAL_CAMPAIGN_ENDINGS.hero)+'</div><div class="panel-actions"><button class="primary" id="continue-royal-hero">Continue roaming</button></div>';
  $('continue-royal-hero').onclick=closePanel;
 }
 if(name==='new')body.innerHTML='<p>A new journey replaces only the selected adventurer and that slot’s checkpoint. The other two adventurers are kept. Choose an empty slot on the title screen to keep this adventure too.</p><div class="panel-actions"><button id="confirm-new" class="primary">Replace save & begin</button><button id="cancel-new">Keep my current journey</button></div>';
 if(name==='artifactReveal'){const disk=itemById('alien-disk',state);body.innerHTML=`<div class="royal-cinematic artifact-reveal">${itemArt(disk)}<h3>${disk.pieces===10?'The disk is complete!':'Another piece clicks into place.'}</h3><p class="gear-stats">${disk.pieces} / 10 pieces</p><p>${esc(disk.description)}</p><button id="continue-artifact" class="primary">${disk.pieces===10?'Aboard the spacecraft':'Keep exploring'}</button></div>`;}
 if(name==='boatReveal'){
  const sailboat=state.flags.boatReveal==='sailboat';
  const boat=itemById(sailboat?'shrinkable-sailboat':'boat-amulet',state);
  body.innerHTML='<div class="royal-cinematic">'+itemArt(boat)+'<h3>'+(sailboat?'Bawb’s sailboat unfolds!':'Your amulet becomes a full-size rowboat!')+'</h3><p>Use your normal movement controls to cross water. You disembark automatically on land.</p><button id="continue-boat" class="primary">Take to the water</button></div>';
 }
 if(name==='rescue')body.innerHTML=`<div class="royal-cinematic"><img class="royal-court-scene" src="/assets/pilgrim-rescue.webp" alt="A weary pilgrim drags the unconscious adventurer past laughing guards at the town gate."><h3>Alive. Unfortunately, so are the witnesses.</h3><p>${esc(state.flags.rescueMessage||'A pilgrim drags you to safety while the guards laugh.')}</p><button id="continue-rescue" class="primary">Back on your feet</button></div>`;
 if(name==='loot'){const item=itemById(state.pendingLoot[0],state);if(!item){closePanel();return;}body.innerHTML=`<div class="loot-card">${itemArt(item)}<div><p class="eyebrow rarity-${item.rarity||'common'}">${esc((item.rarity||item.kind).toUpperCase())}</p><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p>${item.kind==='weapon'?`<p>${item.toHit>=0?'+':''}${item.toHit} to hit · ${item.damage.join('–')} base damage</p>`:''}<div class="panel-actions">${gearKey(item.kind)?button('Equip '+esc(item.name),{type:'equip',id:item.id},'primary'):''}<button id="keep-loot">Keep in bag</button></div><p class="fine">Stored in your unlimited bag of holding. Press I to inspect or use it.</p></div></div>`;}
 if(name==='settings')body.innerHTML=`${state?`<h3>Your adventurer</h3><label class="setting" for="rename-hero">Name <input id="rename-hero" maxlength="24" value="${esc(state.name)}"></label><button id="save-hero-name">Save name</button>`:''}<p>Original music and sound effects inspired by early computer RPGs. Tap Enable sound to begin playback.</p><p class="fine">Current music: ${esc(audio.scene)}</p><button id="enable-audio">Enable sound ♫</button><label class="setting">Music <input id="music-volume" type="range" min="0" max="1" step=".05" value="${volumes.music}"></label><label class="setting">Effects <input id="effects-volume" type="range" min="0" max="1" step=".05" value="${volumes.effects}"></label><h3>Your adventure, safely kept</h3><p>A checkpoint preserves your exact game state until you save another one. Continue uses autosave; Load checkpoint returns to your chosen point.</p><div class="panel-actions"><button data-save-checkpoint ${!state&&!hasSave()?'disabled':''}>Save checkpoint</button><button data-load-checkpoint ${!hasCheckpoint()?'disabled':''}>Load checkpoint</button></div><p>Progress autosaves on this device. Export a copy before clearing app data, uninstalling, or moving devices.</p><div class="panel-actions"><button id="export-save" ${!state&&!hasSave()?'disabled':''}>Export save</button><button id="import-save">Import save</button><input id="import-file" type="file" accept=".json" hidden></div><h3>Play on your Android tablet</h3><p>${window.Android?'This standalone app includes all game files and runs offline. Updates require installing a newer APK.':'Open the game’s HTTPS address in Chrome, then choose <strong>Add to Home screen → Install</strong>. Once the game files have downloaded, it can run offline. A desktop localhost address is not accessible on your tablet.'}</p><button id="install-game" ${!installPrompt?'hidden':''}>Install Bar the Gates</button><p id="offline-status" class="fine">${window.Android?'All game assets are bundled locally.':navigator.serviceWorker?.controller?'Offline game shell active.':'Offline support activates after the first successful download.'}</p><p class="fine">Desktop: arrow keys / WASD to move, E to enter, Space to strike, I for inventory. In dungeons, left/right step sideways, Q/E turn, and Enter descends. Tap controls require no keyboard.</p>`;
 if(!$('panel').open)$('panel').showModal();sceneMusic();
 if(name==='borderTaunt'){playBorderVoice();$('replay-border').onclick=playBorderVoice;$('leave-border').onclick=closePanel;}
 if(name==='fortune'&&state.location==='mothbridge'){
  $('panel-title').textContent='Sage of Wonk';
  body.insertAdjacentHTML('afterbegin',sageOfWonkView());
 }
 if(name==='fortune'){playFortuneVoice();$('replay-fortune').onclick=playFortuneVoice;$('another-fortune').onclick=()=>{$('panel-body').querySelector('.fortune-speech').textContent=fortuneFor(state.name);};}
 if(name==='artifactReveal')$('continue-artifact').onclick=closePanel;
 if(name==='boatReveal')$('continue-boat').onclick=closePanel;
 if(name==='rescue'){
 audio.unlock().then(()=>audio.effect('rescue'));
 const panel=$('panel');panel.classList.remove('rescue-fading');const beginFade=()=>{if(activePanel!=='rescue')return;panel.classList.add('rescue-fading');setTimeout(()=>{if(activePanel==='rescue'){closePanel();panel.classList.remove('rescue-fading');}},2200);};$('continue-rescue').onclick=beginFade;setTimeout(()=>{if(activePanel==='rescue'&&!panel.classList.contains('rescue-fading'))beginFade();},4000);
 }
 if(name==='guardTaunt'){playGuardVoice(0);$('replay-guards').onclick=()=>playGuardVoice(0);$('leave-guards').onclick=closePanel;}
 if(name==='royalIntro'){playIntroVoice();if($('replay-dialogue'))$('replay-dialogue').onclick=playIntroVoice;}
 if(name==='settings'){body.insertAdjacentHTML('beforeend',`<section class="save-recovery"><h3>Saved points for this adventurer</h3><p><strong>Current autosave</strong><br>${checkpointSummary(SAVE)}</p><p><strong>Manual checkpoint</strong><br>${checkpointSummary(CHECKPOINT)}</p><p><strong>Automatic royal dungeon checkpoint</strong><br>${checkpointSummary(CHECKPOINT+'-royal')}</p><button id="load-royal-checkpoint" ${hasCheckpoint(CHECKPOINT+'-royal')?'':'disabled'}>Restore royal dungeon checkpoint</button><p><strong>Before your last restore</strong><br>${checkpointSummary(SAVE+'-before-restore')}</p><button id="undo-checkpoint-load" ${hasCheckpoint(SAVE+'-before-restore')?'':'disabled'}>Recover progress before last restore</button></section>`);$('load-royal-checkpoint').onclick=()=>loadCheckpoint(CHECKPOINT+'-royal');$('undo-checkpoint-load').onclick=()=>loadCheckpoint(SAVE+'-before-restore');}
 $('keep-loot')?.addEventListener('click',closePanel);
 $('save-hero-name')?.addEventListener('click',()=>{dispatch({type:'rename',name:$('rename-hero').value});$('rename-hero').value=state.name;toast('Adventurer name saved.');});
 $('confirm-new')?.addEventListener('click',()=>{closePanel();beginNewAdventurer();});$('cancel-new')?.addEventListener('click',closePanel);
 $('enable-audio')?.addEventListener('click',async()=>{const ok=await audio.unlock();sceneMusic();toast(ok?'Sound enabled':'Audio is unavailable in this browser.');});
 for(const [id,key] of [['music-volume','music'],['effects-volume','effects']])$(id)?.addEventListener('input',e=>{volumes[key]=Number(e.target.value);audio.setVolumes(volumes.music,volumes.effects);try{localStorage.setItem(SETTINGS,JSON.stringify(volumes));}catch{}});
 $('export-save')?.addEventListener('click',()=>{let text=state?saveGame(state):localStorage.getItem(SAVE);if(window.Android?.exportSave){window.Android.exportSave(text);return;}const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='crownstealer-slot-'+activeSlot+'-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 $('import-save')?.addEventListener('click',()=>$('import-file').click());$('import-file')?.addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(file.size>500000){toast('Save file is too large.');return;}try{const loaded=loadGame(await file.text());if(hasSave()&&!confirm('Replace the selected adventurer with this imported adventure? Other slots will be kept.'))return;closePanel();localStorage.setItem(SAVE,saveGame(loaded));localStorage.removeItem(CHECKPOINT);localStorage.removeItem(CHECKPOINT+'-royal');localStorage.removeItem(SAVE+'-before-restore');start(loaded);persist();refreshSlotPicker();toast('Adventure restored to slot '+activeSlot+'.');}catch(err){toast('Import rejected: '+err.message);}});
 $('install-game')?.addEventListener('click',async()=>{await installPrompt.prompt();installPrompt=null;});
}
function closePanel(){if(activePanel==='halChallenge'&&isHal(state)){toast('Finish Hal’s challenge to leave this chamber.');return;}if(activePanel==='halOutcome'&&state?.flags.halOutcome){state=act(state,{type:'halAcknowledge'});persist();}clearTimeout(halSequenceTimer);stopIntroVoice();if(activePanel==='artifactReveal'&&state){state=act(state,{type:'acknowledgeArtifact'});persist();}if(activePanel==='boatReveal'&&state){state=act(state,{type:'acknowledgeBoat'});persist();}if(activePanel==='rescue'&&state){state=act(state,{type:'acknowledgeRescue'});persist();}if(activePanel==='gagReveal'&&state){state=act(state,{type:'acknowledgeGag'});persist();}if(['travelMerchant','squeakyVoice'].includes(activePanel)&&state){if(state.flags.travelMerchant)state=act(state,{type:'leaveTravelMerchant'});if(state.flags.borderTauntPending)state=act(state,{type:'acknowledgeBorder'});if(state.flags.guardTauntPending)state=act(state,{type:'acknowledgeGuards'});persist();}innMorning=false;clearTimeout(gossipGuardTimer);if(activePanel==='gossipGuard'&&state.mode==='town'&&state.flags.gossipGuardTown){state=act(state,{type:'gossipGuardLeave'});persist();}if(activePanel==='borderTaunt'&&state){state=act(state,{type:'acknowledgeBorder'});persist();}if(activePanel==='guardTaunt'&&state){state=act(state,{type:'acknowledgeGuards'});persist();}if(activePanel==='royalIntro'&&state.flags.royalQuest==='opening'){dispatch({type:'royalIntroSkip'});return;}if(activePanel==='peaceful'&&state.flags.peacefulEncounter){state=act(state,{type:'peacefulLeave'});persist();}if(activePanel==='wildernessEvent'&&state.flags.wildernessEvent){state=act(state,{type:'wildernessChoice',choice:'leave'});persist();}const loot=activePanel==='loot',head=activePanel==='castleHead',released=activePanel==='arena'&&!state?.arena;
 if(released)arenaResult=null;$('panel').close();activePanel=null;if(loot&&state){state=act(state,{type:'acknowledgeLoot'});persist();}sceneMusic();showLadderPrompt();if(loot||head||released||state?.pendingLoot?.length)queueMicrotask(showLoot);else{showCastleHead();showCastleTileInteraction();}}
let introducedBoss;
function showLoot(){
 if(state?.mode==='world'&&state.flags.wildernessEvent&&!activePanel&&!document.hidden&&!$('game').hidden){openPanel('wildernessEvent');return;}
 if(state?.mode!=='battle')introducedBoss=null;
 if(state?.mode==='battle'&&state.enemy?.boss&&state.enemy.firstContact&&state.enemy.speciesId!=='space-hal'&&!introducedBoss&&!activePanel&&!document.hidden){
  introducedBoss=state.enemy.name;
  openPanel('bossIntro');
  return;
 }
 if(state?.flags.halOutcome&&!activePanel&&!document.hidden){openPanel('halOutcome');return;}if(state&&isHal(state)&&!activePanel&&!document.hidden){openPanel('halChallenge');return;}if(state?.flags.dragonWatch?.enemy&&!combatView&&!activePanel&&!document.hidden){openPanel('dragonDefense');return;}if(state?.flags.dragonNotice&&!combatView&&!activePanel&&!document.hidden){openPanel('dragonNotice');return;}if(state?.flags.artifactReveal&&!combatView&&!activePanel&&!document.hidden&&!$('game').hidden){openPanel('artifactReveal');audio.effect('magic');return;}if(state?.flags.rescuePending&&!combatView&&!activePanel&&!document.hidden&&!$('game').hidden){openPanel('rescue');return;}if(state?.flags.gagReveal&&!combatView&&!activePanel&&!document.hidden&&!$('game').hidden){openPanel('gagReveal');return;}if(state?.mode==='town'&&(state.arena||arenaResult?.released)&&!activePanel&&!combatView&&!document.hidden&&!$('game').hidden){openPanel('arena');return;}if(state?.pendingLoot?.length&&state.mode!=='battle'&&state.mode!=='ending'&&!combatView&&!activePanel&&$('gold-loot').hidden&&!document.hidden&&!$('game').hidden){openPanel('loot');audio.effect('coin');}
 showCastleHead();
 showCastleTileInteraction();
}
$('close-panel').onclick=closePanel;$('panel').addEventListener('cancel',e=>{e.preventDefault();closePanel();});
$('panel').addEventListener('click',e=>{if(activePanel==='quests'&&e.target.closest('[data-next-odd-job]')){oddJobId=nextOddJob(state,oddJobId);openPanel('quests');$('panel').querySelector('[data-next-odd-job]')?.focus();return;}if(e.target.closest('[data-ask-webster]')&&state.bag.includes('webster')){openPanel('webster');return;}if(e.target.closest('[data-close-item]')){inventorySelection=null;openPanel('inventory');return;}const page=e.target.closest('[data-bag-page]');if(page){changeBagPage(Number(page.dataset.bagPage));openPanel('inventory');return;}const choice=e.target.closest('[data-inspect]');if(choice){inventorySelection={id:choice.dataset.inspect,source:choice.dataset.source,slot:choice.dataset.gearSlot};openPanel('inventory');return;}const b=e.target.closest('[data-bet]');if(b){const game=b.dataset.bet,wager=$('wager');if(!wager.reportValidity())return;dispatch({type:'gamble',game,bet:Number(wager.value),choice:$('roulette-choice')?.value});if(game==='blackjack')playBlackjackTaunt();else{stopIntroVoice();if(game==='roulette'&&state.casino?.spinning)audio.unlock().then(()=>audio.effect('roulette'));}}if(e.target.closest('#shoot-wink'))dispatch({type:'casinoShoot',power:Number($('wink-power').value)});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){flushClock(true,true);stopIntroVoice();finishCombat();audio.suspend();if(state)persist();cancelAnimationFrame(frame);}else{clockLast=performance.now();audio.resume();if(activePanel==='casino'&&state?.casino?.spinning)openPanel('casino');if(activePanel==='royalIntro'&&state?.flags.royalEntranceSeen===false)playIntroVoice();if(state&&!$('game').hidden){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);showLoot();}}});
window.addEventListener('pagehide',()=>{flushClock(true,true);if(state)persist();});
window.addEventListener('beforeunload',()=>{if(state)persist();});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
if('serviceWorker'in navigator&&!window.Android)navigator.serviceWorker.register('/sw.js').catch(()=>{});

window.addEventListener('androidpause',()=>{flushClock(true,true);stopIntroVoice();finishCombat();audio.suspend();if(state)persist();cancelAnimationFrame(frame);});
window.addEventListener('androidresume',()=>{clockLast=performance.now();audio.resume();if(activePanel==='casino'&&state?.casino?.spinning)openPanel('casino');if(activePanel==='royalIntro'&&state?.flags.royalEntranceSeen===false)playIntroVoice();if(state&&!$('game').hidden){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);showLoot();}});
window.CrownStealerAndroidBack=()=>{if($('panel').open){closePanel();return true;}return false;};

// Save the resolved turn immediately; presentation never changes game state.
let combatView=null,combatFx=null,combatTimers=[],combatToken=0,goldLootTimer;
function finishCombat(refresh=true){
 clearTimeout(goldLootTimer);$('gold-loot').hidden=true;
 combatToken++;combatTimers.forEach(clearTimeout);combatTimers=[];combatView=null;combatFx=null;
 document.querySelector('.portrait').classList.remove('combat-hurt','combat-heal','combat-block');
 $('actions').removeAttribute('aria-busy');
 if(state&&refresh){update();sceneMusic();}
}
function playCastleGuardApproach(approach){
 if(!state.castle||!approach.path.length)return;
 finishCombat(false);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=reduced?190:Math.min(1500,Math.max(680,(approach.path.length-1)*150));
 combatView={...structuredClone(state),mode:'town',enemy:null};
 combatFx={...approach,start:performance.now(),duration};
 $('combat-panel').hidden=true;
 $('travel-controls').hidden=false;
 $('actions').setAttribute('aria-busy','true');
 $('actions').querySelectorAll('button').forEach(button=>button.disabled=true);
 $('mode-badge').textContent='PALACE ALARM · GUARD APPROACHING';
 $('scene-caption').textContent='A palace guard rushes toward you.';
 combatTimers.push(setTimeout(()=>finishCombat(),duration));
}

function playCombat(before,events,approach){
 finishCombat(false);combatView=structuredClone(before);combatView.enemy.firstContact=false;const token=combatToken;updateWildernessHealth();
 $('actions').setAttribute('aria-busy','true');$('actions').querySelectorAll('button').forEach(b=>b.disabled=true);
 const ready=audio.unlock();
 function present(event){
  combatFx={...event,start:performance.now()};if(event.spell)showSpellVisual(event.spell);if(event.kind==='victory')showVictory();if(event.kind==='explosion')showAlienExplosion(event.message);
  if(event.target==='enemy'&&event.amount)combatView.enemy.hp=Math.max(0,combatView.enemy.hp-event.amount);
  if(event.target==='hero'&&event.amount){combatView.hp=event.hpAfter??Math.max(0,Math.min(combatView.maxHp,combatView.hp+(event.kind==='heal'?event.amount:-event.amount)));$('health-label').textContent=`${combatView.hp} / ${combatView.maxHp}`;$('health-bar').style.width=combatView.hp/combatView.maxHp*100+'%';}
  const portrait=document.querySelector('.portrait');portrait.classList.remove('combat-hurt','combat-heal','combat-block');
  if(event.target==='hero'){void portrait.offsetWidth;portrait.classList.add(event.kind==='heal'?'combat-heal':event.kind==='block'?'combat-block':'combat-hurt');}
  $('scene-caption').textContent=event.message||(event.kind==='victory'?(before.returnMode==='dungeon'?'Victory — the hallway is clear.':'Victory — the road is open.'):event.kind==='retreat'?'You escape the battle.':event.kind==='defeat'?'Defeated - a pilgrim carries you to safety.':event.kind==='miss'?'Your strike misses.':event.kind==='heal'?`Potion restores ${event.amount} health.`:`${event.target==='enemy'?'Your '+(event.kind==='magic'?'spell':'strike'):'Enemy '+(event.kind==='block'?'strike, guarded':'strike')}: ${event.amount} damage`);
  updateCombatPanel(combatView,$('scene-caption').textContent);
  return ready.then(()=>{
   if(token!==combatToken||document.hidden)return;
   if(event.sound)audio.effect(event.sound);
   if(event.voice)return audio.playRoyalDungeonVoice(event.voice);
  });
 }
 function schedule(index,delay){
  if(token!==combatToken)return;
  combatTimers.push(setTimeout(()=>{
   if(token!==combatToken)return;
   const event=events[index];
   if(!event){
    finishCombat();
    if(approach&&state.castle&&state.mode==='battle'){playCastleGuardApproach(approach);return;}
    if(events.some(e=>e.kind==='victory')&&before.enemy.gold>0)showGoldLoot(before.enemy.gold,state.gold);else showLoot();
    return;
   }
   const started=performance.now(),spoken=present(event);
   const pause=index===events.length-1?(before.returnMode==='dungeon'&&events.some(e=>e.kind==='victory')?1350:930):750;
   if(event.voice)spoken.then(()=>schedule(index+1,Math.max(0,pause-(performance.now()-started))));
   else schedule(index+1,pause);
  },delay));
 }
 schedule(0,0);
}

function showAlienExplosion(message){const overlay=document.createElement('div');overlay.className='alien-explosion';overlay.setAttribute('role','alert');const text=document.createElement('strong');text.textContent=message;overlay.append(text);document.body.append(overlay);setTimeout(()=>overlay.remove(),2500);}
function showVictory(){document.querySelector('.victory-announcement')?.remove();const banner=document.createElement('div');banner.className='victory-announcement';banner.setAttribute('role','status');banner.textContent='VICTORY!';document.body.append(banner);setTimeout(()=>banner.remove(),2500);}

function showGoldLoot(amount,total){
 audio.unlock().then(()=>audio.effect('goldFound'));const popup=$('gold-loot');popup.innerHTML=`<svg viewBox="0 0 160 110" aria-hidden="true"><g fill="#c99535" stroke="#ffe3a0" stroke-width="2"><path d="M22 64v18c0 18 64 18 64 0V64Z"/><ellipse cx="54" cy="64" rx="32" ry="12"/><path d="M77 45v37c0 18 62 18 62 0V45Z"/><ellipse cx="108" cy="45" rx="31" ry="12"/><circle cx="73" cy="34" r="25" fill="#e3b75e"/><circle cx="73" cy="34" r="19" fill="none"/><path d="M62 34l11-12 11 12-11 12Z" fill="#fff0b7"/><path d="M23 72q32 20 62 0M78 57q30 18 60 0M78 69q30 18 60 0" fill="none"/></g></svg><strong>+${amount} gold</strong><small>Total gold: ${total}</small>`;
 popup.hidden=false;popup.classList.remove('gold-loot-show');void popup.offsetWidth;popup.classList.add('gold-loot-show');
 goldLootTimer=setTimeout(()=>{popup.hidden=true;showLoot();},2100);
}

let introVoice=null,royalDoorTimers=[];
function playGuardVoice(index){if(state?.flags.pennilessTown){playPennilessVoice();return;}stopIntroVoice();if(activePanel!=='guardTaunt')return;const lines=["“Get lost, SCUM! You've got about as much chance with the Princess as my donkey!”","“HEE HAW! HEE HAW!” Both guards laugh uproariously."];$('guard-dialogue').textContent=lines[index];const clip=new Audio('/assets/guard-'+index+'.mp3');introVoice=clip;boostGateVoice(clip,audio,volumes.effects);audio.setVolumes(volumes.music*.25,volumes.effects);clip.onended=()=>{if(introVoice!==clip||activePanel!=='guardTaunt')return;if(index===0)playGuardVoice(1);else audio.setVolumes(volumes.music,volumes.effects);};clip.onerror=()=>audio.setVolumes(volumes.music,volumes.effects);playNpcClip(clip).catch(()=>audio.setVolumes(volumes.music,volumes.effects));}

function hasCheckpoint(key=CHECKPOINT){try{return !!localStorage.getItem(key);}catch{return false;}}
function saveCheckpoint(){try{const source=state||loadGame(localStorage.getItem(SAVE));localStorage.setItem(CHECKPOINT,saveGame(source));$('load-checkpoint-title').hidden=false;toast('Checkpoint saved. Autosave will not overwrite it.');}catch(e){toast('Could not save checkpoint: '+e.message);}}
function loadCheckpoint(key=CHECKPOINT){try{const restored=loadGame(localStorage.getItem(key)),current=state?saveGame(state):localStorage.getItem(SAVE);if(current){loadGame(current);localStorage.setItem(SAVE+'-before-restore',current);}stopIntroVoice();$('panel').close();activePanel=null;cancelArrowTap();localStorage.setItem(SAVE,saveGame(restored));start(restored);persist();toast('Saved checkpoint restored. Previous progress is kept in Settings.');}catch(e){toast('Could not load checkpoint: '+e.message);}}
function checkpointSummary(key){try{const saved=loadGame(localStorage.getItem(key));return esc(`${saved.name} · ${saved.dungeon?dungeonName(saved.dungeon):saved.mode==='town'?TOWNS.find(t=>t.id===saved.location)?.name:REGIONS[saved.region].name} · Level ${saved.level} · ${saved.gold} gold · ${new Date(saved.savedAt).toLocaleString()}`);}catch{return 'No saved point.';}}

$('load-checkpoint-title').hidden=!hasCheckpoint();$('load-checkpoint-title').onclick=()=>loadCheckpoint();
document.addEventListener('click',e=>{if(e.target.closest('[data-save-checkpoint]'))saveCheckpoint();if(e.target.closest('[data-load-checkpoint]'))loadCheckpoint();});
function stopIntroVoice(){royalDoorTimers.forEach(clearTimeout);royalDoorTimers=[];if(introVoice){introVoice.pause();introVoice=null;}audio.setVolumes(volumes.music,volumes.effects);}
function playRoyalDoorway(){
 const opening=()=>state?.flags.royalQuest==='opening'&&state.flags.royalIntroLine===0&&state.flags.royalEntranceSeen===false;audio.setScene('title');audio.unlock().then(()=>{if(!opening()||activePanel!=='royalIntro'||document.hidden)return;if(audio.titlePlayer){audio.titlePlayer.currentTime=0;audio.titlePlayer.play().catch(()=>{});}const clip=new Audio('/assets/royal-door-laugh.mp3');introVoice=clip;clip.volume=volumes.effects;playNpcClip(clip).catch(()=>{});});
 royalDoorTimers.push(setTimeout(()=>{if(opening()&&activePanel==='royalIntro')$('royal-door-still')?.classList.add('crossfade-out');},4200));
 royalDoorTimers.push(setTimeout(()=>{if(opening()&&activePanel==='royalIntro'&&!document.hidden)dispatch({type:'royalEntranceEnd'});},5600));
}
function playIntroVoice(){stopIntroVoice();if(state?.flags.royalQuest!=='opening')return;if(state.flags.royalIntroLine===0&&state.flags.royalEntranceSeen===false){playRoyalDoorway();return;}if(!recordedRoyalIntro(state.flags.royalIntroLine))return;introVoice=new Audio('/assets/intro-'+state.flags.royalIntroLine+'.mp3');introVoice.volume=volumes.effects;audio.setVolumes(volumes.music*.25,volumes.effects);introVoice.onended=()=>audio.setVolumes(volumes.music,volumes.effects);introVoice.onerror=()=>audio.setVolumes(volumes.music,volumes.effects);playNpcClip(introVoice).catch(()=>audio.setVolumes(volumes.music,volumes.effects));}

function refreshSlotPicker(){selectedGender=null;$('chosen-face').hidden=true;$('chosen-face').innerHTML='';document.querySelectorAll('[name="adventurer-gender"]').forEach(input=>input.checked=false);if(developerMode){$('adventurer-slot').innerHTML='<option>Separate developer character</option>';$('adventurer-slot').disabled=true;$('slot-status').textContent='Developer preview · your three adventurers are untouched';return;}let summaries;try{summaries=SLOT_IDS.map(id=>slotSummary(localStorage,id));}catch{summaries=[null,null,null];}$('adventurer-slot').innerHTML=SLOT_IDS.map((id,i)=>`<option value="${id}">${id}. ${summaries[i]?esc(summaries[i].name)+' · Level '+summaries[i].level:'Empty adventurer slot'}</option>`).join('');$('adventurer-slot').value=String(activeSlot);$('continue-game').hidden=!hasSave();$('load-checkpoint-title').hidden=!hasCheckpoint();$('slot-status').textContent='Slot '+activeSlot+' of 3 · Separate autosave and checkpoint';}
function beginNewAdventurer(){const fresh=developerMode?{...previewCharacter(),gender:selectedGender}:createRoyalGame($('hero-name').value,selectedGender);try{localStorage.setItem(SAVE,saveGame(fresh));localStorage.removeItem(CHECKPOINT);localStorage.removeItem(CHECKPOINT+'-royal');localStorage.removeItem(SAVE+'-before-restore');}catch{toast('Cannot create an adventurer: device storage is unavailable or full.');return;}start(fresh);refreshSlotPicker();}
$('adventurer-slot').onchange=e=>{if(developerMode)return;const next=Number(e.target.value);if(next===activeSlot||!SLOT_IDS.includes(next))return;if(state)persist();stopIntroVoice();finishCombat();cancelArrowTap();cancelAnimationFrame(frame);$('panel').close();activePanel=null;state=null;activeSlot=next;({save:SAVE,checkpoint:CHECKPOINT}=slotKeys(activeSlot));try{localStorage.setItem('crownstealer-active-slot',String(activeSlot));}catch{}$('hero-name').value='';refreshSlotPicker();audio.setScene('title');};
refreshSlotPicker();

function updateCombatPanel(s,message){const active=s?.mode==='battle'&&s.enemy&&s.enemy.speciesId!=='space-hal';$('combat-panel').hidden=!active;$('travel-controls').hidden=!!active;if(!active){if($('actions').parentElement!==$('travel-controls'))$('travel-controls').append($('actions'));return;}if($('actions').parentElement!==$('combat-buttons'))$('combat-buttons').append($('actions'));const enemyLabel=s.enemy.memberHp?Math.max(1,Math.ceil(s.enemy.hp/s.enemy.memberHp))+' × '+s.enemy.name:s.enemy.name;$('combat-heading').textContent=enemyLabel;$('combat-health').innerHTML=[{name:s.name,hp:s.hp,max:s.maxHp,enemy:false},{name:enemyLabel,hp:s.enemy.hp,max:s.enemy.maxHp,enemy:true}].map(p=>`<div><span>${esc(p.name)}</span><strong>${Math.max(0,p.hp)} / ${p.max} HP</strong><div class="meter"><i style="width:${Math.max(0,Math.min(100,p.hp/p.max*100))}%;background:${p.enemy?'#c47b62':'#adc184'}"></i></div></div>`).join('');$('combat-buttons').querySelectorAll('button').forEach(b=>{if(b.querySelector('.combat-action-icon'))return;const text=b.textContent;const icon=document.createElement('span');icon.className='combat-action-icon';icon.setAttribute('aria-hidden','true');icon.textContent=/Strike/.test(text)?'⚔':/Guard/.test(text)?'⛨':/MAGIC/.test(text)?'☷':/potion/i.test(text)?'⚗':/meal/.test(text)?'♣':'➜';const label=document.createElement('span');label.textContent=text.replace(/^\s*⚔\s*/,'');b.replaceChildren(icon,label);if(text==='USE MAGIC'){const sub=document.createElement('small');sub.textContent=itemById(s.equippedMagic,s)?.name||'No item equipped';b.append(sub);b.disabled=!s.equippedMagic||!s.bag.includes(s.equippedMagic);}});$('combat-status').textContent=message||(s.spellEffects?.stunnedTurns?'STUNNED · '+s.spellEffects.stunnedTurns+' rounds remain. Choose an action to struggle through the round.':s.enemy.firstContact?(s.enemy.surprised?'You surprised this creature. Evade safely or strike with advantage.':s.enemy.level>effectiveLevel(s)+4?'Danger: this enemy is more than four levels above you.':'Choose your opening move.'):'Choose your next move.');}

function playFortuneVoice(){stopIntroVoice();if(activePanel!=='fortune')return;const clip=new Audio('/assets/fortune-teller-voice.mp3');introVoice=clip;clip.volume=volumes.effects;audio.setVolumes(volumes.music*.25,volumes.effects);const restore=()=>{if(introVoice===clip)audio.setVolumes(volumes.music,volumes.effects);};clip.onended=restore;clip.onerror=restore;playNpcClip(clip).catch(restore);}

function playBorderVoice(){stopIntroVoice();if(activePanel!=='borderTaunt')return;const index=Number.isInteger(state.flags.borderVoice)?Math.abs(state.flags.borderVoice)%3:0,clip=new Audio('/assets/border-'+index+'.mp3');introVoice=clip;boostGateVoice(clip,audio,volumes.effects);audio.setVolumes(volumes.music*.25,volumes.effects);const restore=()=>{if(introVoice===clip)audio.setVolumes(volumes.music,volumes.effects);};clip.onended=restore;clip.onerror=restore;playNpcClip(clip).catch(restore);}

function playPennilessVoice(){stopIntroVoice();if(activePanel!=='guardTaunt')return;const index=Number.isInteger(state.flags.pennilessVoice)?Math.abs(state.flags.pennilessVoice)%3:0,clip=new Audio('/assets/penniless-'+index+'.mp3');introVoice=clip;$('guard-dialogue').textContent='No gold? No entry.';boostGateVoice(clip,audio,volumes.effects);audio.setVolumes(volumes.music*.25,volumes.effects);const restore=()=>{if(introVoice===clip)audio.setVolumes(volumes.music,volumes.effects);};clip.onended=restore;clip.onerror=restore;playNpcClip(clip).catch(restore);}

function playBlackjackTaunt(){
 stopIntroVoice();if(activePanel!=='casino'||document.hidden)return;
 const clip=new Audio('/assets/dealer-retry-'+dealerVoice(state.location)+'.mp3');introVoice=clip;clip.volume=volumes.effects;
 audio.setVolumes(volumes.music*.25,volumes.effects);
 const restore=()=>{if(introVoice===clip){introVoice=null;audio.setVolumes(volumes.music,volumes.effects);}};
 clip.onended=restore;clip.onerror=restore;playNpcClip(clip).catch(restore);
}

// The preview uses dedicated storage keys for every save/checkpoint operation.
const previewLink=document.createElement('a');previewLink.href=developerMode?'/':'/?developer=1';previewLink.textContent=developerMode?'Return to normal game':'Developer preview';previewLink.className='text-button';if(!window.Android)$('title-screen').querySelector('.start-form').append(previewLink);
if(developerMode){
 const control=document.createElement('button');control.textContent='Developer preview';control.dataset.panel='developer';document.querySelector('.game-header nav').prepend(control);
 document.title='Developer preview · Bar the Gates';
 document.addEventListener('change',e=>{if(e.target.id==='preview-destination'){const d=previewDestinations.find(d=>d.id===e.target.value);$('preview-floor').max=d.floors||1;$('preview-floor').value=1;}});
 document.addEventListener('click',e=>{const action=e.target.closest('[data-preview]')?.dataset.preview;if(!action)return;
 try{
 if(action==='rules'){previewRules={invulnerable:$('preview-invulnerable').checked,noRandom:$('preview-no-random').checked};try{localStorage.setItem('crownstealer-developer-rules-v1',JSON.stringify(previewRules));}catch{}toast('Preview rules updated');return;}
 let next=structuredClone(state);
 if(action==='destination')next=previewJump(next,e.target.closest('[data-preview]').dataset.destination);
 if(action==='jump')next=previewJump(next,$('preview-destination').value,Number($('preview-floor').value));
 if(action==='encounter')next=previewEncounter(next,$('preview-monster').value);
 if(action==='stats'){next.level=Math.max(1,Math.min(100,Math.floor(Number($('preview-level').value)||1)));next.gold=Math.max(0,Math.min(1000000,Math.floor(Number($('preview-gold').value)||0)));next.maxHp=80+(next.level-1)*14;delete next.levelDrain;delete next.attributeHealthAdjustment;next.attributePointsSpent=Math.min(next.attributePointsSpent??0,2*(next.level-1));syncAttributeHealth(next,itemById);next.hp=next.maxHp;next.xp=0;}
 if(action==='item'){next.bag.push($('preview-item').value);}
 if(action==='unlock')next.relics=DUNGEONS.map(d=>d.id);
 if(action==='reset')next=previewCharacter();
 next=loadGame(saveGame(next));stopIntroVoice();cancelArrowTap();$('panel').close();activePanel=null;start(next);persist();
 if(['stats','item','unlock','reset'].includes(action))openPanel('developer');
 }catch(error){toast('Preview: '+error.message);}
 });
 try{start(hasSave()?loadGame(localStorage.getItem(SAVE)):previewCharacter());}catch{start(previewCharacter());}
 openPanel('developer');
}

function playInnVoice(){
 stopIntroVoice();if(activePanel!=='inn'||!innMorning||document.hidden)return;
 const clip=new Audio(innkeeperFor(state.location).audio);introVoice=clip;clip.volume=volumes.effects;
 audio.setVolumes(volumes.music*.25,volumes.effects);
 const restore=()=>{if(introVoice===clip){introVoice=null;audio.setVolumes(volumes.music,volumes.effects);}};
 clip.onended=restore;clip.onerror=restore;playNpcClip(clip).catch(restore);
}

function playGossipGuardVoice(){
 stopIntroVoice();if(activePanel!=='gossipGuard'||document.hidden)return;
 const clip=new Audio('/assets/gossip-guard.mp3');introVoice=clip;clip.volume=volumes.effects;audio.setVolumes(volumes.music*.25,volumes.effects);
 const restore=()=>{if(introVoice===clip){introVoice=null;audio.setVolumes(volumes.music,volumes.effects);}};clip.onended=restore;clip.onerror=restore;playNpcClip(clip).catch(restore);
}



function showCasinoResult(r,host=document.body){
 document.querySelector('.casino-outcome')?.remove();if(!r.profit)return;
 const popup=document.createElement('div');popup.className='casino-outcome '+(r.profit>0?'win':'loss');popup.setAttribute('role','status');popup.textContent=r.profit>0?`YOU WON ${r.profit} GOLD!`:`YOU LOSE AGAIN. ${Math.abs(r.profit)} GOLD THIS TIME.`;host.append(popup);audio.unlock().then(()=>audio.effect(r.profit>0?'casinoWin':'buzzer'));setTimeout(()=>popup.remove(),3000);
}

function showSpellVisual(spell){if(!/fireball|lightning|stun-ray/.test(spell))return;const el=document.createElement('div');el.className='spell-burst '+(spell==='fireball'?'fire':'lightning');el.innerHTML=spell==='fireball'?'<span>🔥</span>':'<svg viewBox="0 0 100 100"><path d="M53 0 L35 30 L57 26 L37 58 L61 49 L43 100 M38 53 L18 69 M54 28 L78 43"/></svg>';document.querySelector('.scene-wrap').append(el);setTimeout(()=>el.remove(),850);}

let pigTauntPending=Promise.resolve();
let pigTauntCounter=0;
async function playPigTaunt(){
 const text=["Oink oink, who smells bacon?","Here piggy, piggy! I've got some nice mud for you to roll in."][pigTauntCounter++%2];
 const line=document.createElement('div');line.className='piggy-taunt';line.textContent=text;document.body.append(line);
 await new Promise(resolve=>{const done=()=>{line.remove();resolve();};if(!('speechSynthesis' in window)){setTimeout(done,3000);return;}const u=new SpeechSynthesisUtterance(text);u.volume=volumes.effects;u.rate=.95;u.onend=u.onerror=done;speechSynthesis.speak(u);setTimeout(done,6500);});
}
async function playNpcClip(clip){await pigTauntPending;if(introVoice!==clip)return;return clip.play();}
// Holding a touch direction repeats steps; capture the action before update rebuilds buttons.
let heldMoveTimer=null,heldMoveDelay=null,heldMovePointer=null,heldMoveRepeated=false;
function stopHeldMove(){clearTimeout(heldMoveDelay);clearTimeout(heldMoveTimer);heldMovePointer=null;}
$('movement').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-action]');if(!b||b.disabled||e.pointerType==='mouse')return;stopHeldMove();heldMoveRepeated=false;heldMovePointer=e.pointerId;const action=JSON.parse(b.dataset.action),mode=state.mode;heldMoveDelay=setTimeout(()=>{heldMoveRepeated=true;const step=()=>{if(activePanel||state.mode!==mode||document.hidden){stopHeldMove();return;}dispatch(action);if(heldMovePointer!==null)heldMoveTimer=setTimeout(step,wildernessStepDelay(state,action));};step();},300);});
attachTouchJoystick($('travel-controls'),{
 readState:()=>state,canMove:()=>!$('game').hidden&&!activePanel&&!combatView&&!shipInFlight&&!document.hidden,
 dispatch,stepDelay:wildernessStepDelay,pause:()=>!entryPrompt.hidden||!ladderPopup.hidden,
});
window.addEventListener('pointerup',stopHeldMove);window.addEventListener('pointercancel',stopHeldMove);window.addEventListener('blur',stopHeldMove);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopHeldMove();});$('movement').addEventListener('click',e=>{if(heldMoveRepeated){e.stopImmediatePropagation();e.preventDefault();heldMoveRepeated=false;}},true);


function playHalSequence(){clearTimeout(halSequenceTimer);const h=state.flags.halChallenge;if(h?.phase==='exploding'){if(halPhaseSpoken!=='exploding'){halPhaseSpoken='exploding';audio.unlock().then(()=>audio.effect('hal-panic'));if(window.speechSynthesis&&window.SpeechSynthesisUtterance){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance('Impossible! Impossible!');voice.pitch=.65;voice.rate=1.35;voice.volume=volumes.effects;speechSynthesis.speak(voice);}setTimeout(()=>{if(activePanel==='halChallenge'&&state.flags.halChallenge?.phase==='exploding')audio.effect('hal-explode');},2700);}halSequenceTimer=setTimeout(()=>{if(activePanel==='halChallenge'&&state.flags.halChallenge?.phase==='exploding')dispatch({type:'halFinish'});},4300);}else{if(halPhaseSpoken!==h?.phase&&h?.phase==='blackjack'&&window.speechSynthesis&&window.SpeechSynthesisUtterance){const voice=new SpeechSynthesisUtterance('First one to bust will terminate.');voice.pitch=.65;voice.rate=.8;voice.volume=volumes.effects;speechSynthesis.speak(voice);}halPhaseSpoken=h?.phase||'choice';}}

function playHeliumVoice(){stopIntroVoice();const clip=new Audio('/assets/helium-reaction.mp3');introVoice=clip;clip.volume=volumes.effects;audio.unlock().then(()=>playNpcClip(clip)).catch(()=>{});}

$('panel').addEventListener('change',e=>{if(e.target.id==='equipped-magic')dispatch(e.target.value?{type:'equipMagic',id:e.target.value}:{type:'unequipMagic'});});

$('panel').addEventListener('input',e=>{if(e.target.id==='wink-power'){updateWinkAim(e.target);return;}if(e.target.id!=='wager')return;const amount=e.target.value;const labels={blackjack:'Deal Blackjack',poker:'Deal Poker',tiddlywinks:'Play Tiddlywinks',roulette:'Spin Roulette'};$('panel').querySelectorAll('[data-bet]').forEach(b=>b.textContent=`Bet ${amount||0} Gold & ${labels[b.dataset.bet]}`);});

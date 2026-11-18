const yards={
 'shipyard-0':['driftwood','Driftwood Shipyard','Old Hobb One-Eye'],
 'shipyard-1':['cinder','Cinder Cove Shipyard','Captain Nera Ashwake'],
 'shipyard-2':['saltwake','Saltwake Shipyard','Master Ren Saltbraid'],
 'shipyard-3':['lastlight','Last Light Shipyard','Granny Maud Frosthook'],
 'shipyard-wild-0':['briar','Briar Bay Shipyard','Red Finn Splinter'],
 'shipyard-wild-3':['copper','Coppercliff Shipyard','Captain Saira Keel'],
 'shipyard-wild-6':['saltwild','Reedwake Shipyard','Jessa Stormlash'],
 'shipyard-wild-9':['starfall','Starfall Anchorage','Old Bastian Moonwake'],
};
export const shipyardProfile=id=>{const entry=yards[id];return entry?{image:'/assets/shipyard-'+entry[0]+'.webp',name:entry[1],harbormaster:entry[2]}:null;};
export function shipyardMarkup(s,yard,button,esc){const p=shipyardProfile(yard.id);return '<figure class="shipyard-scene"><img src="'+p.image+'" alt="'+esc(p.harbormaster)+' watches you suspiciously at '+esc(p.name)+'"><figcaption>'+esc(p.name)+' · '+esc(p.harbormaster)+'</figcaption></figure><div class="shipyard-controls"><p>Your purse: <strong>'+s.gold.toLocaleString('en-US')+' gold</strong></p>'+(s.flags.rowboatReady?'<p>Your rowboat is ready to launch.</p>':button('Buy rowboat · '+yard.price+' gold',{type:'buyRowboat'},'primary',s.gold<yard.price))+'<button data-close-percival>Leave shipyard</button></div>';
}

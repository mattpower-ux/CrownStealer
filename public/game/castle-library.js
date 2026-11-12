const towns = ['mothbridge','bellwether','gallows-fair','redhaven','iron-choir','ash-market','salt-choir','lantern-raft','pearl-defiance','last-dawn','hinge-town','noonless-quay'];
const hints = [
 ['The Missing Hearth Seal','The Bailiff of Bones no longer holds the Hearth Seal. Seek Haghilda on the fourth level of the abandoned elven village beyond the ruined tree fort.'],
 ['A Whip at the Bottom of the World','The Bottomless Pit lies in the Whispering Barrens. Defeat the Balrog of Despair on the hundredth floor and report your victory to the King. The Balrog’s whip is a trophy of the fight.'],
 ['When the Widow Rings','The Rock Troll waits on the tenth level of the Widow’s Bell. The Witness Bell is the prize he guards.'],
 ['The Blind Verdict','Beneath Redhaven, the Brass Tribunal still hears dead men’s cases. Justice Without Eyes guards the Mercy Key within.'],
 ['The Sceptre and the Slugs','Wang the Nauseating rules the fifteenth level of the Putrid Palace in the Cinder Dominion. Defeat him to claim his sceptre. Fireball clears his swarming slugs.'],
 ['Ashes on the Mountain','The Dragonstone lies on the tenth and lowest level of Firedrak Mountain in the Cinder Dominion. Drake the Defiler also waits there, holding captured dragons.'],
 ['The Boat in the Classroom','A chest on level twenty of the Drowned Conservatory holds the Boat Amulet. Keep it: when sailing to the Leviathan Pump, you need that boat rather than an ordinary vessel.'],
 ['The Laughing Codfish','A lake guards the approach to the Leviathan Pump. Bring the Boat Amulet from the Drowned Conservatory to reach the Leviathan of Levity and his Bone Compass.'],
 ['Confiscated Memories','The Curator of Drownings tends the Drowned Conservatory. The Tideglass Lens is hidden in that submerged place of learning.'],
 ['The Foreman’s Last Shift','The Last Foreman commands the undead in the Clockwork Sepulchre. Defeat the necromancer to recover the Quiet Anvil.'],
 ['Every Vote is His','The Unanimous King waits within the Parliament of Ash. The Empty Crown lies at the center of his kingdom of identical delegates.'],
 ['Two Shores Without Roads','Moonless Thicket and the Silent Expanse are reached through sailing passages. Bring a boat for the first crossing; a crystal can return you to a land already visited.'],
];
const recipes = [
 ['Goat Pudding','Whisk goat curds into stale gravy until the spoon stands upright. Bake until the pudding objects. Serve to someone who owes you money.'],
 ['Purple Snail Soup','Simmer purple snails with cabbage water and one ceremonial sock. Remove the sock only if company is expected. Garnish with regret.'],
 ['Carcass Carcassone Stir Fry','Toss yesterday’s questionable scraps with turnips and burnt onions. Stir vigorously while denying responsibility. Serve on a plate with a signed waiver.'],
 ['Pickled Bog Loaf','Fold pickled reeds into damp bread. Leave beneath a warm saddle overnight. Slice thinly so the guests cannot count the reeds.'],
 ['Ash-Roasted Slug Surprise','Roll garden slugs in cold fireplace ash. The surprise is that the recipe does not improve when cooked.'],
 ['Boot-Leather Dumplings','Boil a retired boot with flour until the laces float. The author recommends removing the cobbler first.'],
 ['Jellied Eel Custard','Layer eel jelly and sour custard in a cracked bowl. Chill until it develops enough courage to wobble toward the door.'],
 ['Barnacle Breakfast Crumble','Crush barnacles into last week’s porridge. Add salt, then apologize to the sea.'],
 ['Moulded Pearl-Onion Pie','The pearls are decorative and the onions are compulsory. Bake until the mould has a convincing crust.'],
 ['Graveyard Turnip Trifle','Stack turnips, cold gravy and yesterday’s cake. Do not ask why the top layer keeps sinking.'],
 ['Candle-Wax Croquettes','Roll candle stubs in breadcrumbs and fry until the kitchen smells like a funeral. Absolutely no nutritional claims are made.'],
 ['Fermented Fog Soufflé','Beat stale marsh water until foamy. Bake in total darkness and tell the guests it rose before they arrived.'],
 ['Royal Sock Broth','Steep a ceremonial stocking with leeks and a single bay leaf. The King’s copy omits whose stocking.'],
];
const attributes = ['wisdom','charisma','strength','constitution','intelligence','dexterity'];
export function castleLibraryBooks(townId, layout) {
 const townIndex=towns.indexOf(townId);if(townIndex<0)return [];
 const occupied=new Set([...layout.chests,...layout.guards,...(layout.patrols||[])].map(p=>p.x+','+p.y));
 const result=[];
 for(const [ordinal,room] of layout.rooms.filter(r=>['archive','library'].includes(r.id)).entries()){
  const coverIndex=ordinal?12:townIndex;
  const hint=ordinal?['Keys Beneath the Throne','The stair in Bellwether’s front foyer leads to a single-level Royal Dungeon. Its Torturer and Heckler keep three prisoners in two cells. Neither attacks without provocation; both must be defeated before the cells can be opened.']:hints[townIndex];
  const recipe=recipes[coverIndex],attribute=attributes[coverIndex%attributes.length];
  const label=attribute[0].toUpperCase()+attribute.slice(1);
  const titles=[{category:'hint',name:hint[0],text:hint[1]},
   {category:'recipe',name:recipe[0],text:recipe[1]+' The librarian has marked this recipe: useless, and best left uncooked.'},
   {category:'rare',rarity:'rare',attribute,amount:1,name:'The Illuminated Book of '+label+' — '+townId.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')+(ordinal?' Royal Edition':' Palace Edition'),text:'A rare illuminated volume. Reading it at level 5 or higher permanently increases '+label+' by 1, once for this volume, up to the attribute limit of 50.'}];
  const cells=[];for(let y=room.y+room.height-1;y>=room.y;y--)for(let x=room.x;x<room.x+room.width;x++)if(!occupied.has(x+','+y)&&!['wall','door','exit','stair'].includes(layout.tiles[y]?.[x]))cells.push({x,y});
  for(const [i,book] of titles.entries()){
   const p=cells[i];if(!p)continue;occupied.add(p.x+','+p.y);
   result.push({...book,id:townId+':'+room.id+':book-'+i,kind:'book',room:room.id,coverIndex,...p,
    text:book.text+' This copy belongs to '+townId.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ')+(ordinal?'’s Royal Library.':'’s palace library.')});
  }
 }
 return result;
}

export const CHARACTER_LOOKS=[
 ['look-red-drifter','Red-haired drifter','male','Young, thin and wiry; tousled red hair and a faded green tunic.'],
 ['look-stalwart','The stalwart','male','Stocky, middle-aged; close beard, bald head and a worn leather vest.'],
 ['look-gray-wanderer','Gray wanderer','male','Elderly and lean; flowing silver hair and a patched blue tunic.'],
 ['look-quiet-scout','Quiet scout','male','Young and slender; cropped dark hair and a charcoal tunic.'],
 ['look-russet-veteran','Russet veteran','male','Broad and older; short silver hair and a plain russet jerkin.'],
 ['look-golden-traveler','Golden traveler','female','Stocky and middle-aged; short coils and a mustard tunic.'],
 ['look-wiry-rover','Wiry rover','female','Young and thin; uneven cropped hair and battered gray leather.'],
 ['look-silver-pilgrim','Silver pilgrim','female','Elderly and lean; a silver braid and faded plum clothing.'],
 ['look-green-warden','Green warden','female','Muscular and athletic; a shaved head and a simple green vest.'],
 ['look-blue-wayfarer','Blue wayfarer','female','Slender and middle-aged; short silver-streaked hair and blue clothing.'],
].map(([id,label,sex,description])=>({id,label,sex,description,fullBody:true,url:'/assets/'+id+'.webp'}));
export const characterLook=id=>CHARACTER_LOOKS.find(look=>look.id===id);
export function lookPickerMarkup(){return '<details class="look-picker"><summary>Choose Your Look</summary><p>Choose the adventurer you want to be.</p><div class="look-choices">'+CHARACTER_LOOKS.map(look=>`<label title="${look.description}"><input type="radio" name="adventurer-cameo" value="${look.id}" aria-label="${look.label}"><img class="look-body" src="${look.url}" alt="${look.description}"><span>${look.label}</span></label>`).join('')+'</div></details>';}

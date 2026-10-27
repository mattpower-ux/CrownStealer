export const MERCHANTS=[
 {name:'Mabel Applebarrel',line:'A full belly and a sharp blade. Everything else is gossip.'},
 {name:'Osric Pinchpurse',line:'Royal quality. Regrettably royal prices.'},
 {name:'Jory Threepockets',line:'All honestly acquired. No further questions.'},
 {name:'Auntie Saffron',line:'Mind the spices. One sneeze and the whole stall explodes.'},
 {name:'Bram Cinderhand',line:'I made it to last longer than its owner.'},
 {name:'Nessa Bottleglass',line:'Drink the labelled bottles. Especially if you enjoy having eyebrows.'},
 {name:'Captain Marla Salt',line:'Dry goods. Mostly. The sea has opinions.'},
 {name:'Old Finn Copperhook',line:'A fair price, and a fish story at no extra charge.'},
 {name:'Ysabet Pearl',line:'Power is temporary. A tasteful necklace is forever.'},
 {name:'Tobin Ticktock',line:'Warranted until the next inexplicable celestial event.'},
 {name:'Greta Woolmantle',line:'Warm socks first. Heroic destiny second.'},
 {name:'Darius Dust',line:'Ancient treasures. Recently dusted. Strictly no curses refunded.'}
];
const FORTUNES=[
 'I see a princess in your future, {name}. She is pointing you toward the servants’ exit.',
 'Your destiny is a ditch, {name}. A deep one. Take a shovel and stop trying so hard.',
 'The crystal is clouding over. No, that is you. You smell like a rotten herring.',
 'Bathe more frequently, {name}. The goblins have started carrying scented handkerchiefs.',
 'Bunnyfoot will never swoon over you. Unless you stand downwind.',
 'A great honour awaits: assistant ditch digger. Unpaid. Bring your own mud.',
 'I foresee a romantic evening. The princess has plans. You are not in them.',
 'The stars say you are special. The sort of special they keep behind a fence.',
 'Stop trying so hard, {name}. Even your shadow looks embarrassed.',
 'I see gold, jewels, and a royal wedding. Lovely. Now let us look at YOUR future.',
 'You shall conquer a mighty beast. Probably a flea. Begin with the ones in your trousers.',
 'Your lucky number is soap. Your lucky day is bath day. Off you go.',
 'The princess dreams of a brave knight. You have the knees of a frightened turnip.',
 'Return to digging ditches, {name}. At least the worms appreciate your conversation.',
 'A mysterious stranger will offer you a fortune. It is me, and the fortune is that you need a wash.',
 'I see a crown upon your head. Ah, a bucket. That makes considerably more sense.'
];
let previous=-1;
export function fortuneFor(name,random=Math.random){let i=Math.floor(random()*FORTUNES.length)%FORTUNES.length;if(i===previous)i=(i+1)%FORTUNES.length;previous=i;return FORTUNES[i].replaceAll('{name}',name);}

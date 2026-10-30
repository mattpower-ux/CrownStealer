const atlas=new Image();atlas.src='/assets/regional-buildings.webp';
const slots={inn:0,shop:1,casino:2,court:3,quests:4,fortune:5,talk:4};
export function regionalBuilding(c,region,kind,x,y,w,h){if(!atlas.complete||!atlas.naturalWidth||slots[kind]===undefined)return false;const sw=atlas.width/6,sh=atlas.height/4,transform=c.getTransform(),aspect=Math.abs(transform.a/transform.d)||1;const expanded=h*aspect;y-=expanded-h;h=expanded;c.drawImage(atlas,slots[kind]*sw,region*sh,sw,sh,x,y,w,h);return true;}

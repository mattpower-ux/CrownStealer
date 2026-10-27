from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent.parent
source=root/'art-source';source.mkdir(exist_ok=True)
limits={'cover':1600,'creatures':1024,'terrain':1024,'adventurer':256,'biome-trees':512,'towns':1024,'fair':256,'vault':256,'buildings':1024,'dealers':1024,'dealers-annoyed':1024,'dungeon-monsters':1536,'monsters-hearth':1536,'monsters-cinder':1536,'monsters-tide':1536,'monsters-star':1536,'monsters-wild':1536}
report=[]
for name,limit in limits.items():
 path=root/'public/assets'/f'{name}.png'
 if path.exists():path.replace(source/path.name)
 path=source/f'{name}.png'
 im=Image.open(path);im.thumbnail((limit,limit),Image.Resampling.LANCZOS)
 out=root/'public/assets'/f'{name}.webp';im.save(out,'WEBP',quality=84,method=6)
 report.append({'asset':out.name,'originalBytes':path.stat().st_size,'optimizedBytes':out.stat().st_size,'dimensions':list(im.size)})
(root/'docs/image-optimization.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'before':sum(r['originalBytes'] for r in report),'after':sum(r['optimizedBytes'] for r in report),'assets':report},indent=2))

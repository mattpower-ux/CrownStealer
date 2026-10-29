import sys, zipfile, os
p=sys.argv[1]
with zipfile.ZipFile(p) as z:
    entries=[(i.filename,z.read(i)) for i in z.infolist()]
with zipfile.ZipFile(p+'.normalized','w',zipfile.ZIP_DEFLATED) as out:
    for name,data in entries:
        out.writestr(name,data,compress_type=zipfile.ZIP_STORED if name in ('classes.dex','resources.arsc') else zipfile.ZIP_DEFLATED)
os.replace(p+'.normalized',p)


import csv, re, json, collections, unicodedata, openpyxl
import sys
EPA=sys.argv[1] if len(sys.argv)>1 else 'data-sources/epa-vehicles.csv'; ANK=sys.argv[2] if len(sys.argv)>2 else 'data-sources/ankusi-fitment.xlsx'
OUT='src/data/generated/cars.json'
def slug(s):
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    s=s.replace('&','and').replace('+','plus')
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-'); return s
def norm(s): return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
MAKE_ALIAS={'McLaren Automotive':'McLaren','Citroen':'Citroën'}
def mk(m): return MAKE_ALIAS.get(m,m)
# ---------- EPA
rows=list(csv.DictReader(open(EPA,encoding='utf-8-sig')))
models={}
def get(make,model):
    k=(slug(make),slug(model))
    if k not in models: models[k]={'make':make,'model':model,'epa':collections.defaultdict(list),'wheels':[]}
    return models[k]
def num(x,f=float):
    try: return f(x)
    except: return None
for r in rows:
    make=mk(r['make']); base=r['baseModel'].strip() or r['model'].strip()
    if not base: continue
    m=get(make,base)
    v=[r['model'].strip(), num(r['displ']), num(r['cylinders'],lambda x:int(float(x))), r['drive'], r['trany'],
       r['fuelType1'] + (' / '+r['fuelType2'] if r['fuelType2'] else ''), num(r['city08'],int), num(r['highway08'],int), num(r['comb08'],int),
       num(r['fuelCost08'],int), num(r['range'],int), (r['evMotor'] or '').strip(), (1 if r['tCharger']=='T' else 0)+(2 if r['sCharger']=='S' else 0),
       r['VClass']]
    m['epa'][int(r['year'])].append(v)
epa_models_by_make=collections.defaultdict(list)
for (ms,mods),m in models.items(): epa_models_by_make[ms].append((norm(m['model']),m['model']))
for k in epa_models_by_make: epa_models_by_make[k].sort(key=lambda x:-len(x[0]))
# ---------- Ankusi
wb=openpyxl.load_workbook(ANK,data_only=True)
fl=list(wb['Fitment List'].iter_rows(min_row=2,values_only=True))
MULTI=['Land Cruiser Prado','Land Cruiser','Range Rover Sport','Range Rover Evoque','Range Rover Velar','Range Rover','Grand Cherokee','Grand Caravan','Grand Highlander','Grand Vitara','Santa Fe','Santa Cruz','Mustang Mach-E','Corolla Cross','Discovery Sport','Model S','Model 3','Model X','Model Y','Bronco Sport','Sportage','Golf GTI','Crown Victoria']
def group_name(make,model):
    name=model.strip()
    name=re.sub(r'\s*\[[^\]]*\]','',name)
    name=re.sub(r'\s+',' ',name).strip()
    for pre in (make, make.replace('-',' ')):
        if name.lower().startswith(pre.lower()+' '): name=name[len(pre)+1:]
    if not name: name=model
    if make=='BMW':
        m1=re.match(r'^([1-8])[- ]?Series\b',name) or re.match(r'^([1-8])\d\d[a-zA-Z]*\b',name)
        if m1: name=f"{m1.group(1)} Series"
        m2=re.match(r'^(M[2-8]|X[1-7]|Z[34]|i[3-8]|iX[13]?)\b',name)
        if m2: name=m2.group(1)
    if make=='Mercedes-Benz':
        m1=re.match(r'^(A|B|C|E|S|G)[- ]?(Class|\d{2,3})\b',name)
        if m1: name=f"{m1.group(1)}-Class"
        m2=re.match(r'^(CLA|CLS|CLK|SLK|SLC|SL|GLA|GLB|GLC|GLE|GLK|GLS|ML|EQA|EQB|EQC|EQE|EQS)\b',name)
        if m2: name=m2.group(1)
    n=norm(name)
    for nm,orig in epa_models_by_make.get(slug(make),[]):
        if len(nm)>=2 and n.startswith(nm):
            # word boundary check: next char in original must not be a letter continuing a word
            return orig, True
    for pre in MULTI:
        if name.lower().startswith(pre.lower()): return pre, False
    toks=name.split(' ')
    g=toks[0]
    if len(toks)>1 and (len(g)<=2 or g.isdigit() or (re.search(r'\d',toks[1]) and len(toks[1])<=4 and not re.match(r'^(19|20)\d\d$',toks[1]))):
        g=g+' '+toks[1]
    g=re.sub(r'\(.*$','',g).strip()
    return g, False
region=lambda s: (re.search(r'\[([A-Z]{2,3})\]',s) or [None,None])[1]
for r in fl:
    make=mk(r[0]); model=str(r[1])
    g,_=group_name(make,model)
    m=get(make,g)
    m['wheels'].append([re.sub(r'\s*\[[^\]]*\]','',model).strip(), r[3], r[4], r[5], r[9], r[10], r[11], r[12], r[13], r[14], r[15], r[6], region(model), r[16]])
# ---------- output
out=[]
for (ms,mods),m in models.items():
    epa={str(y):v for y,v in sorted(m['epa'].items())}
    out.append({'make':m['make'],'makeSlug':ms,'model':m['model'],'modelSlug':mods,'epa':epa,'wheels':sorted(m['wheels'],key=lambda w:(w[1] or 0,w[0]))})
out.sort(key=lambda x:(x['makeSlug'],x['modelSlug']))
json.dump(out,open(OUT,'w'),separators=(',',':'),ensure_ascii=False)
import os
print('models',len(out),'with epa',sum(1 for o in out if o['epa']),'with wheels',sum(1 for o in out if o['wheels']),'both',sum(1 for o in out if o['epa'] and o['wheels']))
print('wheel rows',sum(len(o['wheels']) for o in out),'epa rows',sum(len(v) for o in out for v in o['epa'].values()))
print('year pages 2000+',sum(1 for o in out for y in o['epa'] if int(y)>=2000))
print('size MB',os.path.getsize(OUT)/1e6)
print('makes',len({o['makeSlug'] for o in out}))
t=[o for o in out if o['makeSlug']=='toyota']; print([ (o['model'],len(o['wheels']),len(o['epa'])) for o in t][:40])

from pathlib import Path
import json, random

def oracle(users, orders, items):
    out=[]
    for uid,fav in users:
        sales=sorted([o for o in orders if o[3]==uid], key=lambda o:o[1])
        brand=items.get(sales[1][2]) if len(sales)>=2 else None
        out.append((uid,'yes' if brand==fav else 'no'))
    return out

def lesson(users, orders, items):
    ranked=[]
    by={}
    for o in orders: by.setdefault(o[3],[]).append(o)
    for a in by.values():
        a.sort(key=lambda o:o[1])
        ranked.extend((o, i+1) for i,o in enumerate(a))
    second={o[3]:o for o,r in ranked if r==2}
    return [(uid, 'yes' if uid in second and items.get(second[uid][2])==fav else 'no') for uid,fav in users]

base_users=[(1,'Lenovo'),(2,'Samsung'),(3,'LG'),(4,'HP')]
base_orders=[(1,'2019-08-01',4,2),(2,'2019-08-02',2,3),(3,'2019-08-03',3,3),(4,'2019-08-04',1,2),(5,'2019-08-04',1,4),(6,'2019-08-05',2,4)]
base_items={1:'Samsung',2:'Lenovo',3:'LG',4:'HP'}
assert lesson(base_users,base_orders,base_items)==[(1,'no'),(2,'yes'),(3,'yes'),(4,'no')]
assert lesson([(8,'LG')],[],{})==[(8,'no')]
assert lesson([(8,'LG')],[(1,'2020-01-01',1,8)],{1:'LG'})==[(8,'no')]
for seed in range(200):
    rng=random.Random(seed); users=[(i,rng.choice(['A','B','C'])) for i in range(1,8)]
    orders=[]; items={j:chr(65+j%3) for j in range(1,10)}
    for uid,_ in users:
        for j in range(rng.randrange(5)):
            orders.append((len(orders)+1,f'2020-01-{j+1:02d}',rng.randrange(1,10),uid))
    assert lesson(users,orders,items)==oracle(users,orders,items)
source=Path(__file__).parents[1]/'solution.sql'; mirror=Path(__file__).parents[1]/'sql-code.js'
s=source.read_text(); assert json.loads(mirror.read_text().split('=',1)[1].strip().rstrip(';'))==s
print('oracle cases: 203; source parity: pass')

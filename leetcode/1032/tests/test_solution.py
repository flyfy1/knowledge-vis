"""Run from any directory. OUTPUT_DIR redirects all generated evidence."""
import importlib.util,itertools,json,os,pathlib,random,copy
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('OUTPUT_DIR',ROOT/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('candidate',ROOT/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
cases=queries=0

def check(words,stream):
    global cases,queries
    old=copy.deepcopy(words);obj=m.StreamChecker(words);full='';L=max(map(len,words));results=[]
    # Independently enumerate reversed word prefixes, not using candidate construction.
    paths={''}
    for w in words:
        for k in range(1,len(w)+1): paths.add(w[::-1][:k])
    actual=set();ends=set();todo=[('',obj.root)]
    while todo:
        path,node=todo.pop();actual.add(path)
        if '#' in node: ends.add(path[::-1]);assert node['#'] is True
        todo.extend((path+ch,child) for ch,child in node.items() if ch!='#')
    assert actual==paths and ends==set(words)
    for ch in stream:
        full+=ch
        expected=any(len(w)<=len(full) and all(full[len(full)-len(w)+i]==c for i,c in enumerate(w)) for w in words)
        result=obj.query(ch);assert type(result) is bool and result==expected,(words,full,result,expected)
        assert ''.join(obj.buffer)==full[-L:]
        results.append(result);queries+=1
    assert words==old
    cases+=1
    return results
assert check(['cd','f','kl'],'abcdefghijkl')==[False,False,False,True,False,True,False,False,False,False,False,True]
small=[''.join(p) for n in range(1,4) for p in itertools.product('ab',repeat=n)]
for n in range(1,4):
    for words in itertools.combinations(small,n):
        for bits in itertools.product('ab',repeat=6):check(list(words),''.join(bits))
rng=random.Random(1032)
for _ in range(600):
    words=[''.join(rng.choices('abcd',k=rng.randint(1,15))) for _ in range(rng.randint(1,15))]
    check(words,''.join(rng.choices('abcd',k=100)))
check(['a'],'');check(['ab','ab'],'abab');check(['a','ba'],'baba');check(['aa'],'aaaa')
# Both maximum counts, all 40000 queries; worst-case buffer scan after warm-up.
assert check(['a'*200]*2000,'a'*40000)==[False]*199+[True]*39801
check(['b'+'a'*199],'a'*401)  # 200th edge missing, despite a 199-edge prefix.
# Independent objects keep separate state.
a=m.StreamChecker(['ab']);b=m.StreamChecker(['ab']);assert a.query('a') is False;assert b.query('b') is False;assert a.query('b') is True
# Parse copy representation before duplicate keys can disappear.
def unique(pairs):
    d={}
    for k,v in pairs:
        assert k not in d,('duplicate localization key',k)
        d[k]=v
    return d
raw=(ROOT/'copy.js').read_text().removeprefix('window.LESSON_COPY = ').strip().removesuffix(';')
copydata=json.loads(raw,object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(s,str) and s for s in v) for v in copydata.values())
mirror=(ROOT/'python-code.js').read_text();embedded=json.loads(mirror.removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';'))
assert embedded==(ROOT/'solution.py').read_text()
result={'kind':'author self-check','cases':cases,'queries':queries,'seed':1032,'passed':True,'checks':['direct character suffix oracle','every buffer state','all trie prefixes and terminals','official example','max words/length/queries','input immutability','separate instances','source mirror exact','duplicate localization keys and pair shape']}
(OUT/'python-results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))

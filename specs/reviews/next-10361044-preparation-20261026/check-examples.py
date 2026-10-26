"""Tiny independent contract witnesses, not optimized lesson implementations."""
from itertools import product
from pathlib import Path
import json
SIDE=10**6

def inside(p):return all(0<=v<SIDE for v in p)
def path_certificate(blocked,source,target,vertices):
    assert tuple(vertices[0])==tuple(source)and tuple(vertices[-1])==tuple(target)
    assert all(inside(p)for p in vertices)
    for a,b in zip(vertices,vertices[1:]):
        assert (a[0]==b[0])^(a[1]==b[1]),'Each segment must be nonempty axis-aligned'
        for x,y in blocked:
            assert not(a[0]==b[0]==x and min(a[1],b[1])<=y<=max(a[1],b[1]))
            assert not(a[1]==b[1]==y and min(a[0],b[0])<=x<=max(a[0],b[0]))
    return True

def closed_component_certificate(blocked,source,target,cells):
    blocked=set(map(tuple,blocked));cells=set(map(tuple,cells));source=tuple(source);target=tuple(target)
    assert (source in cells)^(target in cells)
    assert all(inside(p)and p not in blocked for p in cells)
    boundary=[]
    for x,y in sorted(cells):
        for q in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
            if q in cells:continue
            assert not inside(q)or q in blocked,('Open boundary contradicts trap',q)
            boundary.append({'cell':q,'reason':'blocked'if q in blocked else'outside-million-grid'})
    return boundary

maze=[
 {'case':'official-source-corner','blocked':[[0,1],[1,0]],'source':[0,0],'target':[0,2],'answer':False,'closedCells':[[0,0]]},
 {'case':'official-empty-far-grid','blocked':[],'source':[0,0],'target':[999999,999999],'answer':True,'pathVertices':[[0,0],[999999,0],[999999,999999]]},
 {'case':'target-corner-trap','blocked':[[0,1],[1,0]],'source':[0,2],'target':[0,0],'answer':False,'closedCells':[[0,0]]},
 {'case':'no-diagonal-escape','blocked':[[0,1],[1,0]],'source':[0,0],'target':[1,1],'answer':False,'closedCells':[[0,0]]},
 {'case':'one-wall-detour','blocked':[[0,1]],'source':[0,0],'target':[0,2],'answer':True,'pathVertices':[[0,0],[1,0],[1,2],[0,2]]},
 {'case':'interior-target-trap','blocked':[[1,2],[2,1],[2,3],[3,2]],'source':[0,0],'target':[2,2],'answer':False,'closedCells':[[2,2]]},
 {'case':'upper-grid-boundary-trap','blocked':[[999998,999999],[999999,999998]],'source':[999999,999999],'target':[0,0],'answer':False,'closedCells':[[999999,999999]]},
 {'case':'two-cell-trap','blocked':[[1,2],[2,1],[3,2],[1,3],[3,3],[2,4]],'source':[2,2],'target':[0,0],'answer':False,'closedCells':[[2,2],[2,3]]},
 {'case':'target-inside-same-enclosure','blocked':[[1,2],[2,1],[3,2],[1,3],[3,3],[2,4]],'source':[2,2],'target':[2,3],'answer':True,'pathVertices':[[2,2],[2,3]]},
]
for c in maze:
    assert c['source']!=c['target'];assert c['source']not in c['blocked']and c['target']not in c['blocked']
    if c['answer']:path_certificate(c['blocked'],c['source'],c['target'],c['pathVertices'])
    else:c['boundaryWitness']=closed_component_certificate(c['blocked'],c['source'],c['target'],c['closedCells'])

def substring_table(s):
    starts={}
    for i in range(len(s)):
        for end in range(i+1,len(s)+1):starts.setdefault(s[i:end],[]).append(i)
    repeated={word:indices for word,indices in starts.items()if len(indices)>=2}
    longest=max(map(len,repeated),default=0)
    return {word:indices for word,indices in repeated.items()if len(word)==longest}

def pairwise_prefix_length(s):
    best=0
    for i in range(len(s)):
        for j in range(i+1,len(s)):
            length=0
            while j+length<len(s)and s[i+length]==s[j+length]:length+=1
            best=max(best,length)
    return best

strings=[('banana',{'ana'}),('abcd',set()),('aaaa',{'aaa'}),('ababab',{'abab'}),('abcdabefcd',{'ab','cd'}),('aa',{'a'}),('ab',set()),('aabaaba',{'aaba'}),('mississippi',{'issi'})]
string_results=[]
for s,expected in strings:
    winners=substring_table(s);assert set(winners)==expected,(s,winners)
    assert max(map(len,winners),default=0)==pairwise_prefix_length(s)
    string_results.append({'s':s,'maximumLength':pairwise_prefix_length(s),'allAcceptedLongestWords':list(winners)or[''],'occurrenceStarts':winners})
exhaustive=0
for n in range(2,7):
    for letters in product('ab',repeat=n):
        s=''.join(letters);winners=substring_table(s);assert max(map(len,winners),default=0)==pairwise_prefix_length(s)
        for word,starts in winners.items():assert len(set(starts))>=2 and all(s[i:i+len(word)]==word for i in starts)
        exhaustive+=1
result={'status':'passed','mazeCases':maze,'mazeMethod':'Actual million-grid axis-aligned path certificates or exact closed-set boundary certificates; no arbitrary finite crop or enclosure-size threshold.','substringCases':string_results,'substringMethod':'All literal substrings/starting positions cross-checked against all starting-position pairs; no hashing or optimized solution.','exhaustiveBinaryStrings':exhaustive,'maximumExhaustiveLength':6}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(len(maze),'maze certificates;',len(strings),'substring cases;',exhaustive,'tiny binary strings passed')

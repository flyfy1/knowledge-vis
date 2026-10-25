"""Independent recursive grammar oracle and executed canonical Python checks.
Run: python3 -B leetcode/591/tests/check.py
Optional: LESSON_EVIDENCE_DIR=/absolute/output
"""
import importlib.util,itertools,json,os,pathlib,random,subprocess
BASE=pathlib.Path(__file__).resolve().parents[1]
OUT=pathlib.Path(os.environ.get('LESSON_EVIDENCE_DIR',BASE/'tests/evidence'));OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('solution',BASE/'solution.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def oracle(s):
    # One complete node, with recursive children; no explicit stack/scan loop
    # from the submission. Tag-name grammar checked via a full regex match.
    import re
    def node(pos):
        opening=re.compile(r'<([A-Z]{1,9})>').match(s,pos)
        if not opening: raise ValueError()
        name=opening[1]; pos=opening.end()
        while pos<len(s):
            closing='</'+name+'>'
            if s.startswith(closing,pos):return pos+len(closing)
            if s.startswith('<![CDATA[',pos):
                stop=s.index(']]>',pos+9);pos=stop+3
            elif s[pos]=='<':pos=node(pos)
            else:pos+=1
        raise ValueError()
    try:return bool(s) and node(0)==len(s)
    except (ValueError,RecursionError):return False

q=json.loads((BASE/'provenance/official.json').read_text())['response']['data']['question']
examples=[json.loads(x) for x in q['exampleTestcases'].splitlines()]
assert [oracle(s) for s in examples]==[True,True,False]
cases=set(examples)
for length in range(7):
    cases.update(''.join(x) for x in itertools.product('<>/Aa',repeat=length))
boundaries={'<R><![CDATA[</R>]]><S></S></R>':True,'<A></A>':True,'<ABCDEFGHI></ABCDEFGHI>':True,'<ABCDEFGHIJ></ABCDEFGHIJ>':False,'<a></a>':False,'<></>':False,'<A/>':False,'<A>></A>':True,'<A><B></A></B>':False,'<A></A> ':False,' <A></A>':False,'<![CDATA[x]]>':False,'<A><![CDATA[]]></A>':True,'<A><![CDATA[x</A>':False,'<A><![CDATA[]]><B></B>]]></A>':True,'<A><':False,'<A></A><A></A>':False,'<A>':False,'<A>text':False,'<A>'+'x'*493+'</A>':True,'<A>'*70+'x'*10+'</A>'*70:True}
for s,want in boundaries.items():assert oracle(s)==want,(s,want)
cases.update(boundaries)
rng=random.Random(591)
def valid(depth=0):
    name=rng.choice(['A','B','ROOT','ABCDEFGHI'])
    content=''.join(rng.choice(['x',' > / [] .','<![CDATA[</Z><x>]]>',valid(depth+1) if depth<3 else '']) for _ in range(rng.randrange(3)))
    return '<'+name+'>'+content+'</'+name+'>'
for _ in range(4000):
    s=valid();cases.add(s)
    pos=rng.randrange(len(s));cases.add(s[:pos]+rng.choice(['','<','>','a','</B>','<![CDATA[',']]>'])+s[pos+1:])
    cases.add(rng.choice(['x','<B></B>',' '])+s);cases.add(s+rng.choice(['x','<B></B>',' ']))
for _ in range(1500):cases.add(''.join(rng.choices('<>/![]ABax .',k=rng.randrange(1,80))))
rows=[]
for s in sorted(cases):
    expected=oracle(s);got=m.Solution().isValid(s)
    assert got==expected,(s,got,expected)
    rows.append([s,expected])
fixture=OUT/'oracle-cases.json';fixture.write_text(json.dumps(rows))
r=subprocess.run(['node',str(BASE/'tests/check-core.cjs'),str(fixture)],capture_output=True,text=True,check=True)
report={'kind':'author self-check, not independent acceptance','pythonCases':len(rows),'officialExamples':3,'boundaryCases':len(boundaries),'seed':591,'maxOfficialLengthChecked':500,'core':json.loads(r.stdout)}
(OUT/'algorithm.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))

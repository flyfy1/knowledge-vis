"""Tiny semantic oracles over explicitly authored grammar trees; no text parser,
optimized solver, executable expression eval or author algorithm is supplied.
"""
from itertools import product
from pathlib import Path
import json

def union(*children):assert len(children)>=2;return ('union',children)
def concat(*children):assert len(children)>=2;return ('concat',children)
def brace_text(tree):
    if isinstance(tree,str):assert len(tree)==1 and 'a'<=tree<='z';return tree
    kind,children=tree
    return '{'+','.join(map(brace_text,children))+'}'if kind=='union'else''.join(map(brace_text,children))
def brace_derivations(tree):
    if isinstance(tree,str):return [tree]
    kind,children=tree;groups=[brace_derivations(child)for child in children]
    return [word for group in groups for word in group]if kind=='union'else[''.join(parts)for parts in product(*groups)]
brace_cases=[
 ('official-1',concat(union('a','b'),union('c',union('d','e'))),'{a,b}{c,{d,e}}',['ac','ad','ae','bc','bd','be']),
 ('official-2',union(union('a','z'),concat('a',union('b','c')),union(concat('a','b'),'z')),'{{a,z},a{b,c},{ab,z}}',['a','ab','ac','z']),
 ('single-letter','a','a',['a']),
 ('adjacent-letters',concat('a','b'),'ab',['ab']),
 ('union-idempotence',union('a','a'),'{a,a}',['a']),
 ('product-not-zip',concat(union('a','b'),union('c','d')),'{a,b}{c,d}',['ac','ad','bc','bd']),
 ('whole-union-alternative',concat(union(concat('a','b'),'c'),'d'),'{ab,c}d',['abd','cd']),
 ('prefix-and-suffix',concat('a',union('b','c'),'d'),'a{b,c}d',['abd','acd']),
 ('nested-union-dedup',union(union('a','b'),union('b','c')),'{{a,b},{b,c}}',['a','b','c']),
 ('distinct-derivations-same-word',concat(union('a',concat('a','b')),union(concat('b','c'),'c')),'{a,ab}{bc,c}',['abbc','abc','ac']),
 ('lexical-not-length-order',union('z',concat('a','a'),'a'),'{z,aa,a}',['a','aa','z']),
]
brace_results=[]
for label,tree,text,expected in brace_cases:
    assert brace_text(tree)==text;words=brace_derivations(tree);actual=sorted(set(words));assert actual==expected,(label,actual)
    brace_results.append({'case':label,'expression':text,'grammarTree':tree,'derivationWords':words,'distinctSortedResult':actual})

def boolean(op,*children):
    assert (op=='!'and len(children)==1)or(op in '&|'and len(children)>=1)
    return (op,children)
def bool_text(tree):
    if isinstance(tree,str):assert tree in ['t','f'];return tree
    op,children=tree;return op+'('+','.join(map(bool_text,children))+')'
def bool_value(tree,trace):
    if isinstance(tree,str):return tree=='t'
    op,children=tree;values=[bool_value(child,trace)for child in children] # Evaluate every operand in this tiny semantic oracle.
    value=not values[0]if op=='!'else all(values)if op=='&'else any(values)
    trace.append({'expression':bool_text(tree),'operator':op,'operandValues':values,'result':value});return value
B=boolean
bool_cases=[
 ('official-1',B('&',B('|','f')),'&(|(f))',False),
 ('official-2',B('|','f','f','f','t'),'|(f,f,f,t)',True),
 ('official-3',B('!',B('&','f','t')),'!(&(f,t))',True),
 ('true-literal','t','t',True),('false-literal','f','f',False),
 ('not-false',B('!','f'),'!(f)',True),
 ('double-negation',B('!',B('!','t')),'!(!(t))',True),
 ('unary-and',B('&','t'),'&(t)',True),('unary-or',B('|','f'),'|(f)',False),
 ('mixed-groups',B('&',B('|','f','t'),B('!','f')),'&(|(f,t),!(f))',True),
 ('false-and-still-has-following-outer-sibling',B('|',B('&','f',B('!','f')),B('&','t','t')),'|(&(f,!(f)),&(t,t))',True),
 ('true-or-still-has-following-outer-sibling',B('&',B('|','t',B('!','t')),'f'),'&(|(t,!(t)),f)',False),
 ('nested-not-of-and',B('!',B('&','t',B('|','f','t'))),'!(&(t,|(f,t)))',False),
]
bool_results=[]
for label,tree,text,expected in bool_cases:
    assert bool_text(tree)==text;trace=[];value=bool_value(tree,trace);assert type(value)is bool and value is expected,(label,value)
    bool_results.append({'case':label,'expression':text,'grammarTree':tree,'result':value,'groupTruthWitnesses':trace})
truth_checks=0
for width in range(1,4):
    for values in product([False,True],repeat=width):
        leaves=['t'if v else'f'for v in values]
        for op,expected in [('&',sum(values)==width),('|',sum(values)>0)]:
            assert bool_value(B(op,*leaves),[])is expected;truth_checks+=1
for value in [False,True]:assert bool_value(B('!','t'if value else'f'),[])is(not value);truth_checks+=1
result={'status':'passed','method':'Explicit valid grammar trees independently serialized to each stated original input; tiny bag/product or truth-table semantics checked against hand-written expected results. No parsing/cursor implementation is proposed or validated.','braceCases':brace_results,'booleanCases':bool_results,'booleanTruthTableChecks':truth_checks,'largestTruthTableArity':3}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(result,indent=2)+'\n');print(len(brace_cases),'brace cases;',len(bool_cases),'boolean cases;',truth_checks,'small truth-table checks passed')

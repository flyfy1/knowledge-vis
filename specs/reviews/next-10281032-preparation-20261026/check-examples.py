"""Direct contract checks: forward tree serialization and literal suffix witnesses.
No recovery implementation, trie, optimized solver or author prompt is supplied.
"""
from collections import deque
from pathlib import Path
import json

# Trees are nested (value, left, right), with None representing absent children.
def node(value,left=None,right=None):return (value,left,right)
def traversal(tree,depth=0):
    if tree is None:return ''
    value,left,right=tree
    assert 1<=value<=10**9
    assert left is not None or right is None, 'Original contract forbids a sole right child'
    return '-'*depth+str(value)+traversal(left,depth+1)+traversal(right,depth+1)
def level_order(tree):
    q=deque([tree]);out=[]
    while q:
        item=q.popleft()
        if item is None:out.append(None);continue
        value,left,right=item;out.append(value);q.extend([left,right])
    while out and out[-1]is None:out.pop()
    return out

trees=[
 ('official-1',node(1,node(2,node(3),node(4)),node(5,node(6),node(7))),'1-2--3--4-5--6--7',[1,2,5,3,4,6,7]),
 ('official-2',node(1,node(2,node(3,node(4))),node(5,node(6,node(7)))),'1-2--3---4-5--6---7',[1,2,5,3,None,6,None,4,None,7]),
 ('official-3',node(1,node(401,node(349,node(90)),node(88))),'1-401--349---90--88',[1,401,None,349,88,90]),
 ('singleton',node(1),'1',[1]),
 ('maximum-value-token',node(10**9),'1000000000',[10**9]),
 ('sole-left-child',node(1,node(2)),'1-2',[1,2]),
 ('multidigit-and-depth-return',node(12,node(34,node(56)),node(78)),'12-34--56-78',[12,34,78,56]),
 ('repeated-values-are-distinct-nodes',node(7,node(7,node(7)),node(7)),'7-7--7-7',[7,7,7,7]),
 ('return-from-depth-three-to-one',node(1,node(2,node(3,node(4))),node(5)),'1-2--3---4-5',[1,2,5,3,None,None,None,4]),
 ('same-depth-sibling',node(1,node(2,node(3),node(4)),node(5)),'1-2--3--4-5',[1,2,5,3,4]),
]
tree_results=[]
for label,tree,expected_text,expected_level in trees:
    actual_text=traversal(tree);actual_level=level_order(tree)
    assert actual_text==expected_text,(label,actual_text)
    assert actual_level==expected_level,(label,actual_level)
    tree_results.append({'case':label,'nestedTree':tree,'traversal':actual_text,'levelOrder':actual_level})
try:traversal(node(1,None,node(2)))
except AssertionError:sole_right_rejected=True
else:raise AssertionError('Oracle accepted an out-of-contract sole-right tree')

# Full accumulated stream plus endswith is an intentionally direct tiny oracle.
stream_cases=[
 ('official-1',['cd','f','kl'],'abcdefghijkl',[False,False,False,True,False,True,False,False,False,False,False,True]),
 ('official-intro',['abc','xyz'],'axyz',[False,False,False,True]),
 ('past-substring-is-not-current-suffix',['ab'],'aba',[False,True,False]),
 ('overlap-survives-a-match',['aa'],'aaa',[False,True,True]),
 ('shared-prefix-terminal-is-not-leaf-only',['ab','abc'],'abcf',[False,True,True,False]),
 ('two-words-end-together',['a','ba'],'ba',[False,True]),
 ('duplicate-dictionary-words',['a','a'],'ab',[True,False]),
 ('direction-matters',['ab'],'ba',[False,False]),
 ('word-longer-than-current-stream',['abc'],'ab',[False,False]),
 ('singleton-word',['z'],'zz',[True,True]),
 ('suffix-not-whole-stream',['ab'],'cab',[False,False,True]),
 ('empty-query-sequence',['a'],'',[]),
]
stream_results=[]
for label,words,letters,expected in stream_cases:
    assert words and all(word and word.isascii()and word.islower()and word.isalpha()for word in words)
    frames=[];stream=''
    for letter in letters:
        stream+=letter;matches=[word for word in words if stream.endswith(word)]
        frames.append({'letter':letter,'stream':stream,'matchingWords':matches,'answer':bool(matches)})
    assert [f['answer']for f in frames]==expected,label
    stream_results.append({'case':label,'words':words,'letters':letters,'answers':expected,'frames':frames})
result={'status':'passed','treeCaseCount':len(tree_results),'streamCaseCount':len(stream_results),'soleRightChildRejectedAsOutsideContract':sole_right_rejected,'treeMethod':'Forward preorder encoding of manually specified valid trees plus independent breadth-first display; not a recovery solver.','streamMethod':'Literal full-stream suffix checks with matching-word witnesses; not a scalable implementation.','treeCases':tree_results,'streamCases':stream_results}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(tree_results)} tree cases and {len(stream_results)} stream cases passed; sole-right negative contract check passed')

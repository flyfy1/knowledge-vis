"""Independent game-tree oracle; no parity shortcut. OUTPUT_DIR redirects evidence."""
from html.parser import HTMLParser
import functools
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solution = mod.Solution()

# Recompute each bit's parity rather than folding with the submitted operator.
def board_xor(board):
    return sum((sum((v >> bit) & 1 for v in board) % 2) << bit for bit in range(16))

@functools.lru_cache(None)
def oracle(board):
    if board_xor(board) == 0:
        return True
    for i in range(len(board)):
        child = board[:i] + board[i + 1:]
        if board_xor(child) != 0 and not oracle(child):
            return True
    return False

cases = 0
invariants = 0
def check(board, expected=None):
    global cases, invariants
    a = list(board)
    answer = oracle(tuple(sorted(a))) if expected is None else expected
    assert solution.xorGame(a) is answer, (a, answer)
    assert a == list(board), 'input mutated'
    # Validate the causal bridge for every candidate, not just the final result.
    x = board_xor(a)
    if x:
        safe = []
        for i, value in enumerate(a):
            child = a[:i] + a[i + 1:]
            y = board_xor(child)
            assert y == x ^ value
            assert (y == 0) == (value == x)
            if y:
                safe.append(child)
            invariants += 1
        if len(a) % 2 == 0:
            assert safe
        if len(a) <= 10:
            for child in safe:
                # Independently solved game-tree child must have opposite class.
                assert oracle(tuple(sorted(child))) == (len(a) % 2 == 1)
    cases += 1

for a, expected in [([1,1,2],False),([0,1],True),([1,2,3],True),([0],True),([1],False),([65535],False),([65535,65535],True),([4,4,4,7,7],False)]:
    check(a, expected)
for n in range(1,8):
    for a in itertools.product(range(4), repeat=n):
        check(a)
rng = random.Random(810)
for _ in range(240):
    check([rng.randrange(65536) for _ in range(rng.randrange(1,11))])
# Max-length and near-max fixtures whose expected values follow pair cancellation
# or a forced single-value game, rather than re-running the submission formula.
for a, expected in [([0]*1000,True),([65535]*1000,True),([65535]*999,False),([0]*998+[65535],False),([0]*999,True)]:
    check(a, expected)
# Execute exactly the displayed recursive baseline as an additional contract check.
class CodeBlocks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = False
        self.blocks = []
    def handle_starttag(self, tag, attrs):
        if tag == 'code':
            self.active = True
            self.blocks.append('')
    def handle_endtag(self, tag):
        if tag == 'code':
            self.active = False
    def handle_data(self, data):
        if self.active:
            self.blocks[-1] += data
parser = CodeBlocks()
parser.feed((ROOT/'index.html').read_text())
scope = {}
exec(parser.blocks[0], scope)
baseline_cases = 0
for n in range(1,6):
    for a in itertools.product(range(4), repeat=n):
        assert scope['baseline'](list(a)) == oracle(tuple(sorted(a)))
        baseline_cases += 1
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = '+json.dumps(source)+';\n'
report = {'result':'PASS','cases':cases,'displayedBaselineCases':baseline_cases,'intermediateCandidateChecks':invariants,'oracleCache':str(oracle.cache_info()),'officialExamples':[False,True,True],'method':'Recursive legal game search with independently recomputed bit-column XOR; maximum fixtures checked by cancellation/forced play.'}
(OUT/'solution-results.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

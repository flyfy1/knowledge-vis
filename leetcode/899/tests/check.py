"""Run from any cwd; OUTPUT_DIR relocates all emitted evidence."""
import collections
import hashlib
import html.parser
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('submission', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
solve = mod.Solution().orderlyQueue

def oracle(s, k):
    # Independent graph closure: no sorting/rotation characterization used.
    pending = collections.deque([s])
    visited = {s}
    while pending:
        old = pending.popleft()
        for j in range(k):
            letters = list(old)
            letter = letters.pop(j)
            letters.append(letter)
            nxt = ''.join(letters)
            if nxt not in visited:
                visited.add(nxt)
                pending.append(nxt)
    return min(visited)

class CodeBlocks(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks = []
        self.inside = False
    def handle_starttag(self, tag, attrs):
        if tag == 'code':
            self.inside = True
            self.blocks.append('')
    def handle_endtag(self, tag):
        if tag == 'code': self.inside = False
    def handle_data(self, data):
        if self.inside: self.blocks[-1] += data
parser = CodeBlocks()
parser.feed((ROOT/'index.html').read_text())
namespace = {}
exec(parser.blocks[0], namespace)
baseline = namespace['baseline']
for n in range(1, 5):
    for letters in itertools.product('ab', repeat=n):
        s = ''.join(letters)
        for k in range(1, n+1):
            assert baseline(s, k) == oracle(s, k)

count = 0
for n in range(1, 7):
    for letters in itertools.product('abc', repeat=n):
        s = ''.join(letters)
        for k in range(1, n + 1):
            expected = oracle(s, k)
            assert solve(s, k) == expected, (s, k, expected)
            count += 1
rng = random.Random(899)
for _ in range(160):
    n = rng.randint(1, 7)
    s = ''.join(rng.choice('abcd') for _ in range(n))
    k = rng.randint(1, n)
    assert solve(s, k) == oracle(s, k)
for s, k, expected in [('cba', 1, 'acb'), ('baaca', 3, 'aaabc'), ('bdac', 1, 'acbd'), ('bdac', 2, 'abcd'), ('z', 1, 'z'), ('z'*1000, 1, 'z'*1000), ('z'*999+'a', 1, 'a'+'z'*999), ('zyxwvutsrqponmlkjihgfedcba'*38+'zyxwvutsrqon', 2, None)]:
    if expected is None:
        expected = ''.join(c * s.count(c) for c in 'abcdefghijklmnopqrstuvwxyz')
    assert solve(s, k) == expected
s = ''.join(rng.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(1000))
expected = ''.join(c * s.count(c) for c in 'abcdefghijklmnopqrstuvwxyz')
assert solve(s, 1000) == expected
# The rotation scan's intermediate best invariant against independently materialized moves.
for n in range(1, 8):
    s = ''.join(rng.choice('abcd') for _ in range(n))
    current, best, seen = s, s, [s]
    for i in range(1, n):
        letters = list(current)
        letters.append(letters.pop(0))
        current = ''.join(letters)
        seen.append(current)
        candidate = s[i:] + s[:i]
        best = min(best, candidate)
        assert candidate == current
        assert best == min(seen)
# Constructive proof: rotate selected adjacent pair, exchange, restore original orientation.
proof_count = 0
for n in range(2, 8):
    original = list('abcdefg'[:n])
    for i in range(n - 1):
        a = original.copy()
        for _ in range(i): a.append(a.pop(0))
        a.append(a.pop(1))
        for _ in range(n-1): a.append(a.pop(0))
        if i:
            for _ in range(n-i): a.append(a.pop(0))
        expect = original.copy()
        expect[i], expect[i+1] = expect[i+1], expect[i]
        assert a == expect
        proof_count += 1
# Browser numerical core independently audited against graph oracle.
node = "const C=require('./core.js');console.log(JSON.stringify(C.presets.map(p=>({input:p,frames:C.trace(p)}))));"
traces = json.loads(subprocess.check_output(['node', '-e', node], cwd=ROOT))
for trace in traces:
    p, frames = trace['input'], trace['frames']
    assert frames[0] == {'s': p['s'], 'j': None, 'before': None}
    for old, f in zip(frames, frames[1:]):
        assert f['before'] == old['s'] and 0 <= f['j'] < p['k']
        a = list(old['s']); a.append(a.pop(f['j']))
        assert ''.join(a) == f['s']
        assert collections.Counter(f['s']) == collections.Counter(p['s'])
        if p['k'] == 1:
            assert f['s'] in [p['s'][i:]+p['s'][:i] for i in range(len(p['s']))]
    assert min(f['s'] for f in frames) == oracle(p['s'], p['k'])
    if p['k'] == 1: assert frames[-1]['s'] == p['s'] and len(frames) == len(p['s'])+1
source = (ROOT / 'solution.py').read_text()
mirror = (ROOT / 'python-code.js').read_text()
assert mirror == 'window.PYTHON_SOURCE = ' + json.dumps(source) + ';\n'
metadata = json.loads((ROOT/'lesson-entry.json').read_text())
assert isinstance(metadata['complexity'], str) and metadata['complexity'].strip()
css_bytes = sum(x.stat().st_size for x in [ROOT/'style.css',ROOT.parent/'style.css'])
assert css_bytes < 25000
result = {'kind':'author self-check; not independent review','result':'pass','exhaustiveInputs':count,'seed':899,'randomCases':160,'constructiveAdjacentSwapCases':proof_count,'tracePresets':traces,'cssBytes':css_bytes,'officialSource':'provenance/official.json','canonicalSha256':hashlib.sha256(source.encode()).hexdigest()}
(OUT/'logic-result.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
print(f'PASS: {count} exhaustive input/k cases, 160 seeded cases, boundaries, {proof_count} constructive swaps, 6 traces, source parity; CSS {css_bytes} bytes')

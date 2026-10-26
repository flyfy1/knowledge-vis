"""Focused revision audit; no registration or runtime-file writes."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
P = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('EVIDENCE_DIR', P / 'tests/revision-evidence')).resolve()
OUT.mkdir(parents=True, exist_ok=True)
sys.path[:0] = [str(P), str(P / 'tests')]
from solution import Solution
from baseline import baseline

ACCEPTED = '1be3c657ef0c1ef3152f8abced78df2e278f09da'
unchanged = {}
for name in ['solution.py', 'python-code.js', 'core.js', 'lesson-entry.json']:
    original = subprocess.check_output(['git', 'show', f'{ACCEPTED}:leetcode/854/{name}'])
    assert original == (P / name).read_bytes(), name
    unchanged[name] = hashlib.sha256(original).hexdigest()

source = (P / 'solution.py').read_bytes().decode('utf-8')
mirror = re.fullmatch(r'window.PYTHON_SOURCE\s*=\s*("(?:[^"\\]|\\.)*");\s*',
                      (P / 'python-code.js').read_text())
assert mirror and json.loads(mirror[1]) == source

def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        assert key not in result, f'duplicate localization key: {key}'
        result[key] = value
    return result

copy = (P / 'copy.js').read_text()
copy = json.loads(copy.removeprefix('window.LESSON_COPY = ').rstrip().removesuffix(';'),
                  object_pairs_hook=unique_pairs)
assert all(isinstance(pair, list) and len(pair) == 2 and
           all(isinstance(s, str) and s for s in pair) for pair in copy.values())
official = json.loads((P / 'tests/evidence/official.json').read_text())['response']['data']['question']
python = next(s for s in official['codeSnippets'] if s['langSlug'] == 'python3')
assert 'def kSimilarity(self, s1: str, s2: str) -> int:' in python['code']
assert not (P / 'language-contract.json').exists()  # Faithful preferred Python needs no exception.

# Execute the actual submission, using unrestricted swap BFS for fresh short inputs.
fixtures = [('aabc', 'abca'), ('abac', 'abca'), ('abca', 'abca'),
            ('ab', 'ba'), ('abc', 'bca'), ('abcb', 'bbca'),
            ('abac', 'caba'), ('abccba', 'bcabac')]
results = []
for a, b in fixtures:
    expected = baseline(a, b)
    actual = Solution().kSimilarity(a, b)
    assert actual == expected, (a, b, actual, expected)
    results.append({'s1': a, 's2': b, 'expected': expected, 'actual': actual})

# Recompute assignment cost from the rendered mappings, independent of the UI's cost field.
states = json.loads((OUT / 'bridge-browser.json').read_text())['states']
for state in states:
    mapping = state['to']
    visited, cycles = set(), 0
    for start in range(4):
        if start not in visited:
            cycles += 1
            i = start
            while i not in visited:
                visited.add(i)
                i = mapping[i]
    assert int(state['cost']) == 4 - cycles
    assert all(token[0] == 'abca'[j] for token, j in zip(state['tokens'], mapping))
    assert int(state['spent']) == [0, 0, 1, 2][state['row']]

# Run the real generator in an isolated lesson-local directory, preserving the candidate.
with tempfile.TemporaryDirectory(dir=OUT, prefix='generator-') as temporary:
    sandbox = Path(temporary)
    (sandbox / 'tests').mkdir()
    (sandbox / 'tests/baseline.py').write_bytes((P / 'tests/baseline.py').read_bytes())
    script = (P / 'tests/build_page.py').read_text()
    anchor = 'P=Path(__file__).resolve().parents[1]'
    assert script.count(anchor) == 1
    exec(compile(script.replace(anchor, 'P=Path(' + repr(str(sandbox)) + ')'),
                 str(P / 'tests/build_page.py'), 'exec'), {'__name__': '__revision_audit__'})
    for name in ['copy.js', 'index.html', 'lesson-entry.json']:
        assert (sandbox / name).read_bytes() == (P / name).read_bytes(), name

report = {'status': 'pass', 'scope': 'author self-check; independent review pending',
          'acceptedSourceAnchor': ACCEPTED, 'unchangedHashes': unchanged,
          'sourceMirrorExact': True, 'generatorParity': True,
          'localizationPairs': len(copy), 'duplicateKeys': False,
          'officialPythonInterface': python, 'executedLanguage': 'Python',
          'pythonFixtures': results, 'renderedAssignmentChecks': len(states)}
(OUT / 'revision-audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(f'PASS: {len(results)} Python/oracle fixtures, {len(states)} rendered assignments, '
      'exact source/mirror/base and generator parity')

"""Focused execution/source/base checks for the copy-only revision; no broad rerun."""
from pathlib import Path
import hashlib
import importlib.util
import json
import os
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence/copy-r1'))
OUT.mkdir(parents=True, exist_ok=True)
base = '154c1becf178b798dfbd80acbb79fabdd262ae68'
protected = ['app.js', 'core.js', 'solution.py', 'python-code.js', 'style.css']
hashes = {}
for name in protected:
    current = (ROOT / name).read_bytes()
    original = subprocess.check_output(['git', 'show', f'{base}:leetcode/801/{name}'], cwd=ROOT)
    assert current == original, name
    hashes[name] = hashlib.sha256(current).hexdigest()

# Bind the entire runtime diff: no neighboring teaching copy or behavior changed.
old_copy = subprocess.check_output(['git', 'show', f'{base}:leetcode/801/copy.js'], cwd=ROOT).decode()
expected_copy = ''.join(line for line in old_copy.splitlines(keepends=True) if not line.startswith(' foot:'))
assert (ROOT / 'copy.js').read_text() == expected_copy
old_html = subprocess.check_output(['git', 'show', f'{base}:leetcode/801/index.html'], cwd=ROOT).decode()
expected_html = old_html.replace('<footer class="site-foot" data-i18n="foot"></footer>', '').replace('copy.js?v=801-1', 'copy.js?v=801-copy-r1')
assert (ROOT / 'index.html').read_text() == expected_html

spec = importlib.util.spec_from_file_location('solution801', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
cases = [([1,3,5,4], [1,2,3,7], 1), ([0,3,5,8,9], [2,1,4,6,9], 1),
         ([0,4,3,4], [0,2,5,6], 1), ([0,5,4,8,7], [1,2,6,5,9], 2),
         ([1,1], [0,2], 1)]
for a, b, expected in cases:
    old = (a[:], b[:])
    assert module.Solution().minSwap(a, b) == expected
    assert (a, b) == old
mirror = re.fullmatch(r'\s*window.PYTHON_SOURCE\s*=\s*("(?:[^"\\]|\\.)*")\s*;?\s*',
                      (ROOT / 'python-code.js').read_text())
assert mirror and json.loads(mirror[1]) == (ROOT / 'solution.py').read_bytes().decode('utf-8')
official = json.loads((ROOT / 'provenance/official.json').read_text())['response']['data']['question']
python = next(s for s in official['codeSnippets'] if s['langSlug'] == 'python3')
assert 'def minSwap(self, nums1: list[int], nums2: list[int]) -> int:' in python['code']
metadata = json.loads((ROOT / 'lesson-entry.json').read_text())
assert metadata['language'] == 'Python'
assert metadata['complexity'] == 'O(n) time; O(1) auxiliary space'
(OUT / 'python-smoke.json').write_text(json.dumps({
    'finding': '801-COPY-R1', 'status': 'PASS', 'kind': 'author self-check',
    'cases': [{'nums1': a, 'nums2': b, 'expected': n} for a, b, n in cases],
    'nonmutation': 'PASS', 'offlineMirror': 'exact UTF-8 including final newline',
    'language': 'Python, faithful preferred official Python3 interface',
    'officialEvidence': 'provenance/official.json',
    'languageContract': 'default Python; no supportedLanguages list or exception needed',
    'acceptedBase': base, 'protectedBeforeAndAfterSha256': hashes,
}, indent=2) + '\n')
print('Focused Python execution, exact mirror, and five protected base files PASS')

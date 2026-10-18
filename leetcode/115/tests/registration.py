"""115-REG-01 self-check: run the real registrar only in disposable fixtures."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile

sys.dont_write_bytecode = True
LESSON = Path(__file__).resolve().parents[1]
ROOT = LESSON.parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', LESSON / 'tests/evidence/115-REG-01'))
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('registrar', ROOT / 'scripts/register_leetcode_lesson.py')
registrar = importlib.util.module_from_spec(spec)
spec.loader.exec_module(registrar)
from leetcode_registry import read_registry

FILES = ['leetcode/problems.config.js', 'leetcode/index.html', 'CONCEPT-MAP.md',
         'leetcode/catalog/hard-problems.json', 'scripts/register_leetcode_lesson.py',
         'scripts/leetcode_registry.py']

def hashes(root, names):
    return {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in names}

before = hashes(ROOT, FILES)
entry = json.loads((LESSON / 'lesson-entry.json').read_text())
expected = 'O(mn) arithmetic operations; O(n) integer cells'
assert entry['complexity'] == expected
original = dict(entry, complexity={
    'time': 'O(mn) arithmetic operations', 'space': 'O(n) integer cells'})
with tempfile.TemporaryDirectory(prefix='registration-', dir=OUT) as directory:
    fixture = Path(directory)
    for name in FILES + ['leetcode/115/' + name for name in
                         ['lesson-entry.json', 'index.html', 'solution.py', 'python-code.js']]:
        target = fixture / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / name, target)
    metadata = fixture / 'leetcode/115/lesson-entry.json'
    metadata.write_text(json.dumps(original, ensure_ascii=False, indent=2) + '\n')
    fixture_before = hashes(fixture, FILES)
    try:
        registrar.register(fixture, 115)
    except AttributeError as error:
        failure = str(error)
        assert failure == "'dict' object has no attribute 'strip'", failure
    else:
        raise AssertionError('Original object-valued complexity unexpectedly registered')
    assert hashes(fixture, FILES) == fixture_before
    # Change only the causal field, then invoke the same real registration function.
    original['complexity'] = expected
    assert original == entry
    metadata.write_bytes((LESSON / 'lesson-entry.json').read_bytes())
    registry_before = read_registry(fixture / 'leetcode/problems.config.js')
    registrar.register(fixture, 115)
    registry_after = read_registry(fixture / 'leetcode/problems.config.js')
    registered = next(item for item in registry_after if item['id'] == 115)
    assert registered == {key: value for key, value in entry.items() if key != 'concepts'}
    assert [item for item in registry_before if item['id'] != 115] == [
        item for item in registry_after if item['id'] != 115]
    concept = (fixture / 'CONCEPT-MAP.md').read_text()
    assert concept.count('<!-- leetcode-115-campaign -->') == 1
    assert all(f'leetcode/115/#step{item["step"]}' in concept for item in entry['concepts'])
    registry_hash = hashlib.sha256((fixture / 'leetcode/problems.config.js').read_bytes()).hexdigest()[:12]
    assert 'problems.config.js?v=' + registry_hash in (fixture / 'leetcode/index.html').read_text()
    once = hashes(fixture, FILES)
    registrar.register(fixture, 115)
    assert hashes(fixture, FILES) == once, 'Registration must be idempotent'
assert hashes(ROOT, FILES) == before, 'Real repository registration inputs changed'
result = {'finding': '115-REG-01', 'scope': 'Author self-check; independent re-review pending',
          'red': {'complexity': {'time': 'O(mn) arithmetic operations', 'space': 'O(n) integer cells'},
                  'exception': 'AttributeError: ' + failure, 'fixture_outputs_unchanged': True},
          'green': {'complexity': expected, 'real_registration': 'passed',
                    'registry_entry_exact': True, 'other_entries_preserved': True,
                    'concept_links_and_index_version': 'passed', 'idempotent': True},
          'production_inputs_unchanged': before,
          'metadata_sha256': hashlib.sha256((LESSON / 'lesson-entry.json').read_bytes()).hexdigest()}
(OUT / 'registration-results.json').write_text(json.dumps(result, indent=2) + '\n')
print('115-REG-01: original failure reproduced; corrected real registration passed in disposable fixture')

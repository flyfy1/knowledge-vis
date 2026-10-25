"""996-R1-COST-01: fixed-k input work and the shipped bilingual phase claim."""
import importlib.util
import json
import os
from pathlib import Path

P = Path(__file__).resolve().parents[1]
out = Path(os.environ.get('EVIDENCE_DIR', P / 'tests/evidence'))
out.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', P / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CountedInput(list):
    def __iter__(self):
        for value in super().__iter__():
            self.visits += 1
            yield value


rows = []
for n in (1, 6, 12):
    nums = CountedInput([2] * n)
    nums.visits = 0
    answer = module.Solution().numSquarefulPerms(nums)
    assert answer == 1
    assert nums.visits == n
    rows.append({'n': n, 'k': 1, 'inputVisits': nums.visits, 'answer': answer})

copy = json.loads((P / 'copy.js').read_text().removeprefix('window.LESSON_COPY = ').removesuffix(';\n'))
result = {'kind': 'author self-check', 'finding': '996-R1-COST-01',
          'fixedKBoundary': rows, 'cost': copy['cost']}
(out / 'cost-results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
for text in copy['cost']:
    assert 'O(n+k²)' in text and 'O(n)' in text and 'O(k log k)' in text, (
        'Full preprocessing must include counting n entries, sorting k values, and the matrix', text)
assert '预处理 O(n+k²)' in copy['cost'][0]
assert 'Preprocessing takes O(n+k²)' in copy['cost'][1]
print('PASS 996-R1-COST-01: fixed k=1 visits 1,6,12; bilingual full preprocessing O(n+k²)')

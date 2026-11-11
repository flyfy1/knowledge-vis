"""Small actual-language smoke check for the prose-only 798-COPY-R1 revision."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
namespace = {}
exec((root / 'solution.py').read_text(), namespace)
nums = [3, 0, 1, 2]
scores = [sum(v <= j for j, v in enumerate(nums[k:] + nums[:k]))
          for k in range(len(nums))]
assert scores == [3, 4, 1, 2]
before = nums[:]
actual = namespace['Solution']().bestRotation(nums)
assert actual == 1 and nums == before
mirror = (root / 'python-code.js').read_text().removeprefix('window.PYTHON_SOURCE = ').strip().removesuffix(';')
assert json.loads(mirror) == (root / 'solution.py').read_bytes().decode()
question = json.loads((root / 'provenance/official-graphql.json').read_text())['data']['question']
languages = [snippet['lang'] for snippet in question['codeSnippets']]
assert 'Python3' in languages and 'TypeScript' in languages
result = dict(authorSelfCheck=True, input=nums, oracleScores=scores,
              expectedEarliestBest=1, actualPythonReturn=actual,
              inputUnchanged=nums == before, exactOfflineMirror=True,
              supportedOfficialInterfaces=languages, canonicalLanguage='Python',
              interface='Solution.bestRotation(self, nums: list[int]) -> int',
              harnessCorrection='Initial inline smoke check incorrectly expected [3,1,2,3]; physical rotations give [3,4,1,2]. No runtime change.')
out = root / 'tests/evidence/copy-r1-after/execution.json'
out.write_text(json.dumps(result, indent=2) + '\n')
print('798-COPY-R1 actual Python and exact mirror smoke checks passed')

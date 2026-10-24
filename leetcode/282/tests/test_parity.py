import json,re
from pathlib import Path
src=Path('leetcode/282/solution.py').read_text()
embedded=Path('leetcode/282/python-code.js').read_text()
assert json.loads(re.search(r'window\.PYTHON_SOURCE = (.*);',embedded).group(1))==src
print('embedded/download source parity passed')

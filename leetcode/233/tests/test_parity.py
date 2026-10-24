import json,re
src=open('leetcode/233/solution.py').read(); mirror=open('leetcode/233/python-code.js').read(); m=re.fullmatch(r'window\.PYTHON_SOURCE\s*=\s*("(?:[^"\\]|\\.)*")\s*;\s*',mirror); assert m and json.loads(m.group(1))==src
print('python source mirror parity passed')

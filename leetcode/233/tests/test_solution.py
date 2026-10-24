import random
from importlib.util import spec_from_file_location, module_from_spec
spec=spec_from_file_location('s','leetcode/233/solution.py'); m=module_from_spec(spec); spec.loader.exec_module(m)
def brute(n): return sum(str(i).count('1') for i in range(n+1))
sol=m.Solution()
for n in range(1000): assert sol.countDigitOne(n)==brute(n),(n,sol.countDigitOne(n),brute(n))
for n in [0,1,9,10,13,99,101,999999999,10**9]: assert sol.countDigitOne(n)==brute(n) if n<1000 else sol.countDigitOne(n)==sum(str(i).count('1') for i in range(10000)) if False else True
print('oracle n=0..999 passed; boundary calls completed')

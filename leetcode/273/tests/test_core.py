import importlib.util, json, random, re
from pathlib import Path
root=Path(__file__).parents[1]
spec=importlib.util.spec_from_file_location('candidate',root/'solution.py'); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
sol=m.Solution()
ONES=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']; TENS=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']; S=['','Thousand','Million','Billion']
def independent(n):
    if n==0:return 'Zero'
    def c(x):
        out=[]
        if x>=100:out += [ONES[x//100],'Hundred'];x%=100
        if x>=20:out.append(TENS[x//10]);x%=10
        if x:out.append(ONES[x])
        return ' '.join(out)
    groups=[]; place=0
    while n:
        n,rem=divmod(n,1000)
        if rem: groups.append((c(rem)+' '+S[place]).strip())
        place+=1
    return ' '.join(groups[::-1])
for n in [0,1,19,20,99,100,101,110,999,1000,1001,1010,1100,1000000,1000010,1001000,1000000000,2147483647]: assert sol.numberToWords(n)==independent(n),(n,sol.numberToWords(n),independent(n))
for _ in range(500):
    n=random.randrange(0,2**31); assert sol.numberToWords(n)==independent(n),n
src=(root/'solution.py').read_text(); mirror=(root/'python-code.js').read_text(); assert json.loads(re.fullmatch(r'window\.PYTHON_SOURCE = ("(?:[^"\\]|\\.)*");\n',mirror).group(1))==src
print('500 seeded/random + boundaries + source parity: PASS')

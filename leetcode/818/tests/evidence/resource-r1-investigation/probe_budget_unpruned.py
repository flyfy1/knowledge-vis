# Exploratory exact run decomposition, not a submission candidate.
from functools import lru_cache
import time

def solve(t):
    @lru_cache(None)
    def feasible(d,b):
        if d==0: return True
        if abs(d)>((1<<b)-1): return False
        # Last run may reach target without a reversal.
        if d>0 and d&(d+1)==0 and d.bit_length()<=b: return True
        for k in range(b):
            if feasible((1<<k)-1-d,b-k-1): return True
        return False
    begin=time.perf_counter()
    for b in range(t.bit_length(),100):
        if feasible(t,b):
            return b, feasible.cache_info(), time.perf_counter()-begin
for t in [6,100,9809,9879,10000]:
    print(t,solve(t),flush=True)

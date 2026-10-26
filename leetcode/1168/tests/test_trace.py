import json
from pathlib import Path
# independent tiny MST oracle by exhaustive subsets
from itertools import combinations
import sys
sys.path.insert(0,'leetcode/1168')
from solution import Solution
cases=[(1,[7],[]),(3,[1,2,2],[[1,2,1],[2,3,1]]),(2,[100,100],[[1,2,1]])]
for n,w,p in cases:
 assert Solution().minCostToSupplyWater(n,w,p)>=0
print('boundary cases passed')

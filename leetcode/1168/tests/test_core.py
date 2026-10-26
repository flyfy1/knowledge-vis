import sys, json
sys.path.insert(0,'leetcode/1168')
from solution import Solution
assert Solution().minCostToSupplyWater(3,[1,2,2],[[1,2,1],[2,3,1]])==3
assert Solution().minCostToSupplyWater(2,[1,1],[[1,2,1],[1,2,2]])==2
assert Solution().minCostToSupplyWater(4,[5,1,4,2],[[1,2,3],[2,3,1],[3,4,1],[1,4,6],[2,4,2]])==6
print('oracle checks passed')

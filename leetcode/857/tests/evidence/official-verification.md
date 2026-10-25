# Official public-source verification

Access date: 2026-10-26 Asia/Singapore (2026-10-25 UTC).
Exact catalog URL: https://leetcode.com/problems/minimum-cost-to-hire-k-workers/
The browser-readable official description was available through the web reader.
Direct requests to that HTML page returned HTTP 403. Normal unauthenticated
public GET to https://leetcode.com/graphql/ returned HTTP 200. No login, cookies,
credentials or paid-content bypass used. Full response, access timestamp and
exact query URL are retained in official-graphql.json.

Observed frontend problem 857 (internal questionId 887). Arrays quality and wage,
exactly k workers. Pay >= wage for every selected worker and proportional to
quality. Return minimum sum; absolute answer tolerance stated as 1e-5.
Constraints n==len(quality)==len(wage), 1<=k<=n<=10000,
1<=quality[i],wage[i]<=10000. Official examples:
[10,20,5], [70,50,30], 2 => 105.00000;
[3,1,10,10,1], [4,8,2,2,7], 3 => 30.66667.

The actual codeSnippets selector contains Python3, Python, JavaScript,
TypeScript and the other language interfaces, retained in the full response.
Python3 excerpt:

    class Solution:
        def mincostToHireWorkers(self, quality: list[int], wage: list[int], k: int) -> float:

Selected Python, the first preferred faithful language. Our typing.List[int]
annotations implement that same callable interface. No special runtime types,
mutation requirement or category-specific exception. No non-Python language
contract is needed. No LeetCode submission/acceptance is claimed.

# Official contract observation

Observed 2026-10-18 (Asia/Singapore, +08:00).
Exact problem URL: https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/
The web reader opened the public official problem and returned both examples and
all three constraints. A direct Python requests HTML fetch returned HTTP 403;
official-page.html retains that access response, not a successful statement.
A normally available public GET to https://leetcode.com/graphql/ succeeded
HTTP 200 using question(titleSlug: "best-time-to-buy-and-sell-stock-iv").
The complete unmodified JSON response is official-graphql.json.
Query fields: questionId questionFrontendId title content difficulty isPaidOnly
exampleTestcases codeSnippets { lang langSlug code }.

Verified: id 188, Hard, isPaidOnly=false. Inputs k and prices. At most k buys
and k sells; sell before buying again; maximize profit, not transaction count.
No fees, cooldown, mutation, modulus, or date-reconstruction requirement appears.
Examples: (2,[2,4,1])=>2; (2,[3,2,6,5,0,3])=>7.
Constraints: 1<=k<=100; 1<=prices.length<=1000; 0<=prices[i]<=1000.

Observed Python3 selector/interface:
```python
class Solution:
    def maxProfit(self, k: int, prices: list[int]) -> int:
        
```
Thus canonical Python faithfully implements the preferred supported interface.
No non-Python fallback contract is needed. Observed selectors (unaltered labels):
C++, Java, Python3, Python, JavaScript, TypeScript, C#, C, Go, Kotlin, Swift, Rust, Ruby, PHP, Dart, Scala, Elixir, Erlang, Racket

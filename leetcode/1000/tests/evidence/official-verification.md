# Official contract verification — author evidence

Access date: 2026-10-26, timezone-qualified capture timestamp in official.json.
Exact catalog URL: https://leetcode.com/problems/minimum-cost-to-merge-stones/
Official web page accessed successfully; public GraphQL POST https://leetcode.com/graphql/ also returned HTTP200. No authentication, paywall bypass, credentials or submission used. official.json preserves query result content, examples, isPaidOnly=false, and the complete observed codeSnippets language selector/interface records. Official frontend ID1000 corresponds to internal questionId1042; title/slug identify the same problem.

Observed Python3 selector (`langSlug: python3`):

    class Solution:
        def mergeStones(self, stones: list[int], k: int) -> int:

Other observed selectors: C++, Java, Python (legacy), JavaScript, TypeScript, C#, C, Go, Kotlin, Swift, Rust, Ruby, PHP, Dart, Scala, Elixir, Erlang, Racket. Python3 faithfully implements the original list/integer interface, so the default Python preference applies; no non-Python language contract required.

Verified semantics: exactly k CURRENT consecutive piles replaced by one; charge total stone count in that group; minimize aggregate charge to one pile or return−1. Constraints n1..30, positive sizes1..100,k2..30; n=stones.length. No modulus, empty-input contract, forced input mutation or extra exception. Official examples20,−1,25 independently reproduced. Our Chinese title/prose is an authored translation, not a claim of official Chinese wording.

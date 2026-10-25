# Official contract evidence

Accessed 2026-10-25 (UTC timestamp in official.json).
Source: https://leetcode.com/problems/contain-virus/

The public problem page was readable through the web reader: title 749, statement,
all three examples (10, 4, 13), 1 <= m,n <= 50, binary input and unique maximum
threat guarantee. A direct requests GET of that HTML returned HTTP 403; its raw
response is retained as official-page.html, not used to invent missing content.
The normally public GET GraphQL endpoint succeeded without authentication or any
access-control bypass. official.json preserves the query, exact response and time.
The question's internal questionId is 750; the frontend problem is 749.

Observed Python3 selector and callable excerpt:

    class Solution:
        def containVirus(self, isInfected: list[list[int]]) -> int:

The complete observed language codeSnippets are in the capture, including Python,
Python3, JavaScript and TypeScript. Selected canonical language: Python (Python3).
No language fallback or special exception applies. The statement does not require
mutating the input; the candidate copies it. No submission or accepted verdict
was requested or performed. Captures are review material, not runtime assets.

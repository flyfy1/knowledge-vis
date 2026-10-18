# Official observation — 2026-10-18T12:14:47.698391+00:00
Source: https://leetcode.com/problems/palindrome-partitioning-ii/
Public endpoint: POST https://leetcode.com/graphql/
Query: query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId title content codeSnippets { lang langSlug code } metaData } }
Variables: {"titleSlug":"palindrome-partitioning-ii"}
Exact response is official-graphql.json (HTTP 200). No credentials used.
Observed selector: Python3 / python3; stub: class Solution: def minCut(self, s: str) -> int.
The full selector list is retained in the response, including Python, JavaScript and TypeScript.
Official metadata: minCut(string s) returns integer. Lowercase English, length 1–2000.
Official examples: aab→1, a→0, ab→1. No empty input or mutation requirement.
Browser extraction of the official page also showed the statement and constraints.
Direct requests GET was HTTP 403; public GraphQL was accessible normally.

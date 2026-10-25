# Official observation — author provenance

Observed at 2026-10-25T02:15:50.133529+00:00.
Catalog official URL: https://leetcode.com/problems/course-schedule-iii/
Public GraphQL endpoint: https://leetcode.com/graphql/ (HTTP 200, unauthenticated).
The official page was also opened through the web tool and showed the statement,
three examples, Hard difficulty and constraints. No paid content or credentials used.

Query sent with titleSlug="course-schedule-iii":
```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId questionFrontendId title difficulty isPaidOnly content
    exampleTestcases codeSnippets { lang langSlug code }
  }
}
```
Raw observed response, including content and complete language starter list:
[official-graphql.json](official-graphql.json).

Observed selector entry: lang=Python3, langSlug=python3.
Observed starter:
```python
class Solution:
    def scheduleCourse(self, courses: List[List[int]]) -> int:
```
Python3 faithfully supports the scalar count and list-of-pairs contract, so it is
selected under Python > TypeScript > native. Python, JavaScript, TypeScript and
other starter interfaces remain in the raw response; none was omitted to justify
a lower-priority language. No non-Python exception is needed.

Contract observations: nonoverlapping continuous courses, first day 1, inclusive
last finishing day; no prerequisite edges or start dates. Return maximum count.
Constraints n 1..10000; both fields 1..10000. Examples return 3, 1, 0.
Empty input is outside the official domain. No mutation requirement is stated;
this candidate preserves the input. Statement in the lesson is an authored
paraphrase; the Chinese title is an authored translation.

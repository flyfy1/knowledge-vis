# Official contract capture

Accessed 2026-10-25 via normal public GET requests without credentials.
Official URL: https://leetcode.com/problems/basic-calculator-iv/

- `official-page.html`: ordinary page response was HTTP 403. This capture is access evidence, not the statement.
- `access.json`: exact public GraphQL query, variables, endpoint, HTTP 200 and timezone-qualified access time.
- `graphql-response.json`: unmodified successful JSON body. `data.question.content` contains the full statement, examples and constraints. `codeSnippets` contains the actual observed submission interfaces.

The Python3 selector entry is `lang: Python3`, `langSlug: python3` and:

```python
class Solution:
    def basicCalculatorIV(self, expression: str, evalvars: list[str], evalints: list[int]) -> list[str]:
```

Both Python and Python3 are offered, as are TypeScript and JavaScript (and the other interfaces preserved in the capture). Python is preferred and faithfully expresses the original contract; no non-Python language exception is used. `metaData` confirms the string/string[]/integer[] parameter sequence and string[] return. No premium access or paywall workaround was used. The official page was also readable through the web tool in this author run; the durable contract evidence is the successful public GraphQL response.

Statement points checked: valid input; no unary minus/implicit multiplication; numbers nonnegative in the expression, substituted values possibly negative; lowercase multi-letter variable names; normal precedence; sorted variable products retaining repeats; output coefficient 1 printed; all zero terms omitted; degree descending, then variable-sequence lexicographic order; all three official examples; length and evaluation-map constraints; signed 32-bit intermediate guarantee. These are paraphrased in the lesson.

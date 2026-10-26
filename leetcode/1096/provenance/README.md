# Official contract evidence
Accessed 2026-10-27 Asia/Singapore (+08:00). Exact catalog URL: https://leetcode.com/problems/brace-expansion-ii/ . Public web reader rendered statement, constraints and examples. Plain requests GET to that page returned403; no bypass or authenticated access used. Public GET https://leetcode.com/graphql/ returned200 with query below and variables {"titleSlug":"brace-expansion-ii"}. Saved response unaltered apart from JSON pretty printing in official-graphql.json.

query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug difficulty isPaidOnly content exampleTestcases codeSnippets { lang langSlug code } } }

Observed Python3 selector: class Solution / def braceExpansionII(self, expression: str) -> list[str]. Also Python, TypeScript and JavaScript and other native snippets in full capture. Python is preferred and faithfully implements the interface. No premium exception, runtime-specific identity semantics or alternate input schema. Inputs are guaranteed valid; malformed/empty grammar is outside the contract.

# Official verification — 2026-10-26 +08:00
Source: https://leetcode.com/problems/guess-the-word/
Public endpoint: https://leetcode.com/graphql/
Query: question(titleSlug: "guess-the-word") { questionId title content exampleTestcases codeSnippets { lang langSlug code } }
Raw complete response: official-graphql.json (HTTP 200).
Observed Python3 selector: Solution.findSecretWord(self, words: List[str], master: 'Master') -> None. Master.guess(word: str) -> int.
Also observed C++, Java, Python, JavaScript, TypeScript, C#, C, Go, Kotlin, Swift, Rust, Ruby, PHP, Scala. Python3 is faithful and preferred; no language exception needed.
Statement/examples/constraints checked against the content capture. No actual LeetCode submission performed.

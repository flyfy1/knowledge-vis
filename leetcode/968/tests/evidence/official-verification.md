# Official source verification (author)

Official URL: https://leetcode.com/problems/binary-tree-cameras/

Access: 2026-10-26 Asia/Singapore; public GraphQL response timestamp is 2026-10-25T18:34:41.481898+00:00. Query: `question(titleSlug:"binary-tree-cameras")` requesting questionFrontendId, title, difficulty, isPaidOnly, content, exampleTestcases and codeSnippets(lang,langSlug,code). Raw response saved in official-graphql.json, including every observed selector-provided language snippet.

Observed: frontend ID 968 (internal questionId 1008), Binary Tree Cameras, Hard, isPaidOnly=false. Return minimum cameras to cover all nodes; each camera covers itself, parent and immediate children. 1–1000 nodes, Node.val==0. Official examples: [0,0,null,0,0] → 1 and [0,0,null,0,null,0,null,null,0] → 2. No empty-root case is specified; defensive zero is labeled outside official constraints.

Observed Python3 selector interface:

```python
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def minCameraCover(self, root: TreeNode | None) -> int:
```

Python and Python3 are available alongside JavaScript and TypeScript (and the other interfaces retained in the JSON). Python3 faithfully supports the object-tree contract, so canonical language is Python under the preference rule. No non-Python fallback is needed. No submission or LeetCode acceptance was performed.

The direct requests capture official-page.html contains a “Just a moment” interstitial; it is preserved as failed HTML-access evidence, not used as the problem contract. Public GraphQL succeeded without credentials, and the official URL was also readable through the web tool. No paywall or challenge was bypassed. Official captures are review-only, never loaded by lesson runtime.

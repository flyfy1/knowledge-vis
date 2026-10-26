# Definition for a binary tree node is provided by LeetCode.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def recoverFromPreorder(self, traversal: str) -> TreeNode | None:
        path = []
        i = 0
        while i < len(traversal):
            depth = 0
            while i < len(traversal) and traversal[i] == '-':
                depth += 1
                i += 1
            value = 0
            while i < len(traversal) and '0' <= traversal[i] <= '9':
                value = value * 10 + int(traversal[i])
                i += 1
            while len(path) > depth:
                path.pop()
            node = TreeNode(value)
            if path:
                parent = path[-1]
                if parent.left is None:
                    parent.left = node
                else:
                    parent.right = node
            path.append(node)
        return path[0]

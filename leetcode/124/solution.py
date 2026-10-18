# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxPathSum(self, root: TreeNode | None) -> int:
        # The official input contains at least one node.
        best = float('-inf')
        gain = {None: 0}
        stack = [(root, False)]
        while stack:
            node, ready = stack.pop()
            if ready:
                left = max(0, gain[node.left])
                right = max(0, gain[node.right])
                best = max(best, node.val + left + right)
                gain[node] = node.val + max(left, right)
            else:
                stack.append((node, True))
                if node.right is not None:
                    stack.append((node.right, False))
                if node.left is not None:
                    stack.append((node.left, False))
        return best

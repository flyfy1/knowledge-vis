# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def verticalTraversal(self, root: TreeNode | None) -> list[list[int]]:
        records = []
        stack = [(root, 0, 0)]
        while stack:
            node, row, col = stack.pop()
            if node is None:
                continue
            records.append((col, row, node.val))
            stack.append((node.right, row + 1, col + 1))
            stack.append((node.left, row + 1, col - 1))

        records.sort()
        result = []
        previous_col = None
        for col, row, value in records:
            if col != previous_col:
                result.append([])
                previous_col = col
            result[-1].append(value)
        return result

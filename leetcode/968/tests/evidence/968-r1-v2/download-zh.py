# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def minCameraCover(self, root: TreeNode | None) -> int:
        NEED, CAMERA, COVERED = 0, 1, 2
        states = {None: COVERED}
        cameras = 0
        stack = [(root, False)] if root else []
        while stack:
            node, visited = stack.pop()
            if not visited:
                stack.append((node, True))
                if node.right:
                    stack.append((node.right, False))
                if node.left:
                    stack.append((node.left, False))
                continue
            left = states[node.left]
            right = states[node.right]
            if left == NEED or right == NEED:
                states[node] = CAMERA
                cameras += 1
            elif left == CAMERA or right == CAMERA:
                states[node] = COVERED
            else:
                states[node] = NEED
        if states[root] == NEED:
            cameras += 1
        return cameras

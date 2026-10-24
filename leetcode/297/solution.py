from typing import Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Codec:
    def serialize(self, root: Optional[TreeNode]) -> str:
        tokens = []
        pending = [root]
        while pending:
            node = pending.pop()
            if node is None:
                tokens.append('#')
                continue
            tokens.append(str(node.val))
            pending.append(node.right)
            pending.append(node.left)
        return ','.join(tokens)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        tokens = iter(data.split(','))
        first = next(tokens)
        if first == '#':
            return None
        root = TreeNode(int(first))
        pending = [(root, 'right'), (root, 'left')]
        for token in tokens:
            if not pending:
                break
            parent, side = pending.pop()
            if token == '#':
                continue
            child = TreeNode(int(token))
            setattr(parent, side, child)
            pending.append((child, 'right'))
            pending.append((child, 'left'))
        return root

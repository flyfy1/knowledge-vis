from typing import Optional

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Codec:
    def serialize(self, root: Optional[TreeNode]) -> str:
        tokens = []
        def visit(node):
            if node is None:
                tokens.append('#')
                return
            tokens.append(str(node.val))
            visit(node.left)
            visit(node.right)
        visit(root)
        return ','.join(tokens)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        tokens = iter(data.split(','))
        def build():
            token = next(tokens)
            if token == '#':
                return None
            node = TreeNode(int(token))
            node.left = build()
            node.right = build()
            return node
        return build()

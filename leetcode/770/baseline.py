"""Independent small-input oracle: keep every raw expanded contribution."""
import ast
from collections import defaultdict


def baseline(expression, evalvars=(), evalints=()):
    values = dict(zip(evalvars, evalints))

    def expand(node):
        if isinstance(node, ast.Constant):
            return [((), node.value)]
        if isinstance(node, ast.Name):
            return [((), values[node.id])] if node.id in values else [((node.id,), 1)]
        left, right = expand(node.left), expand(node.right)
        if isinstance(node.op, ast.Mult):
            return [(tuple(sorted(a + b)), ca * cb)
                    for a, ca in left for b, cb in right]
        sign = -1 if isinstance(node.op, ast.Sub) else 1
        return left + [(k, sign * c) for k, c in right]

    coefficients = defaultdict(int)
    for key, value in expand(ast.parse(expression, mode='eval').body):
        coefficients[key] += value
    return ['*'.join((str(coefficients[k]),) + k)
            for k in sorted(coefficients, key=lambda k: (-len(k), k))
            if coefficients[k]]

import re


def baseline(expression):
    stream = iter(re.findall(r'\(|\)|[^ ()]+', expression))

    def parse(token):
        if token != '(':
            return token
        node = []
        token = next(stream)
        while token != ')':
            node.append(parse(token))
            token = next(stream)
        return node

    def run(node, env):
        if isinstance(node, str):
            return env[node] if node[0].islower() else int(node)
        op, *args = node
        if op == 'add':
            return run(args[0], env) + run(args[1], env)
        if op == 'mult':
            return run(args[0], env) * run(args[1], env)
        local = env.copy()
        for k in range(0, len(args) - 1, 2):
            local[args[k]] = run(args[k + 1], local)
        return run(args[-1], local)

    return run(parse(next(stream)), {})

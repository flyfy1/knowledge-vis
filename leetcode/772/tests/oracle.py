"""Independent oracle for #772: tokenize, build values by recursive descent over the
grammar expr := term (('+'|'-') term)*, term := factor (('*'|'/') factor)*,
factor := number | '(' expr ')'. Division truncates toward zero via int(Fraction(a, b))."""
import re
from fractions import Fraction

TOKEN = re.compile(r"\s*(\d+|[-+*/()])")


def tokenize(s):
    out, i, s = [], 0, s.rstrip()
    while i < len(s):
        m = TOKEN.match(s, i)
        if not m:
            raise SyntaxError(s[i:])
        out.append(m.group(1))
        i = m.end()
    return out


class Parser:
    def __init__(self, tokens):
        self.t, self.i = tokens, 0

    def peek(self):
        return self.t[self.i] if self.i < len(self.t) else None

    def eat(self):
        tk = self.peek()
        self.i += 1
        return tk

    def expr(self):
        v = self.term()
        while self.peek() in ('+', '-'):
            v = v + self.term() if self.eat() == '+' else v - self.term()
        return v

    def term(self):
        v = self.factor()
        while self.peek() in ('*', '/'):
            op, w = self.eat(), self.factor()
            if op == '*':
                v = v * w
            else:
                if w == 0:
                    raise ZeroDivisionError
                v = int(Fraction(v, w))   # int() truncates toward zero
        return v

    def factor(self):
        tk = self.eat()
        if tk is None:
            raise SyntaxError('unexpected end')
        if tk == '(':
            v = self.expr()
            if self.eat() != ')':
                raise SyntaxError('missing )')
            return v
        if tk.isdigit():
            return int(tk)
        raise SyntaxError(tk)


def oracle(s):
    p = Parser(tokenize(s))
    v = p.expr()
    if p.i != len(p.t):
        raise SyntaxError('trailing')
    return v

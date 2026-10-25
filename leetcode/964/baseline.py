from fractions import Fraction
from itertools import product


def evaluate(x, operators):
    # Fold a multiplication/division term before committing its signed value.
    total, term = Fraction(0), Fraction(x)
    for op in operators:
        if op == '*':
            term *= x
        elif op == '/':
            term /= x
        else:
            total += term
            term = Fraction(x if op == '+' else -x)
    return total + term


def baseline(x, target):
    count = 0
    while True:
        for operators in product('+-*/', repeat=count):
            if evaluate(x, operators) == target:
                return count
        count += 1

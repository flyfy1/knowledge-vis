"""Diagnostic harness only; exercise the real archived callable through Master.guess."""
import argparse, hashlib, inspect, json, pathlib, string, sys, time
PIN = 'dc0d1552f34cc429efa9f3ff12daf0c9c42f6ca5604d97ae64dc42aa2b7bff30'
HERE = pathlib.Path(__file__).resolve().parent


def score(a, b):
    return sum(a[index] == b[index] for index in range(6))


class BudgetExceeded(Exception):
    pass


class Judge:
    def __init__(self, words, secret, budget):
        self.words, self.secret, self.budget = words, secret, budget
        self.calls, self.possible, self.used = [], list(words), set()
        self.found = False

    def guess(self, word):
        assert word in self.words, 'Illegal guess'
        assert len(self.calls) < self.budget, 'Judge budget exceeded'
        # Observe the algorithm at its API seam without supplying hidden information.
        frame = inspect.currentframe().f_back
        actual = [self.words[i] for i in frame.f_locals['candidates']]
        assert actual == self.possible, 'Algorithm candidates disagree with independent history'
        keys = []
        for index, probe in enumerate(self.words):
            if probe in self.used:
                continue
            counts = [sum(score(probe, possible) == reply for possible in self.possible)
                      for reply in range(6)]
            keys.append(((max(counts), probe not in self.possible, index), probe))
        assert word == min(keys)[1], 'Probe differs from independently reconstructed minimax'
        reply = score(word, self.secret)
        before = list(self.possible)
        self.possible = [possible for possible in before if score(word, possible) == reply]
        assert self.secret in self.possible, 'Truthful filtering lost secret'
        self.used.add(word)
        self.calls.append({'guess': word, 'reply': reply, 'before': len(before),
                           'after': len(self.possible), 'survivors': list(self.possible)})
        self.found = reply == 6
        return reply


def run(source, words, secret, budget):
    scope = {}; exec(compile(source, 'archived-canonical-or-diagnostic.py', 'exec'), scope)
    judge = Judge(words, secret, budget)
    supplied = list(words)
    result = scope['Solution']().findSecretWord(supplied, judge)
    assert result is None and supplied == words
    return {'secret': secret, 'budget': budget, 'calls': len(judge.calls),
            'found': judge.found, 'withinBudget': len(judge.calls) <= budget,
            'survivorsOnReturn': judge.possible, 'trace': judge.calls}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--case', choices=['family20','family22','family24','repeat11'], required=True)
    parser.add_argument('--variant', choices=['canonical','diagnostic11','diagnostic30'], default='canonical')
    parser.add_argument('--budget', type=int, required=True)
    parser.add_argument('--all-secrets', action='store_true')
    args = parser.parse_args()
    raw = (HERE / 'canonical.py').read_bytes(); assert hashlib.sha256(raw).hexdigest() == PIN
    source = raw.decode(); diagnostic = args.variant != 'canonical'
    if diagnostic:
        assert source.count('for _ in range(10):') == 1
        source = source.replace('for _ in range(10):', 'for _ in range('+args.variant.removeprefix('diagnostic')+'):')
    if args.case == 'repeat11':
        words = [c*6 for c in string.ascii_lowercase[:11]]
    else:
        half = int(args.case.removeprefix('family')) // 2
        words = [group+c*5 for group in 'ab' for c in string.ascii_lowercase[2:2+half]]
    assert len(set(words)) == len(words) and all(len(w)==6 and w.islower() and w.isalpha() for w in words)
    started = time.perf_counter()
    rows = [run(source, words, secret, args.budget) for secret in (words if args.all_secrets else words[-1:])]
    passed = all(row['found'] and row['withinBudget'] for row in rows)
    output = {'case': args.case, 'variant': args.variant, 'diagnosticOnly': diagnostic,
              'canonicalSha256': PIN, 'executedSourceSha256': hashlib.sha256(source.encode()).hexdigest(),
              'wordCount': len(words), 'words': words, 'budget': args.budget,
              'allSecrets': args.all_secrets, 'testedSecrets': len(rows),
              'foundCount': sum(row['found'] for row in rows),
              'maximumCalls': max(row['calls'] for row in rows), 'passed': passed,
              'seconds': time.perf_counter()-started, 'rows': rows}
    print(json.dumps(output, indent=2))
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())

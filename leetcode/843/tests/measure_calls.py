"""Measure how many Master.guess calls the submitted solution.py needs on random word lists.

This executes the actual submission against a counting fake Master (no budget is imposed:
we record the number of calls until reply 6). Every (list, secret) case is seeded, so the
distribution is reproducible. Results are finite evidence about these generated families, not
a guarantee for every list, and not a LeetCode submission result.

Usage: python3 -B leetcode/843/tests/measure_calls.py [--lists N] [--output path]
"""
import argparse
import collections
import importlib.util
import json
import os
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def score(a, b):
    return sum(x == y for x, y in zip(a, b))


def calls_needed(words, secret):
    calls = 0

    class Master:
        def guess(self, word):
            nonlocal calls
            assert word in words
            calls += 1
            assert calls <= len(words), 'more calls than words'
            return score(word, secret)

    mod.Solution().findSecretWord(list(words), Master())
    assert calls >= 1
    return calls


def random_list(rng, alphabet, n):
    seen = set()
    while len(seen) < n:
        seen.add(''.join(rng.choice(alphabet) for _ in range(6)))
    words = sorted(seen)
    rng.shuffle(words)
    return words


def summarize(counts):
    hist = collections.Counter(counts)
    ordered = sorted(counts)
    return {
        'cases': len(counts),
        'histogram': {str(k): hist[k] for k in sorted(hist)},
        'mean': round(sum(counts) / len(counts), 2),
        'median': ordered[len(ordered) // 2],
        'p99': ordered[min(len(ordered) - 1, (99 * len(ordered)) // 100)],
        'max': ordered[-1],
        'over10': sum(c > 10 for c in counts),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--lists', type=int, default=10000)
    parser.add_argument('--all-secret-lists', type=int, default=300)
    parser.add_argument('--output', type=Path,
                        default=Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence')) / 'measured-calls.json')
    args = parser.parse_args()
    rng = random.Random(843)
    families = [
        ('uniform26', 'abcdefghijklmnopqrstuvwxyz', 100),
        ('alphabet4', 'abcd', 100),
        ('alphabet2', 'ab', 60),
    ]
    report = {'kind': 'measured call counts of solution.py on seeded random lists',
              'seed': 843, 'listsPerFamily': args.lists,
              'secret': 'one uniformly random word from each list', 'families': {}}
    for name, alphabet, n in families:
        counts = []
        for _ in range(args.lists):
            words = random_list(rng, alphabet, n)
            counts.append(calls_needed(words, rng.choice(words)))
        report['families'][name] = dict(alphabet=alphabet, words=n, **summarize(counts))
    # Every secret of some uniform lists: the judge may choose any secret of a list.
    rng_all = random.Random(8430)
    counts, per_list_worst = [], []
    for _ in range(args.all_secret_lists):
        words = random_list(rng_all, 'abcdefghijklmnopqrstuvwxyz', 100)
        row = [calls_needed(words, s) for s in words]
        counts.extend(row)
        per_list_worst.append(max(row))
    report['families']['uniform26AllSecrets'] = dict(
        alphabet='abcdefghijklmnopqrstuvwxyz', words=100, lists=args.all_secret_lists,
        perListWorst={str(k): v for k, v in sorted(collections.Counter(per_list_worst).items())},
        **summarize(counts))
    # Every secret of the full 64-word binary list, an exhaustive single list.
    full = [''.join(bits) for bits in __import__('itertools').product('ab', repeat=6)]
    report['families']['allBinary64'] = dict(alphabet='ab', words=64,
                                            **summarize([calls_needed(full, s) for s in full]))
    if args.lists == 10000 and args.all_secret_lists == 300:
        # copy.js `measured` quotes these values; keep the page and this run in step.
        fam = report['families']
        u, a = fam['uniform26'], fam['uniform26AllSecrets']
        assert (u['mean'], u['median'], u['max'], u['histogram'].get('10')) == (5.66, 6, 10, 18), u
        assert (a['cases'], a['max'], a['over10'], a['histogram'].get('10')) == (30000, 10, 0, 57), a
        assert (fam['alphabet4']['mean'], fam['alphabet4']['max']) == (3.84, 5)
        assert (fam['alphabet2']['mean'], fam['alphabet2']['max']) == (4.32, 6)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({k: {kk: v[kk] for kk in ('cases', 'mean', 'median', 'p99', 'max', 'over10', 'histogram')}
                      for k, v in report['families'].items()}))


if __name__ == '__main__':
    main()

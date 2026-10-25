"""843-BUDGET-R1: execute the submission with a strict spy Master.

Only the test sees the budget/secret. No fields are exposed to the submission.
Use --source for the retained red source, --diagnostic-bound for hypothesis tests.
"""
import argparse
import hashlib
import inspect
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def score(a, b):
    return len([i for i in range(6) if a[i] == b[i]])


def run(source, words, secret, budget):
    namespace = {}
    exec(compile(source, '<submission>', 'exec'), namespace)
    calls, possible = [], words[:]

    class Master:
        __slots__ = ()

        def guess(self, word):
            nonlocal possible
            if word not in words:
                return -1
            assert len(calls) < budget, 'budget exceeded before successful call'
            assert not calls or calls[-1]['reply'] != 6, 'call after success'
            assert word not in [h['guess'] for h in calls], 'repeated guess'
            actual = inspect.currentframe().f_back.f_locals['candidates']
            assert [words[i] for i in actual] == possible
            ranking = []
            for i, probe in enumerate(words):
                if probe in [h['guess'] for h in calls]:
                    continue
                counts = [sum(score(probe, w) == r for w in possible) for r in range(6)]
                ranking.append((max(counts), probe not in possible, i))
            assert word == words[min(ranking)[2]], 'wrong minimax/tie choice'
            reply = score(word, secret)
            before = possible[:]
            calls.append({'guess': word, 'reply': reply, 'before': before})
            possible = [w for w in words if all(score(w, h['guess']) == h['reply'] for h in calls)]
            assert possible == [w for w in before if score(word, w) == reply]
            assert secret in possible
            if reply != 6:
                assert len(possible) < len(before)
            calls[-1]['after'] = possible[:]
            return reply

    master = Master()
    assert master.guess('!!!!!!') == -1 and not calls
    supplied = words[:]
    result = namespace['Solution']().findSecretWord(supplied, master)
    assert result is None and supplied == words
    return {'secret': secret, 'found': bool(calls and calls[-1]['reply'] == 6),
            'calls': len(calls), 'survivorsOnReturn': possible, 'trace': calls}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=ROOT / 'solution.py')
    parser.add_argument('--diagnostic-bound', type=int)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    source = args.source.read_text()
    original_hash = hashlib.sha256(source.encode()).hexdigest()
    if args.diagnostic_bound:
        assert source.count('for _ in range(10):') == 1
        source = source.replace('for _ in range(10):', f'for _ in range({args.diagnostic_bound}):')
    fixtures = [('family20', [g+c*5 for g in 'ab' for c in 'cdefghijkl'], 10),
                ('family22', [g+c*5 for g in 'ab' for c in 'cdefghijklm'], 11),
                ('family24', [g+c*5 for g in 'ab' for c in 'cdefghijklmn'], 30),
                ('official4', ['acckzz', 'ccbazz', 'eiowzz', 'abcczz'], 10),
                ('official2', ['hamada', 'khaled'], 10),
                ('singleton', ['aaaaaa'], 10)]
    cases = []
    for name, words, budget in fixtures:
        rows = [run(source, words, secret, budget) for secret in words]
        cases.append({'fixture': name, 'budget': budget, 'tested': len(rows),
                      'found': sum(r['found'] for r in rows),
                      'maxCalls': max(r['calls'] for r in rows), 'rows': rows})
    passed = all(c['tested'] == c['found'] for c in cases)
    report = {'finding': '843-BUDGET-R1', 'passed': passed,
              'diagnosticOnly': bool(args.diagnostic_bound), 'originalSha256': original_hash,
              'executedSha256': hashlib.sha256(source.encode()).hexdigest(), 'cases': cases}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'cases'}))
    print(json.dumps([{k: v for k, v in c.items() if k != 'rows'} for c in cases]))
    return 0 if passed else 1


if __name__ == '__main__':
    raise SystemExit(main())

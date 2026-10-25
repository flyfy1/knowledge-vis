"""Independent sorting oracle and canonical Python execution; no dependencies."""
import itertools
import json
import os
from pathlib import Path
import random
import sys
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from solution import Solution


def oracle(a, k):
    result = []
    for i in range(len(a) - k + 1):
        window = sorted(a[i:i + k])
        if k % 2:
            result.append(float(window[k // 2]))
        else:
            result.append((window[k // 2 - 1] + window[k // 2]) / 2)
    return result


class Tests(unittest.TestCase):
    count = 0

    def check(self, a, k):
        original = a[:]
        self.assertEqual(Solution().medianSlidingWindow(a, k), oracle(a, k))
        self.assertEqual(a, original)
        Tests.count += 1

    def test_official(self):
        self.assertEqual(Solution().medianSlidingWindow([1,3,-1,-3,5,3,6,7], 3), [1,-1,-1,3,5,6])
        self.assertEqual(Solution().medianSlidingWindow([1,2,3,4,2,3,1,4,2], 3), [2,3,3,3,2,3,2])

    def test_exhaustive(self):
        for n in range(1, 8):
            for tup in itertools.product([-1, 0, 1], repeat=n):
                for k in range(1, n + 1):
                    self.check(list(tup), k)

    def test_random(self):
        rng = random.Random(480)
        for _ in range(1000):
            n = rng.randint(1, 100)
            self.check([rng.randint(-2**31, 2**31-1) for _ in range(n)], rng.randint(1, n))
        for a in ([7]*17, list(range(40)), list(range(40, -1, -1)), [-2**31, 2**31-1, -2**31, 2**31-1]):
            for k in range(1, len(a)+1):
                self.check(a, k)

    def test_maximum(self):
        n = 100000
        a = list(range(n))
        k = 50000
        out = Solution().medianSlidingWindow(a, k)
        self.assertEqual(out, [i+(k-1)/2 for i in range(n-k+1)])
        self.assertEqual(a, list(range(n)))
        self.assertEqual(Solution().medianSlidingWindow([-2**31]*n,n),[-2**31])


if __name__ == '__main__':
    started = time.monotonic()
    result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Tests))
    output = Path(os.environ.get('LESSON_OUTPUT_DIR', ROOT / 'tests/evidence'))
    output.mkdir(parents=True, exist_ok=True)
    (output / 'solution-results.json').write_text(json.dumps({'passed':result.wasSuccessful(),'oracle_cases':Tests.count,'seconds':time.monotonic()-started,'seed':480},indent=2))
    sys.exit(not result.wasSuccessful())

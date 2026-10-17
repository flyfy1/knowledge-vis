"""Run from any directory: python3 leetcode/tests/test_solution.py."""
import importlib.util
import itertools
from pathlib import Path
import random
import unittest

spec = importlib.util.spec_from_file_location(
    "solution_2916", Path(__file__).resolve().parents[1] / "2916" / "solution.py"
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
MOD = 10**9 + 7


def brute(nums):
    result = 0
    for left in range(len(nums)):
        seen = set()
        for right in range(left, len(nums)):
            seen.add(nums[right])
            result += len(seen) ** 2
    return result % MOD


class SolutionTests(unittest.TestCase):
    def setUp(self):
        self.solve = module.Solution().sumCounts

    def test_exhaustive_small_inputs(self):
        for n in range(1, 8):
            for values in itertools.product(range(1, 4), repeat=n):
                self.assertEqual(self.solve(list(values)), brute(values), values)

    def test_seeded_random_inputs(self):
        rng = random.Random(2916)
        for _ in range(500):
            values = [rng.randint(1, 10) for _ in range(rng.randint(1, 45))]
            self.assertEqual(self.solve(values), brute(values), values)

    def test_maximum_all_equal(self):
        n = 100000
        self.assertEqual(self.solve([2] * n), n * (n + 1) // 2 % MOD)

    def test_maximum_all_distinct(self):
        n = 100000
        expected = sum((n - length + 1) * length**2 for length in range(1, n + 1))
        self.assertEqual(self.solve(list(range(1, n + 1))), expected % MOD)


if __name__ == "__main__":
    unittest.main()

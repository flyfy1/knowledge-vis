from itertools import combinations_with_replacement, product


def exhaustive(nums: list[int], n: int) -> int:
    for k in range(n + 1):
        for patch in combinations_with_replacement(range(1, n + 1), k):
            items = nums + list(patch)
            sums = {
                sum(x for x, chosen in zip(items, flags) if chosen)
                for flags in product((0, 1), repeat=len(items))
            }
            if all(target in sums for target in range(1, n + 1)):
                return k
    raise AssertionError("Patching n copies of 1 always suffices")

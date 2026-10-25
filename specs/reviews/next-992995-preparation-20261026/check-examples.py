"""Small dispatcher examples only; direct oracles, not lesson solutions."""
import collections
import datetime
import json
import pathlib


def subarrays(nums, k):
    return [[left, right] for left in range(len(nums))
            for right in range(left, len(nums))
            if len(set(nums[left:right + 1])) == k]


def flips(nums, k):
    start, target = tuple(nums), (1,) * len(nums)
    queue = collections.deque([(start, [])])
    seen = {start}
    while queue:
        state, path = queue.popleft()
        if state == target:
            return len(path), path, len(seen)
        for left in range(len(nums) - k + 1):
            next_state = tuple(bit ^ (left <= i < left + k)
                               for i, bit in enumerate(state))
            if next_state not in seen:
                seen.add(next_state)
                queue.append((next_state, path + [left]))
    return -1, [], len(seen)


out = {"observedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
       "scope": "Direct tiny-example enumeration only; no canonical solution, performance, review or acceptance claim.",
       "992": [], "995": []}
for nums, k, expected, origin in [
    ([1, 2, 1, 2, 3], 2, 7, "official"),
    ([1, 2, 1, 3, 4], 3, 3, "official"),
    ([1, 2, 1], 2, 3, "original"),
    ([1, 1], 1, 3, "original"),
    ([1, 1, 2], 2, 2, "original"),
    ([1, 1], 2, 0, "original"),
    ([1], 1, 1, "original"),
]:
    assert 1 <= k <= len(nums) and all(1 <= x <= len(nums) for x in nums)
    intervals = subarrays(nums, k)
    assert len(intervals) == expected
    out["992"].append(dict(nums=nums, k=k, origin=origin, expected=expected,
                           actual=len(intervals), inclusiveIndexIntervals=intervals))
for nums, k, expected, origin in [
    ([0, 1, 0], 1, 2, "official"),
    ([1, 1, 0], 2, -1, "official"),
    ([0, 0, 0, 1, 0, 1, 1, 0], 3, 3, "official"),
    ([0, 1, 0], 2, 2, "original"),
    ([0, 0, 0], 2, -1, "original"),
    ([0, 0], 2, 1, "original"),
    ([1, 1], 2, 0, "original"),
    ([0, 1], 2, -1, "original"),
    ([0], 1, 1, "original"),
]:
    assert 1 <= k <= len(nums) and all(x in (0, 1) for x in nums)
    actual, path, seen = flips(nums, k)
    assert actual == expected
    out["995"].append(dict(nums=nums, k=k, origin=origin, expected=expected,
                           actual=actual, oneShortestFlipStartSequence=path,
                           discoveredBinaryStates=seen))
out["passed"] = True
pathlib.Path(__file__).with_name("example-checks.json").write_text(
    json.dumps(out, indent=2) + "\n")
print("16 tiny examples passed: 7 direct subarray counts, 9 binary-state BFS minima.")

"""Reproduce local callable measurements; high-memory cases run on Mac only."""
import functools
import hashlib
import json
from pathlib import Path
import subprocess
import sys


@functools.lru_cache(None)
def instruction_oracle(target):
    n = target.bit_length()
    if target == (1 << n) - 1:
        return n
    # First reverse after overshooting, or before the next overshooting A.
    overshoot = n + 1 + instruction_oracle((1 << n) - 1 - target)
    undershoots = [
        n + m + 1 + instruction_oracle(target - (1 << (n - 1)) + (1 << m))
        for m in range(n - 1)
    ]
    return min([overshoot, *undershoots])


if __name__ == "__main__":
    if sys.platform != "darwin":
        raise SystemExit("These high-memory diagnostics are restricted to Mac; do not run on Pi.")
    source = Path(__file__).with_name("observed-solution.py").read_bytes()
    assert hashlib.sha256(source).hexdigest() == "ba7639466dde736ade02f547425edca0bbac2734afa6a7ac03c91a59bbf29fb9"
    worst = sorted(range(1, 10001), key=lambda t: (instruction_oracle(t), t), reverse=True)[:4]
    print(json.dumps({"largest_instruction_counts": [[t, instruction_oracle(t)] for t in worst]}))
    for target in [3, 6, 10000, *worst[:2]]:
        runner = source.decode() + f'''
import time, resource, json
start = time.perf_counter()
answer = Solution().racecar({target})
assert answer == {instruction_oracle(target)}
print(json.dumps(dict(target={target}, answer=answer,
    seconds=time.perf_counter()-start,
    maxrss_bytes=resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)))
'''
        try:
            result = subprocess.run([sys.executable, "-c", runner], capture_output=True, text=True, timeout=4, check=True)
            print(result.stdout.strip())
        except subprocess.TimeoutExpired:
            print(json.dumps({"target": target, "observation": "Local four-second budget exceeded; not official TLE evidence"}))

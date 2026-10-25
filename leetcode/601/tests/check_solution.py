"""Run with any Python environment containing pandas; no network or writes to source."""
import ast
import datetime as dt
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import sys

sys.dont_write_bytecode = True
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("OUTPUT_DIR", ROOT / "tests/evidence"))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location("candidate", ROOT / "solution.py")
candidate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(candidate)


def oracle(frame):
    """Sort qualifying distinct IDs, split maximal runs; never enumerate triples."""
    values = sorted({r.id for r in frame.itertuples()
                     if pd.notna(r.people) and r.people >= 100})
    runs = []
    for value in values:
        if not runs or value != runs[-1][-1] + 1:
            runs.append([])
        runs[-1].append(value)
    keep = {x for run in runs if len(run) >= 3 for x in run}
    rows = [(r.id, r.visit_date, r.people) for r in frame.itertuples()
            if pd.notna(r.people) and r.people >= 100 and r.id in keep]
    return sorted(rows, key=lambda r: r[1])


count = 0


def check(ids, people, shuffle=False):
    global count
    rows = [(x, dt.date(1700, 1, 1) + dt.timedelta(days=i * 2), p)
            for i, (x, p) in enumerate(sorted(zip(ids, people)))]
    if shuffle:
        rng.shuffle(rows)
    frame = pd.DataFrame(rows, columns=["id", "visit_date", "people"])
    frame.index = [10 + i * 3 for i in range(len(frame))]
    before = frame.copy(deep=True)
    result = candidate.human_traffic(frame)
    assert isinstance(result, pd.DataFrame)
    assert list(result.columns) == ["id", "visit_date", "people"]
    assert list(result.itertuples(index=False, name=None)) == oracle(frame)
    pd.testing.assert_frame_equal(frame, before)
    count += 1
    return result


rng = random.Random(601)
for states in itertools.product(range(3), repeat=7):
    ids = [i + 1 for i, state in enumerate(states) if state]
    people = [99 if state == 1 else 100 for state in states if state]
    check(ids, people, True)
for _ in range(500):
    ids = sorted(rng.sample(range(1, 65), rng.randrange(40)))
    check(ids, [rng.choice([0, 99, 100, 101, 1455]) for _ in ids], True)
assert list(check(list(range(1, 9)), [10, 109, 150, 99, 145, 1455, 199, 188])["id"]) == [5, 6, 7, 8]
official = pd.DataFrame({
    "id": list(range(1, 9)),
    "visit_date": pd.to_datetime(["2017-01-01", "2017-01-02", "2017-01-03", "2017-01-04",
                                  "2017-01-05", "2017-01-06", "2017-01-07", "2017-01-09"]),
    "people": [10, 109, 150, 99, 145, 1455, 199, 188],
})
pd.testing.assert_frame_equal(candidate.human_traffic(official.sample(frac=1, random_state=601)), official.iloc[4:])
for n in [0, 1, 2, 3, 4, 10_000]:
    assert len(check(list(range(1, n + 1)), [100] * n, True)) == (n if n >= 3 else 0)
check([4, 5, 7], [150] * 3)
check([4, 5, 6], [110, 99, 140])
check([4, 4, 5, 6], [99, 100, 100, 100])
check([4, 4, 5], [100, 100, 100])
# Out-of-core robustness: nullable people fail threshold, not a new official constraint.
nullable = pd.DataFrame({"id": [1, 2, 3, 4], "visit_date": pd.date_range("2020-01-01", periods=4),
                         "people": pd.array([100, 100, pd.NA, 100], dtype="Int64")})
assert candidate.human_traffic(nullable).empty
mirror = (ROOT / "python-code.js").read_text()
assert json.loads(mirror.removeprefix("window.PYTHON_SOURCE = ").rstrip(";\n")) == (ROOT / "solution.py").read_text()
# Detect duplicate localization keys before JS parsing can overwrite them.
import re
copy = (ROOT / "copy.js").read_text()
keys = re.findall(r"(?:^|,)\s*(\w+)\s*:\s*\[", copy, re.M)
assert len(keys) == len(set(keys)) and len(keys) > 90
report = {"kind": "author self-check", "python": sys.version, "pandas": pd.__version__,
          "canonicalCases": count, "nullablePeopleExtension": "pass", "mirror": "exact",
          "officialLiteralExample": "exact DataFrame match, including date gap and sorted output",
          "oracle": "maximal-run partition, independent of triple enumeration",
          "exhaustive": "3^7 absent/99/100 states, shuffled physical row order",
          "seed": 601, "localizationKeys": len(keys)}
(OUT / "python-results.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report))

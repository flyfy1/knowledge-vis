"""Independent integer-membership oracle; no reuse of interval update rules."""
import importlib.util
import itertools
import json
import os
from pathlib import Path
import random
import re
import datetime

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)
spec = importlib.util.spec_from_file_location('solution', ROOT / 'solution.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
SummaryRanges = module.SummaryRanges


def oracle(seen):
    # Scan the fixed integer domain, extracting runs of True membership.
    result, start = [], None
    for x in range(10002):
        present = x in seen
        if present and start is None:
            start = x
        elif not present and start is not None:
            result.append([start, x - 1])
            start = None
    return result


checks = 0

def check_stream(values, fast=False):
    global checks
    obj, seen = SummaryRanges(), set()
    assert obj.getIntervals() == []
    for value in values:
        assert obj.addNum(value) is None
        seen.add(value)
        actual = obj.getIntervals()
        if fast:
            expected, start = [], None
            for x in range(6):
                if x in seen and start is None:
                    start = x
                elif x not in seen and start is not None:
                    expected.append([start, x - 1]); start = None
        else:
            expected = oracle(seen)
        assert actual == expected, (values, value, actual, expected)
        assert all(a <= b for a, b in actual)
        assert all(actual[i][1] + 1 < actual[i+1][0] for i in range(len(actual)-1))
        assert {x for a,b in actual for x in range(a,b+1)} == seen
        if actual:
            actual[0][0] = -999
            actual.append([-3,-1])
            assert obj.getIntervals() == expected
        checks += 1
    return obj.getIntervals()

assert check_stream([1,3,7,2,6]) == [[1,3],[6,7]]
streams = 0
for length in range(7):
    for values in itertools.product(range(5), repeat=length):
        check_stream(values, fast=True); streams += 1
rng = random.Random(352)
for _ in range(100):
    check_stream([rng.randrange(10001) for _ in range(100)])
check_stream([0,10000,9999,1,0])
# 30000 actual interface calls: 29900 adds and 100 queries.
obj=SummaryRanges()
for value in range(29900):
    obj.addNum(value % 10001)
for _ in range(100):
    assert obj.getIntervals() == [[0,10000]]
# Maximum number of disjoint intervals, descending insertions stress list shifts.
obj=SummaryRanges()
for value in range(10000,-1,-2):
    obj.addNum(value)
assert obj.getIntervals() == [[v,v] for v in range(0,10001,2)]
for value in range(1,10000,2):
    obj.addNum(value)
assert obj.getIntervals() == [[0,10000]]
source=(ROOT/'solution.py').read_text()
mirror=(ROOT/'python-code.js').read_text()
match=re.fullmatch(r'window.PYTHON_SOURCE = ("(?:[^"\\]|\\.)*");\n',mirror)
assert match and json.loads(match[1]) == source
# Execute the embedded source independently as well.
namespace={};exec(json.loads(match[1]),namespace)
embedded=namespace['SummaryRanges']()
for v in [8,6,7,6,0,10000]:embedded.addNum(v)
assert embedded.getIntervals() == oracle({8,6,7,0,10000})
report={'kind':'author self-check','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exhaustiveStreams':streams,'checkedIntermediateStates':checks,'randomSeed':352,'maximumCalls':30000,'maximumDisjointRanges':5001,'canonicalAndEmbeddedExecuted':True,'result':'pass'}
(OUT/'algorithm.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))

// The page trace must show the same heap arrays solution.py holds after every addNum.
const path = require('path'), {execFileSync} = require('child_process');
require(path.join(__dirname, '..', 'core.js'));
const M = globalThis.Median295;
const dir = path.join(__dirname, '..');
const streams = [[5, 2, 10, 4], [1, 100, 2], [-5, -1, -3, 8, 8], [7], [5, 2, 10, 4, 1, 0], [3, 8, 2, 9, 4]];
let seed = 295;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let k = 0; k < 200; k++) streams.push(Array.from({length: 1 + Math.floor(rnd() * 25)}, () => Math.floor(rnd() * 41) - 20));
const py = `
import json, sys
sys.path.insert(0, ${JSON.stringify(dir)})
from solution import MedianFinder
out = []
for s in json.loads(sys.stdin.read()):
    m = MedianFinder(); rows = []
    for x in s:
        m.addNum(x); rows.append([[-v for v in m.low], list(m.high), m.findMedian()])
    out.append(rows)
print(json.dumps(out))`;
const want = JSON.parse(execFileSync('python3', ['-c', py], {input: JSON.stringify(streams)}).toString());
streams.forEach((s, i) => {
  const got = M.trace(s);
  got.forEach((f, j) => {
    const [low, high, med] = want[i][j];
    if (JSON.stringify(f.low) !== JSON.stringify(low) || JSON.stringify(f.high) !== JSON.stringify(high) || Math.abs(f.median - med) > 1e-9)
      throw Error(`stream ${s} step ${j}: page ${JSON.stringify(f)} vs python ${JSON.stringify(want[i][j])}`);
  });
});
// Facts quoted in copy.js.
const ex = M.trace([5, 2, 10, 4, 1, 0]);
if (ex[4].median !== 4 || ex[5].median !== 3 || !ex[5].move || ex[5].move.v !== 4 || ex[5].move.from !== 'low') throw Error('cut example');
const q = M.trace([3, 8, 2, 9, 4]);
if (q[3].low[0] !== 3 || q[3].high[0] !== 8 || q[4].side !== 'high' || q[4].move.v !== 4 || q[4].median !== 4) throw Error('quiz example');
console.log(`page heap trace = solution.py heaps on ${streams.length} streams; quoted examples hold`);

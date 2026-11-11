// The page trace must decode exactly as Codec.deserialize in solution.py does,
// and the facts quoted in copy.js must hold.
const path = require('path'), fs = require('fs'), {execFileSync} = require('child_process');
global.window = {};
require(path.join(__dirname, '..', 'core.js'));
const T = window.Tree297, dir = path.join(__dirname, '..');
// Python: build random trees, serialize with the canonical Codec.
const py = `
import json, random, sys
sys.path.insert(0, ${JSON.stringify(dir)})
from solution import Codec, TreeNode
rng = random.Random(297); c = Codec(); out = []
def rand(d):
    if d > 6 or rng.random() < 0.3: return None
    return TreeNode(rng.randint(-1000, 1000), rand(d + 1), rand(d + 1))
def pre(n): return '#' if n is None else str(n.val) + ',' + pre(n.left) + ',' + pre(n.right)
for _ in range(300):
    r = rand(0); s = c.serialize(r)
    out.append([s, pre(c.deserialize(s))])
print(json.dumps(out))`;
const cases = JSON.parse(execFileSync('python3', ['-c', py]).toString());
const pre = n => n === null ? '#' : n.value + ',' + pre(n.left) + ',' + pre(n.right);
for (const [s, pyDecoded] of cases) {
  const tr = T.trace(s);
  if (!tr.valid) throw Error('valid string rejected: ' + s);
  if (pre(tr.root) !== pyDecoded) throw Error('decode mismatch: ' + s);
  const last = tr.frames[tr.frames.length - 1];
  if (last.pending.length !== 0 || last.cursor !== tr.tokens.length) throw Error('stack not empty at end: ' + s);
  const nodes = tr.tokens.filter(x => x !== '#').length;
  if (tr.tokens.length !== 2 * nodes + 1) throw Error('2n+1 tokens: ' + s);
}
for (const [s] of T.presets) if (!T.trace(s).valid) throw Error('preset invalid ' + s);
for (const bad of ['1,#', '1,#,#,#', '#,#', 'x', '1,a,#']) if (T.trace(bad).valid) throw Error('invalid accepted ' + bad);
// Quoted facts.
const q = T.trace('1,2,#,#,3,#,#');
if (q.frames[2].pending.join() !== '2.L,2.R,1.R' || q.frames[3].pending.join() !== '2.R,1.R') throw Error('quiz stack');
const vals = s => s.split(',').filter(x => x !== '#').join(',');
if (vals('1,2,#,#,3,4,#,#,5,#,#') !== '1,2,3,4,5' || vals(T.presets[5][0]) !== '1,2,3,4,5') throw Error('collision example');
console.log(`page decode = solution.py deserialize on ${cases.length} random trees; stack, 2n+1 and quiz facts hold`);

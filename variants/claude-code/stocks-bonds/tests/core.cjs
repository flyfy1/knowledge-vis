'use strict';
// Stocks & bonds (Claude Code edition) core checks. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pins every numeric claim the page makes; run with `node tests/core.cjs`.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const M = require(path.join(dir, 'model.js'));
const { STRINGS } = require(path.join(dir, 'i18n.js'));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
let checks = 0; const ok = (c, m) => { assert.ok(c, m); checks++; };
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const slider = id => { const m = html.match(new RegExp(`id="${id}"[^>]*min="([^"]+)" max="([^"]+)" step="([^"]+)" value="([^"]+)"`)); return { min: +m[1], max: +m[2], step: +m[3], value: +m[4] }; };
const range = s => { const out = []; for (let v = s.min; v <= s.max + 1e-9; v += s.step) out.push(+v.toFixed(6)); return out; };
const both = (k, ...subs) => { for (const l of ['zh', 'en']) for (const s of subs) ok(STRINGS[l][k].replace(/(\d),(\d{3})/g, '$1$2').includes(s), `${k} (${l}) states ${s}`); };

// ---- the stated set-up matches the model ----
ok(M.SHARES === 100 && M.SHARE_PRICE === 100 && M.PAYOUT === 0.5, '100 shares at 100, half paid out');
ok(M.FACE === 1000 && M.DEBT === 5000 && M.COUPON === 0.08 && M.INTEREST === 400 && M.CASH === 1000, 'debt 5000 at 8 % = 400; till 1000');
ok(M.MY_SHARES * M.SHARE_PRICE === 1000 && M.MY_BONDS * M.FACE === 1000, 'both choices cost 1000');
both('s0e', '100'); both('s1e', '1000'); both('s2e', '5000', '8%', '400', '10', '80', '1000'); both('s3e', '5000');

// ---- step 0: ownership ----
for (const k of range(slider('k0'))) for (const p of range(slider('p0'))) {
  const o = M.owner(k, p);
  near(o.frac, k / 100, 1e-12, 'k shares = k %'); ok(o.votes === k, 'one vote per share'); near(o.cost, 100 * k, 1e-9, 'cost');
  near(o.dividends + o.kept, p, 1e-9, 'profit = dividends + kept');
  near(o.mine, o.frac * o.dividends, 1e-9, 'your dividend scales with your shares and with profit');
  if (p === 0) ok(o.dividends === 0, 'no profit, no dividend');
}

// ---- step 1: the IOU ----
for (const c of range(slider('cr1'))) for (const T of range(slider('T1'))) {
  const b = M.bondFlows(c, T);
  ok(b.flows.length === T, 'one coupon per year'); b.flows.forEach(f => near(f.coupon, 1000 * c, 1e-9, 'coupon fixed by the IOU'));
  ok(b.flows.filter(f => f.principal > 0).length === 1 && b.flows[T - 1].principal === 1000, 'principal only in the last year');
  near(b.total, 1000 * c * T + 1000, 1e-9, 'total'); ok(b.total <= 2000 + 1e-9, 'fits the 0–2000 axis');
}

// ---- step 2: good years and bad ----
const P2 = slider('p2');
let flatFrom = null;
for (const p of range(P2)) {
  const y = M.year(p);
  near(y.paid + y.toOwners, p, 1e-9, 'interest + residual = operating profit');
  near(y.myStock, y.toOwners / 10, 1e-9, '10 shares get 10 % of the residual');
  near(y.myBond, y.paid / 5, 1e-9, 'one bond gets a fifth of the interest');
  if (p >= -600) { near(y.myBond, 80, 1e-9, 'bond pays 80 whenever profit + till cover the interest'); if (flatFrom === null) flatFrom = p; }
  else ok(y.myBond < 80, 'bond drops only when the till cannot cover the interest');
  ok(y.myStock >= -250 && y.myStock <= 600 && y.myBond >= -250 && y.myBond <= 600, 'inside the drawn axis');
}
ok(flatFrom === -600, 'the bond line is flat from −600 up');
near(M.breakEven(), 1200, 1e-9, 'break-even 1200');
near(M.year(1200).myStock, M.year(1200).myBond, 1e-9, 'equal at break-even');
for (const p of range(P2)) if (p > 1200) ok(M.year(p).myStock > M.year(p).myBond, 'stock more above break-even'); else if (p < 1200) ok(M.year(p).myStock < M.year(p).myBond, 'bond more below');
// the invented 8-year run: interest always payable; bond flat, stock varies; totals
ok(M.RUN.length === 8 && M.RUN.every(p => p + M.CASH >= M.INTEREST), 'no default in the run');
const run = M.RUN.map(M.year);
ok(run.every(r => r.myBond === 80), 'bond 80 every year');
near(run.reduce((a, r) => a + r.myBond, 0), 640, 1e-9, 'bond total 640'); near(run.reduce((a, r) => a + r.myStock, 0), 1160, 1e-9, 'stock total 1160');
ok(run.some(r => r.myStock < 0) && Math.max(...run.map(r => r.myStock)) > 300, 'stock has losing years and big years');
ok(run.every(r => r.myStock >= -100 && r.myStock <= 400), 'run fits the −100..400 axis');

// ---- step 3: order of repayment ----
for (const V of range(slider('V3'))) {
  const w = M.windUp(V);
  near(w.toLenders + w.toOwners, V, 1e-9, 'all sale money is split');
  if (V <= 5000) { near(w.toOwners, 0, 0, 'owners get nothing until the debt is repaid'); near(w.myStock, 0, 0, 'your shares get 0'); }
  else { near(w.toLenders, 5000, 0, 'lenders capped at 5000'); }
  ok(w.myBond <= 1000 + 1e-9, 'bond gets back at most 1000');
}
near(M.windUp(4000).myStock, 0, 0, 'quiz: 4000 → shares get 0'); near(M.windUp(4000).myBond, 800, 1e-9, 'quiz feedback: bond gets 800');
near(M.windUp(12000).myStock, 700, 1e-9, 'shares get 700 at 12000');

// ---- step 4: price from buyers and sellers ----
let prevP = -Infinity, prevQ = -1;
for (const m of range(slider('m4'))) {
  const mk = M.market(m);
  ok(mk.price >= prevP - 1e-9 && mk.trades >= prevQ, 'better news: price and volume never fall');
  prevP = mk.price; prevQ = mk.trades;
  ok(mk.lo <= mk.hi, 'a clearing range exists');
  // every matched pair trades at the price, no unmatched pair would
  for (let i = 0; i < mk.trades; i++) ok(mk.buy[i] >= mk.price - 1e-9 && mk.sell[i] <= mk.price + 1e-9, 'matched pairs accept the price');
  if (mk.trades < 10) ok(!(mk.buy[mk.trades] > mk.price + 1e-9 && mk.sell[mk.trades] < mk.price - 1e-9), 'next pair would not both accept');
  ok(mk.price >= 70 && mk.price <= 130 && Math.max(...mk.buy, ...mk.sell) <= 170 && Math.min(...mk.buy, ...mk.sell) >= 40, 'inside the drawn axes');
}
ok(M.market(30).price > M.market(0).price && M.market(-30).price < M.market(0).price, 'good news up, bad news down');

// ---- bilingual parity ----
const zk = Object.keys(STRINGS.zh).sort(), ek = Object.keys(STRINGS.en).sort();
assert.deepEqual(zk, ek, 'zh/en key sets match'); checks++;
const ph = s => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join();
for (const k of zk) { assert.equal(ph(STRINGS.zh[k]), ph(STRINGS.en[k]), 'placeholders for ' + k); checks++; }
for (const k of zk) ok(STRINGS.zh[k] !== STRINGS.en[k] && STRINGS.zh[k].trim() && STRINGS.en[k].trim(), 'zh/en non-empty and different for ' + k);
for (const l of ['zh', 'en']) ok(STRINGS[l].foot.includes('claude-opus-5-5'), 'footer names the model');
for (const l of ['zh', 'en']) for (const k of zk) ok(!/左图|右图|left panel|right panel|left chart|right chart/i.test(STRINGS[l][k]), 'no left/right figure references: ' + k);

// ---- every key referenced in HTML/app exists ----
for (const m of html.matchAll(/data-i18n(?:-html|-aria)?="([^"]+)"/g)) ok(STRINGS.zh[m[1]] !== undefined, 'missing key ' + m[1]);
for (const m of app.matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) ok(STRINGS.zh[m[1]] !== undefined, 'app key ' + m[1]);
for (const id of ['k0', 'p0', 'cr1', 'T1', 'p2', 'run2', 'clear2', 'V3', 'checkQuiz', 'm4']) ok(html.includes(`id="${id}"`), 'control ' + id);
ok(!html.includes('canvas-label-guard'), 'no label guard');

// ---- deep links land on existing step anchors ----
const hrefs = [...html.matchAll(/href="([^"]+#step\d+)"/g)].map(m => m[1]);
for (const l of ['zh', 'en']) for (const v of Object.values(STRINGS[l])) for (const m of v.matchAll(/href="([^"]+#step\d+)"/g)) hrefs.push(m[1]);
for (const h of new Set(hrefs)) {
  const [rel, anchor] = h.split('#'), target = path.join(dir, rel, 'index.html');
  ok(fs.existsSync(target), 'link target ' + h);
  ok(fs.readFileSync(target, 'utf8').includes(`id="${anchor}"`), 'anchor ' + h);
}
ok(fs.existsSync(path.join(dir, '../../../investment/basics/stocks-bonds/index.html')), 'comparison link target exists');
for (let i = 0; i <= 5; i++) ok(html.includes(`id="step${i}"`) && html.includes(`href="#step${i}"`), 'step ' + i);

console.log(`PASS stocks-bonds core: ${checks} checks · ${zk.length} bilingual keys · ${new Set(hrefs).size} deep links · break-even ${M.breakEven()}`);

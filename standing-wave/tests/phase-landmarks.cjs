'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = __dirname + '/..';
const source = fs.readFileSync(root + '/app.js', 'utf8');
const pure = source.split('/* ================= PURE-BEGIN ================= */')[1].split('/* ================= PURE-END ================= */')[0] + ';this.api={nearestLandmarks,spatialInfo};';
const ctx = {}; vm.runInNewContext(pure, ctx);
const { nearestLandmarks, spatialInfo } = ctx.api;
const near = (a, b, eps = 1e-12) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);
const q = nearestLandmarks(0.525, 2.1);
near(q.node.distance, 0); near(q.node.position, 0.525); near(q.antinode.distance, 0.525); assert.ok([0, 1.05].some(x => Math.abs(q.antinode.position - x) < 1e-12));
const anti = nearestLandmarks(0, 2.1); near(anti.antinode.distance, 0); near(anti.node.distance, 0.525);
const nextAnti = nearestLandmarks(1.05, 2.1); near(nextAnti.antinode.distance, 0); near(nextAnti.antinode.position, 1.05); near(nextAnti.node.distance, 0.525);
for (const lam of [1.2, 2, 2.1, 3]) for (let i = -100; i <= 100; i++) {
  const x = i / 20, marks = nearestLandmarks(x, lam), info = spatialInfo(x, lam);
  assert.ok(marks.node.distance >= 0 && marks.antinode.distance >= 0);
  assert.ok(marks.node.distance <= lam / 4 + 1e-10);
  assert.ok(marks.antinode.distance <= lam / 4 + 1e-10);
  if (info.kind === 'node') near(marks.node.distance, 0);
  if (info.kind === 'anti') near(marks.antinode.distance, 0);
}
assert.throws(() => nearestLandmarks(0, 0));
const i18n = fs.readFileSync(root + '/i18n.js', 'utf8');
const ic = {}; vm.runInNewContext(i18n.slice(0, i18n.indexOf('let _lang')) + ';this.STR_OUT=STR;', ic);
assert.deepEqual(Object.keys(ic.STR_OUT.zh).sort(), Object.keys(ic.STR_OUT.en).sort());
for (const k of Object.keys(ic.STR_OUT.zh)) {
  const ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  assert.deepEqual(ph(ic.STR_OUT.zh[k]).sort(), ph(ic.STR_OUT.en[k]).sort(), `placeholder parity ${k}`);
}
console.log(JSON.stringify({ pass: true, cases: 4 * 201, contract: 'analytic nearest nodes/antinodes, λ/2 invariant, locale placeholder parity' }));

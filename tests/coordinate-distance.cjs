'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('math/algebra/coordinate-plane/distance.js', 'utf8');
const window = {};
const document = { addEventListener() {} };
vm.runInNewContext(code, { window, document, Math });
const api = window.COORD_DISTANCE;
assert(api, 'distance API exported');
const a = { x: -3, y: -2 }, b = { x: 4, y: 3 };
assert.equal(api.delta(a, b).x, 7); assert.equal(api.delta(a, b).y, 5);
assert.equal(api.distance(a, b), Math.sqrt(74));
assert.equal(api.midpoint(a, b).x, 0.5); assert.equal(api.midpoint(a, b).y, 0.5);
assert.equal(api.slope(a, b), 5 / 7);
assert.equal(api.slope({ x: 2, y: -4 }, { x: 2, y: 1 }), null);
assert.equal(api.clampInt(-8), -6);
assert.equal(api.clampInt(8), 6);
// Render through the page's global t() with stub DOM/canvas: the readouts must be filled, not left blank by a
// recursing local translator (2026-11-09 regression).
const stub = new Proxy(function () {}, { get: (o, k) => k === 'measureText' ? () => ({ width: 0 }) : stub, apply: () => stub, set: () => true });
const els = {}, ready = [];
const el = id => els[id] || (els[id] = { id, textContent: '', innerHTML: '', value: 0, style: {}, clientWidth: 720, width: 0, height: 0,
  classList: { add() {}, toggle() {} }, addEventListener() {}, setPointerCapture() {}, getAttribute: () => '420', getContext: () => stub, getBoundingClientRect: () => ({ left: 0, top: 0 }) });
vm.runInNewContext(code, { window: { devicePixelRatio: 1 }, document: { getElementById: el, addEventListener: (type, fn) => ready.push(fn) }, Math, JSON, Number,
  t: (key, params) => key + ' ' + JSON.stringify(params || {}) });
ready.forEach(fn => fn());
assert.match(els['s6-ro'].innerHTML, /^s6ro .*"dist":"8\.60".*"mid":"\(0\.5, 0\.5\)"/, 'step 6 readout rendered through global t()');
assert.match(els['s6-check'].innerHTML, /^s6check .*"lhs":"74"/, 'square check rendered');
console.log('coordinate-distance: ok');

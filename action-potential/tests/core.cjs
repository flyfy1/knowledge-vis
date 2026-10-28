const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const model = require('../sim-core.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert.match(html, /id="membraneCanvas"/);
assert.match(html, /id="phaseCanvas"/);
assert.match(html, /id="trainCanvas"/);
assert.match(html, /data-lang="en"/);
assert.match(html, /data-answer="correct"/);

const graded = model.evaluateSpike(0.4, 0.55);
assert.equal(graded.fired, false);
assert.equal(graded.state, 'graded potential');
assert.ok(graded.peak < -30);

const spike = model.evaluateSpike(0.7, 0.55);
assert.equal(spike.fired, true);
assert.equal(spike.peak, 30);
assert.ok(spike.latency > 0);

assert.equal(model.phaseAt(2.2, 0).phase, 'depolarization');
assert.equal(model.phaseAt(2.2, 0).na, 'open');
assert.equal(model.phaseAt(5.5, 0).phase, 'hyperpolarization');

assert.deepEqual(model.trainModel(40, 3), {frequency:40,refractory:3,input:40,output:40,maxRate:333.3,skipped:0});
const capped = model.trainModel(160, 12);
assert.equal(capped.output, 83);
assert.equal(capped.skipped, 77);

console.log('action-potential core checks passed');

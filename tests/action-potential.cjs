'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../action-potential/app.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'action-potential', 'index.html'), 'utf8');
for (const id of ['stimulus', 'threshold', 'window', 'phaseTime', 'leak', 'frequency', 'refractory', 'membraneCanvas', 'phaseCanvas', 'trainCanvas', 'quiz']) assert.match(html, new RegExp(`(?:id|aria-label)=["']${id}`), `missing UI hook ${id}`);
for (const key of ['s0title', 's1title', 's2title', 's3title', 'qA', 'qB', 'qC']) {
  const js = fs.readFileSync(path.join(__dirname, '..', 'action-potential', 'app.js'), 'utf8');
  assert.ok((js.match(new RegExp(`${key}:`, 'g')) || []).length >= 2, `${key} must exist in zh/en`);
}

const sub = api.simulateWaveform({ stimulus: .35, threshold: .55, duration: 12 });
assert.ok(Math.max(...sub.map(p => p.v)) < -58, 'subthreshold response should stay below spike range');
assert.equal(api.firstThresholdCrossing({ stimulus: .35, threshold: .55 }), null, 'subthreshold should never cross');
const spike = api.simulateWaveform({ stimulus: .8, threshold: .55, duration: 12 });
const peak = Math.max(...spike.map(p => p.v));
assert.ok(peak > 25 && peak < 40, `spike peak should be near +35 mV, got ${peak}`);
assert.ok(api.firstThresholdCrossing({ stimulus: .8, threshold: .55 }) > 0, 'spike has a finite latency');
assert.equal(api.phaseAt(1.2, { stimulus: .8, threshold: .55 }).id, 'depolarize');
assert.equal(api.phaseAt(2.4, { stimulus: .8, threshold: .55 }).id, 'repolarize');
assert.equal(api.phaseAt(4.0, { stimulus: .8, threshold: .55 }).id, 'hyperpolarize');
assert.equal(api.phaseAt(1.2, { stimulus: .35, threshold: .55 }).id, 'local');

const train = api.pulseTrain({ frequency: 40, durationMs: 1000, refractoryMs: 3 });
assert.equal(train.input.length, 40, '40 Hz should send 40 input pulses per second');
assert.equal(train.output.length, 40, '40 Hz below ceiling should pass every pulse');
const filtered = api.pulseTrain({ frequency: 500, durationMs: 1000, refractoryMs: 3 });
assert.ok(filtered.output.length <= 334 && filtered.output.length < filtered.input.length, 'refractory period filters overly fast input');
assert.deepEqual(api.pulseTrain({ frequency: 0 }).input, [], 'zero input frequency should emit no pulses');
assert.equal(Math.round(api.maxFiringRate(4) * 10) / 10, 250, 'ceiling is inverse of refractory time');

console.log('action-potential core, threshold phases, refractory train, and bilingual hooks: ok');

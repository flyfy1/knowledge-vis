'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { simulate, compare } = require('../feedback-control/sim-core.js');

const p = simulate({ setpoint: 1, Kp: 2.4, Ki: 0, Kd: 0 });
const pi = simulate({ setpoint: 1, Kp: 2.4, Ki: 1.2, Kd: 0 });
const noD = simulate({ setpoint: 1, Kp: 3.2, Ki: 1.2, Kd: 0 });
const withD = simulate({ setpoint: 1, Kp: 3.2, Ki: 1.2, Kd: 1.4 });
const disturbed = simulate({ setpoint: 1, Kp: 3.2, Ki: 1.2, Kd: 0, disturbance: true });
const disturbedAgain = simulate({ setpoint: 1, Kp: 3.2, Ki: 1.2, Kd: 0, disturbance: true });

assert.ok(p.metrics.finalError > 0.15, `P should leave visible steady-state error: ${p.metrics.finalError}`);
assert.ok(pi.metrics.finalError < p.metrics.finalError, 'I should reduce steady-state error');
assert.ok(withD.metrics.overshootPercent <= noD.metrics.overshootPercent + 8, 'D should not create an unbounded overshoot jump');
assert.notDeepEqual(disturbed.points, p.points, 'disturbance must alter the response');
assert.deepEqual(disturbed.points, disturbedAgain.points, 'seedless deterministic simulation must repeat exactly');
assert.equal(compare(pi, p).steadyErrorDelta < 0, true, 'compare() should report PI error improvement');

const html = fs.readFileSync(path.join(__dirname, '..', 'feedback-control', 'index.html'), 'utf8');
const i18n = fs.readFileSync(path.join(__dirname, '..', 'feedback-control', 'i18n.js'), 'utf8');
for (const id of ['setpoint', 'kp', 'ki', 'kd', 'disturbance', 'checkQuiz', 'labCanvas']) assert.match(html, new RegExp(`(?:id|data-[^=]+)=['"]${id}['"]`), `missing UI hook ${id}`);
for (const key of ['s0e', 's1e', 's2e', 's3e', 's4e', 's5e', 'quizA', 'quizB', 'quizC']) {
  assert.match(i18n, new RegExp(`${key}:`), `missing zh/en key ${key}`);
  assert.ok((i18n.match(new RegExp(`${key}:`, 'g')) || []).length >= 2, `key ${key} must exist in both locales`);
}
console.log('feedback-control core and bilingual contract: ok');

const assert = require('node:assert/strict');
const model = require('../model.js');

function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

const baseline = model.buildState();
close(baseline.probabilities.reduce((sum, value) => sum + value, 0), 1, 1e-12);
close(baseline.mean, 5, 0.08);
assert.ok(baseline.variance > 0);
assert.equal(baseline.outcomes.length, 11);

const rightSkew = model.buildState({ center: 5, spread: 1.6, skew: 1 });
const leftSkew = model.buildState({ center: 5, spread: 1.6, skew: -1 });
assert.ok(rightSkew.mean > baseline.mean, 'right skew should pull the mean right');
assert.ok(leftSkew.mean < baseline.mean, 'left skew should pull the mean left');

const lowThreshold = model.buildState({ threshold: 3 });
const highThreshold = model.buildState({ threshold: 8 });
assert.ok(lowThreshold.tailProbability > highThreshold.tailProbability);
close(model.buildState({ threshold: 0 }).tailProbability, 1, 1e-12);
close(model.buildState({ threshold: 10 }).tailProbability, model.buildState({ threshold: 10 }).probabilities[10], 1e-12);

const modeFeedback = model.misconceptionFeedback('mode', baseline);
assert.equal(modeFeedback.correct, false);
assert.match(modeFeedback.values.mean, /^\d+\.\d{2}$/);
const meanFeedback = model.misconceptionFeedback('mean', baseline);
assert.equal(meanFeedback.correct, true);
const tailFeedback = model.misconceptionFeedback('tail', highThreshold);
assert.equal(tailFeedback.correct, false);
assert.equal(tailFeedback.values.threshold, 8);

const bounded = model.buildState({ center: -200, spread: 100, skew: 99, threshold: 99 });
assert.equal(bounded.threshold, 10);
close(bounded.probabilities.reduce((sum, value) => sum + value, 0), 1, 1e-12);
assert.ok(bounded.probabilities.every(value => value >= 0));

console.log('probability-distribution core tests: PASS');

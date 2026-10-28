(function attachDistributionModel(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DistributionModel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createDistributionModel() {
  const OUTCOMES = Array.from({ length: 11 }, (_, index) => index);

  function clamp(value, low, high) {
    return Math.min(high, Math.max(low, value));
  }

  function normalize(values) {
    const total = values.reduce((sum, value) => sum + value, 0);
    if (!Number.isFinite(total) || total <= 0) return values.map(() => 1 / values.length);
    return values.map(value => value / total);
  }

  function weightsFor({ center = 5, spread = 1.7, skew = 0 }) {
    const safeSpread = clamp(Number(spread) || 1.7, 0.35, 4);
    const safeCenter = clamp(Number(center) || 5, 0, 10);
    const safeSkew = clamp(Number(skew) || 0, -1.2, 1.2);
    const raw = OUTCOMES.map(outcome => {
      const z = (outcome - safeCenter) / safeSpread;
      // Exponential tilt keeps every bar positive while making the tail visible.
      return Math.exp(-0.5 * z * z + 0.52 * safeSkew * z);
    });
    return normalize(raw);
  }

  function moments(outcomes, probabilities) {
    const mean = outcomes.reduce((sum, value, index) => sum + value * probabilities[index], 0);
    const variance = outcomes.reduce((sum, value, index) => {
      return sum + ((value - mean) ** 2) * probabilities[index];
    }, 0);
    return { mean, variance, sd: Math.sqrt(Math.max(0, variance)) };
  }

  function buildState(options = {}) {
    const center = clamp(Number(options.center ?? 5), 0, 10);
    const spread = clamp(Number(options.spread ?? 1.7), 0.35, 4);
    const skew = clamp(Number(options.skew ?? 0), -1.2, 1.2);
    const threshold = clamp(Math.round(Number(options.threshold ?? 7)), 0, 10);
    const probabilities = weightsFor({ center, spread, skew });
    const { mean, variance, sd } = moments(OUTCOMES, probabilities);
    const modeIndex = probabilities.reduce((best, value, index) => value > probabilities[best] ? index : best, 0);
    const tailProbability = probabilities.reduce((sum, value, index) => sum + (OUTCOMES[index] >= threshold ? value : 0), 0);
    return {
      outcomes: OUTCOMES.slice(),
      probabilities,
      center,
      spread,
      skew,
      threshold,
      mean,
      variance,
      sd,
      mode: OUTCOMES[modeIndex],
      tailProbability,
      mostLikelyProbability: probabilities[modeIndex]
    };
  }

  function misconceptionFeedback(choice, state) {
    if (choice === 'mode') {
      return {
        correct: false,
        key: 'feedbackMode',
        values: { mode: state.mode, mean: state.mean.toFixed(2) }
      };
    }
    if (choice === 'mean') {
      return {
        correct: true,
        key: 'feedbackMean',
        values: { mean: state.mean.toFixed(2), sd: state.sd.toFixed(2) }
      };
    }
    return {
      correct: false,
      key: 'feedbackTail',
      values: { threshold: state.threshold, probability: `${(state.tailProbability * 100).toFixed(1)}%` }
    };
  }

  return { OUTCOMES, clamp, normalize, weightsFor, moments, buildState, misconceptionFeedback };
});

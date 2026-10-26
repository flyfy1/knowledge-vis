/* Per-column baseline: the lab derives one depth, not the two-pointer total. */
(function (root) {
  'use strict';
  function inspect(height, index) {
    if (!height.length || !Number.isInteger(index) || index < 0 || index >= height.length ||
        height.some(h => !Number.isInteger(h) || h < 0)) throw new RangeError('Invalid column input');
    const left = Math.max(...height.slice(0, index + 1));
    const right = Math.max(...height.slice(index));
    return {height: height.slice(), index, left, right,
      leftIndex: height.indexOf(left), rightIndex: height.indexOf(right, index),
      level: Math.min(left, right), depth: Math.min(left, right) - height[index]};
  }
  if (typeof module !== 'undefined') module.exports = {inspect};
  else root.RainWallModel = {inspect};
})(typeof window === 'undefined' ? globalThis : window);

'use strict';
// Teaching trace for #295. A line-by-line port of CPython's heapq push/pop plus
// MedianFinder.addNum from solution.py, so the arrays shown are the arrays Python holds.
(function (root) {
  function siftdown(h, start, pos) {
    const item = h[pos];
    while (pos > start) {
      const parentpos = (pos - 1) >> 1, parent = h[parentpos];
      if (item < parent) { h[pos] = parent; pos = parentpos; continue; }
      break;
    }
    h[pos] = item;
  }
  function siftup(h, pos) {
    const endpos = h.length, startpos = pos, item = h[pos];
    let childpos = 2 * pos + 1;
    while (childpos < endpos) {
      const rightpos = childpos + 1;
      if (rightpos < endpos && !(h[childpos] < h[rightpos])) childpos = rightpos;
      h[pos] = h[childpos]; pos = childpos; childpos = 2 * pos + 1;
    }
    h[pos] = item;
    siftdown(h, startpos, pos);
  }
  function heappush(h, x) { h.push(x); siftdown(h, 0, h.length - 1); }
  function heappop(h) {
    const last = h.pop();
    if (h.length) { const r = h[0]; h[0] = last; siftup(h, 0); return r; }
    return last;
  }
  function median(low, high) {
    if (low.length > high.length) return -low[0];
    return (-low[0] + high[0]) / 2;
  }
  // Returns one frame per addNum: where num went, which root moved, heaps after.
  function trace(values) {
    const low = [], high = [], frames = [];
    for (const num of values) {
      const lowMax = low.length ? -low[0] : null;
      const side = (!low.length || num <= -low[0]) ? 'low' : 'high';
      if (side === 'low') heappush(low, -num); else heappush(high, num);
      let move = null;
      if (low.length > high.length + 1) { const v = -heappop(low); heappush(high, v); move = {from: 'low', v}; }
      else if (high.length > low.length) { const v = heappop(high); heappush(low, -v); move = {from: 'high', v}; }
      frames.push({num, lowMax, side, move, low: low.map(x => -x), high: high.slice(), median: median(low, high)});
    }
    return frames;
  }
  root.Median295 = {heappush, heappop, trace};
})(typeof window !== 'undefined' ? window : globalThis);

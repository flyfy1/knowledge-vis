'use strict';
// Teaching trace for #301. It follows solution.py call for call:
// the same budget walk, the same keep/delete order, the same two prunings,
// and a set that collapses equal strings.
window.Remove301 = {
  presets: ['()())()', '(a)())()', ')(', '((a)())'],
  // Budget walk: one entry per character, as in the first loop of solution.py.
  walk(s) {
    let open = 0, right = 0;
    const steps = [];
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      let forced = false;
      if (c === '(') open++;
      else if (c === ')') {
        if (open > 0) open--;
        else { right++; forced = true; }
      }
      steps.push({i, c, open, forced, right});
    }
    return {steps, left: open, right};
  },
  budget(s) {
    const w = this.walk(s);
    return {left: w.left, right: w.right};
  },
  trace(s) {
    const b = this.budget(s), n = s.length, frames = [], found = [], seen = new Set(), path = [];
    const snap = (kind, i, bal, l, r, extra) => frames.push(Object.assign({kind, i, path: path.join(''), bal, l, r, results: found.slice()}, extra || {}));
    function dfs(i, bal, l, r, how) {
      snap('call', i, bal, l, r, how);
      if (l + r > n - i) { snap('pruneBudget', i, bal, l, r, {need: l + r, left: n - i}); return; }
      if (i === n) {
        if (bal === 0) {
          const x = path.join('');
          if (seen.has(x)) snap('duplicate', i, bal, l, r, {x});
          else { seen.add(x); found.push(x); snap('emit', i, bal, l, r, {x}); }
        }
        return;
      }
      const c = s[i];
      if (c === '(' && l > 0) dfs(i + 1, bal, l - 1, r, {via: 'delete', at: i, c});
      if (c === ')' && r > 0) dfs(i + 1, bal, l, r - 1, {via: 'delete', at: i, c});
      if (c === ')' && bal === 0) { snap('pruneKeep', i, bal, l, r, {at: i}); return; }
      path.push(c);
      dfs(i + 1, bal + (c === '(' ? 1 : c === ')' ? -1 : 0), l, r, {via: 'keep', at: i, c});
      path.pop();
    }
    dfs(0, 0, b.left, b.right, {via: 'start'});
    return {s, b, frames, results: found};
  }
};

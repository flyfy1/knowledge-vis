'use strict';
// Equation-balancing lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Parses formulas, counts atoms per element on each side, checks balance, finds the smallest
// whole-number coefficients by exhaustive search, and produces hints. tests/core.cjs pins the claims.
(function (root) {
  // Parse a formula such as "Ca(OH)2" or "Al2(SO4)3" into { Ca: 1, O: 2, H: 2 }.
  function parse(f) {
    let i = 0;
    function num() { let s = ''; while (i < f.length && /[0-9]/.test(f[i])) s += f[i++]; return s ? Number(s) : 1; }
    function group() {
      const out = {};
      while (i < f.length && f[i] !== ')') {
        let part;
        if (f[i] === '(') { i++; part = group(); i++; }
        else { let el = f[i++]; while (i < f.length && /[a-z]/.test(f[i])) el += f[i++]; part = { [el]: 1 }; }
        const n = num();
        for (const k in part) out[k] = (out[k] || 0) + part[k] * n;
      }
      return out;
    }
    return group();
  }
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const pretty = f => f.replace(/[0-9]/g, d => SUB[d]);

  const REACTIONS = {
    water: { L: ['H2', 'O2'], R: ['H2O'] },
    peroxide: { L: ['H2', 'O2'], R: ['H2O2'] },
    methane: { L: ['CH4', 'O2'], R: ['CO2', 'H2O'] },
    ethane: { L: ['C2H6', 'O2'], R: ['CO2', 'H2O'] },
    propane: { L: ['C3H8', 'O2'], R: ['CO2', 'H2O'] },
    ammonia: { L: ['N2', 'H2'], R: ['NH3'] },
    magnesium: { L: ['Mg', 'O2'], R: ['MgO'] },
    chlorate: { L: ['KClO3'], R: ['KCl', 'O2'] },
    iron: { L: ['Fe2O3', 'CO'], R: ['Fe', 'CO2'] },
    lime: { L: ['Ca(OH)2', 'HCl'], R: ['CaCl2', 'H2O'] },
    aluminium: { L: ['Al', 'HCl'], R: ['AlCl3', 'H2'] }
  };
  const PRACTICE = ['ammonia', 'magnesium', 'chlorate', 'iron', 'lime', 'aluminium'];
  const species = rx => [...REACTIONS[rx].L, ...REACTIONS[rx].R];

  // Elements in the order they first appear (left side first).
  function elements(rx) { const out = []; species(rx).forEach(f => Object.keys(parse(f)).forEach(e => { if (!out.includes(e)) out.push(e); })); return out; }

  // coefs: one number per species, left then right.
  function tally(rx, coefs) {
    const R = REACTIONS[rx], nL = R.L.length;
    return elements(rx).map(el => {
      let L = 0, Rt = 0;
      species(rx).forEach((f, i) => { const c = (parse(f)[el] || 0) * coefs[i]; if (i < nL) L += c; else Rt += c; });
      return { el, L, R: Rt, ok: Math.abs(L - Rt) < 1e-9 };
    });
  }
  const balanced = (rx, coefs) => tally(rx, coefs).every(t => t.ok);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const gcdAll = arr => arr.reduce((g, v) => gcd(g, v), 0);
  const isWhole = arr => arr.every(v => Number.isInteger(v) && v > 0);
  const simplest = coefs => isWhole(coefs) && gcdAll(coefs) === 1;

  // Smallest whole-number solution by trying every combination up to max (unique for these reactions).
  function solve(rx, max = 12) {
    const n = species(rx).length, c = new Array(n).fill(1), found = [];
    (function rec(k) {
      if (k === n) { if (balanced(rx, c) && gcdAll(c) === 1) found.push(c.slice()); return; }
      for (let v = 1; v <= max; v++) { c[k] = v; rec(k + 1); }
    })(0);
    return found;
  }

  // Count balanced combinations up to max (shows they are all multiples of the simplest one).
  function allBalanced(rx, max = 12) {
    const n = species(rx).length, c = new Array(n).fill(1), out = [];
    (function rec(k) { if (k === n) { if (balanced(rx, c)) out.push(c.slice()); return; } for (let v = 1; v <= max; v++) { c[k] = v; rec(k + 1); } })(0);
    return out;
  }

  // Hint: the first unbalanced element in a working order (elements in the fewest compounds first,
  // then H, then O last), and which species to change to fix it now if one change can do it.
  function order(rx) {
    const els = elements(rx), sp = species(rx);
    const inN = el => sp.filter(f => parse(f)[el]).length;
    const rank = el => (el === 'O' ? 2 : el === 'H' ? 1 : 0);
    return els.slice().sort((a, b) => rank(a) - rank(b) || inN(a) - inN(b) || els.indexOf(a) - els.indexOf(b));
  }
  function hint(rx, coefs) {
    const tl = tally(rx, coefs), R = REACTIONS[rx], nL = R.L.length, sp = species(rx);
    const el = order(rx).find(e => !tl.find(t => t.el === e).ok);
    if (!el) return null;
    const t = tl.find(q => q.el === el);
    // Candidate single changes on either side that level this scale; prefer the one that unbalances the
    // fewest already-level scales, then the short side, then the simplest substance.
    const shortLeft = t.L < t.R, cands = [];
    sp.forEach((f, i) => {
      const per = parse(f)[el]; if (!per) return;
      const left = i < nL, mine = left ? t.L : t.R, other = left ? t.R : t.L, need = (other - (mine - per * coefs[i])) / per;
      if (!Number.isInteger(need) || need < 1 || need > 12 || need === coefs[i]) return;
      const c2 = coefs.slice(); c2[i] = need;
      const broken = tally(rx, c2).filter((q, j) => tl[j].ok && !q.ok).length;
      cands.push({ i, need, broken, side: left === shortLeft ? 0 : 1, n: Object.keys(parse(f)).length });
    });
    cands.sort((p, q) => p.broken - q.broken || p.side - q.side || p.n - q.n);
    if (cands.length) return { el, L: t.L, R: t.R, idx: cands[0].i, to: cands[0].need };
    const per = sp.filter(f => parse(f)[el]).map(f => parse(f)[el]);
    return { el, L: t.L, R: t.R, idx: -1, to: null, lcm: per.reduce((a, b) => a / gcd(a, b) * b, 1) };
  }

  // Step 3: coefficients in halves are allowed while working; doubling clears them.
  const hasHalf = coefs => coefs.some(v => !Number.isInteger(v));

  // Step 4: one equation per element, in letters a, b, c, d.
  function equations(rx) {
    const R = REACTIONS[rx], nL = R.L.length, sp = species(rx), letters = 'abcd';
    return elements(rx).map(el => {
      const side = lo => sp.map((f, i) => ({ i, n: parse(f)[el] || 0 })).filter(q => q.n && (q.i < nL) === lo).map(q => (q.n === 1 ? '' : q.n) + letters[q.i]).join(' + ');
      return { el, text: `${side(true)} = ${side(false)}` };
    });
  }

  const api = { parse, pretty, REACTIONS, PRACTICE, species, elements, tally, balanced, gcd, gcdAll, isWhole, simplest, solve, allBalanced, order, hint, hasHalf, equations };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EB_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);

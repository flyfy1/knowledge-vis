'use strict';
// Symmetry & rotation lesson model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every axis count, matching angle, fold mismatch and kaleidoscope copy on the page is computed here;
// tests/core.cjs pins the claims. Shapes are polygons with their area centre at the origin (y points up);
// the circle is handled as its own case. Angles are in degrees, counter-clockwise from the +x direction.
(function (root) {
  const RAD = Math.PI / 180, EPS = 1e-7;

  function area(P) { let s = 0; for (let i = 0; i < P.length; i++) { const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % P.length]; s += x0 * y1 - x1 * y0; } return s / 2; }
  function centre(P) {
    let cx = 0, cy = 0; const A = area(P);
    for (let i = 0; i < P.length; i++) { const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % P.length], c = x0 * y1 - x1 * y0; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
    return [cx / (6 * A), cy / (6 * A)];
  }
  const recentre = P => { const [cx, cy] = centre(P); return P.map(([x, y]) => [x - cx, y - cy]); };
  const regular = (n, r, start) => Array.from({ length: n }, (_, i) => [r * Math.cos((start + 360 * i / n) * RAD), r * Math.sin((start + 360 * i / n) * RAD)]);
  // A pinwheel with n blades: each blade leans one way, so it turns onto itself but has no mirror line.
  function pinwheel(n) {
    const P = [];
    for (let i = 0; i < n; i++) {
      const a = 360 * i / n, w = 360 / n;
      P.push([0.32 * Math.cos((a - w / 2) * RAD), 0.32 * Math.sin((a - w / 2) * RAD)]);
      P.push([1.45 * Math.cos(a * RAD), 1.45 * Math.sin(a * RAD)]);
      P.push([1.0 * Math.cos((a + w * 0.3) * RAD), 1.0 * Math.sin((a + w * 0.3) * RAD)]);
    }
    return P;
  }

  const SHAPES = {
    square: regular(4, 1.45, 45),
    rect: [[-1.55, -0.85], [1.55, -0.85], [1.55, 0.85], [-1.55, 0.85]],
    equilateral: regular(3, 1.45, 90),
    isosceles: recentre([[0, 1.55], [-0.9, -0.95], [0.9, -0.95]]),
    scalene: recentre([[-1.35, -0.8], [1.45, -0.55], [-0.25, 1.2]]),
    parallelogram: [[-1.5, -0.75], [0.7, -0.75], [1.5, 0.75], [-0.7, 0.75]],
    pentagon: regular(5, 1.4, 90),
    hexagon: regular(6, 1.4, 0),
    pinwheel3: pinwheel(3),
    pinwheel4: pinwheel(4),
    circle: null
  };
  const CIRCLE_R = 1.4;

  const rot = ([x, y], a) => { const c = Math.cos(a * RAD), s = Math.sin(a * RAD); return [c * x - s * y, s * x + c * y]; };
  // Mirror in the line through the origin at angle a.
  const refl = ([x, y], a) => { const c = Math.cos(2 * a * RAD), s = Math.sin(2 * a * RAD); return [c * x + s * y, s * x - c * y]; };
  const near = (p, q) => Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) < 1e-6;
  // Two polygons (as vertex sets, star-shaped about the origin) cover the same region.
  const same = (A, B) => A.length === B.length && A.every(p => B.some(q => near(p, q)));

  function isAxis(name, a) { const P = SHAPES[name]; return !P || same(P, P.map(p => refl(p, a))); }
  // All mirror lines (angles in [0, 180)). A mirror line through a polygon's centre passes through a vertex
  // or the midpoint of an edge, so those directions are the only candidates. Circle: Infinity.
  function axes(name) {
    const P = SHAPES[name]; if (!P) return Infinity;
    const cand = [];
    P.forEach((p, i) => { const q = P[(i + 1) % P.length]; cand.push(p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]); });
    const out = [];
    for (const [x, y] of cand) {
      let a = Math.atan2(y, x) / RAD; a = ((a % 180) + 180) % 180; a = Math.round(a * 1e6) / 1e6; if (a >= 180 - 1e-6) a = 0;
      if (!out.some(b => Math.abs(b - a) < 1e-4) && isAxis(name, a)) out.push(a);
    }
    return out.sort((p, q) => p - q);
  }
  function turnsOnto(name, a) { const P = SHAPES[name]; return !P || same(P, P.map(p => rot(p, a))); }
  // Whole-degree turns in 1..360 that land the shape on itself; their count is the order (times per full turn).
  function turns(name) { const out = []; for (let a = 1; a <= 360; a++) if (turnsOnto(name, a)) out.push(a); return out; }
  function order(name) { return SHAPES[name] ? turns(name).length : Infinity; }

  // Point in polygon (even–odd rule).
  function inside(P, x, y) {
    let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, yi] = P[i], [xj, yj] = P[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  // Fold along the line at angle a: the half on the right-hand side of the line's direction flips over onto the
  // left-hand side. Returns the part of the left half NOT covered exactly once (left only or flipped only),
  // as a fraction of the shape's area, from a grid of sample points (n × n (n = 173, so no sample row lies on an edge) over the box [−1.8, 1.8]²).
  function foldMismatch(name, a, n = 173) {
    const P = SHAPES[name]; if (!P) return 0;
    const nx = -Math.sin(a * RAD), ny = Math.cos(a * RAD), h = 3.6 / n;
    let bad = 0, total = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = -1.8 + (i + 0.5) * h, y = -1.8 + (j + 0.5) * h;
      const inP = inside(P, x, y); if (inP) total++;
      if (x * nx + y * ny < 0) continue;
      const [rx, ry] = refl([x, y], a);
      if (inP !== inside(P, rx, ry)) bad++;
    }
    return bad / total;
  }

  // Step 3: mirror in line 1 (angle 0), then in line 2 (angle θ) = turn by 2θ about the crossing point.
  // A flag on a pole: the pennant hangs on one side only, so the flag has no mirror line of its own.
  const FLAG = [[0, 0], [0.09, 0], [0.09, 0.38], [0.48, 0.53], [0.09, 0.68], [0, 0.68]];
  const placeFlag = (r, a) => FLAG.map(([u, v]) => rot([u + r, v - 0.34], a));
  function twoMirrors(theta, start = placeFlag(0.75, -55)) {
    const once = start.map(p => refl(p, 0)), twice = once.map(p => refl(p, theta)), turned = start.map(p => rot(p, 2 * theta));
    return { start, once, twice, turned, angle: 2 * theta, equal: twice.every((p, i) => near(p, turned[i])) };
  }

  // Step 4: kaleidoscope. A stamp is a flag at polar position (r, a). With n sectors every stamp is turned
  // through 360k/n; with the mirror on, each turned copy also gets a mirrored twin (mirror line at angle 0).
  function kaleido(stamps, n, mirror) {
    const out = [];
    for (const s of stamps) for (let k = 0; k < n; k++) {
      out.push({ r: s.r, a: s.a + 360 * k / n, flip: false, k });
      if (mirror) out.push({ r: s.r, a: -s.a + 360 * k / n, flip: true, k });
    }
    return out;
  }
  // Flag outline for a copy, in shape coordinates.
  function copyOutline(c, size = 0.42) {
    return FLAG.map(([u, v]) => { const p = [u * size / 0.68, (c.flip ? -(v - 0.34) : v - 0.34) * size / 0.68]; return rot([p[0] + c.r, p[1]], c.a); });
  }
  // Symmetry of a finished pattern of copies, checked directly on the outlines.
  function patternSymmetry(stamps, n, mirror) {
    const outl = kaleido(stamps, n, mirror).map(c => copyOutline(c)), pts = outl.flat();
    const has = f => pts.every(p => pts.some(q => near(f(p), q)));
    const turnsN = []; for (let a = 1; a <= 360; a++) if (has(p => rot(p, a))) turnsN.push(a);
    const ax = []; for (let a = 0; a < 180; a += 0.5) if (has(p => refl(p, a))) ax.push(a);
    return { turns: turnsN, order: turnsN.length, axes: ax };
  }
  const STAMPS = [{ r: 0.9, a: 12 }, { r: 0.45, a: 24 }];

  // Step 5 quiz.
  const QUIZ = {
    q1: { shape: 'rect', angle: 90 },                                         // options: yes / no
    q2: { options: ['rect', 'parallelogram', 'equilateral', 'isosceles'] },   // rotation but no axes
    q3: { shape: 'hexagon', options: [30, 60, 90, 120] }                     // smallest matching turn
  };
  function quizAnswers() {
    const a1 = turnsOnto(QUIZ.q1.shape, QUIZ.q1.angle) ? 0 : 1;
    const a2 = QUIZ.q2.options.findIndex(s => axes(s).length === 0 && order(s) > 1);
    const a3 = QUIZ.q3.options.indexOf(360 / order(QUIZ.q3.shape));
    return [a1, a2, a3];
  }

  const api = { SHAPES, CIRCLE_R, rot, refl, same, area, centre, isAxis, axes, turnsOnto, turns, order, inside, foldMismatch, FLAG, placeFlag, twoMirrors, kaleido, copyOutline, patternSymmetry, STAMPS, QUIZ, quizAnswers };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SYM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);

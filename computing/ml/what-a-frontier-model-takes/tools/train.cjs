'use strict';
/* Trains the essay's tiny transformer and writes ../weights.js (shipped) and ../tests/reference.json.
 *
 *   node computing/ml/what-a-frontier-model-takes/tools/train.cjs [--steps 3000] [--seed 1] [--check]
 *
 * Self-contained: its own forward pass (with stored activations) and a hand-written backward pass, so the
 * page's forward pass in models.js is checked against an independent implementation (tests/models.cjs).
 * Architecture: GPT-2 layout (pre-LayerNorm, learned positions, GELU MLP), 2 layers × 2 heads, d = 32.
 * Optimiser: AdamW (Loshchilov & Hutter 2019), β = (0.9, 0.95), weight decay 0.1 on matrices, linear warm-up
 * then cosine decay to 10 % of the peak rate; gradient-norm clipping at 1.
 * Task: models.js genSeq: a block of 3–12 distinct letters repeated to 25 letters; predict each next letter.
 * --check runs a finite-difference gradient check and exits. */
const fs = require('fs'), path = require('path');
const M = require(path.join(__dirname, '..', 'models.js'));
const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const STEPS = +arg('--steps', 3000), SEED = +arg('--seed', 1), BATCH = +arg('--batch', 32), LR = +arg('--lr', 3e-3);
const WARM = 200, EVAL_EVERY = 50, SNAP_EVERY = 100;
const cfg = M.TF.CFG, { V, T, d, H, dh, L, F } = cfg;
const lay = M.TF.layout(cfg), N = lay.size;
const E = {}; for (const e of lay.list) E[e.name] = e;
const sc = 1 / Math.sqrt(dh);

/* ── init ── */
function init(seed) {
  const r = M.rng(seed), w = new Float64Array(N);
  for (const e of lay.list) {
    const isG = /\.g$/.test(e.name), isB = /\.b$/.test(e.name) && e.r === 1;
    for (let k = 0; k < e.r * e.c; k++) {
      let v = 0;
      if (isG) v = 1;
      else if (isB) v = 0;
      else if (e.name === 'tok' || e.name === 'pos') v = 0.3 * M.gauss(r);
      else { const std = 1 / Math.sqrt(e.r) * (/(o|pr)\.W$/.test(e.name) ? 1 / Math.sqrt(2 * L) : 1); v = std * M.gauss(r); }
      w[e.off + k] = v;
    }
  }
  return w;
}
const P = (w, name) => w.subarray(E[name].off, E[name].off + E[name].r * E[name].c);

/* ── forward with stored activations ── */
const GC = Math.sqrt(2 / Math.PI);
function gelu(x) { return 0.5 * x * (1 + Math.tanh(GC * (x + 0.044715 * x * x * x))); }
function dgelu(x) { const t = Math.tanh(GC * (x + 0.044715 * x * x * x)); return 0.5 * (1 + t) + 0.5 * x * (1 - t * t) * GC * (1 + 3 * 0.044715 * x * x); }
function ln(x, n, g, b) {
  const xh = new Float64Array(n * d), y = new Float64Array(n * d), rs = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let m = 0; for (let j = 0; j < d; j++) m += x[i * d + j]; m /= d;
    let v = 0; for (let j = 0; j < d; j++) { const z = x[i * d + j] - m; v += z * z; } v /= d;
    const r = 1 / Math.sqrt(v + 1e-5); rs[i] = r;
    for (let j = 0; j < d; j++) { xh[i * d + j] = (x[i * d + j] - m) * r; y[i * d + j] = xh[i * d + j] * g[j] + b[j]; }
  }
  return { xh, y, rs };
}
function lnBack(dy, c, n, g, dg, db) {
  const dx = new Float64Array(n * d);
  for (let i = 0; i < n; i++) {
    let s1 = 0, s2 = 0;
    for (let j = 0; j < d; j++) { const dxh = dy[i * d + j] * g[j]; s1 += dxh; s2 += dxh * c.xh[i * d + j]; dg[j] += dy[i * d + j] * c.xh[i * d + j]; db[j] += dy[i * d + j]; }
    s1 /= d; s2 /= d;
    for (let j = 0; j < d; j++) dx[i * d + j] = c.rs[i] * (dy[i * d + j] * g[j] - s1 - c.xh[i * d + j] * s2);
  }
  return dx;
}
// Y (n × o) = X (n × k) · W (k × o) + b
function mm(X, n, k, W, b, o) { const Y = new Float64Array(n * o); for (let i = 0; i < n; i++) { for (let c = 0; c < o; c++) Y[i * o + c] = b ? b[c] : 0; for (let j = 0; j < k; j++) { const x = X[i * k + j]; if (x === 0) continue; const wo = j * o, yo = i * o; for (let c = 0; c < o; c++) Y[yo + c] += x * W[wo + c]; } } return Y; }
// grads of Y = X·W + b given dY: dW += Xᵀ dY, db += Σ dY, returns dX = dY · Wᵀ
function mmBack(X, n, k, W, o, dY, dW, db) {
  const dX = new Float64Array(n * k);
  for (let i = 0; i < n; i++) {
    const yo = i * o;
    if (db) for (let c = 0; c < o; c++) db[c] += dY[yo + c];
    for (let j = 0; j < k; j++) {
      const x = X[i * k + j], wo = j * o; let s = 0;
      for (let c = 0; c < o; c++) { const g = dY[yo + c]; dW[wo + c] += x * g; s += g * W[wo + c]; }
      dX[i * k + j] = s;
    }
  }
  return dX;
}

function fwd(w, toks) {
  const n = toks.length, st = { n, toks, layers: [] };
  let x = new Float64Array(n * d);
  const tok = P(w, 'tok'), pos = P(w, 'pos');
  for (let i = 0; i < n; i++) for (let j = 0; j < d; j++) x[i * d + j] = tok[toks[i] * d + j] + pos[i * d + j];
  for (let l = 0; l < L; l++) {
    const p = `l${l}.`, S = { xin: x };
    S.ln1 = ln(x, n, P(w, p + 'ln1.g'), P(w, p + 'ln1.b'));
    S.qkv = mm(S.ln1.y, n, d, P(w, p + 'qkv.W'), P(w, p + 'qkv.b'), 3 * d);
    S.P = []; S.z = new Float64Array(n * d);
    for (let h = 0; h < H; h++) {
      const A = new Float64Array(n * n), off = h * dh;
      for (let i = 0; i < n; i++) {
        let mx = -Infinity;
        for (let j = 0; j <= i; j++) { let s = 0; for (let c = 0; c < dh; c++) s += S.qkv[i * 3 * d + off + c] * S.qkv[j * 3 * d + d + off + c]; A[i * n + j] = s * sc; if (A[i * n + j] > mx) mx = A[i * n + j]; }
        let sum = 0; for (let j = 0; j <= i; j++) { A[i * n + j] = Math.exp(A[i * n + j] - mx); sum += A[i * n + j]; }
        for (let j = 0; j <= i; j++) A[i * n + j] /= sum;
        for (let j = 0; j <= i; j++) { const a = A[i * n + j]; for (let c = 0; c < dh; c++) S.z[i * d + off + c] += a * S.qkv[j * 3 * d + 2 * d + off + c]; }
      }
      S.P.push(A);
    }
    const att = mm(S.z, n, d, P(w, p + 'o.W'), P(w, p + 'o.b'), d);
    S.xmid = new Float64Array(n * d); for (let k = 0; k < n * d; k++) S.xmid[k] = x[k] + att[k];
    S.ln2 = ln(S.xmid, n, P(w, p + 'ln2.g'), P(w, p + 'ln2.b'));
    S.u = mm(S.ln2.y, n, d, P(w, p + 'fc.W'), P(w, p + 'fc.b'), F);
    S.ga = new Float64Array(n * F); for (let k = 0; k < n * F; k++) S.ga[k] = gelu(S.u[k]);
    const m = mm(S.ga, n, F, P(w, p + 'pr.W'), P(w, p + 'pr.b'), d);
    x = new Float64Array(n * d); for (let k = 0; k < n * d; k++) x[k] = S.xmid[k] + m[k];
    st.layers.push(S);
  }
  st.xL = x;
  st.lnf = ln(x, n, P(w, 'lnf.g'), P(w, 'lnf.b'));
  st.logits = mm(st.lnf.y, n, d, P(w, 'un.W'), P(w, 'un.b'), V);
  return st;
}
function probs(lg, i) { let mx = -Infinity; for (let k = 0; k < V; k++) mx = Math.max(mx, lg[i * V + k]); let s = 0; const p = new Float64Array(V); for (let k = 0; k < V; k++) { p[k] = Math.exp(lg[i * V + k] - mx); s += p[k]; } for (let k = 0; k < V; k++) p[k] /= s; return p; }

// backward for one sequence; scale = weight of this sequence's mean loss in the batch objective
function bwd(w, g, st, targets, scale) {
  const n = st.n; let loss = 0;
  const dlog = new Float64Array(n * V);
  for (let i = 0; i < n; i++) { const p = probs(st.logits, i); loss -= Math.log(p[targets[i]]); for (let k = 0; k < V; k++) dlog[i * V + k] = (p[k] - (k === targets[i] ? 1 : 0)) * scale / n; }
  const daf = mmBack(st.lnf.y, n, d, P(w, 'un.W'), V, dlog, P(g, 'un.W'), P(g, 'un.b'));
  let dx = lnBack(daf, st.lnf, n, P(w, 'lnf.g'), P(g, 'lnf.g'), P(g, 'lnf.b'));
  for (let l = L - 1; l >= 0; l--) {
    const p = `l${l}.`, S = st.layers[l];
    // MLP branch
    const dga = mmBack(S.ga, n, F, P(w, p + 'pr.W'), d, dx, P(g, p + 'pr.W'), P(g, p + 'pr.b'));
    const du = new Float64Array(n * F); for (let k = 0; k < n * F; k++) du[k] = dga[k] * dgelu(S.u[k]);
    const da2 = mmBack(S.ln2.y, n, d, P(w, p + 'fc.W'), F, du, P(g, p + 'fc.W'), P(g, p + 'fc.b'));
    const dxl2 = lnBack(da2, S.ln2, n, P(w, p + 'ln2.g'), P(g, p + 'ln2.g'), P(g, p + 'ln2.b'));
    const dxmid = new Float64Array(n * d); for (let k = 0; k < n * d; k++) dxmid[k] = dx[k] + dxl2[k];
    // attention branch
    const dz = mmBack(S.z, n, d, P(w, p + 'o.W'), d, dxmid, P(g, p + 'o.W'), P(g, p + 'o.b'));
    const dqkv = new Float64Array(n * 3 * d);
    for (let h = 0; h < H; h++) {
      const A = S.P[h], off = h * dh;
      for (let i = 0; i < n; i++) {
        const dP = new Float64Array(i + 1); let dot = 0;
        for (let j = 0; j <= i; j++) {
          let s = 0; for (let c = 0; c < dh; c++) s += dz[i * d + off + c] * S.qkv[j * 3 * d + 2 * d + off + c];
          dP[j] = s; dot += s * A[i * n + j];
          const a = A[i * n + j]; for (let c = 0; c < dh; c++) dqkv[j * 3 * d + 2 * d + off + c] += a * dz[i * d + off + c];
        }
        for (let j = 0; j <= i; j++) {
          const dS = A[i * n + j] * (dP[j] - dot) * sc;
          if (dS === 0) continue;
          for (let c = 0; c < dh; c++) {
            dqkv[i * 3 * d + off + c] += dS * S.qkv[j * 3 * d + d + off + c];
            dqkv[j * 3 * d + d + off + c] += dS * S.qkv[i * 3 * d + off + c];
          }
        }
      }
    }
    const da1 = mmBack(S.ln1.y, n, d, P(w, p + 'qkv.W'), 3 * d, dqkv, P(g, p + 'qkv.W'), P(g, p + 'qkv.b'));
    const dxl1 = lnBack(da1, S.ln1, n, P(w, p + 'ln1.g'), P(g, p + 'ln1.g'), P(g, p + 'ln1.b'));
    const nx = new Float64Array(n * d); for (let k = 0; k < n * d; k++) nx[k] = dxmid[k] + dxl1[k];
    dx = nx;
  }
  const gt = P(g, 'tok'), gp = P(g, 'pos');
  for (let i = 0; i < n; i++) for (let j = 0; j < d; j++) { gt[st.toks[i] * d + j] += dx[i * d + j]; gp[i * d + j] += dx[i * d + j]; }
  return loss / n;
}
function lossOnly(w, toks, targets) { const st = fwd(w, toks); let s = 0; for (let i = 0; i < st.n; i++) s -= Math.log(probs(st.logits, i)[targets[i]]); return s / st.n; }

/* ── gradient check ── */
if (args.includes('--check')) {
  const w = init(7), r = M.rng(3), ex = M.genSeq(r, cfg), toks = ex.seq.slice(0, T), tg = ex.seq.slice(1);
  // perturb LN gains/biases so their gradients are not trivially symmetric
  for (let k = 0; k < N; k++) w[k] += 0.05 * M.gauss(r);
  const g = new Float64Array(N); bwd(w, g, fwd(w, toks), tg, 1);
  let worst = 0;
  for (const e of lay.list) for (let t = 0; t < 4; t++) {
    const k = e.off + Math.floor(r() * e.r * e.c), h = 1e-5, o = w[k];
    w[k] = o + h; const lp = lossOnly(w, toks, tg); w[k] = o - h; const lm = lossOnly(w, toks, tg); w[k] = o;
    // key biases have exactly zero gradient (softmax is shift-invariant), so an absolute error below the
    // finite-difference noise floor (~1e-10) also passes
    const num = (lp - lm) / (2 * h), abs = Math.abs(num - g[k]), rel = (Math.abs(num) + Math.abs(g[k]) < 1e-7) ? (abs < 1e-9 ? 0 : 1) : abs / (Math.abs(num) + Math.abs(g[k]));
    if (rel > worst) worst = rel;
    if (rel > 1e-5) console.log('grad mismatch', e.name, num, g[k], rel);
  }
  console.log('gradient check: worst relative error', worst.toExponential(2));
  process.exit(worst < 1e-5 ? 0 : 1);
}

/* ── training ── */
const w = init(SEED), m1 = new Float64Array(N), m2 = new Float64Array(N);
const decay = new Uint8Array(N); for (const e of lay.list) if (e.r > 1) decay.fill(1, e.off, e.off + e.r * e.c);
const lrAt = s => s < WARM ? LR * (s + 1) / WARM : LR * (0.1 + 0.9 * 0.5 * (1 + Math.cos(Math.PI * (s - WARM) / Math.max(1, STEPS - WARM))));
const evalSet = M.evalSet(777, 128, cfg);
const EXAMPLE = 'tokenstokenstokenstokenst'.split('').map(c => c.charCodeAt(0) - 97); // T + 1 letters
const rec = { step: [], loss: [], lossRep: [], lossNew: [], accRep: [], lr: [], heads: [] };
const snaps = { step: [], data: [] };

function evaluate(wt) {
  let sAll = 0, sRep = 0, sNew = 0, nRep = 0, nNew = 0, hit = 0;
  const hs = []; for (let k = 0; k < L * H; k++) hs.push([0, 0]); let nPrev = 0, nInd = 0;
  for (const ex of evalSet) {
    const st = fwd(wt, ex.seq.slice(0, T));
    for (let i = 0; i < T; i++) {
      const p = probs(st.logits, i), y = ex.seq[i + 1], ce = -Math.log(p[y]); sAll += ce;
      if (i >= ex.p) { sRep += ce; nRep++; let b = 0; for (let k = 1; k < V; k++) if (p[k] > p[b]) b = k; if (b === y) hit++; } else { sNew += ce; nNew++; }
    }
    for (let l = 0; l < L; l++) for (let h = 0; h < H; h++) { const A = st.layers[l].P[h], o = hs[l * H + h]; for (let i = 1; i < T; i++) o[0] += A[i * T + i - 1]; for (let i = ex.p; i < T; i++) for (let j = 1; j <= i; j++) if (ex.seq[j - 1] === ex.seq[i]) o[1] += A[i * T + j]; }
    nPrev += T - 1; nInd += T - ex.p;
  }
  return { loss: sAll / (evalSet.length * T), lossRep: sRep / nRep, lossNew: sNew / nNew, accRep: hit / nRep, heads: hs.map(o => [o[0] / nPrev, o[1] / nInd]) };
}
function snapshot(wt, step) {
  const st = fwd(wt, EXAMPLE.slice(0, T)), out = [];
  for (let l = 0; l < L; l++) for (let h = 0; h < H; h++) { const A = st.layers[l].P[h]; for (let i = 0; i < T; i++) for (let j = 0; j <= i; j++) out.push(Math.round(A[i * T + j] * 255)); }
  snaps.step.push(step); snaps.data.push(...out);
}
function record(step) {
  const e = evaluate(w);
  rec.step.push(step); rec.loss.push(+e.loss.toFixed(4)); rec.lossRep.push(+e.lossRep.toFixed(4)); rec.lossNew.push(+e.lossNew.toFixed(4)); rec.accRep.push(+e.accRep.toFixed(4)); rec.lr.push(+lrAt(step).toExponential(3));
  rec.heads.push(e.heads.map(h => [+h[0].toFixed(3), +h[1].toFixed(3)]));
  return e;
}

const data = M.rng(SEED * 1000 + 17), t0 = Date.now();
record(0); snapshot(w, 0);
for (let s = 0; s < STEPS; s++) {
  const g = new Float64Array(N); let loss = 0;
  for (let b = 0; b < BATCH; b++) { const ex = M.genSeq(data, cfg); loss += bwd(w, g, fwd(w, ex.seq.slice(0, T)), ex.seq.slice(1), 1 / BATCH) / BATCH; }
  let gn = 0; for (let k = 0; k < N; k++) gn += g[k] * g[k]; gn = Math.sqrt(gn);
  const clip = gn > 1 ? 1 / gn : 1, lr = lrAt(s), b1 = 0.9, b2 = 0.95, t = s + 1;
  for (let k = 0; k < N; k++) {
    const gk = g[k] * clip;
    m1[k] = b1 * m1[k] + (1 - b1) * gk; m2[k] = b2 * m2[k] + (1 - b2) * gk * gk;
    const mh = m1[k] / (1 - Math.pow(b1, t)), vh = m2[k] / (1 - Math.pow(b2, t));
    w[k] -= lr * (mh / (Math.sqrt(vh) + 1e-8) + (decay[k] ? 0.1 * w[k] : 0));
  }
  if ((s + 1) % EVAL_EVERY === 0) {
    const e = record(s + 1);
    console.log(`step ${s + 1} loss ${e.loss.toFixed(4)} rep ${e.lossRep.toFixed(4)} new ${e.lossNew.toFixed(4)} acc ${(e.accRep * 100).toFixed(1)}% heads ${e.heads.map(h => h.map(v => v.toFixed(2)).join('/')).join(' ')} | ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  if ((s + 1) % SNAP_EVERY === 0) snapshot(w, s + 1);
}

/* ── write out: float32 weights (what ships), and reference outputs of this file's forward pass on them ── */
const f32 = new Float32Array(N); for (let k = 0; k < N; k++) f32[k] = w[k];
const w32 = Float64Array.from(f32);
const b64 = Buffer.from(f32.buffer).toString('base64');
const snapB64 = Buffer.from(Uint8Array.from(snaps.data)).toString('base64');
const pack = {
  cfg, params: N, seed: SEED, steps: STEPS, batch: BATCH, lr: LR, warmup: WARM, evalEvery: EVAL_EVERY,
  example: EXAMPLE, train: rec, snaps: { step: snaps.step, b64: snapB64 }, weights: b64,
};
const out = path.resolve(__dirname, '..', arg('--out', 'weights.js'));
fs.writeFileSync(out, '/* Generated by tools/train.cjs — the tiny transformer\'s trained weights (float32, base64) and its training record. */\n' +
  'window.TINY_TF = ' + JSON.stringify(pack) + ';\n');
const refSet = M.evalSet(4242, 3, cfg).map(ex => ex.seq.slice(0, T));
refSet.push(EXAMPLE.slice(0, T), EXAMPLE.slice(0, 9));
const ref = refSet.map(toks => ({ toks, logits: Array.from(fwd(w32, toks).logits) }));
fs.writeFileSync(path.resolve(__dirname, '..', arg('--ref', 'tests/reference.json')), JSON.stringify({ note: 'logits from tools/train.cjs forward pass on the float32 weights in weights.js', ref }));
console.log('wrote', out, (fs.statSync(out).size / 1024).toFixed(1), 'KB; params', N, '; time', ((Date.now() - t0) / 1000).toFixed(0), 's');

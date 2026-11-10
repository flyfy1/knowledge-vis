'use strict';
// Attention & memory lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Five small teaching models — chunk capacity, a rehearsal-buffer model of serial position, Pashler's central
// bottleneck (PRP), a cue–trace feature-overlap model and a strength-competition model of interference.
// They reproduce well-known qualitative findings; their numbers are model outputs, not experimental data.
(function (root) {
  // ---- Step 0: chunks ----
  const STRINGS0 = {
    acronyms: { chunks: ['FBI', 'CIA', 'USA', 'NBA'] },
    years: { chunks: ['1492', '1776', '1984'] },
    random: { chunks: ['QJX', 'RTM', 'WLK', 'PZD'] }, // grouping shown only to keep the layout; no meaning to chunk by
  };
  /** familiar: the reader knows the meaning, so each meaningful group is one chunk; otherwise every symbol is its own chunk.
   *  Working memory holds the first K chunks (in presentation order). */
  function chunkRecall(key, familiar, K) {
    const groups = STRINGS0[key].chunks, canChunk = familiar && key !== 'random';
    const units = canChunk ? groups.slice() : groups.join('').split('');
    const held = units.slice(0, K), letters = groups.join('').length;
    return { units, held, nUnits: units.length, recalled: held.join('').length, letters, all: held.length === units.length };
  }

  // ---- Step 1: serial position (rehearsal-buffer model, after Atkinson & Shiffrin) ----
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const SP = { buffer: 4, alpha: 0.35, bufferRecall: 0.95, people: 2000 };
  /** L items, rate seconds per item, delay: true = 30 s of counting backwards before recall (empties the buffer).
   *  Returns per-position recall probability and the part that came only from the buffer. */
  function serialPosition(L, rate, delay, seed = 11) {
    const r = rng(seed), total = new Float64Array(L), fromBuf = new Float64Array(L);
    for (let p = 0; p < SP.people; p++) {
      const buf = [], str = new Float64Array(L);
      for (let i = 0; i < L; i++) {
        if (buf.length === SP.buffer) buf.splice(Math.floor(r() * buf.length), 1);
        buf.push(i);
        for (const j of buf) str[j] += SP.alpha * rate / buf.length; // rehearsal time is shared by everything in the buffer
      }
      const inBuf = new Set(delay ? [] : buf);
      for (let i = 0; i < L; i++) {
        const ltm = 1 - Math.exp(-str[i]);
        if (inBuf.has(i)) { const pr = SP.bufferRecall + (1 - SP.bufferRecall) * ltm; total[i] += pr; fromBuf[i] += pr - ltm; }
        else total[i] += ltm;
      }
    }
    return { p: Array.from(total, v => v / SP.people), buf: Array.from(fromBuf, v => v / SP.people) };
  }

  // ---- Step 2: psychological refractory period (central bottleneck, after Pashler 1994) ----
  const PRP = { A1: 100, C1: 100, A2: 100, A2hard: 250, B2: 150, C2: 100 };
  /** Stage times in ms. Task 2's central stage B2 cannot start until B1 has finished. */
  function prp(soa, B1, hard) {
    const A1 = PRP.A1, C1 = PRP.C1, A2 = hard ? PRP.A2hard : PRP.A2, B2 = PRP.B2, C2 = PRP.C2;
    const t1 = { a: [0, A1], b: [A1, A1 + B1], c: [A1 + B1, A1 + B1 + C1] };
    const a2end = soa + A2, b2start = Math.max(a2end, A1 + B1);
    const t2 = { a: [soa, a2end], wait: [a2end, b2start], b: [b2start, b2start + B2], c: [b2start + B2, b2start + B2 + C2] };
    return { t1, t2, rt1: A1 + B1 + C1, rt2: t2.c[1] - soa, wait: b2start - a2end, critical: A1 + B1 - A2 };
  }

  // ---- Step 3: retrieval as cue–trace overlap ----
  const CUE = { q: 0.2, base: 1, semantic: { shallow: 1, deep: 5 }, context: 2, selfCue: 2, categoryCue: 4 };
  /** depth 'shallow'|'deep', sameRoom bool, cue 'free'|'category'. Each matching feature independently revives the trace with probability q. */
  function retrieval(depth, sameRoom, cue) {
    const enc = CUE.semantic[depth];
    const sem = Math.min(enc, cue === 'category' ? CUE.categoryCue : CUE.selfCue), ctx = sameRoom ? CUE.context : 0;
    const m = CUE.base + sem + ctx;
    return { enc, sem, ctx, m, p: 1 - Math.pow(1 - CUE.q, m) };
  }

  // ---- Step 4: interference as competition between associations to the same cue ----
  const INT = { tau: 24, gap: 12, k: 0.3 };
  /** Target pairs are learned at hour 0 and tested at hour gap + delay in every design (same retention interval).
   *  proactive: the other list is learned at hour −gap; retroactive: at hour +gap; control: nothing else.
   *  design 'control'|'proactive'|'retroactive', sim = similarity of the other list (0–1). */
  function interference(design, sim, delay) {
    const decay = age => Math.exp(-age / INT.tau);
    const ageT = INT.gap + delay;
    const ageC = design === 'proactive' ? 2 * INT.gap + delay : design === 'retroactive' ? delay : null;
    const sT = decay(ageT), sC = ageC === null ? 0 : sim * decay(ageC);
    return { sT, sC, k: INT.k, p: sT / (sT + sC + INT.k), ageT, ageC };
  }

  const api = { STRINGS0, chunkRecall, SP, serialPosition, PRP, prp, CUE, retrieval, INT, interference, rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MEM_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);

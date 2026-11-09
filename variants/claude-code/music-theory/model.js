'use strict';
// Music theory model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pitches are MIDI numbers (60 = C4, 69 = A4 = 440 Hz), twelve-tone equal temperament unless a function says
// "just". Every name, ratio, count and motion shown on the page is computed here; tests/core.cjs pins the claims.
(function (root) {
  const A4 = 440, A4_MIDI = 69;
  const freq = midi => A4 * Math.pow(2, (midi - A4_MIDI) / 12);
  const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const pc = m => ((m % 12) + 12) % 12;
  const octave = m => Math.floor(m / 12) - 1;
  const nameSharp = m => SHARP[pc(m)] + octave(m);
  const isBlack = m => [1, 3, 6, 8, 10].includes(pc(m));
  const cents = (a, b) => 1200 * Math.log2(a / b);

  // Interval of k semitones (0..12): equal-tempered ratio and the 5-limit just ratio it approximates.
  const JUST = [[1, 1], [16, 15], [9, 8], [6, 5], [5, 4], [4, 3], [45, 32], [3, 2], [8, 5], [5, 3], [9, 5], [15, 8], [2, 1]];
  const etRatio = k => Math.pow(2, k / 12);
  const justRatio = k => JUST[k][0] / JUST[k][1];
  const centsOff = k => cents(etRatio(k), justRatio(k)); // + means the tempered interval is wider
  // Shared harmonics among the first N of each note when the ratio is exactly p/q (lowest terms): floor(N / max(p, q)).
  function sharedHarmonics(k, N = 10) {
    // lower note f, upper note f·p/q: harmonic m of the lower meets harmonic n of the upper when m·q = n·p
    const [p, q] = JUST[k]; let c = 0;
    for (let m = 1; m <= N; m++) for (let n = 1; n <= N; n++) if (m * q === n * p) c++;
    return c;
  }
  // Harmonic pairs for the picture: lower note f1, upper note f2 (either tuning). A pair "meets" in just tuning
  // when m·q = n·p; in equal temperament the same pair is off by |m·f1 − n·f2| Hz, heard as that many beats per second.
  function harmonicPairs(k, f1, tuning, N = 10) {
    const [p, q] = JUST[k], f2 = f1 * (tuning === 'just' ? p / q : etRatio(k)), out = [];
    for (let m = 1; m <= N; m++) for (let n = 1; n <= N; n++) if (m * q === n * p) out.push({ m, n, fm: m * f1, fn: n * f2, beat: Math.abs(m * f1 - n * f2) });
    return { f2, pairs: out };
  }

  // Scales. Spelling: each letter once; tonic spelled from the lists below so no double accidentals appear.
  const STEPS = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
  const TONIC = { major: ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'], minor: ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'] };
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], NAT = [0, 2, 4, 5, 7, 9, 11];
  const ACC = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };
  function spell(tonicPc, mode) {
    const tn = TONIC[mode][tonicPc], L0 = LETTERS.indexOf(tn[0]);
    return STEPS[mode].map((s, d) => {
      const li = (L0 + d) % 7, target = (tonicPc + s) % 12; let off = ((target - NAT[li]) % 12 + 12) % 12; if (off > 6) off -= 12;
      return { name: LETTERS[li] + ACC[off], pc: target, acc: off };
    });
  }
  const stepPattern = mode => STEPS[mode].map((s, d) => (d < 6 ? STEPS[mode][d + 1] : 12) - s);
  function signature(tonicPc, mode) { const sc = spell(tonicPc, mode); return { sharps: sc.filter(n => n.acc > 0).length, flats: sc.filter(n => n.acc < 0).length }; }

  // Diatonic triads of a major key: stack every other scale note.
  const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const FUNC = ['T', 'S', 'T', 'S', 'D', 'T', 'D'];
  function triad(tonicPc, deg, mode = 'major') { // deg 0..6
    const sc = spell(tonicPc, mode), idx = [deg, (deg + 2) % 7, (deg + 4) % 7], semis = idx.map(i => STEPS[mode][i]);
    const rel = semis.map(s => ((s - semis[0]) % 12 + 12) % 12), lower = rel[1], upper = rel[2] - rel[1];
    const quality = lower === 4 && upper === 3 ? 'maj' : lower === 3 && upper === 4 ? 'min' : lower === 3 && upper === 3 ? 'dim' : 'aug';
    return { deg, notes: idx.map(i => sc[i]), pcs: idx.map(i => sc[i].pc), lower, upper, quality, roman: ROMAN[deg], func: FUNC[deg] };
  }
  const commonTones = (a, b) => a.pcs.filter(x => b.pcs.includes(x)).length;
  // Leading tone = degree 7 (a semitone under the tonic); with degree 4 it forms the tritone of V and vii°.
  const hasLeadingTone = (tonicPc, ch) => ch.pcs.includes((tonicPc + 11) % 12);
  const hasTritone = ch => ch.pcs.some(a => ch.pcs.some(b => pc(b - a) === 6));

  // Voice leading: three upper voices in close root position, each moving to a distinct tone of the next chord
  // by the smallest total number of semitones (each voice takes the nearest octave of its target).
  function closeVoicing(tonicPc, deg) {
    const ch = triad(tonicPc, deg); let r = 60 + ch.pcs[0]; if (r > 66) r -= 12;
    const v = [r]; for (let i = 1; i < 3; i++) { let m = v[i - 1] + 1; while (pc(m) !== ch.pcs[i]) m++; v.push(m); }
    return v;
  }
  const PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  function voiceLead(from, targetPcs) {
    let best = null;
    for (const P of PERMS) {
      const to = from.map((m, i) => { const t = targetPcs[P[i]]; let d = pc(t - m); if (d > 6) d -= 12; return m + d; });
      const total = to.reduce((s, m, i) => s + Math.abs(m - from[i]), 0);
      const distinct = new Set(to).size === 3;
      if (distinct && (!best || total < best.total)) best = { to, total, moves: to.map((m, i) => m - from[i]) };
    }
    return best;
  }
  // Cadences recognised on this page (major key, degrees 0-based): authentic V→I, plagal IV→I, half (anything)→V,
  // deceptive V→vi. Everything else is just "a progression".
  function cadence(d1, d2) {
    if (d1 === 4 && d2 === 0) return 'authentic';
    if (d1 === 6 && d2 === 0) return 'leading';
    if (d1 === 3 && d2 === 0) return 'plagal';
    if (d1 === 4 && d2 === 5) return 'deceptive';
    if (d2 === 4 && d1 !== 4) return 'half';
    return 'none';
  }
  function progression(tonicPc, d1, d2) {
    const from = closeVoicing(tonicPc, d1), c1 = triad(tonicPc, d1), c2 = triad(tonicPc, d2), vl = voiceLead(from, c2.pcs);
    const lt = (tonicPc + 11) % 12, tonic = tonicPc, fourth = (tonicPc + 5) % 12, third = (tonicPc + 4) % 12;
    const ltResolves = from.some((m, i) => pc(m) === lt && vl.to[i] - m === 1 && pc(vl.to[i]) === tonic);
    const faResolves = from.some((m, i) => pc(m) === fourth && vl.to[i] - m === -1 && pc(vl.to[i]) === third);
    return { from, to: vl.to, moves: vl.moves, total: vl.total, common: commonTones(c1, c2), c1, c2, type: cadence(d1, d2), ltResolves, faResolves };
  }

  // Quiz bank (seeded): interval naming, triad quality, cadence naming.
  function mulberry32(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function question(seed) {
    const R = mulberry32(seed * 40503 + 7), pick = n => Math.floor(R() * n), kind = seed % 3;
    if (kind === 0) { const a = 57 + pick(12), k = 1 + pick(12); return { kind: 'qInt', a, b: a + k, answer: k, options: optionSet(k, 13, R) }; }
    if (kind === 1) { const tp = pick(12), d = pick(7); const q = triad(tp, d).quality; return { kind: 'qTri', tonic: tp, deg: d, answer: q, options: ['maj', 'min', 'dim'] }; }
    const pairs = [[4, 0], [3, 0], [1, 4], [4, 5], [0, 4], [3, 4]], [d1, d2] = pairs[pick(pairs.length)], tp = pick(12);
    return { kind: 'qCad', tonic: tp, d1, d2, answer: cadence(d1, d2), options: ['authentic', 'plagal', 'half', 'deceptive'] };
  }
  function optionSet(k, n, R) { const s = new Set([k]); while (s.size < 4) s.add(1 + Math.floor(R() * 12)); return [...s].sort((a, b) => a - b); }

  const api = { A4, A4_MIDI, freq, SHARP, pc, octave, nameSharp, isBlack, cents, JUST, etRatio, justRatio, centsOff, sharedHarmonics, harmonicPairs, STEPS, TONIC, spell, stepPattern, signature, ROMAN, FUNC, triad, commonTones, hasLeadingTone, hasTritone, closeVoicing, voiceLead, cadence, progression, question };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MT_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);

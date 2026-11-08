'use strict';
// Vowel space teaching model. Author: Claude Code (claude-opus-5-5), 2026-11-08.
// DATA: group means computed by this page's author from the 1520 Peterson & Barney (1952) measurements
// (JASA 24:175–184) as distributed in Praat's source, dwtools/Table_dataSets.cpp at commit
// 6a9874e525d80a2b4c2e6a8d687081963c6d4e6a (sha256 3027b885…a3cc3). Every token was averaged,
// including the 321 rows whose source flag records a "*" in front of the vowel type. Rounded to 1 Hz.
// Values are [F0, F1, F2, F3] in Hz. Recompute with tools/pb-means.cjs <path to Table_dataSets.cpp>.
(function (root) {
  // Order and labels follow the Praat table (heed iy, hid ih, head eh, had ae, hud ah, hod aa,
  // hawed ao, hood uh, who'd uw, heard er) with Peterson & Barney's IPA symbols.
  const VOWELS = [
    { id: 'iy', ipa: 'i', word: 'heed' }, { id: 'ih', ipa: 'ɪ', word: 'hid' },
    { id: 'eh', ipa: 'ɛ', word: 'head' }, { id: 'ae', ipa: 'æ', word: 'had' },
    { id: 'ah', ipa: 'ʌ', word: 'hud' }, { id: 'aa', ipa: 'ɑ', word: 'hod' },
    { id: 'ao', ipa: 'ɔ', word: 'hawed' }, { id: 'uh', ipa: 'ʊ', word: 'hood' },
    { id: 'uw', ipa: 'u', word: "who'd" }, { id: 'er', ipa: 'ɝ', word: 'heard' },
  ];
  const MEANS = {
    m: { iy: [136, 267, 2294, 2937], ih: [136, 392, 1993, 2569], eh: [128, 526, 1854, 2481], ae: [125, 664, 1727, 2420], ah: [129, 631, 1192, 2377], aa: [124, 718, 1091, 2442], ao: [127, 568, 836, 2403], uh: [136, 437, 1023, 2245], uw: [139, 307, 876, 2239], er: [133, 489, 1360, 1709] },
    w: { iy: [231, 310, 2783, 3312], ih: [232, 441, 2474, 3063], eh: [220, 608, 2334, 2999], ae: [208, 863, 2049, 2832], ah: [223, 758, 1409, 2768], aa: [212, 864, 1229, 2783], ao: [217, 587, 915, 2736], uh: [234, 469, 1162, 2685], uw: [235, 378, 961, 2666], er: [219, 503, 1641, 1977] },
    c: { iy: [270, 360, 3178, 3763], ih: [270, 534, 2744, 3604], eh: [259, 700, 2616, 3564], ae: [248, 1017, 2334, 3366], ah: [263, 855, 1592, 3328], aa: [258, 1030, 1383, 3188], ao: [259, 694, 1064, 3263], uh: [273, 560, 1402, 3332], uw: [278, 432, 1193, 3250], er: [264, 569, 1806, 2194] },
  };
  // Tokens per vowel: 2 repetitions × speakers (33 men, 28 women, 15 children of whom 8 female).
  const TOKENS = { m: 66, w: 56, c: 30 };
  const GROUPS = ['m', 'w', 'c'];
  const IDS = VOWELS.map(v => v.id);

  // Schematic spectrum for step 0: harmonics at k·F0 scaled by a sum of resonance bumps at F1–F3.
  // The bump shape and bandwidth are drawing choices of this page; only F0 and F1–F3 are data.
  function envelope(f, fm, bw = 90) {
    const amps = [1, 0.7, 0.45];
    let s = 0;
    for (let i = 0; i < 3; i++) s += amps[i] / (1 + Math.pow((f - fm[i]) / bw, 2));
    return s + 0.03;
  }
  function harmonics(f0, fmax) { const out = []; for (let k = 1; k * f0 <= fmax; k++) out.push(k * f0); return out; }

  // Log formants of one group, optionally divided by that group's geometric mean over the ten vowels
  // (subtracting the mean log). lambda in [0,1] blends raw (0) and normalised (1). This is a simple
  // normalisation chosen for this page, applied separately to F1 and F2.
  const lf = (g, v) => [Math.log(MEANS[g][v][1]), Math.log(MEANS[g][v][2])];
  function groupLogMean(g) {
    const s = [0, 0]; IDS.forEach(v => { const p = lf(g, v); s[0] += p[0]; s[1] += p[1]; });
    return [s[0] / IDS.length, s[1] / IDS.length];
  }
  // Reference = men's log mean, so lambda = 1 shifts every group onto the men's centre (units stay Hz-like).
  function point(g, v, lambda = 0) {
    const p = lf(g, v), gm = groupLogMean(g), ref = groupLogMean('m');
    return [p[0] - lambda * (gm[0] - ref[0]), p[1] - lambda * (gm[1] - ref[1])];
  }
  const hz = p => [Math.exp(p[0]), Math.exp(p[1])];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  // Nearest men's vowel to a point (log-F1, log-F2 distance).
  function nearest(p) {
    let best = null;
    for (const v of IDS) { const d = dist(p, point('m', v, 0)); if (!best || d < best.d) best = { v, d }; }
    return best;
  }
  function classify(g, lambda) { return IDS.map(v => ({ v, as: nearest(point(g, v, lambda)).v })); }
  const correct = (g, lambda) => classify(g, lambda).filter(r => r.as === r.v).length;
  // Mean distance (log units) from a group's vowel to the same vowel of the men.
  const spread = (g, lambda) => IDS.reduce((s, v) => s + dist(point(g, v, lambda), point('m', v, 0)), 0) / IDS.length;

  const api = { VOWELS, MEANS, TOKENS, GROUPS, IDS, envelope, harmonics, groupLogMean, point, hz, dist, nearest, classify, correct, spread };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VOWEL = api;
})(typeof window !== 'undefined' ? window : globalThis);

'use strict';
// Speech sounds & phonemes model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure data + rules: consonant features, minimal-pair search, VOT categories, onset phonotactics, suffix rules.
// Every highlighted cell, verdict and count on the page comes from here; tests/core.cjs pins the claims.
(function (root) {
  const PLACES = ['bilabial', 'labiodental', 'dental', 'alveolar', 'postalveolar', 'velar'];
  const MANNERS = ['stop', 'affricate', 'fricative', 'nasal'];
  // The 19 English consonants built from place × manner × voicing (h, l, r, w, j are left out of the chart).
  const CONS = [
    ['p', 'bilabial', 'stop', false, 'pie'], ['b', 'bilabial', 'stop', true, 'buy'],
    ['t', 'alveolar', 'stop', false, 'tie'], ['d', 'alveolar', 'stop', true, 'die'],
    ['k', 'velar', 'stop', false, 'kite'], ['g', 'velar', 'stop', true, 'guy'],
    ['tʃ', 'postalveolar', 'affricate', false, 'chin'], ['dʒ', 'postalveolar', 'affricate', true, 'gin'],
    ['f', 'labiodental', 'fricative', false, 'fan'], ['v', 'labiodental', 'fricative', true, 'van'],
    ['θ', 'dental', 'fricative', false, 'thin'], ['ð', 'dental', 'fricative', true, 'then'],
    ['s', 'alveolar', 'fricative', false, 'sip'], ['z', 'alveolar', 'fricative', true, 'zip'],
    ['ʃ', 'postalveolar', 'fricative', false, 'ship'], ['ʒ', 'postalveolar', 'fricative', true, 'measure'],
    ['m', 'bilabial', 'nasal', true, 'my'], ['n', 'alveolar', 'nasal', true, 'no'], ['ŋ', 'velar', 'nasal', true, 'sing'],
  ].map(([ipa, place, manner, voiced, ex]) => ({ ipa, place, manner, voiced, ex }));
  const byIpa = Object.fromEntries(CONS.map(c => [c.ipa, c]));

  function find(place, manner, voiced) { return CONS.find(c => c.place === place && c.manner === manner && c.voiced === voiced) || null; }
  // Which of the three features differ between two consonants.
  function diff(a, b) { const out = []; if (a.place !== b.place) out.push('place'); if (a.manner !== b.manner) out.push('manner'); if (a.voiced !== b.voiced) out.push('voicing'); return out; }
  // English consonants that differ from c in exactly one feature.
  function neighbours(c) { return CONS.filter(o => o !== c && diff(c, o).length === 1).map(o => ({ c: o, feature: diff(c, o)[0] })); }

  // Step 1: word frames — initial consonant + fixed rest. Only everyday spellings are listed.
  const FRAMES = {
    at: { rest: 'æt', words: { p: 'pat', b: 'bat', t: 'tat', m: 'mat', f: 'fat', v: 'vat', 'ð': 'that', n: 'gnat', s: 'sat', k: 'cat', 'tʃ': 'chat' } },
    ip: { rest: 'ɪp', words: { p: 'pip', t: 'tip', d: 'dip', n: 'nip', s: 'sip', z: 'zip', 'ʃ': 'ship', 'tʃ': 'chip' } },
    ie: { rest: 'aɪ', words: { p: 'pie', b: 'by', m: 'my', v: 'vie', 'θ': 'thigh', 'ð': 'thy', t: 'tie', d: 'die', n: 'nigh', s: 'sigh', 'ʃ': 'shy', g: 'guy' } },
  };
  function framePairs(frame) {
    const w = FRAMES[frame].words, ks = Object.keys(w), all = [], one = [];
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
      const d = diff(byIpa[ks[i]], byIpa[ks[j]]); all.push([ks[i], ks[j]]); if (d.length === 1) one.push({ a: ks[i], b: ks[j], feature: d[0] });
    }
    const byFeature = { place: 0, manner: 0, voicing: 0 }; one.forEach(p => byFeature[p.feature]++);
    return { words: ks.length, all: all.length, one, byFeature };
  }

  // Step 2: voice onset time (VOT, ms) — approximate mean values for word-initial bilabial stops reported by
  // Lisker & Abramson (1964). Category boundaries here are a model: each VOT goes to the nearest mean.
  const VOT = {
    en: [{ cat: 'b', mean: 1 }, { cat: 'p', mean: 58 }],
    es: [{ cat: 'b', mean: -138 }, { cat: 'p', mean: 4 }],
    th: [{ cat: 'b', mean: -97 }, { cat: 'p', mean: 6 }, { cat: 'pʰ', mean: 64 }],
  };
  function classify(langKey, vot) { let best = null; for (const c of VOT[langKey]) if (!best || Math.abs(vot - c.mean) < Math.abs(vot - best.mean)) best = c; return best.cat; }
  function boundaries(langKey) { const m = VOT[langKey]; const out = []; for (let i = 0; i + 1 < m.length; i++) out.push((m[i].mean + m[i + 1].mean) / 2); return out; }

  // Step 3: two-slot onsets before the rhyme -ip. Sonority: stop 1, fricative 2, nasal 3, liquid 4, glide 5, vowel 6.
  const ONSET1 = ['p', 'b', 't', 'd', 'k', 'g', 'f', 'θ', 's', 'ʃ', 'm', 'n', 'l', 'r', 'w'];
  const ONSET2 = ['', 'p', 't', 'k', 'm', 'n', 'l', 'r', 'w'];
  const SON_CLASS = { p: 'stop', b: 'stop', t: 'stop', d: 'stop', k: 'stop', g: 'stop', f: 'fricative', 'θ': 'fricative', s: 'fricative', 'ʃ': 'fricative', m: 'nasal', n: 'nasal', l: 'liquid', r: 'liquid', w: 'glide', 'ɪ': 'vowel' };
  const SON = { stop: 1, fricative: 2, nasal: 3, liquid: 4, glide: 5, vowel: 6 };
  const sonority = seg => SON[SON_CLASS[seg]];
  // Two-consonant onsets that English words use (from the segments above). sr, tl, dl, pw, bn … are absent.
  const ENGLISH_CC = new Set(['pl', 'pr', 'bl', 'br', 'tr', 'tw', 'dr', 'dw', 'kl', 'kr', 'kw', 'gl', 'gr', 'fl', 'fr', 'θr', 'θw', 'ʃr', 'sp', 'st', 'sk', 'sm', 'sn', 'sl', 'sw']);
  const IP_WORDS = { p: 'pip', t: 'tip', d: 'dip', l: 'lip', n: 'nip', r: 'rip', s: 'sip', 'ʃ': 'ship', w: 'whip', bl: 'blip', tr: 'trip', dr: 'drip', kl: 'clip', kw: 'quip', gr: 'grip', fl: 'flip', sk: 'skip', sn: 'snip', sl: 'slip' };
  /** verdict: 'single' (one consonant, always fine), 'english' (cluster English uses), 'sExc' (s + stop: falls, yet English uses it),
   *  'gap' (sonority rises but English does not use it), 'falls' (sonority does not rise toward the vowel). */
  function onset(c1, c2) {
    const segs = c2 ? [c1, c2] : [c1], key = segs.join(''), son = segs.map(sonority).concat(SON.vowel);
    let rises = true; for (let i = 1; i < son.length; i++) if (son[i] <= son[i - 1]) rises = false;
    let verdict;
    if (!c2) verdict = 'single';
    else if (ENGLISH_CC.has(key)) verdict = rises ? 'english' : 'sExc';
    else verdict = rises ? 'gap' : 'falls';
    return { segs, key, son, rises, verdict, word: IP_WORDS[key] || null };
  }

  // Step 4: suffix allomorphs, decided by the stem's last sound.
  const SIBILANTS = new Set(['s', 'z', 'ʃ', 'ʒ', 'tʃ', 'dʒ']);
  function lastVoiced(seg) { return byIpa[seg] ? byIpa[seg].voiced : true; } // vowels, l, r, w count as voiced
  function plural(seg) { if (SIBILANTS.has(seg)) return { form: 'ɪz', rule: 'sibilant' }; return lastVoiced(seg) ? { form: 'z', rule: 'voiced' } : { form: 's', rule: 'voiceless' }; }
  function past(seg) { if (seg === 't' || seg === 'd') return { form: 'ɪd', rule: 'alveolarStop' }; return lastVoiced(seg) ? { form: 'd', rule: 'voiced' } : { form: 't', rule: 'voiceless' }; }
  const STEMS = {
    plural: [['cat', 'kæt', 't'], ['cup', 'kʌp', 'p'], ['cliff', 'klɪf', 'f'], ['dog', 'dɒg', 'g'], ['cab', 'kæb', 'b'], ['bee', 'biː', 'V'], ['bus', 'bʌs', 's'], ['dish', 'dɪʃ', 'ʃ'], ['judge', 'dʒʌdʒ', 'dʒ'], ['wug', 'wʌg', 'g']],
    past: [['walk', 'wɔːk', 'k'], ['kiss', 'kɪs', 's'], ['rush', 'rʌʃ', 'ʃ'], ['hug', 'hʌg', 'g'], ['buzz', 'bʌz', 'z'], ['play', 'pleɪ', 'V'], ['wait', 'weɪt', 't'], ['need', 'niːd', 'd'], ['judge', 'dʒʌdʒ', 'dʒ'], ['plip', 'plɪp', 'p']],
  };

  const api = { PLACES, MANNERS, CONS, byIpa, find, diff, neighbours, FRAMES, framePairs, VOT, classify, boundaries, ONSET1, ONSET2, SON, SON_CLASS, sonority, ENGLISH_CC, IP_WORDS, onset, SIBILANTS, plural, past, STEMS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PHON_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);

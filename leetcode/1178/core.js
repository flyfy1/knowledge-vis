'use strict';
(function(root){
  // Presets: the official example puzzle, the second official example, and the "first letter is not enough" trap.
  const presets = [
    {words:['aaaa','asas','able','ability','actt','actor','access'], puzzle:'aboveyz'},
    {words:['apple','pleas','please'], puzzle:'aelpsxy'},
    {words:['bxx','bzz','abx','aax','ys'], puzzle:'bxyqrsa'}
  ];
  const bit = c => 1 << (c.charCodeAt(0) - 97);
  const mask = s => [...new Set(s)].reduce((m, c) => m | bit(c), 0);
  // Letters of a mask, written in alphabetical order.
  const letters = m => [...'abcdefghijklmnopqrstuvwxyz'].filter(c => m & bit(c)).join('');
  // Mirrors the Python submission: count words per letter set once, then ask the 2^6 sets
  // that contain the first letter and use only puzzle letters.
  function trace(input){
    const freq = new Map(), groups = new Map();
    input.words.forEach(w => {
      const m = mask(w);
      freq.set(m, (freq.get(m) || 0) + 1);
      if (!groups.has(m)) groups.set(m, []);
      groups.get(m).push(w);
    });
    const first = bit(input.puzzle[0]);
    const rest = [...input.puzzle.slice(1)].reduce((m, c) => m | bit(c), 0);
    const rows = [];
    let sub = rest, total = 0;
    while (true) {
      const key = sub | first, count = freq.get(key) || 0;
      total += count;
      rows.push({sub, key, letters: letters(key), count, words: groups.get(key) || [], running: total});
      if (sub === 0) break;
      sub = (sub - 1) & rest;
    }
    const table = [...groups.entries()].map(([m, ws]) => ({mask: m, letters: letters(m), words: ws, count: ws.length,
      hasFirst: Boolean(m & first), outside: letters(m & ~(rest | first))}));
    return {rows, total, table, first, rest, puzzle: input.puzzle};
  }
  const api = {presets, mask, letters, trace};
  root.ValidWordsCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

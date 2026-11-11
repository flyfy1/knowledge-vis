'use strict';
(function (root) {
  const presets = ['14-3*(2+8)/4', '(1-6)/2*3', '2*(3+(4-1)*2)', '((7))', '1-7/2', '20/(1-5)+1'];
  const LIMITS = {length: 40, depth: 6, number: 9999};

  function tokenize(s) {
    const tokens = [];
    for (let i = 0; i < s.length;) {
      const c = s[i];
      if (c === ' ') { i++; continue; }
      if (c >= '0' && c <= '9') {
        let j = i; while (j < s.length && s[j] >= '0' && s[j] <= '9') j++;
        tokens.push({type: 'num', value: Number(s.slice(i, j)), text: s.slice(i, j), at: i}); i = j; continue;
      }
      if ('+-*/'.includes(c)) tokens.push({type: 'op', text: c, at: i});
      else if (c === '(') tokens.push({type: 'open', text: c, at: i});
      else if (c === ')') tokens.push({type: 'close', text: c, at: i});
      else return null;
      i++;
    }
    return tokens;
  }

  // Grammar check (no unary minus): expr := term (('+'|'-') term)*; term := factor (('*'|'/') factor)*;
  // factor := number | '(' expr ')'. Returns an error key or null.
  function validate(s) {
    if (typeof s !== 'string' || !s.trim()) return 'invalidEmpty';
    if (s.length > LIMITS.length) return 'invalidLength';
    const tokens = tokenize(s);
    if (!tokens) return 'invalidChar';
    let i = 0, depth = 0, maxDepth = 0, bad = null;
    const peek = () => tokens[i];
    function factor() {
      const tk = peek();
      if (!tk) { bad = bad || 'invalidSyntax'; return; }
      if (tk.type === 'num') { if (tk.value > LIMITS.number || tk.text.length > 4) bad = bad || 'invalidNumber'; i++; return; }
      if (tk.type === 'open') { i++; depth++; maxDepth = Math.max(maxDepth, depth); expr(); if (!peek() || peek().type !== 'close') { bad = bad || 'invalidSyntax'; return; } i++; depth--; return; }
      bad = bad || (tk.type === 'op' && tk.text === '-' ? 'invalidUnary' : 'invalidSyntax');
    }
    function term() { factor(); while (!bad && peek() && peek().type === 'op' && '*/'.includes(peek().text)) { i++; factor(); } }
    function expr() { term(); while (!bad && peek() && peek().type === 'op' && '+-'.includes(peek().text)) { i++; term(); } }
    expr();
    if (!bad && i !== tokens.length) bad = 'invalidSyntax';
    if (bad) return bad;
    if (maxDepth > LIMITS.depth) return 'invalidDepth';
    try { trace(s, true); } catch (e) { return e.message === 'divzero' ? 'invalidDivZero' : 'invalidSyntax'; }
    return null;
  }

  const truncDiv = (a, b) => { if (b === 0) throw new Error('divzero'); return Math.trunc(a / b); };

  // Apply one value to a state with its pending operator; returns the new state and a description.
  function apply(state, value) {
    const {total, term, op} = state;
    if (op === '+') return {total: total + term, term: value, op};
    if (op === '-') return {total: total + term, term: -value, op};
    if (op === '*') return {total, term: term * value, op};
    return {total, term: truncDiv(term, value), op};
  }

  function trace(s, skipValidation) {
    if (!skipValidation) { const err = validate(s); if (err) throw new Error(err); }
    const tokens = tokenize(s);
    let state = {total: 0, term: 0, op: '+'}, stack = [], history = [];
    const frames = [{type: 'init', k: -1, state, stack, history: []}];
    const snap = f => frames.push(JSON.parse(JSON.stringify(f)));
    tokens.forEach((tk, k) => {
      const before = state;
      if (tk.type === 'num') {
        const after = apply(before, tk.value);
        state = {total: after.total, term: after.term, op: before.op};
        const step = {kind: 'num', op: before.op, value: tk.value, before, after: state};
        history = history.concat([step]);
        snap({type: 'num', k, token: tk, step, state, stack, history});
      } else if (tk.type === 'op') {
        state = {total: before.total, term: before.term, op: tk.text};
        snap({type: 'op', k, token: tk, state, stack, history});
      } else if (tk.type === 'open') {
        stack = stack.concat([before]);
        state = {total: 0, term: 0, op: '+'};
        history = history.concat([{kind: 'open', parked: before, depth: stack.length}]);
        snap({type: 'open', k, token: tk, parked: before, state, stack, history});
      } else {
        const inner = before.total + before.term, outer = stack[stack.length - 1];
        stack = stack.slice(0, -1);
        const after = apply(outer, inner);
        state = {total: after.total, term: after.term, op: outer.op};
        const step = {kind: 'close', innerTotal: before.total, innerTerm: before.term, value: inner, op: outer.op, before: outer, after: state, depth: stack.length + 1};
        history = history.concat([step]);
        snap({type: 'close', k, token: tk, step, state, stack, history});
      }
    });
    const answer = state.total + state.term;
    snap({type: 'end', k: tokens.length, state, stack, history, answer});
    return {s, tokens, frames, answer};
  }

  function solve(s) { return trace(s).answer; }

  const api = {presets, LIMITS, tokenize, validate, trace, solve, truncDiv};
  root.Calc772 = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);

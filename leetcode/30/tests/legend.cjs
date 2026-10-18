// Focused regression for 30-R1-F02; run from the repository root.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window: {}};
vm.runInNewContext(fs.readFileSync('leetcode/30/copy.js', 'utf8'), context);
const [zh, en] = context.window.LESSON_COPY.activeLegend;
assert.match(en, /\[left, right\)/);
assert.match(en, /retained window/i);
assert.match(zh, /保留的窗口/);
assert.match(zh, /\[left, right\)/);
console.log('30-R1-F02: bilingual retained-window legend passed');

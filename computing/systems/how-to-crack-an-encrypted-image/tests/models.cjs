'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const M = require('../models.js');
const bindings = require('../bindings.cjs')();

const dir = path.resolve(__dirname, '..');

// 1. Model invariants
const lay = M.v2Layout(99493, 1024);
assert.strictEqual(lay.padBytes, 16);
assert.strictEqual(lay.aesCipherBytes, 1040);
assert.strictEqual(lay.xorBytes, 98469);
assert.strictEqual(lay.datSize, 99524);
assert.strictEqual(lay.overhead, 31);

const xor = M.xorRecover('jpg', 0x19);
assert.strictEqual(xor.allMatch, true);
assert.deepStrictEqual(xor.restored, [0xFF, 0xD9]);

const ecb = M.ecbVsCbc('ecb', true);
assert.strictEqual(ecb.padSame, true);
const cbc = M.ecbVsCbc('cbc', true);
assert.strictEqual(cbc.padSame, false);

const fp3 = M.knownPlaintextCheck('magic3', 550);
assert(fp3.expectedFP > 30 && fp3.expectedFP < 35);
const fp16 = M.knownPlaintextCheck('exact16', 550);
assert(fp16.log10FP < -25);

const win = M.memoryWindowProb(1350, 450, 1, 30);
assert(Math.abs(win.scanSec - 3.0) < 1e-9);
assert(win.pSingle < 0.001);
assert(win.pMulti < 0.02);

const adrp = M.adrpResolve(0x4492ff0, 0x83d26f8, '0x1224f8000');
assert.strictEqual(adrp.pageOff, 0x6f8);
assert.strictEqual(adrp.pageDelta, (0x83d2000 - 0x4492000) / 4096);

const sso = M.stdStringLayout('short_key_16byte');
assert.strictEqual(sso.mode, 'sso');
assert.strictEqual(sso.slots[23], '10');
const heap = M.stdStringLayout('a1b2c3d4e5f60718293a4b5c6d7e8f90');
assert.strictEqual(heap.mode, 'heap');
assert.strictEqual(heap.slots[23], '80');

// 2. Bindings check
assert.strictEqual(bindings['ch1.diff'], '31');
assert.strictEqual(bindings['ch2.keyHex'], '0x19');

// 3. No CJK in English copy or app.js / models.js
const cjk = /[\u4e00-\u9fff]/;
assert(!cjk.test(fs.readFileSync(path.join(dir, 'models.js'), 'utf8')), 'CJK in models.js');
assert(!cjk.test(fs.readFileSync(path.join(dir, 'app.js'), 'utf8')), 'CJK in app.js');
assert(!cjk.test(fs.readFileSync(path.join(dir, 'content.en.md'), 'utf8')), 'CJK in content.en.md');

console.log('how-to-crack-an-encrypted-image models.cjs: ALL PASS');

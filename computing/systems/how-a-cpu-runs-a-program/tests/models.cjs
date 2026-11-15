'use strict';
// Pins the page's models: the RV32I tables against the spec rows; the encoder against an independent disassembler
// (Capstone, run on 2026-11-15; the hex strings below are its inputs and agreed with it) and against its own decoder;
// the interpreter against hand-computed sums; the pipeline against hand-worked rows (P&H's hazard and forwarding
// rules); the per-element cost table; the critical path; every number the prose quotes (placeholders filled from
// prose(), literals checked against models.js); every live sentence branch; copy keys, language hygiene, the registry
// and the sibling essays' aliases.
// Run: node computing/systems/how-a-cpu-runs-a-program/tests/models.cjs
const path = require('path'), fs = require('fs'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const M = require(path.join(DIR, 'models.js'));
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.zh.js'), 'utf8'), ctx);
const Z = ctx.window.ESSAY_COPY.zh;
const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');

let n = 0, fails = 0;
function check(name, got, want) { n++; if (got !== want) { fails++; console.error(`FAIL ${name}: model gives ${got}, expected ${want}`); } }
function says(key, phrase) { n++; if (!Z[key] || !Z[key].includes(phrase)) { fails++; console.error(`FAIL prose ${key} should contain "${phrase}"`); } }
function throwsErr(name, fn, err) { n++; try { fn(); fails++; console.error(`FAIL ${name}: no error, expected ${err}`); } catch (e) { if (e.message !== err) { fails++; console.error(`FAIL ${name}: ${e.message}, expected ${err}`); } } }
const f = (x, d) => x.toFixed(d);

/* ── RV32I tables, typed again from the spec listing (isa v20260120, RV32I 2.1) ── */
{
  const rows = { lui: '0110111', auipc: '0010111', jal: '1101111', jalr: '1100111 000', beq: '1100011 000', bne: '1100011 001', blt: '1100011 100', bge: '1100011 101',
    lw: '0000011 010', sw: '0100011 010', addi: '0010011 000', slli: '0010011 001 0000000', srai: '0010011 101 0100000', add: '0110011 000 0000000', sub: '0110011 000 0100000', slt: '0110011 010 0000000' };
  for (const [op, s] of Object.entries(rows)) {
    const [o, f3, f7] = s.split(' '), d = M.OPS[op];
    check('opcode ' + op, M.bin(d.op, 7), o);
    if (f3) check('funct3 ' + op, M.bin(d.f3, 3), f3);
    if (f7) check('funct7 ' + op, M.bin(d.f7 | 0, 7), f7);
  }
  const ranges = Object.fromEntries(M.FORMAT_ORDER.map(k => [k, M.FORMATS[k].map(([nm, hi, lo]) => `${nm} ${hi}:${lo}`).join(', ')]));
  check('R fields', ranges.R, 'funct7 31:25, rs2 24:20, rs1 19:15, funct3 14:12, rd 11:7, opcode 6:0');
  check('B fields', ranges.B, 'imm[12|10:5] 31:25, rs2 24:20, rs1 19:15, funct3 14:12, imm[4:1|11] 11:7, opcode 6:0');
  check('J fields', ranges.J, 'imm[20|10:1|11|19:12] 31:12, rd 11:7, opcode 6:0');
  for (const k of M.FORMAT_ORDER) check('format covers 32 bits ' + k, M.FORMATS[k].reduce((s, [, hi, lo]) => s + hi - lo + 1, 0), 32);
  // ch2.p3: rs1, rs2, rd in the same place in every format that has them
  for (const k of M.FORMAT_ORDER) for (const [nm, hi, lo] of M.FORMATS[k]) {
    if (nm === 'rs1') check('rs1 19:15 in ' + k, hi + ':' + lo, '19:15'); if (nm === 'rs2') check('rs2 24:20 in ' + k, hi + ':' + lo, '24:20'); if (nm === 'rd') check('rd 11:7 in ' + k, hi + ':' + lo, '11:7');
  }
  says('ch2.p3', '第 19 到 15 位'); says('ch2.p3', '第 24 到 20 位'); says('ch2.p3', '第 11 到 7 位'); says('ch2.p3', '第 31 位');
  check('ABI names', M.ABI.length + ' ' + M.ABI[1] + ' ' + M.ABI[2] + ' ' + M.ABI[10] + ' ' + M.ABI[28], '32 ra sp a0 t3');
  check('opcode width', M.RV.opBits, M.FORMATS.R[5][1] - M.FORMATS.R[5][2] + 1);
  check('register field width', M.RV.regBits, M.FORMATS.R[1][1] - M.FORMATS.R[1][2] + 1);
  check('I immediate width', M.RV.immI, M.FORMATS.I[0][1] - M.FORMATS.I[0][2] + 1);
  check('U immediate width', M.RV.immU, M.FORMATS.U[0][1] - M.FORMATS.U[0][2] + 1);
  check('2^regBits = registers', 1 << M.RV.regBits, M.RV.nregs);
  // B: 13-bit signed offset → ±4 KiB; J: 21-bit → ±1 MiB
  check('B range = 2^12 bytes', M.RV.branchRangeKiB * 1024, 1 << 12); check('J range = 2^20 bytes', M.RV.jalRangeMiB * 1048576, 1 << 20);
}

/* ── the encoder against Capstone (2026-11-15) and its own decoder ── */
{
  const corpus = [['add x3, x1, x2', '0x002081b3'], ['sub t0, t1, t2', '0x407302b3'], ['addi a0, a0, -1', '0xfff50513'], ['addi sp, sp, -2048', '0x80010113'],
    ['slli t1, t0, 2', '0x00229313'], ['srai a0, a1, 31', '0x41f5d513'], ['srli a0,a1,3', '0x0035d513'], ['lw t2, 0(t1)', '0x00032383'], ['lw a5, -12(s0)', '0xff442783'],
    ['sw a0, 0(a3)', '0x00a6a023'], ['sw ra, 2047(sp)', '0x7e112fa3'], ['beq a0, a1, 16', '0x00b50863'], ['bne a1, t1, -12', '0xfe659ae3'], ['blt t0, a2, -20', '0xfec2c6e3'],
    ['bge x5, x6, 4094', '0x7e62dfe3'], ['bltu a0,a1,-4096', '0x80b56063'], ['jal ra, 2048', '0x001000ef'], ['jal zero, -8', '0xff9ff06f'], ['jal x0, 1048574', '0x7ffff06f'],
    ['lui a0, 0x12345', '0x12345537'], ['auipc t0, 0xfffff', '0xfffff297'], ['jalr zero, 0(ra)', '0x00008067'], ['xori a0,a0,-1', '0xfff54513'], ['and a0,a1,a2', '0x00c5f533'],
    ['slt t0,a0,a1', '0x00b522b3'], ['sra s1,s2,s3', '0x413954b3']];
  for (const [s, h] of corpus) {
    const r = M.parse(s, null, 0);
    check('encode ' + s, r.ok && M.hex8(r.w), h);
    const o = M.decode(parseInt(h, 16));
    check('round trip ' + s, M.hex8(M.encode(o)), h);
    const back = M.parse(M.disasm(o), null, 0);
    check('disasm re-parses ' + s, back.ok && M.hex8(back.w), h);
  }
  // the page's three programs (also checked against Capstone)
  check('v1 machine code', M.PROG.v1.map(i => M.hex8(i.w)).join(' '), '0x00000293 0x00000513 0x00229313 0x00658333 0x00032383 0x00750533 0x00128293 0xfec2c6e3 0x00a6a023 0x00008067');
  check('v2 machine code', M.PROG.v2.map(i => M.hex8(i.w)).join(' '), '0x00261313 0x00658333 0x00000513 0x0005a383 0x00458593 0x00750533 0xfe659ae3 0x00a6a023 0x00008067');
  check('v3 machine code', M.PROG.v3.map(i => M.hex8(i.w)).join(' '), '0x00261313 0x00658333 0x00000513 0x0005a383 0x0045ae03 0x00858593 0x00750533 0x01c50533 0xfe6596e3 0x00a6a023 0x00008067');
  // ranges and alignment at ±1 past each boundary
  const E = o => () => M.encode(o);
  check('I 2047 ok', typeof M.encode({ op: 'addi', rd: 1, rs1: 1, imm: 2047 }), 'number'); throwsErr('I 2048', E({ op: 'addi', imm: 2048 }), 'range'); throwsErr('I -2049', E({ op: 'addi', imm: -2049 }), 'range');
  throwsErr('S 2048', E({ op: 'sw', imm: 2048 }), 'range'); throwsErr('S -2049', E({ op: 'sw', imm: -2049 }), 'range');
  throwsErr('B 4096', E({ op: 'beq', imm: 4096 }), 'range'); throwsErr('B -4098', E({ op: 'beq', imm: -4098 }), 'range'); throwsErr('B odd', E({ op: 'beq', imm: 6 + 1 }), 'align');
  throwsErr('J 1048576', E({ op: 'jal', imm: 1048576 }), 'range'); throwsErr('J -1048578', E({ op: 'jal', imm: -1048578 }), 'range'); throwsErr('J odd', E({ op: 'jal', imm: 3 }), 'align');
  throwsErr('shamt 32', E({ op: 'slli', imm: 32 }), 'range'); throwsErr('shamt -1', E({ op: 'slli', imm: -1 }), 'range');
  check('parse errors', ['frob a0', 'add a0, a0', 'add a0, a0, q9', 'addi a0, a0, zz', 'addi a0, a0, 4096', 'beq a0, a1, 3'].map(s => M.parse(s, null, 0).err).join(','), 'op,args,reg,imm,range,align');
  // ch2.p4 and the diagram's literals
  says('ch2.p4', '<code>0x00000013</code>'); check('NOP = addi zero, zero, 0', M.disasm(M.decode(0x00000013)), 'addi zero, zero, 0');
  says('ch2.p4', '<code>0x00008067</code>'); check('ret', M.disasm(M.decode(0x00008067)), 'jalr zero, 0(ra)');
  says('ch2.p4', '只有第 30 位从 0 变成 1'); check('add vs sub differ in bit 30 only', (M.parse('add a0, a0, a1').w ^ M.parse('sub a0, a0, a1').w) >>> 0, 1 << 30);
  check('addi -1: top 12 bits all ones', M.parse('addi a0, a0, -1').w >>> 20, 0xfff);
  check('diagram machine code = lw t2, 0(t1)', Z['dg.layers.mc'].includes(M.hex8(M.parse('lw t2, 0(t1)').w)), true);
  says('ch2.say.err.range', '−2048 到 2047'); says('ch2.say.err.range', '0 到 31');
  // shifts: shamt sits in bits 24:20, funct7 in 31:25 (review 2026-11-15)
  check('slli shamt field', (M.parse('slli t1, t0, 2').w >>> 20) & 31, 2); check('srai funct7', M.parse('srai a0, a1, 31').w >>> 25, 0b0100000);
  says('ch2.say.Ish', '第 24 到 20 位'); check('shift sentence', M.say.asm(M.parse('slli t1, t0, 2')).key, 'ch2.say.Ish'); check('addi sentence', M.say.asm(M.parse('addi a0, a0, 1')).key, 'ch2.say.I');
  // RV32I without C: IALIGN = 32, offsets in units of 2 bytes (isa v20260120 §2.5)
  says('ch2.say.err.align', '4 字节对齐');
  says('ch3.p4', '偏移是 −12'); check('v2 bne offset', M.PROG.v2[6].o.imm, -12);
}

/* ── the interpreter ── */
{
  for (const v of M.VERSIONS) for (const k of [2, 4, 8, 16, 1000]) {
    const r = M.run(v, k); let s = 0; for (let i = 0; i < k; i++) s += M.aVal(i);
    check(`${v} n=${k} sum`, r.sum, s); check(`${v} n=${k} x0`, r.x[0], 0);
    check(`${v} n=${k} instruction count`, r.trace.length, M.icFormula[v](k));
    const last = r.trace[r.trace.length - 1]; check(`${v} ends with ret`, last.op + ' ' + last.rd, 'jalr 0');
  }
  for (const k of [1, 3]) check('v1/v2 n=' + k, M.run('v1', k).sum === M.run('v2', k).sum, true);
  says('ch3.say.start', [0, 1, 2, 3, 4, 5, 6, 7].map(M.aVal).join('、'));
  check('per element 6 / 4 / 3', [M.loopBody('v1'), M.loopBody('v2'), M.loopBody('v3')].join(), '6,4,3');
  check('v1 → v3 halves the count', M.loopBody('v3') * 2, M.loopBody('v1'));
  check('v2 has a third fewer than v1', M.loopBody('v2') * 3, M.loopBody('v1') * 2);
  says('ch9.p3', '指令少了一半'); says('ch9.p4', '它的指令少三分之一');
}

/* ── single-cycle control (P&H table; I-arith and jalr rows are the page's) ── */
{
  const row = r => M.SIGNALS.map(s => M.CONTROL[r][s] == null ? 'X' : M.CONTROL[r][s]).join('');
  check('R row', row('R'), '1020000'); check('lw row', row('load'), '1101010'); check('sw row', row('store'), '01001X0');
  check('beq row', row('branch'), '00100X1');
  const s = M.singleStep('v1', 2, 4); check('step 4 is lw', s.ins.src + ' ' + s.row + ' ' + s.aluOut, 'lw t2, 0(t1) load 4096');
  check('lw uses every unit', M.UNITS.every(u => M.unitsUsed('lw')[u]), true);
  check('add skips data memory', M.unitsUsed('add').dmem, 0); check('branch skips writeback', M.unitsUsed('blt').wb, 0);
}

/* ── the critical path ── */
{
  const c = M.critical();
  check('default paths', [c.t.load, c.t.store, c.t.alu, c.t.branch].join(), '800,700,600,500');
  for (const L of [{ mem: 100, alu: 400, reg: 50 }, { mem: 400, alu: 100, reg: 400 }, { mem: 100, alu: 100, reg: 50 }]) {
    const r = M.critical(L); check('load ≥ store ≥ alu ≥ branch ' + JSON.stringify(L), r.t.load >= r.t.store && r.t.store >= r.t.alu && r.t.alu >= r.t.branch && r.t.load === r.period, true);
  }
  check('ideal = 5 only when balanced', M.critical({ mem: 200, alu: 200, reg: 200 }).ideal, 5);
  check('ideal < 5 by default', M.critical().ideal < 5, true);
}

/* ── the pipeline: hand-worked rows ── */
{
  const p = M.pipeline('v1', 2), rows = p.rows;
  check('v1 n=2: 18 rows (16 real + 2 flushed), 24 cycles', [rows.length, p.ic, p.flushed, p.cycles].join(), '18,16,2,24');
  const a0 = rows[5]; check('add a0 after lw stalls 1, gets t2 from MEM/WB', [a0.op, a0.D - a0.ID0, a0.src.find(s => s.reg === 7).from].join(), 'add,1,MEMWB');
  const ad = rows[3]; check('add t1 gets t1 from EX/MEM', ad.src.find(s => s.reg === 6).from, 'EXMEM');
  const bl = rows[7]; check('blt gets t0 from EX/MEM', [bl.op, bl.src.find(s => s.reg === 5).from].join(), 'blt,EXMEM');
  check('first blt taken: sw and jalr flushed after EX', [rows[8].op, rows[8].flushed, rows[9].op, rows[9].flushed, rows[10].F - bl.E].join(), 'sw,true,jalr,true,1');
  check('slli F = 3, W = 7', [rows[2].F, rows[2].W].join(), '3,7');
  const nf = M.pipeline('v2', 2, { fwd: false }); check('v2 no forwarding: add t1 after slli stalls 2', nf.rows[1].D - nf.rows[1].ID0, 2);
  const id = M.pipeline('v1', 2, { resolve: 'ID' }), b2 = id.rows[7];
  check('v1 ID resolve: blt stalls 1, flushes 1', [b2.op, b2.D - b2.ID0, id.rows.filter(r => r.flushed).length].join(), 'blt,1,1');
  check('v1 ID resolve: same per element as EX', M.perElem('v1', { resolve: 'ID' }), M.perElem('v1', {}));
  check('stall policy: no flushed rows', M.pipeline('v1', 4, { policy: 'stall' }).flushed, 0);
  check('x0 is never a dependence', M.pipeline('v1', 2).rows[0].src.length + M.pipeline('v1', 2).rows[1].src.length, 0);
  // per-element cost, every policy and version (n = 1000 vs 1002)
  const table = {};
  for (const v of M.VERSIONS) for (const [k, cfg] of Object.entries({ nf: { fwd: false }, f: {}, id: { resolve: 'ID' }, st: { policy: 'stall' }, stid: { policy: 'stall', resolve: 'ID' } })) table[v + k] = M.perElem(v, cfg);
  check('per-element table', JSON.stringify(table), JSON.stringify({ v1nf: 16, v1f: 9, v1id: 9, v1st: 9, v1stid: 9, v2nf: 7, v2f: 6, v2id: 5, v2st: 6, v2stid: 5, v3nf: 5, v3f: 4, v3id: 3.5, v3st: 4, v3stid: 3.5 }));
  says('ch8.say.nt', '冲掉 2 条'); check('nt taken flush = 2', M.pipeline('v2', 4).rows.filter(r => r.flushed).length / 3, 2);
  says('ch8.p4', '只冲掉 1 条'); check('ID taken flush = 1', M.pipeline('v2', 4, { resolve: 'ID' }).rows.filter(r => r.flushed).length / 3, 1);
  says('ch7.say.loaduse', '停 1 拍'); check('load-use with forwarding = 1', M.stallsPerElem('v1', {}), 1);
  says('ch6.say.gaps', '{ic} + 4 拍'); check('fill = stages − 1', M.pipeline('v2', 4, { fwd: true }).rows[0].W - 1, 4);
  says('ch8.limit', '冲掉 3 条');   // the textbook's first design (branch decided in MEM): two cycles later than EX's 2 → 3; not simulated
}

/* ── x86 bytes (clang, x86_64, 2026-11-15) ── */
{
  check('x86 bytes', M.X86.map(x => x.bytes).join(' | '), '01 d8 | 03 07 | 01 07 | 83 44 8f 10 05 | 48 b8 f0 de bc 9a 78 56 34 12 | 53');
  for (const x of M.X86) check('roles cover bytes ' + x.id, x.roles.split(' ').length, x.len);
  check('64-bit constant split', ((0x9abce << 12) + (-272)) >>> 0, 0x9abcdef0);
  check('64-bit constant hi', (0x12345 << 12) + 1656, 0x12345678);
  says('dg.uops.bytes', M.X86[3].bytes); says('dg.uops.asm', '[rdi+4*rcx+16], 5');
}

/* ── every prose placeholder is a prose() key; pinned values ── */
{
  const P = M.prose();
  const want = { nregs: '32', xlen: '32', regBits: '5', immI: '12', immU: '20', opBits: '7', nFormats: '6', brKiB: '4', jalMiB: '1', insnBytes: '4', nIron: '1000', nTaken: '999',
    ic1: '6004', ic2: '4005', ic3: '3005', loop1: '6', loop2: '4', loop3: '3',
    tLoad: '800', tStore: '700', tAlu: '600', tBr: '500', period: '800', avg: '617', waste: '23', stage: '200', ideal: '4', latMemM: '400', latMem: '200', latReg: '100', latAlu: '200',
    mLoadShare: '17', periodM: '1200', stageM: '400', idealM: '3',
    p1cyc: '24', p1ic: '16', p1single: '12.8', p1pipe: '4.8',
    e1nf: '16', e1f: '9', e2f: '6', e1nfStall: '8', e1fStall: '1',
    e1st: '9', e1id: '9', e2id: '5', e2st: '6', e3f: '4', e3id: '3.5',
    cpi1p: '1.50', cpi3p: '1.33', cpi2p: '1.50', cpi1n: '2.67', ghzS: '1.25', ghzP: '5', t1s: '4.8', t1p: '1.8', t3p: '0.8', t3b: '0.7', t1n: '3.2',
    x1s3p: '6.0', x1s1p: '2.7', x1p3p: '2.2', x1s3b: '6.8',
    xSibLen: '5', xImmLen: '10', xPushLen: '1', xMax: '15', xSibRv: '5', xImmRv: '4',
    apxFrom: '16', apxTo: '32', apxLoads: '10', apxStores: '20', apxInsns: '10' };
  for (const [k, [v, d, kind]] of Object.entries(P)) check('prose ' + k, kind === 'pct' ? f(v * 100, d) : f(v, d), want[k]);
  check('every prose value pinned', Object.keys(P).sort().join(','), Object.keys(want).sort().join(','));
  const used = new Set();
  for (const m of html.matchAll(/data-i18n-html="([^"]+)"/g)) { const v = Z[m[1]] || ''; for (const p of v.matchAll(/\{(\w+)\}/g)) { used.add(p[1]); n++; if (!(p[1] in P) && !['c1', 'c2', 'c'].includes(p[1])) { fails++; console.error(`FAIL {${p[1]}} in ${m[1]} is not filled on the page`); } } }
  for (const k of ['dg.iron.icEx', 'dg.iron.tEx']) for (const p of Z[k].matchAll(/\{(\w+)\}/g)) used.add(p[1]);
  for (const k of Object.keys(P)) { n++; if (!used.has(k)) { fails++; console.error('FAIL prose() value ' + k + ' is never quoted'); } }
  // claims the prose makes about the models
  check('ch5: lw sets the clock', M.critical().slowest, 'load');
  check('ch6: pipeline beats single-cycle on the n=2 program', P.p1pipe[0] < P.p1single[0], true);
  check('ch8: stall = predict not-taken on the loop', P.e1st[0] === P.e1f[0] && P.e2st[0] === P.e2f[0], true);
  check('ch8: ID helps v2 and v3, not v1', P.e2id[0] < P.e2f[0] && P.e3id[0] < P.e3f[0] && P.e1id[0] === P.e1f[0], true);
  check('ch9: single-cycle has the lowest CPI and is slowest', M.iron('v1', 'single').cpi < P.cpi1p[0] && P.t1s[0] > P.t1p[0], true);
  check('ch9: v2 same CPI as v1 yet faster', f(P.cpi2p[0], 2) === f(P.cpi1p[0], 2) && M.iron('v2', 'pipe').ns < M.iron('v1', 'pipe').ns, true);
  check('ch9: product of the two steps', Math.abs(P.x1s1p[0] * P.x1p3p[0] - P.x1s3p[0]) < 1e-9, true);
  check('ch9: clock 4× faster', P.ghzP[0] / P.ghzS[0], P.ideal[0]);
  // dated frontier facts
  const F = M.FRONTIER; const ymd = s => { const [y, m, d] = s.split('-').map(Number); return `${y} 年 ${m} 月 ${d} 日`; };
  check('as of', F.asOf, '2026-11'); says('ch11.title', '2026 年 11 月');
  says('ch11.e1', 'v20260120'); says('ch11.e1', ymd(F.isaManual)); says('ch11.e1', F.rv32iVersion + ' 版');
  says('ch11.d1', ymd(F.rva23.announced)); says('ch11.d1', ymd(F.rva23.ratified)); says('ch11.d1', 'Ubuntu ' + F.ubuntu.release); says('ch11.d1', ymd(F.k3.canonicalPost));
  says('ch11.d2', ymd(F.arm97.posted)); says('ch11.d2', ymd(F.arm98.posted)); says('ch11.c1', ymd(F.apx.intelPage));
  says('ch11.c1', '取数少 {apxLoads}%'); says('ch11.c1', '存数少 {apxStores}% 以上'); says('ch11.c1', '指令少 {apxInsns}%');   // Intel APX page: 10% fewer loads, more than 20% fewer stores, 10% fewer instructions
  says('ch10.p3', '2.3.11');
  // ch5.law: the default waste is 23%, not most of the time
  check('waste is a minority of the cycle', M.critical().waste < 0.5, true); says('ch5.law', '一段时间白白浪费'); says('ch11.c2', '2025 年 11 月');
}

/* ── sentence branches at the extremes of each control ── */
{
  const seen = new Set(), add = z => seen.add(z.key);
  for (const s of ['', 'add a0, a0, t2', 'srai a0, a1, 31', 'lw t2, 0(t1)', 'sw a0, 0(a3)', 'blt t0, a2, -20', 'lui a0, 0x12345', 'jal ra, 2048', 'frob', 'add a0', 'add q, a0, a0', 'addi a0, a0, x', 'addi a0, a0, 5000', 'beq a0, a1, 3'])
    add(M.say.asm(s ? M.parse(s, null, 0) : null));
  add(M.say.asm({ ok: false, err: 'hex' }));
  for (const v of M.VERSIONS) { add(M.say.interp(null)); for (const e of M.run(v, 2).trace) add(M.say.interp(e)); }
  for (let i = 0; i < M.run('v1', 2).trace.length; i++) add(M.say.single(M.singleStep('v1', 2, i)));
  for (const mem of [100, 400]) for (const alu of [100, 400]) for (const r of [50, 400]) add(M.say.crit({ mem, alu, reg: r }));
  add(M.say.crit({ mem: 200, alu: 200, reg: 200 }));
  for (const v of M.VERSIONS) for (const nn of [2, 4]) for (const cfg of [{}, { fwd: false }, { resolve: 'ID' }, { policy: 'stall' }, { policy: 'stall', resolve: 'ID' }]) { const p = M.pipeline(v, nn, cfg); add(M.say.pipe(p, 6)); add(M.say.pipe(p, 7)); add(M.say.pipe(p, 8)); }
  for (const v of M.VERSIONS) for (const m of M.MACHINES) add(M.say.iron(v, m));
  for (const x of M.X86) add(M.say.x86(x.id));
  const all = ['ch2.say.empty', 'ch2.say.R', 'ch2.say.I', 'ch2.say.Ish', 'ch2.say.S', 'ch2.say.B', 'ch2.say.U', 'ch2.say.J', 'ch2.say.err.op', 'ch2.say.err.args', 'ch2.say.err.reg', 'ch2.say.err.imm', 'ch2.say.err.range', 'ch2.say.err.align', 'ch2.say.err.hex',
    'ch3.say.start', 'ch3.say.alu', 'ch3.say.load', 'ch3.say.store', 'ch3.say.brT', 'ch3.say.brN', 'ch3.say.ret',
    'ch4.say.R', 'ch4.say.I', 'ch4.say.load', 'ch4.say.store', 'ch4.say.brT', 'ch4.say.brN', 'ch4.say.ret',
    'ch5.say.mem', 'ch5.say.alu', 'ch5.say.balanced', 'ch6.say.gaps', 'ch7.say.nofwd', 'ch7.say.loaduse', 'ch7.say.clean',
    'ch8.say.stall', 'ch8.say.nt', 'ch8.say.id', 'ch8.say.idstall', 'ch9.say.base', 'ch9.say.singleFewer', 'ch9.say.mid', 'ch9.say.fast', 'ch10.say.one', 'ch10.say.many'];
  for (const k of all) check('branch reached ' + k, seen.has(k), true);
  for (const k of seen) check('reached key exists ' + k, Z[k] != null, true);
  for (const k of Object.keys(Z)) if (/\.say\./.test(k)) check('say key is a branch ' + k, all.includes(k), true);
}

/* ── keys, language hygiene, registry, siblings ── */
{
  const keys = new Set([...html.matchAll(/data-i18n(?:-html|-aria|)="([^"]+)"/g)].map(m => m[1]));
  for (const m of app.matchAll(/'((?:ch\d+|dg|u|doc)\.[\w.-]*\w)'/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-dg="(\w+)"/g)) keys.add('dg.' + m[1] + '.aria');
  for (const k of ['IF', 'ID', 'EX', 'MEM', 'WB', 'stall', 'flush']) keys.add('ch6.leg.' + k);
  for (const u of M.UNITS) keys.add('ch4.u.' + u);
  for (const k of [0, 1, 2, 3]) keys.add('ch4.op.' + k);
  for (const f of M.FORMAT_ORDER) keys.add('ch2.fmt.' + f);
  for (const k of M.CLASSES) keys.add('ch5.cls.' + k);
  for (const k of ['c', 'comp', 'asm', 'mc', 'isa', 'isaS', 'isaEx', 'u1', 'u2', 'u3', 'u1s', 'u2s', 'u3s', 'micro', 'gates', 'sw', 'hw']) keys.add('dg.layers.' + k);
  for (const k of ['IF', 'ID', 'EX', 'MEM', 'WB', 'r1', 'r2', 'r3', 'r4']) keys.add('dg.pp.' + k);
  for (const k of ['ic', 'cpi', 't']) { keys.add('dg.iron.' + k); keys.add('dg.iron.' + k + 'By'); keys.add('dg.iron.' + k + 'Ex'); }
  for (const k of ['u1', 'u2', 'u3', 'u4']) keys.add('dg.uops.' + k);
  for (const v of M.VERSIONS) keys.add('ch9.vs.' + v); for (const m of M.MACHINES) keys.add('ch9.ms.' + m);
  for (const x of M.X86) for (const r of x.roles.split(' ')) keys.add('ch10.role.' + r);
  for (const o of ['agu', 'load', 'alu', 'store']) keys.add('ch10.op.' + o);
  for (const k of ['ch4.u.', 'ch4.op.', 'ch2.fmt.', 'ch5.cls.', 'ch6.leg.', 'dg.layers.', 'dg.pp.', 'dg.iron.', 'dg.uops.', 'ch9.vs.', 'ch9.ms.', 'ch10.role.', 'ch10.op.', 'ch2.say.err.']) keys.delete(k);
  for (const k of keys) { n++; if (Z[k] == null) { fails++; console.error('FAIL missing zh key ' + k); } }
  const unused = Object.keys(Z).filter(k => !keys.has(k) && !/\.say\./.test(k));
  check('every zh key is used', unused.join(','), '');
  // the say sentences' placeholders are supplied by app.js
  for (const [k, v] of Object.entries(Z)) if (/\.say\./.test(k)) for (const m of v.matchAll(/\{(\w+)\}/g)) {
    n++; if (!new RegExp('\\b' + m[1] + '\\s*:|[{,]\\s*' + m[1] + '\\s*[,}]').test(app)) { fails++; console.error(`FAIL placeholder {${m[1]}} in ${k} is never supplied by app.js`); }
  }
  check('six or more diagrams', [...html.matchAll(/class="dia" data-dg="/g)].length >= 6, true);
  check('script cache keys', [...html.matchAll(/src="(\w+(?:\.\w+)?\.js)\?v=(\d+)"/g)].map(m => m[1] + '@' + m[2]).join(' '), 'models.js@20261115 copy.zh.js@20261115 copy.en.js@20261115 app.js@20261115');
  for (const file of ['index.html', 'app.js', 'models.js']) {
    let src = fs.readFileSync(path.join(DIR, file), 'utf8');
    if (file === 'index.html') {
      const tt = src.match(/<title>([^<]*)<\/title>/)[1], md = src.match(/<meta name="description" content="([^"]*)">/)[1];
      check('static title = doc.title', tt, Z['doc.title']); check('static meta = doc.desc', md, Z['doc.desc']);
      src = src.replace(/<title>[^<]*<\/title>/, '').replace(/<meta name="description" content="[^"]*">/, '');
      src = src.replace(/<details class="page-provenance"[\s\S]*?<\/details>/, '');   // the bilingual label the registrar adds later
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
    n++;
    const others = (src.match(/[一-鿿]+/g) || []).filter(x => !(file === 'index.html' && x === '中'));
    if (others.length) { fails++; console.error(`FAIL Chinese text in ${file}: ${others.slice(0, 3).join(' ')}`); }
  }
  const R = JSON.parse(fs.readFileSync(path.join(DIR, 'REGISTRY.json'), 'utf8'));
  check('registry slug/path', R.slug + ' ' + R.path, 'how-a-cpu-runs-a-program computing/systems/how-a-cpu-runs-a-program/');
  check('registry category', [R.category, R.subtopic, R.stage].join('/'), 'computing/systems/university');
  check('registry title', R.title.zh, Z['doc.title'].split(' · ')[0]); check('registry desc', R.desc.zh, Z['doc.desc']);
  check('hero title = registry title', Z['hero.title'], R.title.zh);
  for (const c of R.concepts) check('anchor ' + c.anchor, html.includes('id="' + c.anchor.slice(1) + '"'), true);
  for (const c of R.concepts) { n++; if (!c.aliases.zh.length || !c.aliases.en.length || !c.title.en || !c.desc.en) { fails++; console.error('FAIL concept incomplete ' + c.id); } }
  check('one concept per chapter', R.concepts.map(c => c.anchor).join(), Array.from({ length: 12 }, (_, i) => '#ch' + (i + 1)).join());
  // one word, one owner (TASK-arch-series.md). Registrar, 2026-11-15: 指令集 / ISA / instruction set, CPU 怎么执行程序 / how a CPU
  // runs a program (#ch1), 机器码 / machine code (#ch3) and 流水线 / pipelining (#ch6) moved here from switches-that-compute #ch9 /
  // #ch11, which keeps 程序计数器, fetch-decode-execute and 冯·诺依曼结构; switches #ch4 keeps 关键路径 / critical path; the memory
  // essay #ch1 keeps pipeline stall, load-use hazard, forwarding, CPI.
  const norm = s => s.toLowerCase().replace(/\s+/g, '');
  const owned = new Map();
  for (const a of ['CPI', 'forwarding', 'load-use hazard', 'pipeline stall', '关键路径', 'critical path', '程序计数器', 'program counter', 'fetch decode execute', '冯·诺依曼结构']) owned.set(norm(a), 'TASK');
  for (const sib of ['why-compute-waits-for-memory', 'switches-that-compute', 'how-cpu-caches-work', 'how-virtual-memory-works', 'how-pcie-works', 'how-a-computer-is-wired', 'how-thunderbolt-works']) {
    const p = path.join(DIR, '..', sib, 'REGISTRY.json');
    if (fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, 'utf8')).concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) owned.set(norm(a), sib);
  }
  for (const c of R.concepts) for (const a of [...c.aliases.zh, ...c.aliases.en]) { n++; if (owned.has(norm(a))) { fails++; console.error(`FAIL alias owned by ${owned.get(norm(a))}: ${a}`); } }
  for (const [anchor, words] of [['#ch1', ['指令集', 'ISA', 'instruction set', 'CPU 怎么执行程序', 'how a CPU runs a program']], ['#ch3', ['机器码', 'machine code']], ['#ch6', ['流水线', 'pipelining']]]) {
    const c = R.concepts.find(x => x.anchor === anchor), mine = new Set([...c.aliases.zh, ...c.aliases.en].map(norm));
    for (const w of words) check(`moved alias ${w} on ${anchor}`, mine.has(norm(w)), true);
  }
  // live sibling links must point at chapters that exist; A4 is named in plain text, not linked
  const all = Object.values(Z).join('');
  for (const sib of ['why-compute-waits-for-memory', 'switches-that-compute', 'how-cpu-caches-work']) {
    const sh = fs.readFileSync(path.join(DIR, '..', sib, 'index.html'), 'utf8');
    for (const m of all.matchAll(new RegExp(sib + '/(#ch\\d+)?', 'g'))) if (m[1]) check(`${sib} anchor ${m[1]}`, sh.includes(`id="${m[1].slice(1)}"`), true);
  }
  says('ch1.p2', '七种指令'); { const sz = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', 'switches-that-compute', 'copy.zh.js'), 'utf8'), sz); const S = sz.window.ESSAY_COPY.zh; check('switches #ch9 has seven instructions and 4+4 bits', /七种指令/.test(S['ch9.p2']) && /高 4 位/.test(S['ch9.p2']) && /低 4 位/.test(S['ch9.p2']), true); }
  for (const k of ['ch1.p2', 'ch5.p1', 'ch6.p3', 'ch7.p4', 'ch7.limit', 'ch12.links']) { n++; if (!/href=/.test(Z[k])) { fails++; console.error('FAIL expected a sibling link in ' + k); } }
  check('no links to the unwritten A3 / A4 / A5', /how-a-cpu-guesses-ahead|how-virtual-memory-works|how-cores-share-memory/.test(all), false);
  says('ch8.p3', '后续一篇讲分支预测和乱序执行的文章'); says('ch6.limit', '后续一篇讲分支预测和乱序执行的文章');
  const hrefs = [...all.matchAll(/href='([^']+)'/g)].map(m => m[1]);
  for (const h of hrefs) { n++; if (!/^\.\.\/(why-compute-waits-for-memory|switches-that-compute|how-cpu-caches-work)\/(#ch\d+)?$/.test(h)) { fails++; console.error('FAIL unexpected link ' + h); } }

  const ectx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(DIR, 'copy.en.js'), 'utf8'), ectx);
  const EN = ectx.window.ESSAY_COPY.en, stub = ectx.window.ESSAY_COPY.enStub === true, ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
  check('en keys = zh keys', Object.keys(EN).sort().join('|'), Object.keys(Z).sort().join('|'));
  for (const k of Object.keys(Z)) check('en placeholders ' + k, ph(EN[k]), ph(Z[k]));
  if (stub) { check('en stub mirrors zh exactly', JSON.stringify(EN), JSON.stringify(Z)); console.log('NOTE: copy.en.js is a stub (enStub); English registry match skipped until it is translated'); }
  else { check('registry title en', R.title.en, EN['doc.title'].split(' · ')[0]); check('registry desc en', R.desc.en, EN['doc.desc']); }
}

if (fails) { console.error(`\n${fails} of ${n} checks failed`); process.exit(1); }
console.log(`PASS: ${n} checks (RV32I tables vs the spec, encoder vs Capstone and its own decoder, interpreter sums, hand-worked pipeline rows and forwarding sources, per-element cost table, critical path, x86 bytes, and every number in the prose match the models)`);

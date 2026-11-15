/* How a CPU runs a program: the page's models. Every model is the real thing at small scale:
   - an RV32I assembler / disassembler for a subset of the base ISA, field layouts and opcodes typed from the RISC-V
     Unprivileged ISA manual (docs.riscv.org, isa v20260120, "RV32I Base Integer Instruction Set, Version 2.1");
   - an instruction-set interpreter that runs the page's three compiled versions of one C loop;
   - the single-cycle datapath's control signals (Patterson & Hennessy, Computer Organization and Design, RISC-V
     edition, ch. 4: the main control table, extended here with one row for I-type arithmetic);
   - the critical path of each instruction class and the clock it forces (P&H ch. 4's single-cycle example, with the
     textbook's example component latencies as defaults);
   - a cycle-accurate in-order 5-stage pipeline (IF ID EX MEM WB) with P&H's hazard-detection and forwarding rules,
     branches resolved in EX or ID, and static policies (stall, predict not-taken);
   - the iron law of performance (time = instructions × cycles per instruction × clock period).
   Facts about real ISAs and dated frontier facts sit in FRONTIER with their source (also listed in BRIEF.md).
   UMD: window.CpuModels in the browser, module.exports in node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CpuModels = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── RV32I: registers and the six formats ── */
  const RV = { xlen: 32, nregs: 32, regBits: 5, insnBits: 32, immI: 12, immU: 20, opBits: 7, f3Bits: 3, f7Bits: 7,
    branchRangeKiB: 4, jalRangeMiB: 1 };
  // ABI names (RISC-V psABI, riscv-cc.adoc, integer register convention)
  const ABI = ['zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2', 's0', 's1', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7',
    's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 't3', 't4', 't5', 't6'];
  // field layouts, [name, hi, lo], most significant first (isa v20260120, RV32I listing)
  const FORMATS = {
    R: [['funct7', 31, 25], ['rs2', 24, 20], ['rs1', 19, 15], ['funct3', 14, 12], ['rd', 11, 7], ['opcode', 6, 0]],
    I: [['imm[11:0]', 31, 20], ['rs1', 19, 15], ['funct3', 14, 12], ['rd', 11, 7], ['opcode', 6, 0]],
    S: [['imm[11:5]', 31, 25], ['rs2', 24, 20], ['rs1', 19, 15], ['funct3', 14, 12], ['imm[4:0]', 11, 7], ['opcode', 6, 0]],
    B: [['imm[12|10:5]', 31, 25], ['rs2', 24, 20], ['rs1', 19, 15], ['funct3', 14, 12], ['imm[4:1|11]', 11, 7], ['opcode', 6, 0]],
    U: [['imm[31:12]', 31, 12], ['rd', 11, 7], ['opcode', 6, 0]],
    J: [['imm[20|10:1|11|19:12]', 31, 12], ['rd', 11, 7], ['opcode', 6, 0]]
  };
  const FORMAT_ORDER = ['R', 'I', 'S', 'B', 'U', 'J'];
  const b = s => parseInt(s, 2);
  // opcode / funct3 / funct7 exactly as the RV32I listing (isa v20260120, ch. 35 "RV32/64G Instruction Set Listings")
  const OPS = {
    lui: { f: 'U', op: b('0110111') }, auipc: { f: 'U', op: b('0010111') },
    jal: { f: 'J', op: b('1101111') }, jalr: { f: 'I', op: b('1100111'), f3: 0 },
    beq: { f: 'B', op: b('1100011'), f3: 0 }, bne: { f: 'B', op: b('1100011'), f3: 1 }, blt: { f: 'B', op: b('1100011'), f3: 4 },
    bge: { f: 'B', op: b('1100011'), f3: 5 }, bltu: { f: 'B', op: b('1100011'), f3: 6 }, bgeu: { f: 'B', op: b('1100011'), f3: 7 },
    lw: { f: 'I', op: b('0000011'), f3: 2, load: true }, sw: { f: 'S', op: b('0100011'), f3: 2 },
    addi: { f: 'I', op: b('0010011'), f3: 0 }, slti: { f: 'I', op: b('0010011'), f3: 2 }, xori: { f: 'I', op: b('0010011'), f3: 4 },
    ori: { f: 'I', op: b('0010011'), f3: 6 }, andi: { f: 'I', op: b('0010011'), f3: 7 },
    slli: { f: 'I', op: b('0010011'), f3: 1, f7: 0, shamt: true }, srli: { f: 'I', op: b('0010011'), f3: 5, f7: 0, shamt: true },
    srai: { f: 'I', op: b('0010011'), f3: 5, f7: b('0100000'), shamt: true },
    add: { f: 'R', op: b('0110011'), f3: 0, f7: 0 }, sub: { f: 'R', op: b('0110011'), f3: 0, f7: b('0100000') },
    sll: { f: 'R', op: b('0110011'), f3: 1, f7: 0 }, slt: { f: 'R', op: b('0110011'), f3: 2, f7: 0 },
    xor: { f: 'R', op: b('0110011'), f3: 4, f7: 0 }, srl: { f: 'R', op: b('0110011'), f3: 5, f7: 0 },
    sra: { f: 'R', op: b('0110011'), f3: 5, f7: b('0100000') }, or: { f: 'R', op: b('0110011'), f3: 6, f7: 0 },
    and: { f: 'R', op: b('0110011'), f3: 7, f7: 0 }
  };

  const bits = (x, hi, lo) => (x >>> lo) & ((1 << (hi - lo + 1)) - 1) >>> 0;
  const sext = (x, n) => (x << (32 - n)) >> (32 - n);
  const u32 = x => x >>> 0;

  function regNum(s) {
    s = String(s).trim().toLowerCase();
    const m = /^x(\d{1,2})$/.exec(s);
    if (m) { const n = +m[1]; return n < 32 ? n : -1; }
    if (s === 'fp') return 8;
    return ABI.indexOf(s);
  }

  // encode one instruction object { op, rd, rs1, rs2, imm } → 32-bit word; throws Error('range'|'align'|'op')
  function encode(o) {
    const d = OPS[o.op]; if (!d) throw new Error('op');
    const rd = o.rd | 0, rs1 = o.rs1 | 0, rs2 = o.rs2 | 0, imm = o.imm | 0;
    const opc = d.op, f3 = (d.f3 | 0) << 12, R = (rd & 31) << 7, S1 = (rs1 & 31) << 15, S2 = (rs2 & 31) << 20;
    switch (d.f) {
      case 'R': return u32(((d.f7 | 0) << 25) | S2 | S1 | f3 | R | opc);
      case 'I':
        if (d.shamt) { if (imm < 0 || imm > 31) throw new Error('range'); return u32(((d.f7 | 0) << 25) | ((imm & 31) << 20) | S1 | f3 | R | opc); }
        if (imm < -2048 || imm > 2047) throw new Error('range');
        return u32(((imm & 0xfff) << 20) | S1 | f3 | R | opc);
      case 'S':
        if (imm < -2048 || imm > 2047) throw new Error('range');
        return u32((((imm >> 5) & 0x7f) << 25) | S2 | S1 | f3 | ((imm & 31) << 7) | opc);
      case 'B':
        if (imm < -4096 || imm > 4094) throw new Error('range');
        if (imm & 1) throw new Error('align');
        return u32((((imm >> 12) & 1) << 31) | (((imm >> 5) & 0x3f) << 25) | S2 | S1 | f3 | (((imm >> 1) & 0xf) << 8) | (((imm >> 11) & 1) << 7) | opc);
      case 'U':
        if (imm < 0 || imm > 0xfffff) throw new Error('range');
        return u32((imm << 12) | R | opc);
      case 'J':
        if (imm < -1048576 || imm > 1048574) throw new Error('range');
        if (imm & 1) throw new Error('align');
        return u32((((imm >> 20) & 1) << 31) | (((imm >> 1) & 0x3ff) << 21) | (((imm >> 11) & 1) << 20) | (((imm >> 12) & 0xff) << 12) | R | opc);
    }
    throw new Error('op');
  }

  // decode a 32-bit word → { op, f, rd, rs1, rs2, imm } or null when it is not one of the page's instructions
  function decode(w) {
    w = u32(w);
    const opc = w & 0x7f, f3 = bits(w, 14, 12), f7 = bits(w, 31, 25), rd = bits(w, 11, 7), rs1 = bits(w, 19, 15), rs2 = bits(w, 24, 20);
    for (const [name, d] of Object.entries(OPS)) {
      if (d.op !== opc) continue;
      if (d.f3 != null && d.f3 !== f3) continue;
      if ((d.f === 'R' || d.shamt) && (d.f7 | 0) !== f7) continue;
      const o = { op: name, f: d.f };
      if (d.f === 'R') Object.assign(o, { rd, rs1, rs2 });
      else if (d.f === 'I') Object.assign(o, { rd, rs1, imm: d.shamt ? rs2 : sext(w >>> 20, 12) });
      else if (d.f === 'S') Object.assign(o, { rs1, rs2, imm: sext((f7 << 5) | rd, 12) });
      else if (d.f === 'B') Object.assign(o, { rs1, rs2, imm: sext((bits(w, 31, 31) << 12) | (bits(w, 7, 7) << 11) | (bits(w, 30, 25) << 5) | (bits(w, 11, 8) << 1), 13) });
      else if (d.f === 'U') Object.assign(o, { rd, imm: w >>> 12 });
      else if (d.f === 'J') Object.assign(o, { rd, imm: sext((bits(w, 31, 31) << 20) | (bits(w, 19, 12) << 12) | (bits(w, 20, 20) << 11) | (bits(w, 30, 21) << 1), 21) });
      return o;
    }
    return null;
  }

  // the fields of a word in its format, for display: [{ name, hi, lo, value, width }]
  function fields(w, f) {
    return FORMATS[f].map(([name, hi, lo]) => ({ name, hi, lo, width: hi - lo + 1, value: bits(u32(w), hi, lo) }));
  }
  const hex8 = w => '0x' + u32(w).toString(16).padStart(8, '0');
  const bin = (v, n) => (v >>> 0).toString(2).padStart(n, '0');

  // text form, ABI register names
  function disasm(o) {
    const r = n => ABI[n];
    switch (o.f) {
      case 'R': return `${o.op} ${r(o.rd)}, ${r(o.rs1)}, ${r(o.rs2)}`;
      case 'I': return OPS[o.op].load || o.op === 'jalr' ? `${o.op} ${r(o.rd)}, ${o.imm}(${r(o.rs1)})` : `${o.op} ${r(o.rd)}, ${r(o.rs1)}, ${o.imm}`;
      case 'S': return `${o.op} ${r(o.rs2)}, ${o.imm}(${r(o.rs1)})`;
      case 'B': return `${o.op} ${r(o.rs1)}, ${r(o.rs2)}, ${o.imm}`;
      case 'U': return `${o.op} ${r(o.rd)}, 0x${o.imm.toString(16)}`;
      case 'J': return `${o.op} ${r(o.rd)}, ${o.imm}`;
    }
    return '?';
  }

  // parse one line of assembly. labels: { name: address }, pc: this instruction's address.
  // returns { ok: true, o } or { ok: false, err: 'op'|'args'|'reg'|'imm'|'range'|'align'|'label' }
  function parse(line, labels, pc) {
    const s = String(line).replace(/#.*/, '').trim();
    const m = /^([a-z]+)\s*(.*)$/i.exec(s);
    if (!m) return { ok: false, err: 'op' };
    const op = m[1].toLowerCase(), d = OPS[op];
    if (!d) return { ok: false, err: 'op' };
    const args = m[2].split(',').map(x => x.trim()).filter(x => x.length);
    const R = x => { const n = regNum(x); if (n < 0) throw new Error('reg'); return n; };
    const I = x => {
      if (/^-?(0x[0-9a-f]+|\d+)$/i.test(x)) { const neg = x[0] === '-', v = parseInt(neg ? x.slice(1) : x); return neg ? -v : v; }
      if (labels && /^[a-z_]\w*$/i.test(x)) { if (!(x in labels)) throw new Error('label'); return labels[x] - (pc | 0); }
      throw new Error('imm');
    };
    const mem = x => { const mm = /^(-?(?:0x[0-9a-f]+|\d+))?\s*\(\s*([a-z0-9]+)\s*\)$/i.exec(x); if (!mm) throw new Error('args'); return [mm[1] ? I(mm[1]) : 0, R(mm[2])]; };
    try {
      let o;
      if (d.f === 'R') { if (args.length !== 3) throw new Error('args'); o = { op, rd: R(args[0]), rs1: R(args[1]), rs2: R(args[2]) }; }
      else if (d.f === 'I' && (d.load || op === 'jalr')) { if (args.length !== 2) throw new Error('args'); const [imm, rs1] = mem(args[1]); o = { op, rd: R(args[0]), rs1, imm }; }
      else if (d.f === 'I') { if (args.length !== 3) throw new Error('args'); o = { op, rd: R(args[0]), rs1: R(args[1]), imm: I(args[2]) }; }
      else if (d.f === 'S') { if (args.length !== 2) throw new Error('args'); const [imm, rs1] = mem(args[1]); o = { op, rs2: R(args[0]), rs1, imm }; }
      else if (d.f === 'B') { if (args.length !== 3) throw new Error('args'); o = { op, rs1: R(args[0]), rs2: R(args[1]), imm: I(args[2]) }; }
      else if (d.f === 'U') { if (args.length !== 2) throw new Error('args'); o = { op, rd: R(args[0]), imm: I(args[1]) }; }
      else { if (args.length !== 2) throw new Error('args'); o = { op, rd: R(args[0]), imm: I(args[1]) }; }
      o.f = d.f;
      const w = encode(o);
      return { ok: true, o: decode(w), w };
    } catch (e) { return { ok: false, err: e.message }; }
  }

  // assemble a program: lines are 'label:' or instructions; base address 0
  function assemble(lines) {
    const labels = {}; let pc = 0; const body = [];
    for (const L of lines) { const t = L.trim(); if (/^\w+:$/.test(t)) labels[t.slice(0, -1)] = pc; else { body.push(t); pc += 4; } }
    return body.map((t, i) => { const r = parse(t, labels, i * 4); if (!r.ok) throw new Error('asm ' + t + ': ' + r.err); return { pc: i * 4, src: t, o: r.o, w: r.w, label: Object.keys(labels).find(k => labels[k] === i * 4) || null }; });
  }

  /* ── one C loop, three compiled versions (written by hand for the page; not a compiler's output) ──
     int sum = 0; for (int i = 0; i < n; i++) sum += a[i]; *out = sum; return;
     calling convention: a1 = &a[0], a2 = n (n ≥ 1; v3 needs n even), a3 = out, ra = return address */
  const SRC = {
    v1: ['addi t0, zero, 0', 'addi a0, zero, 0', 'loop:', 'slli t1, t0, 2', 'add t1, a1, t1', 'lw t2, 0(t1)', 'add a0, a0, t2', 'addi t0, t0, 1', 'blt t0, a2, loop', 'sw a0, 0(a3)', 'jalr zero, 0(ra)'],
    v2: ['slli t1, a2, 2', 'add t1, a1, t1', 'addi a0, zero, 0', 'loop:', 'lw t2, 0(a1)', 'addi a1, a1, 4', 'add a0, a0, t2', 'bne a1, t1, loop', 'sw a0, 0(a3)', 'jalr zero, 0(ra)'],
    v3: ['slli t1, a2, 2', 'add t1, a1, t1', 'addi a0, zero, 0', 'loop:', 'lw t2, 0(a1)', 'lw t3, 4(a1)', 'addi a1, a1, 8', 'add a0, a0, t2', 'add a0, a0, t3', 'bne a1, t1, loop', 'sw a0, 0(a3)', 'jalr zero, 0(ra)']
  };
  const VERSIONS = ['v1', 'v2', 'v3'];
  const PROG = {}; for (const v of VERSIONS) PROG[v] = assemble(SRC[v]);
  const MEM = { aBase: 0x1000, out: 0x2000, ra: 0x400 };
  const aVal = i => [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3][i % 16];

  // instruction-set interpreter: runs a version for n elements; returns the dynamic trace and the final state
  function run(v, n, maxSteps) {
    const prog = PROG[v], x = new Int32Array(32), mem = new Map();
    for (let i = 0; i < n; i++) mem.set(MEM.aBase + 4 * i, aVal(i));
    x[1] = MEM.ra; x[2] = 0x8000; x[11] = MEM.aBase; x[12] = n; x[13] = MEM.out;
    const trace = []; let pc = 0, steps = 0; const lim = maxSteps || 1e7;
    while (steps < lim) {
      const k = pc >>> 2; if (k < 0 || k >= prog.length) break;
      const ins = prog[k], o = ins.o, d = OPS[o.op];
      const a = x[o.rs1 | 0], c = x[o.rs2 | 0];
      let res = null, next = pc + 4, taken = false, addr = null, wr = null;
      switch (o.op) {
        case 'add': res = a + c; break; case 'sub': res = a - c; break;
        case 'and': res = a & c; break; case 'or': res = a | c; break; case 'xor': res = a ^ c; break;
        case 'sll': res = a << (c & 31); break; case 'srl': res = a >>> (c & 31); break; case 'sra': res = a >> (c & 31); break;
        case 'slt': res = a < c ? 1 : 0; break;
        case 'addi': res = a + o.imm; break; case 'andi': res = a & o.imm; break; case 'ori': res = a | o.imm; break; case 'xori': res = a ^ o.imm; break;
        case 'slti': res = a < o.imm ? 1 : 0; break; case 'slli': res = a << o.imm; break; case 'srli': res = a >>> o.imm; break; case 'srai': res = a >> o.imm; break;
        case 'lui': res = o.imm << 12; break; case 'auipc': res = pc + (o.imm << 12); break;
        case 'lw': addr = u32(a + o.imm); res = mem.get(addr) | 0; break;
        case 'sw': addr = u32(a + o.imm); wr = c; mem.set(addr, c); break;
        case 'beq': taken = a === c; break; case 'bne': taken = a !== c; break; case 'blt': taken = a < c; break; case 'bge': taken = a >= c; break;
        case 'bltu': taken = u32(a) < u32(c); break; case 'bgeu': taken = u32(a) >= u32(c); break;
        case 'jal': res = pc + 4; next = pc + o.imm; taken = true; break;
        case 'jalr': res = pc + 4; next = (a + o.imm) & ~1; taken = true; break;
      }
      if (d.f === 'B' && taken) next = pc + o.imm;
      const rd = (d.f === 'S' || d.f === 'B') ? 0 : (o.rd | 0);
      if (res != null && rd !== 0) x[rd] = res | 0;
      trace.push({ k, pc, op: o.op, f: d.f, rd, rs1: o.rs1 | 0, rs2: o.rs2 | 0, srcs: srcRegs(o), res: res == null ? null : res | 0, addr, wr, taken, next, aVal: a, bVal: c });
      steps++;
      if (o.op === 'jalr' && o.rd === 0 && o.rs1 === 1) break;   // ret: back to the caller, the program is done
      pc = next;
    }
    return { trace, x: Array.from(x), mem, sum: mem.get(MEM.out) };
  }
  function srcRegs(o) {
    const f = OPS[o.op].f;
    if (f === 'R' || f === 'S' || f === 'B') return [o.rs1, o.rs2].filter(r => r !== 0);
    if (f === 'I') return [o.rs1].filter(r => r !== 0);
    return [];
  }
  const icFormula = { v1: n => 4 + 6 * n, v2: n => 5 + 4 * n, v3: n => 5 + 3 * n };
  function classMix(v, n) {
    const t = run(v, n).trace, c = { alu: 0, load: 0, store: 0, branch: 0, jump: 0 };
    for (const e of t) c[klass(e.op)]++;
    return { counts: c, n: t.length };
  }
  function klass(op) { const d = OPS[op]; if (d.load) return 'load'; if (d.f === 'S') return 'store'; if (d.f === 'B') return 'branch'; if (op === 'jalr' || op === 'jal') return 'jump'; return 'alu'; }

  /* ── single-cycle control (P&H RISC-V edition, ch. 4 main control table; the I-arith row is this page's addition) ── */
  // ALUOp: 0 = add (address), 1 = compare (branch), 2 = R-type: funct3/funct7 decide, 3 = I-type arithmetic: funct3 decides
  const CONTROL = {
    R: { ALUSrc: 0, MemtoReg: 0, RegWrite: 1, MemRead: 0, MemWrite: 0, Branch: 0, ALUOp: 2 },
    Iarith: { ALUSrc: 1, MemtoReg: 0, RegWrite: 1, MemRead: 0, MemWrite: 0, Branch: 0, ALUOp: 3 },
    load: { ALUSrc: 1, MemtoReg: 1, RegWrite: 1, MemRead: 1, MemWrite: 0, Branch: 0, ALUOp: 0 },
    store: { ALUSrc: 1, MemtoReg: null, RegWrite: 0, MemRead: 0, MemWrite: 1, Branch: 0, ALUOp: 0 },
    branch: { ALUSrc: 0, MemtoReg: null, RegWrite: 0, MemRead: 0, MemWrite: 0, Branch: 1, ALUOp: 1 },
    jalr: { ALUSrc: 1, MemtoReg: 0, RegWrite: 1, MemRead: 0, MemWrite: 0, Branch: 0, ALUOp: 0, Jump: 1 }
  };
  const SIGNALS = ['RegWrite', 'ALUSrc', 'ALUOp', 'MemRead', 'MemWrite', 'MemtoReg', 'Branch'];
  function controlRow(op) {
    const d = OPS[op];
    if (d.f === 'R') return 'R'; if (d.load) return 'load'; if (d.f === 'S') return 'store'; if (d.f === 'B') return 'branch';
    if (op === 'jalr') return 'jalr'; return 'Iarith';
  }
  // which units an instruction class uses in the single-cycle datapath (for the stepper's highlight)
  const UNITS = ['pc', 'imem', 'regs', 'imm', 'alu', 'dmem', 'wb'];
  function unitsUsed(op) {
    const r = controlRow(op);
    return { pc: 1, imem: 1, regs: 1, imm: r !== 'R' ? 1 : 0, alu: 1, dmem: (r === 'load' || r === 'store') ? 1 : 0, wb: CONTROL[r].RegWrite };
  }
  // one step of the single-cycle machine: what every wire carries for dynamic instruction e
  function singleStep(v, n, i) {
    const t = run(v, n).trace, e = t[Math.max(0, Math.min(i, t.length - 1))], row = controlRow(e.op), c = CONTROL[row];
    const ins = PROG[v][e.k];
    return { e, ins, row, c, units: unitsUsed(e.op), total: t.length, i: Math.max(0, Math.min(i, t.length - 1)),
      aluA: e.aVal, aluB: c.ALUSrc ? ins.o.imm : e.bVal,
      aluOut: row === 'branch' ? (e.taken ? 1 : 0) : (row === 'load' || row === 'store') ? e.addr : e.res };
  }

  /* ── the critical path (P&H ch. 4 single-cycle example; defaults are the textbook's example latencies, TUNED) ── */
  const LAT = { mem: 200, reg: 100, alu: 200 };
  const LAT_M = 400;   // the slower-memory case the prose asks the reader to try   // ps: instruction / data memory, register file read or write, ALU
  const PATHS = {   // the units each class passes through, in order
    alu: ['imem', 'regR', 'alu', 'regW'], load: ['imem', 'regR', 'alu', 'dmem', 'regW'], store: ['imem', 'regR', 'alu', 'dmem'],
    branch: ['imem', 'regR', 'alu'], jump: ['imem', 'regR', 'alu', 'regW']
  };
  const CLASSES = ['load', 'store', 'alu', 'branch'];
  function unitLat(u, L) { return u === 'imem' || u === 'dmem' ? L.mem : u === 'regR' || u === 'regW' ? L.reg : L.alu; }
  function critical(L, v, n) {
    L = L || LAT;
    const t = {}; for (const k of Object.keys(PATHS)) t[k] = PATHS[k].reduce((s, u) => s + unitLat(u, L), 0);
    const period = Math.max(...Object.values(t)), slowest = Object.keys(t).find(k => t[k] === period);
    const mix = classMix(v || 'v1', n || 1000), avg = Object.entries(mix.counts).reduce((s, [k, c]) => s + c * t[k], 0) / mix.n;
    const stage = Math.max(L.mem, L.reg, L.alu);   // a pipeline's clock: the slowest stage
    return { t, period, slowest, avg, waste: 1 - avg / period, stage, ideal: period / stage, mix };
  }

  /* ── the 5-stage pipeline ──
     In-order, one instruction per cycle. Register file written in the first half of a cycle and read in the second
     (P&H), so a value written in WB in cycle c can be read in ID in cycle c. Forwarding (P&H §4.7): EX/MEM → EX and
     MEM/WB → EX, EX/MEM taking priority; a load followed by a user stalls one cycle (the hazard-detection unit).
     Branches: resolved at the end of EX (two younger instructions in flight) or, with an extra comparator, in ID (one),
     in which case the comparator needs its operands in ID: one stall after an ALU producer, two after a load (P&H).
     Policies: 'stall' (fetch nothing after a branch until it is resolved) or 'nt' (predict not taken: keep fetching
     the next instruction; flush it if the branch was taken). cfg = { fwd: true|false, resolve: 'EX'|'ID', policy }.
     Each row: { k (static index, or -1 for a wrong-path fetch), F (fetch cycle), ID0 (first cycle in ID), D (last cycle
     in ID), E, M, W, flushed, stallsData, src: forwarding sources [{ reg, from: 'EXMEM'|'MEMWB'|'RF', p }] } */
  const DEFAULT_CFG = { fwd: true, resolve: 'EX', policy: 'nt' };
  function pipeline(v, n, cfg) {
    cfg = Object.assign({}, DEFAULT_CFG, cfg || {});
    const prog = PROG[v], t = run(v, n).trace, rows = [], last = {};   // last[reg] = index in rows of its latest producer
    let nextF = 1, prevD = 0, dataStalls = 0, ctrlBubbles = 0, flushed = 0;
    for (let i = 0; i < t.length; i++) {
      const e = t[i], row = { k: e.k, pc: e.pc, op: e.op, e, F: nextF, flushed: false, src: [] };
      row.ID0 = Math.max(row.F + 1, prevD + 1);
      let D = row.ID0;
      const isB = e.f === 'B', earlyB = isB && cfg.resolve === 'ID';
      for (const r of e.srcs) {
        if (!(r in last)) continue;
        const p = rows[last[r]], load = OPS[p.op].load;
        let need;
        if (!cfg.fwd) need = p.W;                              // read the register file in the producer's WB cycle
        else if (earlyB) need = load ? p.M + 1 : p.E + 1;      // ID comparator: value must be in EX/MEM or MEM/WB
        else need = load ? p.M : p.E;                          // EX needs it: forward at the start of EX = D + 1
        D = Math.max(D, need);
      }
      row.D = D; row.stallsData = D - row.ID0; dataStalls += row.stallsData;
      row.E = D + 1; row.M = D + 2; row.W = D + 3;
      // where each operand comes from in the cycle it is used
      for (const r of e.srcs) {
        if (!(r in last)) { row.src.push({ reg: r, from: 'RF', p: -1 }); continue; }
        const pi = last[r], p = rows[pi], useC = earlyB ? row.D : row.E;
        let from = 'RF';
        if (cfg.fwd) { if (p.M === useC) from = 'EXMEM'; else if (p.W === useC) from = 'MEMWB'; }
        if (earlyB && cfg.fwd) { if (p.E + 1 === useC) from = 'EXMEM'; else if (p.M + 1 === useC) from = 'MEMWB'; else from = 'RF'; }
        row.src.push({ reg: r, from, p: pi });
      }
      rows.push(row);
      if (e.rd) last[e.rd] = rows.length - 1;
      prevD = row.D;
      // fetch of the next instruction
      let nf = row.ID0;                                         // normally fetched the cycle this one enters ID
      if (isB) {
        const known = cfg.resolve === 'ID' ? row.D : row.E;    // the cycle at whose end the outcome is known
        if (cfg.policy === 'stall') { nf = known + 1; ctrlBubbles += nf - row.ID0; }
        else if (e.taken) {
          // wrong-path fetches of pc+4 (and pc+8 when resolved in EX), squashed at the end of `known`
          const wrong = [];
          let wf = row.ID0, wprevD = row.D;
          const count = known + 1 - row.ID0 - (row.D - row.ID0);   // fetch slots that open before the redirect
          for (let j = 0; j < count; j++) {
            const pc = e.pc + 4 * (j + 1), kk = pc >>> 2;
            const w = { k: kk < prog.length ? kk : -1, pc, op: kk < prog.length ? prog[kk].o.op : null, F: wf, flushed: true, src: [] };
            w.ID0 = Math.max(wf + 1, wprevD + 1); w.D = w.ID0; w.E = w.M = w.W = null; w.end = known;
            wrong.push(w); wprevD = w.D; wf = w.ID0;
          }
          for (const w of wrong) rows.push(w);
          flushed += wrong.length; nf = known + 1; ctrlBubbles += nf - row.ID0;
        }
      }
      nextF = nf;
    }
    const real = rows.filter(r => !r.flushed), cycles = real[real.length - 1].W;
    return { rows, cycles, ic: real.length, cpi: cycles / real.length, dataStalls, ctrlBubbles, flushed, cfg, v, n };
  }
  // cycles each element costs in the steady state (difference between n and n + step, divided by step)
  function perElem(v, cfg) {
    const a = pipeline(v, 1000, cfg).cycles, c = pipeline(v, 1002, cfg).cycles;
    return (c - a) / 2;
  }
  function cpiLong(v, cfg) { return pipeline(v, 1000, cfg).cpi; }
  function stallsPerElem(v, cfg) { return (pipeline(v, 1002, cfg).dataStalls - pipeline(v, 1000, cfg).dataStalls) / 2; }
  // instructions the loop body costs per element (difference of dynamic counts at n = 4 and n = 2, halved)
  function loopBody(v) { return (run(v, 4).trace.length - run(v, 2).trace.length) / 2; }

  /* ── iron law ── */
  const IRON = { n: 1000 };
  const MACHINES = ['single', 'pipe', 'pipeNoFwd', 'pipeBest'];
  const MACH_CFG = { pipe: DEFAULT_CFG, pipeNoFwd: { fwd: false, resolve: 'EX', policy: 'nt' }, pipeBest: { fwd: true, resolve: 'ID', policy: 'nt' } };
  function iron(v, mach, L) {
    const cp = critical(L || LAT, v, IRON.n), ic = icFormula[v](IRON.n);
    let cpi, T;
    if (mach === 'single') { cpi = 1; T = cp.period; }
    else { cpi = pipeline(v, IRON.n, MACH_CFG[mach]).cpi; T = cp.stage; }
    const ns = ic * cpi * T / 1000;   // ps → ns
    return { ic, cpi, T, ghz: 1000 / T, ns, perElem: ns / IRON.n };
  }

  /* ── x86-64 vs RV32I: bytes assembled with clang (x86_64, Intel syntax) on 2026-11-15; see BRIEF.md ── */
  // ops: what the instruction does, as the RISC-like steps a decoder can split it into (semantics; how a given core
  // groups them into micro-ops is implementation-specific). rv: an RV32I sequence with the same effect.
  const X86 = [
    { id: 'reg', asm: 'add eax, ebx', bytes: '01 d8', roles: 'o c', ops: ['alu'], rv: ['add a0, a0, a1'] },
    { id: 'load', asm: 'add eax, dword ptr [rdi]', bytes: '03 07', roles: 'o c', ops: ['load', 'alu'], rv: ['lw t0, 0(a1)', 'add a0, a0, t0'] },
    { id: 'rmw', asm: 'add dword ptr [rdi], eax', bytes: '01 07', roles: 'o c', ops: ['load', 'alu', 'store'], rv: ['lw t0, 0(a1)', 'add t0, t0, a0', 'sw t0, 0(a1)'] },
    { id: 'sib', asm: 'add dword ptr [rdi + 4*rcx + 16], 5', bytes: '83 44 8f 10 05', roles: 'o c r n n', ops: ['agu', 'load', 'alu', 'store'], rv: ['slli t1, a2, 2', 'add t1, a1, t1', 'lw t0, 16(t1)', 'addi t0, t0, 5', 'sw t0, 16(t1)'] },
    { id: 'imm64', asm: 'movabs rax, 0x123456789abcdef0', bytes: '48 b8 f0 de bc 9a 78 56 34 12', roles: 'v o n n n n n n n n', ops: ['alu'], rv: ['lui a0, 0x9abce', 'addi a0, a0, -272', 'lui a1, 0x12345', 'addi a1, a1, 1656'] },
    { id: 'push', asm: 'push rbx', bytes: '53', roles: 'o', ops: ['agu', 'store'], rv: ['addi sp, sp, -4', 'sw s1, 0(sp)'] }
  ];
  for (const x of X86) { x.len = x.bytes.split(' ').length; x.rvProg = x.rv.map(s => { const r = parse(s, null, 0); if (!r.ok) throw new Error('x86 rv ' + s + ': ' + r.err); return r; }); }
  const X86_MAXLEN = 15;   // Intel SDM vol. 2, §2.3.11 "The maximum length of an Intel 64 and IA-32 instruction remains 15 bytes" (read in a mirrored copy, 2026-11-15; see BRIEF.md)

  /* ── dated facts for the frontier chapter (sources and dates opened in BRIEF.md) ── */
  const FRONTIER = {
    asOf: '2026-11',
    isaManual: '2026-01-20', rv32iVersion: '2.1',
    rva23: { ratified: '2024-10-17', announced: '2024-10-21' },
    ubuntu: { release: '25.10', canonicalPost: '2026-02-05' },
    k3: { canonicalPost: '2026-02-05' },
    arm97: { posted: '2025-10-02' }, arm98: { posted: '2026-10-05' },
    apx: { gprsFrom: 16, gprsTo: 32, fewerLoads: 10, fewerStores: 20, fewerInsns: 10, intelPage: '2024-10-31' },
    novaLake: { reported: '2025-11' }
  };

  /* ── numbers quoted in the prose: [value, decimals, kind] ── */
  function prose() {
    const C = critical(LAT, 'v1', 1000), Cm = critical(Object.assign({}, LAT, { mem: LAT_M }), 'v1', 1000);
    const pe = (v, cfg) => perElem(v, cfg), NF = MACH_CFG.pipeNoFwd, ID = { fwd: true, resolve: 'ID', policy: 'nt' }, ST = { fwd: true, resolve: 'EX', policy: 'stall' };
    const p1 = pipeline('v1', 2);
    const i1s = iron('v1', 'single'), i1p = iron('v1', 'pipe'), i3p = iron('v3', 'pipe'), i3b = iron('v3', 'pipeBest'), i2p = iron('v2', 'pipe'), i1n = iron('v1', 'pipeNoFwd');
    const m1 = classMix('v1', 1000).counts;
    return {
      // ch2
      nregs: [RV.nregs, 0], xlen: [RV.xlen, 0], regBits: [RV.regBits, 0], immI: [RV.immI, 0], immU: [RV.immU, 0], opBits: [RV.opBits, 0], nFormats: [FORMAT_ORDER.length, 0],
      brKiB: [RV.branchRangeKiB, 0], jalMiB: [RV.jalRangeMiB, 0], insnBytes: [RV.insnBits / 8, 0], nIron: [IRON.n, 0], nTaken: [run('v1', IRON.n).trace.filter(e => e.f === 'B' && e.taken).length, 0],
      // ch3
      ic1: [icFormula.v1(1000), 0], ic2: [icFormula.v2(1000), 0], ic3: [icFormula.v3(1000), 0], loop1: [loopBody('v1'), 0], loop2: [loopBody('v2'), 0], loop3: [loopBody('v3'), 0],
      // ch5
      tLoad: [C.t.load, 0], tStore: [C.t.store, 0], tAlu: [C.t.alu, 0], tBr: [C.t.branch, 0], period: [C.period, 0], avg: [C.avg, 0], waste: [C.waste, 0, 'pct'],
      stage: [C.stage, 0], ideal: [C.ideal, 0], latMemM: [LAT_M, 0], latMem: [LAT.mem, 0], latReg: [LAT.reg, 0], latAlu: [LAT.alu, 0],
      mLoadShare: [m1.load / (icFormula.v1(1000)), 0, 'pct'], periodM: [Cm.period, 0], stageM: [Cm.stage, 0], idealM: [Cm.ideal, 0],
      // ch6
      p1cyc: [p1.cycles, 0], p1ic: [p1.ic, 0], p1single: [p1.ic * C.period / 1000, 1], p1pipe: [p1.cycles * C.stage / 1000, 1],
      // ch7
      e1nf: [pe('v1', NF), 0], e1f: [pe('v1', DEFAULT_CFG), 0], e2f: [pe('v2', DEFAULT_CFG), 0], e1nfStall: [stallsPerElem('v1', NF), 0], e1fStall: [stallsPerElem('v1', DEFAULT_CFG), 0],
      // ch8
      e1st: [pe('v1', ST), 0], e1id: [pe('v1', ID), 0], e2id: [pe('v2', ID), 0], e2st: [pe('v2', ST), 0], e3f: [pe('v3', DEFAULT_CFG), 0], e3id: [pe('v3', ID), 1],
      // ch9
      cpi1p: [i1p.cpi, 2], cpi3p: [i3p.cpi, 2], cpi2p: [i2p.cpi, 2], cpi1n: [i1n.cpi, 2], ghzS: [i1s.ghz, 2], ghzP: [i1p.ghz, 0],
      t1s: [i1s.perElem, 1], t1p: [i1p.perElem, 1], t3p: [i3p.perElem, 1], t3b: [i3b.perElem, 1], t1n: [i1n.perElem, 1],
      x1s3p: [i1s.ns / i3p.ns, 1], x1s1p: [i1s.ns / i1p.ns, 1], x1p3p: [i1p.ns / i3p.ns, 1], x1s3b: [i1s.ns / i3b.ns, 1],
      // ch10
      xSibLen: [X86[3].len, 0], xImmLen: [X86[4].len, 0], xPushLen: [X86[5].len, 0], xMax: [X86_MAXLEN, 0], xSibRv: [X86[3].rv.length, 0], xImmRv: [X86[4].rv.length, 0],
      // ch11
      apxFrom: [FRONTIER.apx.gprsFrom, 0], apxTo: [FRONTIER.apx.gprsTo, 0], apxLoads: [FRONTIER.apx.fewerLoads, 0], apxStores: [FRONTIER.apx.fewerStores, 0], apxInsns: [FRONTIER.apx.fewerInsns, 0]
    };
  }

  /* ── formatting ── */
  function fmt(x, d, lang) {
    if (x == null || !isFinite(x)) return '—';
    const s = (d == null ? (Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2) : d);
    const k = Math.pow(10, s); x = Math.sign(x) * Math.round(Math.abs(x) * k * (1 + 1e-12)) / k;
    return Number(x).toLocaleString(lang === 'en' ? 'en-US' : 'zh-CN', { minimumFractionDigits: s, maximumFractionDigits: s });
  }

  /* ── live sentences: each returns { key, v } ── */
  const say = {
    asm(r) {
      if (!r) return { key: 'ch2.say.empty', v: {} };
      if (!r.ok) return { key: 'ch2.say.err.' + r.err, v: r };
      return { key: 'ch2.say.' + r.o.f + (OPS[r.o.op].shamt ? 'sh' : ''), v: r };   // shifts: shamt in 24:20, funct7 above it
    },
    interp(e) {
      if (!e) return { key: 'ch3.say.start', v: {} };
      if (e.op === 'jalr') return { key: 'ch3.say.ret', v: e };
      const k = klass(e.op);
      if (k === 'branch') return { key: e.taken ? 'ch3.say.brT' : 'ch3.say.brN', v: e };
      return { key: 'ch3.say.' + (k === 'jump' ? 'alu' : k), v: e };
    },
    single(st) {
      const r = st.row;
      if (r === 'branch') return { key: st.e.taken ? 'ch4.say.brT' : 'ch4.say.brN', v: st };
      if (r === 'load') return { key: 'ch4.say.load', v: st };
      if (r === 'store') return { key: 'ch4.say.store', v: st };
      if (r === 'jalr') return { key: 'ch4.say.ret', v: st };
      return { key: r === 'R' ? 'ch4.say.R' : 'ch4.say.I', v: st };
    },
    crit(L) {
      const c = critical(L, 'v1', 1000);
      const v = c;
      if (c.ideal >= 4.999) return { key: 'ch5.say.balanced', v };
      return { key: L.mem >= L.alu ? 'ch5.say.mem' : 'ch5.say.alu', v };
    },
    pipe(r, chap) {
      const v = r;
      if (chap === 6) return { key: 'ch6.say.gaps', v };   // every version of the loop has at least one taken branch
      if (chap === 7) {
        if (!r.cfg.fwd) return { key: 'ch7.say.nofwd', v };
        return { key: r.dataStalls ? 'ch7.say.loaduse' : 'ch7.say.clean', v };
      }
      if (r.cfg.policy === 'stall') return { key: 'ch8.say.stall', v };
      if (r.cfg.resolve === 'ID') {
        const ex = perElem(r.v, Object.assign({}, r.cfg, { resolve: 'EX' })), id = perElem(r.v, r.cfg);
        v.gain = ex - id; return { key: id < ex ? 'ch8.say.id' : 'ch8.say.idstall', v };
      }
      return { key: 'ch8.say.nt', v };
    },
    iron(v, mach) {
      const a = iron(v, mach), base = iron('v1', 'single');
      const x = base.ns / a.ns, vv = Object.assign({ x }, a);
      if (mach === 'single') return { key: v === 'v1' ? 'ch9.say.base' : 'ch9.say.singleFewer', v: vv };
      return { key: x >= 4 ? 'ch9.say.fast' : 'ch9.say.mid', v: vv };
    },
    x86(id) { const x = X86.find(e => e.id === id); return { key: x.ops.length === 1 ? 'ch10.say.one' : 'ch10.say.many', v: x }; }
  };

  return { RV, ABI, FORMATS, FORMAT_ORDER, OPS, encode, decode, fields, hex8, bin, disasm, parse, assemble, regNum, sext,
    SRC, VERSIONS, PROG, MEM, aVal, run, icFormula, classMix, klass, CONTROL, SIGNALS, controlRow, UNITS, unitsUsed, singleStep,
    LAT, PATHS, CLASSES, critical, DEFAULT_CFG, pipeline, perElem, cpiLong, stallsPerElem, loopBody, IRON, MACHINES, MACH_CFG, iron, X86, X86_MAXLEN,
    FRONTIER, prose, fmt, say };
});

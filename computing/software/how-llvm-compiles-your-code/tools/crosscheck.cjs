#!/usr/bin/env node
'use strict';
/* Live crosscheck against host /usr/bin/clang (Apple clang version 21.0.0, arm64-apple-darwin27.2.0).
   Writes temporary C/IR/assembly/object probes in /tmp/agent-tasks/software/how-llvm-compiles-your-code/
   and compares live compiler IR, pass dumps, pass pipelines, assembly patterns, and ThinLTO output
   against models.js. Never modifies files inside the repository. */
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const M = require('../models.js');

const CLANG = '/usr/bin/clang';
const SCRATCH = '/tmp/agent-tasks/software/how-llvm-compiles-your-code/crosscheck';
fs.mkdirSync(SCRATCH, { recursive: true });

let n = 0, fails = 0;
function check(name, got, want) {
  n++;
  if (got !== want) {
    fails++;
    console.error(`FAIL ${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  } else {
    console.log(`ok   ${name}`);
  }
}
function ok(name, cond, info) {
  n++;
  if (!cond) {
    fails++;
    console.error(`FAIL ${name}${info ? ': ' + info : ''}`);
  } else {
    console.log(`ok   ${name}`);
  }
}
function clang(args, opts = {}) {
  return execFileSync(CLANG, args, { encoding: 'utf8', cwd: SCRATCH, ...opts });
}
function clangStderr(args) {
  const res = spawnSync(CLANG, args, { encoding: 'utf8', cwd: SCRATCH });
  return (res.stdout || '') + '\n' + (res.stderr || '');
}

// 1. Host compiler release & opaque pointer verification
{
  const ver = clang(['--version']);
  ok('Host Apple clang version matches pinned 21.0.0', ver.includes('Apple clang version 21.0.0') && ver.includes('clang-2100.4.1.1'), ver.split('\n')[0]);
  ok('Host target matches arm64-apple-darwin27.2.0', ver.includes('Target: arm64-apple-darwin27.2.0'), ver);
}

// 2. Ch2: -O0 alloca + opaque ptr + stack load/store counts vs -O2 register promotion
{
  const src = path.join(SCRATCH, 'ch2.c');
  fs.writeFileSync(src, `
int sum_array(const int *restrict a, int n) {
  int s = 0;
  for (int i = 0; i < n; i++) {
    s += a[i];
  }
  return s;
}
`);
  const irO0 = clang(['-S', '-emit-llvm', '-O0', src, '-o', '-']);
  const allocas = (irO0.match(/=\s*alloca\s+/g) || []).length;
  const stores = (irO0.match(/\bstore\s+/g) || []).length;
  const loads = (irO0.match(/\bload\s+/g) || []).length;
  ok('Opaque pointers only (no typed i32* in -O0 IR)', /\bptr\b/.test(irO0) && !/\bi32\*/.test(irO0));
  check('sum_array -O0 alloca count matches model', allocas, M.O0_SNIPPETS.sum_array.allocas);
  // In sum_array -O0 IR: 4 entry stores + 2 in-loop stores = 6 static store instructions;
  // 2 cond loads + 4 body loads (3 stack + 1 array) + 1 latch load + 1 exit load = 8 static load instructions
  check('sum_array -O0 static store instructions', stores, 6);
  check('sum_array -O0 static load instructions', loads, 8);

  const irO2 = clang(['-S', '-emit-llvm', '-O2', src, '-o', '-']);
  ok('sum_array -O2 eliminates all stack allocas', !/\balloca\b/.test(irO2));
  ok('sum_array -O2 introduces SSA phi nodes', /\bphi\s+i32\b/.test(irO2));
  ok('sum_array -O2 vectorizes into <4 x i32>', /<4 x i32>/.test(irO2));
}

// 3. Ch3: SROA / mem2reg inserts SSA phi at dominance frontier
{
  const src = path.join(SCRATCH, 'ch3.c');
  fs.writeFileSync(src, `
int ext_fn(int);
int pick_phi_real(int cond, int a, int b) {
  int x = a + 1;
  if (cond) {
    x = ext_fn(b);
  }
  return x + 5;
}
`);
  const irO0 = clang(['-S', '-emit-llvm', '-O0', src, '-o', '-']);
  const irO1 = clang(['-S', '-emit-llvm', '-O1', src, '-o', '-']);
  ok('pick_phi_real -O0 uses alloca', /\balloca\b/.test(irO0));
  ok('pick_phi_real -O1 promotes stack slot to SSA phi', !/\balloca\b/.test(irO1) && /phi i32 \[ %[0-9]+, %[0-9]+ \], \[ %[0-9]+, %[0-9]+ \]/.test(irO1));
}

// 4. Ch4: Pass pipeline InstCombine + SimplifyCFG + DCE fixed-point
{
  const src = path.join(SCRATCH, 'ch4.c');
  fs.writeFileSync(src, `
int dead_branch(int x) {
  int a = x * 2 + 0;
  int b = a - a;
  if (b != 0) return 999;
  return a + 3;
}
`);
  const irO2 = clang(['-S', '-emit-llvm', '-O2', src, '-o', '-']);
  ok('dead_branch -O2 converts mul 2 to shl 1', /shl nsw i32 %0, 1/.test(irO2));
  ok('dead_branch -O2 deletes unreachable 999 branch', !/999/.test(irO2) && /add nsw i32 %[0-9]+, 3/.test(irO2));
}

// 5. Ch5: LICM + restrict (noalias) vs may-alias runtime check + NEON <4 x i32>
{
  const src = path.join(SCRATCH, 'ch5.c');
  fs.writeFileSync(src, `
int hoist_demo(const int *a, const int *b, int *out, int n) {
  for (int i = 0; i < n; i++) {
    out[i] = a[i] + (*b * 2);
  }
  return out[0];
}
int hoist_restrict(const int *restrict a, const int *restrict b, int *restrict out, int n) {
  for (int i = 0; i < n; i++) {
    out[i] = a[i] + (*b * 2);
  }
  return out[0];
}
`);
  const irO2 = clang(['-S', '-emit-llvm', '-O2', src, '-o', '-']);
  const fnDemo = irO2.slice(irO2.indexOf('@hoist_demo'), irO2.indexOf('@hoist_restrict'));
  const fnRest = irO2.slice(irO2.indexOf('@hoist_restrict'));
  ok('hoist_demo without restrict emits runtime pointer-overlap guard (icmp ult ptr)', /icmp ult ptr/.test(fnDemo));
  ok('hoist_restrict carries noalias and omits pointer-overlap guard', /ptr noalias/.test(fnRest) && !/icmp ult ptr/.test(fnRest));
  ok('hoist_restrict vectorizes into <4 x i32>', /<4 x i32>/.test(fnRest));
  const armS = clang(['-S', '-O2', src, '-o', '-']);
  ok('ARM64 sum/hoist emits NEON add.4s', /add\.4s\s+v/.test(armS));
}

// 6. Ch6: Signed overflow UB (add nsw) vs -fwrapv
{
  const src = path.join(SCRATCH, 'ch6.c');
  fs.writeFileSync(src, `
int abs_check(int x) {
  if (x + 1 > x) return 1;
  return 0;
}
`);
  const irO2 = clang(['-S', '-emit-llvm', '-O2', src, '-o', '-']);
  const irWrap = clang(['-S', '-emit-llvm', '-O2', '-fwrapv', src, '-o', '-']);
  const bodyO2 = irO2.slice(irO2.indexOf('@abs_check'));
  const bodyWrap = irWrap.slice(irWrap.indexOf('@abs_check'));
  ok('abs_check -O2 folds signed nsw check to ret i32 1', /ret i32 1/.test(bodyO2) && !/icmp/.test(bodyO2));
  ok('abs_check -O2 -fwrapv preserves wrap boundary via icmp ne %0, 2147483647', /icmp ne i32 %0, 2147483647/.test(bodyWrap) && !/nsw/.test(bodyWrap));
}

// 7. Ch7: SelectionDAG / GlobalISel & ARM64 vs x86_64 instruction selection
{
  const src = path.join(SCRATCH, 'ch7.c');
  fs.writeFileSync(src, `
int fma_int(int a, int b, int c) { return a * b + c; }
int shift_add(int a, int b) { return a + (b << 2); }
int scale_const(int x) { return x * 2 + 3; }
`);
  const armAsm = clang(['-S', '-O2', src, '-o', '-']);
  const x86Asm = clang(['-S', '-O2', '-target', 'x86_64-apple-macos15', src, '-o', '-']);
  ok('ARM64 fuses a*b+c into madd', /\bmadd\s+w0,\s*w1,\s*w0,\s*w2/.test(armAsm));
  ok('ARM64 fuses a+(b<<2) into add ..., lsl #2', /\badd\s+w0,\s*w0,\s*w1,\s*lsl\s*#2/.test(armAsm));
  ok('x86_64 uses imull + leal for fma_int', /\bimull\s+%esi,\s*%edi/.test(x86Asm) && /\bleal\s+\(%rdi,%rdx\),\s*%eax/.test(x86Asm));
  ok('x86_64 fuses x*2+3 into leal 3(,%rdi,2)', /\bleal\s+3\(,%rdi,2\),\s*%eax/.test(x86Asm));

  // Verify GlobalISel at -O0 vs SelectionDAG + greedy regalloc at -O2 via -debug-pass=Structure
  const structO0 = clangStderr(['-S', '-O0', '-mllvm', '-debug-pass=Structure', src, '-o', '/dev/null']);
  const structO2 = clangStderr(['-S', '-O2', '-mllvm', '-debug-pass=Structure', src, '-o', '/dev/null']);
  ok('ARM64 -O0 runs GlobalISel (irtranslator) + regallocfast', structO0.includes('irtranslator') && structO0.includes('regallocfast'));
  ok('ARM64 -O2 runs SelectionDAG (aarch64-isel) + greedy regalloc', structO2.includes('aarch64-isel') && structO2.includes('greedy'));
}

// 8. Ch8: Register spilling on ARM64 under high live pressure
{
  const src = path.join(SCRATCH, 'ch8.c');
  fs.writeFileSync(src, `
int ext(int);
int high_pressure(int x) {
  int a0 = ext(x+0), a1 = ext(x+1), a2 = ext(x+2), a3 = ext(x+3);
  int a4 = ext(x+4), a5 = ext(x+5), a6 = ext(x+6), a7 = ext(x+7);
  int b0 = ext(x+8), b1 = ext(x+9), b2 = ext(x+10), b3 = ext(x+11);
  return a0+a1+a2+a3+a4+a5+a6+a7+b0+b1+b2+b3;
}
`);
  const spillAsm = clang(['-S', '-O2', src, '-o', '-']);
  ok('ARM64 emits callee-saved spills (stp) and stack frame allocation when live values cross calls', /sub\s+sp,\s*sp/.test(spillAsm) && /Folded Spill/.test(spillAsm));
}

// 9. Ch9: Separate -O2 vs -flto=thin cross-TU inlining
{
  const aSrc = path.join(SCRATCH, 'tu_a.c');
  const bSrc = path.join(SCRATCH, 'tu_b.c');
  fs.writeFileSync(bSrc, `int add_mul(int x, int y) { return x * 3 + y; }\n`);
  fs.writeFileSync(aSrc, `int add_mul(int x, int y);\nint main(void) { return add_mul(10, 12); }\n`);

  const aNo = path.join(SCRATCH, 'tu_a_no.o'), bNo = path.join(SCRATCH, 'tu_b_no.o'), binNo = path.join(SCRATCH, 'bin_no');
  const aThin = path.join(SCRATCH, 'tu_a_thin.o'), bThin = path.join(SCRATCH, 'tu_b_thin.o'), binThin = path.join(SCRATCH, 'bin_thin');
  clang(['-O2', '-c', bSrc, '-o', bNo]);
  clang(['-O2', '-c', aSrc, '-o', aNo]);
  clang(['-O2', aNo, bNo, '-o', binNo]);

  clang(['-O2', '-flto=thin', '-c', bSrc, '-o', bThin]);
  clang(['-O2', '-flto=thin', '-c', aSrc, '-o', aThin]);
  clang(['-O2', '-flto=thin', aThin, bThin, '-o', binThin]);

  const ft = execFileSync('file', [bThin], { encoding: 'utf8' });
  ok('ThinLTO object is LLVM bitcode wrapper', ft.includes('LLVM bitcode'));

  const disNo = execFileSync('objdump', ['-d', binNo], { encoding: 'utf8' });
  const disThin = execFileSync('objdump', ['-d', binThin], { encoding: 'utf8' });
  const mainNo = disNo.slice(disNo.indexOf('<_main>:'), disNo.indexOf('<_main>:') + 300);
  const mainThin = disThin.slice(disThin.indexOf('<_main>:'), disThin.indexOf('<_main>:') + 300);
  ok('Separate -O2 main branches to _add_mul', /_add_mul/.test(mainNo));
  ok('ThinLTO main folds add_mul(10, 12) directly to mov w0, #0x2a (=42)', /#0x2a/.test(mainThin) && !/_add_mul/.test(mainThin));
}

console.log(`${n - fails}/${n} live clang crosschecks passed`);
if (fails) process.exit(1);

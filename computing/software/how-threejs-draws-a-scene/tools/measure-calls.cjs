#!/usr/bin/env node
'use strict';
/* Measures the CPU time of renderer.render() for N separate meshes against one InstancedMesh of N instances, in
   Chromium driven by Playwright, using the real three.js from an npm install outside the repository.
   Usage: NODE_PATH=~/fast/integ-life/integ-games/node_modules \
     node tools/measure-calls.cjs <install dir with node_modules/three> <scratch dir for the test page>
   It prints the browser, the GL renderer string and one line per N. The numbers are for one machine on one day:
   BRIEF.md records them with the machine and the date; the page uses them only as the default of a labelled
   parameter. Writes only into the scratch dir. */
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('playwright');
const [installDir, scratch] = process.argv.slice(2);
if (!installDir || !scratch) { console.error('usage: node tools/measure-calls.cjs <install dir> <scratch dir>'); process.exit(2); }
const three = path.join(path.resolve(installDir), 'node_modules', 'three', 'build', 'three.module.js');
fs.mkdirSync(scratch, { recursive: true });
fs.writeFileSync(path.join(scratch, 'three.module.js'), fs.readFileSync(three));
const coreFile = path.join(path.dirname(three), 'three.core.js');
if (fs.existsSync(coreFile)) fs.writeFileSync(path.join(scratch, 'three.core.js'), fs.readFileSync(coreFile));
fs.writeFileSync(path.join(scratch, 'index.html'), `<!doctype html><canvas id=c width=800 height=450></canvas>
<script type=module>
import * as THREE from './three.module.js';
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c') });
const dbg = renderer.getContext().getExtension('WEBGL_debug_renderer_info');
window.glRenderer = dbg ? renderer.getContext().getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown';
const cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 200); cam.position.set(0, 0, 60);
const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5), mat = new THREE.MeshStandardMaterial({ color: 0xccaa66 });
function scene(n, inst) {
  const s = new THREE.Scene(); s.add(new THREE.DirectionalLight(0xffffff, 3));
  const side = Math.ceil(Math.sqrt(n)), m = new THREE.Matrix4();
  if (inst === 'batched') { const bm = new THREE.BatchedMesh(n, 24 * n, 36 * n, mat); const gid = bm.addGeometry(geo); for (let i = 0; i < n; i++) { const id = bm.addInstance(gid); m.makeTranslation((i % side) - side / 2, Math.floor(i / side) - side / 2, 0); bm.setMatrixAt(id, m); } s.add(bm); s.userData.mover = null; return s; }
  if (inst === true || inst === 'moving') { const im = new THREE.InstancedMesh(geo, mat, n); for (let i = 0; i < n; i++) { m.makeTranslation((i % side) - side / 2, Math.floor(i / side) - side / 2, 0); im.setMatrixAt(i, m); } s.add(im); if (inst === 'moving') s.userData.mover = () => { for (let i = 0; i < n; i++) { m.makeTranslation((i % side) - side / 2, Math.floor(i / side) - side / 2, Math.random()); im.setMatrixAt(i, m); } im.instanceMatrix.needsUpdate = true; }; }
  else for (let i = 0; i < n; i++) { const me = new THREE.Mesh(inst === 'varied' ? new THREE.BoxGeometry(0.5, 0.5, 0.5) : geo, inst === 'varied' ? mat.clone() : mat); me.position.set((i % side) - side / 2, Math.floor(i / side) - side / 2, 0); s.add(me); }
  return s;
}
window.measure = (n, inst, frames) => {
  const s = scene(n, inst);
  for (let i = 0; i < 20; i++) renderer.render(s, cam);           // compile, upload, warm up
  renderer.getContext().finish();
  const t0 = performance.now();
  for (let i = 0; i < frames; i++) { if (s.userData.mover) s.userData.mover(); renderer.render(s, cam); }
  const t1 = performance.now();
  renderer.getContext().finish();
  // the same, waiting for the GPU process and the GPU after every frame (gl.finish), so their work is counted too
  const t2 = performance.now();
  for (let i = 0; i < frames; i++) { if (s.userData.mover) s.userData.mover(); renderer.render(s, cam); renderer.getContext().finish(); }
  const t3 = performance.now();
  return { ms: (t1 - t0) / frames, msFinish: (t3 - t2) / frames, calls: renderer.info.render.calls };
};
// shader programs: k MeshStandardMaterials that each need their own program (a unique #define defeats every cache),
// compiled and linked by rendering one frame, then waiting with gl.finish
window.compileTime = (k, salt) => {
  const s = new THREE.Scene(); s.add(new THREE.DirectionalLight(0xffffff, 3));
  for (let i = 0; i < k; i++) {
    const m = new THREE.MeshStandardMaterial({ color: 0x88aacc });
    m.customProgramCacheKey = () => salt + '-' + i;
    m.onBeforeCompile = sh => { sh.fragmentShader = '#define SALT_' + salt + '_' + i + '\\n' + sh.fragmentShader; };
    const me = new THREE.Mesh(geo, m); me.position.x = i - k / 2; s.add(me);
  }
  const t0 = performance.now(); renderer.render(s, cam); renderer.getContext().finish(); const t1 = performance.now();
  return { ms: t1 - t0, programs: renderer.info.programs.length };
};
window.ready = true;
</script>`);
const server = http.createServer((req, res) => {
  const f = path.join(scratch, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!f.startsWith(scratch) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html' }); res.end(fs.readFileSync(f));
}).listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForFunction(() => window.ready === true);
  console.log('browser', browser.version(), '| GL', await page.evaluate(() => window.glRenderer), '|', new Date().toISOString().slice(0, 10));
  for (const n of [1, 100, 1000, 4000]) {
    const sep = await page.evaluate(n => window.measure(n, false, 60), n);
    const ins = await page.evaluate(n => window.measure(n, true, 60), n);
    const vary = await page.evaluate(n => window.measure(n, 'varied', 60), n);
    const mov = await page.evaluate(n => window.measure(n, 'moving', 60), n);
    const bat = await page.evaluate(n => window.measure(n, 'batched', 60), n);
    const per = (a, b) => (n > 1 ? ((a - b) / (sep.calls - 1) * 1000).toFixed(2) + ' µs' : '—');
    console.log(`N=${n}  separate: ${sep.ms.toFixed(3)} ms main thread, ${sep.msFinish.toFixed(3)} ms with finish (${sep.calls} calls)  instanced: ${ins.ms.toFixed(3)} / ${ins.msFinish.toFixed(3)} ms (${ins.calls} call)  per extra call: ${per(sep.ms, ins.ms)} main thread, ${per(sep.msFinish, ins.msFinish)} with finish | own geometry + material each: ${vary.ms.toFixed(3)} / ${vary.msFinish.toFixed(3)} ms, per call ${per(vary.ms, ins.ms)} / ${per(vary.msFinish, ins.msFinish)} | instanced, all moving: ${mov.ms.toFixed(3)} / ${mov.msFinish.toFixed(3)} ms | batched: ${bat.ms.toFixed(3)} / ${bat.msFinish.toFixed(3)} ms (${bat.calls} call)`);
  }
  for (const k of [1, 10]) { const c = await page.evaluate(([k, salt]) => window.compileTime(k, salt), [k, 'r' + k]); console.log(`first frame with ${k} new MeshStandardMaterial program(s): ${c.ms.toFixed(1)} ms (${(c.ms / k).toFixed(1)} ms each; ${c.programs} programs in the cache)`); }
  await browser.close(); server.close();
});

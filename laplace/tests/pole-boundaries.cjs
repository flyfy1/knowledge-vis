const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const dir=path.join(__dirname,'..'),s=fs.readFileSync(path.join(dir,'app.js'),'utf8'),c={};
vm.runInNewContext(s.slice(0,s.lastIndexOf('/*',s.indexOf('   画布适配')))+';this.api={impulse4,verdict4};',c);
const simple={mode:'real',p1:-1,p2:0};assert.equal(c.api.verdict4(simple),'marginal');assert.ok(Math.abs(c.api.impulse4(simple,5)-(1-Math.exp(-5)))<1e-12);
assert.equal(c.api.verdict4({mode:'osc',pr:0,wd:0}),'unstable','double zero is h(t)=t, not bounded marginal motion');
const copy=fs.readFileSync(path.join(dir,'i18n.js'),'utf8');assert.ok(!copy.includes("s4vMarginal: '临界稳定——等幅振荡"),'marginal status must not claim all bounded nondecaying modes oscillate');
console.log('PASS: simple zero constant limit, double zero unbounded response, conditional stability copy');

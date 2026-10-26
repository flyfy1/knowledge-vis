// Calibrate the exact measurement helper used by browser.cjs, then recheck recorded browser colors.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const text=fs.readFileSync(path.join(__dirname,'browser.cjs'),'utf8');
const start=text.indexOf('function rgb(str)'),end=text.indexOf("await page.selectOption('#preset','0');",start);
assert(start>=0&&end>start);const report={};
const api=vm.runInNewContext(text.slice(start,end)+'\n({rgb,lum,contrast});',{assert,report});
const colors=JSON.parse(fs.readFileSync(path.join(out,'browser-results.json'),'utf8')).contrast;
for(const c of colors){const value=api.contrast(api.rgb(c.fg),api.rgb(c.bg));assert.equal(value,c.ratio);assert(value>=4.5);}
fs.writeFileSync(path.join(out,'contrast-calibration.json'),JSON.stringify({passed:true,source:'exact helper/calibration block extracted from tests/browser.cjs',...report.calibration,recheckedPairs:colors.length},null,2)+'\n');
console.log(report.calibration);

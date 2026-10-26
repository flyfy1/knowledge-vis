'use strict';
// Focused regression for 1125-R1: compare maximum bounds, not each input's counts.
const {chromium}=require('playwright');
const assert=require('assert/strict'), fs=require('fs'), path=require('path');
const {execFileSync}=require('child_process');
const {presets,trace}=require('../core.js');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence/review-r1');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage({viewport:{width:1280,height:1000}}),rows=[];
 try {
  await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1125/');
  await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>4);
  for(const lang of ['zh','en']){
   await page.click(`[data-lang=${lang}]`);
   await page.selectOption('#preset','4');await page.click('#end');
   const paragraph=await page.locator('[data-i18n=baseCost]').textContent();
   rows.push({lang,paragraph,input:await page.locator('#input').textContent(),output:await page.locator('#output').textContent()});
   await page.locator('[data-i18n=baseCost]').screenshot({path:path.join(out,`${lang}-bounds.png`)});
   assert(paragraph.includes('m≤16')&&paragraph.includes('n≤60'),'1125-R1: explain the distinct official bounds');
   assert(paragraph.includes('65,536'),'1125-R1: quantify the maximum coverage state count');
   assert(paragraph.includes(lang==='zh'?'并不保证每个输入都有 m<n':'does not guarantee m<n for each input'));
   assert(!/比人数小|the smaller skill count/.test(paragraph));
   assert(rows.at(-1).output.includes('[1,2]'));
   for(const zoom of [1,2]){
    await page.setViewportSize({width:320,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.locator('[data-i18n=baseCost]').screenshot({path:path.join(out,`${lang}-320-zoom${zoom}-bounds.png`)});
   }
   await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1280,height:1000});
  }
  const trap=presets[4];assert.equal(trap.skills.length,6);assert.equal(trap.people.length,3);
  const skills=Array.from({length:16},(_,i)=>String.fromCharCode(97+i)),people=[skills.slice()];
  assert.deepEqual(trace(skills,people).frames[1].after[65535],[0]);
  const python=execFileSync('python3',['-B','-c',
   'import runpy,sys,json; s=runpy.run_path(sys.argv[1])["Solution"](); q=list("abcdefghijklmnop"); assert s.smallestSufficientTeam(q,[q[:]])==[0]; print(json.dumps({"m":16,"n":1,"team":[0]}))',
   path.join(__dirname,'../solution.py')],{encoding:'utf8'});
  fs.writeFileSync(path.join(out,'r1-results.json'),JSON.stringify({finding:'1125-R1',status:'pass',rows,trap:{m:6,n:3,team:[1,2]},boundary:JSON.parse(python)},null,2));
  console.log('PASS 1125-R1: rendered bounds in both locales; trap m=6,n=3; actual Python m=16,n=1');
 } catch(e) {
  fs.writeFileSync(path.join(out,'r1-results.json'),JSON.stringify({finding:'1125-R1',status:'fail',rows,error:e.message},null,2));throw e;
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

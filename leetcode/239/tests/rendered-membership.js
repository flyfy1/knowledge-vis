'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const out=process.env.OUTPUT_DIR||'leetcode/239/tests/evidence/trace-repair-20261025';
const presets=[[[1,3,-1,-3,5,3,6,7],3],[[9,1,2,3],2],[[4,4,2,4,1],3],[[-5,-2,-7],2]];
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const rows=[],failures=[],errors=[];
 try {
  for(const width of [320,390,736,1280]){
   const page=await browser.newPage({viewport:{width,height:900}});
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
   await page.goto(`${process.env.PREVIEW_URL||'http://127.0.0.1:18770'}/leetcode/239/`);
   await page.waitForFunction(()=>document.querySelector('#progress').textContent.length);
   const verify=async(a,k,i,lang,phase)=>{
    const lo=Math.max(0,i-k+1), members=Array.from({length:i<0?0:i-lo+1},(_,j)=>lo+j);
    // Independent suffix-max candidates; equal values retain the newest index.
    const q=members.filter(j=>!members.some(h=>h>j&&a[h]>=a[j]));
    const output=Array.from({length:Math.max(0,i-k+2)},(_,s)=>Math.max(...a.slice(s,s+k)));
    const actual=await page.evaluate(()=>({
     members:[...document.querySelectorAll('#traceViz .current .array-index')].map(e=>+e.textContent),
     previous:[...document.querySelectorAll('#traceViz .previous .array-index')].map(e=>+e.textContent),
     deque:document.querySelector('#dequeReadout').textContent,
     progress:document.querySelector('#progress').textContent,
     scope:document.querySelector('#traceScope')?.textContent||'',
     removed:document.querySelector('#removed').textContent,
     overflow:document.documentElement.scrollWidth>innerWidth
    }));
    const expected={members,previous:Array.from({length:lo},(_,j)=>j),deque:q.length?q.map(j=>`${j}:${a[j]}`).join('  →  '):(lang==='zh'?'空':'empty')};
    for(const key of ['members','previous','deque'])try{assert.deepEqual(actual[key],expected[key])}catch(e){failures.push({width,lang,i,phase,key,expected:expected[key],actual:actual[key]})}
    assert.ok(actual.progress.includes(output.length?`[${output.join(', ')}]`:(lang==='zh'?'空':'empty')));
    assert.equal(actual.overflow,false);
    rows.push({width,lang,input:a,k,i,phase,expected,actual});
   };
   for(let p=0;p<presets.length;p++){
    const [a,k]=presets[p];await page.selectOption('#preset',String(p));
    for(let i=-1;i<a.length;i++){
     if(i>=0)await page.click('#next');
     for(const lang of ['en','zh']){await page.click(`[data-lang="${lang}"]`);await verify(a,k,i,lang,'forward');}
     if(p===0&&i===3){
      for(const lang of ['en','zh']){
       await page.click(`[data-lang="${lang}"]`);await page.locator('#traceViz').scrollIntoViewIfNeeded();
       await page.screenshot({path:`${out}/${lang}-${width}-middle.png`});
      }
     }
    }
    assert.equal(await page.locator('#next').isDisabled(),true);
    await page.click('#prev');await verify(a,k,a.length-2,'zh','rewind');
    await page.click('#next');await verify(a,k,a.length-1,'zh','replay');
    await page.click('#reset');await verify(a,k,-1,'zh','reset');
   }
   if(width===1280){
   await page.selectOption('#preset','0');for(let j=0;j<5;j++)await page.click('#next');
   for(const lang of ['en','zh']){
    await page.click(`[data-lang="${lang}"]`);
    await page.evaluate(()=>document.documentElement.style.zoom='2');
    await verify(presets[0][0],3,4,lang,'CSS zoom 200%');
    if(width===1280){await page.locator('#traceViz').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${lang}-zoom200.png`});}
    await page.evaluate(()=>document.documentElement.style.zoom='');
   }
   }
   await page.close();
  }
  fs.writeFileSync(`${out}/membership.json`,JSON.stringify({browser:browser.version(),platform:process.platform,rows,failures,errors},null,2)+'\n');
  assert.deepEqual(errors,[]);assert.equal(failures.length,0,JSON.stringify(failures.slice(0,6)));
  console.log(`239-R2-01: ${rows.length} rendered frame checks passed`);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

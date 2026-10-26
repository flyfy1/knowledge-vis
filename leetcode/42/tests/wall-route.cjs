'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.LESSON_PREVIEW || 'http://127.0.0.1:18843';
const output=process.env.LESSON_TEST_OUTPUT_DIR || path.join(__dirname,'evidence/wall-proof');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>localStorage.setItem('knowledge-lang','zh'));
  await page.goto(base+'/leetcode/42/?wall=proof#wall-lab');
  await page.waitForURL(base+'/leetcode/42-codex/?wall=proof#wall-lab');
  await page.waitForFunction(()=>window.wallSnapshot);
  const files=['index.html','app.js','copy.js','python-code.js','solution.py','wall-model.js','wall-lab.js','wall-lab.css'];
  for(const file of files){
    const r=await page.request.get(base+'/leetcode/42-codex/'+file);
    assert.equal(r.status(),200);
    assert.deepEqual(await r.body(),fs.readFileSync(path.join(__dirname,'..',file)));
  }
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(output,'zh-1440-header.png')});
  assert.match(await page.locator('.page-provenance summary').innerText(),/Codex 开发/);
  await browser.close();
  const result={route:'/leetcode/42-codex/?wall=proof#wall-lab',redirectQueryHash:'passed',runtimeByteParity:files,visibleCodex:'passed'};
  fs.writeFileSync(path.join(output,'route-results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;});

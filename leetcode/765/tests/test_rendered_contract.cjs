// Hand-calculated four-couple cycle, independent of the production trace builder.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence','margin-repair-20261025');
const rows=[[0,2,3,4,5,6,7,1],[0,1,3,4,5,6,7,2],[0,1,3,2,5,6,7,4],[0,1,3,2,5,4,7,6],[0,1,3,2,5,4,7,6]];
const swaps=[0,1,2,3,3],groups=[1,2,3,4,4];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try {
  const page=await browser.newPage(),records=[];
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/765/');
  for(const lang of ['en','zh']){
   await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','3');
   assert.ok((await page.locator('[data-i18n=proof]').textContent()).includes('n−c'));
   assert.ok((await page.locator('[data-i18n=sim]').textContent()).includes(lang==='en'?'Each frame follows one completed seat-pair decision':'每帧是处理完一个座位对之后'));
   const snapshots=[];
   const read=()=>page.evaluate(()=>Object.fromEntries(['afterRow','progress','positions','history','operation','graphRead','final'].map(id=>[id,document.getElementById(id).textContent])));
   for(let k=0;k<rows.length;k++){
    if(k)await page.locator('#next').click();
    const people=await page.locator('#afterRow .person').evaluateAll(es=>es.map(e=>Number(e.lastChild.textContent)));
    assert.deepEqual(people,rows[k]);
    assert.equal(await page.locator('#progress').textContent(),lang==='en'?`Processed ${k}/4 seat pairs · Cumulative swaps: ${swaps[k]}`:`已处理 ${k}/4 个座位对 · 累计交换 ${swaps[k]} 次`);
    assert.ok((await page.locator('#graphRead').textContent()).includes(`c=${groups[k]}`));
    assert.ok((await page.locator('#graphRead').textContent()).includes(`n−c=${4-groups[k]}`));
    assert.deepEqual(await page.locator('#positions span').allTextContents(),Array.from({length:8},(_,x)=>`${x} → ${rows[k].indexOf(x)}`));
    const snapshot=await read();snapshots.push(snapshot);records.push({lang,frame:k,row:people,swaps:swaps[k],remaining:4-groups[k],snapshot});
    if(k){await page.locator('#prev').click();assert.deepEqual(await read(),snapshots[k-1]);await page.locator('#next').click();assert.deepEqual(await read(),snapshot);}
   }
   await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();
   const feedback=await page.locator('#feedback').textContent();assert.ok(feedback.includes('4−2=2'));
   // Independent exercise retains its own input and answer when simulation changes.
   await page.selectOption('#preset','0');assert.equal(await page.locator('#feedback').textContent(),feedback);
   await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.ok((await page.locator('#feedback').textContent()).includes('4−2=2'));
   await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#feedback').textContent(),feedback);
   await page.locator('[name=prediction][value="0"]').check();assert.ok(!(await page.locator('#feedback').textContent()).includes('4−2=2'));
   await page.locator('#quizReset').click();
  }
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'rendered-contract.json'),JSON.stringify({host:process.platform,browser:browser.version(),records,predictionScope:'independent exercise preserved across preset/locale; changed answer clears reveal'},null,2)+'\n');
  console.log('Rendered formula, frame, cumulative count, prediction scope and replay checks passed in both locales');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

/* Focused rendered-state-contract self-check; expected values hand-calculated. */
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence/review-1-fix');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 try{
  const page=await browser.newPage({viewport:{width:320,height:1000}}),records=[];
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18783')+'/leetcode/691/');
  await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
  for(const lang of ['en','zh']){
   await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','0');
   for(let i=0;i<28;i++)await page.click('#next');
   const text=await page.locator('#history li').last().textContent();
   assert.equal(text,lang==='en'?'Return to ab: sticker a, child b has value 1; candidate 2; best so far 1.':'返回父 ab：贴纸 a 的子 b 值 1；候选 2；当前最小 1。');
   assert.equal(await page.locator('#history li').count(),29); // initial event 0 + 28 advances
   await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#history li').last().textContent(),text);
   const formula=await page.locator('.formula').textContent();
   assert(formula.includes('F(0)=0')&&formula.includes('child[j]=max(0,r[j]−sticker[j])')&&formula.includes('F(r)=min(1+F(child))')&&formula.includes('sticker[p]>0'));
   await page.check('[name=prediction][value="1"]');assert(await page.isHidden('#feedback'));await page.click('#reveal');
   const feedback=await page.locator('#feedback').textContent();assert(feedback.includes(lang==='en'?'The answer is 3':'答案是 3'));
   // Six needed letters / at most two per sticker => at least three; ab+ac+bc attains it.
   assert(feedback.includes('ab+ac+bc'));await page.check('[name=prediction][value="0"]');assert(await page.isHidden('#feedback'));
   records.push({lang,event:28,expected:{sticker:'a',child:'b',childValue:1,candidate:2,best:1,historyEntries:29},observed:text,formula,feedback,rewindReplay:true,changedPredictionHidden:true});
  }
  fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'rendered-state.json'),JSON.stringify({kind:'author self-check',records},null,2)+'\n');
  console.log('Rendered state: candidate/best, event accounting, formula and prediction scope passed in both locales.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

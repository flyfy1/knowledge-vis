const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});try{
const page=await b.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'}),rows=[];
await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1032/');
for(const lang of ['en','zh'])for(const zoom of [1,2]){
 await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(z=>document.body.style.zoom=z,zoom);
 for(let p=0;p<8;p++){
  await page.selectOption('#preset',String(p));
  const fit=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {font:s.font,fontFamily:s.fontFamily,controlWidth:e.clientWidth,text:e.selectedOptions[0].textContent,textWidth:c.measureText(e.selectedOptions[0].textContent).width,budget:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-24};});assert(fit.textWidth<=fit.budget);rows.push({lang,zoom,p,fit});
 }
 await page.locator('#preset').scrollIntoViewIfNeeded();await page.evaluate(()=>{const r=document.getElementById('preset').getBoundingClientRect();scrollBy(0,r.top-document.querySelector('.step-nav').getBoundingClientRect().height-24);});await page.screenshot({path:path.join(out,`preset-${lang}-zoom${zoom}.png`)});
 await page.selectOption('#preset','2');await page.locator('#end').click();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(28, 35, 48)');
 await page.locator('#event').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`exhausted-${lang}-zoom${zoom}.png`)});
 await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`prediction-${lang}-zoom${zoom}.png`)});
 await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator('#code').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`source-${lang}-zoom${zoom}.png`)});
 await page.locator('.step-nav a[href="#step3"]').click();await page.waitForTimeout(80);const navGeo=await page.evaluate(()=>({top:document.getElementById('step3').getBoundingClientRect().top,bottom:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(navGeo.top>=navGeo.bottom-2,JSON.stringify(navGeo));rows.push({lang,zoom,navGeo});
 await page.locator('h1').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`header-${lang}-zoom${zoom}.png`)});
}
// Related destinations: activate through actual keyboard, then inspect promised text.
await page.evaluate(()=>document.body.style.zoom=1);
for(const [selector,needle] of [['a[data-i18n=trieLink]','trie'],['a[data-i18n=link2]','trie'],['a[data-i18n=link3]','trie']]){
 await page.locator('[data-lang=en]').click();const a=page.locator(selector),href=await a.getAttribute('href');await a.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+href.replace('../',''));const fragment=new URL(page.url()).hash;const text=await page.locator(fragment).textContent();assert(text.toLowerCase().includes(needle));rows.push({keyboardLink:href,meaningExcerpt:text.slice(0,800)});await page.goBack();await page.locator('#progress').waitFor();
}
fs.writeFileSync(path.join(out,'browser-extra-results.json'),JSON.stringify({passed:true,kind:'author self-check',rows},null,2)+'\n');console.log('extra browser checks passed');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});

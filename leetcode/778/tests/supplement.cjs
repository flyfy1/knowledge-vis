const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/778/';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const page=await browser.newPage({viewport:{width:390,height:1000},reducedMotion:'reduce'});const report=[];
for(const lang of ['en','zh']){
 await page.goto(base);await page.click(`[data-lang=${lang}]`);
 for(const target of ['../23/#step1','../407/#step2']){
  const link=page.locator(`.related a[href="${target}"]`);const label=await link.textContent();await link.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+target.slice(3));await page.waitForFunction(()=>document.querySelector('h2').textContent.length>0);
  const fragment=target.split('#')[1],text=await page.locator('#'+fragment).textContent();assert(text.includes(lang==='en'?'heap':'堆'));if(target.includes('407'))assert(text.includes(lang==='en'?'boundary':'边缘'));
  report.push({lang,label,url:page.url(),excerpt:text.slice(0,1200)});await page.goto(base);await page.click(`[data-lang=${lang}]`);
 }
 await page.selectOption('#preset',{value:'2'});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#presetName').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`zoom-controls-${lang}.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
}
fs.writeFileSync(path.join(out,'related-links.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log('PASS keyboard related links, actual destination text, zoom controls');})().catch(e=>{console.error(e);process.exit(1)});

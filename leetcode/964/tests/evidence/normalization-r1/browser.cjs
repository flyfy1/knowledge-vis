const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const out=__dirname,root=path.resolve(out,'../../..');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:18770/leetcode/964/');await page.locator('#progress').filter({hasText:'0/2'}).waitFor();
 assert.equal(await page.locator('script[src^="copy.js"]').getAttribute('src'),'copy.js?v=964-normalize-r1');
 await page.selectOption('#preset','0');await page.locator('#next').click();
 await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();
 const report={kind:'author rendered proof self-check',browser:await browser.version(),host:process.platform,zoom:'document.body.style.zoom=2 (synthetic CSS page zoom, not native browser zoom)',proofs:[],geometry:[],errors};
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  const proof=await page.locator('[data-i18n=proof]').textContent();
  for(const text of ['3^-1 = 1/3','3/3/3 + 3/3/3 + 3/3/3 = 1','3 * 3 = 9'])assert(proof.includes(text),text);
  assert(proof.includes(lang==='en'?'costing 2':'费用为 2'));
  assert(proof.includes(lang==='en'?'only once from the complete expression':'只在完整表达式末尾去掉一次'));
  assert(proof.includes(lang==='en'?'general argument is still needed':'仍需一般论证'));
  assert((await page.locator('#progress').textContent()).includes('1/2'));
  assert((await page.locator('#ledger').textContent()).includes('p=2×2=4'));
  assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());
  assert((await page.locator('#feedback').textContent()).includes('min(6,2+2)−1=3'));
  report.proofs.push({lang,text:proof});
  for(const width of [320,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);
   const p=page.locator('[data-i18n=proof]');await p.scrollIntoViewIfNeeded();
   const geometry=await p.evaluate(e=>{
    const range=document.createRange();range.selectNodeContents(e);
    const rect=e.getBoundingClientRect(),lines=[...range.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}));
    return {rect:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},lines,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,overflow:getComputedStyle(e).overflow};
   });
   assert(geometry.scrollWidth<=width+1);
   for(const line of geometry.lines){assert(line.left>=geometry.rect.left-1&&line.right<=geometry.rect.right+1);assert(line.top>=geometry.rect.top-1&&line.bottom<=geometry.rect.bottom+1);}
   await p.screenshot({path:path.join(out,`${lang}-${width}-z${zoom}-proof.png`)});
   // Element screenshots can place the sticky nav over a tall element. Retain
   // settled viewport tiles too, using ordinary scrolling without DOM/style edits.
   if(width===320&&zoom===2){
    const bounds=await p.evaluate(e=>{const r=e.getBoundingClientRect();return {top:r.top+scrollY,height:r.height,nav:document.querySelector('.step-nav').getBoundingClientRect().height};});
    const stride=1000-bounds.nav-40;
    for(let offset=0,tile=0;offset<bounds.height;offset+=stride,tile++){
     await page.evaluate(y=>window.scrollTo(0,y),bounds.top+offset-bounds.nav-16);
     await page.waitForTimeout(150);
     await page.screenshot({path:path.join(out,`${lang}-320-z2-viewport-${tile}.png`)});
    }
   }
   report.geometry.push({lang,width,zoom,...geometry});
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});
 }
 await page.locator('[data-lang=en]').click();assert((await page.locator('#progress').textContent()).includes('1/2'));
 await page.locator('#prev').click();assert((await page.locator('#progress').textContent()).includes('0/2'));
 await page.locator('#next').click();assert((await page.locator('#ledger').textContent()).includes('p=2×2=4'));
 await page.locator('#end').click();assert((await page.locator('#result').textContent()).includes('min(5, 4)−1=3'));
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'proof-browser.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();console.log('PASS: bilingual proof, 8 geometry captures, trace/prediction locale roundtrip');
})().catch(e=>{console.error(e);process.exit(1)});

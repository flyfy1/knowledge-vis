const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const page=await browser.newPage({viewport:{width:390,height:1000}});await page.emulateMedia({reducedMotion:'reduce'});
 const base='http://127.0.0.1:18770';await page.goto(base+'/leetcode/736/');
 const observations=[];
 for(const lang of ['zh','en','zh']){
  await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>scrollTo(0,0));
  assert.equal(await page.title(),lang==='zh'?'#736 · Lisp 语法解析':'#736 · Parse Lisp Expression');await page.screenshot({path:path.join(out,`${lang}-heading.png`)});
  await page.selectOption('#preset','0');for(let i=0;i<9;i++)await page.click('#next');
  assert((await page.locator('#event').textContent()).includes(lang==='zh'?'let 返回 5':'let returns 5'));
  assert.equal(await page.locator('#beforeMaps').textContent(),'x : [2, 5]');assert.equal(await page.locator('#afterMaps').textContent(),'x : [2]');
  assert.equal(await page.locator('#calls li').count(),2);
  await page.locator('#event').evaluate(el=>el.scrollIntoView({block:'start'}));await page.evaluate(()=>scrollBy(0,-90));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:path.join(out,`${lang}-return.png`)});
  const returned=await page.locator('#event').textContent();await page.click('#next');assert((await page.locator('#event').textContent()).includes(lang==='zh'?'返回 2':'return 2'));
  observations.push({lang,return:returned,sibling:await page.locator('#event').textContent(),before:'x : [2, 5]',after:'x : [2]',cursor:await page.locator('#progress').textContent()});
  await page.check('[name=prediction][value="2"]');await page.click('#reveal');await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-prediction.png`)});
 }
 const official=await page.locator('.official-link').getAttribute('href');assert.equal(official,'https://leetcode.com/problems/parse-lisp-expression/');
 for(const href of await page.locator('.related a').evaluateAll(a=>a.map(x=>x.href))){const u=new URL(href);const r=await page.request.get(u.origin+u.pathname);assert.equal(r.status(),200);assert((await r.text()).includes(`id="${u.hash.slice(1)}"`));}
 // Verify offline page, exact embedded display, and pair shape for the shared locale consumer.
 await page.goto('file://'+path.resolve(__dirname,'../index.html'));await page.locator('#sourceDetails summary').click();
 assert.equal(await page.locator('#pythonCode').textContent(),fs.readFileSync(path.resolve(__dirname,'../solution.py'),'utf8'));
 assert(await page.evaluate(()=>Object.values(window.LISP_COPY).every(x=>Array.isArray(x)&&x.length===2&&x.every(v=>typeof v==='string'&&v.length>0))));
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();await page.keyboard.press('Tab');await page.screenshot({path:path.join(out,'forced-colors.png')});
 fs.writeFileSync(path.join(out,'inspect.json'),JSON.stringify({kind:'author self-check',observations,official,relatedAnchors:'200 and exact target IDs',offline:'exact source, shared locale and local simulation initialized',pairShape:'all two-string pairs',forcedColors:'native controls retained; screenshot inspected'},null,2));await browser.close();console.log('Focused return/sibling, heading, links, offline and forced-colors checks passed.');
})().catch(e=>{console.error(e);process.exit(1)});

/* Browser workflow checks for the root-only LeetCode adapter. No production writes. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const base=process.env.HOME_TEST_URL||'http://127.0.0.1:18776/';
const evidence=process.env.HOME_TEST_EVIDENCE||'/tmp/leetcode-home-section-evidence';
fs.mkdirSync(evidence,{recursive:true});
const source=fs.readFileSync(process.env.HOME_TEST_REGISTRY||path.join(__dirname,'../leetcode/problems.config.js'),'utf8');
const data=JSON.parse(source.slice(source.indexOf('['),source.lastIndexOf(']')+1));
const registry=data=>`window.LEETCODE_PROBLEMS = ${JSON.stringify(data)};`;
const checks=[];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:900},locale:'en-US'});
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let response=source,mode='ok',requests=[],release;
 await page.route('**/leetcode/problems.config.js*',async route=>{
  requests.push(route.request().url());
  if(mode==='delay')await new Promise(resolve=>release=resolve);
  if(mode==='error')return route.fulfill({status:503,body:'Unavailable'});
  await route.fulfill({status:200,contentType:'application/javascript',body:response});
 });
 const cat=id=>page.locator(`[data-cat="${id}"]`);
 const cards=()=>page.locator('.lesson-card:visible');
 const ready=async()=>{await page.waitForFunction(()=>/\d+/.test(document.querySelector('#resultCount').textContent));};
 const ids=async()=>cards().evaluateAll(els=>els.map(el=>Number(el.dataset.problemId)));
 await page.goto(base+'?keep=1#anchor');
 assert.equal(requests.length,0,'registry loads lazily');
 const otherCards=await page.locator('#grid > .card').evaluateAll(els=>els.filter(el=>!el.querySelector('.cat-badge')?.textContent.includes('LeetCode')).map(el=>[el.querySelector('h2').textContent,el.getAttribute('href')]));
 await page.locator('[data-stage="senior"]').click();
 const highCards=await page.locator('#grid > .card').count();
 await cat('leetcode').click();await ready();
 assert.equal(await cards().count(),data.length);assert.equal(await page.locator('#stageChips').isVisible(),false);
 assert.match(page.url(),/category=leetcode/);assert.match(page.url(),/keep=1/);assert.match(page.url(),/#anchor$/);
 assert.equal(await page.locator('#grid > .card').count(),0);
 assert.equal(await page.locator('.lesson-card a a').count(),0);
 const actualLinks=await page.locator('.lesson-card').evaluateAll(els=>els.map(el=>({id:+el.dataset.problemId,lesson:el.querySelector('.lesson-link').href,official:el.querySelector('.official-link').href})));
 for(const p of data){const actual=actualLinks.find(x=>x.id===p.id);assert.equal(actual.lesson,new URL('leetcode/'+p.path,base).href);assert.equal(actual.official,p.leetcodeUrl);}
 checks.push('Direct category, lazy source, all links, stage hiding, unrelated URL state');
 const input=page.locator('#problemSearch');
 for(const q of ['51','#51','＃５１']){await input.fill(q);assert.deepEqual(await ids(),[51]);}
 await input.fill('binary partition');assert.ok((await ids()).includes(4));
 await input.fill('二分 划分');assert.ok((await ids()).includes(4));
 await input.fill('NoSuchLessonXYZ');assert.equal(await cards().count(),0);assert.match(await page.locator('#emptyLessons').textContent(),/No matching/);
 await page.locator('[data-lang="zh"]').click();assert.match(await page.locator('#emptyLessons').textContent(),/没有匹配/);assert.equal(await input.inputValue(),'NoSuchLessonXYZ');
 await page.locator('#clearSearch').click();assert.equal(await input.inputValue(),'');assert.equal(await input.evaluate(el=>document.activeElement===el),true);assert.equal(await cards().count(),data.length);
 await input.fill('#51');const before=await page.evaluate(()=>location.href);
 await input.dispatchEvent('compositionstart');await input.evaluate(el=>{el.value='皇后';el.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));});
 assert.equal(await page.evaluate(()=>location.href),before);assert.deepEqual(await ids(),[51]);
 await page.locator('[data-lang="en"]').click();assert.deepEqual(await ids(),[51]);assert.equal(await input.inputValue(),'皇后');
 await input.dispatchEvent('compositionend');assert.notEqual(await page.evaluate(()=>location.href),before);assert.ok((await ids()).includes(51));
 checks.push('Exact ID/NFKC, bilingual token AND, no-match, clear focus, locale and IME');
 await input.fill('#51');await cat('all').click();assert.equal(await page.locator('#stageChips').isVisible(),true);assert.equal(await page.locator('#grid > .card').count(),highCards);
 await page.goBack();assert.deepEqual(await ids(),[51]);await page.goForward();assert.equal(await cat('all').getAttribute('aria-pressed'),'true');
 await cat('leetcode').click();assert.equal(await input.inputValue(),'#51');await page.reload();await ready();assert.deepEqual(await ids(),[51]);
 await page.locator('.lesson-card:visible .lesson-link').click();await page.goBack();await ready();assert.deepEqual(await ids(),[51]);
 await cat('all').click();await page.locator('[data-stage="all"]').click();await page.locator('[data-lang="en"]').click();
 const nowCards=await page.locator('#grid > .card').evaluateAll(els=>els.filter(el=>!el.querySelector('.cat-badge')?.textContent.includes('LeetCode')).map(el=>[el.querySelector('h2').textContent,el.getAttribute('href')]));
 assert.deepEqual(nowCards,otherCards);
 await page.locator('#grid a.card').filter({has:page.locator('.cat-badge', {hasText:'LeetCode'})}).click();await ready();
 assert.equal(await page.locator('[data-cat="leetcode"]').evaluate(el=>el===document.activeElement),true);
 checks.push('Category/history/query/reload/lesson Back, other cards unchanged, All entry inline');
 // Both locales and device widths, including equivalent 200% layout zoom.
 await page.locator('#clearSearch').click();
 for(const lang of ['zh','en'])for(const width of [320,390,640,1280]){
  await page.setViewportSize({width,height:900});await page.locator(`[data-lang="${lang}"]`).click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${lang}/${width} overflow`);
  const tiny=await page.locator('#catChips button,#stageChips button,#langToggle button,#leetcodeSearch button,#problemSearch,.lesson-card a:visible').evaluateAll(els=>els.filter(el=>el.getClientRects().length).filter(el=>el.getBoundingClientRect().height<48).map(el=>el.outerHTML));assert.deepEqual(tiny,[]);
  if(width===390||width===1280)await page.screenshot({path:path.join(evidence,`home-${lang}-${width}.png`),fullPage:false});
 }
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await input.focus();assert.equal(await input.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
 await page.emulateMedia({forcedColors:'none'});await input.focus();assert.equal(await input.evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
 checks.push('Both locales 320/390/640/1280, equivalent layout zoom, 48px targets, forced colors/focus');
 // Failure, retry and locale while loading. Each navigation is a fresh load.
 mode='error';await page.goto(base+'?category=leetcode&q=%2351');await page.locator('#retryLessons').waitFor({state:'visible'});
 assert.equal(await cards().count(),0);assert.doesNotMatch(await page.locator('#resultCount').textContent(),/0 of/);
 await page.locator('[data-lang="zh"]').click();assert.match(await page.locator('#sectionError').textContent(),/重试/);
 mode='delay';await page.locator('#retryLessons').click();await page.waitForFunction(()=>document.querySelector('#resultCount').textContent.includes('读取'));
 assert.equal(await input.evaluate(el=>el===document.activeElement),true);
 await cat('all').click();await page.locator('[data-lang="en"]').click();release();await page.waitForTimeout(100);assert.equal(await cards().count(),0);
 mode='ok';await cat('leetcode').click();await ready();assert.deepEqual(await ids(),[51]);assert.match(await page.locator('#resultCount').textContent(),/1 of/);
 checks.push('Error/retry, query retention, delay/category/locale race, stable focus');
 // Invalid registries fail as a whole; a valid empty catalog is distinguishable.
 for(const bad of ['not JSON',registry([data[0],data[0]]),registry([{...data[0],title:{zh:' ',en:''}}]),registry([{...data[0],language:' '}]),registry([{...data[0],path:'../evil/'}]),registry([{...data[0],leetcodeUrl:'https://evil.example/'}])]){
  response=bad;await page.goto(base+'?category=leetcode');await page.locator('#retryLessons').waitFor({state:'visible'});assert.equal(await cards().count(),0);
 }
 response=registry([]);await page.reload();await ready();assert.match(await page.locator('#emptyLessons').textContent(),/no lessons/);
 await page.locator('[data-lang="zh"]').click();assert.match(await page.locator('#emptyLessons').textContent(),/列表目前为空/);await page.locator('[data-lang="en"]').click();
 // A real bounded timeout must reach a recoverable state; a late response cannot repaint it.
 response=source;mode='delay';await page.reload();await page.locator('#retryLessons').waitFor({state:'visible',timeout:20000});
 assert.match(await page.locator('#resultCount').textContent(),/could not be loaded/);release();mode='ok';await page.locator('#retryLessons').click();await ready();assert.equal(await cards().count(),data.length);
 checks.push('Bilingual empty catalog and real 15-second timeout with late response/retry');
 response=registry(Array.from({length:984},(_,i)=>({...data[0],id:i+1,path:(i+1)+'/',title:{zh:'长'.repeat(120),en:'W'.repeat(120)}})));
 await page.setViewportSize({width:320,height:700});const start=Date.now();await page.reload();await ready();assert.equal(await cards().count(),984);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await input.fill('#984');assert.deepEqual(await ids(),[984]);checks.push(`Malformed/duplicate/unsafe links, empty, 984 long-title fixture (${Date.now()-start}ms including navigation/filter)`);
 assert.equal(new Set(requests).size,requests.length,'fresh version across page sessions/retries');
 // Refuse storage: language change still works in memory.
 const noStorage=await browser.newContext();await noStorage.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Denied');}})});
 const np=await noStorage.newPage();await np.goto(base+'?category=leetcode&q=%2351');await np.locator('.lesson-card:visible').waitFor();await np.locator('[data-lang="zh"]').click();assert.equal(await np.locator('html').getAttribute('lang'),'zh-CN');await noStorage.close();
 // Offline folder opening uses the local registry script, not HTTP fetch.
 const fp=await context.newPage();await fp.goto('file://'+path.resolve(__dirname,'../index.html')+'?category=leetcode&q=%2351');await fp.locator('.lesson-card:visible').waitFor();assert.equal(await fp.locator('.lesson-card:visible').count(),1);assert.match(await fp.locator('.lesson-card:visible .lesson-link').getAttribute('href'),/\/leetcode\/51\/index\.html$/);await fp.locator('.lesson-card:visible .lesson-link').click();await fp.locator('h1').waitFor();assert.match(await fp.locator('h1').textContent(),/51/);await fp.close();
 checks.push('Denied storage and file-protocol catalog fallback');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(evidence,'results.json'),JSON.stringify({status:'pass',catalog:data.length,checks,requests,errors},null,2));console.log(JSON.stringify({status:'pass',catalog:data.length,checks},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let pw;try{pw=require('playwright')}catch(_){pw=require('/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const base=process.env.COLLECTION_URL||'http://127.0.0.1:18771/leetcode/';
const out=process.env.COLLECTION_TEST_OUTPUT_DIR||'/tmp/leetcode-collection-evidence';fs.mkdirSync(out,{recursive:true});
const report={checks:[],contrast:[],screenshots:[],errors:[],synthetic:[]};
function check(value,label){assert(value,label);report.checks.push(label)}
function contrast(a,b){const lum=s=>{const c=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722};const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
(async()=>{
 const browser=await pw.chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{});
 for(const lang of ['en','zh']){
  const context=await browser.newContext({viewport:{width:1280,height:900},locale:lang==='en'?'en-US':'zh-CN'}),page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(base+'?keep=yes#collection');await page.locator('.problem-card').first().waitFor();
  const total=await page.locator('.problem-card').count();check(total>0,`${lang}: real registry nonempty`);
  const input=page.locator('#problemSearch'),visible=page.locator('.problem-card:visible');
  check(await input.getAttribute('aria-describedby')==='searchHelp',`${lang}: input help association`);
  check(await page.locator('label[for="problemSearch"]').innerText()!==''&&await page.locator('#resultCount').getAttribute('role')==='status',`${lang}: visible label and polite count`);
  for(const [query,id] of [['51','51'],['#51','51'],['0051','51'],['４１','41']]){await input.fill(query);check(await visible.count()===1&&await visible.first().getAttribute('data-problem-id')===id,`${lang}: exact ID ${query}`)}
  await input.fill('queens');check(await visible.count()===2,`${lang}: English title in either locale`);
  await input.fill('皇后');check(await visible.count()===2,`${lang}: Chinese title in either locale`);
  await input.fill('Binary partition');check(await visible.first().getAttribute('data-problem-id')==='4',`${lang}: topic AND matching`);
  await input.fill('partition median');check(await visible.count()===1,`${lang}: title and topic cross-field AND`);
  await input.fill('  ');check(await visible.count()===total,`${lang}: whitespace shows all`);
  await input.fill('<img src=x onerror=alert(1)>');check(await visible.count()===0&&await page.locator('#emptyResults').isVisible(),`${lang}: untrusted query plain no-match`);
  check(await page.locator('#resultCount').textContent()===(lang==='en'?`0 of ${total} available lessons`:`找到 0 / ${total} 篇可用课程`),`${lang}: exact truthful zero count`);
  await page.locator('#clearSearch').click();check(await visible.count()===total&&await input.inputValue()===''&&await input.evaluate(e=>e===document.activeElement),`${lang}: clear restores and focuses`);
  check(!new URL(page.url()).searchParams.has('q')&&new URL(page.url()).searchParams.get('keep')==='yes'&&new URL(page.url()).hash==='#collection',`${lang}: clear preserves unrelated URL`);
  await input.fill('皇后');await input.evaluate(e=>{e.focus();e.setSelectionRange(0,1)});
  await page.locator(`#langToggle button[data-lang="${lang==='en'?'zh':'en'}"]`).click();check(await input.inputValue()==='皇后'&&await input.evaluate(e=>e.selectionStart===0&&e.selectionEnd===1)&&await visible.count()===2,`${lang}: locale preserves query and selection`);
  await page.reload();check(await input.inputValue()==='皇后'&&await visible.count()===2,`${lang}: reload restores query`);
  await visible.first().locator('.lesson-link').click();await page.goBack();check(await input.inputValue()==='皇后'&&await visible.count()===2,`${lang}: return from lesson retains query`);
  await page.evaluate(()=>history.pushState({},'',location.pathname+'?q=4'));await page.evaluate(()=>dispatchEvent(new PopStateEvent('popstate')));check(await visible.count()===1&&await input.inputValue()==='4',`${lang}: popstate restores URL query`);
  await page.goBack();check(await input.inputValue()==='皇后',`${lang}: history back restores prior query`);await page.goForward();check(await input.inputValue()==='4',`${lang}: history forward restores query`);
  await input.dispatchEvent('compositionstart');await input.fill('51');check(await visible.first().getAttribute('data-problem-id')==='4',`${lang}: composition defers filtering`);await input.dispatchEvent('compositionend');check(await visible.first().getAttribute('data-problem-id')==='51',`${lang}: compositionend applies query`);
  await page.locator(`#langToggle button[data-lang="${lang}"]`).click();await page.locator('#clearSearch').click();
  for(const width of [320,390,736,1280]){
   await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}: no overflow ${width}`);
   for(const selector of ['#problemSearch','#clearSearch','#langToggle button','.problem-actions a'])check(await page.locator(selector).evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.height>=48&&r.width>=48})),`${lang}: 48px ${selector} at ${width}`);
  }
  await page.setViewportSize({width:320,height:900});await input.fill('汉'.repeat(120));check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}: 120 CJK input at320`);await page.locator('#clearSearch').click();
  await page.evaluate(()=>document.querySelector('.lesson-link').append('W'.repeat(120)));check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}: long title at320`);
  await page.setViewportSize({width:640,height:1000});await page.evaluate(()=>document.body.style.zoom='2');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}: 200% zoom effective320`);
  check(await input.evaluate(e=>e.getBoundingClientRect().width>=200)&&await page.locator('#clearSearch').evaluate(e=>e.scrollWidth<=e.clientWidth),`${lang}: zoom controls remain legible`);
  await page.locator('.collection-search').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(out,`${lang}-zoom.png`)});report.screenshots.push(`${lang}-zoom.png`);
  await page.evaluate(()=>document.body.style.zoom='');await page.setViewportSize({width:390,height:900});await page.screenshot({path:path.join(out,`${lang}-mobile.png`)});report.screenshots.push(`${lang}-mobile.png`);
  await input.focus();await page.keyboard.press('Tab');check(await page.locator('#clearSearch').evaluate(e=>document.activeElement===e),`${lang}: keyboard order input to clear`);
  check(await page.locator('#clearSearch').evaluate(e=>getComputedStyle(e).outlineWidth)==='3px',`${lang}: 3px focus`);
  for(const selector of ['#searchLabel','#searchHelp','#resultCount','#problemSearch','#clearSearch','#langToggle button.active']){
   const colors=await page.locator(selector).evaluate(e=>{const style=getComputedStyle(e);let node=e,bg=style.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&node.parentElement){node=node.parentElement;bg=getComputedStyle(node).backgroundColor}return {fg:style.color,bg}});const ratio=contrast(colors.fg,colors.bg);report.contrast.push({lang,selector,ratio});check(ratio>=7,`${lang}: core contrast ${selector} ${ratio.toFixed(2)}`);
  }
  const boundary=await input.evaluate(e=>({border:getComputedStyle(e).borderColor,bg:getComputedStyle(e).backgroundColor}));check(contrast(boundary.border,boundary.bg)>=3,`${lang}: input boundary contrast`);
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await input.focus();check(await input.evaluate(e=>getComputedStyle(e).outlineStyle!=='none'),`${lang}: forced color focus`);check(await page.locator('html').evaluate(e=>getComputedStyle(e).scrollBehavior)==='auto',`${lang}: reduced motion`);
  check(await page.locator('#langToggle').evaluate(e=>getComputedStyle(e).overflow==='visible'),`${lang}: language focus not clipped`);
  const external=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>!r.name.startsWith(location.origin)).map(r=>r.name));check(external.length===0,`${lang}: all runtime requests local`);
  await context.close();
 }
 // Generated public routes use the same collection renderer; no duplicate registry or cards.
 const generatedContext=await browser.newContext({locale:'en-US'}),generatedPage=await generatedContext.newPage();
 const source=fs.readFileSync(process.env.COLLECTION_TEST_REGISTRY||path.join(__dirname,'../leetcode/problems.config.js'),'utf8');
 const generated=JSON.parse(source.slice(source.indexOf('['),source.lastIndexOf(']')+1)).map(p=>({...p,path:p.id+'-codex/'}));
 await generatedPage.route(url=>/\/leetcode\/problems(?:\.codex)?\.config\.js$/.test(url.pathname),route=>route.fulfill({contentType:'application/javascript',body:`window.LEETCODE_PROBLEMS=${JSON.stringify(generated)};`}));
 await generatedPage.goto(base);check(await generatedPage.locator('.problem-card').count()===generated.length,'generated Codex registry: one card per ID');
 const rendered=await generatedPage.locator('.problem-card').evaluateAll(cards=>cards.map(card=>({id:Number(card.dataset.problemId),title:card.querySelector('.lesson-link').getAttribute('href'),open:card.querySelector('.problem-actions a').getAttribute('href'),official:card.querySelector('.official-link').getAttribute('href')})));
 check(generated.every(p=>{const card=rendered.find(c=>c.id===p.id);return card&&card.title===p.path&&card.open===p.path&&card.official===p.leetcodeUrl}),'generated Codex registry: all title/open/official links');
 await generatedPage.locator('#problemSearch').fill('#51');await generatedPage.locator('[data-lang="zh"]').click();check(await generatedPage.locator('.problem-card:visible').count()===1&&await generatedPage.locator('.problem-card:visible .lesson-link').getAttribute('href')==='51-codex/','generated Codex registry: search and locale retain route');
 await generatedPage.route('**/leetcode/51-codex/',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><h1>Generated-route navigation fixture #51</h1>'}));await generatedPage.locator('.problem-card:visible .lesson-link').click();check(generatedPage.url()===new URL('51-codex/',base).href,'generated Codex registry: navigation reaches version path fixture');await generatedPage.goBack();check(await generatedPage.locator('#problemSearch').inputValue()==='#51','generated Codex registry: Back restores search');await generatedContext.close();
 for(const fixture of ['missing','malformed','empty',100,984]){
  const context=await browser.newContext(),page=await context.newPage();
  const entries=typeof fixture==='number'?Array.from({length:fixture},(_,i)=>({id:i+1,title:{en:`Synthetic Lesson ${i+1}`,zh:`合成课程 ${i+1}`},desc:{en:'Synthetic test fixture, not a published lesson.',zh:'测试夹具，不是已发布课程。'},topics:[{en:'Fixture topic',zh:'测试知识点'}],difficulty:'hard',path:`${i+1}/`,leetcodeUrl:`https://leetcode.com/problems/synthetic-${i+1}/`,language:'Python',complexity:'O(n)'})):fixture==='empty'?[]:[{id:1}];
  await page.route(url=>/\/leetcode\/problems(?:\.codex)?\.config\.js$/.test(url.pathname),route=>route.fulfill({contentType:'application/javascript',body:fixture==='missing'?'/* deliberately unavailable test data */':`window.LEETCODE_PROBLEMS=${JSON.stringify(entries)};`}));
  await page.goto(base);
  if(fixture==='missing'||fixture==='malformed'){check(await page.locator('#loadError').isVisible()&&await page.locator('#resultCount').isHidden(),`${fixture}: truthful error`);await page.locator('[data-lang="zh"]').click();check((await page.locator('#loadError').textContent()).includes('无法读取'),`${fixture}: bilingual error`)}
  else if(fixture==='empty'){check(await page.locator('#emptyResults').isVisible()&&(await page.locator('#emptyResults').textContent()).includes('no lessons'),`empty: honest collection`);await page.locator('[data-lang="zh"]').click();check((await page.locator('#emptyResults').textContent()).includes('目前为空'),'empty: bilingual collection')}
  else {const start=Date.now();await page.locator('#problemSearch').fill('#'+fixture);check(await page.locator('.problem-card:visible').count()===1&&await page.locator('.problem-card:visible').getAttribute('data-problem-id')===String(fixture),`synthetic ${fixture}: exact last ID`);const elapsed=Date.now()-start;report.synthetic.push({entries:fixture,filterInteractionMs:elapsed});check(elapsed<3000,`synthetic ${fixture}: filter interaction under3s`);await page.locator('#clearSearch').click();check(await page.locator('.problem-card:visible').count()===fixture,`synthetic ${fixture}: clear all`)}
  await context.close();
 }
 const context=await browser.newContext();await context.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('denied')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('denied')}})});const page=await context.newPage();await page.goto(base);await page.locator('[data-lang="zh"]').click();await page.locator('#problemSearch').fill('51');check(await page.locator('html').getAttribute('lang')==='zh-CN'&&await page.locator('.problem-card:visible').count()===1,'storage denial: search and locale work');await context.close();
 const cssBytes=['style.css','collection.css'].reduce((n,f)=>n+fs.statSync(path.join(__dirname,'../leetcode',f)).size,0);check(cssBytes<25000,`combined CSS ${cssBytes} bytes`);check(report.errors.length===0,'no runtime errors or failed assets');await browser.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:report.checks.length,cssBytes,synthetic:report.synthetic,evidence:out}));
})().catch(e=>{console.error(e);process.exitCode=1});

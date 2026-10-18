const fs=require('fs'),path=require('path'),assert=require('assert'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence'),base=process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/52/';fs.mkdirSync(out,{recursive:true});
const checks=[],contrast=[];const check=(value,name)=>{assert(value,name);checks.push(name)};
function ratio(a,b){function lum(s){const c=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722}const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
(async()=>{const browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
for(const lang of ['en','zh']){
 const context=await browser.newContext({viewport:{width:390,height:900},locale:lang});const p=await context.newPage();await p.goto(base);await p.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 // Verify the exact leaf-count timing in the DOM.
 for(const [event,count] of [[30,0],[31,1],[32,1],[47,1],[48,2],[49,2],[79,2]]){await p.locator('#position').fill(String(event));await p.locator('#position').dispatchEvent('input');check(await p.locator('#results li').count()===count,`${lang}: event ${event} ledger ${count}`);check((await p.locator('#progress').textContent()).includes(String(count)),`${lang}: count readout populated ${event}`);}
 await p.locator('#position').focus();await p.keyboard.press('Home');check(await p.locator('#position').inputValue()==='0',`${lang}: keyboard range Home`);await p.keyboard.press('End');check(await p.locator('#position').inputValue()==='79',`${lang}: keyboard range End`);
 await p.locator('#position').fill('32');await p.locator('#position').dispatchEvent('input');
 // Visible data symbols, not just colors, distinguish states.
 check(await p.locator('#diagram .candidate').textContent()==='?',`${lang}: undo has symbol`);
 async function measure(sel){const v=await p.locator(sel).first().evaluate(e=>{let parent=e,bg=getComputedStyle(e).backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&parent.parentElement){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor}return{fg:getComputedStyle(e).color,bg}});const r=ratio(v.fg,v.bg);contrast.push({lang,sel,...v,ratio:r});check(r>=4.5,`${lang}: ${sel} text contrast`);}
 await measure('#diagram .queen');await measure('#diagram .candidate');
 await p.locator('#diagram').screenshot({path:path.join(out,`${lang}-undo-390.png`)});
 await p.locator('#position').fill('13');await p.locator('#position').dispatchEvent('input');await measure('#diagram .rejected');await p.locator('#diagram').screenshot({path:path.join(out,`${lang}-reject-390.png`)});
 for(const answer of ['0','2']){await p.locator(`[name=prediction][value="${answer}"]`).check();await p.locator('#reveal').click();await measure('#feedback');}
 await p.locator('#feedback').screenshot({path:path.join(out,`${lang}-prediction-390.png`)});
 await p.setViewportSize({width:320,height:900});await p.locator('#diagram').screenshot({path:path.join(out,`${lang}-board-320.png`)});check(await p.locator('#diagram').evaluate(e=>e.scrollWidth<=e.clientWidth),`${lang}: 320 board contained`);
 await p.setViewportSize({width:736,height:414});check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}: landscape no overflow`);
 await p.setViewportSize({width:1440,height:1000});await p.locator('#position').fill('48');await p.locator('#position').dispatchEvent('input');await p.locator('#results').screenshot({path:path.join(out,`${lang}-ledger-desktop.png`)});
 await p.setViewportSize({width:640,height:1000});await p.evaluate(()=>document.body.style.zoom='2');await p.locator('#diagram').screenshot({path:path.join(out,`${lang}-board-zoom.png`)});check(await p.locator('#diagram').evaluate(e=>e.scrollWidth<=e.clientWidth),`${lang}: zoom board contained`);
 await p.evaluate(()=>document.body.style.zoom='');await p.locator('#next').focus();await p.keyboard.press('Tab');check(await p.evaluate(()=>document.activeElement.id==='reset'),`${lang}: keyboard Tab sequence`);await p.keyboard.press('Shift+Tab');check(await p.evaluate(()=>document.activeElement.id==='next'),`${lang}: keyboard Shift Tab sequence`);
 await p.locator('#langToggle button[data-lang="'+(lang==='en'?'zh':'en')+'"]').focus();await p.keyboard.press('Enter');check(await p.evaluate(()=>document.activeElement.matches('#langToggle button')),`${lang}: locale keeps keyboard focus`);
 const focus=await p.locator('#langToggle button:focus').evaluate(e=>({fg:getComputedStyle(e).outlineColor,bg:getComputedStyle(e.parentElement.parentElement).backgroundColor,root:getComputedStyle(document.body).backgroundColor,width:getComputedStyle(e).outlineWidth}));const focusRatio=ratio(focus.fg,focus.bg==='rgba(0, 0, 0, 0)'?focus.root:focus.bg);check(focusRatio>=3&&focus.width==='3px',`${lang}: rendered focus contrast`);contrast.push({lang,sel:'focus',ratio:focusRatio});
 const downloadEvent=p.waitForEvent('download');await p.locator('a[download]').click();const download=await downloadEvent;const downloadPath=await download.path();check(fs.readFileSync(downloadPath,'utf8')===fs.readFileSync(path.join(root,'solution.py'),'utf8'),`${lang}: actual browser download parity`);
 await context.grantPermissions(['clipboard-read','clipboard-write']);await p.locator('#copy').click();check(await p.evaluate(()=>navigator.clipboard.readText())===fs.readFileSync(path.join(root,'solution.py'),'utf8'),`${lang}: actual system clipboard parity`);
 await context.close();
}
// Source display works when opened from disk with network unavailable.
const offline=await browser.newContext({offline:true});const p=await offline.newPage();await p.goto('file://'+path.join(root,'index.html'));await p.waitForSelector('.queen-board');check(await p.locator('#pythonCode').textContent()===fs.readFileSync(path.join(root,'solution.py'),'utf8'),'Offline file source parity');await p.locator('#next').click();check(await p.locator('#position').inputValue()==='1','Offline trace works');await offline.close();
await browser.close();fs.writeFileSync(path.join(out,'browser-extra-results.json'),JSON.stringify({checks,contrast},null,2)+'\n');console.log({checks:checks.length});})().catch(e=>{console.error(e);process.exitCode=1});

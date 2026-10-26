const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert'),{chromium}=require('playwright');
const out=__dirname, root=path.resolve(out,'../../..'), url='http://127.0.0.1:19892/leetcode/1092/';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
const browser=await chromium.launch({headless:true}); const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}); const page=await context.newPage();
const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
await page.goto(url);const assets=[];for(const asset of ['index.html','style.css','app.js','copy.js','core.js','python-code.js','solution.py','../style.css','../common.js']){const response=await context.request.get(new URL(asset,url).href), bytes=await response.body(), local=fs.readFileSync(path.resolve(root,'leetcode/1092',asset));assert(bytes.equals(local));assets.push({asset,bytes:bytes.length,sha256:sha(bytes)});}
const source=fs.readFileSync(root+'/leetcode/1092/solution.py','utf8');assert.equal(await page.locator('#code').textContent(),source);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
const downloadEvent=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadEvent;await download.saveAs(out+'/download.py');assert.equal(fs.readFileSync(out+'/download.py','utf8'),source);
// Duplicate keys: parse the actual dictionary rather than accepting overwritten JS properties.
const acorn=require('/tmp/leetcode-1092-header-test-deps/node_modules/acorn');const ast=acorn.parse(fs.readFileSync(root+'/leetcode/1092/copy.js','utf8'),{ecmaVersion:'latest'});const props=ast.body.find(x=>x.type==='ExpressionStatement'&&x.expression.type==='AssignmentExpression').expression.right.properties;const keys=props.map(x=>x.key.name||x.key.value);assert.equal(keys.length,new Set(keys).size);
const matrix=[];
for(const lang of ['en','zh'])for(const [width,height,zoom] of [[320,1000,1],[390,844,1],[736,390,1],[1440,1000,1],[320,1000,2],[390,844,2],[1440,1000,2]]){
 await page.setViewportSize({width,height});await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(z=>document.documentElement.style.zoom=z,zoom);await page.locator('#preset').selectOption('2');
 // Dense middle fill then full reconstruction. Every state transition remains the real button path.
 for(let i=0;i<32;i++)await page.locator('#next').click();
 const middle=await page.locator('#event').innerText();await page.locator('#end').click();
 const result=await page.locator('#output').innerText();assert(result.includes('aaaaaaaa'));
 const sides=[];
 for(const side of ['left','middle','right']){
 await page.evaluate(s=>{const w=document.getElementById('tableWrap');w.scrollLeft=s==='left'?0:s==='middle'?(w.scrollWidth-w.clientWidth)/2:w.scrollWidth;const target=w.getBoundingClientRect().top+window.scrollY-document.querySelector('.step-nav').getBoundingClientRect().height-24;window.scrollTo(0,target);},side);
 await page.waitForTimeout(60);
 const g=await page.evaluate(()=>{const wrap=document.getElementById('tableWrap'),corner=document.querySelector('.dp th'),last=document.querySelector('.dp thead th:last-child');const r=e=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height}};const text=e=>{const range=document.createRange();range.selectNodeContents(e);return [...range.getClientRects()].map(x=>({x:x.x,y:x.y,right:x.right,bottom:x.bottom,width:x.width,height:x.height}));};return {scroll:wrap.scrollLeft,max:wrap.scrollWidth-wrap.clientWidth,wrap:r(wrap),corner:{box:r(corner),text:text(corner)},last:{label:last.textContent,box:r(last),text:text(last)},rows:[...document.querySelectorAll('.dp tbody th')].map(e=>({label:e.textContent,box:r(e),text:text(e)})),overflow:document.documentElement.scrollWidth>window.innerWidth,navBottom:document.querySelector('.step-nav').getBoundingClientRect().bottom};});
 assert(!g.overflow,`page overflow ${lang} ${width} ${zoom}`);
 for(const h of [g.corner,...g.rows])for(const r of h.text){assert(r.x>=h.box.x-.5&&r.right<=h.box.right+.5,'header text escapes own cell');}
 if(side==='right')for(const r of g.last.text){assert(r.x>=g.corner.box.right-.5,`last text hidden behind sticky corner ${lang} ${width} ${zoom}`);assert(r.right<=g.wrap.right+.5,'last text clipped at right');}
 sides.push({side,...g});
 if(side==='right')await page.screenshot({path:`${out}/${lang}-${width}-zoom${zoom}-right.png`});
 }
 // Keyboard reach/focus and horizontal movement from table.
 await page.locator('#tableWrap').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowLeft');await page.waitForTimeout(60);const focus=await page.evaluate(()=>({id:document.activeElement.id,outline:getComputedStyle(document.activeElement).outlineWidth,scroll:document.activeElement.scrollLeft}));assert.equal(focus.id,'tableWrap');assert.equal(focus.outline,'3px');
 await page.locator('#prev').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').innerText()).includes('72/73'));await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').innerText()).includes('73/73'));
 matrix.push({lang,width,height,zoom,middle,result,sides,focus});
}
await page.evaluate(()=>document.documentElement.style.zoom=1);await page.setViewportSize({width:390,height:844});const semantics=[];
const core=require(root+'/leetcode/1092/core.js');
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();
 for(let p=0;p<core.presets.length;p++){
 await page.locator('#preset').selectOption(String(p));let model=core.trace(...core.presets[p]);
 for(let i=0;i<model.frames.length;i++){
 const f=model.frames[i];if(i)await page.locator('#next').click();const actual=await page.locator('#event').innerText();if(!semantics.some(s=>s.lang===lang&&s.branch===(f.reason||f.kind)))semantics.push({lang,preset:core.presets[p],event:i,branch:f.reason||f.kind,text:actual});
 assert.equal(await page.locator('#table tbody tr').count(),model.a.length+1);
 }
 assert((await page.locator('#output').innerText()).includes(model.result));assert(await page.locator('#next').isDisabled());await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());
 }
 for(const choice of ['0','1','2']){await page.locator(`[name=prediction][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();semantics.push({lang,branch:'quiz-'+choice,text:await page.locator('#feedback').innerText()});}
 // Fail copy deliberately in isolated test context; retain precise fallback source and selection.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('review simulated unavailable')}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#fallbackSource').inputValue(),source);const fallback=await page.evaluate(()=>({lang:document.documentElement.lang,text:document.getElementById('copyStatus').textContent,start:document.getElementById('fallbackSource').selectionStart,end:document.getElementById('fallbackSource').selectionEnd}));assert.equal(fallback.end,source.length);semantics.push({lang,branch:'clipboard-fallback',...fallback});
}
// State preservation across locale change, including open detail/prediction and nonfinal trace.
await page.locator('#preset').selectOption('3');for(let i=0;i<11;i++)await page.locator('#next').click();await page.locator('#sourceDetails summary').click();const before=await page.locator('#progress').innerText();await page.locator('[data-lang=en]').click();const after=await page.locator('#progress').innerText();assert(before.includes('11/14')&&after.includes('11/14'));assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
await page.emulateMedia({forcedColors:'active'});await page.locator('#tableWrap').focus();await page.locator('#tableWrap').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/forced-colors.png'});
const report={candidate:require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),browser:browser.version(),assets,sourceParity:{display:true,clipboard:true,download:true,fallback:true},duplicateKeys:{namespace:'LESSON_COPY',count:keys.length,duplicates:0},matrix,semantics,errors,externalRequests:requests.filter(x=>!x.startsWith('http://127.0.0.1:19892/')&&!x.startsWith('data:')),localePreserved:{before,after}};
fs.writeFileSync(out+'/browser-audit.json',JSON.stringify(report,null,2));assert.equal(errors.length,0);assert.equal(report.externalRequests.length,0);console.log(JSON.stringify({browser:report.browser,configs:matrix.length,semanticBranches:semantics.length,assets:assets.length,errors,externalRequests:report.externalRequests}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

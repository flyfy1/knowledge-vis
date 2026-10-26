'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),os=require('node:os');
const root=path.resolve(__dirname,'..'),out=process.env.EVIDENCE_DIR||path.join(__dirname,'bridge-evidence'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18770';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const expected=[{tokens:['a₀','a₁','b','c'],to:[3,0,1,2],cost:'3',spent:'0',cycles:'(0 3 2 1)'},{tokens:['a₀','a₁','b','c'],to:[0,3,1,2],cost:'2',spent:'0',cycles:'(0)(1 3 2)'},{tokens:['a₀','b','a₁','c'],to:[0,1,3,2],cost:'1',spent:'1',cycles:'(0)(1)(2 3)'},{tokens:['a₀','b','c','a₁'],to:[0,1,2,3],cost:'0',spent:'2',cycles:'(0)(1)(2)(3)'}];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true}),page=await context.newPage();
 const errors=[],badAssets=[],external=[],states=[],layouts=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badAssets.push([r.status(),r.url()]);});page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(base))external.push(r.url());});
 await page.goto(base+'/leetcode/854/');await page.waitForFunction(()=>document.querySelector('#bridgeFrame').textContent.length);
 const text=id=>page.locator('#'+id).textContent();
 async function captureBridge(name){
  await page.evaluate(()=>{const e=document.querySelector('#proofBridge'),nav=document.querySelector('.step-nav');window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-nav.getBoundingClientRect().height-16,behavior:'instant'});});
  const placement=await page.evaluate(()=>({heading:document.querySelector('#bridgeTitle').getBoundingClientRect().top,navBottom:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(placement.heading>placement.navBottom,JSON.stringify(placement));
  const box=await page.locator('#proofBridge').boundingBox(),scroll=await page.evaluate(()=>({x:scrollX,y:scrollY}));
  await page.screenshot({fullPage:true,path:path.join(out,name),clip:{x:box.x+scroll.x,y:box.y+scroll.y,width:box.width,height:box.height}});
  return placement;
 }

 async function lang(l){await page.locator(`[data-lang=${l}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 async function unrelated(){return page.evaluate(()=>({hand, preset,at,selected,revealed,copyState,manual:[...document.querySelectorAll('#manualHistory li')].map(e=>e.textContent),source:document.querySelector('#pythonCode').textContent,sourceOpen:document.querySelector('#sourceDetails').open}));}
 async function snap(row,l){
  const e=expected[row];assert.deepEqual(await page.locator('#bridgeTokens b').allTextContents(),e.tokens);assert.equal(await text('bridgeCost'),e.cost);assert.equal(await text('bridgeSpent'),e.spent);assert((await text('bridgeCycles')).includes(e.cycles));assert((await text('bridgeFrame')).includes(`${row+1}/4`));
  const actions=l==='en'?['Start with an arbitrary assignment','Reassign only the two a destinations','Swap positions 1 and 2','Swap positions 2 and 3']:['从一份任意分配开始','只改两个 a 的目的地','交换位置 1、2','交换位置 2、3'];
  assert.equal(await text('bridgeFrame'),`${l==='en'?'Snapshot':'状态'} ${row+1}/4 · ${actions[row]}`);
  assert.equal(await page.locator('[data-i18n=bridgeTarget]').textContent(),l==='en'?'Fixed target: abca':'固定目标：abca');
  assert.equal(await text('bridgeCurrent'),(l==='en'?'Current string: ':'当前字符串：')+e.tokens.map(x=>x[0]).join(''));
  assert.deepEqual(await page.locator('.bridge-counters dt').allTextContents(),l==='en'?['Swaps needed for this assignment','Actual swaps so far']:['按当前分配还需交换','已做实际交换']);
  assert.deepEqual(await page.locator('#bridgeTokens li>span:nth-child(3)').allTextContents(),e.to.map((j,i)=>`${l==='en'?'Destination':'目的地'} ${i} → ${j}`));
  assert.equal(await page.locator('#bridgePrev').isDisabled(),row===0);assert.equal(await page.locator('#bridgeNext').isDisabled(),row===3);
  assert.equal(await page.locator('.bridge-marker').count(),row===0?0:2);
  if(row===1)assert((await text('bridgeExplain')).includes(l==='en'?'No letters move':'没有字母移动'));
  states.push({row,locale:l,tokens:e.tokens,to:e.to,cost:e.cost,spent:e.spent,explanation:await text('bridgeExplain')});
 }
 // Seed all preexisting state branches before operating the independent bridge.
 await lang('en');await page.locator('#swapA').click();await page.locator('#preset').selectOption('5');await page.locator('#traceNext').click();await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const preserved=await unrelated();
 for(const l of ['en','zh']){
  await lang(l);await page.locator('#bridgeReset').click();
  for(let row=0;row<4;row++){
   if(row)await page.locator('#bridgeNext').click();await snap(row,l);assert.deepEqual(await unrelated(),preserved);
   await lang(l==='en'?'zh':'en');await snap(row,l==='en'?'zh':'en');await lang(l);await snap(row,l);assert.deepEqual(await unrelated(),preserved);
   if(row){await page.locator('#bridgePrev').click();await snap(row-1,l);await page.locator('#bridgeNext').click();await snap(row,l);}
  }
  await page.locator('#bridgeReset').click();await snap(0,l);assert.deepEqual(await unrelated(),preserved);
 }
 // Old controls must still work without moving the proof row.
 await page.locator('#bridgeNext').click();await page.locator('#traceNext').click();await page.locator('#swapB').click();await page.locator('[name=prediction][value="0"]').check();assert.equal(await page.evaluate(()=>bridgeRow),1);assert.equal(await page.evaluate(()=>revealed),false);await page.locator('#reveal').click();assert.deepEqual(await page.locator('#manualHistory li').allTextContents(),['abc','bac','bca']);
 // Both new keyboard transitions and stable focus survive replacement of only snapshot content.
 await page.locator('#bridgeReset').click();await page.locator('#bridgeNext').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>bridgeRow),1);assert.equal(await page.evaluate(()=>document.activeElement.id),'bridgeNext');await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'bridgePrev');await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>bridgeRow),0);
 for(const l of ['en','zh'])for(const [width,zoom] of [[320,1],[390,1],[1440,1],[1440,2]]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.documentElement.style.zoom=z===2?'2':'',zoom);await lang(l);await page.locator('#bridgeReset').click();
  for(let row=0;row<4;row++){
   if(row)await page.locator('#bridgeNext').click();await snap(row,l);await page.locator('#proofBridge').scrollIntoViewIfNeeded();
   const geometry=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,parts:[...document.querySelectorAll('#proofBridge,#proofBridge p,#proofBridge li,#proofBridge dt,#proofBridge dd,#proofBridge button')].map(e=>({id:e.id,tag:e.tagName,client:e.clientWidth,scroll:e.scrollWidth})),controls:[...document.querySelectorAll('#proofBridge button')].map(e=>({id:e.id,w:e.getBoundingClientRect().width/parseFloat(getComputedStyle(document.documentElement).zoom||1),h:e.getBoundingClientRect().height/parseFloat(getComputedStyle(document.documentElement).zoom||1)}))}));
   assert(geometry.doc<=geometry.viewport+1,JSON.stringify(geometry));for(const x of geometry.parts)assert(x.scroll<=x.client+1,JSON.stringify(x));for(const x of geometry.controls)assert(x.w>=48&&x.h>=48,JSON.stringify(x));layouts.push({locale:l,width,zoom,row,...geometry});
   if(row===1&&(width===320||width===1440))await captureBridge(`${l}-${width}-zoom${zoom}-reassignment.png`);
  }
 }
 await page.evaluate(()=>document.documentElement.style.zoom='');await page.setViewportSize({width:320,height:1000});await page.locator('#bridgeExplain').evaluate(e=>e.textContent='W'.repeat(120)+'中'.repeat(120));assert(await page.locator('#bridgeExplain').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await page.locator('#bridgeReset').click();
 await page.locator('#bridgeReset').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'bridgeNext');
 const focus=await page.locator('#bridgeNext').evaluate(e=>{const s=getComputedStyle(e);return {width:s.outlineWidth,style:s.outlineStyle,color:s.outlineColor};});assert.equal(focus.width,'3px');assert.notEqual(focus.style,'none');
 function lum(rgb){return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}function contrast(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}assert.equal(contrast([0,0,0],[255,255,255]),21);
 await page.locator('#bridgeNext').click();
 const pairs=await page.evaluate(()=>['#bridgeExplain','#bridgeTokens b','.bridge-marker','#bridgeCost','#bridgePrev'].map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let p=e;while(getComputedStyle(p).backgroundColor==='rgba(0, 0, 0, 0)')p=p.parentElement;return {selector:sel,color:s.color,bg:getComputedStyle(p).backgroundColor};}));
 const contrasts=pairs.map(x=>({...x,ratio:contrast(x.color.match(/[\d.]+/g).slice(0,3).map(Number),x.bg.match(/[\d.]+/g).slice(0,3).map(Number))}));for(const x of contrasts)assert(x.ratio>=4.5,JSON.stringify(x));
 await page.locator('#bridgeNext').click();await page.locator('#bridgeNext').click();const disabled=await page.locator('#bridgeNext').evaluate(e=>({disabled:e.disabled,color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));assert(disabled.disabled);disabled.ratio=contrast(disabled.color.match(/[\d.]+/g).slice(0,3).map(Number),disabled.bg.match(/[\d.]+/g).slice(0,3).map(Number));assert(disabled.ratio>=4.5);const focusRatio=contrast(focus.color.match(/[\d.]+/g).slice(0,3).map(Number),[22,27,34]);assert(focusRatio>=3);
 await page.locator('#bridgeReset').click();
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#bridgeNext').focus();assert.equal(await page.locator('#bridgeNext').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');await snap(1,'zh');await captureBridge('forced-colors.png');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 assert.equal(await text('pythonCode'),source);assert.equal(await page.locator('#manualSource').inputValue(),source);const downloaded=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloaded;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 // Real clipboard fallback: verify a nonsource sentinel, trigger rejection, then use native copy.
 const sentinel='854-bridge-fallback-'+Date.now();await page.evaluate(s=>{window.originalClipboard={readText:navigator.clipboard.readText.bind(navigator.clipboard),writeText:navigator.clipboard.writeText.bind(navigator.clipboard)};return window.originalClipboard.writeText(s);},sentinel);assert.equal(await page.evaluate(()=>window.originalClipboard.readText()),sentinel);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('deliberate test rejection');}}}));await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>window.originalClipboard.readText()),sentinel);assert(await page.locator('#sourceFallback').isVisible());await page.keyboard.press(os.platform()==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.originalClipboard.readText()),source);await page.locator('#bridgeNext').click();assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.evaluate(()=>copyState),'fallback');
 assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(external,[]);
 const hashes=Object.fromEntries(['solution.py','python-code.js','core.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
 const report={status:'passed',scope:'author focused bridge UI and existing-state regression; not independent acceptance',browser:await browser.version(),states,layouts,focus,focusRatio,disabled,contrasts,sourceHashes:hashes,sourceParity:'rendered/mirror/download/automatic clipboard/native fallback exact',cssBytes:fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size,forcedColors:true,reducedMotion:true,errors,badAssets,external,zoomMethod:'CSS zoom=2, not browser-chrome zoom',limits:['physical devices','screen reader','public delivery','human comprehension']};assert(report.cssBytes<25000);fs.writeFileSync(path.join(out,'bridge-browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'passed',states:states.length,layouts:layouts.length,contrasts,cssBytes:report.cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence'),base='http://127.0.0.1:18770';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),sandbox={window:{}};vm.runInNewContext(copy,sandbox);
for(const pair of Object.values(sandbox.window.LESSON_COPY))assert(pair.length===2&&pair.every(s=>typeof s==='string'&&s.length));
const obj=acorn.parse(copy,{ecmaVersion:'latest'}).body[0].expression.right,keys=obj.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length);
const core=require('../core.js'),report={states:[],layouts:[],source:[],errors:[],bad:[],external:[]};
function contrast(a,b){const lum=h=>h.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((x,v,i)=>x+v*[.2126,.7152,.0722][i],0);const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true}),page=await ctx.newPage();
 page.on('pageerror',e=>report.errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)report.bad.push(r.url());});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))report.external.push(r.url());});
 await page.goto(base+'/leetcode/761/');await page.locator('#progress').filter({hasText:'0/'}).waitFor();
 const expected=['110010','11100100','10','111000','101010'];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);const dict=Object.fromEntries(Object.entries(sandbox.window.LESSON_COPY).map(([k,v])=>[k,v[lang==='zh'?0:1]]));
  // Semantic binding of every static localized element, not merely key existence.
  for(const item of await page.locator('[data-i18n]').evaluateAll(els=>els.map(e=>[e.dataset.i18n,e.textContent])))assert.equal(item[1],dict[item[0]]);
  assert.equal(await page.locator('[data-i18n=move]').textContent(),'10 | 1100 → 1100 | 10 = 110010');
  for(let p=0;p<5;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   const frames=core.trace(core.presets[p]);
   for(let k=0;k<frames.length;k++){
    const f=frames[k];assert.equal(await page.locator('#call').textContent(),f.s||dict.empty);
    assert.equal(await page.locator('.balance-cell').count(),f.prefix.length);
    const vals=await page.locator('.balance-cell span').allTextContents();assert.deepEqual(vals,f.prefix.map(String));
    if(k<frames.length-1){const old=await page.locator('#state').textContent();await page.click('#next');const next=await page.locator('#state').textContent();await page.click('#prev');assert.equal(await page.locator('#state').textContent(),old);await page.click('#next');assert.equal(await page.locator('#state').textContent(),next);}
   }
   assert((await page.locator('#event').textContent()).includes(expected[p]));assert(await page.locator('#next').isDisabled());assert.equal(await page.locator('#history li').count(),frames.length);
   report.states.push({lang,preset:core.presets[p],frames:frames.length,result:await page.locator('#event').textContent()});
   await page.click('#reset');assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('.balance-cell').count(),0);await page.click('#end');assert(await page.locator('#end').isDisabled());
  }
  for(let a=0;a<3;a++){
   await page.check(`[name=prediction][value="${a}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const text=await page.locator('#feedback').textContent();assert(text.startsWith(a===2?dict.correct:dict.incorrect));assert(text.includes('11100010'));
   const progress=await page.locator('#progress').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`[name=prediction][value="${a}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#progress').textContent(),progress);
   await page.selectOption('#preset','0');assert(await page.locator('#feedback').isVisible());
   report.states.push({lang,prediction:a,feedback:text});
  }
  assert.equal(await page.locator('#pythonCode').textContent(),source);await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert.equal(await page.locator('#copyStatus').textContent(),dict.copied);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('sentinel-761-non-source');window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('forced');};});
  await page.click('#copy');assert.equal(await page.locator('#copyStatus').textContent(),dict.fallback);assert(await page.locator('#copyText').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);const [d]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);assert.equal(fs.readFileSync(await d.path(),'utf8'),source);report.source.push({lang,parity:'display/copy/native fallback/download exact',host:process.platform});
 }
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:960});await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','1');
  // Child return and parent append visible with a nonempty completed block.
  const fsx=core.trace('11011000'),target=fsx.findIndex(f=>f.kind==='append'&&f.depth===1&&f.built==='1100');for(let k=0;k<target;k++)await page.click('#next');
  await page.locator('#event').scrollIntoViewIfNeeded();assert((await page.locator('#event').textContent()).includes('1100'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert((await page.locator('.balance-cell').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width))).every(w=>w>=48));
  await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});report.layouts.push({lang,width,event:await page.locator('#event').textContent()});await page.locator('#ledger').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`ledger-${lang}-${width}.png`)});
 }
 for(const lang of ['en','zh'])for(const width of [390,1440]){
  await page.setViewportSize({width,height:1100});await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>document.body.style.zoom='2');const measure=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {width:e.clientWidth,text:c.measureText(e.selectedOptions[0].text).width,pad:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)};});assert(measure.text+measure.pad+24<=measure.width,JSON.stringify(measure));await page.locator('#event').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`zoom-${lang}-${width}.png`)});await page.locator('#ledger').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`zoom-ledger-${lang}-${width}.png`)});await page.evaluate(()=>document.body.style.zoom='');
 }
 await page.setViewportSize({width:1440,height:1000});await page.click('[data-lang=en]');await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/'));
 report.focus=await page.locator('#next').evaluate(e=>({active:document.activeElement===e,width:getComputedStyle(e).outlineWidth,style:getComputedStyle(e).outlineStyle}));assert(report.focus.active&&report.focus.width==='3px'&&report.focus.style==='solid');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());
 await page.click('a[href="#step3"]');await page.waitForTimeout(400);assert(await page.locator('#step3').evaluate(e=>e.getBoundingClientRect().top>=65));
 for(const href of await page.locator('.related a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){const [p,id]=href.split('#');assert(fs.readFileSync(path.resolve(root,p,'index.html'),'utf8').includes(`id="${id}"`));}
 for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`full-${lang}.png`),fullPage:true});}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 assert((await page.locator('button,select').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height))).every(h=>h>=48));
 const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});report.contrast={};for(const fg of ['text','muted','accent','accent2'])for(const bg of ['bg','panel','panel2']){const r=contrast(colors[fg],colors[bg]);assert(r>=4.5);report.contrast[fg+'/'+bg]=r;}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));const bp=await blocked.newPage();await bp.goto(base+'/leetcode/761/');await bp.click('[data-lang=zh]');await bp.click('#next');assert((await bp.locator('#progress').textContent()).includes('1/'));await blocked.close();
 const off=await browser.newPage();await off.goto('file://'+path.join(root,'index.html'));assert.equal(await off.locator('#pythonCode').textContent(),source);await off.click('#end');assert((await off.locator('#event').textContent()).includes('110010'));await off.close();
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.bad,[]);assert.deepEqual(report.external,[]);report.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(report.cssBytes<25000);report.browser=await browser.version();report.zoom='CSS layout zoom 200%';report.result='pass';fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({result:'pass',states:report.states.length,layouts:report.layouts.length,cssBytes:report.cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

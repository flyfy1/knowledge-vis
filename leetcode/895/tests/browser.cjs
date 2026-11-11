const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),URL='http://127.0.0.1:18770/leetcode/895/';fs.mkdirSync(OUT,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage(),errors=[],relatedErrors=[],logs=[],fit=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')(page.url().startsWith(URL)?errors:relatedErrors).push({text:m.text(),location:m.location(),page:page.url()});});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770/')&&!r.url().startsWith('data:'))errors.push('nonlocal asset '+r.url());});page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+':'+r.status());});
await page.goto(URL);await page.locator('#progress').waitFor();const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
function expected(ops){let a=[],out=[];const states=[];for(const op of ops){if(op[0]==='push')a.push(op[1]);else{const c={};for(const v of a)c[v]=(c[v]||0)+1;const m=Math.max(...Object.values(c));let i=a.length-1;while(c[a[i]]!==m)i--;out.push(a.splice(i,1)[0]);}const seen={},g={};for(const v of a){seen[v]=(seen[v]||0)+1;(g[seen[v]]??=[]).push(v);}states.push({a:a.slice(),out:out.slice(),g,m:Math.max(0,...Object.values(seen))});}return states;}
async function checkState(e){const data=await page.locator('#after').evaluate(el=>({p:[...el.querySelectorAll('p')].map(e=>e.textContent),g:[...el.querySelectorAll('.level')].map(e=>e.textContent)}));assert(data.p[0].endsWith('['+e.a.join(', ')+']'));assert(data.p[2].endsWith(String(e.m)));assert.deepStrictEqual(data.g,Object.entries(e.g).map(([f,a])=>'group['+f+']: '+ '['+a.join(', ')+']').map(x=>x.replace(': ',data.g[0]?.includes('：')?'：':': ')));assert((await page.locator('#outputs').textContent()).endsWith('['+e.out.join(', ')+']'));}

for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),lang==='zh'?'#895 · 最大频率栈':'#895 · Maximum Frequency Stack');
 for(let p=0;p<3;p++){
  await page.selectOption('#preset',String(p));const n=Number(await page.locator('#position').getAttribute('max'));
  const ops=await page.evaluate(p=>FreqCore.presets[p],p),truth=expected(ops);assert(await page.locator('#prev').isDisabled());for(let i=0;i<n;i++){await page.locator('#next').click();await checkState(truth[i]);}assert(await page.locator('#next').isDisabled());
  const end=await page.locator('#after').textContent();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#after').textContent(),end);
  await page.locator('#reset').click();assert.equal(await page.locator('#position').inputValue(),'0');await page.locator('#end').click();assert.equal(await page.locator('#after').textContent(),end);
  logs.push({lang,p,end});
 }
 for(let i=0;i<3;i++){
  await page.locator(`[name=prediction][value="${i}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert((await page.locator('#feedback').textContent()).includes(lang==='zh'?'group[2]=[6]':'group[2]=[6]'));
 }
 await page.locator(`[data-lang=${lang==='zh'?'en':'zh'}]`).click();assert(await page.locator('#feedback').isVisible());assert(await page.locator('[value="2"][name=prediction]').isChecked());await page.locator(`[data-lang=${lang}]`).click();
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
 const dl=page.waitForEvent('download');await page.locator('[download]').click();const d=await dl;assert.equal(fs.readFileSync(await d.path(),'utf8'),source);
 await page.evaluate(async sentinel=>{await navigator.clipboard.writeText(sentinel);if(await navigator.clipboard.readText()!==sentinel)throw Error('sentinel');},'auto-'+lang);
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 // Each fallback attempt gets its own verified sentinel, before disabling automatic writes.
 await page.evaluate(async sentinel=>{await navigator.clipboard.writeText(sentinel);if(await navigator.clipboard.readText()!==sentinel)throw Error('sentinel');window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('forced fallback');};},'fallback-'+lang+'-'+Date.now());
 await page.locator('#copy').click();assert(await page.locator('#copyText').evaluate(e=>document.activeElement===e));assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
 await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
 logs.push({lang,source:'display/download/automatic/native-fallback exact parity',host:process.platform});
 for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:900});await page.evaluate(z=>document.documentElement.style.zoom=z,zoom);await page.selectOption('#preset','1');await page.locator('#position').evaluate(e=>e.value='7');await page.locator('#position').dispatchEvent('input');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const budget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {label:e.selectedOptions[0].textContent,text:c.measureText(e.selectedOptions[0].textContent).width,width:e.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),arrowReserve:16,font:s.font};});assert(budget.text+budget.padding+budget.arrowReserve<=budget.width);fit.push({lang,width,zoom,...budget});

  await page.locator('#presetSummary').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-zoom${zoom}-preset.png`)});await page.locator('#operation').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-zoom${zoom}.png`)});
  if([320,390,1440].includes(width)){await page.locator('#after').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-zoom${zoom}-after.png`)});}

 }
 await page.evaluate(()=>document.documentElement.style.zoom=1);await page.setViewportSize({width:390,height:900});
 await page.locator('#prev').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'6');assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 await page.locator('#reveal').focus();await page.screenshot({path:path.join(OUT,`${lang}-quiz-focus.png`)});
 for(const href of ['../32/#step1','../84/#step1']){
  const a=page.locator(`.related a[href="${href}"]`);const label=await a.textContent();await a.focus();await page.keyboard.press('Enter');await page.waitForURL('**'+href.slice(2));await page.locator('#step1').waitFor();logs.push({lang,link:page.url(),label,destination:await page.locator('#step1').textContent()});await page.goto(URL);await page.locator(`[data-lang=${lang}]`).click();
 }
}
// Storage denial and offline source display (all assets were loaded locally).
await context.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});await page.goto(URL);await page.locator('[data-lang=zh]').click();await context.setOffline(true);await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#next').click();await context.setOffline(false);
assert.deepStrictEqual(errors,[]);
function luminance(hex){const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(contrast('000000','ffffff'),21);assert.equal(contrast('161b22','161b22'),1);assert(Math.abs(contrast('ff0000','000000')-5.252)<1e-9);
const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2'].map(k=>[k,s.getPropertyValue('--'+k).trim().slice(1)]));});
const pairs=[];for(const fg of ['text','muted','accent','accent2'])for(const bg of ['bg','panel','panel2']){const ratio=contrast(colors[fg],colors[bg]);assert(ratio>=4.5);pairs.push({fg,bg,ratio});}assert(contrast(colors.accent2,colors.bg)>=3);
const cssBytes=fs.statSync(path.join(P,'style.css')).size+fs.statSync(path.join(P,'../style.css')).size;assert(cssBytes<25000);
fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({status:'pass',logs,errors,relatedErrors,fit,contrast:pairs,cssBytes,zoom:'CSS zoom 2 and viewport coverage; physical devices not tested'},null,2));await browser.close();console.log('browser pass');
})().catch(e=>{console.error(e);process.exit(1);});

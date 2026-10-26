const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),p=await b.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'}),records=[];
 await p.goto(process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/891/');
 function lum(c){const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];}
 for(const width of [320,390])for(const locale of ['en','zh']){
  await p.setViewportSize({width,height:1000});await p.locator('[data-lang='+locale+']').click();await p.selectOption('#preset','5');await p.locator('#next').click();await p.locator('#next').click();await p.locator('#next').click();
  await p.locator('#roleTitle').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`roles-${width}-${locale}.png`)});
  await p.locator('#ledger').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`ledger-${width}-${locale}.png`)});
  const term=await p.locator('#ledger li.current').textContent();assert(term.includes('i=2, a[i]=4')||term.includes('i=2，a[i]=4'));assert(term.includes('= 8'));assert(term.includes('Before -11')||term.includes('累计前 -11'));assert(term.endsWith('after -3')||term.endsWith('累计后 -3'));
  await p.locator('[name=prediction][value="0"]').check();await p.locator('#reveal').click();await p.locator('#feedback').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`quiz-${width}-${locale}.png`)});
  records.push({width,locale,term,feedback:await p.locator('#feedback').textContent()});
  // All lesson controls have meaningful native names and 48px hit areas (radio labels own the hit area).
  for(const el of await p.locator('button,select,.btn,.official-link,.prediction-options label').all()){
   const r=await el.evaluate(e=>({height:e.getBoundingClientRect().height,text:(e.textContent||e.getAttribute('aria-label')||'').trim()}));assert(r.height>=48);assert(r.text.length>0);
  }
  await p.locator('#reset').click();assert(await p.locator('#prev').isDisabled());await p.locator('#next').click();await p.locator('#end').click();assert(await p.locator('#next').isDisabled());
  const pair=await p.locator('#next').evaluate(e=>{const s=getComputedStyle(e);return{color:s.color,bg:s.backgroundColor,border:s.borderColor,opacity:s.opacity};});assert.equal(pair.opacity,'1');const a=lum(pair.color),c=lum(pair.bg),ratio=(Math.max(a,c)+.05)/(Math.min(a,c)+.05);assert(ratio>=4.5);records.push({width,locale,disabled:pair,ratio});
 }
 // Check actual active navigation after ordinary scroll and 200% magnification.
 await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');
 for(const locale of ['en','zh']){
  await p.locator('[data-lang='+locale+']').click();await p.locator('#positions').scrollIntoViewIfNeeded();await p.waitForTimeout(100);assert.equal(await p.locator('.step-nav a.active').getAttribute('href'),'#step2');
  await p.locator('#groups').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`zoom-roles-${locale}.png`)});
 }
 fs.writeFileSync(path.join(out,'access-result.json'),JSON.stringify({result:'pass',browser:await b.version(),platform:process.platform,records,zoomNavigation:'step2 active at trace'},null,2));await b.close();console.log('Focused access checks passed');
})().catch(e=>{console.error(e);process.exit(1)});

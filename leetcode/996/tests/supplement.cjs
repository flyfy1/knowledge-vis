const{chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');const{trace,presets}=require('../core.js');
const out=path.resolve(process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})}),p=await b.newPage({viewport:{width:390,height:1000},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:18799/leetcode/996/');const rows=[],meaning=[],links=[];
for(const lang of ['en','zh']){
 await p.click(`[data-lang=${lang}]`);await p.selectOption('#preset','3');const frames=trace(presets[3]).frames,idx=frames.findIndex(f=>f.kind==='accept');for(let i=0;i<idx;i++)await p.click('#next');
 assert.equal(await p.locator('#path .tile').count(),4);assert.equal(await p.locator('#ledger li').count(),1);
 const before=await p.locator('#operation').textContent();await p.click('#prev');await p.click('#next');assert.equal(await p.locator('#operation').textContent(),before);
 meaning.push({lang,event:idx,kind:'accept',input:presets[3],operation:before,counts:await p.locator('#counts').textContent(),ledger:await p.locator('#ledger').textContent()});
 for(const [width,zoom] of [[320,1],[390,1],[1440,1],[320,2],[390,2],[1440,2]]){
  await p.setViewportSize({width,height:1000});await p.evaluate(z=>document.body.style.zoom=z,zoom);
  const budget=await p.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;const text=[...e.options].map(o=>c.measureText(o.text).width);return {width:e.clientWidth,text:Math.max(...text),font:s.font,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),arrowReserve:20};});
  assert(budget.text+budget.padding+budget.arrowReserve<=budget.width,JSON.stringify({lang,width,zoom,budget}));
  await p.locator('#path').evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-170,behavior:'instant'}));
  const name=`${lang}-${width}-zoom${zoom}-dense.png`;await p.screenshot({path:path.join(out,name)});
  rows.push({lang,width,zoom,zoomMethod:'CSS layout zoom',selectedLabelBudget:budget,screenshot:name});
 }
 await p.evaluate(()=>document.body.style.zoom=1);await p.setViewportSize({width:390,height:1000});
 await p.locator('#next').focus();await p.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await p.locator('#path .tile').count(),4);await p.click(`[data-lang=${lang}]`);
 for(const href of ['../51/#step2','../940/#step2']){
  const label=await p.locator(`a[href="${href}"]`).last().textContent();await p.locator(`a[href="${href}"]`).last().focus();await p.keyboard.press('Enter');await p.waitForURL('**'+href.slice(2));const text=await p.locator('#step2').textContent();
  if(href.includes('51'))assert(text.includes(lang==='en'?'undo':'撤销'));else assert(text.includes(lang==='en'?'letter':'字母'));
  links.push({lang,label,url:p.url(),sectionExcerpt:text.slice(0,500)});await p.goBack();
 }
}
await p.emulateMedia({forcedColors:'active'});await p.locator('#next').focus();assert.equal(await p.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await p.emulateMedia({forcedColors:'none'});
fs.writeFileSync(path.join(out,'supplement-results.json'),JSON.stringify({kind:'author self-check',browser:await b.version(),host:process.platform,rows,meaning,links,forcedColorsFocus:true,reducedMotion:true},null,2));await b.close();console.log('PASS dense screenshots, selected-label width budgets, semantic link keyboard navigation, forced colors');})().catch(e=>{console.error(e);process.exit(1)});

const fs=require('fs'),assert=require('assert'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:19892/leetcode/1092/');const samples=[];
for(const lang of ['en','zh'])for(const width of [320,390])for(const zoom of [1,2]){
 await p.setViewportSize({width,height:1000});await p.locator(`[data-lang=${lang}]`).click();await p.evaluate(z=>document.documentElement.style.zoom=z,zoom);
 for(let preset=0;preset<7;preset++){
 await p.locator('#preset').selectOption(String(preset));await p.locator('#end').click();
 const heads=await p.locator('.dp thead th').count();
 for(let col=1;col<heads;col++){
 const g=await p.evaluate(c=>{const w=document.getElementById('tableWrap'),heads=[...document.querySelectorAll('.dp thead th')],h=heads[c],corner=heads[0],scale=Number(getComputedStyle(document.documentElement).zoom);const hb=h.getBoundingClientRect(),cb=corner.getBoundingClientRect();w.scrollLeft=Math.min(w.scrollWidth-w.clientWidth,Math.max(0,w.scrollLeft+(hb.x-cb.right)/scale));const r=h.getBoundingClientRect(),cr=corner.getBoundingClientRect(),wr=w.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(h);return{label:h.textContent,scroll:w.scrollLeft,cornerRight:cr.right,wrapperRight:wr.right,cell:{x:r.x,right:r.right},lines:[...range.getClientRects()].map(r=>({x:r.x,right:r.right,y:r.y,bottom:r.bottom}))};},col);
 assert(g.lines.every(r=>r.x>=g.cornerRight-.6&&r.right<=g.wrapperRight+.6),JSON.stringify({lang,width,zoom,preset,col,g}));samples.push({lang,width,zoom,preset,col,...g});
 }
 }
}
await p.setViewportSize({width:320,height:1000});await p.evaluate(()=>document.documentElement.style.zoom=2);await p.locator('[data-lang=en]').click();await p.locator('#preset').selectOption('2');await p.locator('#end').click();
for(const side of ['left','middle']){await p.evaluate(side=>{let w=document.getElementById('tableWrap');w.scrollLeft=side==='left'?0:(w.scrollWidth-w.clientWidth)/2;window.scrollTo(0,w.getBoundingClientRect().top+scrollY-document.querySelector('nav').getBoundingClientRect().height-24)},side);await p.waitForTimeout(80);await p.screenshot({path:__dirname+'/en-320-zoom2-'+side+'.png'});}
await p.evaluate(()=>{document.documentElement.style.zoom=1;window.scrollTo(0,0)});await p.reload();const keys=[];for(let i=0;i<12;i++){await p.keyboard.press('Tab');keys.push(await p.evaluate(()=>({tag:document.activeElement.tagName,id:document.activeElement.id,text:document.activeElement.textContent.trim(),outline:getComputedStyle(document.activeElement).outlineWidth})));}
fs.writeFileSync(__dirname+'/header-reachability.json',JSON.stringify({samples: samples.length,checks:samples,keyboardOrder:keys},null,2));console.log({reachableLabels:samples.length,keyboardOrder:keys.map(x=>x.id||x.text)});await b.close();})().catch(e=>{console.error(e);process.exit(1)});

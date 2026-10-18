// Rendered color pairs, including inherited literals, not just token swatches.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const page=await browser.newPage(),errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>errors.push(r.url()));
 await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18777')+'/leetcode/115/');
 const pairs=[];
 for(const locale of ['en','zh']){
  await page.locator(`[data-lang="${locale}"]`).click();await page.selectOption('#preset','0');
  for(const phase of ['start','end','revealed','wrong','fallback']){
   if(phase==='end')await page.locator('#position').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
   if(phase==='revealed'){await page.locator('[name="prediction"][value="1"]').check();await page.locator('#reveal').click();}
   if(phase==='wrong'){await page.locator('[name="prediction"][value="0"]').check();await page.locator('#reveal').click();}
   if(phase==='fallback'){await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();await page.locator('#sourceDetails').evaluate(e=>e.open=true);}
   const rendered=await page.evaluate(()=>{
    function rgba(s){const n=s.match(/[\d.]+/g).map(Number);return [n[0],n[1],n[2],n.length>3?n[3]:1];}
    function blend(f,b){return f.slice(0,3).map((v,i)=>v*f[3]+b[i]*(1-f[3]));}
    function background(e){const chain=[];for(let n=e;n;n=n.parentElement)chain.unshift(n);return chain.reduce((bg,n)=>blend(rgba(getComputedStyle(n).backgroundColor),bg),[13,17,23]);}
    function lum(rgb){return rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
    return [...document.querySelectorAll('h1,h2,h3,p,li,legend,label,button,a,select,input,textarea,th,td,span,small,summary,code')].filter(e=>e.getClientRects().length&&e.textContent.trim()).map(e=>{const css=getComputedStyle(e),bg=background(e),fg=blend(rgba(css.color),bg),a=lum(fg),b=lum(bg);return {element:e.tagName,fg:css.color,bg:bg.map(v=>+v.toFixed(2)),ratio:+((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2)};});
   });
   for(const p of rendered)assert(p.ratio>=4.5,JSON.stringify(p));
   pairs.push({locale,phase,minimum:Math.min(...rendered.map(p=>p.ratio)),pairs:[...new Map(rendered.map(p=>[p.fg+'|'+p.bg.join(','),p])).values()]});
  }
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'rendered-contrast.json'),JSON.stringify({status:'passed',pairs,errors,scope:'Author computed-style audit; alpha backgrounds composited over ancestors'},null,2));console.log('Rendered contrast and console/network audit passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

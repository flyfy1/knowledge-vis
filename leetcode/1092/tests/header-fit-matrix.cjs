'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'header-fit-evidence','green');fs.mkdirSync(OUT,{recursive:true});
const URL=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1092/';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],records=[],screenshots=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(URL);
 const snap=()=>page.evaluate(()=>({preset,index,hand,choice,revealed,copyState,frame:model.frames[index],headers:[...document.querySelectorAll('#table th')].map(e=>e.textContent)}));
 async function inspectColumn(c){return page.evaluate(c=>{
  const wrap=document.querySelector('#tableWrap'),corner=document.querySelector('#table thead th'),th=document.querySelectorAll('#table thead th')[c+1],zoom=parseFloat(getComputedStyle(document.documentElement).zoom||1);
  wrap.scrollLeft+= (th.getBoundingClientRect().left-corner.getBoundingClientRect().right)/zoom;
  const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
  function lines(e){const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),out=[];let n;while(n=walker.nextNode()){if(!n.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(n);for(const r of range.getClientRects())if(r.width)out.push({left:r.left,right:r.right,top:r.top,bottom:r.bottom});}return out;}
  const cr=rect(corner),wr=rect(wrap),hr=rect(th),rows=[...document.querySelectorAll('#table tbody tr')].map(tr=>{const row=tr.querySelector('th'),cell=tr.children[c+1];return {label:row.textContent,scope:row.scope,rect:rect(row),lines:lines(row),value:cell.textContent,cell:rect(cell)};});
  return {column:c,label:th.textContent,scope:th.scope,header:hr,lines:lines(th),corner:{label:corner.textContent,rect:cr,lines:lines(corner)},wrap:wr,rows,scroll:wrap.scrollLeft,maxScroll:wrap.scrollWidth-wrap.clientWidth,visible:lines(th).every(r=>r.left>=Math.max(wr.left,cr.right)-.5&&r.right<=wr.right+.5)};
 },c);}
 async function capture(name){await page.locator('#tableWrap').evaluate(e=>{window.scrollTo({top:scrollY+e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-24,behavior:'instant'});});const g=await page.evaluate(()=>({headerTop:document.querySelector('#table thead').getBoundingClientRect().top,navBottom:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(g.headerTop>g.navBottom);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(OUT,name)});screenshots.push({name,...g});}
 for(const locale of ['en','zh'])for(const width of [320,390,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);await page.locator(`[data-lang=${locale}]`).click();
  for(const preset of ['2','0','1','3','4','5','6']){
   await page.selectOption('#preset',preset);const indices=await page.evaluate(()=>[...new Set([0,model.frames.findIndex(f=>f.kind==='equal'||f.kind==='different'),model.frames.findIndex(f=>f.kind==='ready'),model.frames.length-1])]);
   for(const target of indices){await page.evaluate(target=>{index=target;render();},target);const before=await snap();const n=await page.evaluate(()=>model.b.length);
    for(let c=0;c<=n;c++){
     const r=await inspectColumn(c);assert.equal(r.scope,'col');assert(r.visible,JSON.stringify({locale,width,zoom,preset,target,...r}));
     for(const line of r.lines)assert(line.top>=r.header.top-.5&&line.bottom<=r.header.bottom+.5);
     for(const line of r.corner.lines)assert(line.left>=r.wrap.left-.5&&line.right<=r.corner.rect.right+.5);
     for(const row of r.rows){assert.equal(row.scope,'row');assert(Math.abs(row.cell.left-r.header.left)<=2);assert(Math.abs(row.cell.right-r.header.right)<=2);for(const line of row.lines)assert(line.left>=r.wrap.left-.5&&line.right<=row.rect.right+.5);}
     records.push({locale,width,zoom,preset,target,...r});
    }
    await page.locator(`[data-lang=${locale==='en'?'zh':'en'}]`).click();const foreign=await inspectColumn(n);assert(foreign.visible);await page.locator(`[data-lang=${locale}]`).click();assert.deepEqual(await snap(),before);const r=await inspectColumn(n);assert(r.visible);
    if(preset==='2'&&target===indices.at(-1)&&[320,1440].includes(width))await capture(`${locale}-${width}-zoom${zoom}-end-right.png`);
   }
  }
 }
 // Real controls retain their semantics and table keyboard access after the repair.
 await page.setViewportSize({width:320,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('[data-lang=en]').click();await page.selectOption('#preset','2');const initial=await snap();await page.locator('#next').click();const next=await snap();await page.locator('#prev').click();assert.deepEqual(await snap(),initial);await page.locator('#next').click();assert.deepEqual(await snap(),next);await page.locator('#end').click();const end=await snap();assert.equal(end.frame.out,'aaaaaaaa');assert(await page.locator('#next').isDisabled());await page.locator('#reset').click();assert.deepEqual(await snap(),initial);
 await page.locator('#tableWrap').evaluate(e=>e.scrollLeft=0);await page.locator('#tableWrap').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('#tableWrap').scrollLeft>0);const keyboard=await page.locator('#tableWrap').evaluate(e=>({scrollLeft:e.scrollLeft,outline:getComputedStyle(e).outlineWidth,style:getComputedStyle(e).outlineStyle,focus:document.activeElement===e}));assert(keyboard.focus&&keyboard.outline==='3px'&&keyboard.style!=='none');await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>document.querySelector('#tableWrap').scrollLeft===0);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#tableWrap').focus();assert.equal(await page.locator('#tableWrap').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.locator('#end').click();const forced=await inspectColumn(8);assert(forced.visible);await capture('en-320-zoom2-forced-colors.png');
 assert.deepEqual(errors,[]);const report={status:'passed',scope:'author presentation regression, not independent acceptance',host:process.platform,browser:browser.version(),textRectTolerance:.5,records,screenshots,keyboard,errors,zoomMethod:'CSS zoom layout stress, not native browser zoom or physical device'};fs.writeFileSync(path.join(OUT,'matrix.json.gz'),require('node:zlib').gzipSync(JSON.stringify(report)));fs.writeFileSync(path.join(OUT,'matrix.json'),JSON.stringify({...report,records:undefined,headerChecks:records.length,fullRecords:'matrix.json.gz'},null,2)+'\n');console.log(JSON.stringify({status:'passed',headerChecks:records.length,screenshots:screenshots.length,keyboard}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});

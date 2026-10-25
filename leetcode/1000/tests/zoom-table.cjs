const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');const O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),URL=process.env.PREVIEW_URL||'http://127.0.0.1:18800/leetcode/1000/';
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const p=await b.newPage({reducedMotion:'reduce'});await p.goto(URL);let states=[];
for(const lang of ['en','zh'])for(const width of [320,390]){
 await p.setViewportSize({width,height:1000});await p.evaluate(()=>document.body.style.zoom=2);await p.locator(`[data-lang=${lang}]`).click();await p.selectOption('#preset','0');for(let i=0;i<5;i++)await p.locator('#next').click();
 for(let col=0;col<3;col++){
  const cell=p.locator('#ledger .current-row td').nth(col);await cell.evaluate(e=>{const r=document.querySelector('#ledgerScroll');r.scrollLeft=e.offsetLeft-r.offsetLeft;window.scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-24);});
  await p.screenshot({path:path.join(O,`zoom-table-${lang}-${width}-col${col}.png`)});const text=await cell.innerText();assert.equal(text,col===0?'D(0,2,2)':col===1?'5':lang==='en'?'★ Just completed':'★ 刚完成');states.push({lang,width,zoom:2,col,text});
 }
}
fs.writeFileSync(path.join(O,'zoom-table.json'),JSON.stringify({kind:'author component scroll inspection',states},null,2));await b.close();console.log('Zoomed table column captures passed');})().catch(e=>{console.error(e);process.exit(1)});

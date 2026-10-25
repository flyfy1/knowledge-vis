'use strict';
// 587-R1-F1: assert the accounting scope beside each advertised result.
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const out=path.resolve(process.env.EVIDENCE_DIR||path.join(__dirname,'evidence/r1-fix'));
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18779';
// Hand-calculated input / boundary counts, separate from the trace implementation:
// square minus center; official example minus (2,2); line; point; line;
// triangle (0,0),(2,5),(3,0) with (1,2) inside.
const counts=[[6,5],[6,5],[3,3],[1,1],[4,4],[4,3]];
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const states=[];
 try{
  const page=await browser.newPage();
  await page.goto(base+'/leetcode/587/');
  // Avoid spending the regression on smooth-scroll animations between sections.
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  await page.locator('#progress').filter({hasText:'0/'}).waitFor();
  for(const width of [1365,320,390]){
   await page.setViewportSize({width,height:950});
   for(const lang of ['en','zh']){
    await page.locator('[data-lang='+lang+']').click();
    for(let p=0;p<counts.length;p++){
     const [input,boundary]=counts[p];
     await page.selectOption('#preset',String(p));
     for(const event of [0,4]){
      if(event)for(let i=0;i<event;i++)await page.locator('#traceNext').click();
      const label=await page.locator('#preset option:checked').textContent();
      assert(label.includes(lang==='en'?`${boundary} boundary ${boundary===1?'tree':'trees'}`:`${boundary} 棵${p===2?'共线':'边界'}树`),`587-R1-F1: preset ${p}, ${lang}, ${width}, event ${event}: ${label}`);
      assert(await page.locator('#preset').evaluate(el=>{
       const style=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d');
       ctx.font=style.font;
       return ctx.measureText(el.selectedOptions[0].textContent).width<=el.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-16;
      }),'Selected preset text must fit beside the native arrow');
      const inputText=await page.locator('#inputRead').textContent();
      assert.equal((inputText.match(/\(\d+,\d+\)/g)||[]).length,input);
      const progress=await page.locator('#progress').textContent();
      await page.locator('[data-lang='+(lang==='en'?'zh':'en')+']').click();
      await page.locator('[data-lang='+lang+']').click();
      assert.equal(await page.locator('#preset').inputValue(),String(p));
      assert.equal(await page.locator('#progress').textContent(),progress);
      assert.equal(await page.locator('#preset option:checked').textContent(),label);
      states.push({width,lang,preset:p,event,label,input,boundary,inputText,progress});
     }
     await page.locator('#traceLast').click();
     const final=await page.locator('#operationRead').textContent();
     assert(final.includes((lang==='en'?'(': '（')+boundary+' '));
    }
    for(const p of [0,5]){
     await page.selectOption('#preset',String(p));
     for(let i=0;i<4;i++)await page.locator('#traceNext').click();
     await page.locator('#preset').scrollIntoViewIfNeeded();
     assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
     await page.screenshot({path:path.join(out,`${lang}-preset${p}-${width}.png`)});
    }
   }
  }
  fs.writeFileSync(path.join(out,'preset-scope.json'),JSON.stringify({selfCheck:true,finding:'587-R1-F1',states},null,2)+'\n');
  console.log(JSON.stringify({ok:true,finding:'587-R1-F1',states:states.length}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'preset-scope-failure.txt'),e.stack+'\n');console.error(e);process.exitCode=1;});

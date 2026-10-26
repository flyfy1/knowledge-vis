const { chromium } = require('playwright');
const readline = require('node:readline');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({headless:true,channel:'chrome'});
 const page = await browser.newPage({viewport:{width:1440,height:1100}});
 const rl=readline.createInterface({input:process.stdin,output:process.stdout,terminal:false});
 console.log('READY');
 for await (const line of rl) {
  try {
   const c=JSON.parse(line); let result; const root=c.scope?page.locator(c.scope):page;
   fs.appendFileSync(__dirname+'/ui-transcript.jsonl',JSON.stringify({time:new Date().toISOString(),command:c})+'\n');
   if(c.action==='goto') {await page.goto(c.url); await page.waitForTimeout(300);}
   if(c.action==='click') {await root.getByRole(c.role||'button',{name:c.name,exact:c.exact!==false}).click();}
   if(c.action==='textclick') {await page.getByText(c.text,{exact:true}).click();}
   if(c.action==='key') {await page.keyboard.press(c.key);}
   if(c.action==='fill') {await root.getByRole(c.role||'textbox',{name:c.name,exact:true}).fill(c.value);}
   if(c.action==='focus') {await root.getByRole(c.role||'button',{name:c.name,exact:true}).focus();}
   if(c.action==='back') {await page.goBack();}
   if(c.action==='forward') {await page.goForward();}
   if(c.action==='reload') {await page.reload();}
   if(c.action==='resize') {await page.setViewportSize({width:c.width,height:c.height});}
   if(c.action==='forcedColors') {await page.emulateMedia({forcedColors:c.value||'active'});}
   if(c.action==='textScale') {
    const changed=await page.locator('body,body *').evaluateAll((els,factor)=>{
     const rows=els.map(e=>({e,size:parseFloat(getComputedStyle(e).fontSize),line:getComputedStyle(e).lineHeight}));
     for(const {e,size,line} of rows) {if(Number.isFinite(size))e.style.setProperty('font-size',size*factor+'px','important');if(line.endsWith('px'))e.style.setProperty('line-height',parseFloat(line)*factor+'px','important');}
     return rows.length;
    },c.factor||2); console.log('VISIBLE_TEXT_SCALE '+changed);
   }
   if(c.action==='wait') {await page.waitForTimeout(Math.min(c.ms||1000,5000));}
   if(c.action==='scroll') {await root.scrollIntoViewIfNeeded();}
   if(c.action==='input') {await page.locator(c.selector).fill(c.value);}
   if(c.action==='select') {await page.getByRole('combobox',{name:c.name,exact:true}).selectOption(c.value);}
   if(c.action==='shot') {await page.screenshot({path:c.path,fullPage:c.fullPage!==false});}
   if(c.action==='close') {await browser.close(); rl.close(); console.log('CLOSED'); break;}
   if(c.action!=='shot') {
    await page.waitForTimeout(120);
    result=await (c.scope?root:page.locator('body')).innerText();
    const controls=await root.locator('button,input,select,textarea,a,summary').evaluateAll(els=>els.filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,text:e.innerText,value:e.value,aria:e.getAttribute('aria-label'),expanded:e.getAttribute('aria-expanded'),labels:e.labels?[...e.labels].map(l=>l.innerText):undefined,type:e.type,disabled:e.disabled,placeholder:e.placeholder,href:e.getAttribute('href'),focused:e===document.activeElement,options:e.tagName==='SELECT'?[...e.options].map(o=>({text:o.text,value:o.value})):undefined}))); 
    const output={url:page.url(),text:result,controls};
    fs.appendFileSync(__dirname+'/ui-transcript.jsonl',JSON.stringify(output)+'\n');
    console.log(JSON.stringify(output));
   } else console.log('SAVED');
  } catch(e) { console.log('ERROR '+e.message); }
 }
})().catch(e=>{console.error(e);process.exitCode=1;});

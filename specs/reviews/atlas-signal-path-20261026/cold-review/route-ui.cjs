const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const b=await chromium.launch({headless:true,channel:'chrome'});const rows=[];const log=x=>{rows.push(x);fs.writeFileSync(path.join(__dirname,'route-ui.json'),JSON.stringify(rows,null,2));console.log(JSON.stringify(x));};try{const p=await b.newPage({viewport:{width:1440,height:1100},hasTouch:true});await p.goto('http://127.0.0.1:18923/atlas/?trail=signal&node=lti&view=list');
 const snap=async(stage,scope)=>{const root=scope?p.locator(scope):p.locator('body');let text=await root.innerText();if(!scope){const i=text.indexOf('Suggested route · An editorial');text=text.slice(i,text.indexOf('Starting ideas',i));}log({stage,url:p.url(),text,controls:await root.locator('button,a,input,select,summary').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,text:e.innerText,aria:e.getAttribute('aria-label'),href:e.getAttribute('href'),value:e.value,disabled:e.disabled,labels:e.labels?[...e.labels].map(l=>l.innerText):undefined})))});};
 await p.getByText('Compare your prediction · what to look for and why',{exact:true}).click();await snap('station1-guide');
 for(const [name,scope] of [['station2','#step2'],['station3','#step2'],['station4','#step3']]){
  await p.getByRole('button',{name:'Next concept →',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForTimeout(200);await snap(name);
  await p.getByText('Compare your prediction · what to look for and why',{exact:true}).click();await snap(name+'-guide');
  await p.getByRole('link',{name:'Open this experiment →',exact:true}).click();await p.waitForTimeout(200);await snap(name+'-course',scope);
  await p.goBack();await p.waitForTimeout(200);await snap(name+'-Back');
 }
 }finally{await b.close();log({browser:'CLOSED'});}})().catch(e=>{console.error(e);process.exitCode=1});

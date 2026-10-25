const {chromium}=require('playwright'),fs=require('fs');
(async()=>{
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:320,height:950}});
 await p.goto(process.env.PREVIEW_URL+'/leetcode/587/');await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.locator('#progress').filter({hasText:'0/'}).waitFor();await p.locator('[data-lang=en]').click();
 const rows=[];
 async function record(mode){for(const preset of [1,2,5]){await p.selectOption('#preset',String(preset));rows.push({mode,preset,...await p.locator('#preset').evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;const width=c.measureText(el.selectedOptions[0].textContent).width,available=el.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-16;return {label:el.selectedOptions[0].textContent,font:s.font,control:el.clientWidth,padding:[s.paddingLeft,s.paddingRight],width,available,pass:width<=available}})});}}
 await record('baseline');
 let style=await p.addStyleTag({content:'#preset{font-family:Arial!important}'});await record('font-only-Arial');await style.evaluate(e=>e.remove());
 style=await p.addStyleTag({content:'#preset{padding-left:8px!important;padding-right:8px!important}'});await record('padding-only-8px');await style.evaluate(e=>e.remove());
 await p.locator('[data-lang=zh]').click();await p.locator('[data-lang=en]').click();await record('locale-roundtrip');
 fs.writeFileSync('/tmp/leetcode-587-mac-probe/hypotheses.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));await b.close();
})().catch(e=>{console.error(e);process.exitCode=1});

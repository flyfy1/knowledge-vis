const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{const b=await chromium.launch(),rows=[];try{
 for(const control of ['#preset','#nativeControl'])for(const sequence of [['ArrowDown','Enter'],['Space','ArrowDown','Enter'],['ArrowDown','ArrowDown','Enter']]){
  const p=await b.newPage();await p.goto(process.env.PREVIEW_URL+'/leetcode/679/');
  await p.evaluate(()=>{const s=document.createElement('select');s.id='nativeControl';for(let i=0;i<5;i++)s.add(new Option(String(i),String(i)));document.body.prepend(s);});
  await p.selectOption(control,'1');await p.locator(control).focus();assert.equal(await p.evaluate(()=>document.activeElement.id),control.slice(1));
  const steps=[];for(const key of sequence){await p.keyboard.press(key);steps.push({key,value:await p.locator(control).inputValue()});}
  rows.push({control,sequence,steps});await p.close();
 }
 fs.writeFileSync(path.join(process.env.OUTPUT_DIR,'native-select-probe.json'),JSON.stringify({platform:process.platform,browser:b.version(),rows},null,2));console.log(JSON.stringify(rows));
 assert.equal(rows[0].steps.at(-1).value,'1');assert.equal(rows[1].steps.at(-1).value,'2');assert.equal(rows[3].steps.at(-1).value,'1');assert.equal(rows[4].steps.at(-1).value,'2');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

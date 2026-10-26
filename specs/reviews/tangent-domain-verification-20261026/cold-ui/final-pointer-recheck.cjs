const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1100},hasTouch:true});
 const events=[];
 const log=x=>{events.push(x);console.log(JSON.stringify(x));fs.writeFileSync(path.join(__dirname,'final-pointer-recheck.json'),JSON.stringify(events,null,2));};
 try{
  log({method:'UI-only AI recheck; no source, BRIEF, tests, app model or internal history inspected. Native mouse and browser touch input, 12 moves at 220ms intervals. Not human learning research.',prediction:'A drag ending at displayed 90° should be undefined; a separate near-42.6° touch endpoint should be finite positive. After release and 1000ms, reload should preserve actual displayed angle and function values, with S6 paused.'});
  await page.goto('http://127.0.0.1:18775/trig/#step6');
  const step=page.locator('#step6');
  const canvas=page.locator('#s6-canvas');
  const read=async()=>{
   const text=await step.innerText();
   return {url:page.url(),readout:text.split('\n').find(x=>x.startsWith('θ:')),buttons:await step.getByRole('button').allTextContents()};
  };
  const reset=async()=>{
   await step.getByRole('button',{name:'▶ Spin it',exact:true}).focus();
   await page.keyboard.press('Shift+Tab');await page.keyboard.press('Home');
   await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(500);
   const box=await canvas.boundingBox();
   log({stage:'visible geometry and reset',box,state:await read()});
   return {cx:box.x+197.5,cy:box.y+210,r:158};
  };
  const same=(a,b)=>a.readout===b.readout&&b.buttons.includes('▶ Spin it');
  let g=await reset();
  await page.mouse.move(g.cx+g.r,g.cy);await page.mouse.down();
  for(let i=1;i<=12;i++){
   const t=i/12;await page.mouse.move(g.cx+g.r*(1-t),g.cy-g.r*t);await page.waitForTimeout(220);
  }
  await page.mouse.up();await page.waitForTimeout(1000);
  const mb=await read();log({stage:'long mouse released + 1s',state:mb});
  await page.screenshot({path:path.join(__dirname,'27-final-long-mouse-before.png'),fullPage:false});
  await page.reload();await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
  const ma=await read();log({stage:'long mouse reload',state:ma,equalReadoutAndPaused:same(mb,ma)});
  await page.screenshot({path:path.join(__dirname,'28-final-long-mouse-after.png'),fullPage:false});
  if(!same(mb,ma))throw Error('mouse final visible state changed on reload');
  g=await reset();
  const target={x:g.cx+g.r*Math.cos(42.6*Math.PI/180),y:g.cy-g.r*Math.sin(42.6*Math.PI/180)};
  const start={x:g.cx+g.r,y:g.cy};
  const client=await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});
  for(let i=1;i<=12;i++){
   await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(target.x-start.x)*i/12,y:start.y+(target.y-start.y)*i/12,id:1}]});
   await page.waitForTimeout(220);
  }
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await client.detach();
  await page.waitForTimeout(1000);
  const tb=await read();log({stage:'long touch released + 1s',target,state:tb});
  await page.screenshot({path:path.join(__dirname,'29-final-long-touch-before.png'),fullPage:false});
  await page.reload();await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
  const ta=await read();log({stage:'long touch reload',state:ta,equalReadoutAndPaused:same(tb,ta)});
  await page.screenshot({path:path.join(__dirname,'30-final-long-touch-after.png'),fullPage:false});
  if(!same(tb,ta))throw Error('touch final visible state changed on reload');
  log({result:'Both long pointer paths preserve visible angle/tan and pause state after explicit reload.'});
 }finally{await browser.close();log({browser:'CLOSED'});}
})().catch(e=>{console.error(e);process.exitCode=1});

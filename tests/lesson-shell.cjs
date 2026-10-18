const {chromium} = require('playwright');
const base = process.env.UI_AUDIT_BASE || 'http://127.0.0.1:18769';
const proof = process.env.UI_AUDIT_PROOF === '1';
(async () => {
  const browser = await chromium.launch({headless:true, channel:'chrome'});
  const failures = [];
  const check = (name, pass, observed) => {
    console.log(JSON.stringify({name, pass, observed}));
    if (!pass) failures.push(name);
  };
  const page = async width => {
    const p = await browser.newPage({viewport:{width,height:900},deviceScaleFactor:2});
    await p.addInitScript(() => localStorage.setItem('knowledge-lang','en'));
    return p;
  };
  for (const step of [3,4]) {
    const p = await page(1376);
    if (proof) await p.route('**/sampling/style.css*', async route => {
      const response = await route.fetch();
      await route.fulfill({response, body:await response.text() +
        '\n#s0-canvas{height:360px} #s1-canvas{height:300px}'});
    });
    await p.goto(`${base}/sampling/#step${step}`);
    await p.waitForTimeout(2400);
    const r = await p.evaluate(() => ({
      y:document.querySelector(location.hash).getBoundingClientRect().y,
      active:document.querySelector('nav .active')?.getAttribute('href')
    }));
    check(`sampling-step${step}`,r.y>=0&&r.y<250&&r.active===`#step${step}`,r);
    await p.close();
  }
  const p = await page(390);
  await p.goto(`${base}/fourier/#step5`);
  await p.waitForTimeout(1800);
  if (proof) {
    await p.addStyleTag({content:'.fourier-link{color:var(--accent)}'});
    await p.evaluate(() => {
      const nav=document.querySelector('nav');
      nav.scrollLeft=nav.querySelector('.active').offsetLeft;
    });
  }
  const r = await p.evaluate(() => {
    const a=document.querySelector('#step5 .fourier-link');
    let el=a,bg;
    while(el){
      const color=getComputedStyle(el).backgroundColor;
      if(color!=='rgba(0, 0, 0, 0)'){bg=color;break;}
      el=el.parentElement;
    }
    const lum=c=>c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255)
      .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
      .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const fg=getComputedStyle(a).color,x=lum(fg),y=lum(bg);
    const active=document.querySelector('nav .active').getBoundingClientRect();
    return {fg,bg,contrast:(Math.max(x,y)+.05)/(Math.min(x,y)+.05),
      activeLeft:active.left,activeRight:active.right,width:innerWidth,
      navHeight:document.querySelector('nav a').getBoundingClientRect().height};
  });
  check('fourier-link-contrast',r.contrast>=4.5,r);
  check('phone-active-step-visible',r.activeLeft>=0&&r.activeRight<=r.width,r);
  check('step-target-height',r.navHeight>=48,r.navHeight);
  await p.close();
  for(const slug of ['eigen','convolution','kalman']){
    const p=await page(320);
    await p.goto(`${base}/${slug}/`);
    await p.waitForTimeout(600);
    const r=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    check(`${slug}-narrow-header`,r.scrollWidth<=r.width,r);
    await p.close();
  }
  await browser.close();
  process.exitCode=failures.length?1:0;
})();
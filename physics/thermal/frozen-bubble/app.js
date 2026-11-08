(() => {
  'use strict';
  const $ = id => document.getElementById(id), M = window.FrozenBubbleModel;
  const colors = { text:'#e8edf4', muted:'#9aaabd', cyan:'#67d7f9', orange:'#ffb454', panel:'#121a24', line:'#2c3b50' };
  let lang;
  try { lang = localStorage.getItem('knowledge-lang'); } catch (_) { /* in-memory fallback */ }
  if (!STR[lang]) lang = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const t = key => STR[lang][key];
  const experiments = {
    growth:{ time:0, running:false, seeds:[], status:'waiting' },
    compare:{ time:0, running:false, status:'paused' }
  };
  let raf = null, last = null;
  const canvases = ['growth','cold','warm','history'].map($);
  const contexts = new Map(canvases.map(c => [c, c.getContext('2d')]));
  function fit(canvas) {
    const ctx = contexts.get(canvas);
    if (!ctx) { canvas.textContent = t('noCanvas'); return null; }
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width=width; canvas.height=height; }
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,rect.width,rect.height);
    ctx.font='13px system-ui'; ctx.lineCap='round'; ctx.lineJoin='round';
    return {ctx,w:rect.width,h:rect.height};
  }
  function label(ctx,text,x,y,color=colors.muted,align='center') {
    ctx.fillStyle=color; ctx.textAlign=align; ctx.fillText(text,x,y);
  }
  function shell(canvas, showBase = true) {
    const f=fit(canvas); if (!f) return null;
    const {ctx,w,h}=f, r=Math.min(w*.4,h*.35), x=w/2, y=h*.49;
    const fill=ctx.createRadialGradient(x-r*.3,y-r*.4,r*.1,x,y,r);
    fill.addColorStop(0,'#182433');fill.addColorStop(.85,'#121a24');fill.addColorStop(1,'#233d4d');
    ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=colors.cyan;ctx.lineWidth=1.5;ctx.stroke();
    if (showBase) {
      ctx.fillStyle=colors.line;ctx.fillRect(x-r*.5,y+r+2,r,6);
      label(ctx,t('base'),x,y+r+29);
    }
    return {...f,x,y,r};
  }
  function branch(ctx,x,y,size,angle,index) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle=index%3===0?colors.text:colors.cyan;
    ctx.lineWidth=1.2;
    for(let arm=0;arm<6;arm++) {
      ctx.save();ctx.rotate(arm*Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(size,0);
      for(let n=1;n<=5;n++) {
        const at=n*size/6, b=(size-at)*.45;
        ctx.moveTo(at,0);ctx.lineTo(at+b*.6,-b*.6);
        ctx.moveTo(at,0);ctx.lineTo(at+b*.6,b*.6);
      }
      ctx.stroke();ctx.restore();
    }
    ctx.fillStyle=colors.orange;ctx.beginPath();ctx.arc(0,0,2.5,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function clip(g) {g.ctx.save();g.ctx.beginPath();g.ctx.arc(g.x,g.y,g.r-1,0,Math.PI*2);g.ctx.clip();}
  function growth() {
    const g=shell($('growth'), false);if(!g)return;
    const {ctx,x,y,r,w}=g, e=experiments.growth;
    label(ctx,t('film'),w/2,19,colors.cyan);
    clip(g);
    if(!e.seeds.length) label(ctx,t('air'),x,y);
    e.seeds.forEach((s,i)=>{ if(e.time>=s.birth) branch(ctx,x+s.x*r,y+s.y*r,Math.max(3,M.radius(e.time-s.birth,+$('undercooling').value)*r),i*.45,i); });
    ctx.restore();
  }
  function compare(mode) {
    const g=shell($(mode));if(!g)return;
    const {ctx,x,y,r,w}=g, time=experiments.compare.time;
    label(ctx,mode==='cold'?t('cool'):t('film'),w/2,19,colors.cyan);
    clip(g);
    if(mode==='cold') {
      // A visible base front starts the transport; additional fronts grow along paths.
      if(time>0) for(let i=0;i<8;i++) branch(ctx,x+(i-3.5)*r*.16,y+r*.91,Math.min(r*.2,time*r*.013),i*.8,i);
      for(let i=0;i<22;i++) {
        const c=M.crystal(time,i);if(!c.active)continue;
        if($('trails').checked) {
          ctx.strokeStyle=colors.cyan;ctx.globalAlpha=.45;ctx.lineWidth=1;ctx.beginPath();
          for(let a=0;a<=c.age;a+=.2){const p=M.crystal(2+i*.62+a,i);const px=x+p.x*r,py=y+p.y*r;if(a===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
          ctx.lineTo(x+c.x*r,y+c.y*r);ctx.stroke();ctx.globalAlpha=1;
        }
        branch(ctx,x+c.x*r,y+c.y*r,Math.max(2,c.size*r),i*.7,i);
      }
      if(time>0&&time<9){ctx.strokeStyle=colors.orange;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+r*.72);ctx.lineTo(x,y+r*.3);ctx.lineTo(x-5,y+r*.3+9);ctx.moveTo(x,y+r*.3);ctx.lineTo(x+5,y+r*.3+9);ctx.stroke();}
    } else {
      const f=M.front(time,'warm'), top=y+r-2*r*f;
      ctx.fillStyle='#294454';ctx.fillRect(x-r,top,2*r,2*r);
      if(time>0) for(let i=0;i<9;i++)branch(ctx,x+(i-4)*r*.22,y+r*.84,Math.min(r*.28,time*r*.014),i*.7,i);
      ctx.strokeStyle=colors.orange;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-r,top);ctx.lineTo(x+r,top);ctx.stroke();
    }
    ctx.restore();
  }
  function history() {
    const g=fit($('history'));if(!g)return;
    const {ctx,w,h}=g, left=38,right=w-18,top=16,bottom=h-30, time=experiments.compare.time;
    ctx.strokeStyle=colors.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,bottom);ctx.lineTo(right,bottom);ctx.stroke();
    label(ctx,'1',left-12,top+5);label(ctx,'0',left-12,bottom+4);label(ctx,'0',left,bottom+21);label(ctx,'24',right,bottom+21);
    ctx.strokeStyle=colors.orange;ctx.lineWidth=2;ctx.beginPath();
    for(let v=0;v<=time;v+=.1){const px=left+v/M.END*(right-left),py=bottom-M.front(v,'warm')*(bottom-top);if(v===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
    ctx.stroke();const now=left+time/M.END*(right-left);ctx.setLineDash([3,4]);ctx.strokeStyle=colors.muted;ctx.beginPath();ctx.moveTo(now,top);ctx.lineTo(now,bottom);ctx.stroke();ctx.setLineDash([]);
  }
  function controls() {
    $('underValue').textContent=`ΔT = ${Number($('undercooling').value).toFixed(1)}°C`;
    for(const [id,e] of Object.entries(experiments)) {
      $(`${id}-time`).value=e.time;
      $(`${id}-play`).textContent=t(e.running?'pause':e.time>=M.END?'replay':'play');
      $(`${id}-play`).setAttribute('aria-pressed',String(e.running));
      // A stable live-region node announces state changes, never each animation frame.
      if ($(`${id}-status`).textContent !== t(e.status)) $(`${id}-status`).textContent=t(e.status);
    }
    const e=experiments.growth;
    $('growth-play').disabled=e.seeds.length===0;
    $('seed').disabled=e.seeds.length>=6 || e.time>=M.END;
    const active=e.seeds.filter(s=>s.birth<=e.time).length;
    $('growth-readout').textContent=`${e.time.toFixed(1)}${t('timeUnit')} · ${t('nuclei')}: ${active}`;
    $('growth-readout').dataset.time=e.time;
    const count=Array.from({length:22},(_,i)=>M.crystal(experiments.compare.time,i)).filter(c=>c.active).length;
    const time=experiments.compare.time;
    $('compare-readout').textContent=`${time.toFixed(1)}${t('timeUnit')} · ${t('transported')}: ${count} · ${t('frontHeight')}: ${M.front(time,'warm').toFixed(2)}`;
    $('compare-readout').dataset.time=time;
    const phase = time === 0 ? 0 : time < 9 ? 1 : time < 20 ? 2 : 3;
    for (const mode of ['cold','warm']) {
      const note = $(`${mode}-observation`), copy = t(`${mode}Observe${phase}`);
      if (note.textContent !== copy) note.textContent = copy;
      note.dataset.phase = phase;
    }
    const growthCopy = t(active === 0 ? 'growthEmpty' : e.seeds.some(s=>e.time>s.birth+.5) ? 'growthGrown' : 'growthSeed');
    if ($('growth-observation').textContent !== growthCopy) $('growth-observation').textContent = growthCopy;
    document.querySelectorAll('[data-moment]').forEach(button=>button.setAttribute('aria-pressed', String(Math.abs(time-Number(button.dataset.moment))<.05)));

  }
  function render() { controls();growth();compare('cold');compare('warm');history(); }
  function schedule() { if(raf===null && Object.values(experiments).some(e=>e.running))raf=requestAnimationFrame(frame); }
  function frame(now) {
    raf=null;
    const dt=last===null?0:Math.min(.1,(now-last)/1000);last=now;
    for(const e of Object.values(experiments))if(e.running){e.time=Math.min(M.END,e.time+dt);if(e.time>=M.END){e.running=false;e.status='ended';}}
    render();if(Object.values(experiments).some(e=>e.running))schedule();else last=null;
  }
  function applyLang(next) {
    lang=next;try{localStorage.setItem('knowledge-lang',lang);}catch(_){}
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('title')+' · visual.integ.life';
    document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));
    document.querySelectorAll('[data-lang]').forEach(el=>{const active=el.dataset.lang===lang;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
    render();
  }
  for(const id of Object.keys(experiments)) {
    const e=experiments[id];
    $(`${id}-play`).addEventListener('click',()=>{if(e.time>=M.END)e.time=0;e.running=!e.running;e.status=e.running?'running':'paused';render();last=null;schedule();});
    $(`${id}-reset`).addEventListener('click',()=>{e.time=0;e.running=false;e.status=id==='growth'?'waiting':'paused';if(e.seeds)e.seeds=[];render();});
    $(`${id}-time`).addEventListener('input',event=>{e.running=false;e.time=+event.target.value;e.status=e.time>=M.END?(id==='growth'?'seedEnd':'ended'):id==='growth'&&!e.seeds.length?'waiting':'paused';render();});
  }
  function seed(x,y) {
    const e=experiments.growth;if(e.time>=M.END){e.status='seedEnd';render();return;}if(e.seeds.length>=6)return;
    e.seeds.push({x,y,birth:e.time});e.status=e.seeds.length>=6?'seedFull':'seeded';render();
  }
  $('seed').addEventListener('click',()=>{const points=[[0,.6],[-.35,.1],[.35,-.3],[-.4,-.45],[.42,.4],[0,-.65]];seed(...points[experiments.growth.seeds.length]);});
  $('growth').addEventListener('click',event=>{const b=$('growth').getBoundingClientRect(),r=Math.min(b.width*.4,b.height*.35),x=(event.clientX-b.left-b.width/2)/r,y=(event.clientY-b.top-b.height*.49)/r;if(x*x+y*y<.9)seed(x,y);});
  document.querySelectorAll('[data-moment]').forEach(button=>button.addEventListener('click',()=>{
    const e=experiments.compare;
    e.time=Number(button.dataset.moment);e.running=false;e.status=e.time===M.END?'ended':'paused';
    render();
  }));
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelector('.comparison').dataset.visibleScene=button.dataset.scene;
    document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    render();
  }));
  $('undercooling').addEventListener('input',render);$('trails').addEventListener('change',render);
  document.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>applyLang(el.dataset.lang)));
  document.addEventListener('visibilitychange',()=>{last=null;});
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('.nav-step').forEach(a=>{const active=a.hash==='#'+entry.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
  },{rootMargin:'-15% 0px -55% 0px',threshold:0});
  document.querySelectorAll('.step').forEach(el=>observer.observe(el));
  const resize=new ResizeObserver(render);canvases.forEach(c=>resize.observe(c));window.addEventListener('resize',render);
  applyLang(lang);
})();

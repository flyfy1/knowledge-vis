'use strict';
/* 光合作用 — 速率/对账全部由 PURE 纯函数实算，构建：Alberto 补完（Codex 写了 HTML/CSS 后容量中断） */
function $(id){return document.getElementById(id);}
function clamp(v,lo,hi){return v<lo?lo:(v>hi?hi:v);}
function fmt1(x){return (Math.round(x*10)/10).toString();}

/* ---------------- PURE ---------------- */
/* 取 min 模型（最短板）：速率 = min(光允许的速率, CO₂ 允许的速率)，两者均为饱和型、封顶 MAXRATE */
const MODEL = { MAXRATE: 40, KL: 30, KC: 25, BUBBLE_SCALE: 3, S0_LIGHT: 70, S0_CO2: 60, S2_CO2: 60, S3_LIGHT: 100 };
function lightFactor(L){ return L<=0?0:L/(L+MODEL.KL); }
function co2Factor(C){ return C<=0?0:C/(C+MODEL.KC); }
function lightCap(L){ return MODEL.MAXRATE*lightFactor(L); }
function co2Cap(C){ return MODEL.MAXRATE*co2Factor(C); }
function photoRate(L,C){ return Math.min(lightCap(L), co2Cap(C)); }
function bubblesPerMin(rate){ return Math.round(rate*MODEL.BUBBLE_SCALE); }
function limitingFactor(L,C){ return co2Cap(C)<=lightCap(L)?'co2':'light'; }
/* 光饱和 = 光已不是最短板：再加光，速率不变 */
function isSaturated(L,C){ return limitingFactor(L,C)==='co2'; }
/* 轴上限：曲线最大值向上取整到 5 */
function niceMax(fn){ let m=0; for(let v=0;v<=100;v+=1) m=Math.max(m,fn(v)); return Math.max(5,Math.ceil(m/5)*5); }
/* 方程式各项的原子构成（查表数据）→ 对账求和（判定逻辑） */
const TERMS = {
  co2:   { key:'eqCO2', atoms:{C:1,O:2}, coef:6, src:'srcCO2' },
  h2o:   { key:'eqH2O', atoms:{H:2,O:1}, coef:6, src:'srcH2O' },
  light: { key:'eqLight', atoms:{}, coef:0, src:'srcLight' },
  sugar: { key:'eqSugar', atoms:{C:6,H:12,O:6}, coef:1, src:'srcSugar' },
  o2:    { key:'eqO2', atoms:{O:2}, coef:6, src:'srcO2' }
};
function atomTotals(side){
  const tot={C:0,H:0,O:0};
  side.forEach(id=>{ const tm=TERMS[id]; for(const el in tm.atoms) tot[el]+=tm.atoms[el]*tm.coef; });
  return tot;
}
function ledgerBalanced(){ const l=atomTotals(['co2','h2o']), r=atomTotals(['sugar','o2']); return l.C===r.C&&l.H===r.H&&l.O===r.O; }
const QUIZ = { q1:{answer:'b'}, q2:{answer:'a'} };
const BET = { answer:'o2', options:['o2','co2','vapor'] };
function judge(qid, choice){ return choice===QUIZ[qid].answer; }

/* ---------------- 状态 ---------------- */
const S = {
  s0:{ playing:false, bubbles:[], released:0, last:0, spawnAcc:0, bet:null },
  s1:{ term:'co2' },
  s2:{ light:55 },
  s3:{ co2:60 },
  s4:{ q1:null, q2:null }
};

/* ---------------- Canvas 基础 ---------------- */
// CSS owns layout; never read dimensions back from the mutable bitmap attributes.
function fit(cv){
  const rect=cv.getBoundingClientRect(), w=Math.max(1,rect.width), h=Math.max(1,rect.height);
  const dpr=Math.min(3,Math.max(1,window.devicePixelRatio||1));
  let ctx;
  try { ctx=cv.getContext('2d'); } catch(_e) { ctx=null; }
  cv.parentElement.classList.toggle('canvas-ready',!!ctx);
  if(!ctx) return null;
  if(cv.width!==Math.round(w*dpr)) cv.width=Math.round(w*dpr);
  if(cv.height!==Math.round(h*dpr)) cv.height=Math.round(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return {ctx,W:w,H:h};
}
let bubbleFrame=0;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function queueBubbles(){
  if(bubbleFrame) cancelAnimationFrame(bubbleFrame);
  bubbleFrame=requestAnimationFrame(now=>{ bubbleFrame=0; drawS0(now); });
}
function pauseBubbles(){
  S.s0.playing=false;
  if(bubbleFrame) cancelAnimationFrame(bubbleFrame);
  bubbleFrame=0;
  $('s0-play').textContent=t('play');
}
function drawCurve(cv, fn, cur, yMax, curLabel){
  const f=fit(cv); if(!f) return;
  const ctx=f.ctx, W=f.W, H=f.H;
  ctx.clearRect(0,0,W,H);
  const L=46,R=22,T=14,B=22, iw=W-L-R, ih=H-T-B;
  const X=v=>L+(v/100)*iw, Y=v=>T+ih-(v/yMax)*ih;
  ctx.strokeStyle='#2b3547'; ctx.fillStyle='#9aa7b8'; ctx.lineWidth=1; ctx.font='11px system-ui,sans-serif';
  for(let i=0;i<=4;i++){ const yv=yMax*i/4, yy=Y(yv); ctx.beginPath(); ctx.moveTo(L,yy); ctx.lineTo(W-R,yy); ctx.stroke(); ctx.fillText(fmt1(yv),8,yy+4); }
  for(let j=0;j<=4;j++){ const xv=j*25; ctx.fillText(String(xv),X(xv)-5,H-6); }
  ctx.strokeStyle='#6ee7ff'; ctx.lineWidth=2; ctx.beginPath();
  for(let v=0;v<=100;v+=2){ const px=X(v), py=Y(fn(v)); v===0?ctx.moveTo(px,py):ctx.lineTo(px,py); }
  ctx.stroke();
  const cx=X(cur), cy=Y(fn(cur));
  ctx.fillStyle='#ffb454'; ctx.beginPath(); ctx.arc(cx,cy,5,0,7); ctx.fill();
  ctx.fillText(curLabel, clamp(cx-14, L, W-70), Math.max(cy-10, 12));
}

/* ---------------- Step 0 ---------------- */
function drawS0(now){
  const cv=$('s0-canvas'); if(!cv) return;
  const f=fit(cv); if(!f){ pauseBubbles(); renderS0Readout(); return; }
  const ctx=f.ctx, W=f.W, H=f.H;
  ctx.clearRect(0,0,W,H);
  /* 水与光 */
  ctx.fillStyle='#0e2233'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,212,92,0.85)';
  ctx.beginPath(); ctx.arc(W-56,36,17,0,7); ctx.fill();
  ctx.strokeStyle='rgba(255,212,92,0.5)';
  for(let i=0;i<6;i++){ const a=i*Math.PI/3+0.4; ctx.beginPath(); ctx.moveTo(W-56+Math.cos(a)*22,36+Math.sin(a)*22); ctx.lineTo(W-56+Math.cos(a)*30,36+Math.sin(a)*30); ctx.stroke(); }
  /* 水草 */
  ctx.strokeStyle='#57c46a'; ctx.lineWidth=5; ctx.lineCap='round';
  const baseX=W/2, baseY=H-14;
  [[-70,-120],[-30,-170],[15,-145],[55,-185],[90,-110]].forEach(function(off){
    ctx.beginPath(); ctx.moveTo(baseX,baseY);
    ctx.quadraticCurveTo(baseX+off[0]*0.4, baseY+off[1]*0.6, baseX+off[0], baseY+off[1]); ctx.stroke();
  });
  ctx.lineWidth=1;
  /* 气泡 */
  const st=S.s0, previousCount=st.released;
  const dt=Math.min(0.1, Math.max(0, (now-(st.last||now))/1000));
  if(st.playing){
    const rate=photoRate(MODEL.S0_LIGHT,MODEL.S0_CO2), perSec=bubblesPerMin(rate)/60;
    st.spawnAcc += perSec*dt;
    while(st.spawnAcc>=1){ st.spawnAcc-=1; st.released++;
      st.bubbles.push({x:baseX+(Math.random()*140-70), y:baseY-30-Math.random()*120, r:2+Math.random()*3, vy:22+Math.random()*20}); }
  }
  st.last=now;
  st.bubbles=st.bubbles.filter(b=>b.y>-8);
  st.bubbles.forEach(b=>{ if(st.playing) b.y-=b.vy*dt;
    ctx.strokeStyle='rgba(160,220,255,0.9)'; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,7); ctx.stroke(); });
  if(st.released!==previousCount) renderS0Readout();
  if(st.playing) queueBubbles();
}

function renderS0Readout(){
  const st=S.s0;
  const box=$('s0-bet');
  if(box && !box.children.length){
    box.innerHTML=BET.options.map(function(opt){
      const cls=st.bet===opt?(opt===BET.answer?' correct':' wrong'):'';
      return '<button type="button" class="btn bet-opt'+cls+'" data-bet="'+opt+'">'+t('bet_'+opt)+'</button>';
    }).join('');
    box.querySelectorAll('[data-bet]').forEach(b=>b.onclick=()=>{ st.bet=b.dataset.bet; renderS0Readout(); });
  }
  box.querySelectorAll('[data-bet]').forEach(b=>{
    b.textContent=t('bet_'+b.dataset.bet);
    b.classList.toggle('correct',st.bet===b.dataset.bet && st.bet===BET.answer);
    b.classList.toggle('wrong',st.bet===b.dataset.bet && st.bet!==BET.answer);
  });
  const base=t('s0ro',{n:st.released, rate:bubblesPerMin(photoRate(MODEL.S0_LIGHT,MODEL.S0_CO2))});
  const tail=st.bet? t(st.bet===BET.answer?'s0betOk':'s0betNo',{bet:t('bet_'+st.bet)}) : t('s0betAsk');
  $('s0-ro').innerHTML=base+' '+tail;
}

/* ---------------- Step 1 ---------------- */
function render1(){
  const eq=$('equation');
  const SEPS={co2:'',h2o:' + ',light:' — ',sugar:' → ',o2:' + '};
  eq.innerHTML=['co2','h2o','light','sugar','o2'].map(function(id){
    return (SEPS[id]?'<span class="eq-sep">'+SEPS[id]+'</span>':'')+
      '<button type="button" class="eq-term'+(S.s1.term===id?' active':'')+'" data-term="'+id+'">'+t(TERMS[id].key)+'</button>';
  }).join('');
  eq.querySelectorAll('[data-term]').forEach(b=>b.onclick=()=>{ S.s1.term=b.dataset.term; render1(); });
  const l=atomTotals(['co2','h2o']), r=atomTotals(['sugar','o2']);
  $('ledger').innerHTML='<article class="ledger-card"><h3>'+t('ledgerT')+'</h3>'+
    '<p>'+t('ledgerC',{l:l.C,r:r.C})+' · '+t('ledgerH',{l:l.H,r:r.H})+' · '+t('ledgerO',{l:l.O,r:r.O})+'</p></article>'+
    '<article class="ledger-card active"><h3>'+t(TERMS[S.s1.term].key)+'</h3><p>'+t(TERMS[S.s1.term].src)+'</p></article>';
  $('s1-ro').innerHTML=t('s1ro');
}

/* ---------------- Step 2 / 3 ---------------- */
function render2(){
  const L=S.s2.light, rate=photoRate(L, MODEL.S2_CO2);
  $('lightValue').textContent=String(L);
  const fn=v=>photoRate(v, MODEL.S2_CO2);
  drawCurve($('s2-canvas'), fn, L, niceMax(fn), fmt1(rate));
  $('s2-ro').innerHTML=t('s2ro',{L:L, rate:fmt1(rate), bubbles:bubblesPerMin(rate), sat:t(isSaturated(L, MODEL.S2_CO2)?'s2satYes':'s2satNo', {C:MODEL.S2_CO2, cap:fmt1(co2Cap(MODEL.S2_CO2))})});
}
function render3(){
  const C=S.s3.co2, L=MODEL.S3_LIGHT, rate=photoRate(L,C);
  $('co2Value').textContent=String(C);
  const fn=v=>photoRate(L,v);
  drawCurve($('s3-canvas'), fn, C, niceMax(fn), fmt1(rate));
  const lim=limitingFactor(L,C);
  $('s3-ro').innerHTML=t('s3ro',{C:C, L:L, rate:fmt1(rate), lim:t(lim==='co2'?'limCO2':'limLight')})+
    '<br>'+t('s3conc');
}

/* ---------------- Step 4 ---------------- */
function renderQuiz(){
  ['q1','q2'].forEach(function(q){
    const box=$(q);
    box.innerHTML=['a','b','c'].map(function(opt){
      const chosen=S.s4[q]===opt;
      const mark=chosen?(judge(q,opt)?' correct':' wrong'):'';
      return '<button type="button" class="btn quiz-opt'+mark+'" data-q="'+q+'" data-opt="'+opt+'">'+t(q+opt)+'</button>';
    }).join('');
    box.querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>{ S.s4[q]=b.dataset.opt; renderQuiz(); });
    const ro=$(q+'ro');
    if(S.s4[q]){ const ok=judge(q,S.s4[q]); ro.innerHTML=t(q+(ok?'ok':'no')); ro.className='readout '+(ok?'success':'warn'); }
    else ro.textContent='';
  });
  const done=(S.s4.q1?1:0)+(S.s4.q2?1:0);
  const score=(judge('q1',S.s4.q1)?1:0)+(judge('q2',S.s4.q2)?1:0);
  $('s4-score').textContent=done? t('scoreTxt',{n:score}):'';
}

/* ---------------- 汇总 ---------------- */
function renderAll(){ pauseBubbles(); render1(); render2(); render3(); renderQuiz(); renderS0Readout(); queueBubbles(); }
function bind(){
  $('s0-play').onclick=()=>{ const st=S.s0; if(st.playing){ pauseBubbles(); return; } st.playing=true; $('s0-play').textContent=t('pause'); st.last=performance.now(); queueBubbles(); };
  $('s0-reset').onclick=()=>{ pauseBubbles(); S.s0.bubbles=[]; S.s0.released=0; S.s0.spawnAcc=0; S.s0.bet=null; renderS0Readout(); queueBubbles(); };
  $('lightRange').addEventListener('input',e=>{ S.s2.light=parseInt(e.target.value,10); render2(); });
  $('co2Range').addEventListener('input',e=>{ S.s3.co2=parseInt(e.target.value,10); render3(); });
  $('quizReset').onclick=()=>{ S.s4.q1=null; S.s4.q2=null; renderQuiz(); };
  if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting) document.querySelectorAll('.nav-step').forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+en.target.id)); }),{rootMargin:'-25% 0px -50% 0px'});
  document.querySelectorAll('.step').forEach(el=>io.observe(el));
  const visibility=new IntersectionObserver(es=>{ if(!es[0].isIntersecting) pauseBubbles(); });
  visibility.observe($('step0'));
  }
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) pauseBubbles(); });
  window.addEventListener('pagehide',pauseBubbles);
  // Reduced motion never autoplays; a learner may explicitly start or pause the experiment.
  if(reducedMotion.addEventListener) reducedMotion.addEventListener('change',pauseBubbles);
  let queued=false;
  window.addEventListener('resize',()=>{ if(!queued){ queued=true; requestAnimationFrame(()=>{ queued=false; render2(); render3(); if(!S.s0.playing) queueBubbles(); }); } });
}
onLangRefresh(renderAll);
bind();
applyLang(getLang());
window.PHOTOSYNTHESIS={MODEL,lightFactor,co2Factor,lightCap,co2Cap,niceMax,BET,photoRate,bubblesPerMin,isSaturated,limitingFactor,TERMS,atomTotals,ledgerBalanced,QUIZ,judge,state:S};

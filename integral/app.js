'use strict';
const $ = id => document.getElementById(id);
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const cyan='#6ee7ff', orange='#ffb454', pink='#ff7a93', muted='#9aa7b8', good='#7ee2a8';
/* 数字格式：最多 d 位小数、去掉尾随 0（读数与画布同源） */
function fmtN(v,d){ let s=v.toFixed(d===undefined?5:d); if(s.indexOf('.')>=0)s=s.replace(/0+$/,'').replace(/\.$/,''); return s==='-0'?'0':s; }

/* PURE-BEGIN —— 纯函数区（无 DOM 依赖，自查脚本抽取本区断言） */
/* 被积函数 f(x) = x²，区间 [0,1]，真值 1/3 */
function fSq(x){ return x*x; }
/* 黎曼和：把 [a,b] 等分 n 条，mode = left / mid / right 取高，逐条「高 × 宽」实算 */
function riemann(f,a,b,n,mode){
  const h=(b-a)/n; let s=0;
  for(let i=0;i<n;i++){
    const x = mode==='left' ? a+i*h : mode==='right' ? a+(i+1)*h : a+(i+0.5)*h;
    s += f(x)*h;
  }
  return s;
}
/* x² 在 [0,1] 的闭式公式（与逐条实算互为对账） */
function leftClosed(n){ return (n-1)*(2*n-1)/(6*n*n); }
function rightClosed(n){ return (n+1)*(2*n+1)/(6*n*n); }
function midClosed(n){ return ((n-1)*n*(2*n-1)/6 + n*(n-1)/2 + n/4)/(n*n*n); }
function closedFor(mode,n){ return mode==='left'?leftClosed(n):mode==='right'?rightClosed(n):midClosed(n); }
/* v = t 在 [0,2] 的闭式（左/右和；中点和对线性函数恒精确 = 2） */
function vtLeftClosed(n){ return 2*(n-1)/n; }
function vtRightClosed(n){ return 2*(n+1)/n; }
/* 第 0 步四种粗估的精确值（按定义算，不是页面读数倒推） */
function estValue(mode){
  if(mode==='right') return 1*fSq(1);            /* 宽 1 × 右端高 f(1) */
  if(mode==='left')  return 1*fSq(0);            /* 宽 1 × 左端高 f(0) */
  if(mode==='trap')  return (fSq(0)+fSq(1))/2*1; /* 梯形：两底平均 × 宽 */
  return 0.5*1*fSq(1);                           /* tri：底 × 高 ÷ 2 */
}
/* 原函数 A(x) = x³/3（解析精确值）；areaNumeric 是细条左和累加，只用于示意描线 */
function areaExact(x){ return x*x*x/3; }
function areaNumeric(x,N){
  if(x<=0) return 0;
  const n=N||400, h=x/n; let s=0;
  for(let i=0;i<n;i++) s+=fSq(i*h)*h;
  return s;
}
/* A 在 x 处的增长速度：对解析原函数多项式做中心差分（误差 O(h²)，端点同法、公式在端点外仍成立） */
function areaDeriv(x){
  const h=0.001;
  return (areaExact(x+h)-areaExact(x-h))/(2*h);
}
const TRUE13 = 1/3;
/* PURE-END */
const MODEKEY = { left:'modeL', mid:'modeM', right:'modeR' };
const ESTKEY = { right:'estRight', trap:'estTrap', tri:'estTri', left:'estLeft' };

const S = {
  s0:{ mode:'right' },
  s1:{ n:4, mode:'left' },
  s2:{ n:4, mode:'left' },
  s3:{ x:1 },
  s4:{ q1:null, q2:null, q3:null }
};
const QUIZ_OK = { q1:'2', q2:'b', q3:'false' };
function ro(id,text){ $(id).textContent=text; }
function fitCanvas(cv){
  const dpr=Math.min(window.devicePixelRatio||1,3);
  if(cv.dataset.cssH===undefined)cv.dataset.cssH=cv.getAttribute('height')||'360';
  cv.style.height=cv.dataset.cssH+'px';
  const w=cv.clientWidth,h=Number(cv.dataset.cssH);
  const bw=Math.max(2,Math.round(w*dpr)),bh=Math.max(2,Math.round(h*dpr));
  if(cv.width!==bw)cv.width=bw;if(cv.height!==bh)cv.height=bh;
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);cv._w=w;cv._h=h;return ctx;
}
function scene(id,w,h){ const cv=$(id),ctx=fitCanvas(cv);ctx.clearRect(0,0,cv._w,cv._h);const scale=Math.min(cv._w/w,cv._h/h);const ox=(cv._w-w*scale)/2,oy=(cv._h-h*scale)/2;ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);cv._view={w,h,scale,ox,oy};return ctx; }
function poly(ctx,pts,fill,stroke){ ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();} }
function line(ctx,a,b,color){ ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle=color||muted;ctx.lineWidth=1.5;ctx.stroke(); }
function text(ctx,str,x,y,color,size){ ctx.font=(size||13)+'px system-ui,sans-serif';ctx.fillStyle=color||muted;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(str,x,y); }
function dot(ctx,p,color,r){ ctx.beginPath();ctx.arc(p[0],p[1],r||5,0,2*Math.PI);ctx.fillStyle=color||orange;ctx.fill(); }
/* 世界坐标 → 逻辑像素坐标的映射 */
function view(W,H,x0,x1,y0,y1){ return { W,H, X:x=>(x-x0)/(x1-x0)*W, Y:y=>H-(y-y0)/(y1-y0)*H, wx:px=>x0+(px/W)*(x1-x0) }; }
function axes(ctx,V,xTicks,yTicks,xName,yName){
  line(ctx,[V.X(V.x0v),V.Y(0)],[V.X(V.x1v),V.Y(0)],'#455568');
  line(ctx,[V.X(0),V.Y(V.y0v)],[V.X(0),V.Y(V.y1v)],'#455568');
  xTicks.forEach(v=>{ line(ctx,[V.X(v),V.Y(0)-4],[V.X(v),V.Y(0)+4],'#455568'); text(ctx,fmtN(v,2),V.X(v),V.Y(0)+15,muted,11); });
  yTicks.forEach(v=>{ line(ctx,[V.X(0)-4,V.Y(v)],[V.X(0)+4,V.Y(v)],'#455568'); text(ctx,fmtN(v,2),V.X(0)-16,V.Y(v),muted,11); });
  text(ctx,xName,V.X(V.x1v)-8,V.Y(0)+15,muted,12);
  text(ctx,yName,V.X(0)+14,V.Y(V.y1v)+6,muted,12);
}
function curvePts(V,f,a,b,n){ const pts=[]; for(let i=0;i<=n;i++){ const x=a+(b-a)*i/n; pts.push([V.X(x),V.Y(f(x))]); } return pts; }
function strokePts(ctx,pts,color,width){ ctx.beginPath(); pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.strokeStyle=color; ctx.lineWidth=width||2; ctx.stroke(); }
function shadeUnder(ctx,V,f,a,b,color){ const pts=curvePts(V,f,a,b,60); ctx.beginPath(); ctx.moveTo(V.X(a),V.Y(0)); pts.forEach(p=>ctx.lineTo(p[0],p[1])); ctx.lineTo(V.X(b),V.Y(0)); ctx.closePath(); ctx.fillStyle=color; ctx.fill(); }
function drawRects(ctx,V,f,a,b,n,mode){
  const h=(b-a)/n;
  for(let i=0;i<n;i++){
    const xl=a+i*h, sx = mode==='left'?xl : mode==='right'?xl+h : xl+h/2, hh=f(sx);
    poly(ctx,[[V.X(xl),V.Y(0)],[V.X(xl+h),V.Y(0)],[V.X(xl+h),V.Y(hh)],[V.X(xl),V.Y(hh)]],'rgba(255,180,84,0.20)',orange);
  }
}

/* ---------- 第 0 步：曲边面积没公式 ---------- */
const V01 = () => { const v=view(340,330,-0.22,1.3,-0.22,1.3); v.x0v=-0.22; v.x1v=1.3; v.y0v=-0.22; v.y1v=1.3; return v; };
function render0(){
  const s=S.s0, ctx=scene('s0-canvas',340,330), V=V01();
  shadeUnder(ctx,V,fSq,0,1,'rgba(110,231,255,0.13)');
  if(s.mode==='right'){ poly(ctx,[[V.X(0),V.Y(0)],[V.X(1),V.Y(0)],[V.X(1),V.Y(1)],[V.X(0),V.Y(1)]],'rgba(255,180,84,0.20)',orange); }
  if(s.mode==='left'){ ctx.save(); ctx.strokeStyle=orange; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(V.X(0),V.Y(0)); ctx.lineTo(V.X(1),V.Y(0)); ctx.stroke(); ctx.restore(); dot(ctx,[V.X(0),V.Y(0)],orange,5); text(ctx,'0',V.X(0.5),V.Y(0)+26,orange,13); }
  if(s.mode==='trap'){ poly(ctx,[[V.X(0),V.Y(0)],[V.X(1),V.Y(0)],[V.X(1),V.Y(1)]],'rgba(255,122,147,0.20)',pink); line(ctx,[V.X(0),V.Y(0)],[V.X(1),V.Y(1)],pink); }
  if(s.mode==='tri'){ poly(ctx,[[V.X(0),V.Y(0)],[V.X(1),V.Y(0)],[V.X(1),V.Y(1)]],'rgba(126,226,168,0.20)',good); line(ctx,[V.X(0),V.Y(0)],[V.X(1),V.Y(1)],good); line(ctx,[V.X(1),V.Y(0)],[V.X(1),V.Y(1)],good); }
  axes(ctx,V,[0.5,1],[0.5,1],'x','y');
  strokePts(ctx,curvePts(V,fSq,0,1,60),cyan,2.5);
  text(ctx,'y = x²',V.X(0.86),V.Y(1.12),cyan,14);
  ctx.restore();
  document.querySelectorAll('[data-est]').forEach(b=>{ const on=b.dataset.est===s.mode; b.classList.toggle('active',on); b.setAttribute('aria-pressed',String(on)); });
  ro('s0-readout',t('s0ro',{name:t(ESTKEY[s.mode]),v:fmtN(estValue(s.mode))}));
  ro('s0-note',t('s0note'));
}

/* ---------- 第 1 步：黎曼和 ---------- */
function render1(){
  const s=S.s1, ctx=scene('s1-canvas',340,330), V=V01();
  shadeUnder(ctx,V,fSq,0,1,'rgba(110,231,255,0.10)');
  drawRects(ctx,V,fSq,0,1,s.n,s.mode);
  axes(ctx,V,[0.5,1],[0.5,1],'x','y');
  strokePts(ctx,curvePts(V,fSq,0,1,60),cyan,2.5);
  text(ctx,'y = x²',V.X(0.86),V.Y(1.12),cyan,14);
  ctx.restore();
  const sum=riemann(fSq,0,1,s.n,s.mode), closed=closedFor(s.mode,s.n);
  const L=riemann(fSq,0,1,s.n,'left'), R=riemann(fSq,0,1,s.n,'right');
  $('s1-nval').textContent='n = '+s.n;
  document.querySelectorAll('#step1 [data-mode]').forEach(b=>{ const on=b.dataset.mode===s.mode; b.classList.toggle('active',on); b.setAttribute('aria-pressed',String(on)); });
  ro('s1-readout',t('s1ro',{n:s.n,mode:t(MODEKEY[s.mode]),sum:fmtN(sum),closed:fmtN(closed)}));
  ro('s1-note',(s.n===1&&s.mode==='left')?t('s1zero'):'');
  ro('s1-bracket-ro',t('s1bracket',{L:fmtN(L),R:fmtN(R),gap:fmtN(R-L)}));
  renderBracket(L,R);
}
function renderBracket(L,R){
  const ctx=scene('s1-bracket',340,110), W=340;
  const X=v=>26+(v-(-0.03))/(1.06-(-0.03))*(W-52);
  line(ctx,[X(-0.03),62],[X(1.06),62],'#455568');
  [0,0.5,1].forEach(v=>{ line(ctx,[X(v),58],[X(v),66],'#455568'); text(ctx,fmtN(v,1),X(v),80,muted,11); });
  ctx.save(); ctx.fillStyle='rgba(110,231,255,0.30)'; ctx.fillRect(X(L),34,X(R)-X(L),20); ctx.restore();
  line(ctx,[X(L),30],[X(L),58],cyan); line(ctx,[X(R),30],[X(R),58],cyan);
  dot(ctx,[X(TRUE13),44],orange,6);
  /* L 标签向左伸、R 标签向右伸，避免缝变窄时两标签黏连 */
  ctx.save(); ctx.font='12px system-ui,sans-serif'; ctx.fillStyle=cyan; ctx.textBaseline='middle';
  ctx.textAlign='right'; ctx.fillText('L = '+fmtN(L), Math.max(X(L)-6,34), 18);
  ctx.textAlign='left'; ctx.fillText('R = '+fmtN(R), Math.min(X(R)+6,W-58), 18);
  ctx.restore();
  text(ctx,'1/3',X(TRUE13),76,orange,12);
  ctx.restore();
}

/* ---------- 第 2 步：v-t 情境 ---------- */
function render2(){
  const s=S.s2, ctx=scene('s2-canvas',340,330);
  const V=view(340,330,-0.3,2.4,-0.3,2.4); V.x0v=-0.3; V.x1v=2.4; V.y0v=-0.3; V.y1v=2.4;
  const fv=x=>x;
  shadeUnder(ctx,V,fv,0,2,'rgba(110,231,255,0.10)');
  drawRects(ctx,V,fv,0,2,s.n,s.mode);
  axes(ctx,V,[1,2],[1,2],'t','v');
  strokePts(ctx,curvePts(V,fv,0,2,40),cyan,2.5);
  text(ctx,'v = t',V.X(1.7),V.Y(2.05),cyan,14);
  ctx.restore();
  const sum=riemann(fv,0,2,s.n,s.mode);
  $('s2-nval').textContent='n = '+s.n;
  document.querySelectorAll('#step2 [data-mode]').forEach(b=>{ const on=b.dataset.mode===s.mode; b.classList.toggle('active',on); b.setAttribute('aria-pressed',String(on)); });
  ro('s2-readout',t('s2ro',{n:s.n,mode:t(MODEKEY[s.mode]),sum:fmtN(sum)}));
}

/* ---------- 第 3 步：面积函数 A(x) ---------- */
function render3(){
  const s=S.s3, x=s.x;
  let ctx=scene('s3-canvasA',320,280);
  const VA=view(320,280,-0.15,1.18,-0.15,1.18); VA.x0v=-0.15; VA.x1v=1.18; VA.y0v=-0.15; VA.y1v=1.18;
  if(x>0) shadeUnder(ctx,VA,fSq,0,x,'rgba(255,180,84,0.30)');
  axes(ctx,VA,[0.5,1],[0.5,1],'x','y');
  strokePts(ctx,curvePts(VA,fSq,0,1,60),cyan,2.5);
  if(x>0){ ctx.save(); ctx.setLineDash([5,4]); line(ctx,[VA.X(x),VA.Y(0)],[VA.X(x),VA.Y(fSq(x))],orange); ctx.restore(); dot(ctx,[VA.X(x),VA.Y(fSq(x))],orange,5); }
  text(ctx,'y = x²',VA.X(0.82),VA.Y(1.08),cyan,13);
  ctx.restore();
  ctx=scene('s3-canvasB',320,280);
  const VB=view(320,280,-0.1,1.15,-0.045,0.42); VB.x0v=-0.1; VB.x1v=1.15; VB.y0v=-0.045; VB.y1v=0.42;
  axes(ctx,VB,[0.5,1],[0.1,0.2,0.3],'x','A');
  const pts=[]; for(let i=0;i<=50;i++){ const u=i/50; pts.push([VB.X(u),VB.Y(areaNumeric(u,400))]); }
  strokePts(ctx,pts,cyan,2.5);
  dot(ctx,[VB.X(x),VB.Y(areaNumeric(x,400))],orange,5);
  text(ctx,'A(x)',VB.X(0.86),VB.Y(0.40),cyan,13);
  ctx.restore();
  $('s3-xval').textContent='x = '+fmtN(x,2);
  ro('s3-readoutA',t('s3roA',{x:fmtN(x,2),A:fmtN(areaExact(x))}));
  ro('s3-readoutB',t('s3roB',{Ap:fmtN(areaDeriv(x),4),f:fmtN(fSq(x),4)}));
}

/* ---------- 第 4 步：自测 ---------- */
function render4(){
  const s=S.s4; let n=0,k=0;
  for(const q of ['q1','q2','q3']){
    const pick=s[q], okk=pick!==null&&pick===QUIZ_OK[q];
    if(pick!==null){ n++; if(okk)k++; }
    ro('s4-'+q+'-fb', pick===null?'':t(q+(okk?'ok':'no')));
    document.querySelectorAll('[data-q="'+q+'"]').forEach(b=>{ const on=b.dataset.v===pick; b.classList.toggle('active',on); b.setAttribute('aria-pressed',String(on)); });
  }
  ro('s4-score',t('score',{n,k}));
}

function badges(){ for(const [el,arr,id] of [['categoryBadge',window.KNOWLEDGE_CATEGORIES,'math'],['stageBadge',window.KNOWLEDGE_STAGES,'senior']]){ const item=(arr||[]).find(x=>x.id===id); if(item)$(el).textContent=item.name[getLang()]; } }
function renderAll(){ badges(); render0(); render1(); render2(); render3(); render4(); }
function dragS3(){
  const cv=$('s3-canvasA'); cv.classList.add('dragc'); let pointer=null;
  const VA=view(320,280,-0.15,1.18,-0.15,1.18);
  function move(e){ if(e.pointerId!==pointer)return; const r=cv.getBoundingClientRect(),v=cv._view; const lx=(e.clientX-r.left-v.ox)/v.scale; S.s3.x=clamp(Math.round(VA.wx(lx)*100)/100,0,1); $('s3-x').value=S.s3.x; render3(); }
  cv.addEventListener('pointerdown',e=>{ pointer=e.pointerId; cv.setPointerCapture(pointer); move(e); });
  cv.addEventListener('pointermove',move);
  for(const type of ['pointerup','pointercancel','lostpointercapture']) cv.addEventListener(type,()=>pointer=null);
}
function bind(){
  document.querySelectorAll('[data-est]').forEach(b=>b.onclick=()=>{ S.s0.mode=b.dataset.est; render0(); });
  $('s1-n').oninput=e=>{ S.s1.n=Math.pow(2,Number(e.target.value)); render1(); };
  document.querySelectorAll('#step1 [data-mode]').forEach(b=>b.onclick=()=>{ S.s1.mode=b.dataset.mode; render1(); });
  $('s1-reset').onclick=()=>{ S.s1={n:4,mode:'left'}; $('s1-n').value=2; render1(); };
  $('s2-n').oninput=e=>{ S.s2.n=Math.pow(2,Number(e.target.value)); render2(); };
  document.querySelectorAll('#step2 [data-mode]').forEach(b=>b.onclick=()=>{ S.s2.mode=b.dataset.mode; render2(); });
  $('s2-reset').onclick=()=>{ S.s2={n:4,mode:'left'}; $('s2-n').value=2; render2(); };
  $('s3-x').oninput=e=>{ S.s3.x=Number(e.target.value); render3(); };
  $('s3-reset').onclick=()=>{ S.s3={x:1}; $('s3-x').value=1; render3(); };
  document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ S.s4[b.dataset.q]=b.dataset.v; render4(); });
  $('s4-reset').onclick=()=>{ S.s4={q1:null,q2:null,q3:null}; render4(); };
  const observer=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting)document.querySelectorAll('.nav-step').forEach(a=>{ const active=a.dataset.nav===e.target.dataset.step; a.classList.toggle('active',active); if(active)a.setAttribute('aria-current','step'); else a.removeAttribute('aria-current'); }); }),{rootMargin:'-25% 0px -50% 0px'});
  document.querySelectorAll('.step').forEach(el=>observer.observe(el));
  let queued=false; window.addEventListener('resize',()=>{ if(!queued){ queued=true; requestAnimationFrame(()=>{ queued=false; renderAll(); }); } });
}
onLangRefresh(renderAll); bind(); dragS3(); applyLang(getLang());
// 只读检查面：供独立评审复算（UI 仍是唯一的状态修改路径）
window.INTEGRAL={ get state(){ return JSON.parse(JSON.stringify(S)); }, fSq, riemann, leftClosed, rightClosed, midClosed, closedFor, vtLeftClosed, vtRightClosed, estValue, areaExact, areaNumeric, areaDeriv, TRUE13 };

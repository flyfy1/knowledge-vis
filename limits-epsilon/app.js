/* shared runtime: canvas fit, nav, loop, quiz. Page model + drawing follow. */
const $=function(id){return document.getElementById(id)};
const C={bg:'#0a0e14',panel:'#161b22',line:'#2b3547',text:'#e8edf4',muted:'#9aa7b8',acc:'#6ee7ff',acc2:'#ffb454',acc3:'#ff7a93',good:'#7ee2a8',vio:'#b49cff'};
const DRAW={},TICK={},VIS={};
const REDUCE=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function fit(cv){const w=Math.max(160,Math.floor(cv.clientWidth)),h=+cv.dataset.h||300,d=Math.min(window.devicePixelRatio||1,3);cv.style.height=h+'px';const bw=Math.round(w*d),bh=Math.round(h*d);if(cv.width!==bw)cv.width=bw;if(cv.height!==bh)cv.height=bh;const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return{x:x,w:w,h:h}}
function redraw(i){const cv=$('s'+i+'-canvas');if(!cv||!DRAW[i])return;const f=fit(cv);f.x.clearRect(0,0,f.w,f.h);DRAW[i](f.x,f.w,f.h)}
function redrawAll(){for(const i in DRAW)redraw(i)}
function txt(x,s,px,py,col,size,al){x.fillStyle=col||C.text;x.font=(size||13)+'px system-ui,sans-serif';x.textAlign=al||'left';x.fillText(s,px,py)}
function line(x,x1,y1,x2,y2,col,lw){x.strokeStyle=col;x.lineWidth=lw||1;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke()}
function dot(x,px,py,r,col){x.fillStyle=col;x.beginPath();x.arc(px,py,r,0,6.2832);x.fill()}
function arrow(x,x1,y1,x2,y2,col,lw){line(x,x1,y1,x2,y2,col,lw||2);const a=Math.atan2(y2-y1,x2-x1),s=7;x.fillStyle=col;x.beginPath();x.moveTo(x2,y2);x.lineTo(x2-s*Math.cos(a-0.45),y2-s*Math.sin(a-0.45));x.lineTo(x2-s*Math.cos(a+0.45),y2-s*Math.sin(a+0.45));x.closePath();x.fill()}
function ro(id,html){const e=$(id);if(e)e.innerHTML=html}
function fx(v,n){return (+v).toFixed(n===undefined?2:n)}
const FMT={};
function slider(id,fmt,cb){const e=$(id);FMT[id]=function(){$(id+'-v').textContent=fmt(+e.value)};FMT[id]();e.addEventListener('input',function(){FMT[id]();cb(+e.value)})}
function btn(id,cb){$(id).addEventListener('click',cb)}
let _raf=0,_last=0;
function loop(ts){_raf=0;const dt=Math.min(0.05,(ts-_last)/1000||0);_last=ts;let any=false;for(const i in TICK){if(VIS[i]&&TICK[i](dt))any=true}if(any&&!document.hidden)_raf=requestAnimationFrame(loop)}
function kick(){if(!_raf&&!document.hidden){_last=performance.now();_raf=requestAnimationFrame(loop)}}
let QUIZ={ans:-1,pick:-1,step:0};
function renderQuiz(){const e=$('q-ro');if(!e)return;if(QUIZ.pick<0){e.textContent='';return}const ok=QUIZ.pick===QUIZ.ans;e.className='readout'+(ok?' ok':'');e.textContent=(ok?t('qRight')+' '+t('qwhy'):t('qWrong',{n:QUIZ.step}))}
function bootCommon(page){
  applyLang(getLang());
  document.querySelectorAll('#langToggle button').forEach(function(b){b.addEventListener('click',function(){applyLang(b.dataset.lang);FMT_ALL();renderQuiz();page.render()})});
  const secs=[].slice.call(document.querySelectorAll('.step')),links=[].slice.call(document.querySelectorAll('.step-nav a'));
  function onScroll(){let cur=0;for(let i=0;i<secs.length;i++){if(secs[i].getBoundingClientRect().top<innerHeight*0.4)cur=i}links.forEach(function(a,i){a.classList.toggle('active',i===cur);if(i===cur)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')})}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(typeof IntersectionObserver!=='undefined'){const io=new IntersectionObserver(function(es){es.forEach(function(e){VIS[e.target.dataset.step]=e.isIntersecting;if(e.isIntersecting)kick()})},{threshold:0.05});secs.forEach(function(s){io.observe(s)})}else secs.forEach(function(s){VIS[s.dataset.step]=true});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)kick()});
  let rt=0;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(redrawAll,60)});
  document.querySelectorAll('[data-q-opt]').forEach(function(b){b.addEventListener('click',function(){QUIZ.pick=+b.dataset.qOpt;renderQuiz()})});
  page.init();page.render();
}
function FMT_ALL(){for(const k in FMT)FMT[k]()}

/* Limits: epsilon-delta checks by dense sampling, bisection for the best delta. */
const MODEL={
  F:{lin:{f:x=>3*x+1,a:2,L:7},sq:{f:x=>x*x,a:2,L:4},inv:{f:x=>1/x,a:1,L:1}},
  G:{hole:{f:x=>(x*x-1)/(x-1),a:1,L:2,c:2},sinc:{f:x=>Math.sin(x)/x,a:0,L:1,c:1},jump:{f:x=>Math.abs(x)/x,a:0,L:null,c:0},osc:{f:x=>Math.sin(1/x),a:0,L:null,c:0},blow:{f:x=>1/(x*x),a:0,L:null,c:0}},
  dev(f,a,L,d,n){let m=0;n=n||2000;for(let i=1;i<=n;i++){const h=d*i/n;m=Math.max(m,Math.abs(f(a-h)-L),Math.abs(f(a+h)-L))}return m},
  best(f,a,L,eps,dmax){dmax=dmax||3;let lo=0,hi=dmax;if(MODEL.dev(f,a,L,hi)<=eps)return hi;for(let i=0;i<50;i++){const m=(lo+hi)/2;if(MODEL.dev(f,a,L,m)<=eps)lo=m;else hi=m}return lo},
  bestSq(a,eps){return Math.sqrt(a*a+eps)-a},
  seq:{inv:n=>1/n,alt:n=>(n%2?-1:1)/n,nol:n=>(n%2?-1:1)},
  findN(s,L,eps,M){let last=0;for(let n=1;n<=M;n++)if(Math.abs(s(n)-L)>=eps)last=n;return last>=M-50?null:last},
  sweep(f,eps){let c=0,t=0;for(let L=-3;L<=3.0001;L+=0.01){t++;if(MODEL.best(f,0,L,eps,0.5)>1e-3)c++}return{n:t,pass:c}}
};
const S={g0:'hole',k0:0.6,f1:'lin',eps1:0.5,d1:0.3,a2:1,e2:0.5,g3:'jump',L3:0,e4:0.2,s4:'inv'};
const GK0={hole:'gHole',sinc:'gSinc',jump:'gJump',osc:'gOsc',blow:'gBlow'};
function axes(x,p){x.strokeStyle=C.line;x.lineWidth=1;x.strokeRect(p.x,p.y,p.w,p.h)}
function pr(w,h){return{x:44,y:14,w:w-60,h:h-48}}
function curveSeg(x,p,f,a,x0,x1,Y,col,lw,xmap,skipNear){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();let on=false;const n=600;for(let i=0;i<=n;i++){const xv=x0+(x1-x0)*i/n;if(skipNear&&Math.abs(xv-a)<1e-9){on=false;continue}const v=f(xv);if(!isFinite(v)){on=false;continue}const py=Y(v),px=xmap(xv);if(py<p.y-4000||py>p.y+p.h+4000){on=false;continue}if(on)x.lineTo(px,py);else{x.moveTo(px,py);on=true}}x.stroke()}
DRAW[0]=function(x,w,h){const p=pr(w,h),g=MODEL.G[S.g0],d=Math.pow(10,-S.k0),a=g.a,y0=g.c,Y=v=>p.y+p.h*(1-(v-(y0-2.5))/5),X=xv=>p.x+p.w*(xv-(a-d))/(2*d);axes(x,p);txt(x,'f(x)',p.x+4,p.y+13,C.muted,12);txt(x,'x',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  if(g.L!==null){x.setLineDash([4,4]);line(x,p.x,Y(g.L),p.x+p.w,Y(g.L),C.good,1.5);x.setLineDash([])}else line(x,p.x,Y(y0),p.x+p.w,Y(y0),'rgba(255,255,255,.12)',1);
  const xs=[];for(let i=0;i<=900;i++)xs.push(a-d+2*d*i/900);x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();let on=false;for(const xv of xs){if(Math.abs(xv-a)<d*1e-4){on=false;continue}const v=g.f(xv);if(!isFinite(v)||Math.abs(v-y0)>40){on=false;continue}const px=X(xv),py=Y(v);if(on)x.lineTo(px,py);else{x.moveTo(px,py);on=true}}x.stroke();
  if(g.L!==null){x.strokeStyle=C.acc;x.lineWidth=2;x.beginPath();x.arc(X(a),Y(g.L),5,0,6.2832);x.stroke()}else{x.strokeStyle=C.acc;x.lineWidth=2;x.beginPath();x.arc(X(a),Y(y0),5,0,6.2832);x.stroke()}line(x,X(a),p.y,X(a),p.y+p.h,'rgba(110,231,255,.25)',1);dot(x,X(a-d),Y(g.f(a-d)),4,C.acc3);dot(x,X(a+d),Y(g.f(a+d)),4,C.acc3)};
function fmtV(v){return isFinite(v)?(Math.abs(v)>=1e6?v.toExponential(2):fx(v,6)):'∞'}
function r0(){const g=MODEL.G[S.g0],d=Math.pow(10,-S.k0),a=g.a,fl=g.f(a-d),fr=g.f(a+d),range=(()=>{let mn=1e9,mx=-1e9;for(let i=1;i<=500;i++){const h=d*i/500;[g.f(a-h),g.f(a+h)].forEach(v=>{if(isFinite(v)){mn=Math.min(mn,v);mx=Math.max(mx,v)}})}return mx-mn})();let verdict;if(range<0.05)verdict=t('vLim',{L:fx((fl+fr)/2,3)});else if(d<=0.011&&range>0.3)verdict=t('vNo');else verdict=t('vMid');ro('s0-ro',t('r0',{fl:fmtV(fl),fr:fmtV(fr),d:d.toExponential(1),range:fmtV(range),verdict:verdict}))}
DRAW[1]=function(x,w,h){const p=pr(w,h),F=MODEL.F[S.f1],a=F.a,L=F.L,X0=a-2,X1=a+2,ymid=L,Y=v=>p.y+p.h*(1-(v-(ymid-4))/8),X=xv=>p.x+p.w*(xv-X0)/(X1-X0);axes(x,p);
  x.fillStyle='rgba(255,180,84,.2)';x.fillRect(p.x,Y(L+S.eps1),p.w,Y(L-S.eps1)-Y(L+S.eps1));x.fillStyle='rgba(110,231,255,.1)';x.fillRect(X(a-S.d1),p.y,X(a+S.d1)-X(a-S.d1),p.h);
  curveSeg(x,p,F.f,a,X0,X1,Y,C.acc,2.5,X,true);
  x.strokeStyle=C.acc3;x.lineWidth=4;x.beginPath();let on=false;const n=400;for(let i=0;i<=n;i++){const xv=a-S.d1+2*S.d1*i/n;if(Math.abs(xv-a)<1e-9){on=false;continue}const v=F.f(xv);if(Math.abs(v-L)>S.eps1&&isFinite(v)){const px=X(xv),py=Y(v);if(py>p.y-50&&py<p.y+p.h+50){if(on)x.lineTo(px,py);else{x.moveTo(px,py);on=true}}else on=false}else on=false}x.stroke();dot(x,X(a),Y(L),4,C.good)};
function r1(){const F=MODEL.F[S.f1],dev=MODEL.dev(F.f,F.a,F.L,S.d1),best=MODEL.best(F.f,F.a,F.L,S.eps1);ro('s1-ro',t('r1',{fn:t({lin:'fLin',sq:'fSq',inv:'fInv'}[S.f1]),L:F.L,eps:fx(S.eps1,2),d:fx(S.d1,2),dev:fmtV(dev),res:dev<=S.eps1?t('ok'):t('bad'),best:fx(best,3)}))}
DRAW[2]=function(x,w,h){const narrow=w<520,p1=narrow?{x:44,y:14,w:w-60,h:h*0.5-30}:{x:44,y:14,w:w*0.5-56,h:h-48},p2=narrow?{x:44,y:h*0.5+14,w:w-60,h:h*0.5-38}:{x:w*0.5+36,y:14,w:w*0.5-52,h:h-48};
  axes(x,p1);txt(x,'δ',p1.x+4,p1.y+13,C.muted,12);txt(x,'ε',p1.x+p1.w-4,p1.y+p1.h+14,C.muted,12,'right');const dm=MODEL.bestSq(0.5,2),Y1=v=>p1.y+p1.h*(1-v/dm),X1=e=>p1.x+p1.w*e/2;x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();for(let i=0;i<=100;i++){const e=2*i/100,v=MODEL.bestSq(S.a2,e);i?x.lineTo(X1(e),Y1(v)):x.moveTo(X1(e),Y1(v))}x.stroke();x.setLineDash([4,4]);x.strokeStyle=C.muted;x.beginPath();x.moveTo(X1(0),Y1(0));x.lineTo(X1(2),Y1(2/(2*S.a2)));x.stroke();x.setLineDash([]);dot(x,X1(S.e2),Y1(MODEL.bestSq(S.a2,S.e2)),6,C.acc);
  axes(x,p2);txt(x,'δ',p2.x+4,p2.y+13,C.muted,12);txt(x,'a',p2.x+p2.w-4,p2.y+p2.h+14,C.muted,12,'right');const dm2=MODEL.bestSq(0.5,S.e2),Y2=v=>p2.y+p2.h*(1-v/dm2),X2=a=>p2.x+p2.w*(a-0.5)/4.5;x.strokeStyle=C.acc;x.lineWidth=2.5;x.beginPath();for(let i=0;i<=100;i++){const a=0.5+4.5*i/100,v=MODEL.bestSq(a,S.e2);i?x.lineTo(X2(a),Y2(v)):x.moveTo(X2(a),Y2(v))}x.stroke();dot(x,X2(S.a2),Y2(MODEL.bestSq(S.a2,S.e2)),6,C.acc2)};
function r2(){const d=MODEL.bestSq(S.a2,S.e2);ro('s2-ro',t('r2',{a:fx(S.a2,1),eps:fx(S.e2,2),d:fx(d,4),ap:fx(S.e2/(2*S.a2),4),sl:fx(2*S.a2,1)}))}
DRAW[3]=function(x,w,h){const p=pr(w,h),g=MODEL.G[S.g3],X0=-1,X1=1,Y=v=>p.y+p.h*(1-(v+3.5)/7),X=xv=>p.x+p.w*(xv-X0)/(X1-X0);axes(x,p);x.fillStyle='rgba(255,180,84,.2)';x.fillRect(p.x,Y(S.L3+0.5),p.w,Y(S.L3-0.5)-Y(S.L3+0.5));
  x.strokeStyle=C.acc;x.lineWidth=2.5;x.beginPath();let on=false;for(let i=0;i<=2000;i++){const xv=-1+2*i/2000;if(Math.abs(xv)<1e-4){on=false;continue}const v=g.f(xv);if(!isFinite(v)||Math.abs(v)>3.4){on=false;continue}const px=X(xv),py=Y(v);if(on)x.lineTo(px,py);else{x.moveTo(px,py);on=true}}x.stroke();line(x,X(0),p.y,X(0),p.y+p.h,'rgba(110,231,255,.25)',1)};
function r3(){const g=MODEL.G[S.g3],b=MODEL.best(g.f,0,S.L3,0.5,0.5),sw=MODEL.sweep(g.f,0.5);ro('s3-ro',t('r3',{fn:t(GK0[S.g3]),L:fx(S.L3,1),res:b>1e-3?t('hasDelta',{d:fx(b,3)}):t('noDelta'),n:sw.n,pass:sw.pass}))}
DRAW[4]=function(x,w,h){const p=pr(w,h),s=MODEL.seq[S.s4],X=n=>p.x+p.w*(n-0.5)/40,Y=v=>p.y+p.h*(1-(v+1.2)/2.4);axes(x,p);x.fillStyle='rgba(255,180,84,.2)';x.fillRect(p.x,Y(S.e4),p.w,Y(-S.e4)-Y(S.e4));for(let n=1;n<=40;n++)dot(x,X(n),Y(s(n)),3.5,Math.abs(s(n))<S.e4?C.acc:C.acc3);const N=MODEL.findN(s,0,S.e4,20000);if(N!==null&&N<40){line(x,X(N+0.5),p.y,X(N+0.5),p.y+p.h,C.good,1.5)}txt(x,'n',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right')};
function r4(){const s=MODEL.seq[S.s4],N=MODEL.findN(s,0,S.e4,20000);ro('s4-ro',t('r4',{sn:t({inv:'sInv',alt:'sAlt',nol:'sNoLim'}[S.s4]),eps:fx(S.e4,2),res:N===null?t('nNone'):t('nFound',{N:N,N1:N+1})}))}
function setBtn(ids,on){ids.forEach(i=>$(i).classList.toggle('active',i===on))}
function init(){
  slider('s0-k',v=>fx(v,1),v=>{S.k0=v;redraw(0);r0()});[['hole','s0-g1'],['sinc','s0-g2'],['jump','s0-g3'],['osc','s0-g4']].forEach(([k,id])=>btn(id,()=>{S.g0=k;setBtn(['s0-g1','s0-g2','s0-g3','s0-g4'],id);redraw(0);r0()}));
  slider('s1-e',v=>fx(v,2),v=>{S.eps1=v;redraw(1);r1()});slider('s1-d',v=>fx(v,2),v=>{S.d1=v;redraw(1);r1()});[['lin','s1-lin'],['sq','s1-sq'],['inv','s1-inv']].forEach(([k,id])=>btn(id,()=>{S.f1=k;setBtn(['s1-lin','s1-sq','s1-inv'],id);redraw(1);r1()}));btn('s1-best',()=>{const F=MODEL.F[S.f1];S.d1=Math.min(1.5,Math.max(0.01,Math.floor(MODEL.best(F.f,F.a,F.L,S.eps1)*100)/100));$('s1-d').value=S.d1;FMT['s1-d']();redraw(1);r1()});
  slider('s2-a',v=>fx(v,1),v=>{S.a2=v;redraw(2);r2()});slider('s2-e',v=>fx(v,2),v=>{S.e2=v;redraw(2);r2()});
  slider('s3-l',v=>fx(v,1),v=>{S.L3=v;redraw(3);r3()});[['jump','s3-jump'],['osc','s3-osc'],['blow','s3-blow']].forEach(([k,id])=>btn(id,()=>{S.g3=k;setBtn(['s3-jump','s3-osc','s3-blow'],id);redraw(3);r3()}));
  slider('s4-e',v=>fx(v,2),v=>{S.e4=v;redraw(4);r4()});[['inv','s4-a'],['alt','s4-b'],['nol','s4-c']].forEach(([k,id])=>btn(id,()=>{S.s4=k;setBtn(['s4-a','s4-b','s4-c'],id);redraw(4);r4()}));
  setBtn(['s0-g1','s0-g2','s0-g3','s0-g4'],'s0-g1');setBtn(['s1-lin','s1-sq','s1-inv'],'s1-lin');setBtn(['s3-jump','s3-osc','s3-blow'],'s3-jump');setBtn(['s4-a','s4-b','s4-c'],'s4-a')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

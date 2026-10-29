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

/* Enzymes: lock-and-key collisions, Michaelis-Menten, temperature x denaturation, pH ionisation, inhibitors. */
const MODEL={
  W:400,H:240,
  P:{match:1,near:0.15,miss:0},
  rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}},
  makeSim(seed){const r=MODEL.rng(seed),subs=[];for(let i=0;i<16;i++)subs.push({x:r()*MODEL.W,y:r()*MODEL.H,vx:(r()-0.5)*80,vy:(r()-0.5)*80});return{r:r,subs:subs,enz:[{x:80,y:MODEL.H-26,busy:0},{x:200,y:MODEL.H-26,busy:0},{x:320,y:MODEL.H-26,busy:0}],t:0,n:0,ev:[]}},
  step(s,dt,type){const p=MODEL.P[type];s.t+=dt;for(const e of s.enz)if(e.busy>0){e.busy-=dt;if(e.busy<=0){s.n++;s.ev.push(s.t)}}
    for(const q of s.subs){q.vx+=(s.r()-0.5)*400*dt;q.vy+=(s.r()-0.5)*400*dt;const sp=Math.hypot(q.vx,q.vy);if(sp>90){q.vx*=90/sp;q.vy*=90/sp}q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.x<0||q.x>MODEL.W){q.vx=-q.vx;q.x=Math.max(0,Math.min(MODEL.W,q.x))}if(q.y<0||q.y>MODEL.H){q.vy=-q.vy;q.y=Math.max(0,Math.min(MODEL.H,q.y))}
      for(const e of s.enz){if(e.busy<=0&&Math.hypot(q.x-e.x,q.y-e.y)<20&&s.r()<p*0.1){e.busy=0.6;q.x=s.r()*MODEL.W;q.y=s.r()*MODEL.H*0.7;break}}}},
  rate(s,win){let c=0;for(const t of s.ev)if(t>s.t-win)c++;return c/Math.min(win,Math.max(s.t,0.01))},
  mm(s,km,vmax){return vmax*s/(km+s)},
  occ(s,km){return s/(km+s)},
  fold(T){return 1/(1+Math.exp((T-50)/3))},
  speedT(T){const q=Math.pow(2,(T-37)/10);return q},
  act(T){return MODEL.speedT(T)*MODEL.fold(T)},
  topt(){let b=0,bt=0;for(let T=0;T<=80;T+=0.1){const a=MODEL.act(T);if(a>b){b=a;bt=T}}return bt},
  PH:{pepsin:[0.8,3.2],amylase:[5.8,8.2],trypsin:[6.8,9.2]},
  phAct(k,ph){const[a,b]=MODEL.PH[k];return 1/(1+Math.pow(10,a-ph)+Math.pow(10,ph-b))},
  phOpt(k){let b=0,bp=0;for(let p=0;p<=12;p+=0.01){const v=MODEL.phAct(k,p);if(v>b){b=v;bp=p}}return bp},
  inh(kind,i,s){const ki=2,km=1,vm=1;const vmA=kind==='non'?vm/(1+i/ki):vm,kmA=kind==='comp'?km*(1+i/ki):km;return{vmA:vmA,kmA:kmA,v:vmA*s/(kmA+s),v0:vm*s/(km+s)}}
};
const S={sub:'match',sim:null,run0:false,s1:1,km:1,e1:1,t2:25,ph:7,enz:'amylase',i4:3,s4:2,kind:'comp',seed:1};
function reset0(){S.sim=MODEL.makeSim(S.seed);S.run0=false}
function shape(x,type,px,py,r,col){x.fillStyle=col;x.beginPath();if(type==='match'){x.moveTo(px,py-r);x.lineTo(px+r,py+r*0.8);x.lineTo(px-r,py+r*0.8)}else if(type==='near'){x.moveTo(px-r*0.6,py-r*0.7);x.lineTo(px+r*0.6,py-r*0.7);x.lineTo(px+r,py+r*0.8);x.lineTo(px-r,py+r*0.8)}else x.arc(px,py,r,0,6.2832);x.closePath();x.fill()}
DRAW[0]=function(x,w,h){const k=w/MODEL.W,k2=h/MODEL.H,s=Math.min(k,k2),ox=(w-MODEL.W*s)/2,oy=(h-MODEL.H*s)/2;x.strokeStyle=C.line;x.strokeRect(ox,oy,MODEL.W*s,MODEL.H*s);
  for(const e of S.sim.enz){const px=ox+e.x*s,py=oy+e.y*s;x.fillStyle=e.busy>0?'#6f7f95':'#58667a';x.fillRect(px-26*s,py-4*s,52*s,30*s);x.fillStyle=C.bg;x.beginPath();x.moveTo(px,py-4*s);x.lineTo(px+12*s,py+14*s);x.lineTo(px-12*s,py+14*s);x.closePath();x.fill();if(e.busy>0)shape(x,'match',px,py+8*s,9*s,C.acc2)}
  for(const q of S.sim.subs)shape(x,S.sub,ox+q.x*s,oy+q.y*s,7*s,C.acc)};
function r0(){const s=S.sim;ro('s0-ro',t('r0',{kind:t({match:'kMatch',near:'kNear',miss:'kMiss'}[S.sub]),p:fx(MODEL.P[S.sub]*100,0),t:fx(s.t,1),n:s.n,rate:fx(MODEL.rate(s,8),2)}))}
TICK[0]=function(dt){if(!S.run0)return false;const n=Math.ceil(dt*2/0.02);for(let i=0;i<n;i++)MODEL.step(S.sim,0.02,S.sub);redraw(0);r0();return true};
function pr(w,h){return{x:44,y:14,w:w-60,h:h-48}}
function axes(x,p,xl,yl){x.strokeStyle=C.line;x.lineWidth=1;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,yl,p.x+4,p.y+13,C.muted,12);txt(x,xl,p.x+p.w-4,p.y+p.h+14,C.muted,12,'right')}
function plot(x,p,f,x0,x1,y1,col,lw,dash){x.setLineDash(dash?[5,4]:[]);x.strokeStyle=col;x.lineWidth=lw;x.beginPath();for(let i=0;i<=200;i++){const u=x0+(x1-x0)*i/200;const px=p.x+p.w*i/200,py=p.y+p.h*(1-f(u)/y1);i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();x.setLineDash([])}
DRAW[1]=function(x,w,h){const p={x:44,y:14,w:w-60,h:h-84},vmax=S.e1,f=s=>MODEL.mm(s,S.km,vmax);axes(x,p,'[S] (mM)','v');plot(x,p,f,0,10,4,C.acc2,3);line(x,p.x,p.y+p.h*(1-vmax/4),p.x+p.w,p.y+p.h*(1-vmax/4),'rgba(255,255,255,.2)',1);x.setLineDash([4,4]);line(x,p.x+p.w*S.km/10,p.y+p.h,p.x+p.w*S.km/10,p.y+p.h*(1-vmax/2/4),C.good,1);x.setLineDash([]);dot(x,p.x+p.w*S.s1/10,p.y+p.h*(1-f(S.s1)/4),6,C.acc);
  const occ=MODEL.occ(S.s1,S.km),cw=Math.min(36,(w-20)/10);for(let i=0;i<10;i++){const filled=i<Math.round(occ*10);x.fillStyle=filled?C.acc2:'#3a4658';x.fillRect(10+i*(cw+2),h-30,cw,22);if(filled)dot(x,10+i*(cw+2)+cw/2,h-19,5,C.acc)}};
function r1(){const v=MODEL.mm(S.s1,S.km,S.e1),vm=S.e1;ro('s1-ro',t('r1',{s:fx(S.s1,2),km:fx(S.km,2),vmax:fx(vm,0),v:fx(v,2),pct:fx(v/vm*100,0),occ:Math.round(MODEL.occ(S.s1,S.km)*10)}))}
DRAW[2]=function(x,w,h){const p=pr(w,h),amax=MODEL.act(MODEL.topt());axes(x,p,'T (°C)','');plot(x,p,T=>MODEL.speedT(T),0,80,amax*1.05,'rgba(160,170,185,.6)',1.5,true);plot(x,p,T=>MODEL.fold(T)*amax,0,80,amax*1.05,C.acc,2);plot(x,p,T=>MODEL.act(T),0,80,amax*1.05,C.acc2,3);dot(x,p.x+p.w*S.t2/80,p.y+p.h*(1-MODEL.act(S.t2)/(amax*1.05)),6,C.text)};
function r2(){const a=MODEL.act(S.t2),m=MODEL.act(MODEL.topt());ro('s2-ro',t('r2',{t:S.t2,rate:fx(MODEL.speedT(S.t2),2),fold:fx(MODEL.fold(S.t2)*100,0),act:fx(a,2),pct:fx(a/m*100,0),topt:fx(MODEL.topt(),1)}))}
DRAW[3]=function(x,w,h){const p=pr(w,h);axes(x,p,'pH','');['pepsin','amylase','trypsin'].forEach(k=>plot(x,p,ph=>MODEL.phAct(k,ph),0,12,1.05,k===S.enz?C.acc2:'rgba(160,170,185,.5)',k===S.enz?3:1.2));dot(x,p.x+p.w*S.ph/12,p.y+p.h*(1-MODEL.phAct(S.enz,S.ph)/1.05),6,C.acc)};
function r3(){ro('s3-ro',t('r3',{enz:t({pepsin:'nPepsin',amylase:'nAmylase',trypsin:'nTrypsin'}[S.enz]),ph:fx(S.ph,2),act:fx(MODEL.phAct(S.enz,S.ph)*100,0),opt:fx(MODEL.phOpt(S.enz),1)}))}
DRAW[4]=function(x,w,h){const p=pr(w,h),I=MODEL.inh(S.kind,S.i4,S.s4);axes(x,p,'[S] (mM)','v');plot(x,p,s=>MODEL.inh(S.kind,0,s).v,0,20,1.1,'rgba(160,170,185,.6)',1.5,true);plot(x,p,s=>MODEL.inh(S.kind,S.i4,s).v,0,20,1.1,S.kind==='comp'?C.acc:C.acc3,3);dot(x,p.x+p.w*S.s4/20,p.y+p.h*(1-I.v/1.1),6,C.text)};
function r4(){const I=MODEL.inh(S.kind,S.i4,S.s4);ro('s4-ro',t('r4',{kind:t(S.kind==='comp'?'kComp':'kNonc'),i:fx(S.i4,1),vm:fx(I.vmA,3),kma:fx(I.kmA,2),s:fx(S.s4,1),v:fx(I.v,3),v0:fx(I.v0,3)}))}
function setSub(k){S.sub=k;['match','near','miss'].forEach(i=>$('s0-'+i).classList.toggle('active',i===k));reset0();redraw(0);r0()}
function setEnz(k){S.enz=k;['pepsin','amylase','trypsin'].forEach(i=>$('s3-'+i).classList.toggle('active',i===k));redraw(3);r3()}
function setKind(k){S.kind=k;$('s4-comp').classList.toggle('active',k==='comp');$('s4-non').classList.toggle('active',k==='non');redraw(4);r4()}
function init(){
  ['match','near','miss'].forEach(k=>btn('s0-'+k,()=>setSub(k)));btn('s0-play',()=>{S.run0=!S.run0;if(S.run0){if(REDUCE){for(let i=0;i<100;i++)MODEL.step(S.sim,0.02,S.sub);S.run0=false;redraw(0);r0()}else kick()}});btn('s0-reset',()=>{reset0();redraw(0);r0()});
  slider('s1-s',v=>fx(v,2),v=>{S.s1=v;redraw(1);r1()});slider('s1-km',v=>fx(v,2),v=>{S.km=v;redraw(1);r1()});slider('s1-e',v=>fx(v,0),v=>{S.e1=v;redraw(1);r1()});
  slider('s2-t',v=>v+' °C',v=>{S.t2=v;redraw(2);r2()});
  slider('s3-ph',v=>fx(v,2),v=>{S.ph=v;redraw(3);r3()});['pepsin','amylase','trypsin'].forEach(k=>btn('s3-'+k,()=>setEnz(k)));
  slider('s4-i',v=>fx(v,1),v=>{S.i4=v;redraw(4);r4()});slider('s4-s',v=>fx(v,1),v=>{S.s4=v;redraw(4);r4()});btn('s4-comp',()=>setKind('comp'));btn('s4-non',()=>setKind('non'));
  reset0();setSub('match');setEnz('amylase');setKind('comp')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

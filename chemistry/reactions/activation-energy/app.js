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

/* Activation energy: profile U(x), Boltzmann tail, Arrhenius k = exp(-Ea/RT) (A = 1). Energies in kJ/mol. */
const MODEL={
  R:0.008314,
  _memo:{},
  bump(ea,dh){const key=ea+'|'+dh;if(MODEL._memo[key]!==undefined)return MODEL._memo[key];const sm=x=>x*x*(3-2*x),g=x=>Math.exp(-Math.pow((x-0.42)/0.16,2)),mx=b=>{let m=-1e9;for(let i=0;i<=400;i++){const x=i/400,u=dh*sm(x)+b*g(x);if(u>m)m=u}return m};let lo=0,hi=600;for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(mx(mid)<ea)lo=mid;else hi=mid}return MODEL._memo[key]=(lo+hi)/2},
  U(x,ea,dh){const b=MODEL.bump(ea,dh);return dh*x*x*(3-2*x)+b*Math.exp(-Math.pow((x-0.42)/0.16,2))},
  dU(x,ea,dh){const h=1e-5;return(MODEL.U(x+h,ea,dh)-MODEL.U(x-h,ea,dh))/(2*h)},
  tail(e,T){return Math.exp(-e/(MODEL.R*T))},
  k(ea,T){return Math.exp(-ea/(MODEL.R*T))},
  ratio10(ea,T){return MODEL.k(ea,T+10)/MODEL.k(ea,T)},
  fit(pts){const n=pts.length;if(n<2)return null;let sx=0,sy=0,sxx=0,sxy=0;for(const p of pts){sx+=p.x;sy+=p.y;sxx+=p.x*p.x;sxy+=p.x*p.y}const d=n*sxx-sx*sx;if(Math.abs(d)<1e-18)return null;const m=(n*sxy-sx*sy)/d;return{slope:m,icpt:(sy-m*sx)/n}},
  noise(k){return 0.02*Math.sin(12.9898*(k+1)*78.233)},
  speedup(d,T){return Math.exp(d/(MODEL.R*T))},
  launch(ea,dh,e){const s={x:0,v:0,t:0,res:null},K=0.001;s.v=Math.sqrt(2*K*Math.max(0,e-MODEL.U(0,ea,dh)));s.K=K;return s},
  step(s,ea,dh,dt){const a=-s.K*MODEL.dU(s.x,ea,dh);s.v+=a*dt/2;s.x+=s.v*dt;const a2=-s.K*MODEL.dU(s.x,ea,dh);s.v+=a2*dt/2;s.t+=dt;if(s.x>=0.995&&s.v>=0){s.x=0.995;s.res='pass'}else if(s.x<=0&&s.v<0&&s.t>0.05){s.x=0;s.res='back'}}
};
const S={ea0:90,dh0:-30,e0:72,sim:null,t1:300,ea1:60,t2:300,ea2:50,pts:[],d3:20,t3:300,ea4:90,dh4:-30,t4:300};
function mkSim(){S.sim=MODEL.launch(S.ea0,S.dh0,S.e0);S.sim.run=false;S.sim.idle=true}
function profile(x,r,ea,dh,col,lw,dash,ymin,ymax){x.setLineDash(dash?[5,4]:[]);x.strokeStyle=col;x.lineWidth=lw;x.beginPath();for(let i=0;i<=200;i++){const u=i/200,px=r.x+r.w*u,py=r.y+r.h*(1-(MODEL.U(u,ea,dh)-ymin)/(ymax-ymin));i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();x.setLineDash([])}
function pr(w,h){return{x:50,y:16,w:w-70,h:h-50}}
DRAW[0]=function(x,w,h){const r=pr(w,h),ymin=-60,ymax=150,Y=v=>r.y+r.h*(1-(v-ymin)/(ymax-ymin)),s=S.sim;x.strokeStyle=C.line;x.strokeRect(r.x,r.y,r.w,r.h);txt(x,'E (kJ/mol)',r.x+4,r.y+13,C.muted,12);txt(x,t('axisProg'),r.x+r.w-4,r.y+r.h+16,C.muted,12,'right');
  line(x,r.x,Y(0),r.x+r.w*0.14,Y(0),C.muted,1);line(x,r.x+r.w*0.86,Y(S.dh0),r.x+r.w,Y(S.dh0),C.muted,1);
  x.setLineDash([3,4]);line(x,r.x,Y(S.e0),r.x+r.w,Y(S.e0),C.acc,1.5);x.setLineDash([]);txt(x,'E',r.x+r.w-4,Y(S.e0)-4,C.acc,12,'right');
  profile(x,r,S.ea0,S.dh0,C.acc2,3,false,ymin,ymax);arrow(x,r.x+r.w*0.42,Y(0),r.x+r.w*0.42,Y(S.ea0)+4,C.good,2);txt(x,'Eₐ',r.x+r.w*0.42+6,Y(S.ea0/2),C.good,13);arrow(x,r.x+r.w*0.93,Y(0),r.x+r.w*0.93,Y(S.dh0)+(S.dh0<0?-4:4),C.acc3,2);txt(x,'ΔH',r.x+r.w*0.93-6,Y(S.dh0/2),C.acc3,13,'right');
  dot(x,r.x+r.w*s.x,Y(MODEL.U(s.x,S.ea0,S.dh0))-6,7,C.text)};
function r0(){const s=S.sim,done=s.res;ro('s0-ro',t('r0',{ea:S.ea0,dh:S.dh0,kind:S.dh0<0?t('kExo'):(S.dh0>0?t('kEndo'):t('kZero')),e:S.e0,res:done==='pass'?t('resPass'):(done==='back'?t('resBack'):t('resIdle')),er:S.ea0-S.dh0}))}
TICK[0]=function(dt){const s=S.sim;if(!s.run||s.res)return false;const n=Math.max(1,Math.ceil(dt*1.5/0.01));for(let i=0;i<n&&!s.res;i++)MODEL.step(s,S.ea0,S.dh0,0.01);if(s.res)s.run=false;redraw(0);r0();return s.run};
DRAW[1]=function(x,w,h){const r=pr(w,h),emax=130,ymin=-22,Y=v=>r.y+r.h*(1-(Math.log10(v)-ymin)/(0-ymin)),X=e=>r.x+r.w*e/emax;x.strokeStyle=C.line;x.strokeRect(r.x,r.y,r.w,r.h);txt(x,'log₁₀ (fraction ≥ E)',r.x+4,r.y+13,C.muted,12);txt(x,'E (kJ/mol)',r.x+r.w-4,r.y+r.h+16,C.muted,12,'right');
  const ln=(T,col,lw,dash)=>{x.setLineDash(dash?[5,4]:[]);x.strokeStyle=col;x.lineWidth=lw;x.beginPath();x.moveTo(X(0),Y(1));x.lineTo(X(emax),Y(Math.max(1e-22,MODEL.tail(emax,T))));x.stroke();x.setLineDash([])};
  ln(300,'rgba(160,170,185,.6)',1.5,true);ln(S.t1,C.acc2,3,false);line(x,X(S.ea1),r.y,X(S.ea1),r.y+r.h,C.good,2);txt(x,'Eₐ',X(S.ea1)+4,r.y+14,C.good,13);
  dot(x,X(S.ea1),Y(Math.max(1e-22,MODEL.tail(S.ea1,300))),5,C.muted);dot(x,X(S.ea1),Y(Math.max(1e-22,MODEL.tail(S.ea1,S.t1))),7,C.acc)};
function r1(){const f=MODEL.tail(S.ea1,S.t1),f3=MODEL.tail(S.ea1,300);ro('s1-ro',t('r1',{t:S.t1,rt:fx(MODEL.R*S.t1,2),frac:f.toExponential(2),f300:f3.toExponential(2),ratio:fx(f/f3,2)}))}
DRAW[2]=function(x,w,h){const narrow=w<520,p1=narrow?{x:44,y:14,w:w-60,h:h*0.5-34}:{x:44,y:14,w:w*0.5-56,h:h-44},p2=narrow?{x:44,y:h*0.5+14,w:w-60,h:h*0.5-40}:{x:w*0.5+36,y:14,w:w*0.5-52,h:h-44};
  x.strokeStyle=C.line;x.strokeRect(p1.x,p1.y,p1.w,p1.h);txt(x,'log₁₀(k/k₃₀₀)',p1.x+4,p1.y+13,C.muted,12);txt(x,'T',p1.x+p1.w-4,p1.y+p1.h+14,C.muted,12,'right');
  const lk=(T,ea)=>Math.log10(MODEL.k(ea,T)/MODEL.k(ea,300)),ymaxL=Math.max(1,lk(420,S.ea2)),X1=T=>p1.x+p1.w*(T-280)/140,Y1=v=>p1.y+p1.h*(1-(v-lk(280,S.ea2))/(ymaxL-lk(280,S.ea2)));
  x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();for(let i=0;i<=100;i++){const T=280+140*i/100;i?x.lineTo(X1(T),Y1(lk(T,S.ea2))):x.moveTo(X1(T),Y1(lk(T,S.ea2)))}x.stroke();dot(x,X1(S.t2),Y1(lk(S.t2,S.ea2)),6,C.acc);
  x.strokeStyle=C.line;x.strokeRect(p2.x,p2.y,p2.w,p2.h);txt(x,'ln k',p2.x+4,p2.y+13,C.muted,12);txt(x,'1/T',p2.x+p2.w-4,p2.y+p2.h+14,C.muted,12,'right');
  const xa=1/420,xb=1/280,X2=u=>p2.x+p2.w*(u-xa)/(xb-xa),lo=-MODEL.R*0+(-100/(MODEL.R*280)),hi=-30/(MODEL.R*420),Y2=v=>p2.y+p2.h*(1-(v-lo)/(hi-lo));
  x.strokeStyle='rgba(255,180,84,.5)';x.lineWidth=1.5;x.beginPath();x.moveTo(X2(xa),Y2(-S.ea2/(MODEL.R*420)));x.lineTo(X2(xb),Y2(-S.ea2/(MODEL.R*280)));x.stroke();S.pts.forEach(q=>dot(x,X2(q.x),Y2(q.y),5,C.acc));
  const ft=MODEL.fit(S.pts);if(ft){x.strokeStyle=C.acc;x.lineWidth=1.5;x.setLineDash([4,3]);x.beginPath();x.moveTo(X2(xa),Y2(ft.icpt+ft.slope*xa));x.lineTo(X2(xb),Y2(ft.icpt+ft.slope*xb));x.stroke();x.setLineDash([])}};
function r2(){const ft=MODEL.fit(S.pts);ro('s2-ro',t('r2',{t:S.t2,kr:MODEL.k(S.ea2,S.t2)/MODEL.k(S.ea2,300)>1e4?(MODEL.k(S.ea2,S.t2)/MODEL.k(S.ea2,300)).toExponential(2):fx(MODEL.k(S.ea2,S.t2)/MODEL.k(S.ea2,300),2),x10:fx(MODEL.ratio10(S.ea2,S.t2),2),n:S.pts.length,efit:ft?fx(-ft.slope*MODEL.R,1):'—',ea:S.ea2})+(ft?'':' '+t('needMore')))}
DRAW[3]=function(x,w,h){const r=pr(w,h),ymin=-60,ymax=150,Y=v=>r.y+r.h*(1-(v-ymin)/(ymax-ymin)),dh=-30,ea=100;x.strokeStyle=C.line;x.strokeRect(r.x,r.y,r.w,r.h);txt(x,'E (kJ/mol)',r.x+4,r.y+13,C.muted,12);txt(x,t('axisProg'),r.x+r.w-4,r.y+r.h+16,C.muted,12,'right');
  profile(x,r,ea,dh,'rgba(160,170,185,.7)',2,true,ymin,ymax);profile(x,r,ea-S.d3,dh,C.acc2,3,false,ymin,ymax);if(S.d3>0){arrow(x,r.x+r.w*0.42,Y(ea),r.x+r.w*0.42,Y(ea-S.d3)-3,C.good,2);txt(x,'−ΔEₐ',r.x+r.w*0.42+8,Y(ea-S.d3/2),C.good,13)}};
function r3(){const sp=MODEL.speedup(S.d3,S.t3);ro('s3-ro',t('r3',{d:S.d3,t:S.t3,sp:sp>1e4?sp.toExponential(2):fx(sp,2),kr:fx(1,1)}))}
DRAW[4]=function(x,w,h){const er=S.ea4-S.dh4,kf=MODEL.k(S.ea4,S.t4),kb=MODEL.k(er,S.t4),p={x:50,y:16,w:w-70,h:h-50},lo=-35,Y=v=>p.y+p.h*(1-(Math.log10(Math.max(1e-35,v))-lo)/(0-lo));x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'log₁₀ k',p.x+4,p.y+13,C.muted,12);
  const bw=Math.min(90,p.w*0.22);[[kf,C.acc2,'k_f',0.25],[kb,C.acc,'k_r',0.6]].forEach(([k,c,l,u])=>{const bx=p.x+p.w*u,by=Y(k);x.fillStyle=c;x.fillRect(bx,by,bw,p.y+p.h-by);txt(x,l,bx+bw/2,p.y+p.h+16,c,13,'center')})};
function r4(){const er=S.ea4-S.dh4,kf=MODEL.k(S.ea4,S.t4),kb=MODEL.k(er,S.t4);ro('s4-ro',t('r4',{ea:S.ea4,er:er,t:S.t4,kf:kf.toExponential(1),kb:kb.toExponential(1),ratio:(kf/kb).toExponential(2)}))}
function init(){
  slider('s0-ea',v=>v,v=>{S.ea0=v;mkSim();redraw(0);r0()});slider('s0-dh',v=>v,v=>{S.dh0=v;mkSim();redraw(0);r0()});slider('s0-e',v=>v,v=>{S.e0=v;mkSim();redraw(0);r0()});
  btn('s0-go',()=>{mkSim();S.sim.idle=false;S.sim.run=true;if(REDUCE){for(let i=0;i<4000&&!S.sim.res;i++)MODEL.step(S.sim,S.ea0,S.dh0,0.5);S.sim.run=false;redraw(0);r0()}else kick()});btn('s0-reset',()=>{mkSim();redraw(0);r0()});
  slider('s1-t',v=>v,v=>{S.t1=v;redraw(1);r1()});slider('s1-ea',v=>v,v=>{S.ea1=v;redraw(1);r1()});
  slider('s2-t',v=>v,v=>{S.t2=v;redraw(2);r2()});slider('s2-ea',v=>v,v=>{S.ea2=v;S.pts=[];redraw(2);r2()});btn('s2-add',()=>{S.pts.push({x:1/S.t2,y:-S.ea2/(MODEL.R*S.t2)+MODEL.noise(S.pts.length)});redraw(2);r2()});btn('s2-clear',()=>{S.pts=[];redraw(2);r2()});
  slider('s3-d',v=>v,v=>{S.d3=v;redraw(3);r3()});slider('s3-t',v=>v,v=>{S.t3=v;r3()});
  slider('s4-ea',v=>v,v=>{S.ea4=v;redraw(4);r4()});slider('s4-dh',v=>v,v=>{S.dh4=v;redraw(4);r4()});slider('s4-t',v=>v,v=>{S.t4=v;redraw(4);r4()});mkSim()}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=2;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

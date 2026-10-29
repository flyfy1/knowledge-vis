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

/* Resonance: x'' + 2 z w0 x' + w0^2 x = F cos(W t), F = 1, w0 = 2 in steps 1-4. */
const MODEL={
  W0:2,
  omega0(k,m){return Math.sqrt(k/m)},
  free(x0,z,w0,t){if(z<1){const wd=w0*Math.sqrt(1-z*z);return Math.exp(-z*w0*t)*(x0*Math.cos(wd*t)+(z*w0*x0/wd)*Math.sin(wd*t))}if(Math.abs(z-1)<1e-9)return x0*(1+w0*t)*Math.exp(-w0*t);const q=Math.sqrt(z*z-1),s1=-w0*(z-q),s2=-w0*(z+q);return x0*(s2*Math.exp(s1*t)-s1*Math.exp(s2*t))/(s2-s1)},
  logdec(z){return Math.exp(-2*Math.PI*z/Math.sqrt(1-z*z))},
  amp(F,w0,z,W){return F/Math.sqrt(Math.pow(w0*w0-W*W,2)+Math.pow(2*z*w0*W,2))},
  phase(w0,z,W){return Math.atan2(2*z*w0*W,w0*w0-W*W)},
  peakR(z){return z<Math.SQRT1_2?Math.sqrt(1-2*z*z):0},
  peakAmp(F,w0,z){return z<Math.SQRT1_2?F/(2*z*w0*w0*Math.sqrt(1-z*z)):F/(w0*w0)},
  deriv(s,w0,z,F,W){return[s.v,F*Math.cos(W*s.t)-2*z*w0*s.v-w0*w0*s.x]},
  step(s,w0,z,F,W,dt){const f=(x,v,t)=>[v,F*Math.cos(W*t)-2*z*w0*v-w0*w0*x],a=f(s.x,s.v,s.t),b=f(s.x+dt/2*a[0],s.v+dt/2*a[1],s.t+dt/2),c=f(s.x+dt/2*b[0],s.v+dt/2*b[1],s.t+dt/2),d=f(s.x+dt*c[0],s.v+dt*c[1],s.t+dt);s.x+=dt/6*(a[0]+2*b[0]+2*c[0]+d[0]);s.v+=dt/6*(a[1]+2*b[1]+2*c[1]+d[1]);s.t+=dt},
  upPeriod(H){const z=[];for(let i=1;i<H.length;i++){if(H[i-1].x<0&&H[i].x>=0){const f=-H[i-1].x/(H[i].x-H[i-1].x);z.push(H[i-1].t+f*(H[i].t-H[i-1].t))}}return z.length>=2?z[1]-z[0]:NaN},
  peaks(z,w0,T,n){const p=[];let prev=0,pp=0,cur=0;const dt=T/n;let a=MODEL.free(1,z,w0,0),b=MODEL.free(1,z,w0,dt);for(let i=2;i<n;i++){const c=MODEL.free(1,z,w0,i*dt);if(b>a&&b>c&&b>0)p.push(b);a=b;b=c}return p}
};
const S={k:4,m:1,t0:0,H0:[],run0:false,z1:0.15,r2:0.5,z2:0.1,sim2:null,H2:[],run2:false,r3:0.8,z3:0.15,r4:0.5,z4:0.15};
function springMass(x,rect,xpos,scale){const mid=rect.y+rect.h/2,wall=rect.x+6,restX=rect.x+rect.w*0.62,mx=restX+xpos*scale;line(x,wall,rect.y+8,wall,rect.y+rect.h-8,C.muted,4);
  x.strokeStyle=C.muted;x.lineWidth=2;x.beginPath();x.moveTo(wall,mid);const n=10,L=mx-18-wall;for(let i=1;i<=n;i++){x.lineTo(wall+L*(i-0.5)/n,mid+(i%2?-12:12))}x.lineTo(mx-18,mid);x.stroke();x.fillStyle=C.acc2;x.fillRect(mx-18,mid-18,36,36);line(x,restX,mid+26,restX,mid+36,C.line,1)}
function split2(w,h){const narrow=w<520;return narrow?{sm:{x:0,y:0,w:w,h:90},tr:{x:12,y:100,w:w-24,h:h-110}}:{sm:{x:0,y:0,w:Math.floor(w*0.3),h:h},tr:{x:Math.floor(w*0.3)+10,y:10,w:Math.floor(w*0.7)-20,h:h-20}}}
function frame(x,r,lab,ymid){x.strokeStyle=C.line;x.lineWidth=1;x.strokeRect(r.x,r.y,r.w,r.h);if(ymid)line(x,r.x,r.y+r.h/2,r.x+r.w,r.y+r.h/2,C.line,1);txt(x,lab,r.x+4,r.y+13,C.muted,12)}
function trace(x,r,H,col,ymax,t1,span,key){x.strokeStyle=col;x.lineWidth=2;x.beginPath();let on=false;for(const p of H){const px=r.x+r.w*(1-(t1-p.t)/span);if(px<r.x)continue;const py=r.y+r.h/2-(p[key||'x']/ymax)*r.h/2;if(on)x.lineTo(px,py);else{x.moveTo(px,py);on=true}}x.stroke()}
function w0s0(){return MODEL.omega0(S.k,S.m)}
DRAW[0]=function(x,w,h){const L=split2(w,h),w0=w0s0(),xp=Math.cos(w0*S.t0);springMass(x,L.sm,xp,Math.min(L.sm.w*0.2,50));frame(x,L.tr,'x(t)',true);const span=10,t1=Math.max(S.t0,span);trace(x,L.tr,S.H0,C.acc2,1.2,t1,span);if(!S.H0.length)txt(x,t('hint'),L.tr.x+L.tr.w/2,L.tr.y+L.tr.h/2-8,C.muted,13,'center')};
function r0(){const w0=w0s0(),tm=MODEL.upPeriod(S.H0);ro('s0-ro',t('r0',{w0:fx(w0,3),tp:fx(2*Math.PI/w0,3),tm:isNaN(tm)?t('none'):fx(tm,3),t:fx(S.t0)}))}
function reset0(){S.run0=false;S.t0=0;S.H0=[{t:0,x:1}]}
function adv0(dt){S.t0+=dt;S.H0.push({t:S.t0,x:Math.cos(w0s0()*S.t0)});while(S.H0.length>1&&S.H0[0].t<S.t0-12)S.H0.shift()}
TICK[0]=function(dt){if(!S.run0)return false;adv0(dt*2);redraw(0);r0();return true};
DRAW[1]=function(x,w,h){const r={x:30,y:12,w:w-44,h:h-36},z=S.z1,T=12;frame(x,r,'x(t)',true);txt(x,'t →',r.x+r.w-4,r.y+r.h+14,C.muted,12,'right');
  const yy=v=>r.y+r.h/2-v*r.h/2*0.9;x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=1;x.beginPath();for(let i=0;i<=200;i++){const t=T*i/200,v=MODEL.free(1,0,2,t);i?x.lineTo(r.x+r.w*i/200,yy(v)):x.moveTo(r.x,yy(v))}x.stroke();
  if(z>0&&z<1){x.setLineDash([5,4]);[1,-1].forEach(sg=>{x.strokeStyle=C.good;x.beginPath();for(let i=0;i<=100;i++){const t=T*i/100,v=sg*Math.exp(-z*2*t);i?x.lineTo(r.x+r.w*i/100,yy(v)):x.moveTo(r.x,yy(v))}x.stroke()});x.setLineDash([])}
  x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();for(let i=0;i<=400;i++){const t=T*i/400,v=MODEL.free(1,z,2,t);i?x.lineTo(r.x+r.w*i/400,yy(v)):x.moveTo(r.x,yy(v))}x.stroke()};
function r1(){const z=S.z1;let kind=z===0?t('kNone'):(z<1-1e-9?t('kUnder'):(Math.abs(z-1)<1e-9?t('kCrit'):t('kOver')));let rm='—',rf='—';if(z>0&&z<1){const p=MODEL.peaks(z,2,30,6000);if(p.length>=2)rm=fx(p[1]/p[0],4);rf=fx(MODEL.logdec(z),4)}else if(z===0){rm=rf='1.0000'}ro('s1-ro',t('r1',{z:fx(z,2),kind:kind,rm:rm,rf:rf}))}
function reset2(){S.run2=false;S.sim2={x:0,v:0,t:0};S.H2=[{t:0,x:0,f:Math.cos(0)}]}
function W2(){return S.r2*MODEL.W0}
function adv2(dt){const n=Math.max(1,Math.ceil(dt/0.01)),h=dt/n;for(let i=0;i<n;i++){MODEL.step(S.sim2,2,S.z2,1,W2(),h);S.H2.push({t:S.sim2.t,x:S.sim2.x,f:Math.cos(W2()*S.sim2.t)})}while(S.H2.length>1&&S.H2[0].t<S.sim2.t-30)S.H2.shift()}
DRAW[2]=function(x,w,h){const L=split2(w,h),s=S.sim2,Aa=MODEL.amp(1,2,S.z2,W2()),ym=Math.max(0.6,MODEL.peakAmp(1,2,0.05)*0.5);springMass(x,L.sm,s.x,Math.min(L.sm.w*0.2,60)/Math.max(0.5,ym)*0.5);frame(x,L.tr,'x(t)',true);const span=24,t1=Math.max(s.t,span);
  x.setLineDash([4,4]);trace(x,L.tr,S.H2.map(p=>({t:p.t,x:p.f*0.3*ym})),C.acc,ym,t1,span);x.setLineDash([]);trace(x,L.tr,S.H2,C.acc2,ym,t1,span);
  [Aa,-Aa].forEach(v=>line(x,L.tr.x,L.tr.y+L.tr.h/2-v/ym*L.tr.h/2,L.tr.x+L.tr.w,L.tr.y+L.tr.h/2-v/ym*L.tr.h/2,'rgba(126,226,168,.4)',1));if(S.H2.length<3)txt(x,t('hint'),L.tr.x+L.tr.w/2,L.tr.y+L.tr.h/2-30,C.muted,13,'center')};
function r2(){const W=W2(),Tp=2*Math.PI/W;let Am=NaN;if(S.sim2.t>2*Tp+2){Am=0;for(const p of S.H2)if(p.t>S.sim2.t-2*Tp)Am=Math.max(Am,Math.abs(p.x))}ro('s2-ro',t('r2',{W:fx(W,2),r:fx(S.r2,2),z:fx(S.z2,2),A:fx(MODEL.amp(1,2,S.z2,W),3),Am:isNaN(Am)?t('none'):fx(Am,3),t:fx(S.sim2.t,1)}))}
TICK[2]=function(dt){if(!S.run2)return false;adv2(dt*3);redraw(2);r2();return true};
DRAW[3]=function(x,w,h){const r={x:36,y:12,w:w-52,h:h-40},rmax=2,ym=MODEL.peakAmp(1,2,0.05)*1.1;frame(x,r,'A',false);txt(x,'Ω/ω₀',r.x+r.w-4,r.y+r.h+16,C.muted,12,'right');const X=v=>r.x+r.w*v/rmax,Y=v=>r.y+r.h*(1-Math.min(1,v/ym));
  const cv=(z,col,lw)=>{x.strokeStyle=col;x.lineWidth=lw;x.beginPath();for(let i=0;i<=300;i++){const rr=rmax*i/300;const a=MODEL.amp(1,2,z,rr*2);i?x.lineTo(X(rr),Y(a)):x.moveTo(X(rr),Y(a))}x.stroke()};
  [0.05,0.15,0.5].forEach(z=>cv(z,'rgba(160,170,185,.45)',1.2));cv(S.z3,C.acc2,3);const a=MODEL.amp(1,2,S.z3,S.r3*2);dot(x,X(S.r3),Y(a),6,C.acc);line(x,X(S.r3),Y(a),X(S.r3),r.y+r.h,C.acc,1);line(x,X(1),r.y+r.h,X(1),r.y+r.h+5,C.muted,1);txt(x,'1',X(1),r.y+r.h+16,C.muted,12,'center')};
function r3(){const z=S.z3;ro('s3-ro',t('r3',{r:fx(S.r3,2),A:fx(MODEL.amp(1,2,z,S.r3*2),3),pk:fx(MODEL.peakR(z),3),ph:fx(MODEL.peakAmp(1,2,z),3),Q:fx(1/(2*z),1),bw:fx(2*z,2)}))}
DRAW[4]=function(x,w,h){const r={x:12,y:12,w:w-24,h:h-30},W=S.r4*2,ph=MODEL.phase(2,S.z4,W),A=MODEL.amp(1,2,S.z4,W),T=2*Math.PI/W,span=3*T;frame(x,r,'',true);const ym=Math.max(A,1)*1.1,Y=v=>r.y+r.h/2-v/ym*r.h/2;
  [[C.acc,t=>Math.cos(W*t),1],[C.acc2,t=>A*Math.cos(W*t-ph),1]].forEach(([c,f])=>{x.strokeStyle=c;x.lineWidth=2.5;x.beginPath();for(let i=0;i<=300;i++){const tt=span*i/300,px=r.x+r.w*i/300;i?x.lineTo(px,Y(f(tt))):x.moveTo(px,Y(f(tt)))}x.stroke()});
  line(x,r.x+r.w*(0)/1,r.y,r.x,r.y+r.h,C.line,1)};
function r4(){const ph=MODEL.phase(2,S.z4,S.r4*2);ro('s4-ro',t('r4',{r:fx(S.r4,2),z:fx(S.z4,2),phi:fx(ph*180/Math.PI,1),frac:fx(ph/(2*Math.PI),3)}))}
function init(){
  slider('s0-k',v=>fx(v,0),v=>{S.k=v;reset0();redraw(0);r0()});slider('s0-m',v=>fx(v,1),v=>{S.m=v;reset0();redraw(0);r0()});btn('s0-play',()=>{if(S.run0){S.run0=false;return}S.run0=true;if(REDUCE){adv0(0.5);S.run0=false;redraw(0);r0()}else kick()});btn('s0-reset',()=>{reset0();redraw(0);r0()});
  slider('s1-z',v=>fx(v,2),v=>{S.z1=v;redraw(1);r1()});
  slider('s2-r',v=>fx(v,2),v=>{S.r2=v;reset2();redraw(2);r2()});slider('s2-z',v=>fx(v,2),v=>{S.z2=v;reset2();redraw(2);r2()});btn('s2-play',()=>{if(S.run2){S.run2=false;return}S.run2=true;if(REDUCE){adv2(1);S.run2=false;redraw(2);r2()}else kick()});btn('s2-reset',()=>{reset2();redraw(2);r2()});
  slider('s3-r',v=>fx(v,2),v=>{S.r3=v;redraw(3);r3()});slider('s3-z',v=>fx(v,2),v=>{S.z3=v;redraw(3);r3()});
  slider('s4-r',v=>fx(v,2),v=>{S.r4=v;redraw(4);r4()});slider('s4-z',v=>fx(v,2),v=>{S.z4=v;redraw(4);r4()});reset0();reset2()}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=2;QUIZ.step=3;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

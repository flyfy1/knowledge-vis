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

/* Doppler effect: wave speed c = 1. Picture drawn in the source frame; ring k emitted a = tau + k/f ago. */
const MODEL={
  lambda(c,f){return c/f},
  fFront(f,m){return f/(1-m)},fBack(f,m){return f/(1+m)},
  fAt(f,m,th){return f/(1-m*Math.cos(th))},
  ring(m,age){return{r:age,cx:-m*age}},
  mach(M){return M>1?Math.asin(1/M):NaN},
  /* retarded emission time for listener at (0,b), source x = -L + m*te, c = 1 */
  emit(m,b,L,t){let lo=0,hi=t;const g=te=>te+Math.hypot(-L+m*te,b)-t;if(g(0)>0)return NaN;for(let i=0;i<80;i++){const mid=(lo+hi)/2;if(g(mid)>0)hi=mid;else lo=mid}return(lo+hi)/2},
  heard(f,m,b,L,t){const te=MODEL.emit(m,b,L,t);if(isNaN(te))return NaN;const xs=-L+m*te,d=Math.hypot(xs,b);return f/(1-m*(-xs/d))},
  arrivals(f,m,xo,x0,n){const a=[];for(let k=0;k<n;k++){const te=k/f,xs=x0+m*te;a.push(te+Math.abs(xo-xs))}return a}
};
const S={f:1,t0:3,run0:false,m1:0.5,run1:false,tau1:0,m2:0.5,a2:0,m3:0.5,b3:0.8,t3:0,run3:false,H3:[],M4:1.5,run4:false,tau4:0};
const L3=6;
function rings(x,cx,cy,s,m,f,tau,K,col,lim){const per=1/f;for(let k=0;k<K;k++){const age=tau+k*per,r=age*s;if(age>lim)break;const cxk=cx+MODEL.ring(m,age).cx*s;x.strokeStyle=col||C.acc;x.globalAlpha=Math.max(0.15,1-age/(K*per));x.lineWidth=1.8;x.beginPath();x.arc(cxk,cy,r,0,6.2832);x.stroke()}x.globalAlpha=1}
DRAW[0]=function(x,w,h){const s=Math.min(w/9,h/6.4),cx=w/2,cy=h/2,n=Math.floor(S.t0*S.f+1e-9)+1;for(let k=0;k<n;k++){const age=S.t0-k/S.f,r=age*s;if(r>Math.max(w,h))continue;x.strokeStyle=C.acc;x.globalAlpha=Math.max(0.2,1-age/6);x.lineWidth=1.8;x.beginPath();x.arc(cx,cy,r,0,6.2832);x.stroke()}x.globalAlpha=1;dot(x,cx,cy,6,C.acc2);
  const lam=MODEL.lambda(1,S.f);line(x,cx+s*0,cy+30,cx+lam*s,cy+30,C.good,2);txt(x,'λ',cx+lam*s/2,cy+46,C.good,13,'center')};
function r0(){ro('s0-ro',t('r0',{f:fx(S.f,1),lam:fx(MODEL.lambda(1,S.f),3),T:fx(1/S.f,2),n:Math.floor(S.t0*S.f+1e-9)+1}))}
function reset0(){S.run0=false;S.t0=0}
TICK[0]=function(dt){if(!S.run0)return false;S.t0+=dt*2;redraw(0);r0();return true};
const F1=1.2;
DRAW[1]=function(x,w,h){const s=Math.min(w/12,h/7),cx=w/2,cy=h/2;rings(x,cx,cy,s,S.m1,F1,S.tau1,14,C.acc,6.5);dot(x,cx,cy,6,C.acc2);arrow(x,cx+10,cy,cx+10+Math.max(14,S.m1*60),cy,C.acc2,2);
  dot(x,cx+5.2*s,cy,6,C.good);dot(x,cx-5.2*s,cy,6,C.good);txt(x,'→',cx+5.2*s,cy-12,C.good,13,'center');txt(x,'←',cx-5.2*s,cy-12,C.good,13,'center')};
function r1(){const m=S.m1;ro('s1-ro',t('r1',{m:fx(m,2),lf:fx((1-m)/F1,3),ff:fx(MODEL.fFront(F1,m),3),lb:fx((1+m)/F1,3),fb:fx(MODEL.fBack(F1,m),3),f0:fx(F1,1)}))}
TICK[1]=function(dt){if(!S.run1)return false;S.tau1=(S.tau1+dt*0.9/F1*F1*0.5)%(1/F1);redraw(1);return true};
DRAW[2]=function(x,w,h){const narrow=w<520,s=Math.min(w/12,h/8),cx=narrow?w/2:w*0.3,cy=narrow?h*0.32:h/2,F=1.2;rings(x,cx,cy,s,S.m2,F,0.35,12,C.acc,5.5);dot(x,cx,cy,6,C.acc2);arrow(x,cx,cy,cx+34,cy,C.acc2,2);
  const th=S.a2*Math.PI/180,R=3.6*s,lx=cx+R*Math.cos(th),ly=cy-R*Math.sin(th);x.setLineDash([3,4]);line(x,cx,cy,lx,ly,C.muted,1);x.setLineDash([]);dot(x,lx,ly,7,C.good);
  const p=narrow?{x:16,y:h*0.62,w:w-32,h:h*0.32}:{x:w*0.55,y:20,w:w*0.42,h:h-60};x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,"f′",p.x+4,p.y+13,C.muted,12);txt(x,'θ',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  const fm=MODEL.fAt(1,0.9,0),Y=v=>p.y+p.h*(1-(v-0.4)/(fm-0.4));x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();for(let i=0;i<=180;i++){const a=i*2*Math.PI/180,v=MODEL.fAt(1,S.m2,a);i?x.lineTo(p.x+p.w*i/180,Y(v)):x.moveTo(p.x,Y(v))}x.stroke();line(x,p.x,Y(1),p.x+p.w,Y(1),'rgba(255,255,255,.2)',1);dot(x,p.x+p.w*S.a2/360,Y(MODEL.fAt(1,S.m2,th)),6,C.good)};
function r2(){const th=S.a2*Math.PI/180,fp=MODEL.fAt(1,S.m2,th);ro('s2-ro',t('r2',{m:fx(S.m2,2),a:S.a2,fp:fx(fp,3),dir:Math.abs(fp-1)<0.005?t('dirSame'):(fp>1?t('dirHigh'):t('dirLow'))}))}
function T3end(){return 2*L3/S.m3+L3+S.b3}
DRAW[3]=function(x,w,h){const narrow=w<520,s=Math.min(w/14,h/6),cx=w/2,top=narrow?10:10,carY=narrow?60:h*0.22,Y0=narrow?60:h*0.22;
  const area=narrow?{x:0,y:0,w:w,h:130}:{x:0,y:0,w:w,h:h*0.4},cy=area.h*0.35;line(x,10,cy,w-10,cy,C.line,2);const sc=(w-60)/(2*L3);const te=MODEL.emit(S.m3,S.b3,L3,S.t3);const xs=-L3+S.m3*S.t3;const px=w/2+xs*sc;if(Math.abs(xs)<L3+1){x.fillStyle=C.acc2;x.fillRect(px-12,cy-8,24,16)}
  const ly=cy+S.b3*sc*0.6+4;dot(x,w/2,Math.min(area.h-14,ly),7,C.good);
  const p=narrow?{x:16,y:140,w:w-32,h:h-170}:{x:30,y:area.h+10,w:w-50,h:h-area.h-40};x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,"f′",p.x+4,p.y+13,C.muted,12);txt(x,'t',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  const lo=MODEL.fBack(1,0.9),hi=MODEL.fFront(1,0.9),Y=v=>p.y+p.h*(1-(v-lo*0.95)/(hi*1.05-lo*0.95)),Te=T3end();line(x,p.x,Y(1),p.x+p.w,Y(1),'rgba(255,255,255,.2)',1);
  x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();let on=false;for(const q of S.H3){const px2=p.x+p.w*q.t/Te,py=Y(q.f);if(on)x.lineTo(px2,py);else{x.moveTo(px2,py);on=true}}x.stroke();if(!S.H3.length)txt(x,t('hint'),p.x+p.w/2,p.y+p.h/2,C.muted,13,'center')};
function r3(){const m=S.m3,last=S.H3.length?S.H3[S.H3.length-1].f:NaN,fc=MODEL.heard(1,m,S.b3,L3,L3/m+Math.hypot(0,S.b3));ro('s3-ro',t('r3',{m:fx(m,2),b:fx(S.b3,1),hi:fx(MODEL.fFront(1,m),3),lo:fx(MODEL.fBack(1,m),3),fp:isNaN(last)?'—':fx(last,3),fc:fx(fc,3)}))}
function reset3(){S.run3=false;S.t3=0;S.H3=[]}
function adv3(dt){S.t3=Math.min(T3end(),S.t3+dt);const f=MODEL.heard(1,S.m3,S.b3,L3,S.t3);if(!isNaN(f))S.H3.push({t:S.t3,f:f});if(S.t3>=T3end())S.run3=false}
TICK[3]=function(dt){if(!S.run3)return false;adv3(dt*T3end()/7);redraw(3);r3();return S.run3};
DRAW[4]=function(x,w,h){const s=Math.min(w/12,h/7),cx=w/2+ (S.M4>1?s*2:0),cy=h/2,F=1.5,per=1/F;const tau=S.tau4;rings(x,cx,cy,s,S.M4,F,tau,Math.ceil(7/per),C.acc,9);dot(x,cx,cy,6,C.acc2);
  if(S.M4>1){const al=MODEL.mach(S.M4),L=8*s;[1,-1].forEach(sg=>{line(x,cx,cy,cx-L*Math.cos(al),cy+sg*L*Math.sin(al),C.acc2,2)})}};
function r4(){const M=S.M4,al=MODEL.mach(M);ro('s4-ro',t('r4',{M:fx(M,1),regime:M<0.995?t('regSub'):(M<1.005?t('regSon'):t('regSup')),cone:M>1.005?t('coneAng',{al:fx(al*180/Math.PI,1)}):t('coneNone')}))}
TICK[4]=function(dt){if(!S.run4)return false;S.tau4=(S.tau4+dt*0.8)%(1/1.5);redraw(4);return true};
function toggle(k,fn){S['run'+k]=!S['run'+k];if(S['run'+k]){if(REDUCE){fn(0.4);S['run'+k]=false;redraw(k)}else kick()}}
function init(){
  slider('s0-f',v=>fx(v,1),v=>{S.f=v;reset0();redraw(0);r0()});btn('s0-play',()=>toggle(0,d=>{S.t0+=d*2;r0()}));btn('s0-reset',()=>{reset0();redraw(0);r0()});
  slider('s1-m',v=>fx(v,2),v=>{S.m1=v;redraw(1);r1()});btn('s1-play',()=>toggle(1,d=>{S.tau1=(S.tau1+d*0.3)%(1/F1)}));
  slider('s2-m',v=>fx(v,2),v=>{S.m2=v;redraw(2);r2()});slider('s2-a',v=>v+'°',v=>{S.a2=v;redraw(2);r2()});
  slider('s3-m',v=>fx(v,2),v=>{S.m3=v;reset3();redraw(3);r3()});slider('s3-b',v=>fx(v,1),v=>{S.b3=v;reset3();redraw(3);r3()});btn('s3-play',()=>toggle(3,d=>{adv3(d*T3end()/7);r3()}));btn('s3-reset',()=>{reset3();redraw(3);r3()});
  slider('s4-m',v=>fx(v,1),v=>{S.M4=v;redraw(4);r4()});btn('s4-play',()=>toggle(4,d=>{S.tau4=(S.tau4+d*0.3)%(1/1.5)}))}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=0;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

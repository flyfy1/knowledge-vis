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

/* Titration: V0 = 25 mL acid titrated with base of the same concentration c (default 0.1 M). pH from charge balance. */
const MODEL={
  V0:25,KW:1e-14,KA:1.8e-5,
  pH(kind,ca,cb,V,ka){const V0=MODEL.V0,vt=V0+V,na=cb*V/vt,ct=ca*V0/vt;if(kind==='s'){const e=na-ct;if(Math.abs(e)<1e-18)return 7;if(e<0){const h=(-e+Math.sqrt(e*e+4*MODEL.KW))/2;return-Math.log10(h)}const oh=(e+Math.sqrt(e*e+4*MODEL.KW))/2;return 14+Math.log10(oh)}
    const f=lh=>{const h=Math.pow(10,lh);return h+na-ct*ka/(ka+h)-MODEL.KW/h};let lo=-14,hi=0;for(let i=0;i<80;i++){const m=(lo+hi)/2;if(f(m)>0)hi=m;else lo=m}return-(lo+hi)/2},
  veq(ca,cb){return ca*MODEL.V0/cb},
  slope(kind,ca,cb,V,ka){const d=0.01,a=Math.max(0,V-d),b=V+d;return(MODEL.pH(kind,ca,cb,b,ka)-MODEL.pH(kind,ca,cb,a,ka))/(b-a)},
  steepest(kind,ca,cb,ka){let best=0,bv=0;for(let i=0;i<=1000;i++){const V=i*0.05,s=MODEL.slope(kind,ca,cb,V,ka);if(s>best){best=s;bv=V}}return bv},
  frac(pH,pk){return 1/(1+Math.pow(10,pk-pH))},
  endV(kind,ca,cb,ka,pk){let lo=0,hi=100;if(MODEL.pH(kind,ca,cb,0,ka)>=pk)return 0;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(MODEL.pH(kind,ca,cb,m,ka)<pk)lo=m;else hi=m}return(lo+hi)/2},
  IND:{mo:{pk:3.7,a:[231,76,60],b:[240,220,70],lo:3.1,hi:4.4,name:'iMoN'},btb:{pk:7.0,a:[240,220,70],b:[60,110,220],lo:6.0,hi:7.6,name:'iBtbN'},pp:{pk:9.3,a:[235,240,245],b:[232,60,160],lo:8.2,hi:10,name:'iPpN'}},
  unknown(seed){const s=Math.sin(seed*12.9898)*43758.5453;return 0.05+0.1*(s-Math.floor(s))}
};
const S={k0:'s',v0:0,k1:'s',v1:20,pka:4.75,v2:12.5,c3:-1,ind:'pp',k3:'s',v4:0,seed:3,done:null};
const kaOf=kind=>kind==='w'?MODEL.KA:null;
function frame(w,h){const narrow=w<520;return narrow?{fl:{x:0,y:0,w:w,h:90},p:{x:44,y:100,w:w-60,h:h-130}}:{fl:{x:0,y:0,w:Math.floor(w*0.24),h:h},p:{x:Math.floor(w*0.24)+34,y:14,w:w-Math.floor(w*0.24)-50,h:h-44}}}
function flask(x,r,fill,rgb){const cx=r.x+r.w/2,cy=r.y+r.h/2,hh=Math.min(r.h-20,110),ww=Math.min(r.w-20,70);x.strokeStyle=C.muted;x.lineWidth=2;x.strokeRect(cx-ww/2,cy-hh/2,ww,hh);const lv=hh*Math.min(1,fill);x.fillStyle='rgba('+rgb.join(',')+',.75)';x.fillRect(cx-ww/2+1,cy+hh/2-lv,ww-2,lv-1)}
function axes(x,p,xl,yl){x.strokeStyle=C.line;x.lineWidth=1;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,yl,p.x+4,p.y+13,C.muted,12);txt(x,xl,p.x+p.w-4,p.y+p.h+14,C.muted,12,'right')}
function curve(x,p,f,v1,col,lw,dash){x.setLineDash(dash?[5,4]:[]);x.strokeStyle=col;x.lineWidth=lw;x.beginPath();const n=200;for(let i=0;i<=n;i++){const V=Math.min(50,v1)*i/n,px=p.x+p.w*V/50,py=p.y+p.h*(1-f(V)/14);i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();x.setLineDash([])}
const PH=(kind,ca,cb,ka)=>V=>MODEL.pH(kind,ca,cb,V,ka);
function note(V,veq){return Math.abs(V-veq)<0.26?t('nAt'):(V<veq?t('nBefore'):t('nAfter'))}
DRAW[0]=function(x,w,h){const F=frame(w,h),p=F.p,kind=S.k0,f=PH(kind,0.1,0.1,kaOf(kind));flask(x,F.fl,(25+S.v0)/80,[110,170,230]);axes(x,p,'V (mL)','pH');curve(x,p,f,50,'rgba(160,170,185,.25)',1,true);curve(x,p,f,S.v0,C.acc2,3);dot(x,p.x+p.w*S.v0/50,p.y+p.h*(1-f(S.v0)/14),6,C.acc);line(x,p.x+p.w*0.5,p.y,p.x+p.w*0.5,p.y+p.h,'rgba(126,226,168,.4)',1)};
function kindName(k){return k==='s'?t('aStrong'):t('aWeak')}
function r0(){const f=PH(S.k0,0.1,0.1,kaOf(S.k0));ro('s0-ro',t('r0',{kind:kindName(S.k0),v:fx(S.v0,1),ph:fx(f(S.v0),2),veq:fx(MODEL.veq(0.1,0.1),1),note:note(S.v0,25)}))}
DRAW[1]=function(x,w,h){const F=frame(w,h),p=F.p,kind=S.k1,ka=kaOf(kind),f=PH(kind,0.1,0.1,ka);flask(x,F.fl,(25+S.v1)/80,[110,170,230]);axes(x,p,'V (mL)','pH');curve(x,p,f,50,C.acc2,2.5);dot(x,p.x+p.w*S.v1/50,p.y+p.h*(1-f(S.v1)/14),6,C.acc);
  const sl=MODEL.slope(kind,0.1,0.1,S.v1,ka),bh=Math.min(1,sl/4)*p.h*0.8;x.fillStyle='rgba(255,180,84,.6)';x.fillRect(p.x+p.w*S.v1/50-6,p.y+p.h-bh,12,bh)};
function r1(){const ka=kaOf(S.k1),sl=MODEL.slope(S.k1,0.1,0.1,S.v1,ka);ro('s1-ro',t('r1',{kind:kindName(S.k1),v:fx(S.v1,1),ph:fx(MODEL.pH(S.k1,0.1,0.1,S.v1,ka),2),slope:fx(sl,2),vmax:fx(MODEL.steepest(S.k1,0.1,0.1,ka),2),veq:'25.0'}))}
DRAW[2]=function(x,w,h){const F=frame(w,h),p=F.p,ka=Math.pow(10,-S.pka),f=PH('w',0.1,0.1,ka),g=PH('s',0.1,0.1,null);flask(x,F.fl,(25+S.v2)/80,[110,170,230]);axes(x,p,'V (mL)','pH');curve(x,p,g,50,'rgba(160,170,185,.6)',1.5,true);curve(x,p,f,50,C.acc2,3);
  line(x,p.x+p.w*0.25,p.y,p.x+p.w*0.25,p.y+p.h,C.good,1);const yk=p.y+p.h*(1-S.pka/14);x.setLineDash([3,4]);line(x,p.x,yk,p.x+p.w,yk,C.acc,1);x.setLineDash([]);txt(x,'pKₐ',p.x+p.w-4,yk-4,C.acc,12,'right');dot(x,p.x+p.w*S.v2/50,p.y+p.h*(1-f(S.v2)/14),6,C.acc)};
function r2(){const ka=Math.pow(10,-S.pka),f=PH('w',0.1,0.1,ka);ro('s2-ro',t('r2',{pka:fx(S.pka,2),vh:'12.5',phh:fx(f(12.5),2),phe:fx(f(25),2),v:fx(S.v2,1),ph:fx(f(S.v2),2)}))}
function c3(){return Math.pow(10,S.c3)}
function fills(pH,ind){const q=MODEL.frac(pH,ind.pk);return ind.a.map((a,i)=>Math.round(a+(ind.b[i]-a)*q))}
DRAW[3]=function(x,w,h){const F=frame(w,h),p=F.p,c=c3(),ka=kaOf(S.k3),f=PH(S.k3,c,c,ka),ind=MODEL.IND[S.ind],ve=MODEL.endV(S.k3,c,c,ka,ind.pk);flask(x,F.fl,0.7,fills(f(ve),ind));axes(x,p,'V (mL)','pH');
  const y1=p.y+p.h*(1-ind.hi/14),y2=p.y+p.h*(1-ind.lo/14);x.fillStyle='rgba('+ind.b.join(',')+',.25)';x.fillRect(p.x,y1,p.w,y2-y1);x.fillStyle='rgba('+ind.a.join(',')+',.12)';curve(x,p,f,50,C.acc2,3);
  line(x,p.x+p.w*0.5,p.y,p.x+p.w*0.5,p.y+p.h,'rgba(126,226,168,.5)',1);dot(x,p.x+p.w*ve/50,p.y+p.h*(1-f(ve)/14),7,C.acc);line(x,p.x+p.w*ve/50,p.y+p.h,p.x+p.w*ve/50,p.y+p.h-8,C.acc,3)};
function r3(){const c=c3(),ka=kaOf(S.k3),f=PH(S.k3,c,c,ka),ind=MODEL.IND[S.ind],ve=MODEL.endV(S.k3,c,c,ka,ind.pk),veq=25,v1=MODEL.endV(S.k3,c,c,ka,f(veq)-1.5>0?f(veq)-1.5:0.1),lowPh=f(24.9*1),hiPh=f(25.1);
  /* leap defined as the pH range between V = 24.9 and 25.1 mL (0.1 mL either side of equivalence) */
  const pLo=Math.min(f(24.9),f(25.1)),pHi=Math.max(f(24.9),f(25.1));ro('s3-ro',t('r3',{acid:kindName(S.k3),ind:t(ind.name),lo:fx(pLo,1),hi:fx(pHi,1),v1:'24.9',v2:'25.1',pk:fx(ind.pk,1),ve:fx(ve,2),veq:'25.0',err:fx(ve-veq,2),rel:fx(Math.abs(ve-veq)/veq*100,1)}))}
function ctrue(){return MODEL.unknown(S.seed)}
DRAW[4]=function(x,w,h){const F=frame(w,h),p=F.p,ct=ctrue(),veq=ct*25/0.1,f=PH('s',ct,0.1,null),ind=MODEL.IND.pp;flask(x,F.fl,(25+S.v4)/80,fills(f(S.v4),ind));axes(x,p,'V (mL)','pH');
  x.strokeStyle='rgba(160,170,185,.4)';x.lineWidth=1;const y1=p.y+p.h*(1-ind.lo/14);x.setLineDash([3,4]);line(x,p.x,y1,p.x+p.w,y1,C.acc,1);x.setLineDash([]);
  curve(x,p,f,S.v4,C.acc2,3);dot(x,p.x+p.w*S.v4/50,p.y+p.h*(1-f(S.v4)/14),6,C.acc);if(S.done!==null)line(x,p.x+p.w*S.done/50,p.y,p.x+p.w*S.done/50,p.y+p.h,C.good,2)};
function r4(){if(S.done!==null){const c=0.1*S.done/25,ct=ctrue();ro('s4-ro',t('r4done',{v:fx(S.done,1),c:fx(c,4),ct:fx(ct,4),err:fx(Math.abs(c-ct)/ct*100,2)}));return}const f=PH('s',ctrue(),0.1,null),ph=f(S.v4);ro('s4-ro',t('r4',{v:fx(S.v4,1),col:ph>=8.2?t('colPink',{ph:fx(ph,1)}):t('colNone',{ph:fx(ph,1)})}))}
function setActive(ids,on){ids.forEach(id=>$(id).classList.toggle('active',id===on))}
function init(){
  slider('s0-v',v=>fx(v,1),v=>{S.v0=v;redraw(0);r0()});btn('s0-strong',()=>{S.k0='s';setActive(['s0-strong','s0-weak'],'s0-strong');redraw(0);r0()});btn('s0-weak',()=>{S.k0='w';setActive(['s0-strong','s0-weak'],'s0-weak');redraw(0);r0()});
  slider('s1-v',v=>fx(v,1),v=>{S.v1=v;redraw(1);r1()});btn('s1-strong',()=>{S.k1='s';setActive(['s1-strong','s1-weak'],'s1-strong');redraw(1);r1()});btn('s1-weak',()=>{S.k1='w';setActive(['s1-strong','s1-weak'],'s1-weak');redraw(1);r1()});
  slider('s2-pka',v=>fx(v,2),v=>{S.pka=v;redraw(2);r2()});slider('s2-v',v=>fx(v,1),v=>{S.v2=v;redraw(2);r2()});
  slider('s3-c',v=>'10^'+fx(v,1),v=>{S.c3=v;redraw(3);r3()});[['mo','s3-mo'],['btb','s3-btb'],['pp','s3-pp']].forEach(([k,id])=>btn(id,()=>{S.ind=k;setActive(['s3-mo','s3-btb','s3-pp'],id);redraw(3);r3()}));btn('s3-strong',()=>{S.k3='s';setActive(['s3-strong','s3-weak'],'s3-strong');redraw(3);r3()});btn('s3-weak',()=>{S.k3='w';setActive(['s3-strong','s3-weak'],'s3-weak');redraw(3);r3()});
  slider('s4-v',v=>fx(v,1),v=>{S.v4=v;S.done=null;redraw(4);r4()});btn('s4-read',()=>{S.done=S.v4;redraw(4);r4()});btn('s4-new',()=>{S.seed+=1;S.v4=0;S.done=null;$('s4-v').value=0;FMT['s4-v']();redraw(4);r4()});
  setActive(['s0-strong','s0-weak'],'s0-strong');setActive(['s1-strong','s1-weak'],'s1-strong');setActive(['s3-mo','s3-btb','s3-pp'],'s3-pp');setActive(['s3-strong','s3-weak'],'s3-strong')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=2;QUIZ.step=2;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

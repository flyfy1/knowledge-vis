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

/* Electromagnetic induction: dipole on axis of a unit loop; flux Phi(z)=pol/(1+z^2)^1.5. */
const MODEL={
  flux(z,pol){return(pol||1)/Math.pow(1+z*z,1.5)},
  dfluxdz(z,pol){return-3*(pol||1)*z/Math.pow(1+z*z,2.5)},
  emf(n,z,v,pol){return-n*MODEL.dfluxdz(z,pol)*v},
  zt(w,t){return 3*Math.sin(w*t)},vt(w,t){return 3*w*Math.cos(w*t)},
  peak(n,w){let m=0;const T=2*Math.PI/w;for(let i=0;i<4000;i++){const t=T*i/4000,e=Math.abs(MODEL.emf(n,MODEL.zt(w,t),MODEL.vt(w,t),1));if(e>m)m=e}return m},
  genPhi(b,w,t){return b*Math.cos(w*t)},genEmf(b,w,t){return b*w*Math.sin(w*t)},
  rms(b,w){let s=0;const T=2*Math.PI/w,n=4000;for(let i=0;i<n;i++){const e=MODEL.genEmf(b,w,T*i/n);s+=e*e}return Math.sqrt(s/n)}
};
const S={z:-2,w1:1.2,t1:0,run1:false,H1:[],pk1:0,v2:1,pol:1,n3:1,w3:1,w4:1.5,b4:1,t4:0,run4:false,H4:[]};
function magnet(x,cx,cy,z,k,pol){const mx=cx+z*k,L=pol>0?'S':'N',R=pol>0?'N':'S';x.fillStyle=L==='N'?'#c94a62':'#3d7bd9';x.fillRect(mx-30,cy-12,30,24);x.fillStyle=R==='N'?'#c94a62':'#3d7bd9';x.fillRect(mx,cy-12,30,24);txt(x,L,mx-15,cy+5,'#fff',13,'center');txt(x,R,mx+15,cy+5,'#fff',13,'center')}
function drawLoop(x,cx,cy,rad){x.strokeStyle=C.good;x.lineWidth=4;x.beginPath();x.ellipse(cx,cy,9,rad,0,0,6.2832);x.stroke()}
function curve(x,r,f,t0,t1,col,lw,ymin,ymax){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();const n=200;for(let i=0;i<=n;i++){const u=t0+(t1-t0)*i/n,v=f(u),px=r.x+r.w*i/n,py=r.y+r.h*(1-(v-ymin)/(ymax-ymin));if(i)x.lineTo(px,py);else x.moveTo(px,py)}x.stroke()}
function axes(x,r,lab){x.strokeStyle=C.line;x.lineWidth=1;x.strokeRect(r.x,r.y,r.w,r.h);txt(x,lab,r.x+4,r.y+13,C.muted,12)}
function series(x,r,H,key,col,ymin,ymax,t1,span){x.strokeStyle=col;x.lineWidth=2;x.beginPath();let on=false;for(const p of H){const px=r.x+r.w*(1-(t1-p.t)/span);if(px<r.x)continue;const py=r.y+r.h*(1-(p[key]-ymin)/(ymax-ymin));if(on)x.lineTo(px,py);else{x.moveTo(px,py);on=true}}x.stroke()}
DRAW[0]=function(x,w,h){const cx=w/2,cy=70,k=Math.min(w/8,60);line(x,10,cy,w-10,cy,C.line,1);drawLoop(x,cx,cy,50);magnet(x,cx,cy,S.z,k,1);
  const r={x:30,y:150,w:w-50,h:h-180};axes(x,r,'Φ');curve(x,r,u=>MODEL.flux(u,1),-3.5,3.5,C.acc,2.5,0,1.1);
  const px=r.x+r.w*(S.z+3.5)/7,py=r.y+r.h*(1-MODEL.flux(S.z,1)/1.1);dot(x,px,py,6,C.acc2);line(x,px,py,px,r.y+r.h,C.acc2,1);txt(x,'z',r.x+r.w-8,r.y+r.h+14,C.muted,12)};
function r0(){const p=MODEL.flux(S.z,1);ro('s0-ro',t('r0',{z:fx(S.z,1),phi:fx(p,3),pct:fx(p*100,0)}))}
function s1now(){return{phi:MODEL.flux(MODEL.zt(S.w1,S.t1),1),eps:MODEL.emf(1,MODEL.zt(S.w1,S.t1),MODEL.vt(S.w1,S.t1),1)}}
DRAW[1]=function(x,w,h){const narrow=w<520,sw=narrow?w:Math.floor(w*0.38),cx=sw/2,cy=narrow?50:h/2,k=Math.min(sw/8,50);line(x,6,cy,sw-6,cy,C.line,1);drawLoop(x,cx,cy,40);magnet(x,cx,cy,MODEL.zt(S.w1,S.t1),k,1);
  const ox=narrow?10:sw+10,oy=narrow?110:10,cw=w-ox-8,ch=narrow?h-120:h-20,span=8,r1={x:ox,y:oy,w:cw,h:ch/2-8},r2={x:ox,y:oy+ch/2+4,w:cw,h:ch/2-8};
  axes(x,r1,'Φ(t)');axes(x,r2,'ε(t)');const t1=Math.max(S.t1,span);series(x,r1,S.H1,'phi',C.acc,-0.1,1.1,t1,span);series(x,r2,S.H1,'eps',C.acc2,-6,6,t1,span);
  if(!S.H1.length)txt(x,t('hint1'),r1.x+r1.w/2,r1.y+r1.h/2+8,C.muted,13,'center')};
function r1(){const s=s1now();ro('s1-ro',t('r1',{t:fx(S.t1),phi:fx(s.phi,3),eps:fx(s.eps,3),peak:fx(S.pk1,3)}))}
function reset1(){S.run1=false;S.t1=0;S.H1=[];S.pk1=0}
function adv1(dt){S.t1+=dt;const s=s1now();S.H1.push({t:S.t1,phi:s.phi,eps:s.eps});S.pk1=Math.max(S.pk1,Math.abs(s.eps));while(S.H1.length&&S.H1[0].t<S.t1-9)S.H1.shift()}
TICK[1]=function(dt){if(!S.run1)return false;adv1(dt);redraw(1);r1();return true};
function lenz(){const z=-1.5,d=MODEL.dfluxdz(z,S.pol)*S.v2;return{dphi:d,eps:-d}}
function cur(x,px,py,out){x.strokeStyle=C.good;x.fillStyle=C.good;x.lineWidth=2;x.beginPath();x.arc(px,py,9,0,6.2832);x.stroke();if(out)dot(x,px,py,3,C.good);else{line(x,px-5,py-5,px+5,py+5,C.good,2);line(x,px-5,py+5,px+5,py-5,C.good,2)}}
DRAW[2]=function(x,w,h){const cx=w/2,cy=h/2,k=Math.min(w/8,60),z=-1.5,L=lenz();line(x,10,cy,w-10,cy,C.line,1);drawLoop(x,cx,cy,70);magnet(x,cx,cy,z,k,S.pol);
  if(S.v2!==0){arrow(x,cx+z*k,cy-26,cx+z*k+Math.sign(S.v2)*40,cy-26,C.acc,3);txt(x,'v',cx+z*k+Math.sign(S.v2)*52,cy-22,C.acc,13,'center')}
  if(Math.abs(L.eps)>1e-9){const ccw=L.eps>0;cur(x,cx,cy-70,ccw);cur(x,cx,cy+70,!ccw);const d=ccw?1:-1,len=Math.min(80,18+Math.abs(L.eps)*70);arrow(x,cx-d*len/2,cy,cx+d*len/2,cy,C.acc3,3);txt(x,'B',cx+d*(len/2+10),cy-8,C.acc3,13,'center')}
  txt(x,'+z →',w-40,h-12,C.muted,12)};
function r2(){const L=lenz(),e=L.eps;ro('s2-ro',t('r2',{dphi:fx(L.dphi,3),trend:Math.abs(L.dphi)<1e-9?t('trendNone'):(L.dphi>0?t('trendUp'):t('trendDown')),eps:fx(e,3),dir:Math.abs(e)<1e-9?t('dirNone'):(e>0?t('dirCcw'):t('dirCw')),bdir:Math.abs(e)<1e-9?t('bNone'):(e>0?t('bRight'):t('bLeft'))}))}
DRAW[3]=function(x,w,h){const r={x:30,y:14,w:w-44,h:h-40},T0=2*Math.PI,T=T0/S.w3,pk=MODEL.peak(S.n3,S.w3),ymax=Math.max(MODEL.peak(1,1)*10,pk)*1.1;axes(x,r,'ε');line(x,r.x,r.y+r.h/2,r.x+r.w,r.y+r.h/2,C.line,1);
  const f=(n,wv)=>u=>MODEL.emf(n,MODEL.zt(wv,u),MODEL.vt(wv,u),1);curve(x,r,f(1,1),0,T0,'rgba(160,170,185,.7)',1.5,-ymax,ymax);curve(x,r,f(S.n3,S.w3),0,T0,C.acc2,2.5,-ymax,ymax);txt(x,'t →  (0 … 2π)',r.x+r.w-6,r.y+r.h+15,C.muted,12,'right')};
function r3(){const pk=MODEL.peak(S.n3,S.w3),b=MODEL.peak(1,1);ro('s3-ro',t('r3',{peak:fx(pk,3),base:fx(b,3),ratio:fx(pk/b,2),nw:fx(S.n3*S.w3,2),per:fx(2*Math.PI/S.w3,2)}))}
DRAW[4]=function(x,w,h){const narrow=w<520,sw=narrow?w:Math.floor(w*0.34),cx=sw/2,cy=narrow?60:h/2,th=S.w4*S.t4;
  for(let i=-2;i<=2;i++)arrow(x,cx-sw/2+12,cy+i*22,cx+sw/2-12,cy+i*22,'rgba(110,231,255,.3)',1);txt(x,'B',cx,14,C.acc,12,'center');
  x.strokeStyle=C.good;x.lineWidth=5;x.beginPath();x.moveTo(cx-Math.sin(th)*0-0,cy);x.lineTo(cx+Math.sin(th)*46,cy-Math.cos(th)*46);x.moveTo(cx,cy);x.lineTo(cx-Math.sin(th)*46,cy+Math.cos(th)*46);x.stroke();dot(x,cx,cy,4,C.text);
  const ox=narrow?10:sw+10,oy=narrow?125:10,cw=w-ox-8,ch=narrow?h-135:h-20,span=8,r1={x:ox,y:oy,w:cw,h:ch/2-8},r2={x:ox,y:oy+ch/2+4,w:cw,h:ch/2-8};axes(x,r1,'Φ(t)');axes(x,r2,'ε(t)');
  const t1=Math.max(S.t4,span);series(x,r1,S.H4,'phi',C.acc,-2.2,2.2,t1,span);series(x,r2,S.H4,'eps',C.acc2,-8.5,8.5,t1,span);if(!S.H4.length)txt(x,t('hint1'),r1.x+r1.w/2,r1.y+r1.h/2+8,C.muted,13,'center')};
function r4(){const th=((S.w4*S.t4*180/Math.PI)%360);ro('s4-ro',t('r4',{f:fx(S.w4/(2*Math.PI),3),peak:fx(S.b4*S.w4,3),rms:fx(S.b4*S.w4/Math.SQRT2,3),rmsn:fx(MODEL.rms(S.b4,S.w4),3),t:fx(S.t4),th:fx(th,0),eps:fx(MODEL.genEmf(S.b4,S.w4,S.t4),3)}))}
function reset4(){S.run4=false;S.t4=0;S.H4=[]}
function adv4(dt){S.t4+=dt;S.H4.push({t:S.t4,phi:MODEL.genPhi(S.b4,S.w4,S.t4),eps:MODEL.genEmf(S.b4,S.w4,S.t4)});while(S.H4.length&&S.H4[0].t<S.t4-9)S.H4.shift()}
TICK[4]=function(dt){if(!S.run4)return false;adv4(dt);redraw(4);r4();return true};
function init(){
  slider('s0-z',v=>fx(v,1),v=>{S.z=v;redraw(0);r0()});
  slider('s1-w',v=>fx(v,1),v=>{S.w1=v;reset1();redraw(1);r1()});btn('s1-play',()=>{if(S.run1){S.run1=false;return}S.run1=true;if(REDUCE){adv1(0.4);S.run1=false;redraw(1);r1()}else kick()});btn('s1-reset',()=>{reset1();redraw(1);r1()});
  slider('s2-v',v=>fx(v,1),v=>{S.v2=v;redraw(2);r2()});btn('s2-flip',()=>{S.pol=-S.pol;redraw(2);r2()});
  slider('s3-n',v=>fx(v,0),v=>{S.n3=v;redraw(3);r3()});slider('s3-w',v=>fx(v,1),v=>{S.w3=v;redraw(3);r3()});
  slider('s4-w',v=>fx(v,1),v=>{S.w4=v;reset4();redraw(4);r4()});slider('s4-b',v=>fx(v,1),v=>{S.b4=v;reset4();redraw(4);r4()});btn('s4-play',()=>{if(S.run4){S.run4=false;return}S.run4=true;if(REDUCE){adv4(0.4);S.run4=false;redraw(4);r4()}else kick()});btn('s4-reset',()=>{reset4();redraw(4);r4()})}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=2;QUIZ.step=3;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

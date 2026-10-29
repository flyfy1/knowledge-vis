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

/* Magnetic force: B out of the screen, m = 1. Closed-form orbits; probe cross-checks with numerical integration. */
const MODEL={
  force(q,b,vx,vy){return[q*b*vy,-q*b*vx]},
  radius(m,v,q,b){return m*v/(Math.abs(q)*b)},
  period(m,q,b){return 2*Math.PI*m/(Math.abs(q)*b)},
  omega(m,q,b){return-q*b/m},
  orbit(r,w,t){const a=Math.PI/2+w*t;return[r*Math.cos(a),r*Math.sin(a)]},
  circum(p1,p2,p3){const ax=p1[0],ay=p1[1],bx=p2[0],by=p2[1],cx=p3[0],cy=p3[1],d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));if(Math.abs(d)<1e-9)return NaN;const ux=((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/d,uy=((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/d;return Math.hypot(ax-ux,ay-uy)},
  landing(m,v,q,b){return 2*MODEL.radius(m,v,q,b)},
  mass(x,v,q,b){return q*b*x/(2*v)},
  selected(e,b){return e/b},
  drift(v,e,b,q,t){const u=e/b,w=-q*b,wx=v-u,wy=0,s=Math.sin(w*t),c=Math.cos(w*t);return[u*t+(wx*s-wy*(1-c))/w,(wx*(1-c)+wy*s)/w]}
};
const S={ang:30,q:1,b0:1,v:1.2,b1:1,t1:0,run1:false,b2:1,m2:1,t2:0,run2:false,b3:1,mu:2.5,v4:1,e4:1};
const sc=h=>h/9.4;
function fmtT(v){return fx(v,2)}
DRAW[0]=function(x,w,h){const cx=w/2,cy=h/2,k=70,a=S.ang*Math.PI/180,vx=Math.cos(a),vy=Math.sin(a),f=MODEL.force(S.q,S.b0,vx,vy);
  for(let i=-4;i<=4;i++)for(let j=-2;j<=2;j++){const px=cx+i*70,py=cy+j*60;dot(x,px,py,2,'rgba(110,231,255,.35)')}
  const fm=Math.hypot(f[0],f[1]);if(fm>1e-9){x.strokeStyle='rgba(246,164,91,.6)';x.setLineDash([4,4]);x.lineWidth=1.5;const r=1/(S.b0*Math.abs(S.q)),sg=Math.sign(f[0]*(-vy)+f[1]*vx)||1;x.beginPath();x.arc(cx+f[0]/fm*r*k*0.9,cy-f[1]/fm*r*k*0.9,r*k*0.9,0,6.2832);x.stroke();x.setLineDash([])}
  arrow(x,cx,cy,cx+vx*k,cy-vy*k,C.acc,3);txt(x,'v',cx+vx*k+6,cy-vy*k,C.acc,13);
  if(fm>1e-9){const L=k*Math.min(1.4,0.6*S.b0*Math.abs(S.q)+0.3);arrow(x,cx,cy,cx+f[0]/fm*L,cy-f[1]/fm*L,C.acc2,3);txt(x,'F',cx+f[0]/fm*L+6,cy-f[1]/fm*L,C.acc2,13)}
  dot(x,cx,cy,7,S.q>0?C.acc3:(S.q<0?C.acc:C.muted));txt(x,'B ⊙',16,22,C.muted,13)};
function r0(){const a=S.ang*Math.PI/180,vx=Math.cos(a),vy=Math.sin(a),f=MODEL.force(S.q,S.b0,vx,vy);ro('s0-ro',t('r0',{vx:fx(vx),vy:fx(vy),fx:fx(f[0]),fy:fx(f[1]),f:fx(Math.hypot(f[0],f[1])),dot:fx(f[0]*vx+f[1]*vy)}))}
const T1={pts:[]};
function circ(x,cx,cy,r,col,dash){x.strokeStyle=col;x.lineWidth=1;if(dash)x.setLineDash([4,4]);x.beginPath();x.arc(cx,cy,r,0,6.2832);x.stroke();x.setLineDash([])}
DRAW[1]=function(x,w,h){const cx=w/2,cy=h/2,k=sc(h),r=MODEL.radius(1,S.v,1,S.b1),wv=MODEL.omega(1,1,S.b1);
  for(let i=-5;i<=5;i++)for(let j=-3;j<=3;j++)txt(x,'·',cx+i*60,cy+j*50,'rgba(110,231,255,.35)',16,'center');
  circ(x,cx,cy,r*k,'rgba(255,255,255,.15)',true);
  x.strokeStyle=C.acc2;x.lineWidth=2;x.beginPath();T1.pts.forEach((p,i)=>{if(i)x.lineTo(cx+p[0]*k,cy-p[1]*k);else x.moveTo(cx+p[0]*k,cy-p[1]*k)});x.stroke();
  const p=MODEL.orbit(r,wv,S.t1);dot(x,cx+p[0]*k,cy-p[1]*k,6,C.acc3);
  const vx=-r*wv*Math.sin(Math.PI/2+wv*S.t1)*0+(-r*wv*Math.sin(Math.PI/2+wv*S.t1)),vy=r*wv*Math.cos(Math.PI/2+wv*S.t1);arrow(x,cx+p[0]*k,cy-p[1]*k,cx+p[0]*k+vx*k*0.6,cy-p[1]*k-vy*k*0.6,C.acc,2)};
function r1(){const n=T1.pts.length;let rm=NaN;if(n>8)rm=MODEL.circum(T1.pts[0],T1.pts[n>>1],T1.pts[n-1]);const r=MODEL.radius(1,S.v,1,S.b1);ro('s1-ro',t('r1',{r:fx(r,3),rm:isNaN(rm)?t('rNone'):fx(rm,3),t:fx(S.t1),turns:fx(Math.abs(S.t1/MODEL.period(1,1,S.b1)),2)}))}
function reset1(){S.run1=false;S.t1=0;T1.pts=[MODEL.orbit(MODEL.radius(1,S.v,1,S.b1),MODEL.omega(1,1,S.b1),0)]}
function adv1(dt){S.t1+=dt;T1.pts.push(MODEL.orbit(MODEL.radius(1,S.v,1,S.b1),MODEL.omega(1,1,S.b1),S.t1));if(T1.pts.length>3000)T1.pts.shift()}
TICK[1]=function(dt){if(!S.run1)return false;adv1(dt*1.2);redraw(1);r1();return true};
const V2=[0.6,1.2,1.8];
DRAW[2]=function(x,w,h){const cx=w/2,cy=h/2,k=sc(h),wv=MODEL.omega(S.m2,1,S.b2);
  V2.forEach((v,i)=>{const r=MODEL.radius(S.m2,v,1,S.b2);circ(x,cx,cy,r*k,'rgba(255,255,255,.18)',true);const p=MODEL.orbit(r,wv,S.t2);dot(x,cx+p[0]*k,cy-p[1]*k,6,[C.acc3,C.acc2,C.acc][i])});
  line(x,cx,cy,cx,cy-MODEL.radius(S.m2,V2[2],1,S.b2)*k-12,'rgba(255,255,255,.25)',1);txt(x,'0°',cx+4,12,C.muted,12)};
function r2(){const rs=V2.map(v=>MODEL.radius(S.m2,v,1,S.b2)),T=MODEL.period(S.m2,1,S.b2),ph=V2.map(()=>(Math.abs(MODEL.omega(S.m2,1,S.b2))*S.t2*180/Math.PI)%360);ro('s2-ro',t('r2',{r1:fx(rs[0]),r2:fx(rs[1]),r3:fx(rs[2]),tp:fx(T),t:fx(S.t2),laps:Math.floor(S.t2/T+1e-9),dphi:fx(Math.max(...ph)-Math.min(...ph),1)}))}
function reset2(){S.run2=false;S.t2=0}
TICK[2]=function(dt){if(!S.run2)return false;S.t2+=dt*1.2;redraw(2);r2();return true};
DRAW[3]=function(x,w,h){const k=Math.min((w-40)/(2*MODEL.landing(4,1,1,0.5)),(h-60)/(MODEL.landing(4,1,1,0.5)/2+0.1)),ox=20,oy=h-30,sc2=Math.min(k,(w-40)/9);
  const kk=Math.min(sc2,(h-50)/(MODEL.radius(4,1,1,0.5)));
  const draw=(m,col,lw)=>{const r=MODEL.radius(m,1,1,S.b3);x.strokeStyle=col;x.lineWidth=lw;x.beginPath();for(let u=0;u<=Math.PI+1e-9;u+=0.05){const px=ox+(r-r*Math.cos(u))*kk,py=oy-r*Math.sin(u)*kk;if(u)x.lineTo(px,py);else x.moveTo(px,py)}x.stroke()};
  line(x,ox,oy,w-10,oy,C.muted,1);for(let i=0;i<=8;i++){const px=ox+i*kk;if(px<w-10){line(x,px,oy,px,oy+4,C.muted,1);txt(x,String(i),px,oy+16,C.muted,11,'center')}}
  [1,2,3].forEach(m=>draw(m,'rgba(160,170,185,.6)',1.5));draw(S.mu,C.acc2,3);
  const lx=ox+MODEL.landing(S.mu,1,1,S.b3)*kk;dot(x,lx,oy,6,C.acc2);txt(x,'x',lx,oy-10,C.acc2,12,'center');dot(x,ox,oy,5,C.acc3);txt(x,'slit',ox,oy+16,C.muted,11)};
function r3(){const x=MODEL.landing(S.mu,1,1,S.b3);ro('s3-ro',t('r3',{x:fx(x,3),m:fx(MODEL.mass(x,1,1,S.b3),2),ms:fx(S.mu,1)}))}
DRAW[4]=function(x,w,h){const k=Math.min((w-40)/9,40),ox=20,oy=h/2,T=Math.min(9/Math.max(S.v4,S.e4/1),2*Math.PI*3);
  for(let i=0;i<=8;i++)for(let j=-3;j<=3;j++){txt(x,'·',ox+i*k,oy+j*45,'rgba(110,231,255,.35)',16,'center')}
  for(let i=1;i<=8;i+=2)arrow(x,ox+i*k,oy+60,ox+i*k,oy+60-S.e4*18,C.acc3,2);txt(x,'E',w-24,oy+54,C.acc3,12);txt(x,'B ⊙',w-40,16,C.muted,12);
  line(x,ox,oy,ox+8*k,oy,'rgba(255,255,255,.2)',1);
  x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();let on=false;for(let tt=0;tt<=40;tt+=0.02){const p=MODEL.drift(S.v4,S.e4,1,1,tt);if(p[0]>8)break;const px=ox+p[0]*k,py=oy-p[1]*k;if(Math.abs(py-oy)>h/2-4)break;if(on)x.lineTo(px,py);else{x.moveTo(px,py);on=true}}x.stroke();dot(x,ox,oy,5,C.acc)};
function r4(){const vs=MODEL.selected(S.e4,1);let tt=0;for(;tt<60;tt+=0.005){if(MODEL.drift(S.v4,S.e4,1,1,tt)[0]>=6)break}const dy=MODEL.drift(S.v4,S.e4,1,1,tt)[1],ok=Math.abs(S.v4-vs)<0.05;ro('s4-ro',t('r4',{vs:fx(vs),v:fx(S.v4,1),case:ok?t('caseOk'):(S.v4>vs?t('caseHigh'):t('caseLow')),len:6,dy:fx(dy,2)}))}
function init(){
  slider('s0-ang',v=>v+'°',v=>{S.ang=v;redraw(0);r0()});slider('s0-q',v=>fx(v,0),v=>{S.q=v;redraw(0);r0()});slider('s0-b',v=>fx(v,1),v=>{S.b0=v;redraw(0);r0()});
  slider('s1-v',v=>fx(v,1),v=>{S.v=v;reset1();redraw(1);r1()});slider('s1-b',v=>fx(v,1),v=>{S.b1=v;reset1();redraw(1);r1()});
  btn('s1-play',()=>{if(S.run1){S.run1=false;return}S.run1=true;if(REDUCE){adv1(0.5);S.run1=false;redraw(1);r1()}else kick()});btn('s1-reset',()=>{reset1();redraw(1);r1()});
  slider('s2-b',v=>fx(v,1),v=>{S.b2=v;reset2();redraw(2);r2()});slider('s2-m',v=>fx(v,1),v=>{S.m2=v;reset2();redraw(2);r2()});
  btn('s2-play',()=>{if(S.run2){S.run2=false;return}S.run2=true;if(REDUCE){S.t2+=0.5;S.run2=false;redraw(2);r2()}else kick()});btn('s2-reset',()=>{reset2();redraw(2);r2()});
  slider('s3-b',v=>fx(v,1),v=>{S.b3=v;redraw(3);r3()});slider('s3-m',v=>fx(v,1),v=>{S.mu=v;redraw(3);r3()});
  slider('s4-v',v=>fx(v,1),v=>{S.v4=v;S.v4=v;redraw(4);r4()});slider('s4-e',v=>fx(v,1),v=>{S.e4=v;redraw(4);r4()});reset1();reset2()}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=0;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

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

/* Electric fields: static point charges in 2D, k = 1 teaching units. */
const MODEL={
  field(cs,x,y){let ex=0,ey=0;for(const c of cs){const dx=x-c.x,dy=y-c.y,r2=dx*dx+dy*dy+1e-9,m=c.q/(r2*Math.sqrt(r2));ex+=m*dx;ey+=m*dy}return[ex,ey]},
  pot(cs,x,y){let v=0;for(const c of cs){v+=c.q/Math.sqrt((x-c.x)*(x-c.x)+(y-c.y)*(y-c.y)+1e-9)}return v},
  point(q,r){return q/(r*r)},
  trace(cs,x0,y0,dir){const pts=[[x0,y0]];let x=x0,y=y0,end='out',idx=-1;for(let i=0;i<900;i++){const f=MODEL.field(cs,x,y),m=Math.hypot(f[0],f[1]);if(m<1e-9){end='out';break}x+=dir*0.04*f[0]/m;y+=dir*0.04*f[1]/m;pts.push([x,y]);let hit=-1;for(let j=0;j<cs.length;j++){if(Math.hypot(x-cs[j].x,y-cs[j].y)<0.12)hit=j}if(hit>=0){end='charge';idx=hit;break}if(Math.abs(x)>7||Math.abs(y)>7){end='out';break}}return{pts:pts,end:end,idx:idx}},
  lines(cs){const pos=cs.filter(c=>c.q>0),src=pos.length?pos:cs.filter(c=>c.q<0),dir=pos.length?1:-1,out=[];let hit=0,esc=0;for(const c of src){const n=Math.round(6*Math.abs(c.q));for(let k=0;k<n;k++){const a=2*Math.PI*(k+0.5)/n,tr=MODEL.trace(cs,c.x+0.12*Math.cos(a),c.y+0.12*Math.sin(a),dir);out.push(tr);if(tr.end==='charge'&&cs[tr.idx]!==c)hit++;else if(tr.end==='out')esc++}}return{lines:out,n:out.length,hit:hit,out:esc}},
  tangentAngle(cs,x,y){const f=MODEL.field(cs,x,y),m=Math.hypot(f[0],f[1]);if(m<1e-12)return 90;const tx=-f[1]/m,ty=f[0]/m;return Math.acos(Math.min(1,Math.abs((f[0]*tx+f[1]*ty)/m)))*180/Math.PI},
  gradMag(cs,x,y){const h=1e-4,gx=(MODEL.pot(cs,x+h,y)-MODEL.pot(cs,x-h,y))/(2*h),gy=(MODEL.pot(cs,x,y+h)-MODEL.pot(cs,x,y-h))/(2*h);return Math.hypot(gx,gy)},
  step(cs,s,qm,dt){const f=MODEL.field(cs,s.x,s.y);s.vx+=0.5*dt*qm*f[0];s.vy+=0.5*dt*qm*f[1];s.x+=dt*s.vx;s.y+=dt*s.vy;const g=MODEL.field(cs,s.x,s.y);s.vx+=0.5*dt*qm*g[0];s.vy+=0.5*dt*qm*g[1];s.t+=dt},
  energy(cs,s,qm){return 0.5*(s.vx*s.vx+s.vy*s.vy)+qm*MODEL.pot(cs,s.x,s.y)}
};
const S={q:2,r:1,a1:2,a2:2,px:0,py:0.9,b1:3,b2:-1,c2:-2,dv:1,cx:0,qm:1,x0:0,sim:null,run:false,trail:[],e0:0,state:'st4idle'};
const pair=(q1,q2)=>[{x:-1.2,y:0,q:q1},{x:1.2,y:0,q:q2}];
const mapper=(w,h)=>{const s=w/7;return{s:s,X:x=>w/2+x*s,Y:y=>h/2-y*s,x:px=>(px-w/2)/s,y:py=>(h/2-py)/s}};
function chargeDot(x,m,c){const col=c.q>0?C.acc3:(c.q<0?C.acc:C.muted);dot(x,m.X(c.x),m.Y(c.y),9,col);txt(x,c.q>0?'+':(c.q<0?'−':'0'),m.X(c.x),m.Y(c.y)+4,'#08131a',13,'center')}
function vecArrow(x,m,px,py,vx,vy,k,col,lw){arrow(x,m.X(px),m.Y(py),m.X(px)+vx*k,m.Y(py)-vy*k,col,lw)}
function sim0(){return[{x:0,y:0,q:S.q}]}
DRAW[0]=function(x,w,h){const m=mapper(w,h),cs=sim0();
  for(let gx=-3;gx<=3;gx+=0.5)for(let gy=-2;gy<=2;gy+=0.5){const e=MODEL.field(cs,gx,gy),mag=Math.hypot(e[0],e[1]);if(Math.hypot(gx,gy)<0.45||Math.abs(gy)*m.s>h/2-8)continue;if(mag<1e-9)continue;const L=22*Math.tanh(mag*1.5);arrow(x,m.X(gx)-e[0]/mag*L/2,m.Y(gy)+e[1]/mag*L/2,m.X(gx)+e[0]/mag*L/2,m.Y(gy)-e[1]/mag*L/2,'rgba(110,231,255,'+(0.25+0.6*Math.tanh(mag))+')',1.5)}
  chargeDot(x,m,cs[0]);const ex=MODEL.point(S.q,S.r);
  dot(x,m.X(S.r),m.Y(0),5,C.acc2);const L=40*Math.tanh(Math.abs(ex)*1.5);if(ex!==0)arrow(x,m.X(S.r),m.Y(0),m.X(S.r)+Math.sign(ex)*L,m.Y(0),C.acc2,3);
  line(x,m.X(0),m.Y(0)+22,m.X(S.r),m.Y(0)+22,C.muted,1);txt(x,'r',m.X(S.r/2),m.Y(0)+36,C.muted,12,'center')};
function r0(){const e=MODEL.point(S.q,S.r),e2=MODEL.point(S.q,2*S.r);ro('s0-ro',t('r0',{q:fx(S.q,1),r:fx(S.r,1),e:fx(Math.abs(e),3),dir:S.q>0?t('dirOut'):(S.q<0?t('dirIn'):t('dirNone')),e2:fx(Math.abs(e2),3),ratio:S.q===0?'—':fx(e2/e,2)}))}
function cs1(){return pair(S.a1,S.a2)}
function f1(){const cs=cs1(),e1=MODEL.field([cs[0]],S.px,S.py),e2=MODEL.field([cs[1]],S.px,S.py),e=MODEL.field(cs,S.px,S.py);return{e1:e1,e2:e2,e:e}}
DRAW[1]=function(x,w,h){const m=mapper(w,h),cs=cs1(),f=f1(),mx=Math.max(Math.hypot(f.e1[0],f.e1[1]),Math.hypot(f.e2[0],f.e2[1]),Math.hypot(f.e[0],f.e[1]),0.3),k=55/mx;
  cs.forEach(c=>chargeDot(x,m,c));const ox=S.px,oy=S.py;
  x.setLineDash([4,4]);line(x,m.X(ox)+f.e1[0]*k,m.Y(oy)-f.e1[1]*k,m.X(ox)+f.e[0]*k,m.Y(oy)-f.e[1]*k,C.muted,1);line(x,m.X(ox)+f.e2[0]*k,m.Y(oy)-f.e2[1]*k,m.X(ox)+f.e[0]*k,m.Y(oy)-f.e[1]*k,C.muted,1);x.setLineDash([]);
  vecArrow(x,m,ox,oy,f.e1[0],f.e1[1],k,C.acc2,2);vecArrow(x,m,ox,oy,f.e2[0],f.e2[1],k,C.acc3,2);vecArrow(x,m,ox,oy,f.e[0],f.e[1],k,C.acc,3);
  dot(x,m.X(ox),m.Y(oy),4,C.text);txt(x,'E₁',m.X(ox)+f.e1[0]*k+4,m.Y(oy)-f.e1[1]*k,C.acc2,12);txt(x,'E₂',m.X(ox)+f.e2[0]*k+4,m.Y(oy)-f.e2[1]*k,C.acc3,12);txt(x,'E',m.X(ox)+f.e[0]*k+4,m.Y(oy)-f.e[1]*k-4,C.acc,13)};
function r1(){const f=f1();ro('s1-ro',t('r1',{e1x:fx(f.e1[0]),e1y:fx(f.e1[1]),e2x:fx(f.e2[0]),e2y:fx(f.e2[1]),ex:fx(f.e[0]),ey:fx(f.e[1]),mag:fx(Math.hypot(f.e[0],f.e[1]))}))}
function drawLines(x,m,cs,lines,col,lw){for(const tr of lines){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();tr.pts.forEach((p,i)=>{const px=m.X(p[0]),py=m.Y(p[1]);if(i)x.lineTo(px,py);else x.moveTo(px,py)});x.stroke()}}
DRAW[2]=function(x,w,h){const m=mapper(w,h),cs=pair(S.b1,S.b2),L=MODEL.lines(cs);drawLines(x,m,cs,L.lines,'rgba(110,231,255,.8)',1.4);cs.forEach(c=>chargeDot(x,m,c))};
function r2(){const cs=pair(S.b1,S.b2),L=MODEL.lines(cs);ro('s2-ro',t('r2',{n:L.n,hit:L.hit,out:L.out,net:fx(S.b1+S.b2,1)}))}
const cs3=()=>pair(2,S.c2);
DRAW[3]=function(x,w,h){const m=mapper(w,h),cs=cs3(),cell=5;
  for(let px=0;px<w;px+=cell)for(let py=0;py<h;py+=cell){const v=MODEL.pot(cs,m.x(px+cell/2),m.y(py+cell/2)),b=Math.floor(v/S.dv),a=Math.min(0.85,Math.abs(v)*0.07)+0.06,odd=((b%2)+2)%2;x.fillStyle=(v>=0?'rgba(255,122,147,':'rgba(110,231,255,')+(odd?a:a*0.45)+')';x.fillRect(px,py,cell,cell)}
  const L=MODEL.lines(cs);drawLines(x,m,cs,L.lines,'rgba(255,255,255,.55)',1);cs.forEach(c=>chargeDot(x,m,c));
  const py=0.9,e=MODEL.field(cs,S.cx,py),mg=Math.hypot(e[0],e[1]);dot(x,m.X(S.cx),m.Y(py),4,C.text);
  if(mg>1e-9){arrow(x,m.X(S.cx),m.Y(py),m.X(S.cx)+e[0]/mg*38,m.Y(py)-e[1]/mg*38,C.acc,3);x.setLineDash([3,3]);line(x,m.X(S.cx)+e[1]/mg*22,m.Y(py)+e[0]/mg*22,m.X(S.cx)-e[1]/mg*22,m.Y(py)-e[0]/mg*22,C.acc2,2);x.setLineDash([])}};
function r3(){const cs=cs3(),y=0.9;const e=MODEL.field(cs,S.cx,y);ro('s3-ro',t('r3',{v:fx(MODEL.pot(cs,S.cx,y)),ea:fx(Math.hypot(e[0],e[1]),3),en:fx(MODEL.gradMag(cs,S.cx,y),3),ang:fx(MODEL.tangentAngle(cs,S.cx,y),1)}))}
const cs4=()=>pair(2,-2);
function reset4(){S.run=false;S.sim={x:S.x0,y:1.4,vx:0,vy:0,t:0};S.trail=[[S.x0,1.4]];S.e0=MODEL.energy(cs4(),S.sim,S.qm);S.state='st4idle'}
DRAW[4]=function(x,w,h){const m=mapper(w,h),cs=cs4();const L=MODEL.lines(cs);drawLines(x,m,cs,L.lines,'rgba(255,255,255,.2)',1);cs.forEach(c=>chargeDot(x,m,c));
  x.strokeStyle=C.acc2;x.lineWidth=2;x.beginPath();S.trail.forEach((p,i)=>{if(i)x.lineTo(m.X(p[0]),m.Y(p[1]));else x.moveTo(m.X(p[0]),m.Y(p[1]))});x.stroke();
  dot(x,m.X(S.sim.x),m.Y(S.sim.y),6,S.qm>=0?C.acc3:C.acc);txt(x,S.qm>=0?'+':'−',m.X(S.sim.x),m.Y(S.sim.y)+4,'#08131a',11,'center')};
function r4(){const cs=cs4(),s=S.sim,e=MODEL.energy(cs,s,S.qm),ke=0.5*(s.vx*s.vx+s.vy*s.vy),dr=Math.abs(S.e0)>1e-9?100*(e-S.e0)/Math.abs(S.e0):0;
  ro('s4-ro',t('r4',{t:fx(s.t),v:fx(Math.hypot(s.vx,s.vy)),ke:fx(ke),pe:fx(e-ke),tot:fx(e),tot0:fx(S.e0),drift:fx(dr,2),state:t(S.state)}))}
TICK[4]=function(dt){if(!S.run)return false;const cs=cs4();for(let i=0;i<20;i++){MODEL.step(cs,S.sim,S.qm,0.005);const s=S.sim;if(cs.some(c=>Math.hypot(s.x-c.x,s.y-c.y)<0.15)){S.run=false;S.state='st4hit';break}if(Math.abs(s.x)>3.4||Math.abs(s.y)>2.4){S.run=false;S.state='st4out';break}}
  S.trail.push([S.sim.x,S.sim.y]);if(S.trail.length>4000)S.trail.shift();if(S.run)S.state='st4run';redraw(4);r4();return S.run};
function play4(){if(S.state==='st4hit'||S.state==='st4out'){reset4()}if(S.run){S.run=false;S.state='st4pause';redraw(4);r4();return}S.run=true;S.state='st4run';if(REDUCE){TICK[4](0.5);S.run=false;S.state=S.state==='st4run'?'st4pause':S.state;redraw(4);r4()}else kick()}
function init(){
  slider('s0-q',v=>fx(v,1),v=>{S.q=v;redraw(0);r0()});slider('s0-r',v=>fx(v,1),v=>{S.r=v;redraw(0);r0()});
  slider('s1-q1',v=>fx(v,1),v=>{S.a1=v;redraw(1);r1()});slider('s1-q2',v=>fx(v,1),v=>{S.a2=v;redraw(1);r1()});slider('s1-px',v=>fx(v,1),v=>{S.px=v;redraw(1);r1()});slider('s1-py',v=>fx(v,1),v=>{S.py=v;redraw(1);r1()});
  slider('s2-q1',v=>fx(v,1),v=>{S.b1=v;redraw(2);r2()});slider('s2-q2',v=>fx(v,1),v=>{S.b2=v;redraw(2);r2()});
  slider('s3-q2',v=>fx(v,1),v=>{S.c2=v;redraw(3);r3()});slider('s3-dv',v=>fx(v,1),v=>{S.dv=v;redraw(3);r3()});slider('s3-px',v=>fx(v,1),v=>{S.cx=v;redraw(3);r3()});
  slider('s4-qm',v=>fx(v,1),v=>{S.qm=v;reset4();redraw(4);r4()});slider('s4-x0',v=>fx(v,1),v=>{S.x0=v;reset4();redraw(4);r4()});
  btn('s4-play',play4);btn('s4-reset',()=>{reset4();redraw(4);r4()});reset4()}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

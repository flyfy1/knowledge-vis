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

/* Kinetic theory: 2D hard-disc gas, m_light = 1, k = 1, <KE> = T. */
const MODEL={
  R:0.05,H:4,
  rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}},
  make(o){const r=MODEL.rng(o.seed||7),p=[];o.sp.forEach((sp,si)=>{for(let i=0;i<sp.n;i++){const a=r()*6.2832,v=Math.sqrt(2*sp.ke/sp.m);p.push({x:MODEL.R+r()*(o.W-2*MODEL.R),y:MODEL.R+r()*(MODEL.H-2*MODEL.R),vx:v*Math.cos(a),vy:v*Math.sin(a),m:sp.m,s:si})}});return{p:p,W:o.W,t:0,coll:0,bins:[],cur:0,binT:0}},
  step(g,dt){const R=MODEL.R,H=MODEL.H,P=g.p;for(const q of P){q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.x>g.W-R){q.x=2*(g.W-R)-q.x;g.cur+=2*q.m*Math.abs(q.vx);q.vx=-Math.abs(q.vx)}if(q.x<R){q.x=2*R-q.x;g.cur+=2*q.m*Math.abs(q.vx);q.vx=Math.abs(q.vx)}if(q.y>H-R){q.y=2*(H-R)-q.y;g.cur+=2*q.m*Math.abs(q.vy);q.vy=-Math.abs(q.vy)}if(q.y<R){q.y=2*R-q.y;g.cur+=2*q.m*Math.abs(q.vy);q.vy=Math.abs(q.vy)}if(q.x>g.W-R)q.x=g.W-R}
    const d2=4*R*R;for(let i=0;i<P.length;i++){const a=P[i];for(let j=i+1;j<P.length;j++){const b=P[j],dx=b.x-a.x,dy=b.y-a.y;if(dx*dx+dy*dy<d2){const dvx=b.vx-a.vx,dvy=b.vy-a.vy,dd=dx*dx+dy*dy||1e-9,dp=(dvx*dx+dvy*dy)/dd;if(dp<0){const mm=2/(a.m+b.m),ca=mm*b.m*dp,cb=mm*a.m*dp;a.vx+=ca*dx;a.vy+=ca*dy;b.vx-=cb*dx;b.vy-=cb*dy;g.coll++}}}}
    g.t+=dt;g.binT+=dt;if(g.binT>=0.25-1e-9){g.bins.push({t:g.t,p:g.cur/(g.binT*2*(g.W+H))});if(g.bins.length>80)g.bins.shift();g.cur=0;g.binT=0}},
  ke(g){let s=0;for(const q of g.p)s+=0.5*q.m*(q.vx*q.vx+q.vy*q.vy);return s},
  theory(g){return MODEL.ke(g)/(g.W*MODEL.H)},
  measured(g){if(g.bins.length<32)return NaN;let s=0;for(let i=g.bins.length-32;i<g.bins.length;i++)s+=g.bins[i].p;return s/32},
  scale(g,f){for(const q of g.p){q.vx*=f;q.vy*=f}g.bins=[];g.cur=0;g.binT=0},
  setW(g,W){g.W=W;for(const q of g.p)if(q.x>W-MODEL.R)q.x=W-MODEL.R;g.bins=[];g.cur=0;g.binT=0},
  hist(vs,nb,vmax){const h=new Array(nb).fill(0);for(const v of vs){const i=Math.min(nb-1,Math.floor(v/vmax*nb));h[i]++}return h},
  maxwell(v,T){return v/T*Math.exp(-v*v/(2*T))},
  tv(h,T,vmax){const nb=h.length,w=vmax/nb;let s=0,q=[],qs=0;for(let i=0;i<nb;i++){const v=(i+0.5)*w;q.push(MODEL.maxwell(v,T)*w);qs+=q[i]}let hs=h.reduce((a,b)=>a+b,0)||1;let d=0;for(let i=0;i<nb;i++)d+=Math.abs(h[i]/hs-q[i]/qs);return d/2},
  rmsRatio(g){let sl=0,nl=0,sh=0,nh=0;for(const q of g.p){const v2=q.vx*q.vx+q.vy*q.vy;if(q.s===0){sl+=v2;nl++}else{sh+=v2;nh++}}return Math.sqrt((sl/nl)/(sh/nh))},
  keBy(g,s){let k=0,n=0;for(const q of g.p)if(q.s===s){k+=0.5*q.m*(q.vx*q.vx+q.vy*q.vy);n++}return k/n}
};
const S={n:40,T:1,W:6,rec:[],run:[true,true,true,true,true],M:4,g:[],h3:null,series:[],tn:0};
function g0(){return MODEL.make({W:6,seed:11,sp:[{n:S.n,m:1,ke:1}]})}
function g1(){return MODEL.make({W:6,seed:12,sp:[{n:60,m:1,ke:S.T}]})}
function g2(){return MODEL.make({W:S.W,seed:13,sp:[{n:50,m:1,ke:1}]})}
function g3(){S.h3=null;return MODEL.make({W:6,seed:14,sp:[{n:100,m:1,ke:1}]})}
function g4(){S.series=[];S.tn=0;return MODEL.make({W:6,seed:15,sp:[{n:40,m:1,ke:1},{n:40,m:S.M,ke:S.M}]})}
function resetAll(){S.g=[g0(),g1(),g2(),g3(),g4()]}
function splitL(w,h){const narrow=w<560;const bw=narrow?w-16:Math.floor(w*0.56),bh=narrow?Math.floor(h*0.5):h-16;const s=Math.min(bw/8,bh/MODEL.H);return{narrow:narrow,s:s,bx:8,by:8,plot:narrow?{x:12,y:bh+30,w:w-24,h:h-bh-60}:{x:bw+40,y:16,w:w-bw-56,h:h-70}}}
function box(x,L,g,flash){const s=L.s,W=g.W*s,Hh=MODEL.H*s;x.fillStyle='#0d1520';x.fillRect(L.bx,L.by,W,Hh);x.strokeStyle=C.line;x.strokeRect(L.bx,L.by,W,Hh);x.strokeStyle=flash?C.acc2:C.muted;x.lineWidth=4;x.beginPath();x.moveTo(L.bx+W,L.by);x.lineTo(L.bx+W,L.by+Hh);x.stroke();x.lineWidth=1;
  for(const q of g.p){x.fillStyle=q.s===0?C.acc:C.acc2;x.beginPath();x.arc(L.bx+q.x*s,L.by+q.y*s,MODEL.R*s*(q.s===0?1:Math.min(2.2,0.7+0.4*Math.sqrt(q.m))),0,6.2832);x.fill()}}
function plotFrame(x,p,xl,yl){x.strokeStyle=C.line;x.lineWidth=1;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,yl,p.x+4,p.y+13,C.muted,12);txt(x,xl,p.x+p.w-4,p.y+p.h+14,C.muted,12,'right')}
DRAW[0]=function(x,w,h){const g=S.g[0],L=splitL(w,h),p=L.plot,th=MODEL.theory(g),ym=th*2;box(x,L,g,true);plotFrame(x,p,'t','P');
  const NV=48,bs=g.bins.slice(-NV),bw=p.w/NV,off=g.bins.length-bs.length;bs.forEach((b,i)=>{const bh=Math.min(1,b.p/ym)*p.h;x.fillStyle='rgba(110,231,255,.45)';x.fillRect(p.x+(NV-bs.length+i)*bw+1,p.y+p.h-bh,bw-2,bh)});
  x.strokeStyle=C.acc2;x.lineWidth=2;x.beginPath();let on=false;for(let i=0;i<bs.length;i++){const gi=off+i;if(gi<31)continue;let s=0;for(let j=gi-31;j<=gi;j++)s+=g.bins[j].p;const v=s/32,px=p.x+(NV-bs.length+i+0.5)*bw,py=p.y+p.h-Math.min(1,v/ym)*p.h;if(on)x.lineTo(px,py);else{x.moveTo(px,py);on=true}}x.stroke();
  x.setLineDash([5,4]);line(x,p.x,p.y+p.h-th/ym*p.h,p.x+p.w,p.y+p.h-th/ym*p.h,C.good,1.5);x.setLineDash([])};
function r0(){const g=S.g[0],pm=MODEL.measured(g),th=MODEL.theory(g);ro('s0-ro',t('r0',{n:g.p.length,ke:fx(MODEL.ke(g)/g.p.length,3),pth:fx(th,3),pm:isNaN(pm)?t('measuring'):fx(pm,3),ratio:isNaN(pm)?'—':fx(pm/th,2)+'×',t:fx(g.t,1)}))}
function speeds(g){return g.p.map(q=>Math.hypot(q.vx,q.vy))}
DRAW[1]=function(x,w,h){const g=S.g[1],L=splitL(w,h),p=L.plot;box(x,L,g,true);plotFrame(x,p,'v','N');const vm=6,nb=24,hh=MODEL.hist(speeds(g),nb,vm),mx=Math.max(8,...hh),bw=p.w/nb;
  hh.forEach((c,i)=>{const bh=c/mx*p.h;x.fillStyle='rgba(110,231,255,.5)';x.fillRect(p.x+i*bw+1,p.y+p.h-bh,bw-2,bh)});const mean=speeds(g).reduce((a,b)=>a+b,0)/g.p.length;line(x,p.x+mean/vm*p.w,p.y,p.x+mean/vm*p.w,p.y+p.h,C.acc2,2)};
function r1(){const g=S.g[1],pm=MODEL.measured(g),th=MODEL.theory(g),sp=speeds(g),mean=sp.reduce((a,b)=>a+b,0)/sp.length,T=MODEL.ke(g)/g.p.length;ro('s1-ro',t('r1',{t:fx(T,2),vm:fx(mean,2),pth:fx(th,3),pm:isNaN(pm)?t('measuring'):fx(pm,3),pt:fx(th/T,3),na:fx(g.p.length/(g.W*MODEL.H),3)}))}
DRAW[2]=function(x,w,h){const g=S.g[2],L=splitL(w,h),p=L.plot;box(x,L,g,true);plotFrame(x,p,'V','P');const c=MODEL.ke(g)/MODEL.H,Vmin=2*MODEL.H,Vmax=8*MODEL.H,pmax=c/Vmin*1.1;
  x.setLineDash([5,4]);x.strokeStyle=C.good;x.lineWidth=1.5;x.beginPath();for(let i=0;i<=60;i++){const V=Vmin+(Vmax-Vmin)*i/60,px=p.x+p.w*(V-Vmin)/(Vmax-Vmin),py=p.y+p.h*(1-c/V/pmax);if(i)x.lineTo(px,py);else x.moveTo(px,py)}x.stroke();x.setLineDash([]);
  S.rec.forEach(r=>dot(x,p.x+p.w*(r.v-Vmin)/(Vmax-Vmin),p.y+p.h*(1-r.p/pmax),5,C.acc2));const V=g.W*MODEL.H;line(x,p.x+p.w*(V-Vmin)/(Vmax-Vmin),p.y+p.h,p.x+p.w*(V-Vmin)/(Vmax-Vmin),p.y+p.h-6,C.acc,2)};
function r2(){const g=S.g[2],pm=MODEL.measured(g),V=g.W*MODEL.H;ro('s2-ro',t('r2',{v:fx(V,1),pth:fx(MODEL.theory(g),3),pm:isNaN(pm)?t('measuring'):fx(pm,3),pv:isNaN(pm)?'—':fx(pm*V,2),c:fx(MODEL.ke(g),2),k:S.rec.length}))}
const VM3=5,NB3=25;
DRAW[3]=function(x,w,h){const g=S.g[3],L=splitL(w,h),p=L.plot;box(x,L,g,false);plotFrame(x,p,'v','f(v)');const h3=S.h3||new Array(NB3).fill(0),tot=h3.reduce((a,b)=>a+b,0)||1,bw=p.w/NB3,ymax=0.9;
  h3.forEach((c,i)=>{const d=c/tot/(VM3/NB3),bh=Math.min(1,d/ymax)*p.h;x.fillStyle='rgba(110,231,255,.5)';x.fillRect(p.x+i*bw+1,p.y+p.h-bh,bw-2,bh)});
  x.strokeStyle=C.acc2;x.lineWidth=2;x.beginPath();for(let i=0;i<=100;i++){const v=VM3*i/100,px=p.x+p.w*i/100,py=p.y+p.h*(1-MODEL.maxwell(v,1)/ymax);if(i)x.lineTo(px,py);else x.moveTo(px,py)}x.stroke()};
function r3(){const g=S.g[3],h3=S.h3||new Array(NB3).fill(0),has=h3.some(v=>v>0),T=MODEL.ke(g)/g.p.length;ro('s3-ro',t('r3',{t:fx(g.t,1),c:g.coll,d:has?fx(MODEL.tv(h3,T,VM3),2):'—',ke:fx(T,3),T:fx(T,2)}))}
function samp3(){const g=S.g[3],h=MODEL.hist(speeds(g),NB3,VM3);S.h3=(S.h3||new Array(NB3).fill(0)).map((v,i)=>v*0.97+h[i])}
DRAW[4]=function(x,w,h){const g=S.g[4],L=splitL(w,h),p=L.plot;box(x,L,g,false);plotFrame(x,p,'t','⟨KE⟩');const se=S.series,span=Math.max(20,g.t),ym=Math.max(1,...se.map(s=>Math.max(s.kl,s.kh)))*1.1;
  [['kl',C.acc],['kh',C.acc2]].forEach(([k,c])=>{x.strokeStyle=c;x.lineWidth=2;x.beginPath();se.forEach((s,i)=>{const px=p.x+p.w*s.t/span,py=p.y+p.h*(1-s[k]/ym);if(i)x.lineTo(px,py);else x.moveTo(px,py)});x.stroke()})};
function r4(){const g=S.g[4];ro('s4-ro',t('r4',{kl:fx(MODEL.keBy(g,0),3),kh:fx(MODEL.keBy(g,1),3),vr:fx(MODEL.rmsRatio(g),2),sq:fx(Math.sqrt(S.M),2),t:fx(g.t,1)}))}
function adv(i,dt){const g=S.g[i];let n=Math.round(dt*3/0.01);for(let k=0;k<n;k++)MODEL.step(g,0.01);if(i===3&&Math.floor(g.t*5)!==S.tn3){S.tn3=Math.floor(g.t*5);samp3()}if(i===4&&Math.floor(g.t*4)!==S.tn){S.tn=Math.floor(g.t*4);S.series.push({t:g.t,kl:MODEL.keBy(g,0),kh:MODEL.keBy(g,1)})}}
const RO=[r0,r1,r2,r3,r4];
[0,1,3,4].forEach(i=>{TICK[i]=function(dt){if(!S.run[i])return false;adv(i,dt);redraw(i);RO[i]();return true}});
TICK[2]=function(dt){if(!S.run[2])return false;adv(2,dt);redraw(2);r2();return true};
function toggle(i){S.run[i]=!S.run[i];if(S.run[i]){if(REDUCE){adv(i,0.5);S.run[i]=false;redraw(i);RO[i]()}else kick()}}
function resetOne(i){S.run[i]=!REDUCE;S.g[i]=[g0,g1,g2,g3,g4][i]();redraw(i);RO[i]();if(S.run[i])kick()}
function init(){
  resetAll();S.tn3=-1;if(REDUCE)S.run=[false,false,false,false,false];
  slider('s0-n',v=>fx(v,0),v=>{S.n=v;resetOne(0)});btn('s0-play',()=>toggle(0));btn('s0-reset',()=>resetOne(0));
  slider('s1-t',v=>fx(v,1),v=>{const g=S.g[1],cur=MODEL.ke(g)/g.p.length;MODEL.scale(g,Math.sqrt(v/cur));S.T=v;redraw(1);r1()});btn('s1-play',()=>toggle(1));btn('s1-reset',()=>resetOne(1));
  slider('s2-w',v=>fx(v,1),v=>{S.W=v;MODEL.setW(S.g[2],v);redraw(2);r2()});btn('s2-rec',()=>{const g=S.g[2],pm=MODEL.measured(g);if(isNaN(pm)){ro('s2-ro',t('needWait'));return}S.rec.push({v:g.W*MODEL.H,p:pm});redraw(2);r2()});btn('s2-clear',()=>{S.rec=[];redraw(2);r2()});
  btn('s3-play',()=>toggle(3));btn('s3-reset',()=>resetOne(3));
  slider('s4-m',v=>fx(v,0),v=>{S.M=v;resetOne(4)});btn('s4-play',()=>toggle(4));btn('s4-reset',()=>resetOne(4))}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=2;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

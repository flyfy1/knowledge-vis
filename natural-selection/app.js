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

/* Natural selection: w_L = 1 - k b, w_D = 1 - k (1 - b); deterministic recursion plus Wright-Fisher sampling. */
const MODEL={
  wL(b,k){return 1-k*b},wD(b,k){return 1-k*(1-b)},
  next(p,b,k){const d=p*MODEL.wD(b,k),l=(1-p)*MODEL.wL(b,k);return d/(d+l)},
  logit(p){return Math.log(p/(1-p))},
  gens(p0,p1,b,k){const r=MODEL.wD(b,k)/MODEL.wL(b,k);if(r<=1)return Infinity;return(MODEL.logit(p1)-MODEL.logit(p0))/Math.log(r)},
  barkAt(g){if(g<10)return 0.4;if(g<40)return 0.4+0.5*(g-10)/30;if(g<60)return 0.9;if(g<90)return 0.9-0.75*(g-60)/30;return 0.15},
  MU:0.001,nextMut(p,b,k){const q=MODEL.next(p,b,k);return q*(1-MODEL.MU)+(1-q)*MODEL.MU},
  series(p0,k,n){const a=[p0];let p=p0;for(let g=0;g<n;g++){p=MODEL.nextMut(p,MODEL.barkAt(g),k);a.push(p)}return a},
  rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}},
  generation(types,b,k,r){const w=[MODEL.wL(b,k),MODEL.wD(b,k)],surv=types.filter(t=>r()<w[t]);const N=types.length,out=[];if(!surv.length)return types.slice();for(let i=0;i<N;i++)out.push(surv[Math.floor(r()*surv.length)]);return out},
  wf(p0,N,gens,r){let n=Math.round(p0*N);const a=[n/N];for(let g=0;g<gens;g++){let c=0;const p=n/N;for(let i=0;i<N;i++)if(r()<p)c++;n=c;a.push(n/N)}return a},
  driftSd(p0,N,t){return Math.sqrt(p0*(1-p0)*(1-Math.pow(1-1/N,t)))}
};
const S={b0:0.2,moths:null,hunted:null,b1:0.9,p1:0.1,types:null,hist:[],run1:false,acc:0,b2:0.9,k2:0.5,g3:0,k3:0.5,logn:1.5,pops:null,seed:1,rs:99};
function rnd(){S.rs=(Math.imul(S.rs,1664525)+1013904223)>>>0;return S.rs/4294967296}
function mkMoths(){const r=MODEL.rng(11),a=[];for(let i=0;i<60;i++)a.push({x:20+r()*(300-40),y:20+r()*(210-40),t:i%2,a:r()*3.14,alive:true});S.moths=a;S.hunted=null}
function barkCol(b){const v=Math.round(215-175*b);return'rgb('+v+','+Math.round(v*0.95)+','+Math.round(v*0.85)+')'}
function moth(x,m,sx,sy,sc,ghost){x.save();x.translate(sx,sy);x.rotate(m.a);x.fillStyle=ghost?'rgba(200,60,60,.0)':(m.t===0?'#efe9da':'#2a2a2a');x.strokeStyle=ghost?'rgba(255,255,255,.2)':'rgba(0,0,0,.35)';x.lineWidth=1;x.beginPath();x.ellipse(0,0,9*sc,5*sc,0,0,6.2832);x.fill();x.stroke();x.restore()}
DRAW[0]=function(x,w,h){x.fillStyle=barkCol(S.b0);x.fillRect(0,0,w,h);for(let i=0;i<18;i++){x.strokeStyle='rgba(0,0,0,.12)';x.beginPath();x.moveTo(i*w/18,0);x.lineTo(i*w/18+10*Math.sin(i),h);x.stroke()}const sx=w/300,sy=h/210;S.moths.forEach(m=>{if(m.alive)moth(x,m,m.x*sx,m.y*sy,Math.min(sx,sy)*0.8,false);else{x.strokeStyle='rgba(255,90,90,.8)';x.lineWidth=2;const px=m.x*sx,py=m.y*sy;line(x,px-5,py-5,px+5,py+5,'rgba(255,90,90,.8)',2);line(x,px-5,py+5,px+5,py-5,'rgba(255,90,90,.8)',2)}})};
function r0(){const h=S.hunted;if(!h){ro('s0-ro',t('notYet')+' · b = '+fx(S.b0,1));return}const wl=MODEL.wL(S.b0,0.5),wd=MODEL.wD(S.b0,0.5);const cnt=ty=>({t:S.moths.filter(m=>m.t===ty).length,n:S.moths.filter(m=>m.t===ty&&m.alive).length});const a=cnt(0),d=cnt(1);ro('s0-ro',t('r0',{b:fx(S.b0,1),n1:a.n,t1:a.t,s1:fx(a.n/a.t*100,0),e1:fx(wl*100,0),n2:d.n,t2:d.t,s2:fx(d.n/d.t*100,0),e2:fx(wd*100,0)}))}
function hunt(){S.moths.forEach(m=>{if(m.alive&&rnd()>(m.t===0?MODEL.wL(S.b0,0.5):MODEL.wD(S.b0,0.5)))m.alive=false});S.hunted=true;redraw(0);r0()}
function reset1(){S.run1=false;const r=MODEL.rng(77);S.types=[];for(let i=0;i<200;i++)S.types.push(r()<S.p1?1:0);S.rs1=MODEL.rng(500+Math.round(S.b1*10)+Math.round(S.p1*100));S.hist=[{g:0,p:S.types.reduce((a,b)=>a+b,0)/200,pt:S.p1}]}
DRAW[1]=function(x,w,h){const p={x:44,y:14,w:w-60,h:h-48},G=60,X=g=>p.x+p.w*g/G,Y=v=>p.y+p.h*(1-v);x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'p',p.x+4,p.y+13,C.muted,12);txt(x,t('lblGen'),p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  x.setLineDash([5,4]);x.strokeStyle=C.acc2;x.lineWidth=2;x.beginPath();let q=S.p1;for(let g=0;g<=G;g++){g?x.lineTo(X(g),Y(q)):x.moveTo(X(g),Y(q));q=MODEL.next(q,S.b1,0.5)}x.stroke();x.setLineDash([]);
  x.strokeStyle=C.acc;x.lineWidth=2.5;x.beginPath();S.hist.forEach((s,i)=>{i?x.lineTo(X(s.g),Y(s.p)):x.moveTo(X(s.g),Y(s.p))});x.stroke();const l=S.hist[S.hist.length-1];dot(x,X(l.g),Y(l.p),5,C.text);
  const cw=Math.min(18,(w-20)/24);for(let i=0;i<24;i++){const dark=i<Math.round(l.p*24);x.fillStyle=dark?'#2a2a2a':'#efe9da';x.strokeStyle=C.muted;x.fillRect(p.x+i*(cw+1),p.y+p.h+20,cw,12);x.strokeRect(p.x+i*(cw+1),p.y+p.h+20,cw,12)}};
function r1(){const l=S.hist[S.hist.length-1];ro('s1-ro',t('r1',{g:l.g,n:Math.round(l.p*200),N:200,p:fx(l.p*100,1),pt:fx(l.pt*100,1)}))}
function adv1(){if(S.hist.length>60)return false;S.types=MODEL.generation(S.types,S.b1,0.5,S.rs1);const l=S.hist[S.hist.length-1],p=S.types.reduce((a,b)=>a+b,0)/S.types.length;S.hist.push({g:l.g+1,p:p,pt:MODEL.next(l.pt,S.b1,0.5)});return S.hist.length<=60}
TICK[1]=function(dt){if(!S.run1)return false;S.acc+=dt;while(S.acc>=0.3){S.acc-=0.3;if(!adv1()){S.run1=false}}redraw(1);r1();return S.run1};
DRAW[2]=function(x,w,h){const p={x:44,y:14,w:w-60,h:h-48},G=80,X=g=>p.x+p.w*g/G,Y=v=>p.y+p.h*(1-v);x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'p',p.x+4,p.y+13,C.muted,12);txt(x,t('lblGen'),p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  [[0.55,0.5,'rgba(160,170,185,.4)'],[S.b2,S.k2,C.acc2]].forEach(([b,k,col],i)=>{x.strokeStyle=col;x.lineWidth=i?3:1.2;x.beginPath();let q=0.01;for(let g=0;g<=G;g++){g?x.lineTo(X(g),Y(q)):x.moveTo(X(g),Y(q));q=MODEL.next(q,b,k)}x.stroke()});line(x,p.x,Y(0.5),p.x+p.w,Y(0.5),'rgba(255,255,255,.15)',1);line(x,p.x,Y(0.9),p.x+p.w,Y(0.9),'rgba(255,255,255,.15)',1)};
function r2(){const wl=MODEL.wL(S.b2,S.k2),wd=MODEL.wD(S.b2,S.k2),r=wd/wl,t50=MODEL.gens(0.01,0.5,S.b2,S.k2),t90=MODEL.gens(0.01,0.9,S.b2,S.k2);ro('s2-ro',t('r2',{wl:fx(wl,3),wd:fx(wd,3),r:fx(r,3),t50:isFinite(t50)?fx(t50,1):t('never'),t90:isFinite(t90)?fx(t90,1):t('never')}))}
function s3(){return MODEL.series(0.02,S.k3,110)}
function cross(a,dir){for(let g=1;g<a.length;g++){if(dir>0&&a[g-1]<0.5&&a[g]>=0.5)return g;if(dir<0&&g>40&&a[g-1]>=0.5&&a[g]<0.5)return g}return null}
DRAW[3]=function(x,w,h){const p={x:44,y:14,w:w-60,h:h-48},G=110,X=g=>p.x+p.w*g/G,Y=v=>p.y+p.h*(1-v),a=s3();x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,t('lblGen'),p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  x.strokeStyle='rgba(160,170,185,.7)';x.lineWidth=2;x.beginPath();for(let g=0;g<=G;g++){g?x.lineTo(X(g),Y(MODEL.barkAt(g))):x.moveTo(X(g),Y(MODEL.barkAt(g)))}x.stroke();x.strokeStyle=C.acc2;x.lineWidth=3;x.beginPath();a.forEach((v,g)=>g?x.lineTo(X(g),Y(v)):x.moveTo(X(g),Y(v)));x.stroke();line(x,p.x,Y(0.5),p.x+p.w,Y(0.5),'rgba(255,255,255,.15)',1);line(x,X(S.g3),p.y,X(S.g3),p.y+p.h,'rgba(110,231,255,.5)',1);dot(x,X(S.g3),Y(a[S.g3]),6,C.acc);dot(x,X(S.g3),Y(MODEL.barkAt(S.g3)),5,C.text);txt(x,t('lblBark'),p.x+6,p.y+14,'rgba(200,205,215,.9)',12);txt(x,t('lblDark'),p.x+6,p.y+30,C.acc2,12)};
function bcross(dir){for(let g=1;g<=110;g++){const a=MODEL.barkAt(g-1),b=MODEL.barkAt(g);if(dir>0&&a<0.5&&b>=0.5)return g;if(dir<0&&a>=0.5&&b<0.5)return g}return null}
function r3(){const a=s3(),up=cross(a,1),dn=cross(a,-1);ro('s3-ro',t('r3',{g:S.g3,b:fx(MODEL.barkAt(S.g3),2),p:fx(a[S.g3]*100,1),bu:bcross(1),bd:bcross(-1),up:up===null?'—':up,dn:dn===null?'—':dn}))}
function runs4(){const N=Math.round(Math.pow(10,S.logn)),pops=[];for(let i=0;i<5;i++)pops.push(MODEL.wf(0.5,N,100,MODEL.rng(S.seed*131+i*17+N)));const fin=[];for(let i=0;i<40;i++)fin.push(MODEL.wf(0.5,N,100,MODEL.rng(S.seed*977+i*29+N+7))[100]);S.pops={N:N,pops:pops,fin:fin}}
DRAW[4]=function(x,w,h){const p={x:44,y:14,w:w-60,h:h-48},G=100,X=g=>p.x+p.w*g/G,Y=v=>p.y+p.h*(1-v),pp=S.pops;x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'p',p.x+4,p.y+13,C.muted,12);txt(x,t('lblGen'),p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');line(x,p.x,Y(0.5),p.x+p.w,Y(0.5),'rgba(255,255,255,.15)',1);
  const cols=[C.acc,C.acc2,C.good,C.acc3,C.vio];pp.pops.forEach((a,i)=>{x.strokeStyle=cols[i];x.lineWidth=2;x.beginPath();a.forEach((v,g)=>g?x.lineTo(X(g),Y(v)):x.moveTo(X(g),Y(v)));x.stroke()})};
function r4(){const pp=S.pops,fixed=pp.pops.filter(a=>a[100]===0||a[100]===1).length,m=pp.fin.reduce((a,b)=>a+b,0)/pp.fin.length,sd=Math.sqrt(pp.fin.reduce((a,b)=>a+(b-m)*(b-m),0)/pp.fin.length);ro('s4-ro',t('r4',{N:pp.N,fx:fixed,sd:fx(sd,3),th:fx(MODEL.driftSd(0.5,pp.N,100),3)}))}
function init(){
  mkMoths();slider('s0-b',v=>fx(v,1),v=>{S.b0=v;redraw(0);r0()});btn('s0-hunt',hunt);btn('s0-reset',()=>{mkMoths();redraw(0);r0()});
  reset1();slider('s1-b',v=>fx(v,1),v=>{S.b1=v;reset1();redraw(1);r1()});slider('s1-p',v=>fx(v*100,0)+'%',v=>{S.p1=v;reset1();redraw(1);r1()});btn('s1-play',()=>{S.run1=!S.run1;if(S.run1){if(REDUCE){adv1();S.run1=false;redraw(1);r1()}else kick()}});btn('s1-reset',()=>{reset1();redraw(1);r1()});
  slider('s2-b',v=>fx(v,2),v=>{S.b2=v;redraw(2);r2()});slider('s2-k',v=>fx(v,2),v=>{S.k2=v;redraw(2);r2()});
  slider('s3-g',v=>fx(v,0),v=>{S.g3=v;redraw(3);r3()});slider('s3-k',v=>fx(v,2),v=>{S.k3=v;redraw(3);r3()});
  slider('s4-n',v=>String(Math.round(Math.pow(10,v))),v=>{S.logn=v;runs4();redraw(4);r4()});btn('s4-go',()=>{S.seed++;runs4();redraw(4);r4()});runs4()}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

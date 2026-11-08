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

/* Energy pyramid: solar input 5e6 kJ/m2/yr, producers = input * eta, level k = producers * eff^(k-1). */
const MODEL={
  SUN:5000000,NEED:365000,PERSON:3.8e6,YIELD:6e7,
  producers(eta){return MODEL.SUN*eta/100},
  level(eta,eff,k){return MODEL.producers(eta)*Math.pow(eff/100,k-1)},
  fracLeft(eff,k){return Math.pow(eff/100,k-1)},
  area(e){return MODEL.NEED/e},
  split(e,eff){const tr=e*eff/100,loss=e-tr;return{tr:tr,resp:loss*0.7,dec:loss*0.3}},
  ECO:{grass:{n:[1000,100,10,1],b:[500,50,5,0.5],t:[1,1,1,1]},forest:{n:[0.02,500,0.3,0.002],b:[20000,50,5,0.5],t:[0.05,1,1,1]},ocean:{n:[1e8,1e5,100,1],b:[4,20,2,0.2],t:[50,5,1,1]}},
  prod(eco){const e=MODEL.ECO[eco];return e.b.map((b,i)=>b*e.t[i])},
  inverted(arr){for(let i=1;i<arr.length;i++)if(arr[i]>arr[i-1])return true;return false},
  land(meat,conv){const m=meat/100;return MODEL.PERSON*((1-m)+m/(conv/100))/MODEL.YIELD},
  people(meat,conv,ha){return ha/MODEL.land(meat,conv)}
};
const S={eta:1,eff1:10,l1:1,eff2:10,l2:4,eco:'grass',meat:30,conv:10};
function fmtE(v){return v>=1000?Math.round(v).toLocaleString('en-US'):(v>=10?fx(v,0):fx(v,2))}
function axes(x,p){x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h)}
DRAW[0]=function(x,w,h){const p=MODEL.producers(S.eta),L=w-60;x.fillStyle='rgba(255,180,84,.8)';x.fillRect(30,50,L,36);txt(x,'5,000,000 kJ/m²/yr',34,44,C.acc2,13);x.fillStyle=C.acc;x.fillRect(30,140,Math.max(2,L*p/MODEL.SUN),36);txt(x,fmtE(p)+' kJ/m²/yr',34,134,C.acc,13);
  for(let i=0;i<8;i++)arrow(x,30+L*(i+0.5)/8,95,30+L*(i+0.5)/8,130,'rgba(255,180,84,.5)',1.5);txt(x,t('lblSun'),30,28,C.muted,12);txt(x,t('lblFix'),30,208,C.muted,12)};
function r0(){const p=MODEL.producers(S.eta);ro('s0-ro',t('r0',{i:MODEL.SUN.toLocaleString('en-US'),eta:fx(S.eta,1),p:fmtE(p),rest:fx(100-S.eta,1)}))}
function pyramid(x,w,h,eta,eff,hl){const n=4,bh=(h-30)/n,max=MODEL.producers(eta),cx=w*0.45,mw=w*0.7;for(let k=1;k<=n;k++){const e=MODEL.level(eta,eff,k),bw=Math.max(2,mw*e/max),y=h-15-k*bh;x.fillStyle=k===hl?C.acc2:'rgba(110,231,255,.55)';x.fillRect(cx-bw/2,y+3,bw,bh-6);txt(x,fmtE(e),cx+Math.max(bw/2,10)+6,y+bh/2+4,C.text,12);txt(x,t('lvl'+k),10,y+bh/2+4,C.muted,11)}}
DRAW[1]=function(x,w,h){pyramid(x,w,h,1,S.eff1,S.l1)};
function r1(){const e=MODEL.level(1,S.eff1,S.l1),sp=MODEL.split(e,S.eff1);ro('s1-ro',t('r1',{l:S.l1,name:t('lvl'+S.l1),e:fmtE(e),tr:fmtE(sp.tr),resp:fmtE(sp.resp),dec:fmtE(sp.dec),n:4,pct:fx(MODEL.fracLeft(S.eff1,4)*100,3)}))}
DRAW[2]=function(x,w,h){const e=MODEL.level(1,S.eff2,S.l2),a=MODEL.area(e),ha=a/10000,cols=Math.min(40,Math.floor((w-20)/12)),shown=Math.min(Math.ceil(ha),cols*10),sz=10;for(let i=0;i<shown;i++){const cx=10+(i%cols)*12,cy=20+Math.floor(i/cols)*12;x.fillStyle=i<ha||ha<1?C.acc2:'rgba(255,180,84,.35)';x.fillRect(cx,cy,sz,sz)}
  if(ha>cols*10)txt(x,'… '+fmtE(ha)+' ha',10,h-14,C.muted,13);txt(x,t('lblHa'),10,12,C.muted,12)};
function r2(){const e=MODEL.level(1,S.eff2,S.l2),a=MODEL.area(e);ro('s2-ro',t('r2',{eff:S.eff2,l:S.l2,e:fmtE(e),a:fmtE(a),ha:a/10000>=1?fx(a/10000,1):fx(a/10000,3)}))}
function logW(v,lo,hi,max){return Math.max(3,max*(Math.log10(v)-lo)/(hi-lo))}
DRAW[3]=function(x,w,h){const eco=MODEL.ECO[S.eco],cols=[['n',eco.n],['b',eco.b],['p',MODEL.prod(S.eco)]],cw=w/3,bh=(h-50)/4;cols.forEach(([k,arr],ci)=>{const lo=Math.log10(Math.min(...arr))-0.5,hi=Math.log10(Math.max(...arr)),cx=cw*(ci+0.5),mw=cw*0.8;arr.forEach((v,i)=>{const bw=logW(v,lo,hi,mw),y=h-20-(i+1)*bh;x.fillStyle=ci===2?C.acc2:C.acc;x.fillRect(cx-bw/2,y+3,bw,bh-6);txt(x,v>=1000?v.toExponential(0):String(v),cx,y+bh/2+4,'#08131a',11,'center')});txt(x,t('pyr_'+k),cx,18,MODEL.inverted(arr)?C.acc3:C.good,12,'center')})};
function r3(){const eco=MODEL.ECO[S.eco],f=a=>MODEL.inverted(a)?t('inv'):t('upr');ro('s3-ro',t('r3',{eco:t({grass:'eGrass',forest:'eForest',ocean:'eOcean'}[S.eco]),n1:f(eco.n),n2:f(eco.b),n3:f(MODEL.prod(S.eco))}))}
DRAW[4]=function(x,w,h){const ppl=MODEL.people(S.meat,S.conv,10),n=Math.min(200,Math.round(ppl)),cols=Math.floor((w-20)/9);for(let i=0;i<n;i++){const cx=14+(i%cols)*9,cy=24+Math.floor(i/cols)*10;dot(x,cx,cy,3.2,C.acc)}txt(x,t('lblDots'),10,12,C.muted,12)};
function r4(){ro('s4-ro',t('r4',{m:S.meat,e:S.conv,land:fx(MODEL.land(S.meat,S.conv),3),ppl:fx(MODEL.people(S.meat,S.conv,10),0)}))}
function setEco(k){S.eco=k;['grass','forest','ocean'].forEach(i=>$('s3-'+i).classList.toggle('active',i===k));redraw(3);r3()}
function init(){
  slider('s0-eta',v=>fx(v,1)+'%',v=>{S.eta=v;redraw(0);r0()});
  slider('s1-e',v=>v+'%',v=>{S.eff1=v;redraw(1);r1()});slider('s1-l',v=>fx(v,0),v=>{S.l1=v;redraw(1);r1()});
  slider('s2-e',v=>v+'%',v=>{S.eff2=v;redraw(2);r2()});slider('s2-l',v=>fx(v,0),v=>{S.l2=v;redraw(2);r2()});
  ['grass','forest','ocean'].forEach(k=>btn('s3-'+k,()=>setEco(k)));
  slider('s4-m',v=>v+'%',v=>{S.meat=v;redraw(4);r4()});slider('s4-e',v=>v+'%',v=>{S.conv=v;redraw(4);r4()});setEco('grass')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

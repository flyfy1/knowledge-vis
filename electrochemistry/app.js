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

/* Electrochemistry: standard potentials, Nernst (25 C), Faraday. */
const MODEL={
  EO:{mg:-2.37,zn:-0.76,fe:-0.44,cu:0.34,ag:0.80},MM:{zn:65.38,cu:63.55},F:96485,K:0.05916,
  PAIRS:{zncu:['zn','cu'],znag:['zn','ag'],cuag:['cu','ag'],mgcu:['mg','cu']},
  ecell(an,cat){return MODEL.EO[cat]-MODEL.EO[an]},
  nernst(e0,n,q){return e0-MODEL.K/n*Math.log10(q)},
  disc(c0,z0,xi){const cu=c0-xi,zn=z0+xi;return{cu:cu,zn:zn,e:MODEL.nernst(1.10,2,zn/cu)}},
  logK(n,e0){return n*e0/MODEL.K},
  elec(e,v,r){return(e-v)/r},
  mass(i,tsec){return MODEL.MM.cu*i*tsec/(2*MODEL.F)}
};
const S={pair:'zncu',run0:false,ph:0,c0:0.5,rate:4,p1:0,run1:false,lcu:0,lzn:0,v3:0,i4:2,t4:30,p4:0,run4:false};
const COL={zn:'#9aa7b8',cu:'#d98b4a',ag:'#e8edf4',mg:'#cfd6c2',fe:'#6b7280'};
function metalName(k){return t({zn:'mZn',cu:'mCu',ag:'mAg',mg:'mMg'}[k])}
const Z0=0.01;
function wirePt(w,h,s){const xl=w*0.21,xr=w*0.79,y0=h*0.2,y1=h*0.1,a=y0-y1,b=xr-xl,tot=2*a+b,d=s*tot;if(d<a)return[xl,y0-d];if(d<a+b)return[xl+d-a,y1];return[xr,y1+d-a-b]}
function cellDraw(x,w,h,o){const bw=w*0.3,bl=w*0.06,br=w*0.64,top=h*0.45,bot=h*0.9,xl=w*0.21,xr=w*0.79;
  [[bl,o.liqL],[br,o.liqR]].forEach(([bx,col])=>{x.fillStyle=col||'rgba(110,170,230,.25)';x.fillRect(bx,top,bw,bot-top);x.strokeStyle=C.muted;x.lineWidth=2;x.strokeRect(bx,top-h*0.1,bw,bot-top+h*0.1)});
  x.strokeStyle='rgba(180,190,205,.8)';x.lineWidth=7;x.beginPath();x.moveTo(bl+bw*0.8,top+4);x.lineTo(bl+bw*0.8,h*0.36);x.lineTo(br+bw*0.2,h*0.36);x.lineTo(br+bw*0.2,top+4);x.stroke();
  const ew=(k,sc)=>Math.max(3,14*sc);x.fillStyle=COL[o.mL];const wl=ew(o.mL,o.scL);x.fillRect(xl-wl/2,h*0.2,wl,bot-h*0.2-10);x.fillStyle=COL[o.mR];const wr=ew(o.mR,o.scR);x.fillRect(xr-wr/2,h*0.2,wr,bot-h*0.2-10);
  line(x,xl,h*0.2,xl,h*0.1,C.muted,2);line(x,xl,h*0.1,xr,h*0.1,C.muted,2);line(x,xr,h*0.1,xr,h*0.2,C.muted,2);x.fillStyle=C.panel;x.fillRect(w/2-34,h*0.1-14,68,28);x.strokeStyle=C.acc;x.strokeRect(w/2-34,h*0.1-14,68,28);txt(x,o.volt,w/2,h*0.1+5,C.acc,14,'center');
  const K=8;for(let k=0;k<K;k++){const s=(((o.phase+k/K)%1)+1)%1,p=wirePt(w,h,o.dir>=0?s:1-s);dot(x,p[0],p[1],4,'#ffe45c')}
  txt(x,o.labL,xl,bot+16,C.text,12,'center');txt(x,o.labR,xr,bot+16,C.text,12,'center');txt(x,o.sgnL,xl-22,h*0.17,C.acc3,15,'center');txt(x,o.sgnR,xr+22,h*0.17,C.acc,15,'center')}
function drawFlow(dt,speed,dir){S.ph=(S.ph+dt*speed*dir)%1}
function cur0(){const[an,cat]=MODEL.PAIRS[S.pair];return{an:an,cat:cat,e:MODEL.ecell(an,cat)}}
DRAW[0]=function(x,w,h){const c=cur0();cellDraw(x,w,h,{mL:c.an,mR:c.cat,scL:1,scR:1,volt:fx(c.e,2)+' V',phase:S.ph,dir:1,labL:t('lblAn')+' '+metalName(c.an),labR:t('lblCat')+' '+metalName(c.cat),sgnL:'−',sgnR:'+'});
  const ax={x:6,y:h*0.45,h:h*0.45},Y=v=>h*0.9-(v+2.6)/(3.5)*(h*0.45);[c.an,c.cat].forEach(k=>{const yy=Y(MODEL.EO[k]);x.fillStyle=k===c.an?C.acc3:C.acc;x.fillRect(w*0.44,yy-2,w*0.12,4);txt(x,metalName(k)+' '+fx(MODEL.EO[k],2),w*0.5,yy-6,C.muted,11,'center')})};
function r0(){const c=cur0();ro('s0-ro',t('r0',{pair:t({zncu:'pZnCu',znag:'pZnAg',cuag:'pCuAg',mgcu:'pMgCu'}[S.pair]),an:metalName(c.an),cat:metalName(c.cat),ea:fx(MODEL.EO[c.an],2),ec:fx(MODEL.EO[c.cat],2),e:fx(c.e,2)}))}
TICK[0]=function(dt){if(!S.run0)return false;drawFlow(dt,0.35,1);redraw(0);return true};
function xi1(){return S.p1*(S.c0-1e-6)}
DRAW[1]=function(x,w,h){const narrow=w<520,A={x:0,y:0,w:narrow?w:w*0.5,h:narrow?h*0.5:h},xi=xi1(),d=MODEL.disc(S.c0,Z0,xi);
  x.save();x.beginPath();x.rect(A.x,A.y,A.w,A.h);x.clip();cellDraw(x,A.w,A.h,{mL:'zn',mR:'cu',scL:1-0.8*S.p1,scR:1+0.6*S.p1,volt:fx(d.e,3)+' V',phase:S.ph,dir:1,labL:'Zn',labR:'Cu',sgnL:'−',sgnR:'+'});x.restore();
  const p=narrow?{x:44,y:h*0.5+16,w:w-60,h:h*0.5-44}:{x:w*0.5+36,y:16,w:w*0.5-52,h:h-48};x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'E (V)',p.x+4,p.y+13,C.muted,12);txt(x,'ξ (mol)',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  const lo=0.85,hi=1.25,Y=e=>p.y+p.h*(1-(e-lo)/(hi-lo)),X=u=>p.x+p.w*u;x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();const n=Math.max(1,Math.round(S.p1*200));for(let i=0;i<=n;i++){const u=S.p1*i/n,e=MODEL.disc(S.c0,Z0,u*(S.c0-1e-6)).e;i?x.lineTo(X(u),Y(e)):x.moveTo(X(u),Y(e))}x.stroke();dot(x,X(S.p1),Y(d.e),5,C.acc)};
function r1(){const xi=xi1(),d=MODEL.disc(S.c0,Z0,xi);ro('s1-ro',t('r1',{xi:fx(xi,3),cu:d.cu<1e-2?d.cu.toExponential(1):fx(d.cu,3),zn:fx(d.zn,3),e:fx(d.e,3),mzn:fx(xi*MODEL.MM.zn,2),mcu:fx(xi*MODEL.MM.cu,2)}))}
function reset1(){S.run1=false;S.p1=0;S.ph=0}
TICK[1]=function(dt){if(!S.run1)return false;S.p1=Math.min(1,S.p1+dt*S.rate/12);S.ph=(S.ph+dt*0.35)%1;if(S.p1>=1)S.run1=false;redraw(1);r1();return S.run1};
DRAW[2]=function(x,w,h){const p={x:46,y:16,w:w-64,h:h-48},lq=S.lzn-S.lcu,Y=e=>p.y+p.h*(1-(e-0.95)/(1.3-0.95)),X=l=>p.x+p.w*(l+8)/16;x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'E (V)',p.x+4,p.y+13,C.muted,12);txt(x,'log₁₀Q',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  x.strokeStyle=C.acc2;x.lineWidth=2.5;x.beginPath();for(let i=0;i<=16;i++){const l=-8+i,e=MODEL.nernst(1.10,2,Math.pow(10,l));i?x.lineTo(X(l),Y(e)):x.moveTo(X(l),Y(e))}x.stroke();line(x,X(0),p.y,X(0),p.y+p.h,'rgba(255,255,255,.15)',1);const e=MODEL.nernst(1.10,2,Math.pow(10,lq));dot(x,X(lq),Y(e),7,C.acc);line(x,X(lq),Y(e),X(lq),p.y+p.h,C.acc,1);line(x,p.x,Y(e),X(lq),Y(e),C.acc,1)};
function r2(){const lq=S.lzn-S.lcu,e=MODEL.nernst(1.10,2,Math.pow(10,lq));ro('s2-ro',t('r2',{q:Math.pow(10,lq).toExponential(2),lq:fx(lq,2),e:fx(e,3),lk:fx(MODEL.logK(2,1.10),1)}))}
function cur3(){const i=MODEL.elec(1.10,S.v3,1);return{i:i,net:1.10-S.v3}}
DRAW[3]=function(x,w,h){const c=cur3(),galv=c.i>1e-9,elec=c.i<-1e-9,anL=!elec;cellDraw(x,w,h,{mL:'zn',mR:'cu',scL:1,scR:1,volt:fx(S.v3,2)+' V',phase:S.ph,dir:c.i>=0?1:-1,labL:(anL?t('lblAn'):t('lblCat'))+' Zn',labR:(anL?t('lblCat'):t('lblAn'))+' Cu',sgnL:anL?'−':'+',sgnR:anL?'+':'−'});
  const p={x:w*0.4,y:h*0.62,w:w*0.2,h:h*0.0};if(c.i!==0){const L=Math.min(80,Math.abs(c.i)*60);arrow(x,w/2-(c.i>0?-1:1)*L/2*(-1),h*0.25,w/2+(c.i>0?1:-1)*L/2,h*0.25,C.acc2,3)}};
function r3(){const c=cur3();ro('s3-ro',t('r3',{v:fx(S.v3,2),e:'1.10',net:fx(c.net,2),i:fx(c.i,2),dir:Math.abs(c.i)<0.005?t('dirNone'):(c.i>0?t('dirGal'):t('dirElec')),an:c.i<-0.005?t('mCu'):t('mZn')}))}
TICK[3]=function(dt){if(REDUCE||Math.abs(cur3().i)<1e-3)return false;const c=cur3();S.ph=(S.ph+dt*0.35*Math.min(1,Math.abs(c.i))*Math.sign(c.i||1)+1)%1;redraw(3);return true};
function tNow(){return S.p4*S.t4*60}
DRAW[4]=function(x,w,h){const narrow=w<520,A={x:0,y:0,w:narrow?w:w*0.4,h:narrow?h*0.4:h},p=narrow?{x:44,y:h*0.4+14,w:w-60,h:h*0.6-44}:{x:w*0.4+40,y:16,w:w*0.6-56,h:h-48},mt=MODEL.mass(S.i4,S.t4*60),mm=MODEL.mass(5,60*60),m=MODEL.mass(S.i4,tNow());
  const cx=A.x+A.w/2,top=A.y+A.h*0.15,bot=A.y+A.h*0.9;x.fillStyle='rgba(110,170,230,.25)';x.fillRect(cx-A.w*0.3,top+(bot-top)*0.3,A.w*0.6,(bot-top)*0.7);x.strokeStyle=C.muted;x.strokeRect(cx-A.w*0.3,top,A.w*0.6,bot-top);x.fillStyle=COL.fe;x.fillRect(cx-6,top-6,12,(bot-top)*0.8);const th=Math.min(18,2+m/mm*80);x.fillStyle=COL.cu;x.fillRect(cx-6-th,top-6,th,(bot-top)*0.8);x.fillRect(cx+6,top-6,th,(bot-top)*0.8);
  x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'m (g)',p.x+4,p.y+13,C.muted,12);txt(x,'t (min)',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');const ym=Math.max(mt,0.5)*1.1,X=u=>p.x+p.w*u,Y=v=>p.y+p.h*(1-v/ym);
  x.setLineDash([4,4]);line(x,X(0),Y(0),X(1),Y(mt),C.muted,1);x.setLineDash([]);x.strokeStyle=C.acc2;x.lineWidth=3;x.beginPath();x.moveTo(X(0),Y(0));x.lineTo(X(S.p4),Y(m));x.stroke();dot(x,X(S.p4),Y(m),5,C.acc)};
function r4(){const ts=tNow(),q=S.i4*ts;ro('s4-ro',t('r4',{i:fx(S.i4,1),t:fx(ts/60,1),q:fx(q,0),m:fx(MODEL.mass(S.i4,ts),3),ref:fx(MODEL.mass(1,3600),2)}))}
TICK[4]=function(dt){if(!S.run4)return false;S.p4=Math.min(1,S.p4+dt/6);if(S.p4>=1)S.run4=false;redraw(4);r4();return S.run4};
function reset4(){S.run4=false;S.p4=0}
function setPair(k){S.pair=k;['zncu','znag','cuag','mgcu'].forEach(p=>$('s0-'+p).classList.toggle('active',p===k));redraw(0);r0()}
function init(){
  ['zncu','znag','cuag','mgcu'].forEach(k=>btn('s0-'+k,()=>setPair(k)));btn('s0-play',()=>{S.run0=!S.run0;if(S.run0){if(REDUCE){drawFlow(0.2,0.35,1);S.run0=false;redraw(0)}else kick()}});
  slider('s1-c',v=>fx(v,1),v=>{S.c0=v;reset1();redraw(1);r1()});slider('s1-i',v=>fx(v,0),v=>{S.rate=v});btn('s1-play',()=>{if(S.p1>=1)reset1();S.run1=!S.run1;if(S.run1){if(REDUCE){S.p1=Math.min(1,S.p1+0.1);S.run1=false;redraw(1);r1()}else kick()}});btn('s1-reset',()=>{reset1();redraw(1);r1()});
  slider('s2-cu',v=>fx(v,1),v=>{S.lcu=v;redraw(2);r2()});slider('s2-zn',v=>fx(v,1),v=>{S.lzn=v;redraw(2);r2()});
  slider('s3-v',v=>fx(v,2),v=>{S.v3=v;redraw(3);r3();kick()});
  slider('s4-i',v=>fx(v,1),v=>{S.i4=v;reset4();redraw(4);r4()});slider('s4-t',v=>fx(v,0),v=>{S.t4=v;reset4();redraw(4);r4()});btn('s4-play',()=>{if(S.p4>=1)reset4();S.run4=!S.run4;if(S.run4){if(REDUCE){S.p4=Math.min(1,S.p4+0.25);S.run4=false;redraw(4);r4()}else kick()}});btn('s4-reset',()=>{reset4();redraw(4);r4()});
  setPair('zncu')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=0;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

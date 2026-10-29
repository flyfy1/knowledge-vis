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

/* Photoelectric effect: E = h f with h = 0.41357 eV per 1e14 Hz. */
const MODEL={
  H:0.41357,
  METALS:{cs:{phi:2.14,name:'nameCs'},na:{phi:2.36,name:'nameNa'},zn:{phi:4.3,name:'nameZn'}},
  energy(f){return MODEL.H*f},
  ke(f,phi){return Math.max(0,MODEL.H*f-phi)},
  f0(phi){return phi/MODEL.H},
  current(f,phi,i){return MODEL.H*f>phi?i:0},
  stopI(i0,v,vs){if(vs<=0)return 0;if(v<=0)return i0;return i0*Math.max(0,1-v/vs)},
  fit(pts){const n=pts.length;if(n<2)return null;let sx=0,sy=0,sxx=0,sxy=0;for(const p of pts){sx+=p.x;sy+=p.y;sxx+=p.x*p.x;sxy+=p.x*p.y}const d=n*sxx-sx*sx;if(Math.abs(d)<1e-9)return null;const m=(n*sxy-sx*sy)/d;return{slope:m,icpt:(sy-m*sx)/n}},
  noise(k){return 0.04*Math.sin(12.9898*(k+1)*78.233)},
  tClassical(phiEv,I){return phiEv*1.602e-19/(I*1e-19)},
  tPhoton(f,I){return MODEL.H*f*1.602e-19/(I*1e-4)}
};
const S={f0:8,i0:4,run0:false,ph:[],el:[],np:0,ne:0,acc:0,metal:'na',f1:4.5,i1:5,f2:8,pts:[],f3:8,v3:0,i4:-2,rs:12345};
function rnd(){S.rs=(Math.imul(S.rs,1664525)+1013904223)>>>0;return S.rs/4294967296}
function colorF(f){const lam=3000/f;let r=0,g=0,b=0,a=1;if(lam>=380&&lam<440){r=(440-lam)/60;b=1}else if(lam<490&&lam>=440){g=(lam-440)/50;b=1}else if(lam<510&&lam>=490){g=1;b=(510-lam)/20}else if(lam<580&&lam>=510){r=(lam-510)/70;g=1}else if(lam<645&&lam>=580){r=1;g=(645-lam)/65}else if(lam>=645&&lam<=780){r=1}else if(lam<380){r=0.7;b=1;a=0.55}else{r=0.8;a=0.5}return'rgba('+Math.round(40+215*r)+','+Math.round(40+215*g)+','+Math.round(40+215*b)+','+a+')'}
function reset0(){S.run0=false;S.ph=[];S.el=[];S.np=0;S.ne=0;S.acc=0}
DRAW[0]=function(x,w,h){const px=w*0.72,col=colorF(S.f0),E=MODEL.energy(S.f0),phi=MODEL.METALS.na.phi;x.fillStyle=col;x.fillRect(8,h/2-14,18,28);txt(x,'hf',17,h/2+34,C.muted,12,'center');
  x.fillStyle='#8791a1';x.fillRect(px,20,18,h-40);txt(x,'Na',px+9,14,C.muted,12,'center');
  for(const p of S.ph){x.fillStyle=col;x.beginPath();x.arc(p.x,p.y,4,0,6.2832);x.fill()}
  for(const e of S.el){x.globalAlpha=Math.max(0,1-e.age/3);dot(x,e.x,e.y,4,C.acc);x.globalAlpha=1}
  x.fillStyle=C.muted;x.font='13px system-ui';x.textAlign='left';x.fillText('e⁻',px-40,h-8)};
function r0(){const E=MODEL.energy(S.f0),phi=MODEL.METALS.na.phi;ro('s0-ro',t('r0',{e:fx(E,2),phi:fx(phi,2),res:E>phi?t('resYes'):t('resNo'),np:S.np,ne:S.ne,ke:fx(MODEL.ke(S.f0,phi),2)}))}
TICK[0]=function(dt){if(!S.run0)return false;const px=w0w(),E=MODEL.energy(S.f0),phi=MODEL.METALS.na.phi,ke=MODEL.ke(S.f0,phi),h=300;dt*=1;S.acc+=dt*S.i0*2.2;while(S.acc>=1){S.acc-=1;S.ph.push({x:30,y:20+rnd()*(h-40)})}
  for(const p of S.ph)p.x+=dt*190;const keep=[];for(const p of S.ph){if(p.x>=px){S.np++;if(E>phi){S.ne++;const a=Math.PI/2+rnd()*Math.PI,v=40+60*Math.sqrt(ke)*(0.3+0.7*rnd());S.el.push({x:px,y:p.y,vx:Math.cos(a)*v,vy:-Math.sin(a)*v*(rnd()<0.5?1:-1),age:0})}}else keep.push(p)}S.ph=keep;
  for(const e of S.el){e.x+=e.vx*dt;e.y+=e.vy*dt;e.age+=dt}S.el=S.el.filter(e=>e.age<3);redraw(0);r0();return true};
function w0w(){const cv=$('s0-canvas');return cv.clientWidth*0.72}
function mt(){return MODEL.METALS[S.metal]}
DRAW[1]=function(x,w,h){const phi=mt().phi,E=MODEL.energy(S.f1),ke=MODEL.ke(S.f1,phi),top=18,bot=h-30,Y=v=>bot-(bot-top)*v/8;line(x,40,bot,40,top,C.muted,1);for(let v=0;v<=8;v+=2){txt(x,String(v),34,Y(v)+4,C.muted,11,'right');line(x,40,Y(v),44,Y(v),C.muted,1)}txt(x,'eV',46,top+4,C.muted,11);
  const bx=w*0.25,bw=Math.min(90,w*0.16);x.fillStyle='rgba(110,231,255,.6)';x.fillRect(bx,Y(E),bw,bot-Y(E));txt(x,'hf',bx+bw/2,bot+16,C.acc,13,'center');
  if(ke>0){x.fillStyle='rgba(126,226,168,.7)';x.fillRect(bx,Y(E),bw,Y(phi)-Y(E));txt(x,'E_k',bx+bw+6,(Y(E)+Y(phi))/2+4,C.good,13)}
  line(x,40,Y(phi),w*0.62,Y(phi),C.acc2,2.5);txt(x,'φ',w*0.62+6,Y(phi)+4,C.acc2,13);
  const mx=w*0.78,mh=bot-top;x.strokeStyle=C.line;x.strokeRect(mx,top,36,mh);const cur=MODEL.current(S.f1,phi,S.i1)/10;x.fillStyle=C.acc3;x.fillRect(mx+1,bot-cur*mh,34,cur*mh);txt(x,'I',mx+18,bot+16,C.muted,12,'center')};
function r1(){const phi=mt().phi;ro('s1-ro',t('r1',{metal:t(mt().name),e:fx(MODEL.energy(S.f1),2),phi:fx(phi,2),f0:fx(MODEL.f0(phi),2),ke:fx(MODEL.ke(S.f1,phi),2),cur:fx(MODEL.current(S.f1,phi,S.i1)/10,2)}))}
function sel2(){const phi=mt().phi;return{phi:phi}}
DRAW[2]=function(x,w,h){const narrow=w<520,p1=narrow?{x:40,y:14,w:w-56,h:h*0.5-30}:{x:40,y:14,w:w*0.55-50,h:h-44},p2=narrow?{x:40,y:h*0.5+20,w:w-56,h:h*0.5-44}:{x:w*0.55+30,y:14,w:w*0.45-46,h:h-44},phi=mt().phi;
  x.strokeStyle=C.line;x.strokeRect(p1.x,p1.y,p1.w,p1.h);const X=f=>p1.x+p1.w*(f-3)/12,Y=k=>p1.y+p1.h*(1-k/6.5);txt(x,'E_k,max (eV)',p1.x+4,p1.y+13,C.muted,12);txt(x,'f',p1.x+p1.w-4,p1.y+p1.h+14,C.muted,12,'right');
  x.strokeStyle='rgba(110,231,255,.6)';x.lineWidth=2;x.beginPath();for(let i=0;i<=120;i++){const f=3+12*i/120,k=MODEL.ke(f,phi);i?x.lineTo(X(f),Y(k)):x.moveTo(X(f),Y(k))}x.stroke();
  S.pts.forEach(q=>dot(x,X(q.f),Y(Math.max(0,q.y)),5,C.acc2));line(x,X(S.f2),p1.y+p1.h,X(S.f2),p1.y+p1.h-8,C.acc,3);
  x.strokeStyle=C.line;x.strokeRect(p2.x,p2.y,p2.w,p2.h);txt(x,'I',p2.x+4,p2.y+13,C.muted,12);txt(x,t('lIshort'),p2.x+p2.w-4,p2.y+p2.h+14,C.muted,12,'right');
  const above=MODEL.energy(S.f2)>phi;x.strokeStyle=above?C.acc3:C.muted;x.lineWidth=2.5;x.beginPath();x.moveTo(p2.x,p2.y+p2.h);x.lineTo(p2.x+p2.w,above?p2.y+8:p2.y+p2.h);x.stroke()};
function r2(){const phi=mt().phi,above=S.pts.filter(q=>q.y>0.05),f=MODEL.fit(above.map(q=>({x:q.f,y:q.y})));ro('s2-ro',t('r2',{metal:t(mt().name),n:S.pts.length,na:above.length,h:f?fx(f.slope*10,3):'—',phif:f?fx(-f.icpt,2):'—',phi:fx(phi,2)})+(f?'':' '+t('needMore')))}
function setMetal(k){S.metal=k;document.querySelectorAll('[data-metal]').forEach(b=>b.classList.toggle('active',b.dataset.metal===k));S.pts=[];redrawAll();r1();r2();r3()}
DRAW[3]=function(x,w,h){const phi=mt().phi,ke=MODEL.ke(S.f3,phi),vs=ke,p={x:40,y:14,w:w-56,h:h-44},X=v=>p.x+p.w*(v+1)/5,Y=i=>p.y+p.h*(1-i/1.2);x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'I',p.x+4,p.y+13,C.muted,12);txt(x,'V',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');line(x,X(0),p.y,X(0),p.y+p.h,'rgba(255,255,255,.15)',1);
  const cv=(i0,col,dash)=>{x.setLineDash(dash?[5,4]:[]);x.strokeStyle=col;x.lineWidth=2.5;x.beginPath();for(let k=0;k<=100;k++){const v=-1+5*k/100,i=MODEL.stopI(i0,v,vs);k?x.lineTo(X(v),Y(i)):x.moveTo(X(v),Y(i))}x.stroke();x.setLineDash([])};
  cv(0.5,'rgba(160,170,185,.6)',true);cv(1,C.acc2,false);if(vs>0){line(x,X(vs),p.y,X(vs),p.y+p.h,C.good,1);txt(x,'V_s',X(vs),p.y+p.h+14,C.good,12,'center')}dot(x,X(S.v3),Y(MODEL.stopI(1,S.v3,vs)),6,C.acc)};
function r3(){const phi=mt().phi,ke=MODEL.ke(S.f3,phi);ro('s3-ro',t('r3',{metal:t(mt().name),e:fx(MODEL.energy(S.f3),2),ke:fx(ke,2),vs:fx(ke,2),v:fx(S.v3,1),cur:fx(MODEL.stopI(1,S.v3,ke),2)}))}
DRAW[4]=function(x,w,h){const I=Math.pow(10,S.i4),f=7,phi=MODEL.METALS.na.phi,tc=MODEL.tClassical(phi,I),tp=MODEL.tPhoton(f,I),lmin=-12,lmax=5,p={x:20,y:20,w:w-40},X=v=>p.x+p.w*(Math.log10(v)-lmin)/(lmax-lmin);
  line(x,p.x,h-50,p.x+p.w,h-50,C.muted,1);for(let e=-12;e<=4;e+=4){line(x,X(Math.pow(10,e)),h-50,X(Math.pow(10,e)),h-44,C.muted,1);txt(x,'10^'+e,X(Math.pow(10,e)),h-28,C.muted,11,'center')}txt(x,'s',p.x+p.w,h-28,C.muted,11,'right');
  x.fillStyle=C.acc2;x.fillRect(p.x,50,Math.max(2,X(tc)-p.x),44);txt(x,t('barWave'),p.x+4,44,C.acc2,12);x.fillStyle=C.acc;x.fillRect(p.x,140,Math.max(2,X(tp)-p.x),44);txt(x,t('barPhoton'),p.x+4,134,C.acc,12)};
function fsec(v){return v>=100?v.toExponential(1):(v>=0.01?fx(v,2):v.toExponential(1))}
function r4(){const I=Math.pow(10,S.i4);ro('s4-ro',t('r4',{i:I.toExponential(0),tc:fsec(MODEL.tClassical(2.36,I)),tp:fsec(MODEL.tPhoton(7,I))}))}
function init(){
  slider('s0-f',v=>fx(v,1),v=>{S.f0=v;reset0();redraw(0);r0()});slider('s0-i',v=>fx(v,0),v=>{S.i0=v;redraw(0);r0()});
  btn('s0-play',()=>{S.run0=!S.run0;if(S.run0){if(REDUCE){const o=S.run0;S.run0=true;TICK[0](0.5);S.run0=false}else kick()}});btn('s0-reset',()=>{reset0();redraw(0);r0()});
  slider('s1-f',v=>fx(v,1),v=>{S.f1=v;redraw(1);r1()});slider('s1-i',v=>fx(v,0),v=>{S.i1=v;redraw(1);r1()});
  slider('s2-f',v=>fx(v,1),v=>{S.f2=v;redraw(2);r2()});btn('s2-add',()=>{const phi=mt().phi,k=MODEL.ke(S.f2,phi),m=k>0?k+MODEL.noise(S.pts.length):0;S.pts.push({f:S.f2,y:m});redraw(2);r2()});btn('s2-clear',()=>{S.pts=[];redraw(2);r2()});
  slider('s3-v',v=>fx(v,1),v=>{S.v3=v;redraw(3);r3()});slider('s3-f',v=>fx(v,1),v=>{S.f3=v;redraw(3);r3()});
  slider('s4-i',v=>'10^'+fx(v,1),v=>{S.i4=v;redraw(4);r4()});
  [['cs','s1-cs'],['na','s1-na'],['zn','s1-zn'],['cs','s2-cs'],['na','s2-na'],['zn','s2-zn'],['cs','s3-cs'],['na','s3-na'],['zn','s3-zn']].forEach(([k,id])=>{$(id).dataset.metal=k;btn(id,()=>setMetal(k))});
  setMetal('na')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

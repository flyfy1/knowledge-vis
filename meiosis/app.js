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

/* Meiosis: chromatids are {s:[top,bottom]} with segment origin 'M' (maternal) or 'P' (paternal). */
const MODEL={
  mk(o){return{s:[o,o]}},
  prep(n,cross){const pairs=[];for(let p=0;p<n;p++){const m=[MODEL.mk('M'),MODEL.mk('M')],q=[MODEL.mk('P'),MODEL.mk('P')];if(cross&&cross[p]){const t=m[0].s[1];m[0]={s:[m[0].s[0],q[0].s[1]]};q[0]={s:[q[0].s[0],t]}}pairs.push({m:m,p:q})}return pairs},
  meiosis(n,orient,cross){const pairs=MODEL.prep(n,cross),c1=[],c2=[];for(let p=0;p<n;p++){const a=orient[p]===0?pairs[p].m:pairs[p].p,b=orient[p]===0?pairs[p].p:pairs[p].m;c1.push(a);c2.push(b)}return{pairs:pairs,cell1:c1,cell2:c2,gametes:[c1.map(h=>h[0]),c1.map(h=>h[1]),c2.map(h=>h[0]),c2.map(h=>h[1])]}},
  mitosis(n){const pairs=MODEL.prep(n,null),cell=pairs.map(p=>[p.m[0],p.p[0]]);return{cells:[cell,cell.map(a=>a.slice())]}},
  sigG(g){return g.map(c=>c.s.join('')).join('|')},
  sigCell(cell){return cell.map(pr=>pr.map(c=>c.s.join('')).join('+')).join('|')},
  types(n){let a=[''];for(let i=0;i<n;i++)a=[].concat(...a.map(s=>[s+'R',s+'B']));return a},
  gType(orient,side){return orient.map(b=>(b===0)===(side===0)?'R':'B').join('')},
  gLabel(c){return(c.s[0]==='M'?'A':'a')+(c.s[1]==='M'?'B':'b')},
  rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}},
  locusMeiosis(rf,r){const cross=r()<Math.min(1,2*rf),m=MODEL.meiosis(1,[0],[cross]);return m.gametes.map(g=>MODEL.gLabel(g[0]))},
  chrom(n,rep){return{c2:2*n,c1:n,ch:rep?4*n:2*n}}
};
const COL={M:'#e5675f',P:'#4f8fe8'};
const S={n0:3,rep0:false,st:0,ori:[0,1],cross:false,n2:3,tally2:{},m2:0,g2:0,rf:0.2,t3:{AB:0,ab:0,Ab:0,aB:0},m3:0,mode4:'meio',run4:null,rs:20241030};
const rnd=()=>{S.rs=(Math.imul(S.rs,1664525)+1013904223)>>>0;return S.rs/4294967296};
function bar(x,cx,top,h,s,w){const hw=w/2;x.fillStyle=COL[s[0]];x.fillRect(cx-hw,top,w,h/2);x.fillStyle=COL[s[1]];x.fillRect(cx-hw,top+h/2,w,h/2)}
function dbl(x,cx,top,h,c1,c2,w){bar(x,cx-w*0.65,top,h,c1.s,w);bar(x,cx+w*0.65,top,h,c2.s,w);dot(x,cx,top+h/2,w*0.7,'#d9dee7')}
function single(x,cx,top,h,c,w){bar(x,cx,top,h,c.s,w);dot(x,cx,top+h/2,w*0.55,'#d9dee7')}
function circle(x,cx,cy,r,col){x.strokeStyle=col||'rgba(160,170,185,.55)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,r,0,6.2832);x.stroke()}
DRAW[0]=function(x,w,h){const n=S.n0,pairs=MODEL.prep(n,null),sp=Math.min(110,(w-20)/n),x0=(w-n*sp)/2,bh=Math.min(110,h*0.55);
  pairs.forEach((pr,i)=>{const cx=x0+sp*(i+0.5);if(S.rep0){dbl(x,cx-sp*0.2,h*0.2,bh,pr.m[0],pr.m[1],9);dbl(x,cx+sp*0.2,h*0.2,bh,pr.p[0],pr.p[1],9)}else{single(x,cx-sp*0.15,h*0.2,bh,pr.m[0],12);single(x,cx+sp*0.15,h*0.2,bh,pr.p[0],12)}txt(x,String(i+1),cx,h*0.2+bh+22,C.muted,12,'center')});
  txt(x,t('lgM'),12,16,COL.M,12);txt(x,t('lgP'),w-12,16,COL.P,12,'right')};
function r0(){const c=MODEL.chrom(S.n0,S.rep0);ro('s0-ro',t('r0',{n:S.n0,c2:c.c2,c1:c.c1,state:S.rep0?t('stRep',{ch:c.ch}):t('stUnrep',{c2:c.c2})}))}
function m1(){return MODEL.meiosis(2,S.ori,[S.cross,S.cross])}
DRAW[1]=function(x,w,h){const m=m1(),st=S.st,bh=h*0.17,bw=8;const cell=(cx,cy,r)=>circle(x,cx*w,cy*h,r*h);
  const hom=(p,side)=>side==='L'?(S.ori[p]===0?m.pairs[p].m:m.pairs[p].p):(S.ori[p]===0?m.pairs[p].p:m.pairs[p].m);
  const Dd=(cx,cy,h2)=>dbl(x,cx*w,cy*h-bh/2,bh,h2[0],h2[1],bw);const yy=[0.36,0.66];
  if(st===0){cell(0.5,0.5,0.44);[[0.38,0.4,m.pairs[0].m],[0.6,0.36,m.pairs[0].p],[0.4,0.66,m.pairs[1].m],[0.62,0.64,m.pairs[1].p]].forEach(([a,b,hh])=>Dd(a,b,hh))}
  else if(st===1){cell(0.5,0.5,0.44);[0,1].forEach(p=>{const cx=p===0?0.43:0.57,cy=yy[p];Dd(cx-0.04,cy,m.pairs[p].m);Dd(cx+0.04,cy,m.pairs[p].p);if(S.cross)txt(x,'✕',cx*w,cy*h+3,C.text,14,'center')})}
  else if(st===2){cell(0.5,0.5,0.44);line(x,0.5*w,0.08*h,0.5*w,0.92*h,'rgba(255,255,255,.2)',1);[0,1].forEach(p=>{Dd(0.43,yy[p],hom(p,'L'));Dd(0.57,yy[p],hom(p,'R'))})}
  else if(st===3){cell(0.5,0.5,0.44);[0,1].forEach(p=>{Dd(0.2,yy[p],hom(p,'L'));Dd(0.8,yy[p],hom(p,'R'))});arrow(x,0.4*w,0.5*h,0.3*w,0.5*h,C.acc2,2);arrow(x,0.6*w,0.5*h,0.7*w,0.5*h,C.acc2,2)}
  else if(st===4){cell(0.27,0.5,0.32);cell(0.73,0.5,0.32);[0,1].forEach(p=>{Dd(0.27,yy[p],hom(p,'L'));Dd(0.73,yy[p],hom(p,'R'))})}
  else if(st===5){cell(0.27,0.5,0.32);cell(0.73,0.5,0.32);line(x,0.1*w,0.5*h,0.44*w,0.5*h,'rgba(255,255,255,.15)',1);line(x,0.56*w,0.5*h,0.9*w,0.5*h,'rgba(255,255,255,.15)',1);[0,1].forEach(p=>{Dd(0.27,0.5+(p?0.14:-0.14),hom(p,'L'));Dd(0.73,0.5+(p?0.14:-0.14),hom(p,'R'))})}
  else if(st===6){cell(0.27,0.5,0.32);cell(0.73,0.5,0.32);[[0.27,'L'],[0.73,'R']].forEach(([cx,sd])=>[0,1].forEach(p=>{const hh=hom(p,sd);single(x,(cx-0.08)*w,(0.5+(p?0.14:-0.14))*h-bh/2,bh,hh[0],bw);single(x,(cx+0.08)*w,(0.5+(p?0.14:-0.14))*h-bh/2,bh,hh[1],bw)}));arrow(x,0.27*w-0.02*w,0.2*h,0.27*w-0.1*w,0.2*h,C.acc2,2);arrow(x,0.27*w+0.02*w,0.2*h,0.27*w+0.1*w,0.2*h,C.acc2,2)}
  else{[[0.22,0.28,0],[0.22,0.74,1],[0.78,0.28,2],[0.78,0.74,3]].forEach(([cx,cy,gi])=>{circle(x,cx*w,cy*h,0.2*h);m.gametes[gi].forEach((c,j)=>single(x,(cx+(j?0.04:-0.04))*w,cy*h-bh/2,bh,c,bw))})}};
function r1(){const st=S.st,m=S.st>=4?1:0,c=st<=1?4:(st<=3?4:(st<=6?2:2));const chn=st<=6?(st>=6?2:4):2;const ori=[0,1].map(p=>t('oriTxt',{p:p+1,side:S.ori[p]===0?t('sideL'):t('sideR')})).join('；');ro('s1-ro',t('r1',{s:st,name:t('stg'+st),ori:ori,cr:S.cross?t('crOn'):t('crOff'),cnt:t('cnt1',{c:st<=3?4:2,ch:st<=3?8:(st<=5?4:(st===6?4:2))})}))}
function tl2(){const ty=MODEL.types(S.n2),mx=ty.reduce((a,k)=>Math.max(a,S.tally2[k]||0),0);return{ty:ty,mx:mx}}
DRAW[2]=function(x,w,h){const{ty,mx}=tl2(),p={x:20,y:20,w:w-40,h:h-70},bw=p.w/ty.length,exp=S.g2/ty.length,top=Math.max(mx,exp*1.3,4);x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);
  ty.forEach((k,i)=>{const v=S.tally2[k]||0,bh=v/top*p.h;x.fillStyle=C.acc;x.fillRect(p.x+i*bw+2,p.y+p.h-bh,bw-4,bh);txt(x,k,p.x+i*bw+bw/2,p.y+p.h+14,C.muted,Math.min(11,bw*0.4+2),'center')});
  if(S.g2>0){x.setLineDash([4,4]);line(x,p.x,p.y+p.h-exp/top*p.h,p.x+p.w,p.y+p.h-exp/top*p.h,C.acc2,1.5);x.setLineDash([])}};
function r2(){const{ty,mx}=tl2(),seen=ty.filter(k=>(S.tally2[k]||0)>0).length,exp=S.g2/ty.length;ro('s2-ro',t('r2',{n:S.n2,k:ty.length,m:S.m2,g:S.g2,seen:seen,ratio:S.g2?fx(mx/exp,2):'—',human:Math.pow(2,23).toLocaleString('en-US')}))}
function do2(times){for(let i=0;i<times;i++){const o=[];for(let p=0;p<S.n2;p++)o.push(rnd()<0.5?0:1);const a=MODEL.gType(o,0),b=MODEL.gType(o,1);[a,a,b,b].forEach(k=>S.tally2[k]=(S.tally2[k]||0)+1);S.m2++;S.g2+=4}}
DRAW[3]=function(x,w,h){const p={x:20,y:20,w:w-40,h:h-70},ks=['AB','ab','Ab','aB'],tot=ks.reduce((a,k)=>a+S.t3[k],0),exp=[(1-S.rf)/2,(1-S.rf)/2,S.rf/2,S.rf/2],bw=p.w/4;x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);
  ks.forEach((k,i)=>{const f=tot?S.t3[k]/tot:0,bh=f/0.6*p.h;x.fillStyle=i<2?C.acc:C.acc3;x.fillRect(p.x+i*bw+10,p.y+p.h-bh,bw-20,bh);txt(x,k,p.x+i*bw+bw/2,p.y+p.h+16,C.text,14,'center');const ey=p.y+p.h-exp[i]/0.6*p.h;x.setLineDash([4,3]);line(x,p.x+i*bw+4,ey,p.x+(i+1)*bw-4,ey,C.acc2,2);x.setLineDash([]);if(tot)txt(x,fx(f*100,0)+'%',p.x+i*bw+bw/2,p.y+p.h-bh-6,C.text,12,'center')});txt(x,t('lgDash'),p.x+4,p.y+14,C.acc2,12)};
function r3(){const g=S.t3.AB+S.t3.ab+S.t3.Ab+S.t3.aB;ro('s3-ro',t('r3',{rf:fx(S.rf,2),m:S.m3,g:g,ab:S.t3.AB,ab2:S.t3.ab,r1:S.t3.Ab,r2:S.t3.aB,meas:g?fx((S.t3.Ab+S.t3.aB)/g,3):t('noData')}))}
function do3(times){for(let i=0;i<times;i++){MODEL.locusMeiosis(S.rf,rnd).forEach(l=>S.t3[l]++);S.m3++}}
function run4(){const n=3;if(S.mode4==='mito'){const m=MODEL.mitosis(n);S.run4={cells:m.cells,types:new Set(m.cells.map(MODEL.sigCell)).size,c:2*n}}else{const o=[],cr=[];for(let p=0;p<n;p++){o.push(rnd()<0.5?0:1);cr.push(rnd()<0.5)}const m=MODEL.meiosis(n,o,cr);S.run4={cells:m.gametes,types:new Set(m.gametes.map(MODEL.sigG)).size,c:n}}}
DRAW[4]=function(x,w,h){const r=S.run4,cells=r.cells,k=cells.length,cw=w/k,bh=h*0.34;cells.forEach((cell,i)=>{const cx=cw*(i+0.5),rad=Math.min(cw*0.45,h*0.4);circle(x,cx,h*0.5,rad);const items=S.mode4==='mito'?cell.flat():cell,m=items.length,sp=Math.min(14,(rad*1.6)/m);items.forEach((c,j)=>single(x,cx+(j-(m-1)/2)*sp,h*0.5-bh/2,bh,c,Math.max(4,sp*0.55)))})};
function r4(){const r=S.run4;ro('s4-ro',t('r4',{kind:t(S.mode4==='mito'?'kMito':'kMeio'),cells:r.cells.length,c:r.c,types:r.types}))}
function init(){
  slider('s0-n',v=>fx(v,0),v=>{S.n0=v;redraw(0);r0()});btn('s0-rep',()=>{S.rep0=true;redraw(0);r0()});btn('s0-reset',()=>{S.rep0=false;redraw(0);r0()});
  slider('s1-s',v=>fx(v,0),v=>{S.st=v;redraw(1);r1()});btn('s1-flip',()=>{S.ori=[rnd()<0.5?0:1,rnd()<0.5?0:1];redraw(1);r1()});btn('s1-cross',()=>{S.cross=!S.cross;$('s1-cross').classList.toggle('active',S.cross);redraw(1);r1()});
  slider('s2-n',v=>fx(v,0),v=>{S.n2=v;S.tally2={};S.m2=0;S.g2=0;redraw(2);r2()});btn('s2-go',()=>{do2(10);redraw(2);r2()});btn('s2-reset',()=>{S.tally2={};S.m2=0;S.g2=0;redraw(2);r2()});
  slider('s3-rf',v=>fx(v,2),v=>{S.rf=v;S.t3={AB:0,ab:0,Ab:0,aB:0};S.m3=0;redraw(3);r3()});btn('s3-go',()=>{do3(25);redraw(3);r3()});btn('s3-reset',()=>{S.t3={AB:0,ab:0,Ab:0,aB:0};S.m3=0;redraw(3);r3()});
  const setM=k=>{S.mode4=k;$('s4-mito').classList.toggle('active',k==='mito');$('s4-meio').classList.toggle('active',k==='meio');run4();redraw(4);r4()};btn('s4-mito',()=>setM('mito'));btn('s4-meio',()=>setM('meio'));btn('s4-again',()=>{run4();redraw(4);r4()});run4();$('s4-meio').classList.add('active')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=0;QUIZ.step=0;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

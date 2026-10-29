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

/* Periodic trends: main-group elements of periods 1-4 (26 elements). */
const MODEL={
  EL:[['H',1,1,1,31,2.20,1312],['He',2,1,18,28,null,2372],['Li',3,2,1,128,0.98,520],['Be',4,2,2,96,1.57,900],['B',5,2,13,84,2.04,801],['C',6,2,14,76,2.55,1087],['N',7,2,15,71,3.04,1402],['O',8,2,16,66,3.44,1314],['F',9,2,17,57,3.98,1681],['Ne',10,2,18,58,null,2081],['Na',11,3,1,166,0.93,496],['Mg',12,3,2,141,1.31,738],['Al',13,3,13,121,1.61,578],['Si',14,3,14,111,1.90,786],['P',15,3,15,107,2.19,1012],['S',16,3,16,105,2.58,1000],['Cl',17,3,17,102,3.16,1251],['Ar',18,3,18,106,null,1521],['K',19,4,1,203,0.82,419],['Ca',20,4,2,176,1.00,590],['Ga',31,4,13,122,1.81,579],['Ge',32,4,14,120,2.01,762],['As',33,4,15,119,2.18,947],['Se',34,4,16,120,2.55,941],['Br',35,4,17,120,2.96,1140],['Kr',36,4,18,116,null,1351]],
  ORDER:[[1,0],[2,0],[2,1],[3,0],[3,1],[4,0],[3,2],[4,1]],CAP:[2,2,6,2,6,2,10,6],NS:{1:1,2:2,3:3,4:3.7},
  shells(Z){const s={};let z=Z;for(let i=0;i<8&&z>0;i++){const k=Math.min(MODEL.CAP[i],z);const n=MODEL.ORDER[i][0];s[n]=(s[n]||0)+k;z-=k}return s},
  valN(Z){return Math.max(...Object.keys(MODEL.shells(Z)).map(Number))},
  zeff(Z){const s=MODEL.shells(Z),n=MODEL.valN(Z),nv=s[n];let S=(n===1?0.30:0.35)*(nv-1);if(n>1)S+=0.85*(s[n-1]||0);for(let m=1;m<=n-2;m++)S+=s[m]||0;return Z-S},
  xval(Z){const n=MODEL.valN(Z),ns=MODEL.NS[n];return ns*ns/MODEL.zeff(Z)},
  col(e,p){return e[[4,6,5][p]]},
  fit(){const xs=MODEL.EL.map(e=>MODEL.xval(e[1])),ys=MODEL.EL.map(e=>e[4]),n=xs.length,mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0,syy=0;xs.forEach((x,i)=>{sxy+=(x-mx)*(ys[i]-my);sxx+=(x-mx)*(x-mx);syy+=(ys[i]-my)*(ys[i]-my)});const m=sxy/sxx;return{m:m,b:my-m*mx,r:sxy/Math.sqrt(sxx*syy)}},
  period(p){return MODEL.EL.filter(e=>e[2]===p)},
  group(g){return g==='alk'?['Li','Na','K']:g==='ae'?['Be','Mg','Ca']:g==='hal'?['F','Cl','Br']:['He','Ne','Ar','Kr']},
  bySym(s){return MODEL.EL.find(e=>e[0]===s)},
  /* trend direction: across period (+1 Z): r down, IE up, EN up; down group: r up, IE down, EN down */
  followsTrend(a,b,p){const[lo,hi]=a[1]<b[1]?[a,b]:[b,a];if(lo[2]===hi[2]){const dv=MODEL.col(hi,p)-MODEL.col(lo,p);return p===0?dv<0:dv>0}if(lo[3]===hi[3]){const dv=MODEL.col(hi,p)-MODEL.col(lo,p);return p===0?dv>0:dv<0}return null},
  pair(q,p){const idx=[];MODEL.EL.forEach((e,i)=>{if(MODEL.col(e,p)!==null)idx.push(i)});let s=(q*2654435761)>>>0;const rnd=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};for(let k=0;k<50;k++){const i=idx[Math.floor(rnd()*idx.length)],j=idx[Math.floor(rnd()*idx.length)];if(i!==j&&MODEL.col(MODEL.EL[i],p)!==MODEL.col(MODEL.EL[j],p)){return[MODEL.EL[i],MODEL.EL[j]]}}return[MODEL.EL[2],MODEL.EL[3]]}
};
const S={sel:10,prop0:0,per:2,prop1:0,sel2:2,grp:'alk',prop3:0,q:1,ans:null,ok:0,tot:0};
const PN=['pRad','pIe','pEn'];
function nm(sym){return t('n_'+sym)}
function fmtV(v,p){return v===null?t('noVal'):(p===2?fx(v,2):String(v))}
function ramp(u){const a=[30,70,130],b=[255,190,90];return'rgb('+a.map((c,i)=>Math.round(c+(b[i]-c)*u)).join(',')+')'}
function range(p){const v=MODEL.EL.map(e=>MODEL.col(e,p)).filter(v=>v!==null);return[Math.min(...v),Math.max(...v)]}
function cellRect(e,w){const cw=(w-16)/18,ch=cw*1.0;return{x:8+(e[3]-1)*cw,y:12+(e[2]-1)*ch,w:cw-2,h:ch-2}}
DRAW[0]=function(x,w,h){const[lo,hi]=range(S.prop0),cw=(w-16)/18;for(const e of MODEL.EL){const r=cellRect(e,w),v=MODEL.col(e,S.prop0);x.fillStyle=v===null?'#2a313c':ramp((v-lo)/(hi-lo));x.fillRect(r.x,r.y,r.w,r.h);txt(x,e[0],r.x+r.w/2,r.y+r.h/2+4,v===null?C.muted:'#08131a',Math.max(9,Math.min(14,cw*0.5)),'center');if(MODEL.EL[S.sel]===e){x.strokeStyle=C.text;x.lineWidth=2.5;x.strokeRect(r.x-1,r.y-1,r.w+2,r.h+2)}}
  const ly=12+4*cw+14;for(let i=0;i<100;i++){x.fillStyle=ramp(i/99);x.fillRect(8+(w-16)*i/100,ly,(w-16)/100+1,10)}txt(x,fmtV(lo,S.prop0),8,ly+24,C.muted,12);txt(x,fmtV(hi,S.prop0),w-8,ly+24,C.muted,12,'right');txt(x,t(PN[S.prop0]),w/2,ly+24,C.text,12,'center');
  for(let g of [1,2,13,14,15,16,17,18])txt(x,String(g),8+(g-1)*cw+cw/2,9,C.muted,9,'center')};
function r0(){const e=MODEL.EL[S.sel];ro('s0-ro',t('r0',{name:nm(e[0]),sym:e[0],z:e[1],per:e[2],grp:e[3],r:e[4],ie:e[6],en:fmtV(e[5],2),prop:t(PN[S.prop0])}))}
function lineChart(x,p,series,sel,prop,xKey){const[lo,hi]=range(prop),Y=v=>p.y+p.h*(1-(v-lo*0.95)/(hi*1.03-lo*0.95)),X=g=>p.x+p.w*(g-0.5)/18;x.strokeStyle=C.line;x.lineWidth=1;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,t(PN[prop]),p.x+4,p.y+13,C.muted,12);[1,2,13,14,15,16,17,18].forEach(g=>txt(x,String(g),X(g),p.y+p.h+14,C.muted,10,'center'));
  series.forEach(([per,col])=>{const els=MODEL.period(per),on=per===sel;x.strokeStyle=col;x.lineWidth=on?3.5:1.2;x.globalAlpha=on?1:0.45;x.beginPath();let st=false;els.forEach(e=>{const v=MODEL.col(e,prop);if(v===null)return;const px=X(e[3]),py=Y(v);if(st)x.lineTo(px,py);else{x.moveTo(px,py);st=true}});x.stroke();els.forEach(e=>{const v=MODEL.col(e,prop);if(v!==null){dot(x,X(e[3]),Y(v),on?4.5:2.5,col);if(on)txt(x,e[0],X(e[3]),Y(v)-9,C.text,11,'center')}});x.globalAlpha=1})}
DRAW[1]=function(x,w,h){lineChart(x,{x:44,y:14,w:w-60,h:h-48},[[2,C.acc],[3,C.acc2],[4,C.good]],S.per,S.prop1)};
function r1(){const els=MODEL.period(S.per).filter(e=>MODEL.col(e,S.prop1)!==null),v=els.map(e=>MODEL.col(e,S.prop1));let down=0,up=0;for(let i=1;i<v.length;i++){if(v[i]<v[i-1])down++;else if(v[i]>v[i-1])up++}ro('s1-ro',t('r1',{per:S.per,prop:t(PN[S.prop1]),first:els[0][0],last:els[els.length-1][0],d1:fmtV(v[0],S.prop1),d2:fmtV(v[v.length-1],S.prop1),down:down,up:up}))}
DRAW[2]=function(x,w,h){const p={x:46,y:14,w:w-62,h:h-48},f=MODEL.fit(),xs=MODEL.EL.map(e=>MODEL.xval(e[1])),xm=Math.max(...xs)*1.05,Y=v=>p.y+p.h*(1-v/215),X=v=>p.x+p.w*v/xm;x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'r (pm)',p.x+4,p.y+13,C.muted,12);txt(x,'n*²/Zeff',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  x.strokeStyle='rgba(160,170,185,.6)';x.setLineDash([5,4]);x.beginPath();x.moveTo(X(0),Y(f.b));x.lineTo(X(xm),Y(f.m*xm+f.b));x.stroke();x.setLineDash([]);
  MODEL.EL.forEach(e=>{const sel=MODEL.EL[S.sel2]===e;dot(x,X(MODEL.xval(e[1])),Y(e[4]),sel?8:4,sel?C.acc2:C.acc);if(sel||e[0]==='Li'||e[0]==='Na'||e[0]==='K')txt(x,e[0],X(MODEL.xval(e[1]))+6,Y(e[4])-6,sel?C.acc2:C.muted,11)})};
function r2(){const e=MODEL.EL[S.sel2],f=MODEL.fit(),xv=MODEL.xval(e[1]),pred=f.m*xv+f.b;ro('s2-ro',t('r2',{name:nm(e[0]),z:e[1],n:MODEL.valN(e[1]),zeff:fx(MODEL.zeff(e[1]),2),x:fx(xv,2),pred:fx(pred,0),r:e[4],res:fx(e[4]-pred,0),cor:fx(f.r,2)}))}
function grpEls(){return MODEL.group(S.grp).map(MODEL.bySym)}
DRAW[3]=function(x,w,h){const els=grpEls(),vals=els.map(e=>MODEL.col(e,S.prop3)),mx=Math.max(...vals.filter(v=>v!==null),1),p={x:20,y:20,w:w-40,h:h-70},bw=Math.min(70,p.w/(els.length+1));els.forEach((e,i)=>{const v=vals[i],bx=p.x+p.w*(i+0.5)/els.length-bw/2;if(v!==null){const bh=v/mx*p.h;x.fillStyle=ramp(0.2+0.7*i/Math.max(1,els.length-1));x.fillRect(bx,p.y+p.h-bh,bw,bh);txt(x,fmtV(v,S.prop3),bx+bw/2,p.y+p.h-bh-6,C.text,12,'center')}else txt(x,t('noVal'),bx+bw/2,p.y+p.h-8,C.muted,12,'center');txt(x,e[0]+' ('+e[2]+')',bx+bw/2,p.y+p.h+16,C.text,13,'center')});txt(x,t(PN[S.prop3]),p.x,p.y-6,C.muted,12)};
function r3(){const els=grpEls(),vals=els.map(e=>MODEL.col(e,S.prop3));const list=els.map((e,i)=>e[0]+' '+fmtV(vals[i],S.prop3)).join(' → '),vv=vals.filter(v=>v!==null);ro('s3-ro',t('r3',{grp:t({alk:'gAlk',ae:'gAe',hal:'gHal',ng:'gNg'}[S.grp]||'gNg'),prop:t(PN[S.prop3]),list:list,ratio:vv.length>1?fx(vv[vv.length-1]/vv[0],2):'—'}))}
function q4(){const p=(S.q-1)%3;const[a,b]=MODEL.pair(S.q,p);return{p:p,a:a,b:b}}
DRAW[4]=function(x,w,h){const q=q4(),cw=Math.min(150,w*0.35);[[q.a,w*0.28],[q.b,w*0.72]].forEach(([e,cx])=>{x.fillStyle=C.panel;x.strokeStyle=C.line;x.fillRect(cx-cw/2,20,cw,h-70);x.strokeRect(cx-cw/2,20,cw,h-70);txt(x,e[0],cx,70,C.text,32,'center');txt(x,'Z = '+e[1],cx,95,C.muted,13,'center');if(S.ans){const v=MODEL.col(e,q.p),mx=Math.max(MODEL.col(q.a,q.p),MODEL.col(q.b,q.p));x.fillStyle=C.acc2;const bh=(h-150)*v/mx;x.fillRect(cx-16,h-50-bh,32,bh);txt(x,fmtV(v,q.p),cx,h-52-bh-4,C.text,12,'center')}});txt(x,'A',w*0.28,h-24,C.acc,14,'center');txt(x,'B',w*0.72,h-24,C.acc,14,'center')};
function r4(){const q=q4();$('s4-a').textContent=t('pickBtn',{s:q.a[0]});$('s4-b').textContent=t('pickBtn',{s:q.b[0]});if(!S.ans){ro('s4-ro',t('r4q',{n:S.q,prop:t(PN[q.p])})+' '+t('r4n',{tot:S.tot,ok:S.ok}));return}
  const va=MODEL.col(q.a,q.p),vb=MODEL.col(q.b,q.p),w=va>vb?q.a:q.b,righ=(S.ans==='A'?q.a:q.b)===w,tr=MODEL.followsTrend(q.a,q.b,q.p),lo=q.a[1]<q.b[1]?q.a:q.b,hi=q.a[1]<q.b[1]?q.b:q.a;let note;
  if(tr===null)note=t('noteNone');else if(lo[2]===hi[2])note=t(tr?'noteSamePer':'noteSamePerEx',{z:hi[0]});else note=t(tr?'noteSameGrp':'noteSameGrpEx',{z:hi[0]});
  ro('s4-ro',t('r4a',{good:righ?t('good'):t('bad'),a:q.a[0],va:fmtV(va,q.p),b:q.b[0],vb:fmtV(vb,q.p),w:w[0],note:note,tot:S.tot,ok:S.ok}))}
function answer(which){if(S.ans)return;const q=q4(),w=MODEL.col(q.a,q.p)>MODEL.col(q.b,q.p)?q.a:q.b;S.ans=which;S.tot++;if((which==='A'?q.a:q.b)===w)S.ok++;redraw(4);r4()}
function setProp(step,p){if(step===0)S.prop0=p;else if(step===1)S.prop1=p;else S.prop3=p;['r','ie','en'].forEach((k,i)=>$('s'+step+'-'+k).classList.toggle('active',i===p));redraw(step);[r0,r1,null,r3][step]()}
function init(){
  slider('s0-e',v=>MODEL.EL[v][0],v=>{S.sel=v;redraw(0);r0()});
  const cv=$('s0-canvas');cv.addEventListener('click',ev=>{const rc=cv.getBoundingClientRect(),px=ev.clientX-rc.left,py=ev.clientY-rc.top;MODEL.EL.forEach((e,i)=>{const r=cellRect(e,rc.width);if(px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h){S.sel=i;$('s0-e').value=i;FMT['s0-e']();redraw(0);r0()}})});
  ['r','ie','en'].forEach((k,i)=>{btn('s0-'+k,()=>setProp(0,i));btn('s1-'+k,()=>setProp(1,i));btn('s3-'+k,()=>setProp(3,i))});
  slider('s1-p',v=>fx(v,0),v=>{S.per=v;redraw(1);r1()});
  slider('s2-e',v=>MODEL.EL[v][0],v=>{S.sel2=v;redraw(2);r2()});
  [['alk','s3-g1'],['ae','s3-g2'],['hal','s3-g17'],['ng','s3-g18']].forEach(([g,id])=>btn(id,()=>{S.grp=g;['s3-g1','s3-g2','s3-g17','s3-g18'].forEach(i=>$(i).classList.toggle('active',i===id));redraw(3);r3()}));
  btn('s4-a',()=>answer('A'));btn('s4-b',()=>answer('B'));btn('s4-next',()=>{S.q++;S.ans=null;redraw(4);r4()});btn('s4-reset',()=>{S.q=1;S.ans=null;S.ok=0;S.tot=0;redraw(4);r4()});
  $('s0-r').classList.add('active');$('s1-r').classList.add('active');$('s3-r').classList.add('active');$('s3-g1').classList.add('active')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=2;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

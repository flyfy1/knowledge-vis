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

/* VSEPR point-charge sphere model: relax points on a unit sphere under q_i q_j / r^2 forces. */
const MODEL={
  LONE:1.2,
  rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}},
  energy(p,q){let e=0;for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)e+=q[i]*q[j]/Math.hypot(p[i][0]-p[j][0],p[i][1]-p[j][1],p[i][2]-p[j][2]);return e},
  start(n,seed){const r=MODEL.rng(seed),p=[];for(let i=0;i<n;i++){const v=[0,1,2].map(()=>r()+r()+r()+r()-2),m=Math.hypot(v[0],v[1],v[2])||1;p.push(v.map(a=>a/m))}return p},
  stepOnce(p,q,eta){const n=p.length,f=p.map(()=>[0,0,0]);for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(i!==j){const d=[p[i][0]-p[j][0],p[i][1]-p[j][1],p[i][2]-p[j][2]],m=Math.hypot(d[0],d[1],d[2]),c=q[i]*q[j]/(m*m*m);for(let k=0;k<3;k++)f[i][k]+=c*d[k]}
    return p.map((pi,i)=>{const dp=pi[0]*f[i][0]+pi[1]*f[i][1]+pi[2]*f[i][2],np=[0,1,2].map(k=>pi[k]+eta*(f[i][k]-dp*pi[k])),m=Math.hypot(np[0],np[1],np[2]);return np.map(a=>a/m)})},
  run(q,seed,iters,every){let p=MODEL.start(q.length,seed);const traj=[p.map(a=>a.slice())],es=[MODEL.energy(p,q)];for(let it=1;it<=iters;it++){p=MODEL.stepOnce(p,q,0.05);es.push(MODEL.energy(p,q));if(it%every===0)traj.push(p.map(a=>a.slice()))}return{p:p,E:es[es.length-1],traj:traj,es:es}},
  best(q,K,iters,every,base){let b=null;for(let s=0;s<K;s++){const r=MODEL.run(q,(base||0)+s*7+1,iters,every);if(!b||r.E<b.E-1e-9)b=r}return b},
  angle(a,b){return Math.acos(Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2])))*180/Math.PI},
  angles(p){const a=[];for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)a.push(MODEL.angle(p[i],p[j]));return a},
  charges(nb,nl){return[...Array(nb).fill(1),...Array(nl).fill(MODEL.LONE)]},
  capL(n){return n===6?1:n-2},
  shape(n,l){const k=n+','+l,m={'2,0':'shLin','3,0':'shTri','3,1':'shBent','4,0':'shTet','4,1':'shPyr','4,2':'shBent','5,0':'shTbp','5,1':'shSee','5,2':'shT','5,3':'shLin','6,0':'shOct','6,1':'shSqp'};return m[k]},
  MOLS:{co2:{n:2,l:0,ec:2.55,el:3.44,name:'mCo2n',exp:['180']},bf3:{n:3,l:0,ec:2.04,el:3.98,name:'mBf3n',exp:['120']},ch4:{n:4,l:0,ec:2.55,el:2.20,name:'mCh4n',exp:['109.5']},nh3:{n:4,l:1,ec:3.04,el:2.20,name:'mNh3n',exp:['107']},h2o:{n:4,l:2,ec:3.44,el:2.20,name:'mH2on',exp:['104.5']},sf4:{n:5,l:1,ec:2.58,el:3.98,name:'mSf4n',exp:null},sf6:{n:6,l:0,ec:2.58,el:3.98,name:'mSf6n',exp:['90']},xef2:{n:5,l:3,ec:2.6,el:3.98,name:'mXef2n',exp:['180']}},
  dipole(p,nb,ec,el){let s=[0,0,0];for(let i=0;i<nb;i++)for(let k=0;k<3;k++)s[k]+=(el-ec)*p[i][k];return s},
  _c:{},
  solve(n,l){const key=n+','+l;if(!MODEL._c[key])MODEL._c[key]=MODEL.best(MODEL.charges(n-l,l),30,1000,100,0);return MODEL._c[key]},
  bondAngles(r,nb){const a=[];for(let i=0;i<nb;i++)for(let j=i+1;j<nb;j++)a.push(MODEL.angle(r.p[i],r.p[j]));return a}
};
const S={n0:4,yaw:30,pitch:-0.35,traj0:null,fi:0,n1:5,it1:0,seed1:1,runs1:null,n2:4,l2:2,m3:'h2o',m4:'co2',seed0:1,play0:false};
function rot(p,yaw,pitch){const c=Math.cos(yaw),s=Math.sin(yaw),x1=p[0]*c+p[2]*s,z1=-p[0]*s+p[2]*c,cp=Math.cos(pitch),sp=Math.sin(pitch);return[x1,p[1]*cp-z1*sp,p[1]*sp+z1*cp]}
function draw3d(x,rc,pts,styles,R,extra){const cx=rc.x+rc.w/2,cy=rc.y+rc.h/2,yaw=S.yaw*Math.PI/180,items=pts.map((p,i)=>({r:rot(p,yaw,S.pitch),st:styles[i]}));x.strokeStyle='rgba(160,170,185,.25)';x.lineWidth=1;x.beginPath();x.arc(cx,cy,R,0,6.2832);x.stroke();
  const sorted=items.slice().sort((a,b)=>a.r[2]-b.r[2]);dot(x,cx,cy,9,C.acc2);
  for(const it of sorted){const sx=cx+it.r[0]*R,sy=cy-it.r[1]*R,depth=(it.r[2]+1)/2;if(it.st.bond){line(x,cx,cy,sx,sy,'rgba(200,210,225,'+(0.3+0.5*depth)+')',2)}x.globalAlpha=0.55+0.45*depth;dot(x,sx,sy,it.st.r*(0.8+0.5*depth),it.st.col);x.globalAlpha=1}
  if(extra)extra(cx,cy,R)}
const ST=(l)=>({r:l?15:9,col:l?'rgba(255,122,147,.85)':C.acc,bond:!l});
function areas(w,h){const narrow=w<520;return narrow?{a:{x:0,y:0,w:w,h:h*0.62},b:{x:10,y:h*0.64,w:w-20,h:h*0.34}}:{a:{x:0,y:0,w:w*0.55,h:h},b:{x:w*0.55,y:10,w:w*0.45-10,h:h-20}}}
function minmax(p){const a=MODEL.angles(p);return a.length?[Math.min(...a),Math.max(...a)]:[NaN,NaN]}
function resetTraj0(){const q=MODEL.charges(S.n0,0);const r=MODEL.best(q,12,500,5,S.seed0*31);S.traj0=r.traj;S.fi=0;S.play0=false;S.r0=r}
DRAW[0]=function(x,w,h){const rc={x:0,y:0,w:w,h:h},R=Math.min(w,h)*0.36,p=S.traj0[Math.min(S.fi,S.traj0.length-1)];draw3d(x,rc,p,p.map(()=>ST(false)),R)};
function r0(){const idx=Math.min(S.fi,S.traj0.length-1),p=S.traj0[idx],q=MODEL.charges(S.n0,0),mm=minmax(p),sh=['','','shLin','shTri','shTet','shTbp','shOct'][S.n0];ro('s0-ro',t('r0',{n:S.n0,shape:t(sh),amin:fx(mm[0],1),amax:fx(mm[1],1),e:fx(MODEL.energy(p,q),3),it:idx*5}))}
TICK[0]=function(dt){if(!S.play0)return false;S.fi+=Math.max(1,Math.round(dt*40));if(S.fi>=S.traj0.length-1){S.fi=S.traj0.length-1;S.play0=false}redraw(0);r0();return S.play0};
function runs1(){if(!S.runs1||S.runs1.n!==S.n1||S.runs1.seed!==S.seed1){const q=MODEL.charges(S.n1,0),rs=[];for(let i=0;i<5;i++)rs.push(MODEL.run(q,S.seed1*101+i*13+3,400,10));S.runs1={n:S.n1,seed:S.seed1,rs:rs}}return S.runs1.rs}
DRAW[1]=function(x,w,h){const A=areas(w,h),rs=runs1(),it=S.it1,r=rs[0],R=Math.min(A.a.w,A.a.h)*0.36,snap=r.traj[Math.round(it/10)];draw3d(x,A.a,snap,snap.map(()=>ST(false)),R);
  const p=A.b,e0=Math.max(...rs.map(a=>a.es[0])),emin=Math.min(...rs.map(a=>a.E)),Y=e=>p.y+p.h*(1-(e-emin*0.98)/(e0*1.02-emin*0.98)),X=i=>p.x+p.w*i/400;x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'E',p.x+4,p.y+13,C.muted,12);txt(x,'iter',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  const cols=[C.acc2,C.acc,C.good,C.acc3,C.vio];rs.forEach((a,k)=>{x.strokeStyle=cols[k];x.lineWidth=k===0?2.5:1.5;x.beginPath();a.es.forEach((e,i)=>i?x.lineTo(X(i),Y(e)):x.moveTo(X(i),Y(e)));x.stroke()});
  x.setLineDash([4,4]);line(x,p.x,Y(emin),p.x+p.w,Y(emin),C.muted,1);x.setLineDash([]);dot(x,X(it),Y(r.es[it]),6,C.text)};
function r1(){const rs=runs1(),emin=Math.min(...rs.map(a=>a.E)),k=rs.filter(a=>a.E-emin<0.001).length;ro('s1-ro',t('r1',{n:S.n1,it:S.it1,e:fx(rs[0].es[S.it1],4),emin:fx(emin,4),k:k}))}
function cur2(){const L=Math.min(S.l2,MODEL.capL(S.n2)),r=MODEL.solve(S.n2,L);return{L:L,r:r,nb:S.n2-L}}
DRAW[2]=function(x,w,h){const c=cur2(),R=Math.min(w,h)*0.36,p=c.r.p,st=p.map((_,i)=>ST(i>=c.nb));draw3d(x,{x:0,y:0,w:w,h:h},p,st,R)};
function fmtAngles(a){const u=[...new Set(a.map(v=>Math.round(v)))].sort((p,q)=>p-q);return u.length?u.join('/'):'—'}
function r2(){const c=cur2(),a=MODEL.bondAngles(c.r,c.nb),ideal={2:'180',3:'120',4:'109.5',5:'90/120',6:'90'}[S.n2];ro('s2-ro',t('r2',{n:S.n2,b:c.nb,l:c.L,shape:t(MODEL.shape(S.n2,c.L)),angles:fmtAngles(a),ideal:ideal,cap:S.l2>c.L?t('capNote',{m:MODEL.capL(S.n2)}):''}))}
function cur3(m){const d=MODEL.MOLS[m],r=MODEL.solve(d.n,d.l);return{d:d,r:r,nb:d.n-d.l}}
function expTxt(d){return d.exp?t('expAng',{a:d.exp[0]}):t('expSf4')}
DRAW[3]=function(x,w,h){const c=cur3(S.m3),R=Math.min(w,h)*0.36,p=c.r.p;draw3d(x,{x:0,y:0,w:w,h:h},p,p.map((_,i)=>ST(i>=c.nb)),R)};
function r3(){const c=cur3(S.m3),a=MODEL.bondAngles(c.r,c.nb),mm=a.length?[Math.min(...a),Math.max(...a)]:[NaN,NaN];ro('s3-ro',t('r3',{mol:t(c.d.name),n:c.d.n,l:c.d.l,shape:t(MODEL.shape(c.d.n,c.d.l)),amin:isNaN(mm[0])?'—':fx(mm[0],1),amax:isNaN(mm[1])?'—':fx(mm[1],1),exp:expTxt(c.d)}))}
DRAW[4]=function(x,w,h){const c=cur3(S.m4),R=Math.min(w,h)*0.34,p=c.r.p,dp=MODEL.dipole(p,c.nb,c.d.ec,c.d.el);draw3d(x,{x:0,y:0,w:w,h:h},p,p.map((_,i)=>ST(i>=c.nb)),R,(cx,cy,R2)=>{const yaw=S.yaw*Math.PI/180,v=rot(dp,yaw,S.pitch),sc=R2*0.5/ (Math.abs(c.d.el-c.d.ec)*1.2+0.01);arrow(x,cx,cy,cx+v[0]*sc,cy-v[1]*sc,C.acc2,4)})};
function r4(){const c=cur3(S.m4),dp=MODEL.dipole(c.r.p,c.nb,c.d.ec,c.d.el),m=Math.hypot(dp[0],dp[1],dp[2]);ro('s4-ro',t('r4',{mol:t(c.d.name),nb:c.nb,dip:fx(m,2),res:m<0.05?t('nonpolar'):t('polar')}))}
function setYaw(v){S.yaw=v;['s0-yaw','s2-yaw','s3-yaw','s4-yaw'].forEach(id=>{$(id).value=v;FMT[id]()});[0,1,2,3,4].forEach(redraw)}
function drag(id){const cv=$(id);let down=false,lx=0,ly=0;cv.addEventListener('pointerdown',e=>{down=true;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId)});cv.addEventListener('pointerup',()=>{down=false});cv.addEventListener('pointermove',e=>{if(!down)return;S.yaw=((S.yaw+(e.clientX-lx)*0.6)%360+360)%360;S.pitch=Math.max(-1.3,Math.min(1.3,S.pitch+(e.clientY-ly)*0.01));lx=e.clientX;ly=e.clientY;setYaw(Math.round(S.yaw/5)*5)})}
function setMol(step,m,ids){if(step===3)S.m3=m;else S.m4=m;ids.forEach(([k,id])=>$(id).classList.toggle('active',k===m));redraw(step);step===3?r3():r4()}
function init(){
  resetTraj0();
  slider('s0-n',v=>fx(v,0),v=>{S.n0=v;resetTraj0();S.play0=!REDUCE;if(REDUCE)S.fi=S.traj0.length-1;redraw(0);r0();kick()});slider('s0-yaw',v=>v+'°',v=>setYaw(v));
  btn('s0-play',()=>{S.fi=0;S.play0=!REDUCE;if(REDUCE)S.fi=S.traj0.length-1;redraw(0);r0();kick()});btn('s0-new',()=>{S.seed0++;resetTraj0();S.play0=!REDUCE;if(REDUCE)S.fi=S.traj0.length-1;redraw(0);r0();kick()});
  slider('s1-n',v=>fx(v,0),v=>{S.n1=v;redraw(1);r1()});slider('s1-it',v=>fx(v,0),v=>{S.it1=v;redraw(1);r1()});btn('s1-new',()=>{S.seed1++;redraw(1);r1()});
  slider('s2-n',v=>fx(v,0),v=>{S.n2=v;redraw(2);r2()});slider('s2-l',v=>fx(v,0),v=>{S.l2=v;redraw(2);r2()});slider('s2-yaw',v=>v+'°',v=>setYaw(v));slider('s3-yaw',v=>v+'°',v=>setYaw(v));slider('s4-yaw',v=>v+'°',v=>setYaw(v));
  const ids3=['co2','bf3','ch4','nh3','h2o','sf4','sf6','xef2'].map(k=>[k,'s3-'+k]),ids4=ids3.map(([k])=>[k,'s4-'+k]);ids3.forEach(([k,id])=>btn(id,()=>setMol(3,k,ids3)));ids4.forEach(([k,id])=>btn(id,()=>setMol(4,k,ids4)));
  ids3.forEach(([k,id])=>$(id).classList.toggle('active',k===S.m3));ids4.forEach(([k,id])=>$(id).classList.toggle('active',k===S.m4));
  [0,1,2,3,4].forEach(i=>drag('s'+i+'-canvas'));S.play0=!REDUCE;if(REDUCE)S.fi=S.traj0.length-1}
function render(){redrawAll();r0();r1();r2();r3();r4();if(S.play0)kick()}

QUIZ.ans=1;QUIZ.step=2;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

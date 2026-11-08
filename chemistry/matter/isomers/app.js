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

/* Isomers: alkane carbon skeletons as trees (max degree 4), canonical forms, torsion energies. */
const MODEL={
  canon(adj){const n=adj.length;if(n===1)return'()';const deg=adj.map(a=>a.length),rem=deg.slice(),removed=new Array(n).fill(false);let leaves=[],left=n;for(let i=0;i<n;i++)if(deg[i]<=1)leaves.push(i);while(left>2){const next=[];for(const l of leaves){removed[l]=true;left--;for(const m of adj[l])if(!removed[m]){rem[m]--;if(rem[m]===1)next.push(m)}}leaves=next}
    const centers=[];for(let i=0;i<n;i++)if(!removed[i])centers.push(i);const enc=(v,p)=>'('+adj[v].filter(c=>c!==p).map(c=>enc(c,v)).sort().join('')+')';
    if(centers.length===1)return enc(centers[0],-1);const a=enc(centers[0],centers[1]),b=enc(centers[1],centers[0]);return'['+[a,b].sort().join('')+']'},
  enumerate(n){let trees=[[[]]],seen=null;for(let k=1;k<n;k++){const out=[],keys=new Set();for(const t of trees){for(let v=0;v<t.length;v++){if(t[v].length>=4)continue;const nt=t.map(a=>a.slice());nt.push([v]);nt[v].push(t.length);const key=MODEL.canon(nt);if(!keys.has(key)){keys.add(key);out.push(nt)}}}trees=out}return trees},
  hCount(adj){return adj.reduce((s,a)=>s+4-a.length,0)},
  bfs(adj,s){const d=new Array(adj.length).fill(-1);d[s]=0;const q=[s];for(let i=0;i<q.length;i++)for(const m of adj[q[i]])if(d[m]<0){d[m]=d[q[i]]+1;q.push(m)}return d},
  diam(adj){const d0=MODEL.bfs(adj,0),a=d0.indexOf(Math.max(...d0)),d1=MODEL.bfs(adj,a);return Math.max(...d1)},
  sig(adj){const deg=adj.map(a=>a.length),mx=Math.max(...deg),ln=[];deg.forEach((d,v)=>{if(d===mx)ln.push(adj[v].filter(c=>adj[c].length===1).length)});return adj.length+'|'+MODEL.diam(adj)+'|'+deg.slice().sort((a,b)=>b-a).join('')+'|'+ln.sort((a,b)=>b-a).join('')},
  NAMES:{'4|3|2211|11':'butane','4|2|3111|3':'2mp','5|4|22211|110':'pentane','5|3|32111|2':'2mb','5|2|41111|4':'22dmp','6|5|222211|1100':'hexane','6|4|322111|2':'2mpe','6|4|322111|1':'3mpe','6|3|331111|22':'23dmb','6|3|421111|3':'22dmb'},
  BP:{butane:-0.5,'2mp':-11.7,pentane:36.1,'2mb':27.8,'22dmp':9.5,hexane:68.7,'2mpe':60.3,'3mpe':63.3,'23dmb':58.0,'22dmb':49.7},
  name(adj){return MODEL.NAMES[MODEL.sig(adj)]||null},
  sortIso(n){return MODEL.enumerate(n).sort((a,b)=>MODEL.diam(b)-MODEL.diam(a)||MODEL.sig(a).localeCompare(MODEL.sig(b)))},
  rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}},
  layout(adj,root,seed){const r=MODEL.rng(seed),pos=new Array(adj.length),W=new Array(adj.length);const wt=(v,p)=>{let s=0,k=0;for(const c of adj[v])if(c!==p){s+=wt(c,v);k++}return W[v]=k?s:1};wt(root,-1);const rot=r()*6.2832,mirror=r()<0.5?1:-1;pos[root]=[0,0];
    const place=(v,p,a0,a1)=>{const ch=adj[v].filter(c=>c!==p);for(let i=ch.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[ch[i],ch[j]]=[ch[j],ch[i]]}const tot=ch.reduce((s,c)=>s+W[c],0);let a=a0;for(const c of ch){const span=(a1-a0)*W[c]/tot,mid=a+span/2;pos[c]=[pos[v][0]+Math.cos(mid),pos[v][1]+mirror*Math.sin(mid)];place(c,v,a,a+span);a+=span}};
    const n0=adj[root].length;place(root,-1,rot,rot+6.2832);return pos},
  pairQ(q,n){const r=MODEL.rng(q*7919+n*104729),iso=MODEL.sortIso(n),a=Math.floor(r()*iso.length),same=r()<0.5;let b=a;if(!same&&iso.length>1){const dsA=iso[a].map(x=>x.length).sort().join(),cand=iso.map((_,i)=>i).filter(i=>i!==a),sim=cand.filter(i=>iso[i].map(x=>x.length).sort().join()===dsA);const pool=sim.length&&r()<0.7?sim:cand;b=pool[Math.floor(r()*pool.length)]}
    return{A:iso[a],B:iso[b],seedA:q*31+1,seedB:q*57+5,same:MODEL.canon(iso[a])===MODEL.canon(iso[b])}},
  MOL:{pr1:{atoms:[['C',0,0.5],['C',1,0],['C',2,0.5],['O',3,0]],bonds:[[0,1],[1,2],[2,3]],bp:97.2,name:'nm_pr1',kind:'a'},pr2:{atoms:[['C',0,0.5],['C',1,0],['C',2,0.5],['O',1,-1]],bonds:[[0,1],[1,2],[1,3]],bp:82.6,name:'nm_pr2',kind:'a'},eth:{atoms:[['C',0,0.5],['C',1,0],['O',2,0.5],['C',3,0]],bonds:[[0,1],[1,2],[2,3]],bp:7.4,name:'nm_meet',kind:'e'},etoh:{atoms:[['C',0,0.5],['C',1,0],['O',2,0.5]],bonds:[[0,1],[1,2]],bp:78.4,name:'nm_etoh',kind:'a'},dme:{atoms:[['C',0,0.5],['O',1,0],['C',2,0.5]],bonds:[[0,1],[1,2]],bp:-24.8,name:'nm_dme',kind:'e'}},
  VAL:{C:4,O:2},
  formula(m){const deg=m.atoms.map(()=>0);m.bonds.forEach(([a,b])=>{deg[a]++;deg[b]++});let c=0,o=0,h=0;m.atoms.forEach((a,i)=>{if(a[0]==='C')c++;else o++;h+=MODEL.VAL[a[0]]-deg[i]});return{c:c,o:o,h:h,deg:deg}},
  GROUP:{pr1:['pr1','pr2','eth'],pr2:['pr1','pr2','eth'],eth:['pr1','pr2','eth'],etoh:['etoh','dme'],dme:['etoh','dme']},
  torsion(kind,th){const r=th*Math.PI/180;return kind==='single'?6*(1+Math.cos(3*r)):132.5*(1-Math.cos(2*r))},
  barrier(kind){return kind==='single'?12:265},
  chance(kind){return Math.exp(-MODEL.barrier(kind)/(0.008314*298))}
};
const S={n0:4,i0:1,n1:5,n2:6,q:1,ans:null,ok:0,tot:0,m3:'pr1',kind:'single',th:0};
function fitPts(pos,rc,pad){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;pos.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});const sw=Math.max(0.01,x1-x0),sh=Math.max(0.01,y1-y0),s=Math.min((rc.w-2*pad)/sw,(rc.h-2*pad)/sh,48);return pos.map(p=>[rc.x+rc.w/2+(p[0]-(x0+x1)/2)*s,rc.y+rc.h/2+(p[1]-(y0+y1)/2)*s])}
function drawTree(x,adj,pos,rc,rad){const P=fitPts(pos,rc,rad+6);adj.forEach((a,i)=>a.forEach(j=>{if(j>i)line(x,P[i][0],P[i][1],P[j][0],P[j][1],C.muted,2.5)}));adj.forEach((a,i)=>{dot(x,P[i][0],P[i][1],rad,'#2c3a4d');x.strokeStyle=C.acc;x.lineWidth=1.5;x.beginPath();x.arc(P[i][0],P[i][1],rad,0,6.2832);x.stroke();if(rad>=8)txt(x,String(4-a.length),P[i][0],P[i][1]+4,C.text,Math.min(13,rad+1),'center')})}
function layoutRows(w,h){const narrow=w<520;return narrow?{a:{x:0,y:0,w:w,h:h*0.58},b:{x:10,y:h*0.6,w:w-20,h:h*0.38}}:{a:{x:0,y:0,w:w*0.55,h:h},b:{x:w*0.55,y:10,w:w*0.45-10,h:h-20}}}
function cur0(){const iso=MODEL.sortIso(S.n0),k=Math.min(S.i0,iso.length);return{iso:iso,k:k,adj:iso[k-1]}}
DRAW[0]=function(x,w,h){const A=layoutRows(w,h),c=cur0();drawTree(x,c.adj,MODEL.layout(c.adj,0,1+S.n0*10+c.k),A.a,13);
  const p=A.b,bps=c.iso.map(a=>MODEL.BP[MODEL.name(a)]),lo=Math.min(...bps,-20),hi=Math.max(...bps,80),bw=p.w/c.iso.length*0.6;x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'bp (°C)',p.x+4,p.y+13,C.muted,12);const Y=v=>p.y+p.h*(1-(v-lo)/(hi-lo)),y0=Y(0);line(x,p.x,y0,p.x+p.w,y0,'rgba(255,255,255,.15)',1);
  bps.forEach((v,i)=>{const bx=p.x+p.w*(i+0.5)/c.iso.length-bw/2;x.fillStyle=i===c.k-1?C.acc2:'rgba(110,231,255,.5)';x.fillRect(bx,Math.min(Y(v),y0),bw,Math.abs(Y(v)-y0)+1);txt(x,fx(v,1),bx+bw/2,v>=0?Y(v)-4:Y(v)+12,C.text,11,'center')})};
function r0(){const c=cur0(),nm=MODEL.name(c.adj),bp=MODEL.BP[nm];ro('s0-ro',t('r0',{name:t('nm_'+nm),k:c.k,m:c.iso.length,c:c.adj.length,h:MODEL.hCount(c.adj),len:MODEL.diam(c.adj)+1,bp:fx(bp,1)}))}
DRAW[1]=function(x,w,h){const iso=MODEL.sortIso(S.n1),cols=Math.min(5,Math.ceil(Math.sqrt(iso.length*w/h))),rows=Math.ceil(iso.length/cols),cw=w/cols,ch=h/rows;iso.forEach((a,i)=>{const rc={x:(i%cols)*cw,y:Math.floor(i/cols)*ch,w:cw,h:ch};x.strokeStyle='rgba(41,64,82,.5)';x.strokeRect(rc.x+2,rc.y+2,rc.w-4,rc.h-4);drawTree(x,a,MODEL.layout(a,0,i+3),{x:rc.x+4,y:rc.y+4,w:rc.w-8,h:rc.h-8},iso.length>9?5:(iso.length>5?8:10))})};
function r1(){const iso=MODEL.sortIso(S.n1),p=S.n1>2?MODEL.sortIso(S.n1-1).length:1;ro('s1-ro',t('r1',{n:S.n1,cnt:iso.length,h:2*S.n1+2,p:S.n1-1,pc:p,gr:fx(iso.length/p,2)}))}
function q2(){return MODEL.pairQ(S.q,S.n2)}
function pic(adj,seed){const r=MODEL.rng(seed),root=Math.floor(r()*adj.length);return MODEL.layout(adj,root,seed+1)}
DRAW[2]=function(x,w,h){const q=q2(),rc1={x:0,y:0,w:w/2,h:h},rc2={x:w/2,y:0,w:w/2,h:h};drawTree(x,q.A,pic(q.A,q.seedA),{x:6,y:20,w:rc1.w-12,h:h-30},12);drawTree(x,q.B,pic(q.B,q.seedB),{x:rc2.x+6,y:20,w:rc2.w-12,h:h-30},12);txt(x,'A',12,16,C.acc,14);txt(x,'B',w/2+12,16,C.acc,14);line(x,w/2,6,w/2,h-6,C.line,1)};
function r2(){const q=q2();if(!S.ans){ro('s2-ro',t('r2q',{k:S.q,n:S.n2,tot:S.tot,ok:S.ok}));return}const right=(S.ans==='same')===q.same;ro('s2-ro',t('r2a',{good:right?t('good'):t('bad'),eq:q.same?t('eqSame'):t('eqDiff'),l1:MODEL.diam(q.A)+1,l2:MODEL.diam(q.B)+1,n:S.n2,tot:S.tot,ok:S.ok}))}
function answer(a){if(S.ans)return;const q=q2();S.ans=a;S.tot++;if((a==='same')===q.same)S.ok++;redraw(2);r2()}
function drawMol(x,m,rc){const pos=m.atoms.map(a=>[a[1],-a[2]]),P=fitPts(pos,rc,40),f=MODEL.formula(m);m.bonds.forEach(([a,b])=>line(x,P[a][0],P[a][1],P[b][0],P[b][1],C.muted,3));m.atoms.forEach((a,i)=>{const col=a[0]==='O'?'#c94a62':'#5b6575';dot(x,P[i][0],P[i][1],15,col);txt(x,a[0],P[i][0],P[i][1]+4,'#fff',13,'center');const hh=MODEL.VAL[a[0]]-f.deg[i];if(hh>0)txt(x,'H'+(hh>1?hh:''),P[i][0],P[i][1]-20,C.acc,12,'center')})}
DRAW[3]=function(x,w,h){const A=layoutRows(w,h),m=MODEL.MOL[S.m3];drawMol(x,m,A.a);const group=MODEL.GROUP[S.m3],p=A.b;x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'bp (°C)',p.x+4,p.y+13,C.muted,12);const lo=-40,hi=110,Y=v=>p.y+p.h*(1-(v-lo)/(hi-lo)),y0=Y(0),bw=p.w/group.length*0.55;line(x,p.x,y0,p.x+p.w,y0,'rgba(255,255,255,.15)',1);
  group.forEach((k,i)=>{const v=MODEL.MOL[k].bp,bx=p.x+p.w*(i+0.5)/group.length-bw/2;x.fillStyle=k===S.m3?C.acc2:'rgba(110,231,255,.5)';x.fillRect(bx,Math.min(Y(v),y0),bw,Math.abs(Y(v)-y0)+1);txt(x,fx(v,1),bx+bw/2,v>=0?Y(v)-4:Y(v)+12,C.text,11,'center')})};
function r3(){const m=MODEL.MOL[S.m3],f=MODEL.formula(m);ro('s3-ro',t('r3',{name:t(m.name),c:f.c,h:f.h,kind:t(m.kind==='a'?'kAlcohol':'kEther'),bp:fx(m.bp,1)}))}
DRAW[4]=function(x,w,h){const A=layoutRows(w,h),a=A.a,cx=a.x+a.w/2,cy=a.y+a.h/2,R=Math.min(a.w,a.h)*0.2,th=S.th*Math.PI/180,dbl=S.kind==='double';x.strokeStyle=C.muted;x.lineWidth=2;x.beginPath();x.arc(cx,cy,R,0,6.2832);x.stroke();
  const sub=(ang,len,col,lab,front)=>{const ex=cx+Math.cos(ang)*(R+len),ey=cy-Math.sin(ang)*(R+len),sx=front?cx:cx+Math.cos(ang)*R,sy=front?cy:cy-Math.sin(ang)*R;line(x,sx,sy,ex,ey,col,front?4:3);dot(x,ex,ey,9,col);txt(x,lab,ex,ey+4,'#08131a',11,'center')};
  const fr=dbl?[[Math.PI/2,'CH₃'],[3*Math.PI/2,'H']]:[[Math.PI/2,'CH₃'],[Math.PI/2+2.0944,'H'],[Math.PI/2+4.1888,'H']],bk=dbl?[[Math.PI/2+th,'CH₃'],[3*Math.PI/2+th,'H']]:[[Math.PI/2+th,'CH₃'],[Math.PI/2+th+2.0944,'H'],[Math.PI/2+th+4.1888,'H']];
  bk.forEach(([an,l])=>sub(an,R*0.9,'rgba(255,180,84,.9)',l==='CH₃'?'C':'H',false));fr.forEach(([an,l])=>sub(an,R*0.9,'rgba(110,231,255,.9)',l==='CH₃'?'C':'H',true));
  const p=A.b,E=a2=>MODEL.torsion(S.kind,a2),emax=270,X=u=>p.x+p.w*u/180,Y=v=>p.y+p.h*(1-v/emax);x.strokeStyle=C.line;x.strokeRect(p.x,p.y,p.w,p.h);txt(x,'E (kJ/mol)',p.x+4,p.y+13,C.muted,12);txt(x,'θ',p.x+p.w-4,p.y+p.h+14,C.muted,12,'right');
  x.strokeStyle=C.acc2;x.lineWidth=3;x.beginPath();for(let i=0;i<=180;i+=3){i?x.lineTo(X(i),Y(E(i))):x.moveTo(X(i),Y(E(i)))}x.stroke();dot(x,X(S.th),Y(E(S.th)),7,C.acc);x.setLineDash([4,4]);line(x,p.x,Y(2.478),p.x+p.w,Y(2.478),C.good,1);x.setLineDash([]);txt(x,'RT',p.x+p.w-4,Y(2.478)-4,C.good,11,'right')};
function r4(){const k=S.kind,e=MODEL.torsion(k,S.th);ro('s4-ro',t('r4',{kind:t(k==='single'?'kSingle':'kDouble'),th:S.th,e:fx(e,1),bar:MODEL.barrier(k),p:MODEL.chance(k).toExponential(1),res:t(k==='single'?'resFree':'resLocked')}))}
function setKind(k){S.kind=k;$('s4-single').classList.toggle('active',k==='single');$('s4-double').classList.toggle('active',k==='double');redraw(4);r4()}
function setMol(k){S.m3=k;['pr1','pr2','eth','etoh','dme'].forEach(i=>$('s3-'+i).classList.toggle('active',i===k));redraw(3);r3()}
function init(){
  slider('s0-n',v=>fx(v,0),v=>{S.n0=v;redraw(0);r0()});slider('s0-i',v=>fx(Math.min(v,MODEL.sortIso(S.n0).length),0),v=>{S.i0=v;redraw(0);r0()});
  slider('s1-n',v=>fx(v,0),v=>{S.n1=v;redraw(1);r1()});
  slider('s2-n',v=>fx(v,0),v=>{S.n2=v;S.q=1;S.ans=null;redraw(2);r2()});btn('s2-same',()=>answer('same'));btn('s2-diff',()=>answer('diff'));btn('s2-next',()=>{S.q++;S.ans=null;redraw(2);r2()});btn('s2-reset',()=>{S.q=1;S.ans=null;S.ok=0;S.tot=0;redraw(2);r2()});
  [['pr1','s3-pr1'],['pr2','s3-pr2'],['eth','s3-eth'],['etoh','s3-etoh'],['dme','s3-dme']].forEach(([k,id])=>btn(id,()=>setMol(k)));
  slider('s4-th',v=>v+'°',v=>{S.th=v;redraw(4);r4()});btn('s4-single',()=>setKind('single'));btn('s4-double',()=>setKind('double'));setMol('pr1');setKind('single')}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

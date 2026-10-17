'use strict';
const $ = id => document.getElementById(id);
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const fmt = v => (Math.abs(v)<0.0005?0:v).toFixed(2);
const cyan='#6ee7ff', orange='#ffb454', pink='#ff7a93', muted='#9aa7b8';
const S={s0:{guess:null,opened:[]},s1:{n:0,raf:0,start:0},s2:{a:3,b:4,k:0},s3:{x:160,y:200,free:false,history:[],anchor:null},s4:{sides:[3,4,5],guess:null,revealed:false,n:0,k:0},s5:{d:3,x:5,y:4,history:[]},s6:{ks:[1],unit:false}};
function ro(id,text){$(id).textContent=text;}
function fitCanvas(cv){
 const dpr=Math.min(window.devicePixelRatio||1,3);
 if(cv.dataset.cssH===undefined)cv.dataset.cssH=cv.getAttribute('height')||'360';
 cv.style.height=cv.dataset.cssH+'px';
 const w=cv.clientWidth,h=Number(cv.dataset.cssH);
 const bw=Math.max(2,Math.round(w*dpr)),bh=Math.max(2,Math.round(h*dpr));
 if(cv.width!==bw)cv.width=bw;if(cv.height!==bh)cv.height=bh;
 const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);cv._w=w;cv._h=h;return ctx;
}
// Every scene uses a fixed logical coordinate system scaled inside the CSS box.
function scene(id,w=320,h=340){const cv=$(id),ctx=fitCanvas(cv);ctx.clearRect(0,0,cv._w,cv._h);const scale=Math.min(cv._w/w,cv._h/h);const ox=(cv._w-w*scale)/2,oy=(cv._h-h*scale)/2;ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);cv._view={w,h,scale,ox,oy};return ctx;}
function poly(ctx,pts,fill,stroke=cyan){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}ctx.strokeStyle=stroke;const m=ctx.getTransform();ctx.lineWidth=1.5*Math.min(window.devicePixelRatio||1,3)/Math.hypot(m.a,m.b);ctx.stroke();}
function line(ctx,a,b,color=muted){ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();}
function text(ctx,str,x,y,color=muted,size=13){ctx.font=`${size}px system-ui,sans-serif`;ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(str,x,y);}
function dot(ctx,p,color=orange,r=6){ctx.beginPath();ctx.arc(...p,r,0,2*Math.PI);ctx.fillStyle=color;ctx.fill();}
function mark(ctx,x,y){poly(ctx,[[x-10,y],[x-10,y-10],[x,y-10]],null,orange);}
function triangle(ctx,a,b,c,box=[55,60,210,210]){
 const [x,y,w,h]=box;const xx=(a*a+c*c-b*b)/(2*c),yy=Math.sqrt(Math.max(0,a*a-xx*xx));
 const sc=Math.min(w/c,h/Math.max(yy,0.01));const A=[x,y+h],B=[x+c*sc,y+h],R=[x+xx*sc,y+h-yy*sc];
 poly(ctx,[A,R,B],'#153344');text(ctx,'a = '+a,(A[0]+R[0])/2-18,(A[1]+R[1])/2,cyan);text(ctx,'b = '+b,(R[0]+B[0])/2+20,(R[1]+B[1])/2,orange);text(ctx,'c = '+(Number.isInteger(c)?c:fmt(c)),(A[0]+B[0])/2,A[1]+22,pink);
 if(Math.abs(c*c-a*a-b*b)<1e-8){const u=[(A[0]-R[0])/a/sc,(A[1]-R[1])/a/sc],v=[(B[0]-R[0])/b/sc,(B[1]-R[1])/b/sc];poly(ctx,[[R[0]+10*u[0],R[1]+10*u[1]],[R[0]+10*(u[0]+v[0]),R[1]+10*(u[1]+v[1])],[R[0]+10*v[0],R[1]+10*v[1]]],null,orange);}
}
const examples=[[3,4,5],[5,12,13],[2,3,4]];
function render0(){const s=S.s0,ctx=scene('s0-canvas');const idx=s.opened.length?s.opened[s.opened.length-1]:0;triangle(ctx,...examples[idx]);text(ctx,t(idx===2?'notRight':'right'),160,30);ctx.restore();
 ro('s0-guess',s.guess===null?t('guessIdle'):t('guessEcho',{guess:t(s.guess),n:s.opened.length}));
 ['all','only'].forEach(k=>{const b=$('s0-'+k);b.disabled=s.opened.length>0;b.setAttribute('aria-pressed',String(s.guess===(k==='all'?'guessAll':'guessOnly')));});
 examples.forEach((e,i)=>{const b=$('s0-case'+i);b.textContent=e.join('–')+' · '+t('check');b.disabled=s.guess===null||s.opened.includes(i);});
 $('s0-ledger').replaceChildren(...s.opened.map(i=>{const [a,b,c]=examples[i],p=document.createElement('p');p.className='value-card';p.textContent=`${a}² + ${b}² = ${a*a} + ${b*b} ${i===2?'≠':'='} ${c*c} = ${c}² ${i===2?'✗':'✓'} · ${t(i===2?'notRight':'right')}`;return p;}));
}
// Attached squares in common Euclidean coordinates. Each polygon cell is one unit².
function render1(){const ctx=scene('s1-canvas',350,340),n=S.s1.n;ctx.save();ctx.translate(106,22);ctx.scale(26,26);
 poly(ctx,[[1,3],[4,3],[4,7]],'#1c2330');poly(ctx,[[3.7,3],[3.7,3.3],[4,3.3]],null,orange);
 const cell=(p,u,v,color)=>poly(ctx,[p,[p[0]+u[0],p[1]+u[1]],[p[0]+u[0]+v[0],p[1]+u[1]+v[1]],[p[0]+v[0],p[1]+v[1]]],color,'#455568');
 // Restore thin grid lines after the world-scale transform.
 ctx.lineWidth=0.03;
 for(let i=0;i<9;i++)cell([1+i%3,Math.floor(i/3)],[1,0],[0,1],i<n?'#161b22':cyan);
 for(let i=0;i<16;i++)cell([4+i%4,3+Math.floor(i/4)],[1,0],[0,1],i<n-9?'#161b22':orange);
 const u=[0.6,0.8],v=[-0.8,0.6];for(let i=0;i<25;i++){const col=i%5,row=Math.floor(i/5);cell([1+col*u[0]+row*v[0],3+col*u[1]+row*v[1]],u,v,i<n?(i<9?cyan:orange):'#161b22');}
 ctx.restore();text(ctx,'a² = 9',170,15,cyan);text(ctx,'b² = 16',287,145,orange);text(ctx,'c² = 25',66,280,pink);text(ctx,'a = 3',163,117,cyan);text(ctx,'b = 4',194,158,orange);text(ctx,'c = 5',65,120,pink);ctx.restore();
 $('s1-progress').value=n;ro('s1-readout',t('fillRO',{pct:n*4,n}));ro('s1-result',n===25?t('fillDone'):'');$('s1-pour').disabled=!!S.s1.raf||n===25;
}
function pour(){const s=S.s1;if(s.raf||s.n===25)return;s.start=performance.now();function tick(ts){s.n=Math.min(25,Math.floor((ts-s.start)/100));if(s.n<25)s.raf=requestAnimationFrame(tick);else s.raf=0;render1();}s.raf=requestAnimationFrame(tick);render1();}
function reset1(){cancelAnimationFrame(S.s1.raf);S.s1={n:0,raf:0,start:0};render1();}
function render2(){const {a,b,k}=S.s2,L=a+b,cc=a*a+b*b,ctx=scene('s2-canvas');const side=260,sc=side/L;ctx.save();ctx.translate(30,40);ctx.scale(sc,sc);
 poly(ctx,[[0,0],[L,0],[L,L],[0,L]],'#101821');
 const pieces=[[[0,0],[a,0],[0,b]],[[L,0],[L,a],[a,0]],[[L,L],[b,L],[L,a]],[[0,L],[0,b],[b,L]]];
 pieces.slice(0,k).forEach((p,i)=>poly(ctx,p,[cyan,orange,pink,'#7ee2a8'][i]+'88'));
 if(k===4)poly(ctx,[[a,0],[L,a],[b,L],[0,b]],'#453329',orange);
 ctx.restore();text(ctx,`a + b = ${L}`,160,18);text(ctx,'a',30+a*sc/2,32,cyan);text(ctx,'b',18,40+b*sc/2,orange);if(k===4)text(ctx,`c² = ${cc}`,160,170,orange,18);text(ctx,`${k}/4`,160,326,cyan,18);ctx.restore();
 ro('s2-readout',t('proofRO',{a,b,k,c:fmt(Math.sqrt(cc)),L}));
 ro('s2-book1',`(a+b)² = a² + 2ab + b²\n${L}² = ${a*a} + ${2*a*b} + ${b*b} = ${L*L}`);
 ro('s2-book2',k<4?`${k} × (ab/2) = ${k} × ${a*b/2} = ${k*a*b/2}\n`+t('bookWait'):`4 × (ab/2) + c² = 2ab + c²\n${2*a*b} + ${cc} = ${L*L}`);
 ro('s2-result',k===4?t('proofDone',{aa:a*a,bb:b*b,cc}):'');$('s2-result').style.color=k===4?orange:muted;$('s2-piece').disabled=k===4;
}
function geom3(){const s=S.s3,R=[s.x,s.y],A=s.free?s.anchor.A:[40,s.y],B=s.free?s.anchor.B:[s.x,40];const a=Math.hypot(R[0]-A[0],R[1]-A[1])/30,b=Math.hypot(R[0]-B[0],R[1]-B[1])/30,c=Math.hypot(A[0]-B[0],A[1]-B[1])/30,root=Math.sqrt(a*a+b*b),delta=c*c-a*a-b*b;const cross=(A[0]-R[0])*(B[1]-R[1])-(A[1]-R[1])*(B[0]-R[0]);return {R,A,B,a,b,c,root,delta,cross};}
function render3(){const s=S.s3,g=geom3(),ctx=scene('s3-canvas');s.history.forEach(p=>dot(ctx,p,'#506072',2));poly(ctx,[g.A,g.R,g.B],'#173040');dot(ctx,g.R);text(ctx,'R',g.R[0]+14,g.R[1]+13,orange);text(ctx,'a',Math.max(15,(g.A[0]+g.R[0])/2-10),(g.A[1]+g.R[1])/2+16,cyan);text(ctx,'b',(g.B[0]+g.R[0])/2+15,(g.B[1]+g.R[1])/2,orange);text(ctx,'c',(g.A[0]+g.B[0])/2-12,(g.A[1]+g.B[1])/2-15,pink);
 if(!s.free)mark(ctx,s.x,s.y);
 const sizes=[g.a,g.b,g.c],colors=[cyan,orange,pink];sizes.forEach((v,i)=>{const z=v*5;poly(ctx,[[40+i*100,310],[40+i*100+z,310],[40+i*100+z,310-z],[40+i*100,310-z]],colors[i]+'55',colors[i]);text(ctx,['a²','b²','c²'][i],55+i*100,328,colors[i]);});ctx.restore();
 ro('s3-areas',t('geomRO',{a:fmt(g.a),b:fmt(g.b),aa:fmt(g.a*g.a),bb:fmt(g.b*g.b),cc:fmt(g.c*g.c)}));ro('s3-measure',t('measure',{c:fmt(g.c)}));ro('s3-root',t('root',{c:fmt(g.root)}));const equal=Math.abs(g.delta)<1e-8,kind=Math.abs(g.cross)<1e-8?'degenerateKind':equal?'right':g.delta>0?'obtuse':'acute';ro('s3-verdict',t('diff',{d:fmt(Math.abs(g.c-g.root)),rel:'c² '+(equal?'=':g.delta>0?'>':'<')+' a²+b²',kind:t(kind)}));ro('s3-boundary',Math.min(g.a,g.b)<0.05||Math.abs(g.cross)<1e-8?t('degenerate'):'');
}
function set3(x,y){const s=S.s3;s.x=clamp(x,40,260);s.y=clamp(y,40,240);s.history.push([s.x,s.y]);$('s3-x').value=s.x;$('s3-y').value=s.y;render3();}
function reset3(){S.s3={x:160,y:200,free:false,history:[],anchor:null};$('s3-unlock').checked=false;$('s3-x').value=160;$('s3-y').value=200;render3();}
function truth(sides){const [a,b,c]=sides;const d=c*c-a*a-b*b;return {kind:d===0?'right':d>0?'obtuse':'acute',d};}
function render4(){const s=S.s4,[a,b,c]=s.sides,q=truth(s.sides);ro('s4-sides',t('quizSides',{a,b,c}));ro('s4-guess',s.guess?t('quizGuess',{g:t(s.guess)}):t('choose'));
 document.querySelectorAll('[data-answer]').forEach(el=>{el.disabled=s.revealed;el.setAttribute('aria-pressed',String(s.guess===el.dataset.answer));});$('s4-reveal').disabled=s.revealed||!s.guess;$('s4-next').disabled=!s.revealed;
 ro('s4-result',s.revealed?t('quizResult',{kind:t(q.kind),cc:c*c,sum:a*a+b*b,diff:q.d,result:t(q.kind===s.guess?'correct':'incorrect')}):'');ro('s4-score',t('score',{n:s.n,k:s.k}));
}
const questionPool=[[3,4,5],[5,12,13],[8,15,17],[4,5,6],[5,6,7],[3,4,6],[2,3,4],[7,8,9],[4,4,7]];
function nextQuestion(){const s=S.s4;const pool=questionPool.filter(e=>e.join()!==s.sides.join());s.sides=pool[Math.floor(Math.random()*pool.length)].slice();s.guess=null;s.revealed=false;render4();}
function render5(){const s=S.s5,h=Math.sqrt(Math.max(0,25-s.d*s.d)),ctx=scene('s5-canvas');const base=[65,285],top=[65,285-h*43],foot=[65+s.d*43,285];line(ctx,[65,40],base,cyan);line(ctx,base,[300,285],cyan);line(ctx,top,foot,orange);mark(ctx,75,285);text(ctx,t('wall'),34,150);text(ctx,t('ground'),250,316);text(ctx,t('ladder'),190,65,orange);text(ctx,`h ≈ ${fmt(h)} m`,144,142);text(ctx,`d = ${fmt(s.d)} m`,180,265);ctx.restore();ro('s5-ladder',t('ladderRO',{d:fmt(s.d),dd:fmt(s.d*s.d),h:fmt(h)}));ro('s5-warning',s.d>=4.8?t('ladderWarn'):'');
 const c=scene('s5b-canvas'),pt=(x,y)=>[35+x*31,290-y*31];for(let i=0;i<=8;i++){line(c,pt(i,0),pt(i,8),'#2b3547');line(c,pt(0,i),pt(8,i),'#2b3547');text(c,String(i),35+i*31,305);if(i)text(c,String(i),20,290-i*31);}text(c,'x',300,291);text(c,'y',35,24);const P=pt(1,1),Q=pt(s.x,s.y);s.history.forEach(p=>line(c,P,pt(...p),'#354454'));poly(c,[P,pt(s.x,1),Q],'#173040');line(c,P,Q,orange);dot(c,P,cyan);dot(c,Q);text(c,'P',P[0]-10,P[1]-15,cyan);text(c,'Q',Q[0]+10,Q[1]-15,orange);c.restore();ro('s5-distance',t('distanceRO',{x:fmt(s.x),y:fmt(s.y),dx:fmt(s.x-1),dy:fmt(s.y-1),c:fmt(Math.sqrt((s.x-1)**2+(s.y-1)**2))}));
}
function set5(x,y){const s=S.s5;s.x=Math.round(clamp(x,0,8)*10)/10;s.y=Math.round(clamp(y,0,8)*10)/10;s.history.push([s.x,s.y]);$('s5-x').value=s.x;$('s5-y').value=s.y;render5();}
function reset5(){S.s5={d:3,x:5,y:4,history:[]};$('s5-d').value=3;$('s5-x').value=5;$('s5-y').value=4;render5();}
function render6(){const s=S.s6,rows=s.ks.map(k=>[3*k,4*k,5*k]).concat([[5,12,13],[8,15,17]]);$('s6-table').replaceChildren(...rows.map(([a,b,c])=>{const tr=document.createElement('tr');for(const str of [`${a}–${b}–${c}`,`${a*a} + ${b*b} = ${c*c} ✓`]){const td=document.createElement('td');td.textContent=str;tr.append(td);}return tr;}));ro('s6-history',t('history',{n:rows.length}));const ctx=scene('s6-canvas');if(s.unit){triangle(ctx,1,1,Math.sqrt(2));text(ctx,'c = √2 ≈ 1.414…',160,315,orange,18);}else{const k=Number($('s6-k').value);triangle(ctx,3*k,4*k,5*k);}ctx.restore();ro('s6-irr',t(s.unit?'irrational':'irrIdle'));$('s6-unit').disabled=s.unit;}
function badges(){for(const [el,arr,id]of [['categoryBadge',window.KNOWLEDGE_CATEGORIES,'math'],['stageBadge',window.KNOWLEDGE_STAGES,'junior']]){const item=arr.find(x=>x.id===id);$(el).textContent=item.name[getLang()];}}
function renderAll(){badges();render0();render1();render2();render3();render4();render5();render6();}
function drag(id,fn){const cv=$(id);cv.classList.add('dragc');let pointer=null;function move(e){if(e.pointerId!==pointer)return;const r=cv.getBoundingClientRect(),v=cv._view;fn((e.clientX-r.left-v.ox)/v.scale,(e.clientY-r.top-v.oy)/v.scale);}cv.addEventListener('pointerdown',e=>{pointer=e.pointerId;cv.setPointerCapture(pointer);move(e);});cv.addEventListener('pointermove',move);for(const type of ['pointerup','pointercancel','lostpointercapture'])cv.addEventListener(type,()=>pointer=null);}
function bind(){
 $('s0-all').onclick=()=>{if(!S.s0.opened.length){S.s0.guess='guessAll';render0();}};$('s0-only').onclick=()=>{if(!S.s0.opened.length){S.s0.guess='guessOnly';render0();}};
 examples.forEach((_,i)=>$('s0-case'+i).onclick=()=>{if(S.s0.guess&&!S.s0.opened.includes(i)){S.s0.opened.push(i);render0();}});
 $('s1-pour').onclick=pour;$('s1-reset').onclick=reset1;
 for(const k of ['a','b'])$('s2-'+k).oninput=e=>{S.s2[k]=Number(e.target.value);render2();};$('s2-piece').onclick=()=>{S.s2.k=Math.min(4,S.s2.k+1);render2();};$('s2-reset').onclick=()=>{S.s2={a:3,b:4,k:0};$('s2-a').value=3;$('s2-b').value=4;render2();};
 $('s3-unlock').onchange=e=>{const s=S.s3;if(e.target.checked){const g=geom3();s.anchor={A:g.A.slice(),B:g.B.slice()};}s.free=e.target.checked;render3();};$('s3-x').oninput=e=>set3(Number(e.target.value),S.s3.y);$('s3-y').oninput=e=>set3(S.s3.x,Number(e.target.value));$('s3-reset').onclick=reset3;drag('s3-canvas',set3);
 document.querySelectorAll('[data-answer]').forEach(el=>el.onclick=()=>{if(!S.s4.revealed){S.s4.guess=el.dataset.answer;render4();}});$('s4-reveal').onclick=()=>{const s=S.s4;if(!s.guess||s.revealed)return;s.revealed=true;s.n++;if(s.guess===truth(s.sides).kind)s.k++;render4();};$('s4-next').onclick=()=>{if(S.s4.revealed)nextQuestion();};$('s4-reset').onclick=()=>{S.s4={sides:[3,4,5],guess:null,revealed:false,n:0,k:0};render4();};
 $('s5-d').oninput=e=>{S.s5.d=Number(e.target.value);render5();};$('s5-x').oninput=e=>set5(Number(e.target.value),S.s5.y);$('s5-y').oninput=e=>set5(S.s5.x,Number(e.target.value));drag('s5b-canvas',(x,y)=>set5((x-35)/31,(290-y)/31));$('s5-reset').onclick=reset5;
 $('s6-k').oninput=e=>{const k=Number(e.target.value);if(!S.s6.ks.includes(k))S.s6.ks.push(k);render6();};$('s6-unit').onclick=()=>{S.s6.unit=true;render6();};$('s6-reset').onclick=()=>{S.s6={ks:[1],unit:false};$('s6-k').value=1;render6();};
 const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.nav-step').forEach(a=>{const active=a.dataset.nav===e.target.dataset.step;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}),{rootMargin:'-25% 0px -50% 0px'});document.querySelectorAll('.step').forEach(el=>observer.observe(el));
 let queued=false;window.addEventListener('resize',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;renderAll();});}});
}
onLangRefresh(renderAll);bind();applyLang(getLang());
// Read-only inspection surface for numerical review; UI remains the mutation path.
window.PYTHAGORAS={get state(){return JSON.parse(JSON.stringify(S));},geom3,truth,fitCanvas};

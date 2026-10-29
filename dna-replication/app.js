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

/* DNA replication / transcription / translation. Standard genetic code; strand direction ignored. */
const MODEL={
  CODE:'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG',
  GENES:{1:'AUGGCUUACGGAUGUUAA',2:'AUGAAAUUUGGCCAUUGA',3:'AUGCUGGAACCCAGCUAG'},
  AA3:{F:'Phe',L:'Leu',S:'Ser',Y:'Tyr',C:'Cys',W:'Trp',P:'Pro',H:'His',Q:'Gln',R:'Arg',I:'Ile',M:'Met',T:'Thr',N:'Asn',K:'Lys',V:'Val',A:'Ala',D:'Asp',E:'Glu',G:'Gly'},
  comp(b){return{A:'T',T:'A',G:'C',C:'G'}[b]},
  hb(b){return b==='A'||b==='T'?2:3},
  hbonds(seq){let s=0;for(const b of seq)s+=MODEL.hb(b);return s},
  gc(seq){let g=0;for(const b of seq)if(b==='G'||b==='C')g++;return g/seq.length},
  tm(seq){let a=0,g=0;for(const b of seq){if(b==='G'||b==='C')g++;else a++}return 2*a+4*g},
  tplFromMrna(m){const map={A:'T',U:'A',G:'C',C:'G'};return[...m].map(b=>map[b]).join('')},
  transcribe(tpl,p){const map={T:'A',A:'U',G:'C',C:'G'};return[...tpl.slice(0,p)].map(b=>map[b]).join('')},
  codonAA(c){const o={U:0,C:1,A:2,G:3};return MODEL.CODE[16*o[c[0]]+4*o[c[1]]+o[c[2]]]},
  translate(m,maxCodons){const aa=[];let stopped=false;for(let i=0;i+3<=m.length&&aa.length<(maxCodons===undefined?99:maxCodons);i+=3){const a=MODEL.codonAA(m.slice(i,i+3));if(a==='*'){stopped=true;break}aa.push(a)}return{aa:aa,stopped:stopped}},
  classify(o,m){if(o===m)return'none';const d=m.length-o.length;if(d%3!==0)return'frame';const p0=MODEL.translate(o),p1=MODEL.translate(m);if(p0.aa.join('')===p1.aa.join('')&&p0.stopped===p1.stopped)return'sil';if(d!==0)return'in';if(p1.stopped&&p1.aa.length<p0.aa.length)return'non';return'mis'},
  gens(r){let g=[[{h:true},{h:true}]];const out=[g];for(let i=0;i<r;i++){const nx=[];for(const mol of g){nx.push([mol[0],{h:false}]);nx.push([mol[1],{h:false}])}out.push(nx);g=nx}return out},
  counts(r){const g=MODEL.gens(r),last=g[g.length-1];let hh=0,hl=0,ll=0;for(const m of last){const h=(m[0].h?1:0)+(m[1].h?1:0);if(h===2)hh++;else if(h===1)hl++;else ll++}return{tot:last.length,hh:hh,hl:hl,ll:ll}},
  rng(seed){let s=seed>>>0;return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}},
  strand(seed,n){const r=MODEL.rng(seed*977+13);let s='';for(let i=0;i<n;i++)s+='ATGC'[Math.floor(r()*4)];return s},
  mutate(seq,op,pos,b){if(op==='sub')return seq.slice(0,pos-1)+b+seq.slice(pos);if(op==='del')return seq.slice(0,pos-1)+seq.slice(pos);return seq.slice(0,pos-1)+'A'+seq.slice(pos-1)}
};
const TC={A:'#e5675f',T:'#4f8fe8',G:'#5fd08a',C:'#f0b24f',U:'#b49cff'};
const S={seed0:1,k0:0,err0:0,msg0:'',r1:1,p2:6,gene:1,c3:2,p4:9,mut:null,ops:0};
S.mut=MODEL.GENES[1];
function tile(x,ch,px,py,sz,col){x.fillStyle=col||TC[ch]||C.muted;x.fillRect(px,py,sz-2,sz-2);txt(x,ch,px+(sz-2)/2,py+(sz-2)/2+5,'#08131a',Math.max(10,sz*0.5),'center')}
function tpl0(){return MODEL.strand(S.seed0,12)}
DRAW[0]=function(x,w,h){const tp=tpl0(),n=tp.length,sz=Math.min(34,(w-24)/n),x0=(w-n*sz)/2,y1=50,y2=h-80;for(let i=0;i<n;i++){tile(x,tp[i],x0+i*sz,y1,sz);if(i<S.k0){const c=MODEL.comp(tp[i]),nb=MODEL.hb(tp[i]);tile(x,c,x0+i*sz,y2,sz);for(let k=0;k<nb;k++){const lx=x0+i*sz+(sz-2)*(k+1)/(nb+1);line(x,lx,y1+sz,lx,y2,'rgba(255,255,255,.55)',1.5)}}else if(i===S.k0){x.strokeStyle=C.text;x.setLineDash([3,3]);x.strokeRect(x0+i*sz,y2,sz-2,sz-2);x.setLineDash([])}}
  txt(x,t('lblTpl'),x0,y1-10,C.muted,12);txt(x,t('lblNew'),x0,y2+sz+16,C.muted,12)};
function r0(){const tp=tpl0(),n=tp.length;let st;if(S.k0<n)st=(S.msg0?S.msg0+' ':'')+t('st0',{b:tp[S.k0]});else{const comp=[...tp].map(MODEL.comp).join('');st=t('stOk',{hb:MODEL.hbonds(tp),gc:fx(MODEL.gc(tp)*100,0),tm:MODEL.tm(tp)})}ro('s0-ro',t('r0',{k:S.k0,n:n,err:S.err0,status:st}))}
function pick0(b){const tp=tpl0();if(S.k0>=tp.length)return;if(MODEL.comp(tp[S.k0])===b){S.k0++;S.msg0=''}else{S.err0++;S.msg0=t('wrong',{t:tp[S.k0],c:MODEL.comp(tp[S.k0])})}redraw(0);r0()}
function mol(x,px,py,m,hgt){x.fillStyle=m[0].h?'#9b7bff':C.acc;x.fillRect(px,py,5,hgt);x.fillStyle=m[1].h?'#9b7bff':C.acc;x.fillRect(px+7,py,5,hgt)}
DRAW[1]=function(x,w,h){const narrow=w<520,L=narrow?w:w*0.65,g=MODEL.gens(S.r1),rows=g.length,rh=(h-20)/5;g.forEach((gen,gi)=>{const y=10+gi*rh,n=gen.length,step=Math.min(34,(L-20)/n);const x0=(L-n*step)/2;gen.forEach((m,i)=>mol(x,x0+i*step+step/2-6,y,m,rh-12));txt(x,gi===0?t('lblGen0'):t('lblGenN',{n:gi}),6,y+10,C.muted,11)});
  const tb={x:narrow?w*0.7:L+20,y:10,w:narrow?w*0.26:w*0.25,h:h-20},c=MODEL.counts(S.r1),fr=[c.hh/c.tot,c.hl/c.tot,c.ll/c.tot],ys=[0.8,0.5,0.2];x.strokeStyle=C.muted;x.lineWidth=2;x.strokeRect(tb.x,tb.y,tb.w,tb.h);
  fr.forEach((f,i)=>{if(f>0){x.fillStyle=['rgba(155,123,255,','rgba(180,170,200,','rgba(110,231,255,'][i]+(0.25+0.7*f)+')';const bh=8+22*f;x.fillRect(tb.x+3,tb.y+tb.h*ys[i]-bh/2,tb.w-6,bh)}});txt(x,t('tubeLight'),tb.x+tb.w/2,tb.y+tb.h*0.12,C.acc,11,'center');txt(x,t('tubeHeavy'),tb.x+tb.w/2,tb.y+tb.h*0.94,'#9b7bff',11,'center')};
function r1(){const c=MODEL.counts(S.r1);ro('s1-ro',t('r1',{r:S.r1,tot:c.tot,hh:c.hh,hl:c.hl,ll:c.ll,fhl:fx(c.hl/c.tot*100,1),fll:fx(c.ll/c.tot*100,1)}))}
function mrna(){return MODEL.GENES[S.gene]}
DRAW[2]=function(x,w,h){const m=mrna(),tp=MODEL.tplFromMrna(m),n=tp.length,sz=Math.min(30,(w-24)/n),x0=(w-n*sz)/2,y1=48,y2=h-70,r=MODEL.transcribe(tp,S.p2);for(let i=0;i<n;i++){tile(x,tp[i],x0+i*sz,y1,sz);if(i<r.length){tile(x,r[i],x0+i*sz,y2,sz);line(x,x0+i*sz+(sz-2)/2,y1+sz,x0+i*sz+(sz-2)/2,y2,'rgba(255,255,255,.4)',1.5)}}
  const px=x0+S.p2*sz;x.fillStyle='rgba(255,180,84,.8)';x.beginPath();x.moveTo(px,y1+sz+6);x.lineTo(px+14,(y1+y2)/2);x.lineTo(px,y2-6);x.closePath();x.fill();txt(x,t('lblTpl'),x0,y1-10,C.muted,12);txt(x,'mRNA',x0,y2+sz+16,C.muted,12)};
function r2(){const m=mrna(),tp=MODEL.tplFromMrna(m);ro('s2-ro',t('r2',{p:S.p2,n:m.length,tpl:tp,mr:MODEL.transcribe(tp,S.p2)||'—',cod:m.replace(/U/g,'T')}))}
function chain(x,aa,stopped,px,py,sz,maxw){const per=Math.max(1,Math.floor(maxw/(sz+4)));aa.forEach((a,i)=>{const cx=px+(i%per)*(sz+4)+sz/2,cy=py+Math.floor(i/per)*(sz+6)+sz/2;dot(x,cx,cy,sz/2,'#3b6ea5');txt(x,MODEL.AA3[a],cx,cy+4,'#fff',Math.max(9,sz*0.34),'center')});if(stopped){const i=aa.length,cx=px+(i%per)*(sz+4)+sz/2,cy=py+Math.floor(i/per)*(sz+6)+sz/2;x.fillStyle=C.acc3;x.fillRect(cx-sz/2,cy-sz/2,sz,sz);txt(x,t('stopW'),cx,cy+4,'#fff',Math.max(9,sz*0.3),'center')}}
DRAW[3]=function(x,w,h){const m=mrna(),n=m.length/3,sz=Math.min(26,(w-24)/m.length),x0=(w-m.length*sz)/2,y=34;for(let c=0;c<n;c++){for(let j=0;j<3;j++){tile(x,m[c*3+j],x0+(c*3+j)*sz,y,sz)}txt(x,String(c+1),x0+(c*3+1.5)*sz,y-6,C.muted,10,'center')}
  if(S.c3>0){const c=S.c3-1;x.strokeStyle=C.acc2;x.lineWidth=3;x.strokeRect(x0+c*3*sz-2,y-3,3*sz+2,sz+4)}
  const p=MODEL.translate(m,S.c3),stoppedNow=p.stopped||(S.c3>0&&MODEL.codonAA(m.slice(S.c3*3-3,S.c3*3))==='*');chain(x,p.aa,false,x0,y+sz+36,Math.min(44,(w-24)/7-4),w-2*x0);const cur=S.c3>0?MODEL.codonAA(m.slice(S.c3*3-3,S.c3*3)):null;if(cur==='*'){const i=p.aa.length,per=Math.max(1,Math.floor((w-2*x0)/(Math.min(44,(w-24)/7-4)+4)));const sz2=Math.min(44,(w-24)/7-4);x.fillStyle=C.acc3;x.fillRect(x0+(i%per)*(sz2+4),y+sz+36+Math.floor(i/per)*(sz2+6),sz2,sz2);txt(x,t('stopW'),x0+(i%per)*(sz2+4)+sz2/2,y+sz+36+Math.floor(i/per)*(sz2+6)+sz2/2+4,'#fff',11,'center')}};
function r3(){const m=mrna(),k=S.c3;let cod='—',aa=t('nextNone');if(k>0){cod=m.slice(k*3-3,k*3);const a=MODEL.codonAA(cod);aa=a==='*'?t('stopW'):MODEL.AA3[a]}const pep=MODEL.translate(m,k).aa.map(a=>MODEL.AA3[a]).join('–')||'—';ro('s3-ro',t('r3',{g:S.gene,k:k,m:m.length/3,cod:cod,aa:aa,pep:pep}))}
DRAW[4]=function(x,w,h){const o=mrna(),m=S.mut,n=Math.max(o.length,m.length),sz=Math.min(26,(w-24)/n),x0=(w-n*sz)/2,y1=30,y2=y1+sz+14;for(let i=0;i<o.length;i++)tile(x,o[i],x0+i*sz,y1,sz);for(let i=0;i<m.length;i++){const diff=o[i]!==m[i];tile(x,m[i],x0+i*sz,y2,sz);if(diff){x.strokeStyle=C.text;x.lineWidth=2;x.strokeRect(x0+i*sz-1,y2-1,sz,sz)}}
  txt(x,t('lblOrig'),x0,y1-8,C.muted,12);txt(x,t('lblMut'),x0,y2+sz+14,C.muted,12);const csz=Math.min(34,(w-24)/7-4),p0=MODEL.translate(o),p1=MODEL.translate(m);chain(x,p0.aa,p0.stopped,x0,y2+sz+34,csz,w-2*x0);chain(x,p1.aa,p1.stopped,x0,y2+sz+34+csz+14,csz,w-2*x0);
  const px=x0+Math.min(S.p4,m.length+1)*sz-sz;x.fillStyle=C.acc2;x.beginPath();x.moveTo(px+sz/2,y2-4);x.lineTo(px+sz/2-6,y2-12);x.lineTo(px+sz/2+6,y2-12);x.closePath();x.fill()};
function r4(){const o=mrna(),m=S.mut,p0=MODEL.translate(o),p1=MODEL.translate(m),k=MODEL.classify(o,m),fm=aa=>(aa.aa.map(a=>MODEL.AA3[a]).join('–')||'—')+(aa.stopped?'|'+t('stopW'):'');ro('s4-ro',t('r4',{p0:fm(p0),p1:fm(p1),kind:t({none:'kNone',sil:'kSil',mis:'kMis',non:'kNon',frame:'kFrame','in':'kIn'}[k]),note:S.ops?t('mutNote',{n:S.ops,mr:m}):''}))}
function setGene(g){S.gene=g;S.mut=MODEL.GENES[g];S.ops=0;S.c3=Math.min(S.c3,6);[2,3,4].forEach(st=>[1,2,3].forEach(i=>$('s'+st+'-g'+i).classList.toggle('active',i===g)));redrawAll();r2();r3();r4()}
function mut(op,b){const p=Math.min(S.p4,op==='ins'?S.mut.length+1:S.mut.length);if(op==='del'&&S.mut.length<=3)return;S.mut=MODEL.mutate(S.mut,op,p,b);S.ops++;redraw(4);r4()}
function init(){
  [['a','A'],['t','T'],['g','G'],['c','C']].forEach(([id,b])=>btn('s0-'+id,()=>pick0(b)));btn('s0-new',()=>{S.seed0++;S.k0=0;S.err0=0;S.msg0='';redraw(0);r0()});btn('s0-reset',()=>{S.k0=0;S.err0=0;S.msg0='';redraw(0);r0()});
  slider('s1-r',v=>fx(v,0),v=>{S.r1=v;redraw(1);r1()});
  slider('s2-p',v=>fx(v,0),v=>{S.p2=v;redraw(2);r2()});slider('s3-c',v=>fx(v,0),v=>{S.c3=v;redraw(3);r3()});slider('s4-p',v=>fx(v,0),v=>{S.p4=v;redraw(4);r4()});
  [2,3,4].forEach(st=>[1,2,3].forEach(i=>btn('s'+st+'-g'+i,()=>setGene(i))));
  [['a','A'],['u','U'],['g','G'],['c','C']].forEach(([id,b])=>btn('s4-'+id,()=>mut('sub',b)));btn('s4-del',()=>mut('del'));btn('s4-ins',()=>mut('ins'));btn('s4-reset',()=>{S.mut=mrna();S.ops=0;redraw(4);r4()});setGene(1)}
function render(){redrawAll();r0();r1();r2();r3();r4()}

QUIZ.ans=1;QUIZ.step=1;
if(typeof document!=='undefined'&&document.getElementById('langToggle'))bootCommon({init:init,render:render});

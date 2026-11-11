'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=OnesCore;
const SB={w:5,h:4,s:2,k:2};
let sb=Array.from({length:SB.h},()=>Array(SB.w).fill(0));
let ex=[0,0],exFilled=false;
let preset='0',P={...C.presets[0]},frames=C.trace(P.w,P.h,P.s,P.k),at=0,restarted=false,clamped=false,tw=[0,0];
let selection=null,revealed=false,copyState='';
const LETTERS='ABCDEFGHIJKLMNOP';
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined&&text!==null)e.textContent=text;if(cls)e.className=cls;return e;}
function frameClasses(r,c,win,s){if(!win)return '';const [wr,wc]=win,cls=[];if(r<wr||r>=wr+s||c<wc||c>=wc+s)return '';cls.push('in-win');if(r===wr)cls.push('win-t');if(r===wr+s-1)cls.push('win-b');if(c===wc)cls.push('win-l');if(c===wc+s-1)cls.push('win-r');return ' '+cls.join(' ');}
function setCols(node,w){node.style.setProperty('--w',w);}
// Step 1: sandbox.
function renderSandbox(){
 const over=C.overfull(sb,SB.s,SB.k),bad=new Set(over.cells),worst=C.worstWindow(sb,SB.s),ones=sb.flat().reduce((a,b)=>a+b,0);
 const node=$('sandbox');setCols(node,SB.w);
 const focusId=document.activeElement&&document.activeElement.dataset.cell;
 node.replaceChildren(...sb.flatMap((row,r)=>row.map((v,c)=>{const b=el('button',v?'1':'0','cell'+(v?' one':'')+(bad.has(r+','+c)?' over':''));b.type='button';b.dataset.cell=r+','+c;b.dataset.step='1';b.setAttribute('aria-pressed',String(!!v));b.setAttribute('aria-label',t('cellAria',{r,c,v}));b.onclick=()=>{sb[r][c]^=1;renderSandbox();};return b;})));
 if(focusId)node.querySelector(`[data-cell="${focusId}"]`).focus();
 $('sbRead').textContent=t('sbRead',{ones,max:worst.max,k:SB.k,over:over.windows})+' '+(over.windows?t('sbInvalid',{k:SB.k}):t('sbValid'));
 $('sbRead').classList.toggle('bad',over.windows>0);
 $('sbClear').disabled=ones===0;
}
function miniGrid(id,g){const node=$(id);setCols(node,g[0].length);node.replaceChildren(...g.flat().map(v=>el('div',v?'1':'0','cell'+(v?' one':''))));}
// Step 3: class explorer for the 5×4, s=2 example.
function renderExplorer(){
 const {w,h,s}=SB,node=$('explorer');setCols(node,w);const seen=[];let ones=0;
 const cells=[];for(let r=0;r<h;r++)for(let c=0;c<w;c++){const id=C.letter(r%s,c%s,s),filled=exFilled&&id===0,inside=r>=ex[0]&&r<ex[0]+s&&c>=ex[1]&&c<ex[1]+s;if(inside){seen.push(LETTERS[id]);ones+=filled?1:0;}
  cells.push(el('div',LETTERS[id]+(filled?'·1':''),'cell k'+id+(filled?' one':'')+frameClasses(r,c,ex,s)));}
 node.replaceChildren(...cells);
 $('exRead').textContent=t('explorerRead',{r:ex[0],c:ex[1],labels:seen.sort().join(' '),ones});
 $('exLeft').disabled=ex[1]===0;$('exRight').disabled=ex[1]===w-s;$('exUp').disabled=ex[0]===0;$('exDown').disabled=ex[0]===h-s;
 $('exFill').textContent=t(exFilled?'unfillA':'fillA');$('exFill').setAttribute('aria-pressed',String(exFilled));
}
// Step 5: weights tables (width 5, s = 2).
function renderWeights(){
 const p=C.startWeights(5,2),frac=['1/3','1/6','1/6','1/3'];
 $('wHead').replaceChildren(row([t('colStart'),t('colProb')],'th'));
 $('wBody').replaceChildren(...p.map((x,i)=>row([i,frac[i]])));
 $('cHead').replaceChildren(row([t('colColumn'),t('colClassSize'),t('colCover')],'th'));
 const cover=['1/3','1/2','1/3','1/2','1/3'];
 $('cBody').replaceChildren(...[0,1,2,3,4].map(x=>row([x,C.count(5,2,x%2),cover[x]])));
}
function row(values,tag='td'){const r=el('tr');values.forEach(v=>{const c=el(tag,String(v));if(tag==='th')c.scope='col';r.append(c);});return r;}
// Step 6: parameters and trace.
const LIMITS={w:[1,C.LIMIT],h:[1,C.LIMIT]};
function clampP(){clamped=false;const s0=P.s,k0=P.k;P.s=Math.min(P.s,P.w,P.h);P.s=Math.max(1,P.s);P.k=Math.min(P.k,P.s*P.s);if(P.s!==s0||P.k!==k0)clamped=true;}
function renderParams(){
 const node=$('params'),focusId=document.activeElement&&document.activeElement.id;
 node.replaceChildren(...[['w','paramW'],['h','paramH'],['s','paramS'],['k','paramK']].map(([key,label])=>{
  const box=el('div',null,'param'),name=t(label),lo=key==='k'?0:1,hi=key==='w'||key==='h'?C.LIMIT:key==='s'?Math.min(P.w,P.h):P.s*P.s;
  const dec=el('button','−','btn step');dec.type='button';dec.id='dec-'+key;dec.dataset.step='6';dec.setAttribute('aria-label',t('dec',{name}));dec.disabled=P[key]<=lo;
  const inc=el('button','+','btn step');inc.type='button';inc.id='inc-'+key;inc.dataset.step='6';inc.setAttribute('aria-label',t('inc',{name}));inc.disabled=P[key]>=hi;
  const out=el('output',String(P[key]));out.id='val-'+key;out.setAttribute('aria-live','polite');
  dec.onclick=()=>change(key,-1);inc.onclick=()=>change(key,1);
  box.append(el('span',name,'param-name'),dec,out,inc);return box;}));
 if(focusId&&$(focusId)&&!$(focusId).disabled)$(focusId).focus();else if(focusId&&focusId.startsWith('inc-')||focusId&&focusId.startsWith('dec-')){const other=$((focusId.startsWith('inc-')?'dec-':'inc-')+focusId.slice(4));if(other)other.focus();}
}
function change(key,d){P[key]+=d;clampP();preset='custom';restart();}
function restart(){frames=C.trace(P.w,P.h,P.s,P.k);at=0;tw=[0,0];restarted=true;$('preset').value=preset;renderParams();renderTrace();}
function renderTrace(){
 const f=frames[at],e=f.event,n=frames.length-1,{w,h,s,k}=P;
 const phase=at===0?'phaseStart':e.type==='count'?'phaseCount':e.type==='sort'?'phaseSort':e.type==='pick'?'phasePick':'phaseDone';
 $('frameRead').textContent=t('frame',{i:at,n,phase:t(phase),total:f.total});
 $('restart').textContent=restarted?t('restartNote')+(clamped?' '+t('clampNote'):''):'';
 const evKey={start:'evStart',count:'evCount',sort:'evSort',pick:'evPick',done:k===0?'evDoneZero':'evDone'}[e.type];
 $('eventRead').textContent=t(evKey,e);
 const chosen=new Set(f.chosen),hot=e.type==='count'||e.type==='pick'?C.letter(e.a,e.b,s):-1;
 const g=C.gridFrom(w,h,s,f.chosen),node=$('traceGrid');setCols(node,w);
 const cells=[];for(let r=0;r<h;r++)for(let c=0;c<w;c++){const id=C.letter(r%s,c%s,s);
  cells.push(el('div',`${r%s},${c%s}`,'cell'+(chosen.has(id)?' one':'')+(id===hot?' hot':'')+frameClasses(r,c,tw,s)));}
 node.replaceChildren(...cells);
 $('twRead').textContent=t('windowRead',{r:tw[0],c:tw[1],ones:C.windowCount(g,s,tw[0],tw[1]),k});
 $('twLeft').disabled=tw[1]===0;$('twRight').disabled=tw[1]===w-s;$('twUp').disabled=tw[0]===0;$('twDown').disabled=tw[0]===h-s;
 $('clsHead').replaceChildren(row([t('colClass'),t('colRows'),t('colCols'),t('colSize'),t('colRank'),t('colState')],'th'));
 const rank=f.sorted?new Map(f.sorted.map((c,i)=>[c.id,i+1])):null;
 const list=(f.sorted||f.counted);
 $('clsBody').replaceChildren(...list.map(c=>{const r=row([`(${c.a},${c.b})`,c.rows,c.cols,c.size,rank?rank.get(c.id):t('stWaiting'),chosen.has(c.id)?(c.id===hot&&e.type==='pick'?t('stCurrent')+' '+t('stChosen'):t('stChosen')):c.id===hot?t('stCurrent'):t('stWaiting')]);
  if(c.id===hot)r.className='current-row';else if(chosen.has(c.id))r.className='chosen-row';return r;}));
 $('prev').disabled=$('traceReset').disabled=at===0;$('next').disabled=$('end').disabled=at===n;
}
function renderPrediction(){
 $('reveal').disabled=selection===null;$('predictReset').disabled=selection===null;
 $('feedback').textContent=revealed?(selection===1?t('correct'):t('wrong'+selection))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&selection===1);
}
function render(){renderSandbox();miniGrid('greedyGrid',C.greedy(5,4,2,2));miniGrid('bestGrid',C.gridFrom(5,4,2,[0,2]));renderExplorer();renderWeights();renderParams();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('sbClear').onclick=()=>{sb=sb.map(r=>r.map(()=>0));renderSandbox();$('sbGreedy').focus();};
$('sbGreedy').onclick=()=>{sb=C.greedy(SB.w,SB.h,SB.s,SB.k);renderSandbox();};
const move=(pos,dr,dc,w,h,s)=>[Math.min(h-s,Math.max(0,pos[0]+dr)),Math.min(w-s,Math.max(0,pos[1]+dc))];
for(const [id,dr,dc] of [['Left',0,-1],['Right',0,1],['Up',-1,0],['Down',1,0]]){
 $('ex'+id).onclick=()=>{ex=move(ex,dr,dc,SB.w,SB.h,SB.s);renderExplorer();if($('ex'+id).disabled)$('exFill').focus();};
 $('tw'+id).onclick=()=>{tw=move(tw,dr,dc,P.w,P.h,P.s);renderTrace();if($('tw'+id).disabled)$('next').focus();};
}
$('exFill').onclick=()=>{exFilled=!exFilled;renderExplorer();};
$('preset').onchange=e=>{preset=e.target.value;P={...C.presets[Number(preset)]};clamped=false;restart();};
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};
$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};
$('end').onclick=()=>{at=frames.length-1;renderTrace();};
$('traceReset').onclick=()=>{at=0;renderTrace();};
for(const r of document.querySelectorAll('[name="prediction"]'))r.onchange=()=>{selection=Number(r.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{if(selection!==null){revealed=true;renderPrediction();}};
$('predictReset').onclick=()=>{selection=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderPrediction();};
$('sourceCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copySource').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);updateNav();

'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),C=GasCore;
const HAND={stations:[0,4,10],k:3};
let hand=[0,0],tried=[],dIndex=11,input={stations:C.presets[0].stations,k:C.presets[0].k},frames=C.trace(input.stations,input.k),at=0,inputMsg=null,choice=null,revealed=false,copyState='';
// Short human-readable number: up to 7 decimals, trailing zeros removed.
function num(x){if(!Number.isFinite(x))return String(x);const s=x.toFixed(7).replace(/0+$/,'').replace(/\.$/,'');return s==='-0'?'0':s;}
function small(x){return x<1e-3&&x>0?x.toExponential(2):num(x);}
function frac(n,d){return d===1?String(n):`${n}/${d}`;}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
// Draw a road: original stations as tall bars, evenly spaced new stations as short ticks, worst piece(s) marked.
function road(target,stations,counts,placed=[]){
 const gs=C.gaps(stations),start=stations[0],span=stations.at(-1)-start,pieces=gs.map((g,i)=>g/(counts[i]+1)),worst=Math.max(...pieces);
 const parts=[];
 gs.forEach((g,i)=>{
  const len=pieces[i];
  for(let p=0;p<=counts[i];p++){
   const left=(stations[i]-start+p*len)/span*100,seg=el('div','piece'+(Math.abs(len-worst)<1e-12?' worst':''));
   seg.style.left=left+'%';seg.style.width=len/span*100+'%';if(Math.abs(len-worst)<1e-12&&p===0)seg.append(el('span','worst-mark','▲'));parts.push(seg);
   if(p>0){const tick=el('div','tick new');tick.style.left=left+'%';parts.push(tick);}
  }
 });
 stations.forEach((s,i)=>{const tick=el('div','tick '+(placed.includes(i)?'new labelled':'orig'));tick.style.left=(s-start)/span*100+'%';const label=el('span','tick-label',String(s));tick.append(label);parts.push(tick);});
 target.replaceChildren(...parts);
}
function renderHand(){
 const [a,b]=hand,used=a+b,gs=C.gaps(HAND.stations),pa=gs[0]/(a+1),pb=gs[1]/(b+1),worst=Math.max(pa,pb);
 road($('handRoad'),HAND.stations,hand);
 $('handRead').textContent=t('handRead',{used,k:HAND.k,pa:`${a+1} × ${num(+pa.toFixed(2))}`,pb:`${b+1} × ${num(+pb.toFixed(2))}`,worst:num(+worst.toFixed(2))});
 $('addA').disabled=$('addB').disabled=used>=HAND.k;$('subA').disabled=a===0;$('subB').disabled=b===0;$('handReset').disabled=used===0&&tried.length===0;
 $('handLedgerEmpty').hidden=tried.length>0;
 $('handLedger').replaceChildren(...tried.map(([x,y,w])=>el('li','ledger-item'+(x===a&&y===b?' current':''),t('handLedgerItem',{a:x,b:y,worst:num(+w.toFixed(2))}))));
 $('handDone').hidden=tried.length<4;
}
function changeHand(i,delta){
 const next=hand.slice();next[i]+=delta;if(next[i]<0||next[0]+next[1]>HAND.k)return;hand=next;
 if(hand[0]+hand[1]===HAND.k&&!tried.some(([x,y])=>x===hand[0]&&y===hand[1])){const gs=C.gaps(HAND.stations);tried.push([hand[0],hand[1],Math.max(gs[0]/(hand[0]+1),gs[1]/(hand[1]+1))]);tried.sort((p,q)=>q[0]-p[0]);}
 renderHand();
}
function renderStatic(){road($('halvingRoad'),[0,1.5,3,6],[0,0,0],[1,2]);road($('evenRoad'),[0,6],[2]);}
const STAIRS=C.staircase(HAND.stations,HAND.k),CAP=8;
function renderStairs(){
 const row=STAIRS[dIndex],d=row.d;
 $('dValue').textContent=num(d);
 $('needRead').textContent=t('needRead',{d:num(d),a:row.each[0],b:row.each[1],total:row.total,cmp:row.ok?'≤':'>',verdict:t(row.ok?'verdictYes':'verdictNo')});
 const plot=el('div','stair-plot'),labels=el('div','stair-labels');
 STAIRS.forEach((r,i)=>{
  const col=el('div','stair'+(i===dIndex?' selected':'')+(r.ok?' ok':' no')),bar=el('div','stair-bar');
  const h=Math.min(r.total,CAP)/CAP*100,val=el('span','stair-val',(r.total>CAP?'↑':'')+r.total);
  bar.style.height=h+'%';val.style.bottom=h+'%';col.append(bar,val);plot.append(col);
  const lab=el('div','stair-label'+(i===dIndex?' selected':''));lab.append(el('span','stair-mark',r.ok?'✓':'✗'),el('span','stair-d',num(r.d)));labels.append(lab);
 });
 const line=el('div','stair-k');line.style.bottom=HAND.k/CAP*100+'%';line.append(el('span','stair-k-label','k = '+HAND.k));plot.append(line);
 $('stairs').replaceChildren(plot,labels);
}
function renderTrace(){
 const f=frames[at],max=Math.max(...f.gaps),star=f.star;
 $('preset').value=input.preset===undefined?'custom':String(input.preset);
 $('inputRead').textContent=t('inputRead',{stations:'['+input.stations.join(', ')+']',k:input.k,gaps:'['+f.gaps.join(', ')+']'});
 $('inputStatus').textContent=inputMsg?t(inputMsg.key,inputMsg.params||{}):'';$('inputStatus').classList.toggle('error',!!(inputMsg&&inputMsg.key.startsWith('err')));
 const rounds=frames.length-2,done=f.type==='stop'?rounds:f.round;
 $('progress').textContent=t('progress',{done,total:rounds});
 const width=f.hi-f.lo;
 if(f.type==='start')$('frameRead').textContent=t('frameStart',{hi:num(f.hi),width:num(width)});
 else if(f.type==='round')$('frameRead').textContent=t('frameRound',{round:f.round,blo:num(f.before.lo),bhi:num(f.before.hi),mid:num(f.mid),total:f.total,cmp:f.ok?'≤':'>',k:f.k,verdict:t(f.ok?'works':'fails'),lo:num(f.lo),hi:num(f.hi),width:small(width)});
 else $('frameRead').textContent=t('frameStop',{rounds,width:small(width),hi:num(f.hi),star:frac(star.num,star.den),err:Math.abs(f.hi-star.value).toExponential(2)});
 $('bracketFill').style.left=f.lo/max*100+'%';$('bracketFill').style.width=Math.max((f.hi-f.lo)/max*100,0.6)+'%';
 $('bracketMid').hidden=f.type!=='round';if(f.type==='round')$('bracketMid').style.left=f.mid/max*100+'%';
 $('bracketStar').style.left=star.value/max*100+'%';$('bracketMax').textContent=num(max);
 $('starRead').textContent=star.den===1?t('starReadWhole',{frac:frac(star.num,star.den)}):t('starRead',{frac:frac(star.num,star.den),value:num(star.value)});
 const isRound=f.type==='round';$('noNeed').hidden=isRound;$('needWrap').hidden=!isRound;
 $('needRows').replaceChildren(...!isRound?[]:f.gaps.map((g,i)=>{const tr=el('tr');tr.append(el('td','',`${input.stations[i]}–${input.stations[i+1]}`),el('td','',String(g)),el('td','',`⌈${g}/${num(f.mid)}⌉ − 1 = ${f.each[i]}`));return tr;}));
 $('historyEmpty').hidden=f.history.length>0;$('historyWrap').hidden=f.history.length===0;
 $('historyRows').replaceChildren(...f.history.map((h,i)=>{const tr=el('tr',isRound&&i===f.history.length-1?'current-row':'');tr.append(el('td','',(isRound&&i===f.history.length-1?'★ ':'')+h.round),el('td','',num(h.lo)),el('td','',num(h.hi)),el('td','',num(h.mid)),el('td','',`${h.total} ${h.ok?'≤':'>'} ${f.k}`),el('td','',t(h.ok?'okShort':'failShort')));return tr;}));
 $('prev').disabled=$('traceReset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
}
function loadInput(next,message){input=next;frames=C.trace(input.stations,input.k);at=0;inputMsg=message;renderTrace();}
function renderPrediction(){
 $('reveal').disabled=choice===null;$('predictionReset').disabled=choice===null;
 $('feedback').textContent=revealed?(choice===2?t('correct'):t('wrong'+choice))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&choice===2);
}
function render(){renderHand();renderStatic();renderStairs();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('addA').onclick=()=>changeHand(0,1);$('subA').onclick=()=>changeHand(0,-1);$('addB').onclick=()=>changeHand(1,1);$('subB').onclick=()=>changeHand(1,-1);
$('handReset').onclick=()=>{hand=[0,0];tried=[];renderHand();};
$('dRange').oninput=()=>{dIndex=Math.round(Number($('dRange').value)/0.5)-1;renderStairs();};
$('preset').onchange=()=>{const i=Number($('preset').value),p=C.presets[i];$('stationsInput').value=p.stations.join(' ');$('kInput').value=p.k;loadInput({stations:p.stations,k:p.k,preset:i},null);};
$('load').onclick=()=>{const r=C.parse($('stationsInput').value,$('kInput').value);if(!r.ok){inputMsg={key:r.error};renderTrace();return;}const i=C.presets.findIndex(p=>p.k===r.k&&p.stations.join()===r.stations.join());loadInput({stations:r.stations,k:r.k,preset:i<0?undefined:i},{key:'loaded',params:{stations:'['+r.stations.join(', ')+']',k:r.k}});};
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};
$('traceReset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{choice=Number(r.value);revealed=false;renderPrediction();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;renderPrediction();}};
$('predictionReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
input.preset=0;
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navQueued=false;window.addEventListener('scroll',()=>{if(navQueued)return;navQueued=true;requestAnimationFrame(()=>{navQueued=false;updateNav();});},{passive:true});window.addEventListener('resize',updateNav);updateNav();

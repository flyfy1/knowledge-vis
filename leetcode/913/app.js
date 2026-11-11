'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=window.CatMouse;
let preset=0,index=0,frames=C.trace(C.presets[0]),hand=[[1,2,1]],choice=null,revealed=false,copyState='';
function winnerText(v){return t(v===1?'mouseWin':v===2?'catWin':'draw');}
function graph(el,g,s){
 const n=g.length,pts=g.map((_,i)=>[150+95*Math.cos(-Math.PI/2+i*2*Math.PI/n),120+88*Math.sin(-Math.PI/2+i*2*Math.PI/n)]);
 let html='';g.forEach((ns,i)=>ns.forEach(j=>{if(i<j)html+=`<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[j][0]}" y2="${pts[j][1]}"/>`;}));
 pts.forEach(([x,y],i)=>{const mark=s?(s[0]===i?'M':'')+(s[1]===i?'C':''):'';html+=`<circle class="${i===0?'hole ':''}${mark?'occupied':''}" cx="${x}" cy="${y}" r="24"/><text x="${x}" y="${mark?y-6:y}">${i}</text>${mark?`<text class="occupant" x="${x}" y="${y+12}">${mark}</text>`:''}`;});el.innerHTML=html;
}
function renderHand(){
 const s=hand[hand.length-1],[m,c,p]=s,result=m===0?1:m===c?2:0;
 graph($('handGraph'),C.presets[0],s);
 $('handHistory').innerHTML=hand.map(v=>`<span class="ledger-item">(${v.join(',')})</span>`).join('');
 $('handRead').textContent=result?t('handWin',{winner:winnerText(result),state:'('+s+')'}):t('turn',{player:t(p===1?'mouse':'cat'),state:'('+s+')'});
 // Preserve stable move buttons across locale switches and updates.
 for(let node=0;node<4;node++){
  let b=$('move'+node);if(!b){b=document.createElement('button');b.id='move'+node;b.className='btn';b.onclick=()=>{const now=hand[hand.length-1],next=now[2]===1?[node,now[1],2]:[now[0],node,1];hand.push(next);renderHand();};$('moves').append(b);}
  const legal=!result&&(p===1?C.presets[0][m]:C.presets[0][c].filter(v=>v!==0)).includes(node);
  b.hidden=!legal;b.textContent=t('move',{player:t(p===1?'mouse':'cat'),node});
 }
 $('undo').disabled=hand.length===1;
}
function renderTrace(){
 const g=C.presets[preset],f=frames[index],view=+$('view').value,reachable=C.reachable(g);
 $('inputRead').textContent='graph = '+JSON.stringify(g);graph($('traceGraph'),g,null);
 $('progress').textContent=t('progress',{done:f.processed,pending:f.pending,frame:index,total:frames.length-1});
 $('current').textContent=f.done?t('finished',{answer:winnerText(f.w['1,2,1'])}):f.current?t('current',{state:'('+f.current+')',winner:winnerText(f.w[C.key(f.current)])}):t('initial');
 let html=`<caption>${t('caption',{turn:view})}</caption><thead><tr><th scope="col">m / c</th>`;
 for(let c=1;c<g.length;c++)html+=`<th scope="col">${c}</th>`;html+='</tr></thead><tbody>';
 for(let m=0;m<g.length;m++){html+=`<tr><th scope="row">${m}</th>`;for(let c=1;c<g.length;c++){
  const k=C.key([m,c,view]),w=f.w[k],available=reachable.has(k),current=available&&f.current&&C.key(f.current)===k;
  html+=`<td data-state="${k}" class="${available&&w?'finalized ':''}${current?'current':''}">${current?'→ ':''}${available?(w|| (f.done?'0':'?')):'×'}<small>r ${!available||w?'—':f.r[k]}</small></td>`;
 }html+='</tr>';}html+='</tbody>';$('states').innerHTML=html;
 $('updates').innerHTML=f.updates.length?f.updates.map(u=>`<li>${t('update',{state:'('+u.state+')',before:u.before,after:u.after,reason:u.reason==='wait'?t('wait'):t(u.reason,{winner:winnerText(u.winner)})})}</li>`).join(''):`<li>${t('none')}</li>`;
 $('ledger').innerHTML=frames.slice(1,index+1).filter(x=>x.current).map(x=>`<li>${t('log',{state:'('+x.current+')',count:x.updates.length})}</li>`).join('');
 $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
}
function renderQuiz(){ $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice==='1'?'correct':'incorrect')+' '+t('explanation'); }
function render(){renderHand();renderTrace();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';}
$('prev').onclick=()=>{if(index)index--;renderTrace();};$('next').onclick=()=>{if(index<frames.length-1)index++;renderTrace();};$('reset').onclick=()=>{index=0;renderTrace();};$('end').onclick=()=>{index=frames.length-1;renderTrace();};
$('preset').onchange=()=>{preset=+$('preset').value;index=0;frames=C.trace(C.presets[preset]);renderTrace();};$('view').onchange=renderTrace;
$('undo').onclick=()=>{if(hand.length>1)hand.pop();renderHand();};$('handReset').onclick=()=>{hand=[[1,2,1]];renderHand();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=el.value;revealed=false;renderQuiz();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;renderQuiz();}};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
$('ledger').tabIndex=0;
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));});},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('.step').forEach(el=>observer.observe(el));
locale.onChange(render);locale.init();

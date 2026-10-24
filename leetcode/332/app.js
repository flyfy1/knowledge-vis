'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
let frames=Itinerary.trace(Itinerary.presets[0]),index=0,revealed=false,copyState='';
function eventText(f){return t(f.kind,{a:f.a,b:f.b,id:f.id+1});}
function sequence(name,values){const box=document.createElement('div'),h=document.createElement('h3');h.textContent=t(name);box.append(h);const list=document.createElement('ol');list.className='sequence';for(const v of values){const li=document.createElement('li');li.textContent=v;list.append(li);}if(!values.length){const p=document.createElement('p');p.textContent=t('empty');box.append(p);}box.append(list);return box;}
function render(){const tickets=Itinerary.presets[Number($('preset').value)],f=frames[index],board=$('board');board.replaceChildren();tickets.forEach(([a,b],id)=>{const row=document.createElement('div');row.className='ticket'+(f.used.includes(id)?' done':'');row.textContent=`#${id+1} ${a} → ${b} · ${t(f.used.includes(id)?'used':'remaining')}`;board.append(row);});board.append(sequence('stack',f.stack),sequence('finished',f.finished));if(index===frames.length-1)board.append(sequence('result',[...f.finished].reverse()));else{const p=document.createElement('p');p.textContent=t('pending');board.append(p);}
$('progress').textContent=t('progress',{i:index,n:frames.length-1,u:f.used.length,e:tickets.length,s:f.stack.length,f:f.finished.length,v:f.used.length+1})+' · '+eventText(f);
const h=document.createElement('h3');h.textContent=t('history');const ol=document.createElement('ol');frames.slice(1,index+1).forEach(f=>{const li=document.createElement('li');li.textContent=eventText(f);ol.append(li);});$('ledger').replaceChildren(h,ol);
$('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
const answer=document.querySelector('input[name=prediction]:checked');$('reveal').disabled=!answer;$('feedback').textContent=revealed?t(answer.value==='BBB'?'correct':'incorrect')+' '+t('answer'):t('unanswered');$('copyStatus').textContent=copyState?t(copyState):'';
}
$('prev').onclick=()=>{if(index)index--;render();};$('next').onclick=()=>{if(index<frames.length-1)index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('preset').onchange=()=>{index=0;frames=Itinerary.trace(Itinerary.presets[Number($('preset').value)]);render();};
$('handReveal').onclick=()=>{$('handAnswer').hidden=!$('handAnswer').hidden;};
document.querySelectorAll('input[name=prediction]').forEach(el=>el.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));});},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(e=>observer.observe(e));

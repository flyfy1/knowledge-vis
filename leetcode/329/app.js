'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,frames=LIP.trace(LIP.presets[0]),revealed=false,hand=false,copyState='';
const coord=([r,c])=>`(${r},${c})`;
function render(){
 const matrix=LIP.presets[preset],f=frames[index];$('board').style.setProperty('--cols',matrix[0].length);$('board').replaceChildren();
 matrix.forEach((row,r)=>row.forEach((v,c)=>{const ready=f.ready.some(([a,b])=>a===r&&b===c),len=f.lengths[r][c],state=len?`✓ L=${len} · ${t('done')}`:`out=${f.out[r][c]} · ${t(ready?'ready':'pending')}`;
 const cell=document.createElement('div');cell.className='cell'+(len?' fixed':ready?' ready':'');cell.setAttribute('aria-label',t('cell',{r,c,v,state}));
 const position=document.createElement('small');position.textContent=coord([r,c]);const value=document.createElement('b');value.textContent=v;const label=document.createElement('div');label.className='state';label.textContent=state;cell.append(position,value,label);$('board').append(cell);}));
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('progress').textContent=t('progress',{k:index,total:frames.length-1,count:f.lengths.flat().filter(Boolean).length,n:matrix.flat().length,ready:f.ready.map(coord).join(' ')||t('none')})+(index===frames.length-1?' '+t('final',{n:index}):'');
 $('ledger').replaceChildren();if(!f.history.length){$('ledger').textContent=t('emptyLog');}else for(const h of f.history){const entry=document.createElement('div');entry.className='round-entry';const p=document.createElement('p');p.textContent=t('roundLog',{n:h.round,cells:h.cells.map(coord).join(' ')});const ul=document.createElement('ul');for(const change of h.changes){const li=document.createElement('li');li.textContent=t('decrement',{from:coord(change.from),to:coord(change.to),a:change.before,b:change.after});ul.append(li);}if(!h.changes.length){const li=document.createElement('li');li.textContent=t('noChange');ul.append(li);}entry.append(p,ul);$('ledger').append(entry);}
 $('handReveal').textContent=t(hand?'handHide':'handReveal');$('handReveal').setAttribute('aria-expanded',String(hand));$('handAnswer').hidden=!hand;
 const selected=document.querySelector('input[name="prediction"]:checked');$('reveal').disabled=!selected;$('feedback').textContent=revealed?t(selected.value==='5'?'correct':'incorrect')+'\n'+t('answer'):t('waiting');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{preset=Number(e.target.value);index=0;frames=LIP.trace(LIP.presets[preset]);render();});
$('next').onclick=()=>{index=Math.min(index+1,frames.length-1);render();};$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
$('handReveal').onclick=()=>{hand=!hand;render();};document.querySelectorAll('input[name="prediction"]').forEach(el=>el.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}}},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(s=>observer.observe(s));

'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
let run=Histogram84.trace(Histogram84.presets[0]),index=0,selected=null,revealed=false,copyState='';
function rectText(r){return r?t('rect',{l:r.left+1,r:r.i-1,h:r.height,w:r.width,area:r.area}):t('noRect');}
function chart(el,a,r){
 el.style.setProperty('--n',a.length);el.replaceChildren();
 const scale=180/Math.max(1,...a);
 a.forEach((h,i)=>{const col=document.createElement('div');col.className='column';col.setAttribute('aria-hidden','true');const height=document.createElement('span'),bar=document.createElement('div'),idx=document.createElement('span');height.className='height';height.textContent=h;bar.className='bar';bar.style.height=h*scale+'px';idx.className='index';idx.textContent=i;col.append(height,bar,idx);el.append(col);});
 if(r){const outline=document.createElement('div');outline.className='rectangle';outline.setAttribute('aria-hidden','true');outline.style.left=100*(r.left+1)/a.length+'%';outline.style.width=100*r.width/a.length+'%';outline.style.height=r.height*scale+'px';el.append(outline);}
 el.setAttribute('aria-label',t('chart',{a:a.join(', '),rect:rectText(r)}));
}
function renderHand(){
 const l=Number($('handLeft').value),r=Number($('handRight').value),v=Histogram84.interval([2,1,2],l,r);
 $('handResult').textContent=t('handResult',{l,r,h:v.height,w:v.width,area:v.area});chart($('handChart'),[2,1,2],{left:l-1,i:r+1,height:v.height,width:v.width,area:v.area});
}
function render(){
 const f=run.frames[index],r=f.type==='pop'?f.ledger.at(-1):null;
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===run.frames.length-1;
 $('position').max=run.frames.length-1;$('position').value=index;
 $('progress').textContent=t('progress',{i:index,n:run.frames.length-1,phase:t(f.type==='done'?'finished':'running')});
 chart($('chart'),run.a,r);$('rectangle').textContent=rectText(r);
 const stackText=s=>s.length?s.map(j=>`${j}(${run.a[j]})`).join(', '):t('empty');
 $('stacks').textContent=t('stacks',{before:stackText(f.before),after:stackText(f.stack)});
 $('best').textContent=t('best',{best:f.best});
 $('message').textContent=t(f.type,{i:f.i,h:r?r.height:run.a[f.i],j:f.j,current:f.current,left:f.left,w:r?.width,area:r?.area,n:run.a.length,best:f.best});
 $('noRows').hidden=f.ledger.length>0;$('ledgerWrap').hidden=f.ledger.length===0;$('ledgerWrap').setAttribute('aria-label',t('ledger'));
 $('rows').replaceChildren(...f.ledger.map(x=>{const tr=document.createElement('tr');[x.j,`${x.left}, ${x.i}`,`${x.height} × ${x.width}`,`${x.area} / ${x.best}`].forEach((v,i)=>{const cell=document.createElement(i===0?'th':'td');if(i===0)cell.scope='row';cell.textContent=v;tr.append(cell);});return tr;}));
 $('operation').textContent=f.type==='pop'?'j = stack.pop()\nleft = stack[-1] if stack else -1\nwidth = i - left - 1\nbest = max(best, heights[j] * width)':f.type==='push'?'stack.append(i)':f.type==='done'?'return best':'stack = []\nbest = 0';
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;$('feedback').className='readout '+(selected==='2'?'status-good':'status-bad');$('feedback').textContent=revealed?t(selected==='2'?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('steps'));renderHand();
}
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(run.frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
$('preset').onchange=e=>{run=Histogram84.trace(Histogram84.presets[Number(e.target.value)]);index=0;render();};
$('handLeft').onchange=()=>{if(Number($('handLeft').value)>Number($('handRight').value))$('handRight').value=$('handLeft').value;renderHand();};
$('handRight').onchange=()=>{if(Number($('handRight').value)<Number($('handLeft').value))$('handLeft').value=$('handRight').value;renderHand();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{selected=r.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function updateStep(){const current=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=120).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);locale.onChange(updateStep);updateStep();

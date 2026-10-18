'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
let run=Rectangle85.trace(Rectangle85.presets[0]),index=0,selected=null,revealed=false,copyState='';
function node(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
function render(){
 const f=run.frames[index],h=f.heights.slice(0,run.cols);
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===run.frames.length-1;
 $('position').max=run.frames.length-1;$('position').value=index;
 const args={row:f.row,i:f.i,best:f.best,heights:h.join(', '),old:f.old?f.old.slice(0,run.cols).join(', '):'',h:f.heights[f.i]};
 if(f.rect)Object.assign(args,{j:f.rect.j,h:f.rect.height,left:f.rect.left,width:f.rect.width,area:f.rect.area,before:'['+f.before.join(', ')+']',after:'['+f.stack.join(', ')+']'});
 const message=t(f.kind,args);
 $('progress').textContent=t('progress',{i:index,n:run.frames.length-1,phase:t('phase_'+f.kind)});
 $('state').textContent=t('state',{row:f.row<0?t('none'):f.row,stack:f.stack.join(', '),best:f.best});
 $('message').textContent=message;
 const table=$('matrix');table.setAttribute('aria-label',t('gridLabel',{row:f.row<0?t('none'):f.row}));table.replaceChildren();
 const thead=node('thead'),hr=node('tr');hr.append(node('th','r / c'));
 for(let c=0;c<run.cols;c++){const th=node('th',c);th.scope='col';hr.append(th);}thead.append(hr);table.append(thead);
 const body=node('tbody');
 run.matrix.forEach((row,r)=>{const tr=node('tr',undefined,r===f.row?'bottom':'');const th=node('th',r);th.scope='row';tr.append(th);
 row.forEach((v,c)=>{const hit=f.rect&&r<=f.row&&r>f.row-f.rect.height&&c>f.rect.left&&c<f.i;
 const td=node('td',v+(hit?' ✓':''),(v==='1'?'one ':'')+(hit?'settled':''));td.setAttribute('aria-label',t('cell',{r,c,v,mark:r===f.row?t('bottom'):''}));tr.append(td);});body.append(tr);});table.append(body);
 const hist=$('histogram');hist.style.setProperty('--bars',run.cols+1);hist.replaceChildren();
 f.heights.forEach((height,c)=>{const bar=node('div',undefined,'bar'+(c===f.i?' active':'')+(c===run.cols?' sentinel':''));bar.setAttribute('role','img');bar.setAttribute('aria-label',c===run.cols?t('sentinelLabel'):t('barLabel',{c,h:height}));
 const units=node('div',undefined,'units');units.setAttribute('aria-hidden','true');for(let k=0;k<height;k++)units.append(node('div',undefined,'unit'));
 const value=node('b',height),label=node('span',c===run.cols?'s':c);bar.append(value,units,label);hist.append(bar);});
 $('heightList').textContent=t('heightList',{heights:h.join(', ')});
 $('noRows').hidden=f.ledger.length>0;$('ledgerWrap').hidden=f.ledger.length===0;$('ledgerWrap').setAttribute('aria-label',t('ledger'));
 $('rows').replaceChildren(...f.ledger.map((r,k)=>{const tr=node('tr',undefined,f.kind==='pop'&&k===f.ledger.length-1?'ledger-current':'');
 [r.row,r.j,`${r.left} / ${r.i}`,`${r.height} × ${r.width} = ${r.area}`].forEach((v,j)=>{const cell=node(j===0?'th':'td',v);if(j===0)cell.scope='row';tr.append(cell);});return tr;}));
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;$('feedback').className='readout '+(selected==='2'?'status-good':'status-bad');$('feedback').textContent=revealed?t(selected==='2'?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(run.frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
$('preset').onchange=e=>{run=Rectangle85.trace(Rectangle85.presets[Number(e.target.value)]);index=0;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{selected=el.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function updateStep(){const current=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=120).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.onChange(updateStep);locale.init();window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);updateStep();

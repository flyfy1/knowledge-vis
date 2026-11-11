'use strict';
window.LESSON_COPY={};Object.keys(window.LESSON_COPY_RAW.en).forEach(k=>{window.LESSON_COPY[k]=[window.LESSON_COPY_RAW.zh[k],window.LESSON_COPY_RAW.en[k]];});
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
const C=window.ValidWordsCore,ANSWER=2;
let input=C.presets[0],trace=C.trace(input),step=0,guess=null,revealed=false,copyState='';
const fmt=s=>'{'+[...s].join(',')+'}';
const subText=r=>fmt(C.letters(r.sub));
function cell(text){const td=document.createElement('td');td.textContent=text;return td;}
function render(){
 const n=trace.rows.length,upto=trace.rows.slice(0,step),last=upto[upto.length-1],done=step===n;
 document.querySelector('.step-nav').setAttribute('aria-label',t('nav'));$('langToggle').setAttribute('aria-label',t('language'));
 $('input').textContent=t('input',{words:'['+input.words.join(', ')+']',puzzle:input.puzzle});
 $('position').max=n;$('position').value=step;
 $('prev').disabled=step===0;$('next').disabled=done;$('reset').disabled=step===0;$('end').disabled=done;
 const askedAt=new Map();upto.forEach((r,i)=>{if(r.count)askedAt.set(r.key,i+1);});
 const f=input.puzzle[0];
 $('groupRows').replaceChildren(...trace.table.map(g=>{const tr=document.createElement('tr');let status;
  if(askedAt.has(g.mask)){status=t('statusAsked',{r:askedAt.get(g.mask),c:g.count});tr.className='hit';}
  else if(done){const why=!g.hasFirst&&g.outside?t('whyBoth',{f,o:g.outside.split('').join(', ')}):!g.hasFirst?t('whyFirst',{f}):t('whyOutside',{o:g.outside.split('').join(', ')});status=t('statusNever',{why});tr.className='never';}
  else status=t('statusWait');
  tr.append(cell(fmt(g.letters)),cell(g.words.join(', ')),cell(String(g.count)),cell(status));return tr;}));
 const total=last?last.running:0;
 $('progress').textContent=t('progress',{k:step,n,total});
 $('current').textContent=done?t('done',{total}):last?t('current',{k:step,sub:subText(last),set:fmt(last.letters),count:last.count,words:last.words.length?' ('+last.words.join(', ')+')':'',total:last.running}):t('statusWait');
 const hits=upto.map((r,i)=>({r,i})).filter(x=>x.r.count);
 $('history').replaceChildren(...(hits.length?hits.map(({r,i})=>{const li=document.createElement('li');li.textContent=t('hitRow',{k:i+1,set:fmt(r.letters),count:r.count,words:r.words.join(', '),total:r.running});if(i===step-1)li.className='current';return li;}):[Object.assign(document.createElement('li'),{textContent:t('noHits')})]));
 $('zeroNote').textContent=step?t('zeroNote',{k:step,z:upto.filter(r=>!r.count).length}):'';
 $('reveal').disabled=guess===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(guess===ANSWER?'correct':'incorrect')+' '+t('why'+guess)+' '+t('answer');
 $('pythonCode').textContent=window.PYTHON_SOURCE;$('sourceText').value=window.PYTHON_SOURCE;$('copyStatus').textContent=copyState?t(copyState):'';
 syncNav();
}
function syncNav(){let a='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)a=e.id;});document.querySelectorAll('.step-nav a').forEach(x=>x.classList.toggle('active',x.hash==='#'+a));}
$('preset').onchange=e=>{input=C.presets[+e.target.value];trace=C.trace(input);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};
$('next').onclick=()=>{step=Math.min(trace.rows.length,step+1);render();};
$('reset').onclick=()=>{step=0;render();};
$('end').onclick=()=>{step=trace.rows.length;render();};
$('position').oninput=e=>{step=+e.target.value;render();};
document.querySelectorAll('[name=guess]').forEach(x=>x.onchange=()=>{guess=+x.value;revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manual').hidden=true;}catch(_){copyState='copyFallback';$('manual').hidden=false;$('sourceText').focus();$('sourceText').select();}render();};
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);render();

'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let hand=0,frame=0,selected=null,revealed=false,copyState='';
const tiny=[1,2,1],intervals=[];for(let l=0;l<3;l++)for(let r=l;r<3;r++)intervals.push({l,r,values:tiny.slice(l,r+1),d:new Set(tiny.slice(l,r+1)).size});
let input=LessonCore.presets[0],frames=LessonCore.trace(input.nums,input.k);
function text(tag,value,cls){const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e;}
function renderHand(){
  $('handLedger').replaceChildren(...intervals.slice(0,hand).map((a,i)=>text('li',t('handRow',{...a,values:JSON.stringify(a.values),mark:t(a.d===2?'yes':'no')}),i===hand-1?'current':'')));
  $('handRead').textContent=t('handRead',{n:hand,sum:intervals.slice(0,hand).filter(a=>a.d===2).length});$('undo').disabled=hand===0;$('add').disabled=hand===6;
}
function renderTrace(){
 const f=frames[frame],{nums,k}=input;
 $('progress').textContent=t('progress',{n:frame,size:nums.length,nums:JSON.stringify(nums),k});
 $('event').textContent=f.r<0?t('initial'):t('event',{r:f.r,value:nums[f.r]});
 $('array').style.setProperty('--n',nums.length);$('array').replaceChildren(...nums.map((v,i)=>{const el=text('div','',`array-cell ${i===f.r?'current':''}`);el.append(text('div',t('index',{i}),'array-index'),text('div',String(v),'array-value'),text('div',i===f.r?t('current'):i>f.r?t('pending'):'','array-marker'));return el;}));
 $('windows').replaceChildren(...f.windows.map((w,i)=>{const limit=k-i,e=text('div','','window-box');
 e.append(text('h3',t('window',{t:limit,range:w.left>f.r?t('empty'):`[${w.left},${f.r}]`})),text('p',f.r<0?t('initialWindow'):t('boundary',{before:w.before,after:w.left,d:w.distinct})),text('p',t('freq',{freq:JSON.stringify(w.freq),t:limit,count:w.count})));
 const log=document.createElement('ul');if(!w.removed.length)log.append(text('li',t('noRemoval')));else w.removed.forEach(a=>log.append(text('li',t('removal',{i:a.index,x:a.value,n:a.remaining,deleted:a.remaining===0?t('deleted'):''}))));e.append(log);return e;}));
 $('starts').replaceChildren(...nums.slice(0,f.r+1).map((_,l)=>{const key=l<f.windows[0].left?'tooMany':l<f.windows[1].left?'exact':'tooFew';return text('span',t('start',{l,label:t(key)}),'start '+(key==='exact'?'exact':'excluded'));}));
 $('rows').replaceChildren(...frames.slice(1,frame+1).map(s=>{const row=document.createElement('tr');if(s.r===f.r)row.className='current';[s.r,s.windows[0].count,s.windows[1].count,s.delta,s.total].forEach(v=>row.append(text('td',String(v))));return row;}));
 $('result').textContent=t('result',{delta:f.delta,total:f.total});$('prev').disabled=frame===0;$('next').disabled=frame===frames.length-1;
}
function renderPrediction(){$('reveal').disabled=selected===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):'';}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('.step-nav').setAttribute('aria-label',t('navLabel'));$('tableWrap').setAttribute('aria-label',t('ledgerTitle'));}
$('add').onclick=()=>{hand++;renderHand();};$('undo').onclick=()=>{hand--;renderHand();};$('handReset').onclick=()=>{hand=0;renderHand();};
$('prev').onclick=()=>{frame--;renderTrace();};$('next').onclick=()=>{frame++;renderTrace();};$('reset').onclick=()=>{frame=0;renderTrace();};
$('preset').onchange=()=>{input=LessonCore.presets[Number($('preset').value)];frames=LessonCore.trace(input.nums,input.k);frame=0;renderTrace();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{selected=Number(e.value);revealed=false;renderPrediction();});$('reveal').onclick=()=>{revealed=true;renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});});},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(e=>observer.observe(e));

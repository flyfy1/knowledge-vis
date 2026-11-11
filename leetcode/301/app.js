'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
let run=Remove301.trace(Remove301.presets[0]),idx=0,sel=null,rev=false,walkS=Remove301.presets[0];
Remove301.presets.forEach((s,i)=>{for(const id of ['preset','walkPreset']){const o=document.createElement('option');o.value=i;o.textContent=s;$(id).append(o);}});
function action(f,prev){
  if(f.kind==='call'){
    if(f.via==='start')return t('aStart',{l:f.l,r:f.r});
    return (prev&&prev.i>=f.i?t('aBack'):'')+t(f.via==='delete'?'aDelete':'aKeep',{at:f.at,c:f.c});
  }
  if(f.kind==='pruneBudget')return t('aPruneBudget',{need:f.need,left:f.left});
  if(f.kind==='pruneKeep')return t('aPruneKeep',{at:f.at});
  if(f.kind==='emit')return t('aEmit',{x:f.x||'""'});
  return t('aDuplicate',{x:f.x||'""'});
}
function renderWalk(){
  const w=Remove301.walk(walkS);
  $('walk').replaceChildren(...w.steps.map(st=>{const e=document.createElement('span');e.className='token'+(st.forced?' forced':'');const c=document.createElement('b');c.textContent=st.c;const i=document.createElement('small');i.textContent='i='+st.i;const b=document.createElement('small');b.textContent=st.forced?t('walkForced'):'bal '+st.open;e.append(c,i,b);return e;}));
  $('walkSummary').textContent=t('walkSummary',{r:w.right,l:w.left,min:w.left+w.right});
}
function render(){const f=run.frames[idx],last=run.frames.length-1;$('prev').disabled=idx===0;$('next').disabled=idx===last;$('reset').disabled=idx===0;$('position').max=last;$('position').value=idx;$('progress').textContent=t('progress',{i:idx,n:last});$('state').textContent=t('state',{path:f.path||'∅',bal:f.bal,l:f.l,r:f.r});$('expression').replaceChildren(...[...run.s].map((c,i)=>{const e=document.createElement('span');e.className='token '+(i<f.i?'consumed':'')+(i===f.i?' current':'');e.textContent=c+' '+i;return e;}));const lo=Math.max(0,idx-11);$('rows').replaceChildren(...run.frames.slice(lo,idx+1).map((x,k)=>{const tr=document.createElement('tr');[action(x,run.frames[lo+k-1]),x.path||'∅',x.bal+' / '+x.l+' / '+x.r,x.results.map(r=>r||'""').join(' | ')||'—'].forEach((v,j)=>{const c=document.createElement(j?'td':'th');c.textContent=v;if(!j)c.scope='row';tr.append(c)});return tr;}));$('reveal').disabled=sel===null;$('feedback').hidden=!rev;$('feedback').textContent=rev?t(sel==='1'?'correct':'incorrect')+' '+t('explanation'):'';renderWalk();}
$('prev').onclick=()=>{idx--;render()};$('next').onclick=()=>{idx++;render()};$('reset').onclick=()=>{idx=0;render()};$('position').oninput=e=>{idx=+e.target.value;render()};$('preset').onchange=e=>{run=Remove301.trace(Remove301.presets[+e.target.value]);idx=0;render()};$('walkPreset').onchange=e=>{walkS=Remove301.presets[+e.target.value];render()};document.querySelectorAll('[name=prediction]').forEach(r=>r.onchange=()=>{sel=r.value;rev=false;render()});$('reveal').onclick=()=>{rev=true;render()};$('pythonCode').textContent=PYTHON_SOURCE;$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);$('copyStatus').textContent=t('copied')}catch(e){$('copyStatus').textContent=t('fallback')}};locale.onChange(render);locale.init();render();

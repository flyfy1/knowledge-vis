'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
 let model=AverageCore.trace(AverageCore.presets[0]),index=0,choice=null,revealed=false,copyState='';
 const list=values=>'['+values.join(',')+']';
 function detail(f){
  const e=f.event;
  if(e.type==='build')return t('build',{...e,side:t(e.side),p:e.pos+1});
  if(e.type==='probe')return t('probe',e);
  return t(e.type);
 }
 function renderSets(id,groups){
  $(id).replaceChildren();groups.forEach((values,c)=>{const row=document.createElement('div');row.className='sum-row';row.dataset.count=c;
   const label=document.createElement('b');label.textContent=t('row',{c});const sums=document.createElement('span');sums.textContent='{'+values.join(', ')+'}';row.append(label,sums);$(id).append(row);
  });
 }
 function traceRender(){
  const f=model.frames[index],e=f.event;
  $('presetName').textContent=(Number($('preset').value)+1)+' · '+t('preset'+$('preset').value);
  $('summary').textContent=t('summary',{...model,nums:list(model.nums),sizes:model.sizes.length?list(model.sizes):t('none'),left:list(model.nums.slice(0,model.mid)),right:list(model.nums.slice(model.mid))});
  $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=f.done;$('end').disabled=f.done;
  $('progress').textContent=t('progress',{index,last:model.frames.length-1,detail:detail(f)});
  renderSets('leftSets',f.left);renderSets('rightSets',f.right);
  $('checks').replaceChildren();
  if(e.type==='probe')e.checks.forEach(c=>{const item=document.createElement('div');item.className='check'+(c.hit?' hit':'');item.textContent=t('check',{...c,j:e.j,answer:t(c.hit?'yes':'no')});$('checks').append(item);});
  else $('checks').textContent=t('noChecks');
  $('result').hidden=!f.done;$('result').textContent=f.done?(f.result?t('match',{...e,...e.match}):detail(f)):'';
  $('history').setAttribute('aria-label',t('historyLabel'));$('history').replaceChildren();
  model.frames.slice(0,index+1).forEach((frame,k)=>{const li=document.createElement('li');li.textContent=k+' · '+detail(frame);if(k===index)li.className='current';$('history').append(li);});
  $('history').scrollTop=$('history').scrollHeight;
 }
 function predictionRender(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='2');}
 $('preset').addEventListener('change',()=>{model=AverageCore.trace(AverageCore.presets[Number($('preset').value)]);index=0;traceRender();});
 for(const [id,fn] of Object.entries({prev:()=>index--,next:()=>index++,reset:()=>index=0,end:()=>index=model.frames.length-1}))$(id).addEventListener('click',()=>{fn();traceRender();});
 $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
 document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;predictionRender();}));$('reveal').addEventListener('click',()=>{revealed=true;predictionRender();});
 $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
 $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
 function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);
 locale.onChange(()=>{traceRender();predictionRender();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();

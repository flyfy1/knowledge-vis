'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let pair='AB',preset=0,index=0,choice=null,revealed=false,copyState='';
let model=SubarrayLab.trace(SubarrayLab.presets[0]);
function event(f){const p=model.p,k=SubarrayLab.presets[preset].k;return t(f.kind==='back'?'backEvent':f.kind,{j:f.j,i:f.i,p:p[f.j],v:p[f.i],sum:p[f.j]-p[f.i],k,len:f.j-f.i,answer:f.best===null?-1:f.best});}
function render(){
 $('handRead').textContent=t('hand'+pair);['AB','AC','BC'].forEach(x=>$('pair'+x).setAttribute('aria-pressed',String(pair===x)));
 $('presetDescription').textContent=t('preset'+preset);
 const f=model.frames[index];$('frameRead').textContent=t('progress',{i:index,n:model.frames.length-1,event:event(f)});
 $('bestRead').textContent=t('bestRead',{best:f.best===null?t('none'):f.best,pair:f.pair?'['+f.pair.join(', ')+')':t('empty')});
 $('prefixes').replaceChildren();model.p.forEach((v,j)=>{const el=document.createElement('div');el.className='prefix'+(j===f.j?' current':'')+(f.q.includes(j)?' candidate':'');el.textContent=`${j}: ${v}`;const mark=document.createElement('span');mark.textContent=[j===f.j?t('currentMark'):'',f.q.includes(j)?t('candidateMark'):''].filter(Boolean).join(' · ');el.append(mark);$('prefixes').append(el);});
 $('members').textContent=f.q.length?f.q.map(i=>`${i}:${model.p[i]}`).join(' → '):t('empty');
 $('ledger').replaceChildren();model.frames.slice(1,index+1).forEach(a=>{const li=document.createElement('li');li.textContent=event(a);$('ledger').append(li);});
 $('tracePrev').disabled=index===0;$('traceReset').disabled=index===0;$('traceNext').disabled=index===model.frames.length-1;$('traceLast').disabled=index===model.frames.length-1;
 $('reveal').disabled=choice===null||revealed;$('predictionFeedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('answer'):t(choice===null?'pending':'chosen');$('predictionFeedback').classList.toggle('correct',revealed&&choice==='1');$('copyStatus').textContent=copyState?t(copyState):'';
}
['AB','AC','BC'].forEach(x=>$('pair'+x).onclick=()=>{pair=x;render();});
$('preset').onchange=()=>{preset=Number($('preset').value);model=SubarrayLab.trace(SubarrayLab.presets[preset]);index=0;render();};
$('tracePrev').onclick=()=>{index=Math.max(0,index-1);render();};$('traceNext').onclick=()=>{index=Math.min(model.frames.length-1,index+1);render();};$('traceReset').onclick=()=>{index=0;render();};$('traceLast').onclick=()=>{index=model.frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=el.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};$('predictionReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(e=>e.checked=false);render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='manualCopy';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('.step').forEach(e=>observer.observe(e));

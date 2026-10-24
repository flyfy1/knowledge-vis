'use strict';
(() => {
  const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t;
  const $=id=>document.getElementById(id);
  const presets=[[4,6,5,5,9,8,7],[1,3,7,2,6],[5,4,6,2],[0,10000,9999,1,0],[]];
  let selected=0,index=0,frames=RangeCore.trace(presets[0]),hand=false,answer=null,revealed=false,copyState='';
  const format=a=>a.length?JSON.stringify(a):t('empty');
  const rangeText=a=>a?`[${a.join(',')}]`:t('none');
  function ranges(id,a,p=-2,result=false){
    $(id).replaceChildren();
    if(!a.length){$(id).textContent=t('empty');return;}
    a.forEach((pair,i)=>{const el=document.createElement('span');el.className='range'+(result?' result':'')+(i===p||i===p-1?' neighbor':'');el.textContent=rangeText(pair);$(id).append(el);});
  }
  function render(){
    $('handAnswer').hidden=!hand;$('handReveal').textContent=t(hand?'handHide':'handReveal');$('handReveal').setAttribute('aria-expanded',String(hand));
    const values=presets[selected],f=index?frames[index-1]:null;
    $('stream').replaceChildren();
    values.forEach((v,i)=>{const s=document.createElement('span');s.textContent=v;s.className=i<index?'processed'+(i===index-1?' current':''):'';$('stream').append(s);});
    $('progress').textContent=t('progress',{n:index,total:values.length,next:index<values.length?values[index]:t('done')});
    $('candidate').textContent=f?t('candidate',{x:f.value,p:f.p,left:rangeText(f.before[f.p-1]),right:rangeText(f.before[f.p]),probes:f.probes.length?f.probes.join(' → '):t('none')}):t('initial');
    ranges('before',f?f.before:[],f?f.p:-2);ranges('after',f?f.after:[],-2,true);
    $('reason').textContent=f?t(f.kind):t('initial');
    $('cellsLegend').textContent=t(selected===3?'boundaryAxis':'cellsLegend');
    $('cells').replaceChildren();
    if(selected!==3)for(let v=0;v<=10;v++){
      const seen=f&&f.after.some(([a,b])=>a<=v&&v<=b),s=document.createElement('span');
      s.className='cell'+(seen?' seen':'');s.textContent=`${v} ${seen?'✓':'·'}`;$('cells').append(s);
    }
    $('history').replaceChildren();$('emptyHistory').hidden=index>0;
    frames.slice(0,index).forEach(f=>{const li=document.createElement('li');li.textContent=`+${f.value}: ${format(f.before)} → ${format(f.after)} — ${t(f.kind)}`;$('history').append(li);});
    $('tracePrev').disabled=index===0;$('traceReset').disabled=index===0;
    $('traceNext').disabled=index===values.length;$('traceLast').disabled=index===values.length;
    $('reveal').disabled=!answer;
    $('feedback').textContent=revealed?t(answer==='bridge'?'correct':'incorrect')+' '+t('explanation'):t('pending');
    $('copyStatus').textContent=copyState?t(copyState):'';
  }
  $('handReveal').onclick=()=>{hand=!hand;render();};
  $('preset').onchange=()=>{selected=Number($('preset').value);index=0;frames=RangeCore.trace(presets[selected]);render();};
  $('traceNext').onclick=()=>{index=Math.min(frames.length,index+1);render();};
  $('tracePrev').onclick=()=>{index=Math.max(0,index-1);render();};
  $('traceReset').onclick=()=>{index=0;render();};
  $('traceLast').onclick=()=>{index=frames.length;render();};
  document.querySelectorAll('[name="prediction"]').forEach(input=>input.onchange=()=>{answer=input.value;revealed=false;render();});
  $('reveal').onclick=()=>{revealed=true;render();};
  $('quizReset').onclick=()=>{answer=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(el=>el.checked=false);render();};
  $('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
  $('copyPython').onclick=async()=>{
    try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}
    catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}
    render();
  };
  locale.onChange(render);locale.init();
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
    if(visible.length)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+visible[0].target.id));
  },{rootMargin:'-15% 0px -35% 0px',threshold:[0,.1,.4]});
  document.querySelectorAll('.step').forEach(el=>observer.observe(el));
})();

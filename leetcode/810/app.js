'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),C=XorCore;
 let frames=[C.start(C.presets[0])],index=0,choice=null,revealed=false,copyState='';
 const player=n=>n%2?'Bob':'Alice';
 function eventText(f){return f.event?t('event',{...f.event,player:player(f.event.player),status:t(f.event.after===0?'danger':'safe')}):t('start',{nums:f.items.map(v=>v.value).join(','),x:C.xor(f.items.map(v=>v.value))});}
 function step(id){frames=frames.slice(0,index+1);frames.push(C.move(frames[index],id));index++;render();}
 function forward(){if(index<frames.length-1)index++;else{frames.push(C.automatic(frames[index]));index++;}}
 function render(){
  const f=frames[index],x=C.xor(f.items.map(v=>v.value)),done=C.terminal(f);
  $('summary').textContent=t('summary',{n:f.items.length,x,k:f.turn});
  $('progress').textContent=f.loser!==null?t('lost',{loser:player(f.loser),winner:player(1-f.loser)}):done?t('immediate',{player:player(f.turn)}):t('playing',{player:player(f.turn)});
  $('prev').disabled=index===0;$('reset').disabled=index===0&&frames.length===1;$('next').disabled=done;$('end').disabled=done;
  $('board').setAttribute('aria-label',t('boardLabel'));
  const existing=new Map([...$('board').children].map(e=>[Number(e.dataset.id),e]));
  f.items.forEach((v,position)=>{let b=existing.get(v.id);if(!b){b=document.createElement('button');b.type='button';b.className='btn tile';b.dataset.id=v.id;b.addEventListener('click',()=>step(v.id));}
   existing.delete(v.id);b.disabled=done;const after=x^v.value,status=t(done?'inactive':after===0?'danger':'safe');
   b.textContent=t('tile',{...v,after,status});b.setAttribute('aria-label',b.textContent);if($('board').children[position]!==b)$('board').insertBefore(b,$('board').children[position]||null);
  });existing.forEach(b=>b.remove());
  $('empty').hidden=f.items.length!==0;
  $('history').replaceChildren();frames.slice(0,index+1).forEach((f,k)=>{const li=document.createElement('li');li.textContent=k+' · '+eventText(f);if(k===index)li.className='current';$('history').append(li);});
 }
 function prediction(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('explanation'):t(choice===null?'pending':'chosen');$('feedback').classList.toggle('correct',revealed&&choice==='1');}
 $('preset').addEventListener('change',()=>{frames=[C.start(C.presets[Number($('preset').value)])];index=0;render();});
 $('prev').addEventListener('click',()=>{index--;render();});$('next').addEventListener('click',()=>{forward();render();});$('reset').addEventListener('click',()=>{frames=[C.start(C.presets[Number($('preset').value)])];index=0;render();});$('end').addEventListener('click',()=>{while(!C.terminal(frames[index]))forward();render();});
 $('handReveal').addEventListener('click',()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));});
 document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;prediction();}));$('reveal').addEventListener('click',()=>{revealed=true;prediction();});
 $('pythonSource').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
 $('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);});
 function navigation(){const edge=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;let id='step0';document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=edge)id=el.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',navigation,{passive:true});addEventListener('resize',navigation);locale.onChange(()=>{render();prediction();$('copyStatus').textContent=copyState?t(copyState):'';navigation();});locale.init();
})();

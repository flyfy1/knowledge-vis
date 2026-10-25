(function(){
 'use strict';
 const $=id=>document.getElementById(id),C=window.PairCore,locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t;
 let preset=0,index=0,frames=C.trace(C.presets[0].words),selected=null,revealed=false,copyState='';
 $('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
 function options(){ $('query').replaceChildren(...C.presets[preset].queries.map((q,i)=>new Option(q.join(' / '),String(i)))); }
 function hand(){
  const [p,s]=[['ap','e'],['app','e'],['z','e']][Number($('handQuery').value)],words=C.presets[0].words,ids=[];
  $('handRows').innerHTML=words.map((w,i)=>{const a=w.startsWith(p),b=w.endsWith(s);if(a&&b)ids.push(i);return `<tr><td>${i}</td><td>${w}</td><td>${t(a?'yes':'no')}</td><td>${t(b?'yes':'no')}</td><td class="${a&&b?'match':''}">${t(a&&b?'yes':'no')}</td></tr>`;}).join('');
  $('handResult').textContent=t('answer',{ids:ids.length?ids.join(', '):t('none'),answer:ids.length?ids[ids.length-1]:-1});
 }
 function renderTrace(){
  const words=C.presets[preset].words,[p,s]=C.presets[preset].queries[Number($('query').value)],key=C.key(p,s),f=frames[index],w=words[index-1];
  $('input').textContent=t('input',{words:JSON.stringify(words),query:`(${p}, ${s})`});
  $('progress').textContent=t('progress',{k:f.k,n:words.length,size:Object.keys(f.map).length,writes:f.writes});
  $('event').textContent=index?t('event',{i:index-1,word:w,length:w.length,count:w.length*w.length}):t('initial');
  $('probe').textContent=t('probe',{query:`(${p}, ${s})`,value:f.map[key]??-1,phase:t(index===words.length?'final':'provisional')});
  $('prev').disabled=index===0;$('next').disabled=index===words.length;$('end').disabled=index===words.length;
  $('grid').innerHTML=index?'<thead><tr><th scope="col">'+t('gridHead')+'</th>'+Array.from(w,(_,j)=>`<th scope="col">${w.slice(-j-1)}</th>`).join('')+'</tr></thead><tbody>'+Array.from(w,(_,j)=>{const a=w.slice(0,j+1);return `<tr><th scope="row">${a}</th>`+Array.from(w,(_,k)=>{const b=w.slice(-k-1);return `<td class="${a===p&&b===s?'observed':''}">(${a}, ${b})<span>${t('write',{i:index-1})}</span></td>`;}).join('')+'</tr>';}).join('')+'</tbody>':`<tbody><tr><td>${t('initial')}</td></tr></tbody>`;
  $('ledger').innerHTML=index?words.slice(0,index).map((word,i)=>`<li>${t('ledger',{i,word,old:frames[i].map[key]??-1,value:frames[i+1].map[key]??-1,reason:t(word.startsWith(p)&&word.endsWith(s)?'overwritten':'untouched')})}</li>`).join(''):`<li>${t('empty')}</li>`;
  $('map').replaceChildren(...Object.entries(f.map).map(([k,v])=>{const code=document.createElement('code');code.textContent=`${k} → ${v}`;return code;}));
 }
 function quiz(){ $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(selected==='2'?'correct':'incorrect')+' '+t('quizAnswer'):''; }
 function render(){document.querySelectorAll('[data-label]').forEach(e=>e.setAttribute('aria-label',t(e.dataset.label)));hand();renderTrace();quiz();$('copyStatus').textContent=copyState?t(copyState):'';}
 $('handQuery').onchange=hand;
 $('preset').onchange=()=>{preset=Number($('preset').value);frames=C.trace(C.presets[preset].words);index=0;options();renderTrace();};
 $('query').onchange=renderTrace;
 $('next').onclick=()=>{index=Math.min(index+1,frames.length-1);renderTrace();};
 $('prev').onclick=()=>{index=Math.max(index-1,0);renderTrace();};
 $('end').onclick=()=>{index=frames.length-1;renderTrace();};
 $('reset').onclick=()=>{index=0;$('query').value='0';renderTrace();};
 document.querySelectorAll('[name="prediction"]').forEach(e=>e.onchange=()=>{selected=e.value;revealed=false;quiz();});
 $('reveal').onclick=()=>{if(selected!==null){revealed=true;quiz();}};
 $('copy').onclick=async()=>{copyState='copying';$('copyStatus').textContent=t(copyState);try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
 options();locale.onChange(render);locale.init();
 function activeStep(){
  const bound=$('stepNav').getBoundingClientRect().bottom+96;
  let current='step0';document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=bound)current=s.id;});
  document.querySelectorAll('#stepNav a').forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  if(activeStep.previous!==current){const a=document.querySelector('#stepNav a.active'),parent=a.parentElement,r=a.getBoundingClientRect(),pr=parent.getBoundingClientRect();if(r.right>pr.right)parent.scrollLeft+=r.right-pr.right;if(r.left<pr.left)parent.scrollLeft-=pr.left-r.left;activeStep.previous=current;}
 }
 let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;activeStep();});}},{passive:true});addEventListener('resize',activeStep);activeStep();
})();

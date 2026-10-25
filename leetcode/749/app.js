'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),core=Lesson749;
 let preset=0,index=0,frames=core.trace(core.presets[0]),choice=null,revealed=false,copyState='';
 const letter=i=>String.fromCharCode(65+i),coord=(id,n)=>`(${Math.floor(id/n)},${id%n})`;
 function board(el,g,regions,chosen,walls){
  const n=g[0].length;el.style.setProperty('--n',n);
  const membership=new Map();regions.forEach((r,i)=>r.cells.forEach(u=>membership.set(u,i)));
  const targets=new Set(chosen<0?[]:regions[chosen].frontier);
  el.innerHTML=g.flatMap((row,r)=>row.map((v,c)=>{
   const id=r*n+c,i=membership.get(id),classes=['cell',v===1?'infected':v===-1?'quarantined':'',targets.has(id)?'threat':'',i===chosen?'chosen':''];
   for(const [a,b]of walls){if(a===id||b===id){const other=a===id?b:a,rr=Math.floor(other/n),cc=other%n;classes.push(rr<r?'wall-top':rr>r?'wall-bottom':cc<c?'wall-left':'wall-right');}}
   return `<div class="${classes.join(' ')}"><small>${coord(id,n)}</small><b>${v===-1?'Q':v}${i===undefined?'':` ${letter(i)}`}</b></div>`;
  })).join('');
 }
 function hand(){const grids=[[[1,1],[1,0]],[[1,0]],[[1,1,1],[1,0,1],[1,1,1]]],g=grids[Number($('shape').value)],rs=core.scan(g),q=g.map(row=>row.map(v=>v===1?-1:v));board($('handBoard'),q,rs,0,rs[0].edges);$('handResult').textContent=t('handResult',{walls:rs[0].edges.length});}
 function render(){
  hand();$('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('navigation'));document.querySelectorAll('[data-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.label)));
  const f=frames[index],n=f.grid[0].length,q=f.chosen<0?null:f.regions[f.chosen];
  $('progress').textContent=t('progress',{index,last:frames.length-1,day:f.day,phase:t(f.phase)});
  const oldWalls=f.phase==='inspect'||f.phase==='done'?f.walls:f.walls.slice(0,f.walls.length-q.edges.length);
  board($('beforeBoard'),f.before,f.regions,f.chosen,oldWalls);board($('board'),f.grid,f.regions,f.chosen,f.walls);
  $('event').textContent=t('event'+f.phase[0].toUpperCase()+f.phase.slice(1),q?{region:letter(f.chosen),targets:q.frontier.length,walls:q.edges.length}:{});
  $('regionBody').innerHTML=f.regions.length?f.regions.map((r,i)=>`<tr class="${i===f.chosen?'pick':''}"><th scope="row">${letter(i)} / ${r.cells.length} ${i===f.chosen?t('selected'):''}</th><td>${r.frontier.length}: ${r.frontier.map(u=>coord(u,n)).join(' ')||t('none')}</td><td>${r.edges.length}</td></tr>`).join(''):`<tr><td colspan="3">${t('none')}</td></tr>`;
  $('ledger').innerHTML=f.ledger.map(v=>`<li>${t('ledgerItem',{...v,region:letter(v.region)})}</li>`).join('');$('ledgerEmpty').hidden=f.ledger.length>0;$('total').textContent=t(f.phase==='done'?'answer':'total',{total:f.total});
  $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
  $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('quizWhy');$('copyStatus').textContent=copyState?t(copyState):'';
 }
 const go=i=>{index=i;render();};
 $('shape').onchange=hand;$('preset').onchange=()=>{preset=Number($('preset').value);frames=core.trace(core.presets[preset]);go(0);};
 $('prev').onclick=()=>go(Math.max(0,index-1));$('next').onclick=()=>go(Math.min(frames.length-1,index+1));$('reset').onclick=()=>go(0);$('end').onclick=()=>go(frames.length-1);
 document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
 $('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
 locale.onChange(render);locale.init();
 function nav(){const s=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=innerHeight*.3).at(-1)||$('step0');document.querySelectorAll('#stepNav a').forEach(a=>{const active=a.hash==='#'+s.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',nav,{passive:true});addEventListener('resize',nav);nav();
})();

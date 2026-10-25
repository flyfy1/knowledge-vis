'use strict';
(() => {
  const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),core=Lesson685;
  let preset=0,index=0,frames=core.trace(core.presets[0]),choice=null,revealed=false,copyState='';
  const edgeText=e=>`${e[0]}→${e[1]}`, row=i=>i<0?'—':i+1;
  const groupText=g=>g.map(a=>'{'+a.join(', ')+'}').join(' · ');
  function graph(container,edges,states){
    const n=edges.length,points=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+2*Math.PI*i/n;return [160+105*Math.cos(a),130+90*Math.sin(a)];});
    const marker=container+'Arrow';
    let paths='';
    edges.forEach(([u,v],i)=>{
      const [x1,y1]=points[u-1],[x2,y2]=points[v-1],dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy),nx=-dy/d,ny=dx/d;
      const bend=edges.some(([a,b])=>a===v&&b===u)?28:0;
      const sx=x1+dx/d*25,sy=y1+dy/d*25,ex=x2-dx/d*30,ey=y2-dy/d*30;
      paths+=`<path class="${states[i]}" d="M${sx},${sy} Q${(x1+x2)/2+nx*bend},${(y1+y2)/2+ny*bend} ${ex},${ey}" marker-end="url(#${marker})"/>`;
    });
    $(container).innerHTML=`<svg viewBox="0 0 320 260" role="img" aria-label="${t(container==='handGraph'?'handGraphLabel':'graphLabel')}"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z"/></marker></defs>${paths}${points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="20"/><text x="${x}" y="${y}">${i+1}</text>`).join('')}</svg>`;
  }
  function eventText(f){
    const e=f.event,edges=core.presets[preset];
    if(e.type==='start')return t('start');
    const p={...e,i:row(e.i),edge:edgeText(edges[e.i]),earlier:row(f.earlier),later:row(f.later)};
    if(e.type==='scan')p.reason=t(e.duplicate?'second':'first',p);
    if(e.type==='decision')p.reason=t(e.reason);
    return t(e.type,p);
  }
  function renderHand(){
    const edges=core.presets[0],removed=Number($('handRemove').value),r=core.inspect(edges,removed);
    [...$('handRemove').options].slice(1).forEach((o,i)=>o.textContent=t('remove',{edge:edgeText(edges[i])}));
    graph('handGraph',edges,edges.map((_,i)=>i===removed?'removed':'kept'));
    $('handCounts').textContent=t('counts',{counts:r.counts.map((c,i)=>`${i+1}: ${c}`).join(' · ')});
    $('handResult').textContent=t(r.roots.length===1?'handResult':'handNoRoot',{roots:r.roots.join(', ')||t('none'),reach:r.reach,n:edges.length,valid:t(r.valid?'valid':'invalid')});
  }
  function render(){
    renderHand();const f=frames[index],edges=core.presets[preset];
    $('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('navigation'));
    $('progress').textContent=t('progress',{k:index,total:frames.length-1,phase:t(f.event.phase)});
    $('event').textContent=eventText(f);
    $('candidates').textContent=t('candidates',{earlier:row(f.earlier),later:row(f.later)});
    $('incoming').textContent=t('incoming',{values:f.incoming.slice(1).map((v,i)=>`${i+1}: ${row(v)}`).join(' · ')});
    graph('traceGraph',edges,f.states);
    $('edgesBody').innerHTML=edges.map((e,i)=>`<tr><td>${i+1}</td><td>${edgeText(e)}</td><td>${t(f.states[i])}</td></tr>`).join('');
    $('groupsBefore').textContent=groupText(f.before)+' →';$('groupsAfter').textContent=groupText(f.groups);
    $('history').replaceChildren(...frames.slice(1,index+1).map(f=>{const li=document.createElement('li');li.textContent=eventText(f);return li;}));
    $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
    $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
    if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('quizWhy');
    $('copyStatus').textContent=copyState?t(copyState):'';
  }
  $('handRemove').addEventListener('change',renderHand);
  $('preset').addEventListener('change',()=>{preset=Number($('preset').value);index=0;frames=core.trace(core.presets[preset]);render();});
  $('prev').onclick=()=>{index=Math.max(0,index-1);render();};
  $('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};
  $('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
  document.querySelectorAll('[name="prediction"]').forEach(el=>el.addEventListener('change',()=>{choice=Number(el.value);revealed=false;render();}));
  $('reveal').onclick=()=>{revealed=true;render();};
  $('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
  $('copy').onclick=async()=>{
    try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
    catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
    $('copyStatus').textContent=t(copyState);
  };
  locale.onChange(render);locale.init();
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('#stepNav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));});},{rootMargin:'-15% 0px -65% 0px'});
  document.querySelectorAll('.step').forEach(s=>observer.observe(s));
})();

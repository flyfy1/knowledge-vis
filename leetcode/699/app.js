'use strict';
(()=>{
  const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),core=Lesson699;
  let preset=0,index=0,frames=core.trace(core.presets[0]),choice=null,revealed=false,copyState='';
  function draw(f){
    const input=core.presets[preset],all=frames[frames.length-1].landed;
    const minX=Math.min(...input.map(x=>x[0])),maxX=Math.max(...input.map(x=>x[0]+x[1])),maxY=Math.max(...all.map(x=>x.top));
    const scale=Math.min(410/(maxX-minX),230/maxY),x=v=>60+(v-minX)*scale,y=v=>270-v*scale;
    const ticks=[...new Set(input.flatMap(([l,s])=>[l,l+s]))];
    // Exact physical scale in both directions; table supplies every numerical value.
    $('plot').innerHTML=`<svg viewBox="0 0 520 320" aria-hidden="true"><line class="axis" x1="50" y1="270" x2="490" y2="270"/><line class="axis" x1="50" y1="270" x2="50" y2="25"/><text x="492" y="275">x</text><text x="30" y="20">y</text><text x="30" y="290">0</text>${ticks.map((v,i)=>`<line class="axis" x1="${x(v)}" x2="${x(v)}" y1="270" y2="${i%2?294:278}"/><text text-anchor="middle" x="${x(v)}" y="${i%2?313:292}">${v}</text>`).join('')}${f.landed.map((s,i)=>`<rect class="${f.phase==='land'&&i===f.i?'latest':''}" x="${x(s.left)}" y="${y(s.top)}" width="${s.side*scale}" height="${s.side*scale}"/><text class="square-id" text-anchor="middle" x="${x(s.left+s.side/2)}" y="${y(s.base+s.side/2)+6}">#${i+1}</text>`).join('')}<text x="5" y="${y(maxY)+5}">${maxY}</text></svg>`;
  }
  function event(f){
    const p={...f,i:f.i+1};
    if(f.phase==='ready')return t('readyEvent',p);
    if(f.phase==='land')return t('landEvent',{...p,old:f.answer.length>1?f.answer[f.answer.length-2]:0});
    const c=f.checks[f.checks.length-1];return t('checkEvent',{...p,...c,j:c.j+1,relation:t(c.overlap?'yesRelation':'noRelation',c)});
  }
  function renderHand(){
    const left=Number($('handLeft').value),width=Math.max(0,Math.min(3,left+2)-Math.max(1,left)),base=width>0?2:0,top=base+2;
    $('handResult').textContent=t('handResult',{width,base,top,answer:'2, '+Math.max(2,top),reason:t(width?'supported':left===3?'touching':'separated')});
  }
  function render(){
    renderHand();const f=frames[index];
    $('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('navigation'));
    document.querySelectorAll('[data-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.label)));
    $('progress').textContent=t('progress',{k:index,total:frames.length-1,count:f.landed.length,n:core.presets[preset].length,phase:t(f.phase)});
    $('event').textContent=event(f);$('input').textContent='positions = '+JSON.stringify(core.presets[preset]);
    $('output').textContent=t('output',{values:f.answer.join(', '),tail:t(index===frames.length-1?'finished':'pending')});
    draw(f);
    $('landedRows').innerHTML=f.landed.length?f.landed.map((s,i)=>`<tr><th scope="row">#${i+1}</th><td>[${s.left},${s.right})</td><td>${s.base}</td><td>${s.top}</td></tr>`).join(''):`<tr><td colspan="4">${t('none')}</td></tr>`;
    $('checkRows').innerHTML=f.checks.length?f.checks.map(c=>`<tr><th scope="row">#${c.j+1} / ${c.top}</th><td>${c.lo}, ${c.hi} / ${t(c.overlap?'yes':'no')}</td><td>${c.before} → ${c.after}</td></tr>`).join(''):`<tr><td colspan="3">${t('none')}</td></tr>`;
    $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
    $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
    if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('quizWhy');
    $('copyStatus').textContent=copyState?t(copyState):'';
  }
  $('handLeft').onchange=renderHand;
  $('preset').onchange=()=>{preset=Number($('preset').value);index=0;frames=core.trace(core.presets[preset]);render();};
  $('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};
  $('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
  document.querySelectorAll('[name="prediction"]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});
  $('reveal').onclick=()=>{revealed=true;render();};
  $('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
  $('copy').onclick=async()=>{
    try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
    catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
    $('copyStatus').textContent=t(copyState);
  };
  locale.onChange(render);locale.init();
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('#stepNav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}),{rootMargin:'-15% 0px -65% 0px'});
  document.querySelectorAll('.step').forEach(s=>observer.observe(s));
})();

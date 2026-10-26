'use strict';
(() => {
  const locale=LeetCodeLocale(window.LESSON_COPY), t=locale.t;
  const $=id=>document.getElementById(id), core=Lesson1074;
  let handIndex=0,presetIndex=0,frames=core.trace(core.presets[0].matrix,0),index=0;
  let choice=null,revealed=false,copyState='';
  const set=(id,text)=>$(id).textContent=text;
  function matrixHTML(matrix,top,bottom,c,left=0,right=matrix[0].length-1) {
    return '<table class="matrix"><caption>'+t('boardLabel')+'</caption><thead><tr><th scope="col">'+t('corner')+'</th>'+matrix[0].map((_,i)=>'<th scope="col">'+t('colIndex',{c:i})+'</th>').join('')+'</tr></thead><tbody>'+matrix.map((row,r)=>'<tr><th scope="row">'+t('rowIndex',{r})+'</th>'+row.map((v,col)=>'<td class="'+(r>=top&&r<=bottom&&col>=left&&col<=right?(col===c?'current':'band'):'outside')+'">'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  }
  function renderHand() {
    const rect=core.hand[handIndex],matrix=core.presets[0].matrix;
    $('handBoard').innerHTML=matrixHTML(matrix,rect.top,rect.bottom,-1,rect.left,rect.right);
    $('handLedger').innerHTML=core.hand.map((r,i)=>'<li class="'+(i===handIndex?'current':'')+'"'+(i===handIndex?' aria-current="step"':'')+'>'+t('rectItem',r)+'</li>').join('');
    const values=[];
    for(let r=rect.top;r<=rect.bottom;r++) for(let c=rect.left;c<=rect.right;c++) values.push('('+matrix[r][c]+')');
    set('handRead',t('handRead',{...rect,i:handIndex+1,sum:values.join(' + ')}));
    $('handPrev').disabled=handIndex===0;$('handNext').disabled=handIndex===4;
  }
  function renderTrace() {
    const f=frames[index],p=core.presets[presetIndex];
    set('input',t('input',{matrix:JSON.stringify(p.matrix),target:p.target}));
    $('board').innerHTML=matrixHTML(p.matrix,f.top,f.bottom,f.c);
    $('cols').innerHTML=f.cols.map((v,c)=>'<span class="'+(c===f.c?'current':'')+'">'+t('colValue',{c,v})+'</span>').join('');
    set('before',f.kind==='band'?t('noneBefore'):t('before',{map:JSON.stringify(f.before)}));
    set('after',t('after',{map:JSON.stringify(f.seen)}));
    set('event',t(f.kind==='band'?'bandEvent':'columnEvent',{...f,value:f.cols[f.c],target:p.target}));
    set('matches',f.kind==='band'?t('noneBefore'):f.hits?t('matchLine',{positions:JSON.stringify(f.matches),intervals:f.matches.map(left=>'['+left+','+f.c+']').join(', ')}):t('noMatch'));
    set('progress',t('progress',{i:index,last:frames.length-1,bandTotal:f.bandTotal,total:f.total,end:t(index===frames.length-1?'terminal':'inProgress')}));
    $('ledger').innerHTML=f.ledger.length?f.ledger.map(row=>'<tr>'+['['+row.top+','+row.bottom+']',row.c,row.s,row.need,row.hits,row.total].map(v=>'<td>'+v+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="6" class="empty-ledger">'+t('emptyLedger')+'</td></tr>';
    $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;
    $('end').disabled=index===frames.length-1;
  }
  function renderPrediction() {
    $('reveal').disabled=choice===null;
    $('feedback').hidden=!revealed;
    if(revealed) set('feedback',t(choice==='2'?'correct':'incorrect')+' '+t('answer'));
  }
  function render() {
    $('langToggle').setAttribute('aria-label',t('language'));
    document.querySelector('nav').setAttribute('aria-label',t('navigation'));
    renderHand();renderTrace();renderPrediction();
    set('copyStatus',copyState?t(copyState):'');
  }
  $('handPrev').onclick=()=>{handIndex=Math.max(0,handIndex-1);renderHand();};
  $('handNext').onclick=()=>{handIndex=Math.min(4,handIndex+1);renderHand();};
  $('preset').onchange=e=>{presetIndex=Number(e.target.value);const p=core.presets[presetIndex];frames=core.trace(p.matrix,p.target);index=0;renderTrace();};
  $('prev').onclick=()=>{index=Math.max(0,index-1);renderTrace();};
  $('next').onclick=()=>{index=Math.min(frames.length-1,index+1);renderTrace();};
  $('reset').onclick=()=>{index=0;renderTrace();};
  $('end').onclick=()=>{index=frames.length-1;renderTrace();};
  document.querySelectorAll('[name="prediction"]').forEach(radio=>radio.onchange=()=>{choice=radio.value;revealed=false;renderPrediction();});
  $('reveal').onclick=()=>{if(choice!==null){revealed=true;renderPrediction();}};
  set('code',window.PYTHON_SOURCE);$('fallbackSource').value=window.PYTHON_SOURCE;
  $('copy').onclick=async()=>{
    try {
      await navigator.clipboard.writeText(window.PYTHON_SOURCE);
      copyState='copied';$('manualCopy').hidden=true;
    } catch(_) {
      copyState='fallback';$('manualCopy').hidden=false;
      $('fallbackSource').focus();$('fallbackSource').select();
    }
    set('copyStatus',t(copyState));
  };
  locale.onChange(render);locale.init();
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    if(visible.length) document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+visible[0].target.id));
  },{rootMargin:'-15% 0px -60% 0px'});
  document.querySelectorAll('.step').forEach(s=>observer.observe(s));
})();

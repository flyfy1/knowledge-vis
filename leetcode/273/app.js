(() => {
  'use strict';
  const ui=LeetCodeLocale(LESSON_COPY),t=ui.t,$=id=>document.getElementById(id);
  const ones=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const scales=['','Thousand','Million','Billion'];
  function under(v){const p=[];if(v>=100){p.push(ones[Math.floor(v/100)],'Hundred');v%=100;}if(v>=20){p.push(tens[Math.floor(v/10)]);v%=10;}if(v)p.push(ones[v]);return p.join(' ');}
  // Faithful browser execution of the displayed Python control flow. The independent
  // oracle below uses a separate decimal-group decomposition.
  function pythonEquivalent(n){
    if(n===0)return 'Zero';
    const groups=[];let scale=0;
    while(n){
      const chunk=n%1000;
      if(chunk){let words=under(chunk);if(scales[scale])words+=' '+scales[scale];groups.push(words);}
      n=Math.floor(n/1000);scale++;
    }
    return groups.reverse().join(' ');
  }
  function oracle(n){
    if(n===0)return 'Zero';
    const small=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const decade=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    function renderDirect(v){
      const out=[];
      if(v>=100){out.push(small[Math.floor(v/100)]+' Hundred');v%=100;}
      if(v>=20){out.push(decade[Math.floor(v/10)]);v%=10;}
      if(v)out.push(small[v]);
      return out.join(' ');
    }
    const digits=String(n),parts=[];
    for(let end=digits.length;end>0;end-=3){
      const start=Math.max(0,end-3),chunk=Number(digits.slice(start,end));
      if(chunk){const place=Math.floor((digits.length-1-end)/3)+1;const label=scales[place]||'';parts.unshift((renderDirect(chunk)+' '+label).trim());}
    }
    return parts.join(' ');
  }
  const chunks=[12,345], words=[under(12),under(345)];
  function renderChunk(){const i=Number($('chunkSelect').value);$('chunkArray').style.setProperty('--n',2);$('chunkArray').innerHTML=chunks.map((v,j)=>`<div class="array-cell ${i===j?'current':''}"><div class="array-index">${t('visualGroupLabel',{i:j})}</div><div class="array-value">${String(v).padStart(3,'0')}</div><div class="array-marker">${j===0?'×1000':''}</div></div>`).join('');$('chunkInfo').textContent=t('chunkInfo',{i,digits:String(chunks[i]).padStart(3,'0'),words:words[i],scale:i? t('scaleNone'):'Thousand'});}
  $('chunkSelect').addEventListener('change',renderChunk);
  // Groups are stored low-to-high: ones, thousands, then millions.
  const groupData=[{v:567,s:'',w:'Five Hundred Sixty Seven'},{v:234,s:'Thousand',w:'Two Hundred Thirty Four Thousand'},{v:1,s:'Million',w:'One Million'}];let groupStep=0;
  function renderGroups(){const shown=groupData.slice(0,groupStep);$('groups').style.setProperty('--n',3);$('groups').innerHTML=groupData.map((g,i)=>`<div class="array-cell ${i<groupStep?'current':''}"><div class="array-index">${t('scanGroupLabel',{i})}</div><div class="array-value">${i===2?'1':i===1?'234':'567'}</div><div class="array-marker">${i<groupStep?g.s||'—':'?'}</div></div>`).join('');$('groupLedger').innerHTML=shown.length?shown.slice().reverse().map(g=>`<span class="ledger-item">${g.w}</span>`).join(''):'<span class="muted">—</span>';$('groupProgress').textContent=`${groupStep}/3`;$('groupStatus').textContent=t('groupStatus',{count:groupStep,text:shown.slice().reverse().map(g=>g.w).join(' ')||'—'});$('groupPrev').disabled=groupStep===0;$('groupNext').disabled=groupStep===3;}
  $('groupPrev').addEventListener('click',()=>{if(groupStep)groupStep--;renderGroups();});$('groupNext').addEventListener('click',()=>{if(groupStep<3)groupStep++;renderGroups();});
  let revealed=false;
  function normalizedGuess(value){return value.trim().replace(/\s+/g,' ').toLowerCase();}
  $('predictionInput').addEventListener('input',()=>{revealed=false;$('prediction').hidden=true;});
  $('reveal').addEventListener('click',()=>{revealed=true;const entered=$('predictionInput').value.trim()||t('noGuess');const expected='One Thousand Five';const verdict=normalizedGuess($('predictionInput').value)===normalizedGuess(expected)?t('predictionMatch'):t('predictionMiss');$('prediction').hidden=false;$('prediction').textContent=t('predictionAnswer',{entered,expected,verdict});});
  let scanNum=1234567,scanStart=scanNum,scanStep=0,scanItems=[];
  function renderScan(){const rem=scanItems.length?scanItems[scanItems.length-1].next:scanStart;$('scanLedger').innerHTML=scanItems.map(x=>`<span class="ledger-item">${x.chunk} → ${x.text||'∅'}${x.scale?' '+x.scale:''}</span>`).join('')||'<span class="muted">—</span>';$('scanProgress').textContent=`${scanStep}/4`;if(scanItems.length<4){const c=rem%1000;$('scanStatus').textContent=t('round',{i:scanStep+1,rest:rem,chunk:c,text:c?((under(c)+' '+scales[scanStep]).trim()):t('zeroChunk')});}else $('scanStatus').textContent=t('scanDone',{out:pythonEquivalent(scanStart)});$('scanNext').disabled=scanItems.length>=4;}
  $('scanNext').addEventListener('click',()=>{if(scanItems.length>=4)return;const rem=scanItems.length?scanItems[scanItems.length-1].next:scanStart,c=rem%1000;scanItems.push({chunk:c,next:Math.floor(rem/1000),text:c?under(c):'',scale:c?scales[scanItems.length]:''});scanStep++;renderScan();});$('scanReset').addEventListener('click',()=>{scanItems=[];scanStep=0;renderScan();});
  $('pythonCode').textContent=window.PYTHON_SOURCE;
  $('copyPython').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);$('copyStatus').textContent=t('copied');}catch(_){$('copyStatus').textContent=t('copyFallback');}});
  function verify(){let n=Number($('verifyNum').value);if(!Number.isInteger(n)||n<0||n>2147483647){$('verifyResult').textContent='0..2³¹−1';return;}const fast=pythonEquivalent(n),slow=oracle(n);$('verifyResult').textContent=t('verifyResult',{fast,slow,verdict:t(fast===slow?'match':'mismatch')});}
  $('verify').addEventListener('click',verify);ui.onChange(()=>{$('predictionInput').placeholder=t('predictionPlaceholder');renderChunk();renderGroups();renderScan();if(revealed){const entered=$('predictionInput').value.trim()||t('noGuess');const expected='One Thousand Five';const verdict=normalizedGuess($('predictionInput').value)===normalizedGuess(expected)?t('predictionMatch'):t('predictionMiss');$('prediction').textContent=t('predictionAnswer',{entered,expected,verdict});}verify();});ui.init();renderChunk();renderGroups();renderScan();verify();
  const links=[...document.querySelectorAll('.step-nav a')],obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${e.target.id}`));}}),{rootMargin:'-20% 0px -65% 0px'});document.querySelectorAll('.step').forEach(s=>obs.observe(s));
})();

(() => {
  'use strict';
  const ui = LeetCodeLocale(window.LEETCODE_COPY), t = ui.t, core = DistinctCore;
  const $ = id => document.getElementById(id);
  const examples = {repeat:[1,2,1],equal:[2,2],long:[1,2,1,3,2],unique:[1,2,3,4]};
  let selected = [0,2], guess = null, group = 0, rangeStep = 0, treeStep = 0, copyMessage = null;
  let partitionQuery = [0,3];
  let predictionChoice = null, predictionRevealed = false;
  const predictionChoices = [[2,6],[9,5,6],[9,5]];
  const groupFrames = core.rangeFrames(examples.repeat).filter(f=>f.applied);
  let rangeFrames = core.rangeFrames(examples.repeat);
  const treeFrames = core.treeFrames();
  const partitionNodes = new core.SegmentTree(5).nodes;
  const formatArray = a => '['+a.join(', ')+']';
  function arrayMarkup(nums,r,p=-1) {
    return nums.map((value,i)=>'<div class="array-cell '+(i===r?'current ':'')+(i===p?'previous ':'')+(i>r?'future':'')+'"><div class="array-index">'+i+'</div><div class="array-value">'+value+'</div><div class="array-marker">'+(i===r?'r':i===p?'p':'')+'</div></div>').join('');
  }
  function renderSubarrayInfo() {
    const [l,r]=selected, a=examples.repeat.slice(l,r+1), values=[...new Set(a)];
    $('subarrayInfo').textContent=t('subarrayInfo',{l,r,array:formatArray(a),set:'{'+values.join(', ')+'}',count:values.length,square:values.length**2});
    $('subarrayGrid').querySelectorAll('button').forEach(button=>{
      button.setAttribute('aria-pressed',String(Number(button.dataset.left)===l&&Number(button.dataset.right)===r));
      button.setAttribute('aria-label',t('selectSubarray',{l:button.dataset.left,r:button.dataset.right}));
    });
    if(guess!==null){$('guessFeedback').hidden=false;$('guessFeedback').classList.toggle('correct',guess===15);$('guessFeedback').textContent=t('guessFeedback',{result:t(guess===15?'correct':'retry')});}
    document.querySelectorAll('[data-guess]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.guess)===guess)));
  }
  // Build interactive cells once so selections and language changes retain focus.
  const grid=$('subarrayGrid');
  grid.append(document.createElement('span'));
  for(let r=0;r<3;r++){const axis=document.createElement('span');axis.className='axis';axis.textContent='r = '+r;grid.append(axis);}
  for(let l=0;l<3;l++){
    const axis=document.createElement('span');axis.className='axis';axis.textContent='l = '+l;grid.append(axis);
    for(let r=0;r<3;r++){
      if(r<l){grid.append(document.createElement('span'));continue;}
      const button=document.createElement('button');button.type='button';button.className='subarray-cell';button.dataset.left=l;button.dataset.right=r;
      button.textContent=formatArray(examples.repeat.slice(l,r+1));
      button.addEventListener('click',()=>{selected=[l,r];renderSubarrayInfo();});grid.append(button);
    }
  }
  document.querySelectorAll('[data-guess]').forEach(button=>button.addEventListener('click',()=>{guess=Number(button.dataset.guess);renderSubarrayInfo();}));
  function renderGroup() {
    const f=groupFrames[group];
    $('groupArray').style.setProperty('--n',3);$('groupArray').innerHTML=arrayMarkup(examples.repeat,group);
    $('groupRows').innerHTML=Array.from({length:group+1},(_,l)=>'<tr><td>'+l+'</td><td>'+formatArray(examples.repeat.slice(l,group+1))+'</td><td>'+f.after[l]+'</td><td>'+f.after[l]**2+'</td></tr>').join('');
    $('groupLedger').innerHTML=groupFrames.slice(0,group+1).map(g=>'<span class="ledger-item '+(g.r===group?'current':'')+'">F('+g.r+') = '+g.q+'</span>').join('');
    $('groupInfo').textContent=t('groupInfo',{r:f.r,q:f.q,answer:f.answer});
    $('groupPrev').disabled=group===0;$('groupNext').disabled=group===2;
  }
  $('groupPrev').addEventListener('click',()=>{if(group>0){group--;renderGroup();}});
  $('groupNext').addEventListener('click',()=>{if(group<2){group++;renderGroup();}});
  function renderRange() {
    const nums=examples[$('rangeExample').value],f=rangeFrames[rangeStep];
    $('rangeArray').style.setProperty('--n',nums.length);$('rangeArray').innerHTML=arrayMarkup(nums,f.r,f.p);
    $('rangeStatus').textContent=t('rangeStatus',{r:f.r,x:nums[f.r],p:f.p,lo:f.p+1,phase:t(f.applied?'applied':'pending')});
    $('rangeCounts').style.setProperty('--n',nums.length);
    $('rangeCounts').innerHTML=nums.map((_,l)=>{
      const value=f.applied?f.after[l]:f.before[l],changed=l>f.p&&l<=f.r;
      return '<div class="count-cell '+(changed?'changed':'')+'"><div class="count-label">l = '+l+'</div><div class="count-bars"><span class="count-bar" style="height:'+f.before[l]/nums.length*90+'%"></span><span class="count-bar new" style="height:'+value/nums.length*90+'%"></span></div><div class="count-value">'+f.before[l]+' → '+(f.applied?value:'?')+'</div></div>';
    }).join('');
    $('rangeSquareLabel').textContent=t(f.applied?'groupSquare':'beforeSquare');
    $('rangeSquare').textContent=f.q;$('rangeAnswer').textContent=f.answer;
    $('rangeProgress').textContent=(rangeStep+1)+' / '+rangeFrames.length;
    $('rangePrev').disabled=rangeStep===0;$('rangeNext').disabled=rangeStep===rangeFrames.length-1;
    $('rangeNext').textContent=t(rangeStep===rangeFrames.length-1?'finished':f.applied?'advance':'apply');
    $('rangeLedger').innerHTML=rangeFrames.slice(0,rangeStep+1).filter(g=>g.applied).map(g=>'<span class="ledger-item '+(g.r===f.r?'current':'')+'">F('+g.r+') = '+g.q+'</span>').join('');
    const work=rangeFrames.slice(0,rangeStep+1).filter(g=>g.applied).reduce((sum,g)=>sum+g.r-g.p,0);
    $('rangeWork').textContent=t('rangeWork',{count:f.r-f.p,total:work});
  }
  $('rangePrev').addEventListener('click',()=>{if(rangeStep>0){rangeStep--;renderRange();}});
  $('rangeNext').addEventListener('click',()=>{if(rangeStep<rangeFrames.length-1){rangeStep++;renderRange();}});
  $('rangeExample').addEventListener('change',()=>{rangeStep=0;rangeFrames=core.rangeFrames(examples[$('rangeExample').value]);renderRange();});
  function renderFormula() {
    const k=Number($('increment').value),old=[2,2,1],delta=2*k*5+k*k*3;
    $('incrementValue').textContent=k;
    $('formulaBars').innerHTML=old.map((d,l)=>'<div class="bar-pair"><div class="count-label">l = '+l+'</div><div class="count-bars"><span class="count-bar" style="height:'+d/5*140+'px"></span><span class="count-bar new" style="height:'+(d+k)/5*140+'px"></span></div><output>'+d+' → '+(d+k)+'</output><output>ΔQ = '+((d+k)**2-d*d)+'</output></div>').join('');
    $('formulaReadout').textContent=t('formulaReadout',{k,delta,q:9+delta,s:5+k*3});
  }
  $('increment').addEventListener('input',renderFormula);
  function renderPartition() {
    const [ql,qr]=partitionQuery,parts=core.partitionRange(partitionNodes,ql,qr);
    const isPrediction=ql===1&&qr===3,showAnswer=!isPrediction||predictionRevealed;
    const width=$('partitionDiagram').getBoundingClientRect().width;
    if(!width)return;
    const nodes=Object.values(partitionNodes),nodeWidth=Math.min(114,width/5-5);
    const x=a=>(a.l+a.r+1)/2*width/5,y=a=>a.depth*72+27;
    const edges=nodes.filter(a=>a.i>1).map(a=>{
      const parent=partitionNodes[Math.floor(a.i/2)];
      return '<line class="tree-edge" x1="'+x(parent)+'" y1="'+(y(parent)+23)+'" x2="'+x(a)+'" y2="'+(y(a)-23)+'"/>';
    }).join('');
    const marks=nodes.map(a=>{
      const coverage=!showAnswer?'none':parts.covered.includes(a.i)?'full':parts.partial.includes(a.i)?'partial':'none';
      return '<g data-node-id="'+a.i+'" data-coverage="'+coverage+'" transform="translate('+x(a)+','+y(a)+')"><rect class="tree-node '+(coverage==='full'?'hot':coverage==='partial'?'partial':'excluded')+'" x="'+(-nodeWidth/2)+'" y="-23" width="'+nodeWidth+'" height="46" rx="5"/><text text-anchor="middle" y="-3">['+a.l+','+a.r+']</text><text text-anchor="middle" y="15">#'+a.i+'</text></g>';
    }).join('');
    const blocks=parts.covered.map(i=>'['+partitionNodes[i].l+', '+partitionNodes[i].r+']').join(' + ');
    let description=t('partitionReadout',{lo:ql,hi:qr,blocks,count:qr-ql+1,parts:parts.covered.length});
    if(isPrediction){
      if(!predictionRevealed)description=t('predictionPending');
      else {
        const covered=predictionChoices[predictionChoice].flatMap(i=>Array.from({length:partitionNodes[i].r-partitionNodes[i].l+1},(_,j)=>partitionNodes[i].l+j));
        const extra=covered.filter(l=>l<ql||l>qr),missing=Array.from({length:qr-ql+1},(_,j)=>ql+j).filter(l=>!covered.includes(l));
        description=t(extra.length?'predictionExtra':missing.length?'predictionMissing':'predictionCorrect',{covered:covered.join(', '),extra:extra.join(', '),missing:missing.join(', ')});
      }
    }
    $('partitionDiagram').innerHTML='<svg class="tree-svg" viewBox="0 0 '+width+' 270" role="img" aria-label="'+t('partitionDiagram')+'"><title>'+t('partitionDiagram')+'</title><desc>'+description+'</desc>'+edges+marks+'</svg>';
    $('partitionReadout').textContent=description;
    $('partitionPrediction').hidden=!isPrediction;
    $('predictionReveal').disabled=predictionChoice===null;
    document.querySelectorAll('[name="partitionAnswer"]').forEach(input=>{input.checked=Number(input.value)===predictionChoice;});
    document.querySelectorAll('[data-partition]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.partition===partitionQuery.join(','))));
  }
  document.querySelectorAll('[data-partition]').forEach(button=>button.addEventListener('click',()=>{partitionQuery=button.dataset.partition.split(',').map(Number);renderPartition();}));
  document.querySelectorAll('[name="partitionAnswer"]').forEach(input=>input.addEventListener('change',()=>{predictionChoice=Number(input.value);predictionRevealed=false;renderPartition();}));
  $('predictionReveal').addEventListener('click',()=>{if(predictionChoice!==null){predictionRevealed=true;renderPartition();}});
  new ResizeObserver(renderPartition).observe($('partitionDiagram'));
  function operation(f) {
    if(f.kind==='initial')return t('treeInitial');
    const a=f.nodes[f.hot[0]];
    let value=t(f.kind==='cover'?'treeCover':f.kind==='push'?'treePush':'treePull',{r:f.r,l:a.l,hi:a.r,k:f.k,node:a.i,ql:f.p+1,qr:f.r});
    if(f.done)value+=' '+t('treeDone',{r:f.r,q:f.nodes[1].q});
    return value;
  }
  function drawTree() {
    const f=treeFrames[treeStep],width=$('treeDiagram').getBoundingClientRect().width;
    if(!width)return;
    const height=426,nodeWidth=Math.min(114,width/5-5),nodeHeight=80;
    const nodes=Object.values(f.nodes),x=a=>(a.l+a.r+1)/2*width/5,y=a=>a.depth*110+44;
    const edges=nodes.filter(a=>a.i>1).map(a=>{const parent=f.nodes[Math.floor(a.i/2)];return '<line class="tree-edge" x1="'+x(parent)+'" y1="'+(y(parent)+nodeHeight/2)+'" x2="'+x(a)+'" y2="'+(y(a)-nodeHeight/2)+'"/>';}).join('');
    const marks=nodes.map(a=>'<g transform="translate('+x(a)+','+y(a)+')"><rect class="tree-node '+(f.hot.includes(a.i)?'hot':'')+'" x="'+(-nodeWidth/2)+'" y="-40" width="'+nodeWidth+'" height="80" rx="6"/><text text-anchor="middle" y="-23">['+a.l+','+a.r+']</text><text text-anchor="middle" y="-5">S '+a.s+'</text><text text-anchor="middle" y="13">Q '+a.q+'</text><text text-anchor="middle" y="31">t '+a.t+'</text></g>').join('');
    $('treeDiagram').innerHTML='<svg class="tree-svg" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+t('treeDiagram')+'"><title>'+t('treeDiagram')+'</title><desc>'+operation(f)+'</desc>'+edges+marks+'</svg>';
  }
  function renderTree() {
    const f=treeFrames[treeStep];
    $('treeStatus').textContent=operation(f);$('treeProgress').textContent=(treeStep+1)+' / '+treeFrames.length;
    $('treePrev').disabled=treeStep===0;$('treeNext').disabled=treeStep===treeFrames.length-1;
    $('treeValues').style.setProperty('--n',5);
    $('treeValues').innerHTML=f.values.map((v,l)=>'<div class="array-cell"><div class="array-index">l = '+l+'</div><div class="array-value">'+v+'</div></div>').join('');
    $('treeDetail').innerHTML=f.before?'<table><thead><tr><th>'+t('node')+'</th><th>S · '+t('oldNew')+'</th><th>Q · '+t('oldNew')+'</th><th>t · '+t('oldNew')+'</th></tr></thead><tbody>'+f.hot.map(i=>{const a=f.nodes[i],b=f.before[i];return '<tr><td>#'+i+' ['+a.l+','+a.r+']</td><td>'+b.s+' → '+a.s+'</td><td>'+b.q+' → '+a.q+'</td><td>'+b.t+' → '+a.t+'</td></tr>';}).join('')+'</tbody></table>':'';
    $('treeLog').innerHTML=treeFrames.slice(0,treeStep+1).map((g,i)=>'<li class="'+(i===treeStep?'current':'')+'">'+operation(g)+'</li>').join('');
    $('treeContext').textContent=t(f.kind==='initial'?'treeCompletedContext':'treeContext',{r:f.r,x:examples.long[f.r],p:f.p,ql:f.p+1,qr:f.r});
    $('treeExplanation').hidden=f.kind!=='push';
    $('treeExplanation').textContent=f.kind==='push'?t('pushConsequence'):'';
    const snippets={cover:'apply(node, left, right, 1)',push:'apply(node * 2, left, mid, k)\napply(node * 2 + 1, mid + 1, right, k)\nlazy[node] = 0',pull:'total[node] = (total[node * 2] + total[node * 2 + 1]) % mod\nsquare[node] = (square[node * 2] + square[node * 2 + 1]) % mod'};
    $('treeCodeBlock').hidden=f.kind==='initial';
    $('treePython').textContent=snippets[f.kind]||'';
    drawTree();
  }
  $('treePrev').addEventListener('click',()=>{if(treeStep>0){treeStep--;renderTree();}});
  $('treeNext').addEventListener('click',()=>{if(treeStep<treeFrames.length-1){treeStep++;renderTree();}});
  new ResizeObserver(drawTree).observe($('treeDiagram'));
  $('pythonCode').textContent=window.LEETCODE_PYTHON;
  $('copyPython').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(window.LEETCODE_PYTHON);copyMessage='copied';}
    catch(_){copyMessage='copyFallback';}
    $('copyStatus').textContent=t(copyMessage);
  });
  function renderVerify() {
    const nums=examples[$('verifyExample').value],frames=core.rangeFrames(nums).filter(f=>f.applied),fast=frames[frames.length-1].answer,slow=core.brute(nums);
    $('verifyRows').innerHTML=frames.map(f=>'<tr><td>'+f.r+'</td><td>'+f.p+'</td><td>['+(f.p+1)+', '+f.r+']</td><td>'+f.q+'</td><td>'+f.answer+'</td></tr>').join('');
    $('verifyResult').textContent=t('verification',{fast,slow,verdict:t(fast===slow?'match':'mismatch')});
    $('verifyResult').classList.toggle('correct',fast===slow);
  }
  $('verifyExample').addEventListener('change',renderVerify);
  function renderCodeMapping() {
    const rows=[['S','total[node]','mapTotal'],['Q','square[node]','mapSquare'],['t','lazy[node]','mapLazy'],[t('mapNodeQuantity'),'node','mapNode'],[t('mapBoundsQuantity'),'left, right','mapBounds'],[t('mapQueryQuantity'),'ql, qr','mapQuery']];
    $('codeMapping').innerHTML=rows.map(([quantity,code,meaning])=>'<tr><td>'+quantity+'</td><td><code>'+code+'</code></td><td>'+t(meaning)+'</td></tr>').join('');
  }
  ui.onChange(()=>{renderSubarrayInfo();renderGroup();renderRange();renderFormula();renderPartition();renderTree();renderCodeMapping();renderVerify();if(copyMessage)$('copyStatus').textContent=t(copyMessage);});
  ui.init();
  const navLinks=[...document.querySelectorAll('#stepNav a')];
  const sections=[...document.querySelectorAll('section.step')],nav=$('stepNav');
  let activeId=null,navFrame=0;
  function updateNavigation() {
    navFrame=0;
    const readingLine=scrollY+nav.parentElement.offsetHeight+100;
    let section=sections[0];
    for(const candidate of sections)if(candidate.offsetTop<=readingLine)section=candidate;
    if(activeId===section.id)return;
    activeId=section.id;
    for(const link of navLinks){
      const active=link.hash==='#'+activeId;
      link.classList.toggle('active',active);
      if(active){
        link.setAttribute('aria-current','step');
        nav.scrollLeft+=link.getBoundingClientRect().left-nav.getBoundingClientRect().left-(nav.clientWidth-link.clientWidth)/2;
      } else link.removeAttribute('aria-current');
    }
  }
  function scheduleNavigation(){if(!navFrame)navFrame=requestAnimationFrame(updateNavigation);}
  window.addEventListener('scroll',scheduleNavigation,{passive:true});
  window.addEventListener('resize',()=>{activeId=null;scheduleNavigation();});
  scheduleNavigation();
})();

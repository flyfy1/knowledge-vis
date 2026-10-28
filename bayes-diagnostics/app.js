'use strict';
(function(){
  const N=1000, $=id=>document.getElementById(id);
  const state={prior:1,sens:90,spec:91,result:'positive',quiz:null};
  function pct(n){return `${(n*100).toFixed(n<.1?1:0)}%`}
  function round(n){return Math.round(n*10)/10}
  function calc(){
    const prior=state.prior/100,sens=state.sens/100,spec=state.spec/100;
    const ill=N*prior,healthy=N-ill;
    const tp=ill*sens,fn=ill*(1-sens),tn=healthy*spec,fp=healthy*(1-spec);
    const pos=tp+fp,neg=tn+fn;
    return {prior,sens,spec,ill,healthy,tp,fn,tn,fp,pos,neg,ppv:pos?tp/pos:0,npv:neg?tn/neg:0,fpr:1-spec,fnr:1-sens};
  }
  function setRangeFill(el,min,max,val){const ratio=(val-min)/(max-min)*100;el.style.background=`linear-gradient(90deg,var(--cyan) 0 ${ratio}%,#20384c ${ratio}% 100%)`}
  function renderControls(c){
    $('priorOut').textContent=`${state.prior}%`; $('sensOut').textContent=`${state.sens}%`; $('specOut').textContent=`${state.spec}%`;
    setRangeFill($('prior'),1,30,state.prior); setRangeFill($('sens'),50,100,state.sens); setRangeFill($('spec'),50,100,state.spec);
    $('populationPill').textContent=`${state.prior}%`;
    $('priorMetrics').innerHTML=`<div class="metric-chip"><strong>${Math.round(c.ill)}</strong><span>${window.I18N.t('populationIll')}</span></div><div class="metric-chip"><strong>${Math.round(c.healthy)}</strong><span>${window.I18N.t('populationHealthy')}</span></div>`;
    $('tpCount').textContent=Math.round(c.tp); $('fnCount').textContent=Math.round(c.fn); $('fpCount').textContent=Math.round(c.fp); $('tnCount').textContent=Math.round(c.tn);
  }
  function renderPopulation(c){
    $('populationBars').innerHTML=`<div><div class="bar-label"><span>${window.I18N.t('populationIll')}</span><b>${Math.round(c.ill)} / ${N}</b></div><div class="bar-track"><span class="bar-segment ill" style="flex-basis:${c.prior*100}%"></span><span class="bar-segment healthy" style="flex-basis:${(1-c.prior)*100}%"></span></div></div><div><div class="bar-label"><span>${window.I18N.t('populationHealthy')}</span><b>${Math.round(c.healthy)} / ${N}</b></div><div class="bar-track"><span class="bar-segment healthy" style="flex-basis:${(1-c.prior)*100}%"></span><span class="bar-segment ill" style="flex-basis:${c.prior*100}%"></span></div></div>`;
  }
  function renderLikelihood(c){
    const fpr=pct(c.fpr),fnr=pct(c.fnr);
    $('likelihoodNote').textContent=`${window.I18N.t('likelihoodNote')} ${window.I18N.t('falsePositive')}: ${fpr}; ${window.I18N.t('falseNegative')}: ${fnr}.`;
  }
  function treeGroup(label,sub,segments,active){
    const cells=segments.map(s=>`<span class="tree-cell ${s.cls}" style="flex-basis:${s.value/segments.reduce((a,b)=>a+b.value,0)*100}%" title="${s.label}: ${Math.round(s.value)}"></span>`).join('');
    const legends=segments.map(s=>`<span><i class="dot ${s.cls}"></i>${s.label} ${Math.round(s.value)}</span>`).join('');
    return `<div class="tree-group ${active?'active':''}"><div class="tree-group-head"><span>${label}</span><small>${sub}</small></div><div class="tree-bar">${cells}</div><div class="tree-legend">${legends}</div></div>`;
  }
  function renderPosterior(c){
    const pos=state.result==='positive', posterior=pos?c.ppv:c.npv,denom=pos?c.pos:c.neg;
    $('positiveValue').textContent=pct(c.ppv); $('negativeValue').textContent=pct(c.npv);
    $('positiveBtn').classList.toggle('active',pos); $('negativeBtn').classList.toggle('active',!pos);
    const illLabel=window.I18N.t('diseaseGroup'),healthyLabel=window.I18N.t('healthyGroup');
    const positiveTree=treeGroup(window.I18N.t('positivePool'),`${Math.round(c.pos)} ${window.I18N.t('countPeople')}`,[{label:window.I18N.t('truePositive'),value:c.tp,cls:'good'},{label:window.I18N.t('falsePositive'),value:c.fp,cls:'bad'}],pos);
    const negativeTree=treeGroup(window.I18N.t('negativePool'),`${Math.round(c.neg)} ${window.I18N.t('countPeople')}`,[{label:window.I18N.t('trueNegative'),value:c.tn,cls:'neutral'},{label:window.I18N.t('falseNegative'),value:c.fn,cls:'miss'}],!pos);
    $('tree').innerHTML=`<div class="tree-root"><div class="tree-group-head"><span>${window.I18N.t('treeTitle')}</span><small>${Math.round(c.ill)} ${illLabel} · ${Math.round(c.healthy)} ${healthyLabel}</small></div></div>${positiveTree}${negativeTree}`;
    const formulaKey=pos?'posFormula':'negFormula',readoutKey=pos?'posReadout':'negReadout',feedbackKey=pos?'posFeedback':'negFeedback';
    const numerator=pos?c.tp:c.tn;
    $('treeDenom').textContent=pos?window.I18N.t('selectedPositive'):window.I18N.t('selectedNegative');
    $('formula').textContent=window.I18N.t(formulaKey,{tp:Math.round(c.tp),fp:Math.round(c.fp),tn:Math.round(c.tn),fn:Math.round(c.fn),post:pct(posterior)});
    $('posteriorReadout').textContent=`${window.I18N.t(readoutKey)} · ${pct(posterior)}`;
    $('posteriorFeedback').textContent=window.I18N.t(feedbackKey,{denom:Math.round(denom),tp:Math.round(numerator),tn:Math.round(numerator)});
    $('posteriorFeedback').className='feedback '+(pos?'warn':'good');
  }
  function renderQuiz(){
    const box=$('quizFeedback'); if(state.quiz===null){box.textContent='';box.className='quiz-feedback';return} const correct=state.quiz==='no';box.textContent=window.I18N.t(correct?'quizCorrect':'quizWrong');box.className=`quiz-feedback ${correct?'good':'warn'}`;
  }
  function render(){const c=calc();renderControls(c);renderPopulation(c);renderLikelihood(c);renderPosterior(c);renderQuiz();}
  function reset(){Object.assign(state,{prior:1,sens:90,spec:91,result:'positive',quiz:null});['prior','sens','spec'].forEach(id=>$(id).value=state[id]);render()}
  ['prior','sens','spec'].forEach(id=>$(id).addEventListener('input',e=>{state[id]=Number(e.target.value);render()}));
  document.querySelectorAll('.result-button').forEach(btn=>btn.addEventListener('click',()=>{state.result=btn.dataset.result;render()}));
  document.querySelectorAll('#quizOptions button').forEach(btn=>btn.addEventListener('click',()=>{state.quiz=btn.dataset.answer;renderQuiz()}));
  $('resetBtn').addEventListener('click',reset);
  window.BAYES_DIAGNOSTICS={state,calc,render,reset};
})();

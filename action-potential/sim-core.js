(function(root){
  function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
  function evaluateSpike(stimulus,threshold){
    const s=clamp(Number(stimulus),0,1), t=clamp(Number(threshold),.35,.85), fired=s>=t;
    return {fired, peak: fired ? 30 : Math.round(-70+s*40), latency: fired ? Math.max(1.2,5.4-s*3.1) : null, state:fired?'all-or-none':'graded potential'};
  }
  function phaseAt(time,leak){
    const t=clamp(Number(time),0,8), l=clamp(Number(leak),0,.4);
    let phase,na,k,voltage;
    if(t<1.2){phase='rest';na='closed';k='closed';voltage=-70+(t/1.2)*3}
    else if(t<3.1){phase='depolarization';na='open';k='closed';voltage=-67+(t-1.2)/1.9*97}
    else if(t<4.7){phase='repolarization';na='inactivated';k='open';voltage=30-(t-3.1)/1.6*100}
    else{phase='hyperpolarization';na='recovering';k='closing';voltage=-70-(t-4.7)/3.3*13}
    voltage=Math.round(voltage-(voltage+70)*l*.18);
    return {time:t,phase,na,k,leak:l,voltage};
  }
  function trainModel(frequency,refractory){
    const f=clamp(Math.round(Number(frequency)),1,160), r=clamp(Number(refractory),1,12), input=f, maxRate=1000/r, output=Math.min(input,Math.floor(maxRate));
    return {frequency:f,refractory:r,input,output,maxRate:Math.round(maxRate*10)/10,skipped:input-output};
  }
  const api={clamp,evaluateSpike,phaseAt,trainModel};
  root.ActionPotentialModel=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

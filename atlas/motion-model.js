/* Exact solution of an ideal, horizontal, undamped Hookean oscillator.
   cycles is the shared phase / (2π), not a second independent clock. */
(function(root){
  'use strict';
  const defaults=Object.freeze({mass:1,stiffness:4,amplitude:.6});
  function at(cycles,parameters=defaults){
    const {mass:m,stiffness:k,amplitude:A}=parameters;
    if(![cycles,m,k,A].every(Number.isFinite)||cycles<0||cycles>2||m<=0||k<=0||A<0)throw new RangeError('Invalid oscillator state');
    const omega=Math.sqrt(k/m),period=2*Math.PI/omega,theta=cycles*2*Math.PI;
    // Snap dimensionless trig residuals only (e.g. sinπ); all consumers share these zeros.
    const clean=n=>Math.abs(n)<1e-12?0:n;
    const q=clean(Math.cos(theta)),sin=clean(Math.sin(theta));
    const x=q===0||A===0?0:A*q,v=sin===0||A===0?0:-A*omega*sin,force=x===0?0:-k*x;
    const acceleration=force/m,speed=Math.abs(v);
    const motionCase=A===0?'stationary':v===0?'turning':acceleration===0?'crossing':v*acceleration>0?'speeding':'slowing';
    const potential=.5*k*x*x,kinetic=.5*m*v*v;
    return {cycles,theta,q,x,v,speed,force,netForce:force,acceleration,motionCase,omega,period,time:cycles*period,
      energy:.5*k*A*A,potential,kinetic};
  }
  // cos(2πv)-cos(2πu), reduced before adding the tiny interval width.
  function cosChange(u,v){
    const d=v-u;if(d===0||Number.isInteger(d))return 0;
    const n=Math.round(2*u),relative=2*(u-n/2)+d;
    const middle=Number.isInteger(relative)?0:(n%2?-1:1)*Math.sin(Math.PI*relative);
    return middle===0?0:-2*middle*Math.sin(Math.PI*d);
  }
  // Analytic signed velocity integral and total variation on chronological bounds.
  // Split at v=0 (half cycles); stable cos-difference avoids cancellation on tiny spans.
  function interval(a,b,parameters=defaults){
    const start=at(a,parameters),end=at(b,parameters),A=parameters.amplitude;
    const low=Math.min(a,b),high=Math.max(a,b),orientation=Math.sign(b-a);
    const delta=(u,v)=>A===0?0:A*cosChange(u,v);
    const cuts=[low];for(let c=(Math.floor(low*2)+1)/2;c<high;c+=.5)cuts.push(c);cuts.push(high);
    let positive=0,negative=0;
    for(let i=1;i<cuts.length;i++){const d=delta(cuts[i-1],cuts[i]);if(d>0)positive+=d;else negative+=d;}
    const distance=positive-negative,chronologicalDisplacement=positive+negative;
    return {a,b,start,end,low,high,orientation,positive,negative,distance,chronologicalDisplacement,
      integral:delta(a,b),speedIntegral:orientation===0?0:orientation*distance};
  }
  // Conservative spring work along the selected trajectory, integrated in x.
  // Quarter cycles split at both F=0 and v=0, where the sign of Fv changes.
  function workInterval(a,b,parameters=defaults){
    const q=interval(a,b,parameters),{stiffness:k,amplitude:A}=parameters;
    const amount=(u,v)=>{const change=cosChange(2*u,2*v);return A===0||change===0?0:-.25*k*A*A*change;};
    const cuts=[q.low];for(let c=(Math.floor(q.low*4)+1)/4;c<q.high;c+=.25)cuts.push(c);cuts.push(q.high);
    let positive=0,negative=0;const chronologicalLegs=[];
    for(let i=1;i<cuts.length;i++){
      const from=cuts[i-1],to=cuts[i],work=amount(from,to);
      if(work>0)positive+=work;else negative+=work;
      if(from!==to)chronologicalLegs.push({from,to,xa:at(from,parameters).x,xb:at(to,parameters).x,work});
    }
    const work=amount(a,b),deltaU=work===0?0:-work;
    const legs=q.orientation<0?chronologicalLegs.slice().reverse().map(s=>({from:s.to,to:s.from,xa:s.xb,xb:s.xa,work:s.work===0?0:-s.work})):chronologicalLegs;
    return {...q,work,deltaK:work,deltaU,positive,negative,chronologicalWork:amount(q.low,q.high),legs};
  }
  const api={at,interval,workInterval,defaults};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotionModel=api;
})(typeof window==='undefined'?globalThis:window);

/* Ideal teaching models. Units are SI; output ripple is neglected. */
(function(root){
  'use strict';
  function pulse(kind, value, drive) {
    const storage=kind==='inductor'?0.01:100e-6, dt=0.0005;
    const next=value+drive*dt/storage;
    return {value:next,energy:storage*next*next/2,deltaEnergy:storage*(next*next-value*value)/2};
  }
  function converter(kind,vin,duty) {
    if(!['buck','boost'].includes(kind)||vin<5||vin>12||duty<.2||duty>.75)throw new RangeError('Outside teaching domain');
    const T=50e-6,L=.001,C=470e-6,io=1;
    const vo=kind==='buck'?vin*duty:vin/(1-duty);
    const avg=kind==='buck'?io:io/(1-duty);
    const up=kind==='buck'?vin-vo:vin, down=kind==='buck'?-vo:vin-vo;
    const ripple=up*duty*T/L,low=avg-ripple/2;
    function sample(t){
      let phase=((t/T)%1+1)%1;
      if(Math.abs(phase-1)<1e-10||phase<1e-10)phase=0;
      if(Math.abs(phase-duty)<1e-10)phase=duty;
      const on=phase<duty;
      const il=on?low+up*phase*T/L:low+ripple+down*(phase-duty)*T/L;
      const ic=kind==='buck'?il-io:on?-io:il-io;
      return {on,il,ic,vl:on?up:down,energy:L*il*il/2};
    }
    const timeAt=k=>{const cycle=Math.floor(k/4),part=k%4;return T*(cycle+[0,duty/2,duty,(1+duty)/2][part]);};
    return {T,L,C,io,vin,duty,vo,avg,ripple,low,up,down,iin:vo*io/vin,sample,timeAt};
  }
  const api={pulse,converter};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.PowerModel=api;
})(typeof window==='object'?window:globalThis);

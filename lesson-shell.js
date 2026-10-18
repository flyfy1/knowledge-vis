/* The lesson owns active-step state. This module only reveals that step horizontally. */
(() => {
  'use strict';
  const nav=document.querySelector('.step-nav');
  if(!nav)return;
  let lastActive;
  function reveal(force=false){
    const active=nav.querySelector('.nav-step.active');
    if(!active||(!force&&active===lastActive))return;
    lastActive=active;
    const a=active.getBoundingClientRect(),n=nav.getBoundingClientRect(),pad=8;
    if(a.left<n.left+pad)nav.scrollLeft+=a.left-n.left-pad;
    else if(a.right>n.right-pad)nav.scrollLeft+=a.right-n.right+pad;
  }
  new MutationObserver(()=>reveal()).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  new ResizeObserver(()=>reveal(true)).observe(nav);
  reveal(true);
})();

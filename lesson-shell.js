/* The lesson owns active-step state. This module only reveals that step horizontally, and, on a fresh load at
   the top of the page, lights the first step when the lesson's scroll spy has lit none (its band can sit just
   below step 0 on a tall window; specs/reviews/site-template-phase3a-review-20261116.md). */
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
  // Only a plain navigation at scroll 0 with no #fragment: a reload, back/forward or deep link restores a position
  // the spy will light itself. The spy's next match replaces this (it toggles every .nav-step).
  addEventListener('load',()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const nt=(performance.getEntriesByType&&performance.getEntriesByType('navigation')[0]||{}).type;
    if(nt&&nt!=='navigate')return;
    if(location.hash||scrollY>0||nav.querySelector('.nav-step.active'))return;
    const first=nav.querySelector('.nav-step');
    if(first)first.classList.add('active');
  })));
})();

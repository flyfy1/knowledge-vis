(function (root) {
  'use strict';
  function brute(nums) {
    let answer = 0;
    for (let l = 0; l < nums.length; l++) {
      const seen = new Set();
      for (let r = l; r < nums.length; r++) {seen.add(nums[r]); answer += seen.size ** 2;}
    }
    return answer;
  }
  function rangeFrames(nums) {
    let counts = Array(nums.length).fill(0), answer = 0;
    const last = new Map(), frames = [];
    for (let r = 0; r < nums.length; r++) {
      const p = last.has(nums[r]) ? last.get(nums[r]) : -1;
      const before = counts.slice();
      const after = before.map((d, l) => d + (l > p && l <= r ? 1 : 0));
      const q = after.reduce((s, d) => s + d * d, 0);
      frames.push({r,p,before,after,applied:false,q:before.reduce((s,d)=>s+d*d,0),answer});
      answer += q;
      frames.push({r,p,before,after,applied:true,q,answer});
      counts = after;
      last.set(nums[r], r);
    }
    return frames;
  }
  // Exact small-number teaching model, not the large-input submission runtime.
  class SegmentTree {
    constructor(n, onEvent = () => {}) {
      this.nodes = {}; this.onEvent = onEvent;
      const build = (i,l,r,depth) => {
        this.nodes[i] = {i,l,r,depth,s:0,q:0,t:0};
        if(l<r){const mid=(l+r)>>1;build(i*2,l,mid,depth+1);build(i*2+1,mid+1,r,depth+1);}
      };
      build(1,0,n-1,0);
    }
    apply(i,k) {
      const a=this.nodes[i], length=a.r-a.l+1;
      a.q += 2*k*a.s+k*k*length;
      a.s += k*length; a.t += k;
    }
    push(i) {
      const a=this.nodes[i],k=a.t;
      if(k){this.apply(i*2,k);this.apply(i*2+1,k);a.t=0;this.onEvent('push',[i,i*2,i*2+1],{k});}
    }
    add(ql,qr,i=1) {
      const a=this.nodes[i];
      if(ql<=a.l&&a.r<=qr){this.apply(i,1);this.onEvent('cover',[i],{k:1});return;}
      this.push(i);
      const mid=(a.l+a.r)>>1;
      if(ql<=mid)this.add(ql,qr,i*2);
      if(qr>mid)this.add(ql,qr,i*2+1);
      a.s=this.nodes[i*2].s+this.nodes[i*2+1].s;
      a.q=this.nodes[i*2].q+this.nodes[i*2+1].q;
      this.onEvent('pull',[i],{});
    }
    values() {
      const values=[];
      const visit=(i,carry)=>{const a=this.nodes[i];if(a.l===a.r){values[a.l]=a.s+carry;return;}visit(i*2,carry+a.t);visit(i*2+1,carry+a.t);};
      visit(1,0);return values;
    }
  }
  function treeFrames() {
    const nums=[1,2,1,3,2], frames=[], tree=new SegmentTree(nums.length);
    let r=0,p=-1,previous;
    const capture=(kind,hot,extra)=>{
      const nodes=JSON.parse(JSON.stringify(tree.nodes));
      frames.push({kind,hot,...extra,r,p,nodes,before:previous,values:tree.values()});
      previous=nodes;
    };
    tree.add(0,0);tree.add(0,1);tree.add(1,2);
    r=2;p=0;capture('initial',[],{});
    tree.onEvent=capture;
    r=3;p=-1;tree.add(0,3);frames[frames.length-1].done=true;
    r=4;p=1;tree.add(2,4);frames[frames.length-1].done=true;
    return frames;
  }
  const api={brute,rangeFrames,SegmentTree,treeFrames};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.DistinctCore=api;
})(globalThis);

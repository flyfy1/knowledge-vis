window.WindowCore = (()=>{
 const presets=[{nums:[1,3,-1,-3,5,3,6,7],k:3},{nums:[9,1,2,3],k:2},{nums:[4,4,2,4,1],k:3},{nums:[-5,-2,-7],k:2}];
 function trace(nums,k){let q=[],frames=[{i:-1,q:[],out:[],event:'start'}],out=[]; for(let i=0;i<nums.length;i++){let removed=[]; while(q.length&&q[0]<=i-k){removed.push({i:q.shift(),why:'expired'});} while(q.length&&nums[q[q.length-1]]<=nums[i]){removed.push({i:q.pop(),why:'dominated'});} q.push(i); if(i>=k-1)out.push(nums[q[0]]); frames.push({i,q:q.slice(),out:out.slice(),removed,event:'insert'});} return frames; }
 return {presets,trace};
})();

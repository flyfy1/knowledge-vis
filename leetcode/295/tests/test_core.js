const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync('leetcode/295/solution.py','utf8');
if(!src.includes('class MedianFinder')||!src.includes('heappush')) throw Error('source missing canonical interface');
console.log('source contract checks passed');

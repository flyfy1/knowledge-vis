(function(scope){
'use strict';
const presets=[
 {board:['ab','cd'],words:['ab','abd','ac','aba','ad']},
 {board:['oaan','etae','ihkr','iflv'],words:['oath','pea','eat','rain']},
 {board:['ab','cd'],words:['abcb']},
 {board:['a'],words:['a','aa','b']},
 {board:['aa','aa'],words:['a','aa','aaa','aaaa','aaaaa']},
 {board:['ab'],words:['z']}
];
function trace(input){
 const board=input.board.map(row=>Array.from(row)),words=[...input.words],root={},nodes=[];
 for(const word of words){let node=root,prefix='';for(const ch of word){prefix+=ch;if(!node[ch]){node[ch]={};nodes.push({prefix,node:node[ch]});}node=node[ch];}node.$=word;}
 const all=nodes.map(({prefix,node})=>({prefix,next:Object.keys(node).filter(x=>x!=='$'),word:node.$||null}));
 const frames=[],path=[],found=[];
 function save(kind,detail={},target=null){frames.push(JSON.parse(JSON.stringify({kind,...detail,target,path,found,prefix:path.map(([r,c])=>board[r][c]).join(''),nodes:all.map(n=>({...n,pending:n.word?!!get(n.prefix).$:false}))})));}
 function get(prefix){let n=root;for(const ch of prefix)n=n[ch];return n;}
 function dfs(r,c,parent,prefix){
  const ch=board[r][c],target=[r,c];
  if(path.some(([a,b])=>a===r&&b===c)){save('reuse',{r,c,ch},target);return;}
  if(!parent[ch]){save('reject',{r,c,ch},target);return;}
  const node=parent[ch];path.push([r,c]);save('enter',{r,c,ch,before:prefix},target);
  if(node.$){const word=node.$;delete node.$;found.push(word);save('emit',{word},target);}
  for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0]]){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<board.length&&nc>=0&&nc<board[0].length)dfs(nr,nc,node,prefix+ch);}
  path.pop();save('exit',{r,c,ch},target);
 }
 save('initial');
 for(let r=0;r<board.length;r++)for(let c=0;c<board[0].length;c++)dfs(r,c,root,'');
 save('done');return frames;
}
const api={presets,trace};scope.WordSearchLesson=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

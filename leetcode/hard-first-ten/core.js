/* Pure trace models. Every frame is a deep snapshot, never a mutable view. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const pair=(zh,en)=>[zh,en];
const row=(label,values,active=[],indices)=>({label,values,active,indices});
function recorder(){const frames=[];return {frames,add(frame){frames.push(clone(frame));}};}
const start=pair('初始状态；尚未执行操作。','Initial state; no operation has run.');
function median(input){
  const t=recorder();let [a,b]=input.map(x=>x.slice());if(a.length>b.length)[a,b]=[b,a];
  const m=a.length,n=b.length,half=Math.floor((m+n+1)/2);let lo=0,hi=m,result;
  const emit=(message,code,i=null,j=null)=>t.add({message,code,rows:[row(['较短数组 a','Shorter array a'],a,i===null?[]:[i-1,i]),row(['数组 b','Array b'],b,j===null?[]:[j-1,j])],cuts:i===null?null:[i,j],state:{lo,hi,half,i,j},result});
  emit(start,'lo, hi = 0, m');
  while(lo<=hi){const i=Math.floor((lo+hi)/2),j=half-i,al=i?a[i-1]:-Infinity,ar=i<m?a[i]:Infinity,bl=j?b[j-1]:-Infinity,br=j<n?b[j]:Infinity;
    const boundary=`aL=${al}, aR=${ar}, bL=${bl}, bR=${br}`;
    if(al>br){hi=i-1;emit(pair(`${boundary}。aL > bR：左边太大，i 必须减小。`,`${boundary}. aL > bR: the left side is too large; decrease i.`),'hi = i - 1',i,j);}
    else if(bl>ar){lo=i+1;emit(pair(`${boundary}。bL > aR：a 的左侧太短，i 必须增大。`,`${boundary}. bL > aR: too few values from a on the left; increase i.`),'lo = i + 1',i,j);}
    else{result=(m+n)%2?Math.max(al,bl):(Math.max(al,bl)+Math.min(ar,br))/2;emit(pair(`${boundary}。两条交叉不等式成立；左右已有序。`,`${boundary}. Both cross inequalities hold; every left value is at most every right value.`),'return max(al, bl) if (m + n) % 2 else (max(al, bl) + min(ar, br)) / 2',i,j);break;}
  }return {frames:t.frames,result};
}
function matching(input,wild){
  const [s,p]=input,m=s.length,n=p.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(null)),t=recorder();
  const emit=(i,j,deps,message,code)=>t.add({message,code,matrix:dp,x:['ε',...p],y:['ε',...s],active:[i,j],deps,state:{i,j},result:i===m&&j===n?dp[m][n]:undefined});
  dp[0][0]=true;emit(0,0,[],pair('空串匹配空模式。ε 表示空前缀；· 表示尚未计算。','Empty text matches an empty pattern. ε is an empty prefix; · means not computed.'),'dp[0][0] = True');
  for(let i=1;i<=m;i++){dp[i][0]=false;emit(i,0,[],pair('非空文本不能匹配空模式。','Nonempty text cannot match an empty pattern.'),wild?'current[0] = False':'dp[i][0] = False');}
  for(let j=1;j<=n;j++){const prev=wild?j-1:j-2;dp[0][j]=p[j-1]==='*'&&prev>=0&&dp[0][prev];emit(0,j,prev>=0?[[0,prev]]:[],pair('空文本只能由可省略的星号部分匹配。','Only removable star expressions can match empty text.'),wild?'previous[j] = previous[j - 1] and p[j - 1] == "*"':'dp[0][j] = dp[0][j - 2] if p[j - 1] == "*" else False');}
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
    let deps,message,code;
    if(p[j-1]==='*'){
      if(wild){dp[i][j]=dp[i][j-1]||dp[i-1][j];deps=[[i,j-1],[i-1,j]];message=pair('独立的 *：向左代表匹配零字符；向上代表再吞一个字符。任一来源为真即可。','Standalone *: left means zero characters; above means consume one more. Either true dependency suffices.');code='current[j] = current[j - 1] or previous[j]';}
      else{const match=p[j-2]===s[i-1]||p[j-2]==='.';dp[i][j]=dp[i][j-2]||(match&&dp[i-1][j]);deps=[[i,j-2],[i-1,j]];message=pair(`跳过前一字符和 *：左移两格；重复它：必须字符匹配（${match}），再看上格。`,`Skip the preceding atom and *: move left two cells. Repeat it: the character must match (${match}), then use above.`);code='dp[i][j] = dp[i][j - 2] or (matches and dp[i - 1][j])';}
    }else{const match=p[j-1]===s[i-1]||p[j-1]===(wild?'?':'.');dp[i][j]=match&&dp[i-1][j-1];deps=[[i-1,j-1]];message=pair(`单字符匹配为 ${match}；还必须左上方的两个短前缀能匹配。`,`Single-character compatibility is ${match}; the shorter prefixes at the diagonal must also match.`);code=wild?'current[j] = p[j - 1] in (char, "?") and previous[j - 1]':'dp[i][j] = p[j - 1] in (s[i - 1], ".") and dp[i - 1][j - 1]';}
    emit(i,j,deps,message,code);
  }
  // Empty text/pattern cases may finish during initialization.
  t.frames[t.frames.length-1].result=dp[m][n];
  return {frames:t.frames,result:dp[m][n]};
}
function merge(input){
  const lists=input.map(a=>a.slice()),pos=lists.map(()=>0),heap=[],out=[],t=recorder();
  const less=(a,b)=>a.value<b.value||(a.value===b.value&&a.source<b.source);
  function push(x){heap.push(x);let i=heap.length-1;while(i){const p=(i-1)>>1;if(!less(heap[i],heap[p]))break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p;}}
  function pop(){const x=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;while(true){let a=i*2+1,b=a+1,j=i;if(a<heap.length&&less(heap[a],heap[j]))j=a;if(b<heap.length&&less(heap[b],heap[j]))j=b;if(j===i)break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j;}}return x;}
  lists.forEach((a,source)=>{if(a.length)heap.push({value:a[0],source,index:0});});
  // Bottom-up heap construction mirrors Python heapify's linear-time boundary.
  for(let parent=(heap.length>>1)-1;parent>=0;parent--){let i=parent;while(true){let a=i*2+1,b=a+1,j=i;if(a<heap.length&&less(heap[a],heap[j]))j=a;if(b<heap.length&&less(heap[b],heap[j]))j=b;if(j===i)break;[heap[i],heap[j]]=[heap[j],heap[i]];i=j;}}
  const emit=(message,code,selected)=>t.add({message,code,rows:lists.map((a,i)=>row([`链表 ${i}（节点身份 = 链表:位置）`,`List ${i} (identity = list:position)`],a.map((v,j)=>`${i}:${j} = ${v}`),[pos[i]])),heap,output:out,state:{heads:heap.length},selected});
  emit(pair('每条非空链表只放一个头节点进最小堆；每个父节点不大于孩子。','Put one head per nonempty list into a min-heap; each parent is no greater than its children.'),'heapify(heap)');
  while(heap.length){const x=pop();out.push(`${x.source}:${x.index} = ${x.value}`);pos[x.source]++;emit(pair(`取出 ${x.source}:${x.index}，值 ${x.value}。未取出的后继不会小于各自头节点。`,`Pop ${x.source}:${x.index}, value ${x.value}. No unseen successor is smaller than its own head.`),'_, source, node = heappop(heap)\ntail.next = node\ntail = node',x);
    if(pos[x.source]<lists[x.source].length){push({value:lists[x.source][pos[x.source]],source:x.source,index:pos[x.source]});emit(pair('只补入刚取走节点的后继，再向上交换以恢复堆序。','Insert only that node’s successor, then sift upward to restore heap order.'),'heappush(heap, (node.next.val, source, node.next))');}}
  const actual=out.map(s=>Number(s.split(' = ')[1]));t.frames.at(-1).result=actual;return {frames:t.frames,result:actual};
}
function reverse(input){
  const [values,k]=input,n=values.length,next=Array.from({length:n},(_,i)=>i+1<n?i+1:null);let head=n?0:null,gp=-1,t=recorder();
  const get=id=>id===-1?head:id===null?null:next[id];const set=(id,v)=>{if(id===-1)head=v;else next[id]=v;};
  const emit=(message,code,state={})=>t.add({message,code,links:next,values,head,state:{group_prev:gp,...state}});
  emit(start,'dummy = ListNode(0, head)\ngroup_prev = dummy');
  while(true){let kth=gp;for(let i=0;i<k;i++){kth=get(kth);if(kth===null){emit(pair('不足 k 个节点，停止。剩余指针原样保留。','Fewer than k nodes remain. Stop without changing the suffix.'),'if kth is None: return dummy.next');const result=[];let p=head;while(p!==null){result.push(values[p]);p=next[p];}t.frames.at(-1).result=result;return {frames:t.frames,result};}}
    const gn=get(kth);let prev=gn,curr=get(gp);emit(pair('先确认整组存在。group_next 保存组外后继；反转时不能丢掉它。','Confirm a complete group first. group_next saves the suffix that reversal must retain.'),'group_next = kth.next\nprev, curr = group_next, group_prev.next',{kth,group_next:gn,prev,curr});
    while(curr!==gn){const changed=curr,oldPrev=prev,nxt=get(curr);set(curr,prev);prev=curr;curr=nxt;emit(pair(`节点 #${changed} 的 next 改为 ${oldPrev===null?'∅':'#'+oldPrev}；nxt 保存旧后继。`,`Node #${changed} now points to ${oldPrev===null?'∅':'#'+oldPrev}; nxt preserves the former successor.`),'nxt = curr.next\ncurr.next = prev\nprev, curr = curr, nxt',{kth,group_next:gn,prev,curr,nxt,changed});}
    const old=get(gp);set(gp,kth);gp=old;emit(pair('把前一组接到新的组头。旧组头变成新组尾，继续处理下一组。','Connect the previous group to the new head. The old head becomes the tail for the next group.'),'old_head = group_prev.next\ngroup_prev.next = kth\ngroup_prev = old_head',{kth,group_next:gn});
  }
}
function substring(input){
  const [s,words]=input,w=words[0].length,count=words.length,need={},t=recorder(),answer=[];words.forEach(x=>need[x]=(need[x]||0)+1);
  const emit=(message,code,state,have={})=>t.add({message,code,rows:[row(['字符（下标从 0 开始）','Characters (zero-based indices)'],[...s],Array.from({length:Math.max(0,state.right-state.left)},(_,i)=>state.left+i)),row(['所需单词次数 need','Required word counts: need'],Object.entries(need).map(([k,v])=>`${k}: ${v}`),[],false),row(['当前窗口次数 have','Current window counts: have'],Object.entries(have).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`),[],false)],state,output:answer});
  emit(start,'need = Counter(words)',{offset:0,left:0,right:0,used:0});
  if(w*count>s.length){t.frames.at(-1).result=[];return {frames:t.frames,result:[]};}
  for(let offset=0;offset<w;offset++){let left=offset,used=0,have={};emit(pair(`起点余数为 ${offset}：每次移动 ${w} 个字符。`,`Offset ${offset}: advance by ${w} characters each time.`),'for offset in range(width):',{offset,left,right:left,used});
    for(let right=offset;right+w<=s.length;right+=w){const word=s.slice(right,right+w);
      if(!need[word]){have={};used=0;left=right+w;emit(pair(`${word} 不在字典中，任何跨过它的窗口都不合法；清空。`,`${word} is absent from need; no valid window can cross it. Clear the window.`),'have.clear()\nused = 0\nleft = right + width',{offset,left,right:right+w,used});continue;}
      have[word]=(have[word]||0)+1;used++;emit(pair(`加入 ${word}；现在检查它是否超过所需次数。`,`Add ${word}; now check its multiplicity against need.`),'have[word] += 1\nused += 1',{offset,left,right:right+w,used},have);
      while(have[word]>need[word]){const removed=s.slice(left,left+w);have[removed]--;left+=w;used--;emit(pair(`移走左端 ${removed}；重复次数过多时，必须持续缩窗。`,`Remove leftmost ${removed}; keep shrinking while this word is overrepresented.`),'have[s[left:left + width]] -= 1\nused -= 1\nleft += width',{offset,left,right:right+w,used},have);}
      if(used===count){answer.push(left);emit(pair(`窗口恰好包含全部 ${count} 个词，记录下标 ${left}。`,`The window contains exactly all ${count} words; record index ${left}.`),'answer.append(left)',{offset,left,right:right+w,used},have);have[s.slice(left,left+w)]--;used--;left+=w;emit(pair('移走一个左端词，允许下一次找到重叠答案。','Remove one leftmost word so the next match may overlap.'),'have[s[left:left + width]] -= 1\nused -= 1\nleft += width',{offset,left,right:right+w,used},have);}
    }
  }t.frames.at(-1).result=answer;return {frames:t.frames,result:answer};
}
function parentheses(s){const t=recorder(),stack=[-1];let best=0;
  const emit=(i,message,code,length=0)=>t.add({message,code,rows:[row(['括号与字符下标','Parentheses and character indices'],[...s],[i]),row(['栈：底部边界，其余为未匹配左括号下标','Stack: boundary at bottom, then unmatched opening indices'],stack,[],false)],state:{i,length,best,boundary:stack[0]},span:length?[i-length+1,i]:null});
  emit(-1,pair('−1 是虚拟边界；还没有字符，不是一个括号。','−1 is a virtual boundary before the string, not a parenthesis.'),'stack = [-1]\nbest = 0');
  [...s].forEach((c,i)=>{if(c==='('){stack.push(i);emit(i,pair('左括号暂未匹配，保存下标。','Save the index of this unmatched opening parenthesis.'),'stack.append(i)');}else{stack.pop();if(!stack.length){stack.push(i);emit(i,pair('没有可配对的左括号；当前右括号成为新的无效边界。','No opening parenthesis can pair with this close; it becomes the new invalid boundary.'),'if not stack: stack.append(i)');}else{const length=i-stack.at(-1);best=Math.max(best,length);emit(i,pair(`栈顶 ${stack.at(-1)} 是有效后缀前的边界；长度 ${i} − ${stack.at(-1)} = ${length}。`,`Stack top ${stack.at(-1)} is the boundary before the valid suffix; length ${i} − ${stack.at(-1)} = ${length}.`),'best = max(best, i - stack[-1])',length);}}});t.frames.at(-1).result=best;return {frames:t.frames,result:best};}
function sudoku(input){
  const board=input.map(r=>Array.from(r)),rows=Array.from({length:9},()=>new Set()),cols=Array.from({length:9},()=>new Set()),boxes=Array.from({length:9},()=>new Set()),empty=[],t=recorder();let operations=0;
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){const v=board[r][c],b=Math.floor(r/3)*3+Math.floor(c/3);if(v==='.')empty.push([r,c]);else{rows[r].add(v);cols[c].add(v);boxes[b].add(v);}}
  const emit=(message,code,r=-1,c=-1,pos=0,candidates=[])=>{operations++;if(operations<=180)t.add({message,code,board,state:{r,c,pos,candidates_at_entry:candidates,...(r>=0?{row_used:[...rows[r]].sort(),column_used:[...cols[c]].sort(),box_used:[...boxes[Math.floor(r/3)*3+Math.floor(c/3)]].sort()}: {})},active:[r,c],operations});};
  emit(start,'search(0)');
  function search(pos){if(pos===empty.length)return true;const [r,c]=empty[pos],box=Math.floor(r/3)*3+Math.floor(c/3),candidates=[...'123456789'].filter(v=>!rows[r].has(v)&&!cols[c].has(v)&&!boxes[box].has(v));
    emit(pair(`格 (${r},${c}) 的候选 = 1…9 去掉行、列、宫已用数。`,`Candidates at (${r},${c}) = 1…9 minus values used by its row, column, and box.`),'if value in rows[r] or value in cols[c] or value in boxes[box]: continue',r,c,pos,candidates);
    for(const v of candidates){board[r][c]=v;rows[r].add(v);cols[c].add(v);boxes[box].add(v);emit(pair(`尝试 ${v}；同时登记行、列、宫。局部合法不保证后续可解。`,`Try ${v}; register it in row, column, and box. Local validity does not guarantee completion.`),'board[r][c] = value\nrows[r].add(value)\ncols[c].add(value)\nboxes[box].add(value)',r,c,pos,candidates);
      if(search(pos+1))return true;board[r][c]='.';rows[r].delete(v);cols[c].delete(v);boxes[box].delete(v);emit(pair(`撤销 ${v}：棋盘和三个集合全部恢复，再试下一个候选。`,`Undo ${v}: restore the board and all three sets before the next candidate.`),'board[r][c] = "."\nrows[r].remove(value)\ncols[c].remove(value)\nboxes[box].remove(value)',r,c,pos,candidates);}
    return false;
  }
  const solved=search(0);t.add({message:operations>180?pair(`共有 ${operations} 个事件；展示前 180 个后直接到终局，中间事件省略。`,`There are ${operations} events. After the first 180, this view jumps to the final board; intermediate events are omitted.`):pair('所有空格已填；逐行、逐列、逐宫核对。','All empty cells are filled; check every row, column, and box.'),code:'search(0)',board,state:{solved,operations},result:board});return {frames:t.frames,result:board,operations};
}
function missing(input){const a=input.slice(),n=a.length,t=recorder();
  const emit=(message,code,i=-1,target=-1)=>t.add({message,code,rows:[row(['nums：下标 i 的目标值是 i+1','nums: index i should contain i+1'],a,[i,target]),row(['每个位置应有的数','Expected value at each position'],Array.from({length:n},(_,i)=>i+1))],state:{i,target}});
  emit(start,'n = len(nums)');
  for(let i=0;i<n;i++){while(a[i]>=1&&a[i]<=n&&a[a[i]-1]!==a[i]){const target=a[i]-1,v=a[i];[a[i],a[target]]=[a[target],a[i]];emit(pair(`把 ${v} 放到位置 ${target}；当前位置换来的数仍需检查。`,`Place ${v} at index ${target}; recheck the value brought into the current slot.`),'target = nums[i] - 1\nnums[i], nums[target] = nums[target], nums[i]',i,target);}emit(pair('越界数忽略；目标已有相同数则停，避免重复值来回交换。','Ignore out-of-range values; stop if the target already contains this value, avoiding duplicate cycles.'),'while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:',i);}
  let result=n+1;for(let i=0;i<n;i++)if(a[i]!==i+1){result=i+1;break;}emit(pair(`扫描第一个 nums[i] ≠ i+1；若没有缺口，答案是 n+1。`,`Scan for the first nums[i] ≠ i+1; if every slot is filled, return n+1.`),'if value != i + 1: return i + 1\n# otherwise return n + 1');t.frames.at(-1).result=result;return {frames:t.frames,result};}
function rain(height){let left=0,right=height.length-1,left_max=0,right_max=0,water=0;const t=recorder(),settled=height.map(()=>null);
  const emit=(message,code,at=-1)=>t.add({message,code,bars:height,settled,active:at,state:{left,right,left_max,right_max,water}});
  emit(start,'left, right = 0, len(height) - 1\nleft_max = right_max = water = 0');
  while(left<=right){left_max=Math.max(left_max,height[left]);right_max=Math.max(right_max,height[right]);const useLeft=left_max<=right_max,at=useLeft?left:right,level=useLeft?left_max:right_max;settled[at]=level-height[at];water+=settled[at];if(useLeft)left++;else right--;emit(pair(`${useLeft?'左':'右'}侧已知最高墙 ${level} 较低；另一侧已有至少这么高的墙，当前位置水量确定为 ${settled[at]}。`,`${useLeft?'Left':'Right'} maximum ${level} is the lower bound. The opposite side already has a wall at least this high; this position traps ${settled[at]}.`),useLeft?'water += left_max - height[left]\nleft += 1':'water += right_max - height[right]\nright -= 1',at);}
  emit(pair('所有位置均已结算；青色块的数量相加就是总水量。','Every position is settled; sum the cyan water blocks.'),'return water');t.frames.at(-1).result=water;return {frames:t.frames,result:water};}
const api={4:median,10:x=>matching(x,false),23:merge,25:reverse,30:substring,32:parentheses,37:sudoku,41:missing,42:rain,44:x=>matching(x,true)};
if(typeof module!=='undefined')module.exports=api;else root.HardModels=api;
})(typeof window==='undefined'?globalThis:window);

'use strict';
(() => {
  const ui = LeetCodeLocale({
    docTitle:['LeetCode · 一步一步想出来','LeetCode · Reason Your Way to the Solution'],
    back:['← 知识索引','← Knowledge Index'],
    title:['答案，一步一步想出来','Reason your way to the solution'],
    intro:['先观察一个小例子，再猜规律、找反例、推公式，最后把想法写成代码。每题都是一篇可以动手验证的知识讲解。','Observe a small example, make a prediction, test it, derive the rule, and turn it into code. Each problem becomes a lesson you can explore.'],
    path:['学习路线：读懂题目 → 手算 → 暴力解法 → 找出重复工作 → 推导优化 → 实现 → 自己验证。','The learning path: understand → work by hand → brute force → identify repeated work → derive an improvement → implement → verify.'],
    official:['LeetCode 原题 ↗','View on LeetCode ↗'],hard:['困难','Hard'],open:['开始推导 →','Explore the lesson →'],
    footer:['visual.integ.life · LeetCode 专区 · 优先使用 Python / TypeScript；必要时使用题目要求的语言','visual.integ.life · LeetCode collection · Python / TypeScript preferred; the required language where needed'],
    searchLabel:['查找课程','Find a lesson'],
    searchHelp:['输入准确题号（如 #51）、中英文题名或知识点。多个词用空格分隔，需同时匹配。','Enter an exact ID (such as #51), a title in either language, or a topic. Space-separated words must all match.'],
    clear:['清空搜索','Clear search'],
    count:['找到 {shown} / {total} 篇可用课程','{shown} of {total} available lessons'],
    noMatches:['没有匹配的课程。试试题号、题名或知识点，或清空搜索。','No matching lessons. Try an ID, title or topic, or clear the search.'],
    emptyCollection:['课程列表目前为空。','This collection currently has no lessons.'],
    loadError:['暂时无法读取课程列表。请重新加载页面。','The lesson list could not be loaded. Please reload the page.'],
    reload:['重新加载','Reload']
  });
  const input=document.getElementById('problemSearch');
  const list=document.getElementById('problemList');
  const count=document.getElementById('resultCount');
  const empty=document.getElementById('emptyResults');
  const error=document.getElementById('loadError');
  const bilingual=value=>value&&['zh','en'].every(lang=>typeof value[lang]==='string');
  const problems=window.LEETCODE_PROBLEMS;
  const valid=Array.isArray(problems)&&problems.every(p=>p&&Number.isInteger(p.id)&&p.id>0&&bilingual(p.title)&&bilingual(p.desc)&&Array.isArray(p.topics)&&p.topics.every(bilingual)&&p.difficulty==='hard'&&['path','leetcodeUrl','language','complexity'].every(key=>typeof p[key]==='string'));
  const normalize=value=>value.normalize('NFKC').toLowerCase();
  const searchable=valid?problems.map(p=>normalize([p.title.zh,p.title.en,...p.topics.flatMap(t=>[t.zh,t.en])].join(' '))):[];
  let cards=[];
  let composing=false;
  function readQuery(){input.value=new URL(location.href).searchParams.get('q')||'';}
  function saveQuery(){
    const url=new URL(location.href);
    if(input.value)url.searchParams.set('q',input.value);else url.searchParams.delete('q');
    // Search still works when an embedded browser refuses URL mutation.
    try{history.replaceState(history.state,'',url);}catch(_){}
  }
  function filter(){
    if(!valid)return;
    const query=normalize(input.value.trim());
    const id=/^#?\d+$/.test(query)?Number(query.replace(/^#/,'')):null;
    const tokens=query.split(/\s+/).filter(Boolean);
    let shown=0;
    cards.forEach((card,i)=>{
      const matches=id!==null?problems[i].id===id:tokens.every(token=>searchable[i].includes(token));
      card.hidden=!matches;if(matches)shown++;
    });
    count.textContent=ui.t('count',{shown,total:problems.length});
    empty.hidden=shown>0;
    empty.textContent=ui.t(problems.length?'noMatches':'emptyCollection');
  }
  function render(){
    list.replaceChildren();cards=[];
    document.querySelector('.collection-search').hidden=!valid;
    count.hidden=!valid;error.hidden=valid;
    document.getElementById('reloadCollection').href=location.href;
    if(!valid){empty.hidden=true;return;}
    const fragment=document.createDocumentFragment();
    for(const p of problems){
      const card=document.createElement('article');card.className='problem-card';card.dataset.problemId=p.id;
      const meta=document.createElement('div');meta.className='meta';
      for(const label of [ui.t(p.difficulty),p.language,p.complexity]){const span=document.createElement('span');span.className='badge';span.textContent=label;meta.append(span);}
      const h=document.createElement('h2'),titleLink=document.createElement('a');titleLink.className='lesson-link';titleLink.href=p.path;
      const number=document.createElement('span');number.className='problem-number';number.textContent='#'+p.id;
      titleLink.append(number,document.createTextNode(' · '+p.title[ui.getLang()]));h.append(titleLink);
      const desc=document.createElement('p');desc.textContent=p.desc[ui.getLang()];
      const tags=document.createElement('div');tags.className='topic-tags';
      for(const topic of p.topics){const span=document.createElement('span');span.className='topic-tag';span.textContent=topic[ui.getLang()];tags.append(span);}
      const actions=document.createElement('div');actions.className='problem-actions';
      const open=document.createElement('a');open.href=p.path;open.textContent=ui.t('open');
      const official=document.createElement('a');official.className='official-link';official.href=p.leetcodeUrl;official.target='_blank';official.rel='noopener noreferrer';official.textContent=ui.t('official');official.setAttribute('aria-label','#'+p.id+' · '+ui.t('official'));
      actions.append(open,official);card.append(meta,h,desc,tags,actions);fragment.append(card);cards.push(card);
    }
    list.append(fragment);filter();
  }
  input.addEventListener('compositionstart',()=>{composing=true;});
  input.addEventListener('compositionend',()=>{composing=false;saveQuery();filter();});
  input.addEventListener('input',event=>{if(composing||event.isComposing)return;saveQuery();filter();});
  document.getElementById('clearSearch').addEventListener('click',()=>{input.value='';composing=false;saveQuery();filter();input.focus();});
  window.addEventListener('popstate',()=>{readQuery();filter();});
  readQuery();ui.onChange(render);ui.init();
})();

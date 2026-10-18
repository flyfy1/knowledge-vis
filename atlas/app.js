(() => {
  'use strict';
  const D = window.ATLAS;
  document.documentElement.style.setProperty('--group-count',D.groups.length);
  document.documentElement.style.setProperty('--map-min-width',`${D.groups.length*216}px`);
  const $ = id => document.getElementById(id);
  const STR = {
    en:{back:'← Knowledge Index',eyebrow:'KNOWLEDGE ATLAS / 01',title:'Mathematics & Physics',intro:'A first map of waves, circuits, systems and measurement. Follow a connection, understand why it exists, then explore the idea.',routes:'Start with a question',explore:'Explore the connections',graph:'Map',list:'List',searchLabel:'Find a concept',groupLabel:'Region',reset:'Clear filters',invalid:'This link contains an unknown selection. Showing Fourier analysis; you can choose another concept.',mapHelp:'Select a concept to reveal its connections. Numbers match the explanations. Positions group topics; distances have no numerical meaning.',mapFooter:'Arrows follow the written relation. They do not imply a required learning order.',emptyTitle:'No matching concepts',emptyBody:'Try another term, or clear the filters to see the full map.',scope:'An editorial map, not a complete curriculum. Connections are curated and linked to explanations. External readings are marked separately from interactive lessons.',allLessons:'Browse all interactive lessons →',placeholder:'Fourier, waves, uncertainty…',all:'All regions',concepts:'concepts',connections:'connections',regions:'regions',matches:'matching concepts',selected:'Selected',related:'Connection',hint:'Explore concept',route:'Suggested route',routeHint:'An editorial sequence, not a prerequisite rule.',closeRoute:'Close route',openLesson:'Open interactive lesson →',readSource:'Read textbook explanation ↗',external:'External reading · no interactive lesson here yet',internal:'Opens the relevant section in an existing lesson.',relatedTitle:'Why these concepts connect',evidence:'Read the supporting explanation →',externalEvidence:'Read the external source ↗',exploreNode:'Explore',outside:'The selected concept is outside these results. Its explanation remains open.',viewLabel:'View',mapLabel:'Knowledge map. Scroll horizontally for more topics.',counts:'{n} concepts · {e} connections\n{g} regions · curated with sources',status:'{n} matching concepts · selected: {title}',initialNote:'Waves, circuits, systems and measurement',trailStop:'Stop',outsideTag:'Outside results',mapContext:'The map keeps all concepts for context. Nonmatching concepts are labelled Outside results; List shows only matches.'},
    zh:{back:'← 知识索引',eyebrow:'知识地图 / 01',title:'数学与物理',intro:'从波动、电路、系统与测量开始。沿一条关系，弄懂两个概念为什么相连，再进入交互讲解。',routes:'从一个问题开始',explore:'探索概念之间的联系',graph:'地图',list:'列表',searchLabel:'寻找一个概念',groupLabel:'主题区域',reset:'清除筛选',invalid:'链接中的概念不存在，已显示傅里叶分析。你可以选择其他概念。',mapHelp:'选择一个概念，显示它的直接联系。编号对应右侧或下方的解释。位置按主题编排，距离不代表数值。',mapFooter:'箭头方向对应关系陈述，不代表必须遵循的学习顺序。',emptyTitle:'没有匹配的概念',emptyBody:'换一个关键词，或清除筛选，重新查看完整地图。',scope:'这是一张人工编排的地图，尚未覆盖完整课程。每条关系都附有解释依据，外部阅读与站内交互讲解分别标注。',allLessons:'浏览全部交互讲解 →',placeholder:'傅里叶、波动、不确定性……',all:'全部区域',concepts:'个概念',connections:'条关系',regions:'个区域',matches:'个匹配概念',selected:'当前选择',related:'关系',hint:'探索概念',route:'建议路线',routeHint:'这是建议的探索顺序，不是必修先后关系。',closeRoute:'收起路线',openLesson:'打开交互讲解 →',readSource:'阅读教材解释 ↗',external:'外部阅读 · 暂无本站交互讲解',internal:'直接进入已有知识页的相关章节。',relatedTitle:'这些概念为什么相连',evidence:'查看解释依据 →',externalEvidence:'查看外部来源 ↗',exploreNode:'探索',outside:'当前概念不在筛选结果内，已保留它的解释。',viewLabel:'显示方式',mapLabel:'知识地图。可横向滚动查看其他主题。',counts:'{n} 个概念 · {e} 条关系\n{g} 个主题区域 · 人工编排并附来源',status:'{n} 个匹配概念 · 当前：{title}',initialNote:'波动、电路、系统与测量',trailStop:'第',outsideTag:'不在结果内',mapContext:'地图保留全部概念作为上下文；不匹配项标注“不在结果内”，列表只显示匹配结果。'}
  };
  let lang;
  try { lang = localStorage.getItem('knowledge-lang'); } catch (_) {}
  if (!['en','zh'].includes(lang)) lang = (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const pick = value => typeof value === 'string' ? value : value[lang];
  const t = key => STR[lang][key];
  const byId = new Map(D.nodes.map(n => [n.id,n]));
  const elements = new Map(), results = new Map(), disclosures = new Map();
  const external = href => /^https:\/\//.test(href);
  const make = (tag,className,text) => {const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
  const button = (text,fn,className) => {const e=make('button',className,text);e.type='button';e.addEventListener('click',fn);return e;};
  const sourceLink = (href,label,className) => {const a=make('a',className,label);a.href=href;return a;};
  let invalid = false, state;
  function readState() {
    const p = new URLSearchParams(location.search), id=p.get('node') || 'fourier';
    invalid = !byId.has(id);
    return {node:byId.has(id)?id:'fourier',q:(p.get('q')||'').slice(0,160),group:D.groups.some(g=>g.id===p.get('group'))?p.get('group'):'all',trail:D.trails.some(r=>r.id===p.get('trail'))?p.get('trail'):'',view:['graph','list'].includes(p.get('view'))?p.get('view'):(matchMedia('(max-width:700px)').matches?'list':'graph')};
  }
  state=readState();
  function save(push=false) {
    const u=new URL(location.href);u.search='';u.searchParams.set('node',state.node);u.searchParams.set('view',state.view);
    for(const key of ['q','trail'])if(state[key])u.searchParams.set(key,state[key]);
    if(state.group!=='all')u.searchParams.set('group',state.group);
    try {history[push?'pushState':'replaceState']({},'',u);}catch(_){}
  }
  function select(id,{clear=false,focus=false}={}) {
    state.node=id;invalid=false;
    if(clear){state.q='';state.group='all';}
    save(true);render();
    const stacked=matchMedia('(max-width:1000px)').matches;
    if(focus||stacked)$('detailTitle').focus({preventScroll:true});
    if(stacked)$('detail').scrollIntoView({block:'start',behavior:'instant'});
  }
  function clearFilters(focus=false){state.q='';state.group='all';save();render();if(focus)$('search').focus();}
  D.groups.forEach(g=>{
    const col=make('section','region');col.dataset.group=g.id;
    const title=make('h3');title.dataset.groupTitle=g.id;col.append(title);
    D.nodes.filter(n=>n.group===g.id).forEach(n=>{
      const e=button('',()=>select(n.id),'node');e.dataset.node=n.id;
      e.append(make('strong'),make('small'));col.append(e);elements.set(n.id,e);
    });$('columns').append(col);
  });
  const allOption=make('option');allOption.value='all';$('group').append(allOption);
  D.groups.forEach(g=>{const e=make('option');e.value=g.id;$('group').append(e);});
  D.nodes.forEach(n=>{
    const e=button('',()=>select(n.id,{focus:true}),'result');e.dataset.result=n.id;e.append(make('strong'),make('small'));$('results').append(e);results.set(n.id,e);
  });
  D.trails.forEach((r,i)=>{
    const e=button('',()=>{state.trail=state.trail===r.id?'':r.id;if(state.trail){state.node=r.nodes[0];state.q='';state.group='all';}invalid=false;save(true);render();});
    e.dataset.trail=r.id;e.append(make('strong'),make('span'));$('routes').append(e);
  });
  function matching() {
    const q=state.q.trim().toLocaleLowerCase();
    return D.nodes.filter(n=>(state.group==='all'||n.group===state.group)&&(!q||[n.title.zh,n.title.en,n.description.zh,n.description.en].join(' ').toLocaleLowerCase().includes(q)));
  }
  function activeEdges(){return D.edges.filter(e=>e.from===state.node||e.to===state.node);}
  function renderDetail(matches,edges){
    const n=byId.get(state.node), d=$('detail');d.replaceChildren();
    d.append(make('p','detail-kicker',pick(D.groups.find(g=>g.id===n.group).label)));
    const h=make('h2','',pick(n.title));h.id='detailTitle';h.tabIndex=-1;d.append(h,make('p','definition',pick(n.description)));
    const formulas={
      'time ↔ frequency':{zh:'时域 ↔ 频域',en:'time ↔ frequency'},'drive → response peak':{zh:'驱动 → 响应峰值',en:'drive → response peak'},
      'linear + time invariant':{zh:'线性 + 时不变',en:'linear + time invariant'},'measure → compare → act':{zh:'测量 → 比较 → 调整',en:'measure → compare → act'},
      'posterior ∝ likelihood × prior':{zh:'后验 ∝ 似然 × 先验',en:'posterior ∝ likelihood × prior'},'estimate = sample average':{zh:'估计值 = 样本平均',en:'estimate = sample average'},'predict → correct':{zh:'预测 → 修正',en:'predict → correct'}
    };
    d.append(make('p','formula',formulas[n.formula]?pick(formulas[n.formula]):n.formula));
    d.append(sourceLink(n.source,external(n.source)?t('readSource'):t('openLesson'),'primary-link'),make('p','source-note',external(n.source)?t('external'):t('internal')));
    if(!matches.some(x=>x.id===n.id)){
      const note=make('div','outside-note');note.append(make('p','',t('outside')),button(t('reset'),()=>clearFilters(true)));d.append(note);
    }
    const heading=make('h3','relation-heading',`${t('relatedTitle')} · ${edges.length}`);d.append(heading);
    const list=make('ol','relations');
    if(!disclosures.has(n.id)){const preferred=edges.find(x=>x.from==='fourier'&&x.to==='convolution')||edges[0];disclosures.set(n.id,new Set(preferred?[`${preferred.from}:${preferred.to}`]:[]));}
    edges.forEach((e,i)=>{
      const wrapper=make('li');const item=make('details','relation');item.dataset.edge=`${e.from}:${e.to}`;
      item.open=disclosures.get(n.id).has(item.dataset.edge);
      item.addEventListener('toggle',()=>{const set=disclosures.get(n.id);if(item.open)set.add(item.dataset.edge);else set.delete(item.dataset.edge);});
      const summary=make('summary');summary.append(make('span','relation-type',`${i+1} / ${pick(D.types[e.type])}`));
      const s=make('span','relation-statement');s.append(document.createTextNode(pick(byId.get(e.from).title)+' → '),make('span','verb',pick(e.label)),document.createTextNode(' → '+pick(byId.get(e.to).title)));
      summary.append(s);item.append(summary,make('p','',pick(e.reason)));
      const other=e.from===n.id?e.to:e.from;
      const explore=button(`${t('exploreNode')} ${pick(byId.get(other).title)} →`,()=>select(other,{clear:true,focus:true}));explore.dataset.target=other;item.append(explore);
      item.append(sourceLink(e.source,external(e.source)?t('externalEvidence'):t('evidence'),'evidence-link'));wrapper.append(item);list.append(wrapper);
    });d.append(list);
  }
  function renderTrail(){
    const box=$('trail'),r=D.trails.find(r=>r.id===state.trail);box.hidden=!r;box.replaceChildren();if(!r)return;
    box.append(make('p','trail-label',`${t('route')} · ${t('routeHint')}`));
    const stops=make('div','trail-stops');r.nodes.forEach((id,i)=>{
      const e=button(`${i+1}. ${pick(byId.get(id).title)}`,()=>select(id,{clear:true,focus:true}));e.setAttribute('aria-pressed',String(id===state.node));stops.append(e);
    });box.append(stops);
  }
  let frame;
  function render(){
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('title')+' · '+t('eyebrow');
    document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=t(e.dataset.i18n));
    document.querySelectorAll('[data-lang]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.lang===lang)));
    $('counts').textContent=t('counts').replace('{n}',D.nodes.length).replace('{e}',D.edges.length).replace('{g}',D.groups.length);
    $('search').placeholder=t('placeholder');$('search').value=state.q;$('group').value=state.group;
    [...$('group').options].forEach(e=>e.textContent=e.value==='all'?t('all'):pick(D.groups.find(g=>g.id===e.value).label));
    $('viewToggle').setAttribute('aria-label',t('viewLabel'));$('mapScroll').setAttribute('aria-label',t('mapLabel'));
    document.querySelectorAll('[data-view]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.view===state.view)));
    document.querySelectorAll('[data-group-title]').forEach(e=>{const g=D.groups.find(g=>g.id===e.dataset.groupTitle);e.replaceChildren(make('span','',g.mark),document.createTextNode(pick(g.label)));});
    if(state.q||state.group!=='all')document.querySelector('[data-i18n=mapHelp]').textContent=t('mapHelp')+' '+t('mapContext');
    const matches=matching(),ids=new Set(matches.map(n=>n.id)),edges=activeEdges(),neighbors=new Map();
    edges.forEach((e,i)=>neighbors.set(e.from===state.node?e.to:e.from,i+1));
    D.nodes.forEach(n=>{
      const e=elements.get(n.id), selected=n.id===state.node, number=neighbors.get(n.id);
      e.querySelector('strong').textContent=pick(n.title);e.querySelector('small').textContent=(selected?t('selected'):number?`${t('related')} ${number}`:t('hint'))+(!ids.has(n.id)?` · ${t('outsideTag')}`:'');
      e.setAttribute('aria-pressed',String(selected));e.classList.toggle('neighbor',!!number);e.classList.toggle('outside',!ids.has(n.id));
      const result=results.get(n.id);result.hidden=!ids.has(n.id);result.querySelector('strong').textContent=pick(n.title);result.querySelector('small').textContent=pick(n.description);result.setAttribute('aria-pressed',String(selected));
    });
    document.querySelectorAll('[data-trail]').forEach(e=>{const r=D.trails.find(r=>r.id===e.dataset.trail);e.setAttribute('aria-pressed',String(state.trail===r.id));e.querySelector('strong').textContent=pick(r.title);e.querySelector('span').textContent=`${t('route')} · ${r.nodes.length} ${t('concepts')}`;});
    $('status').textContent=t('status').replace('{n}',matches.length).replace('{title}',pick(byId.get(state.node).title));
    $('invalid').hidden=!invalid;$('empty').hidden=matches.length!==0;
    $('graphView').hidden=state.view!=='graph'||!matches.length;$('listView').hidden=state.view!=='list'||!matches.length;
    renderDetail(matches,edges);renderTrail();cancelAnimationFrame(frame);frame=requestAnimationFrame(drawEdges);
  }
  const NS='http://www.w3.org/2000/svg';
  function svg(tag,attrs){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);return e;}
  function drawEdges(){
    if($('graphView').hidden)return;
    const root=$('connections'),box=$('map').getBoundingClientRect();root.replaceChildren();root.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    const defs=svg('defs',{}),marker=svg('marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'});
    marker.append(svg('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:'var(--cyan)'}));defs.append(marker);root.append(defs);
    activeEdges().forEach((e,i)=>{
      const a=elements.get(e.from).getBoundingClientRect(),b=elements.get(e.to).getBoundingClientRect();
      const same=Math.abs(a.left-b.left)<2,forward=a.left<b.left;
      let x1=(same?a.right:forward?a.right:a.left)-box.left,y1=a.top+a.height/2-box.top;
      let x2=(same?b.right:forward?b.left:b.right)-box.left,y2=b.top+b.height/2-box.top;
      let cx1,cx2;
      if(same){cx1=x1+18;cx2=x2+18;}else{cx1=x1+(forward?24:-24);cx2=x2+(forward?-24:24);}
      const path=svg('path',{d:`M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`,class:'edge-path','marker-end':'url(#arrow)'});root.append(path);
      const mx=(x1+3*cx1+3*cx2+x2)/8,my=(y1+y2)/2;
      const g=svg('g',{class:'edge-number',transform:`translate(${mx},${my})`});g.append(svg('circle',{r:10}));const label=svg('text',{});label.textContent=i+1;g.append(label);root.append(g);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(e=>e.addEventListener('click',()=>{lang=e.dataset.lang;try{localStorage.setItem('knowledge-lang',lang);}catch(_){}render();}));
  document.querySelectorAll('[data-view]').forEach(e=>e.addEventListener('click',()=>{state.view=e.dataset.view;save();render();}));
  $('search').addEventListener('input',()=>{state.q=$('search').value;state.view='list';save();render();});
  $('group').addEventListener('change',()=>{state.group=$('group').value;state.view='list';save();render();});
  $('reset').addEventListener('click',()=>clearFilters());$('emptyReset').addEventListener('click',()=>clearFilters(true));
  addEventListener('popstate',()=>{state=readState();render();});
  addEventListener('resize',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(drawEdges);});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(drawEdges);}).observe($('map'));
  render();
})();

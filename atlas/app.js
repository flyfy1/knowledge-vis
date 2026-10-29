(() => {
  'use strict';
  const D = window.ATLAS;
  document.documentElement.style.setProperty('--group-count',D.groups.length);
  document.documentElement.style.setProperty('--map-min-width',`${D.groups.length*216}px`);
  const $ = id => document.getElementById(id);
  const STR = {
    en:{readingStart:"Optional start: {concept} →",readingTry:"Check with the existing projection experiment →",readingSource:"OpenStax University Physics15.3 · circular projection and harmonic motion ↗",taskLabel:"Try this station · no completion tracking",taskOpen:"Open this experiment →",taskObserve:"Compare your prediction · what to look for and why",taskSource:"Read the claim’s supporting source ↗",taskPrevious:"← Previous concept",taskNext:"Next concept →",workName:'Work & energy',workOpen:'Integrate spring work & compare energy changes →',"foundationsSummary":"Starting ideas · expand when useful","foundationsIntro":"Revisit a definition or decode a symbol, then return to the same question.","foundationsInspect":"Inspect this concept →","foundationsSource":"Open its lesson or textbook →","foundationsEvidence":"Read the supporting source ↗","checkTitle":"Predict first · ideal free spring","checkScope":"Assume A>0, m>0, k>0: an ideal horizontal spring, no damping and no sustained driving.","checkQuestion":"As the block crosses equilibrium x=0, must its velocity also be zero? Predict before opening the explanation.","checkReveal":"Reveal the explanation & a way to check","checkAnswer":"No. At that instant spring force and acceleration x″ are zero, but speed |v|=Aω>0. Velocity x′ can have either sign. Zero acceleration at one instant does not imply uniform motion afterward. Zero-amplitude rest is outside this question.","checkVerify":"Open slopes view, keeping phase; then choose “Cross”","returnExperiment":"Return to current experiment: {name} →","projectionName":"Circle projection","ratesName":"Slopes & net force","travelName":"Signed area & travel","responseName":"Driven steady response","trailContext":"You are viewing “{node}”, which is outside this route. You can also select one of this route’s concepts to inspect its explanation.",travelOpen:'Signed area: compare displacement & distance →',motionOpen:'Free motion: try the circle projection →',ratesOpen:'Rates & net force: inspect signed slopes →',responseOpen:'Driven response: compare damping, peaks & poles →',motionReading:'External textbook; an associated experiment is also available here.',back:'← Knowledge Index',eyebrow:'KNOWLEDGE ATLAS / 01',title:'Mathematics & Physics',intro:'Connect mathematics and geometry with motion, light, waves, circuits and measurement. Choose a question, inspect the concepts behind it, and try the linked experiment or lesson.',routes:'Start with a question',questions:'Questions to start from',moreQuestions:'More questions',openStep:'Open this step →',questionReveal:'Think first, then reveal',stageLabel:'Stage',allStages:'All stages',stagePrimary:'Primary',stageJunior:'Junior',stageSenior:'Senior',stageUniversity:'University',explore:'Explore the connections',graph:'Map',list:'List',searchLabel:'Find a concept',groupLabel:'Region',reset:'Clear filters',invalid:'This link contains an unknown selection. Showing Fourier analysis; you can choose another concept.',mapHelp:'Select a concept to reveal its connections. Numbers match the explanations. Positions group topics; distances have no numerical meaning.',mapFooter:'Arrows follow the written relation. They do not imply a required learning order.',emptyTitle:'No matching concepts',emptyBody:'Try another term, or clear the filters to see the full map.',scope:'An editorial map, not a complete curriculum. Connections are curated and linked to explanations. External readings are marked separately from interactive lessons.',allLessons:'Browse all interactive lessons →',placeholder:'Fourier, waves, uncertainty…',all:'All regions',concepts:'concepts',connections:'connections',regions:'regions',matches:'matching concepts',selected:'Selected',related:'Connection',hint:'Explore concept',route:'Suggested route',routeHint:'An editorial sequence, not a prerequisite rule.',closeRoute:'Close route',openLesson:'Open interactive lesson →',readSource:'Read textbook explanation ↗',external:'External reading · no interactive lesson here yet',internal:'Opens the relevant section in an existing lesson.',relatedTitle:'Why these concepts connect',evidence:'Read the supporting explanation →',externalEvidence:'Read the external source ↗',exploreNode:'Explore',outside:'The selected concept is outside these results. Its explanation remains open.',viewLabel:'View',mapLabel:'Knowledge map. Scroll horizontally for more topics.',counts:'{n} concepts · {e} connections\n{g} regions · curated with sources',status:'{n} matching concepts · selected: {title}',initialNote:'Waves, circuits, systems and measurement',trailStop:'Stop',outsideTag:'Outside results',mapContext:'The map keeps all concepts for context. Nonmatching concepts are labelled Outside results; List shows only matches.'},
    zh:{readingStart:"可先看：{concept} →",readingTry:"用已有的投影实验核对 →",readingSource:"OpenStax大学物理15.3 · 圆周投影与简谐振动 ↗",taskLabel:"本站实验任务 · 不记录掌握状态",taskOpen:"打开本站对应实验 →",taskObserve:"核对预测 · 该看什么，为什么",taskSource:"查看这条解释的依据 ↗",taskPrevious:"← 上一个概念",taskNext:"下一个概念 →",workName:'功与能量',workOpen:'对位移积分求弹簧功，核对能量变化 →',"foundationsSummary":"起步提示 · 按需展开","foundationsIntro":"回看一个定义或读懂一个符号，再回到同一个问题。","foundationsInspect":"查看这个概念 →","foundationsSource":"打开对应课程或教材 →","foundationsEvidence":"查看解释依据 ↗","checkTitle":"先预测 · 理想自由弹簧","checkScope":"条件：A>0、m>0、k>0；理想水平弹簧，无阻尼、无持续驱动。","checkQuestion":"物块经过平衡位置 x=0 时，速度也一定为零吗？先预测，再展开解释。","checkReveal":"展开解释与核对方法","checkAnswer":"不是。按本题条件，过平衡点时弹簧力和加速度 x″ 为零，速率却是 |v|=Aω>0。速度 x′ 的方向可正可负。一个瞬间加速度为零，不代表以后一直匀速。零振幅静止不在本题条件内。","checkVerify":"打开斜率视图并保留相位，再选“过平衡点”","returnExperiment":"回到当前实验：{name} →","projectionName":"圆周投影","ratesName":"斜率与净力","travelName":"有符号面积与路程","responseName":"受迫稳态响应","trailContext":"当前查看的「{node}」不在本路线中。也可选择本路线中的概念，查看对应解释。",travelOpen:'有符号面积：比较位移与路程 →',motionOpen:'自由运动：验证圆周投影 →',ratesOpen:'斜率与净力：比较带方向的变化率 →',responseOpen:'受迫响应：对比阻尼、峰值与极点 →',motionReading:'外部教材；本站也提供关联实验。',back:'← 知识索引',eyebrow:'知识地图 / 01',title:'数学与物理',intro:'把数学、几何与运动、光、波动、电路和测量联系起来。先选一个问题，查看背后的概念，再进入关联实验或课程。',routes:'从一个问题开始',questions:'从问题开始',moreQuestions:'更多问题',openStep:'打开这一步 →',questionReveal:'先想一想，再揭晓',stageLabel:'学段',allStages:'全部学段',stagePrimary:'小学',stageJunior:'初中',stageSenior:'高中',stageUniversity:'大学',explore:'探索概念之间的联系',graph:'地图',list:'列表',searchLabel:'寻找一个概念',groupLabel:'主题区域',reset:'清除筛选',invalid:'链接中的概念不存在，已显示傅里叶分析。你可以选择其他概念。',mapHelp:'选择一个概念，显示它的直接联系。编号对应右侧或下方的解释。位置按主题编排，距离不代表数值。',mapFooter:'箭头方向对应关系陈述，不代表必须遵循的学习顺序。',emptyTitle:'没有匹配的概念',emptyBody:'换一个关键词，或清除筛选，重新查看完整地图。',scope:'这是一张人工编排的地图，尚未覆盖完整课程。每条关系都附有解释依据，外部阅读与站内交互讲解分别标注。',allLessons:'浏览全部交互讲解 →',placeholder:'傅里叶、波动、不确定性……',all:'全部区域',concepts:'个概念',connections:'条关系',regions:'个区域',matches:'个匹配概念',selected:'当前选择',related:'关系',hint:'探索概念',route:'建议路线',routeHint:'这是建议的探索顺序，不是必修先后关系。',closeRoute:'收起路线',openLesson:'打开交互讲解 →',readSource:'阅读教材解释 ↗',external:'外部阅读 · 暂无本站交互讲解',internal:'直接进入已有知识页的相关章节。',relatedTitle:'这些概念为什么相连',evidence:'查看解释依据 →',externalEvidence:'查看外部来源 ↗',exploreNode:'探索',outside:'当前概念不在筛选结果内，已保留它的解释。',viewLabel:'显示方式',mapLabel:'知识地图。可横向滚动查看其他主题。',counts:'{n} 个概念 · {e} 条关系\n{g} 个主题区域 · 人工编排并附来源',status:'{n} 个匹配概念 · 当前：{title}',initialNote:'波动、电路、系统与测量',trailStop:'第',outsideTag:'不在结果内',mapContext:'地图保留全部概念作为上下文；不匹配项标注“不在结果内”，列表只显示匹配结果。'}
  };
  let lang;
  try { lang = localStorage.getItem('knowledge-lang'); } catch (_) {}
  if (!['en','zh'].includes(lang)) lang = (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const pick = value => typeof value === 'string' ? value : value[lang];
  const t = key => STR[lang][key];
  const formulas={
      'time ↔ frequency':{zh:'时域 ↔ 频域',en:'time ↔ frequency'},'drive → response peak':{zh:'驱动 → 响应峰值',en:'drive → response peak'},
      'linear + time invariant':{zh:'线性 + 时不变',en:'linear + time invariant'},'measure → compare → act':{zh:'测量 → 比较 → 调整',en:'measure → compare → act'},
      'posterior ∝ likelihood × prior':{zh:'后验 ∝ 似然 × 先验',en:'posterior ∝ likelihood × prior'},'estimate = sample average':{zh:'估计值 = 样本平均',en:'estimate = sample average'},'predict → correct':{zh:'预测 → 修正',en:'predict → correct'}
    };
  const formulaText=value=>formulas[value]?pick(formulas[value]):value;

  const byId = new Map(D.nodes.map(n => [n.id,n]));
  const elements = new Map(), results = new Map(), disclosures = new Map();
  const external = href => /^https:\/\//.test(href);
  const make = (tag,className,text) => {const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
  const button = (text,fn,className) => {const e=make('button',className,text);e.type='button';e.addEventListener('click',fn);return e;};
  const sourceLink = (href,label,className) => {const a=make('a',className,label);a.href=href;return a;};
  let invalid = false, state;
  function readState() {
    const p = new URLSearchParams(location.search), id=p.get('node') || 'fourier';
    if(['zh','en'].includes(p.get('lang')))lang=p.get('lang');
    invalid = !byId.has(id);
    return {node:byId.has(id)?id:'fourier',q:(p.get('q')||'').slice(0,160),group:D.groups.some(g=>g.id===p.get('group'))?p.get('group'):'all',stage:['primary','junior','senior','university'].includes(p.get('stage'))?p.get('stage'):'all',question:(D.questions||[]).some(q=>q.id===p.get('question'))?p.get('question'):'',trail:D.trails.some(r=>r.id===p.get('trail'))?p.get('trail'):'',view:['graph','list'].includes(p.get('view'))?p.get('view'):(matchMedia('(max-width:700px)').matches?'list':'graph')};
  }
  state=readState();
  function save(push=false) {
    const u=new URL(location.href),keepLang=['zh','en'].includes(u.searchParams.get('lang'));u.search='';if(keepLang)u.searchParams.set('lang',lang);u.searchParams.set('node',state.node);u.searchParams.set('view',state.view);
    for(const key of ['q','trail'])if(state[key])u.searchParams.set(key,state[key]);
    if(state.group!=='all')u.searchParams.set('group',state.group);
    if(state.stage!=='all')u.searchParams.set('stage',state.stage);
    if(state.question)u.searchParams.set('question',state.question);
    try {history[push?'pushState':'replaceState']({...historyFields(),atlasStartingIdeas:helpSnapshot()},'',u);}catch(_){}
  }
  function select(id,{clear=false,focus=false,routeFocus=false}={}) {
    state.node=id;invalid=false;
    if(clear){state.q='';state.group='all';}
    save(true);render();
    const stacked=matchMedia('(max-width:1000px)').matches;
    const target=routeFocus?$('route-task-title')||$('detailTitle'):$('detailTitle');
    if(focus||stacked)target.focus({preventScroll:true});
    if(routeFocus)target.scrollIntoView({block:'nearest',behavior:'instant'});
    else if(stacked)$('detail').scrollIntoView({block:'start',behavior:'instant'});
  }
  function clearFilters(focus=false){state.q='';state.group='all';state.stage='all';state.question='';save();render();if(focus)$('search').focus();}
  // Focus/scroll only: returning never rewrites atlas URL or experiment state.
  const experimentNames={motion:'projectionName',kinematics:'ratesName',travel:'travelName',work:'workName',response:'responseName'};
  function focusExperiment(){
    // Focus the current view's dynamic H2; subheadings can be below the
    // viewport after host scrolling at large text sizes.
    if(['motion','kinematics','travel','work'].includes(state.trail))window.MotionBridge.focus();
    else if(state.trail==='response')window.ResponseBridge.focus();
    else if($('route-task-title')){$('route-task-title').focus({preventScroll:true});$('route-task-title').scrollIntoView({block:'start',behavior:'instant'});}
  }
  function routeContext(){const route=D.trails.find(r=>r.id===state.trail);return route&&!route.nodes.includes(state.node)?t('trailContext').replace('{node}',pick(byId.get(state.node).title)):'';}

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
  if($('stage')){const sa=make('option');sa.value='all';$('stage').append(sa);
    for(const st of ['primary','junior','senior','university']){const e=make('option');e.value=st;$('stage').append(e);}}
  D.nodes.forEach(n=>{
    const e=button('',()=>select(n.id,{focus:true}),'result');e.dataset.result=n.id;e.append(make('strong'),make('small'));$('results').append(e);results.set(n.id,e);
  });
  let showAllQuestions=false;
  function renderQuestions(){
    const box=$('questions');if(!box)return;box.replaceChildren();
    const list=(D.questions||[]).filter(q=>state.stage==='all'||q.stage===state.stage);
    const shown=showAllQuestions?list:list.slice(0,12);
    shown.forEach(q=>{
      const e=button('',()=>{state.question=state.question===q.id?'':q.id;if(state.question){state.trail='';state.node=q.chain[0];}invalid=false;save(true);render();});
      e.dataset.question=q.id;e.setAttribute('aria-pressed',String(state.question===q.id));
      e.append(make('strong','',pick(q.question)),make('span','',`${q.chain.length} ${t('concepts')}`));box.append(e);
    });
    if(list.length>12){const m=button(showAllQuestions?t('closeRoute'):t('moreQuestions'),()=>{showAllQuestions=!showAllQuestions;renderQuestions();});m.dataset.moreQuestions='';box.append(m);}
  }
  D.trails.forEach((r,i)=>{
    const e=button('',()=>{state.trail=state.trail===r.id?'':r.id;if(state.trail){state.node=r.nodes[0];state.q='';state.group='all';state.question='';}invalid=false;save(true);render();focusExperiment();});
    e.dataset.trail=r.id;e.append(make('strong'),make('span'));$('routes').append(e);
  });
  function matching() {
    const q=state.q.trim().toLocaleLowerCase();
    return D.nodes.filter(n=>(state.group==='all'||n.group===state.group)&&(state.stage==='all'||!n.stage||n.stage===state.stage)&&(!q||[n.title.zh,n.title.en,n.description.zh,n.description.en].join(' ').toLocaleLowerCase().includes(q)));
  }
  function activeEdges(){return D.edges.filter(e=>e.from===state.node||e.to===state.node);}
  function renderDetail(matches,edges){
    const n=byId.get(state.node), d=$('detail');d.replaceChildren();
    d.append(make('p','detail-kicker',pick(D.groups.find(g=>g.id===n.group).label)));
    const h=make('h2','',pick(n.title));h.id='detailTitle';h.tabIndex=-1;d.append(h,make('p','definition',pick(n.description)));
    if(n.formula)d.append(make('p','formula',formulaText(n.formula)));
    const currentExperiment=experimentNames[state.trail];
    if(currentExperiment){const back=button(t('returnExperiment').replace('{name}',t(currentExperiment)),focusExperiment,'motion-open');back.dataset.returnExperiment=state.trail;d.append(back);}
    const hasWork=n.id==='work-energy';
    if(hasWork&&state.trail!=='work'){const open=button(t('workOpen'),()=>{state.trail='work';state.q='';state.group='all';save(true);render();focusExperiment();},'motion-open');open.dataset.openWork=n.id;d.append(open);}
    const hasMotion=['unit-circle','sine','oscillation'].includes(n.id);
    if(hasMotion&&state.trail!=='motion'){const open=button(t('motionOpen'),()=>{state.trail='motion';state.q='';state.group='all';save(true);render();focusExperiment();},'motion-open');open.dataset.openMotion=n.id;d.append(open);}
    const hasRates=['derivative','oscillation','net-force'].includes(n.id);
    if(n.id==='integral'&&state.trail!=='travel'){const open=button(t('travelOpen'),()=>{state.trail='travel';state.q='';state.group='all';save(true);render();focusExperiment();},'motion-open');open.dataset.openTravel=n.id;d.append(open);}
    if(hasRates&&state.trail!=='kinematics'){const open=button(t('ratesOpen'),()=>{state.trail='kinematics';state.q='';state.group='all';save(true);render();focusExperiment();},'motion-open');open.dataset.openRates=n.id;d.append(open);}
    if(['oscillation','resonance','freqresp','poles'].includes(n.id)&&state.trail!=='response'){const open=button(t('responseOpen'),()=>{state.trail='response';state.q='';state.group='all';save(true);render();focusExperiment();},'motion-open');open.dataset.openResponse=n.id;d.append(open);}
    d.append(sourceLink(n.source,external(n.source)?t('readSource'):t('openLesson'),'primary-link'),make('p','source-note',external(n.source)?((hasMotion||hasRates||hasWork)?t('motionReading'):t('external')):t('internal')));
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
      if(e.reading){
        const r=e.reading,section=make('section','relation-reading'),start=byId.get(r.startNode);section.dataset.readingEdge=e.id;
        section.append(make('h4','',pick(r.title)),make('p','',pick(r.meaning)),make('p','',pick(r.startHint)));
        section.append(sourceLink(start.source,t('readingStart').replace('{concept}',pick(start.title)),'reading-link'));
        const query=new URLSearchParams({trail:r.trail,node:r.tryNode,view:'list',lang});
        section.append(sourceLink('./?'+query.toString()+'#motion-title',t('readingTry'),'reading-link'),make('p','',pick(r.bounds)),sourceLink(r.source,t('readingSource'),'reading-link'));item.append(section);
      }
      const other=e.from===n.id?e.to:e.from;
      const explore=button(`${t('exploreNode')} ${pick(byId.get(other).title)} →`,()=>select(other,{clear:true,focus:true}));explore.dataset.target=other;item.append(explore);
      item.append(sourceLink(e.source,external(e.source)?t('externalEvidence'):t('evidence'),'evidence-link'));wrapper.append(item);list.append(wrapper);
    });d.append(list);
  }
  function renderTrail(){
    const box=$('trail');
    if(state.question){
      const q=(D.questions||[]).find(x=>x.id===state.question);box.hidden=!q;box.replaceChildren();if(!q)return;
      box.append(make('p','trail-label',`${t('questions')} · ${t('routeHint')}`));
      const stops=make('div','trail-stops');q.chain.forEach((id,i)=>{
        const e=button(`${i+1}. ${pick(byId.get(id).title)}`,()=>select(id,{clear:true,focus:true}));e.setAttribute('aria-pressed',String(id===state.node));stops.append(e);
      });box.append(stops);
      const prompt=(q.prompts||[]).find(x=>x.node===state.node);
      if(prompt){const card=make('article','route-task');card.append(make('p','trail-label',t('taskLabel')),make('p','',pick(prompt.ask)));box.append(card);}
      if(q.reveal){const rev=make('details');rev.append(make('summary','',t('questionReveal')),make('p','',pick(q.reveal)));box.append(rev);}
      box.append(sourceLink(q.target.href,t('openStep'),'primary-link'));
      return;
    }
    const r=D.trails.find(r=>r.id===state.trail);box.hidden=!r;box.replaceChildren();if(!r)return;
    box.append(make('p','trail-label',`${t('route')} · ${t('routeHint')}`));
    const context=routeContext();if(context){const note=make('p','trail-context',context);note.dataset.trailContext='';box.append(note);}
    const stops=make('div','trail-stops');r.nodes.forEach((id,i)=>{
      const e=button(`${i+1}. ${pick(byId.get(id).title)}`,()=>select(id,{clear:true,focus:true,routeFocus:!!r.stationTasks}));e.setAttribute('aria-pressed',String(id===state.node));stops.append(e);
    });box.append(stops);
    const task=r.stationTasks?.find(x=>x.node===state.node);if(!task)return;
    const card=make('article','route-task');card.dataset.taskNode=task.node;
    const heading=make('h3','',pick(task.question));heading.id='route-task-title';heading.tabIndex=-1;
    card.append(make('p','trail-label',t('taskLabel')),heading,make('p','',pick(task.action)),sourceLink(task.href,t('taskOpen'),'task-open'));
    const notes=make('details');notes.append(make('summary','',t('taskObserve')),make('p','',pick(task.observe)),make('p','',pick(task.bridge)),sourceLink(task.source,pick(task.evidenceLabel),'evidence-link'));card.append(notes);
    const nav=make('div','route-task-nav'),index=r.nodes.indexOf(task.node);
    for(const [offset,label]of [[-1,'taskPrevious'],[1,'taskNext']]){const control=button(t(label),()=>select(r.nodes[index+offset],{clear:true,focus:true,routeFocus:true}));control.disabled=index+offset<0||index+offset>=r.nodes.length;control.dataset.taskMove=String(offset);nav.append(control);}
    card.append(nav);box.append(card);
  }
  const startingIdeas=$('route-foundations'),checkDisclosure=$('foundations-check'),questionId='free-crossing-v1';
  const currentQuestion=()=>D.trails.find(r=>r.id===state.trail)?.check||null;
  function historyFields(){try{const h=history.state;return h&&typeof h==='object'?h:{};}catch(_){return {};}}
  function helpSnapshot(){const question=currentQuestion();return {open:startingIdeas.open,reveal:question===questionId&&checkDisclosure.open,question};}
  function restoreStartingIdeas(){
    const saved=historyFields().atlasStartingIdeas;
    const valid=saved&&typeof saved.open==='boolean'&&typeof saved.reveal==='boolean'&&[null,questionId].includes(saved.question);
    startingIdeas.open=!!(valid&&saved.open);
    checkDisclosure.open=!!(valid&&saved.reveal&&saved.question===questionId&&currentQuestion()===questionId);
  }
  function persistStartingIdeas(){try{history.replaceState({...historyFields(),atlasStartingIdeas:helpSnapshot()},'');}catch(_){}}
  startingIdeas.addEventListener('toggle',persistStartingIdeas);checkDisclosure.addEventListener('toggle',persistStartingIdeas);
  $('foundations-verify').addEventListener('click',()=>{if(state.trail!=='kinematics'){state.trail='kinematics';save(true);render();}focusExperiment();});
  function renderStartingIdeas(previousFocus){
    const route=D.trails.find(r=>r.id===state.trail);startingIdeas.hidden=!route;
    if(!route){$('trail').after(startingIdeas);checkDisclosure.open=false;return;}
    const intro=state.trail==='response'?document.querySelector('[data-response-text=intro]'):['motion','kinematics','travel','work'].includes(state.trail)?document.querySelector('[data-motion-text=intro]'):null;
    const anchor=intro?$(state.trail==='response'?'response-route-context':'motion-route-context'):$('trail');
    if(startingIdeas.parentNode!==anchor.parentNode||anchor.nextElementSibling!==startingIdeas)anchor.after(startingIdeas);
    for(const[id,key]of [['summary','foundationsSummary'],['intro','foundationsIntro'],['check-title','checkTitle'],['check-scope','checkScope'],['question','checkQuestion'],['reveal','checkReveal'],['answer','checkAnswer'],['verify','checkVerify']])$('foundations-'+id).textContent=t(key);
    const content=$('foundations-content');content.replaceChildren();
    if(route.backgroundNote){const note=make('section','foundations-concept');note.dataset.foundationNote=route.id;note.append(make('p','',pick(route.backgroundNote)),sourceLink(route.backgroundSource,t('foundationsEvidence'),'evidence-link'));content.append(note);}
    for(const id of route.background){const node=byId.get(id),card=make('section','foundations-concept');card.dataset.foundationNode=id;card.append(make('h3','',pick(node.title)),make('p','',pick(node.description)));if(node.formula)card.append(make('p','formula',formulaText(node.formula)));
      if(node.help){card.append(make('h3','',pick(node.help.title)),make('p','',pick(node.help.body)));for(const src of node.help.sources)card.append(sourceLink(src.href,pick(src.label),'evidence-link'));}
      const actions=make('div','foundations-actions'),inspect=button(t('foundationsInspect'),()=>select(id,{focus:true}));inspect.dataset.foundationInspect=id;actions.append(inspect,sourceLink(node.source,t('foundationsSource')));card.append(actions);content.append(card);
    }
    const hasQuestion=route.check===questionId;$('foundations-check-wrap').hidden=!hasQuestion;if(!hasQuestion)checkDisclosure.open=false;
    if(previousFocus){
      let target=previousFocus.isConnected&&startingIdeas.contains(previousFocus)?previousFocus:null;
      if(!target&&previousFocus.id)target=document.getElementById(previousFocus.id);
      if(!target&&previousFocus.dataset.foundationInspect)target=[...content.querySelectorAll('[data-foundation-inspect]')].find(e=>e.dataset.foundationInspect===previousFocus.dataset.foundationInspect);
      if(!target&&previousFocus.getAttribute('href'))target=[...content.querySelectorAll('a')].find(e=>e.getAttribute('href')===previousFocus.getAttribute('href'));
      if(!target||!target.getClientRects().length)target=$('foundations-summary');
      if(document.activeElement!==target)target.focus({preventScroll:true});
      const box=target.getBoundingClientRect();if(box.top<0||box.bottom>innerHeight)target.scrollIntoView({block:'nearest',behavior:'instant'});
    }

  }
  let frame;
  function render(){
    const previousStartingFocus=startingIdeas.contains(document.activeElement)?document.activeElement:null;
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('title')+' · '+t('eyebrow');
    document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=t(e.dataset.i18n));
    document.querySelectorAll('[data-lang]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.lang===lang)));
    $('counts').textContent=t('counts').replace('{n}',D.nodes.length).replace('{e}',D.edges.length).replace('{g}',D.groups.length);
    $('search').placeholder=t('placeholder');$('search').value=state.q;$('group').value=state.group;
    if($('stage')){$('stage').value=state.stage;[...$('stage').options].forEach(e=>e.textContent=e.value==='all'?t('allStages'):t('stage'+e.value[0].toUpperCase()+e.value.slice(1)));}
    renderQuestions();
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
    renderDetail(matches,edges);renderTrail();
    window.MotionBridge.update({lang,node:state.node,active:['motion','kinematics','travel','work'].includes(state.trail),view:state.trail==='kinematics'?'rates':state.trail==='travel'?'travel':state.trail==='work'?'work':'projection',workDefinitions:pick(byId.get('work-energy').help.body),onView:view=>{state.trail=({rates:'kinematics',travel:'travel',work:'work',projection:'motion'})[view];save(true);render();},onSelect:id=>select(id,{clear:true,focus:true}),onClose:()=>{state.trail='';save(true);render();$('detailTitle').focus();}});
    window.ResponseBridge.update({lang,node:state.node,active:state.trail==='response',onSelect:id=>select(id,{clear:true,focus:true}),onClose:()=>{state.trail='';save(true);render();$('detailTitle').focus();}});
    for(const id of ['motion','response']){const note=$(id+'-route-context'),visible=!!routeContext()&&(id==='response'?state.trail==='response':['motion','kinematics','travel','work'].includes(state.trail));note.hidden=!visible;note.textContent=visible?routeContext():'';}
    renderStartingIdeas(previousStartingFocus);
    cancelAnimationFrame(frame);frame=requestAnimationFrame(drawEdges);
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
  document.querySelectorAll('[data-lang]').forEach(e=>e.addEventListener('click',()=>{lang=e.dataset.lang;try{localStorage.setItem('knowledge-lang',lang);}catch(_){}if(['zh','en'].includes(new URLSearchParams(location.search).get('lang')))save();render();}));
  document.querySelectorAll('[data-view]').forEach(e=>e.addEventListener('click',()=>{state.view=e.dataset.view;save();render();}));
  $('search').addEventListener('input',()=>{state.q=$('search').value;state.view='list';save();render();});
  $('group').addEventListener('change',()=>{state.group=$('group').value;state.view='list';save();render();});
  if($('stage'))$('stage').addEventListener('change',()=>{state.stage=$('stage').value;state.view='list';save();render();});
  $('reset').addEventListener('click',()=>clearFilters());$('emptyReset').addEventListener('click',()=>clearFilters(true));
  addEventListener('popstate',()=>{state=readState();restoreStartingIdeas();render();});
  addEventListener('resize',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(drawEdges);});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(drawEdges);}).observe($('map'));
  restoreStartingIdeas();render();
  if(location.hash==='#route-task-title'&&$('route-task-title'))focusExperiment();
  if(location.hash==='#motion-title'&&state.trail==='motion')focusExperiment();
})();

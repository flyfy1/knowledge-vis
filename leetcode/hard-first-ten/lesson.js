/* Shared page controls; algorithm-specific snapshots are produced by core.js. */
'use strict';
window.HardLesson={mount(id){
  const lesson=window.LESSON,ui=LeetCodeLocale(window.LESSON_COPY),$=id=>document.getElementById(id);
  let preset=0,index=0,trace=HardModels[id](lesson.presets[0].input),choice=null,revealed=false,copyStatus='';
  const local=pair=>Array.isArray(pair)?pair[ui.getLang()==='zh'?0:1]:String(pair);
  const text=x=>x===null?'∅':typeof x==='object'?JSON.stringify(x):String(x);
  function el(tag,content,cls){const node=document.createElement(tag);if(content!==undefined)node.textContent=content;if(cls)node.className=cls;return node;}
  function diagram(frame,target){
    target.replaceChildren();
    if(!frame){target.append(el('p',ui.t('unchanged')));return;}
    if(frame.rows){
      target.append(el('p',ui.t('activeLegend'),'hint'));
      frame.rows.forEach((r,ri)=>{target.append(el('h4',local(r.label)));const cells=el('div',undefined,'trace-array');
        if(!r.values.length)cells.append(el('span',ui.t('empty'),'muted'));
        r.values.forEach((value,i)=>{
          if(frame.cuts&&ri<2&&frame.cuts[ri]===i)cells.append(el('span',ui.t('cut')+' ↓','cut-marker'));
          const active=r.active.includes(i),cell=el('div',undefined,'trace-cell'+(active?' hot':'')+(frame.span&&ri===0&&i>=frame.span[0]&&i<=frame.span[1]?' span-cell':''));
          cell.append(el('b',text(value)));if(r.indices!==false)cell.append(el('small',String(i)));cells.append(cell);
        });
        if(frame.cuts&&ri<2&&frame.cuts[ri]===r.values.length)cells.append(el('span',ui.t('cut')+' ↓','cut-marker'));
        target.append(cells);
      });
    }
    if(frame.matrix){
      target.append(el('p',ui.t('dpLegend'),'hint'));
      const wrap=el('div',undefined,'table-wrap dp-wrap'),table=el('table',undefined,'dp-table');table.setAttribute('aria-label',ui.t('dpLegend'));
      const head=el('thead'),hr=el('tr');hr.append(el('th','i \\ j'));
      frame.x.forEach((v,i)=>hr.append(el('th',`${i}: ${v}`)));head.append(hr);table.append(head);
      const body=el('tbody');frame.matrix.forEach((r,i)=>{const tr=el('tr');const th=el('th',`${i}: ${frame.y[i]}`);th.scope='row';tr.append(th);
        r.forEach((v,j)=>{const current=frame.active[0]===i&&frame.active[1]===j,dep=frame.deps.some(([a,b])=>a===i&&b===j);const cell=el('td',v===null?'·':v?'T':'F',(current?'current ':'')+(dep?'dependency':''));cell.dataset.cell=`${i},${j}`;tr.append(cell);});body.append(tr);
      });table.append(body);wrap.append(table);target.append(wrap);
    }
    if(frame.heap){
      target.append(el('h4',ui.t('heap')));const heap=el('div',undefined,'heap-levels');
      if(!frame.heap.length)heap.append(el('p',ui.t('empty')));
      for(let start=0,depth=0;start<frame.heap.length;depth++){
        const level=el('div',undefined,'heap-level');for(let end=Math.min(frame.heap.length,2**(depth+1)-1);start<end;start++){
          const x=frame.heap[start],cell=el('div',undefined,'heap-node');cell.append(el('b',String(x.value)),el('small',`${x.source}:${x.index} [h=${start}]`));level.append(cell);
        }heap.append(level);
      }target.append(heap);
    }
    if(frame.links){
      target.append(el('p',ui.t('links'),'hint'),el('p',ui.t('head')+' → '+(frame.head===null?'∅':'#'+frame.head),'link-entry'));
      const graph=el('div',undefined,'link-graph');frame.values.forEach((v,i)=>{
        const cell=el('div',undefined,'link-node'+((frame.state.changed??frame.state.curr)===i?' hot':''));cell.dataset.node=i;cell.append(el('b',`#${i} = ${v}`),el('span','next → '+(frame.links[i]===null?'∅':'#'+frame.links[i])));graph.append(cell);
      });target.append(graph);
    }
    if(frame.board){
      target.append(el('p',ui.t('sudokuLegend'),'hint'));const board=el('div',undefined,'sudoku-board');board.setAttribute('role','table');board.setAttribute('aria-label',ui.t('sudokuLegend'));
      frame.board.forEach((r,i)=>{const row=el('div',undefined,'sudoku-row');row.setAttribute('role','row');r.forEach((v,j)=>{const given=lesson.presets[preset].input[i][j]!=='.';const cell=el('span',v,'sudoku-cell'+(given?' given':'')+(frame.active&&frame.active[0]===i&&frame.active[1]===j?' hot':''));cell.setAttribute('role','cell');cell.setAttribute('aria-label',`(${i},${j}): ${v}`);row.append(cell);});board.append(row);});target.append(board);
    }
    if(frame.bars){
      target.append(el('p',ui.t('waterLegend'),'hint'));const chart=el('div',undefined,'water-chart');chart.setAttribute('role','img');chart.setAttribute('aria-label',ui.t('waterLegend'));
      const maximum=Math.max(1,...frame.bars);chart.style.setProperty('--levels',maximum);
      frame.bars.forEach((h,i)=>{const column=el('div',undefined,'water-column'+(frame.active===i?' hot':'')),marks=el('div',undefined,'water-marks');
        for(let level=maximum;level>=1;level--)marks.append(el('span','',level<=h?'bar-block':frame.settled[i]!==null&&level<=h+frame.settled[i]?'water-block':'air-block'));
        column.append(marks,el('small',String(i)),el('small',frame.settled[i]===null?'·':`+${frame.settled[i]}`));chart.append(column);
      });target.append(chart);
    }
    if(frame.output){target.append(el('h4',ui.t('output')));const output=el('div',undefined,'ledger');if(!frame.output.length)output.append(el('span',ui.t('empty')));frame.output.forEach(x=>output.append(el('span',text(x),'ledger-item')));target.append(output);}
  }
  function renderQuiz(){
    $('reveal').disabled=choice===null;
    $('feedback').textContent=revealed?(ui.t(choice===lesson.quiz.correct?'right':'wrong')+' '+local(lesson.quiz.feedback[choice])):ui.t('choose');
    $('feedback').classList.toggle('correct',revealed&&choice===lesson.quiz.correct);
  }
  function render(){
    const frame=trace.frames[index];
    $('inputData').textContent=JSON.stringify(lesson.presets[preset].input,null,id===37?1:0);
    $('progress').textContent=ui.t('progress',{current:index,total:trace.frames.length-1});
    $('position').max=trace.frames.length-1;$('position').value=index;
    $('prev').disabled=index===0;$('next').disabled=index===trace.frames.length-1;
    $('message').textContent=local(frame.message);$('diagram').setAttribute('aria-label',ui.t('now'));
    diagram(frame,$('diagram'));diagram(index?trace.frames[index-1]:null,$('beforeDiagram'));
    $('state').replaceChildren();Object.entries(frame.state||{}).forEach(([key,value])=>{$('state').append(el('dt',key),el('dd',text(value)));});
    $('operation').textContent=frame.code;$('result').hidden=frame.result===undefined;
    $('result').textContent=frame.result===undefined?'':ui.t('result')+': '+text(frame.result);
    $('history').replaceChildren();for(let i=Math.max(0,index-5);i<=index;i++)$('history').append(el('li',`${i}: ${local(trace.frames[i].message)}`));
    $('mapping').replaceChildren();lesson.mapping.forEach(([name,meaning])=>{const r=el('tr');r.append(el('td',name),el('td',local(meaning)));$('mapping').append(r);});
    $('copyStatus').textContent=copyStatus?ui.t(copyStatus):'';
    renderQuiz();
  }
  $('next').onclick=()=>{if(index<trace.frames.length-1){index++;render();}};
  $('prev').onclick=()=>{if(index){index--;render();}};
  $('reset').onclick=()=>{index=0;render();};
  $('preset').onchange=e=>{preset=Number(e.target.value);index=0;trace=HardModels[id](lesson.presets[preset].input);render();};
  $('position').oninput=e=>{index=Number(e.target.value);render();};
  document.querySelectorAll('[name="prediction"]').forEach(radio=>radio.onchange=()=>{choice=Number(radio.value);revealed=false;renderQuiz();});
  $('reveal').onclick=()=>{if(choice!==null){revealed=true;renderQuiz();}};
  $('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
  $('copy').onclick=async()=>{
    try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copied';$('manualCopy').hidden=true;}
    catch(_){copyStatus='copyFail';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
    $('copyStatus').textContent=ui.t(copyStatus);
  };
  const links=[...document.querySelectorAll('.step-nav a')];
  function updateNav(){let active=0;document.querySelectorAll('section.step').forEach((s,i)=>{if(s.getBoundingClientRect().top<=150)active=i;});links.forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
  window.addEventListener('scroll',updateNav,{passive:true});
  ui.onChange(render);ui.init();updateNav();
  // Read-only state hook for regression tests, never used to compute expected answers.
  window.lessonSnapshot=()=>JSON.parse(JSON.stringify({id,preset,index,frame:trace.frames[index],frames:trace.frames.length,choice,revealed}));
}};

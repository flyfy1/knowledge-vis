"""Generate ten static pages from bilingual authored content and Python sources."""
from pathlib import Path
import json
import html
from lessons import LESSONS
ROOT = Path(__file__).resolve().parents[1]
VERSION = 'hard10-ids1'
def esc(x): return html.escape(str(x), quote=True)
def tr(key, tag='p', cls='explain'):
    return f'<{tag} class="{cls}" data-i18n="{key}"></{tag}>'
UI={
'back':['← LeetCode 专区','← LeetCode collection'], 'official':['LeetCode 原题 ↗','View on LeetCode ↗'],
's0':['要找什么？','What are we finding?'],'s1':['为什么能省去工作？','Why can we skip work?'],
's2':['一次操作改变什么？','What changes in one operation?'],'s3':['先预测，再验证','Predict before revealing'],
's4':['如何写成 Python？','How does this become Python?'],
'handTitle':['先手算一个例子','Work one example by hand'],'baselineTitle':['一个简单正确的基线','A simple correct baseline'],
'presets':['实验输入（切换会重启）','Experiment input (changing restarts)'],
'prev':['回退一次操作','Rewind one operation'],'next':['执行下一次操作','Execute next operation'],'reset':['重启当前实验','Restart this experiment'],
'position':['事件位置','Event position'],'progress':['事件 {current} / {total}','Event {current} / {total}'],
'before':['上一次状态','Previous state'],'now':['当前状态','Current state'],
'result':['最终结果','Final result'],'state':['算法状态（变量与图示索引）','Algorithm state (variables and diagram indices)'],
'operation':['对应 Python 操作（局部展开）','Corresponding Python operation (focused excerpt)'],
'history':['最近的操作（保留最多 6 条）','Recent operations (up to 6 retained)'],
'reveal':['验证我的预测','Check my prediction'],'choose':['请先选择，答案尚未揭晓。','Choose first; the answer has not been revealed.'],
'right':['推理正确。','Correct reasoning.'],'wrong':['再检查这个边界。','Check this boundary again.'],
'mapping':['图中的量如何对应代码？','How do visible quantities map to code?'],
'quantity':['Python 名称','Python name'],'meaning':['图中的含义','Meaning in the view'],
'copy':['复制 Python','Copy Python'],'download':['下载 solution.py','Download solution.py'],
'copied':['已复制。','Copied.'],'copyFail':['无法自动复制；请从下方文本框选择复制。','Automatic copy unavailable; select the code in the text box below.'],
'fallback':['手动复制 Python 源码','Python source for manual copying'],
'fullCode':['完整 Python 解法','Complete Python solution'],'trapsTitle':['哪些边界最容易出错？','Which boundaries are easy to get wrong?'],
'verifyTitle':['怎样独立核对？','How can we check independently?'],
'verify':['对每个预设，先按题意手算，再把实验推进到终点。上面的基线可独立核对小输入；测试文件还覆盖随机、穷举与边界。浏览器执行的是 JavaScript 模型，不是 Python 运行器。','For each preset, first calculate from the definition, then reach the experiment endpoint. The baseline independently checks small inputs; test files cover random, exhaustive, and boundary cases. The browser runs a JavaScript model, not a Python interpreter.'],
'related':['继续连接这些概念','Connect these ideas'],
'foot':['算法实验 · 中英双语 · Python 解法 · 未声称 LeetCode 提交通过或真实学习效果','Algorithm experiments · Chinese / English · Python solutions · No claim of LeetCode submission acceptance or measured learning outcomes'],
'output':['已输出的节点 / 已记录的起点','Emitted nodes / recorded starts'],
'empty':['∅（空）','∅ (empty)'],'heap':['最小堆（按树的层级展示）','Min-heap (shown by tree level)'],
'head':['入口 head','Entry head'],'links':['所有节点的 next；# 是永久身份','Every node’s next; # is permanent identity'],
'dpLegend':['行：文本前缀；列：模式前缀。青色=当前；橙边=依赖；T/F=真假；·=待算。','Rows: text prefixes; columns: pattern prefixes. Cyan=current; orange border=dependency; T/F=true/false; ·=uncomputed.'],
'waterLegend':['每格单位高度；灰=柱子，青=已结算水。底部为下标；· 表示尚未结算。','Each block is one height unit; gray=bar, cyan=settled water. Indices are below; · means unsettled.'],
'sudokuLegend':['粗线围住 3×3 宫；橙色=原始已知数；青色=当前格；坐标从 0 开始。','Thick lines bound 3×3 boxes; orange=givens; cyan=current cell; coordinates start at zero.'],
'cut':['切口','Cut'],'activeLegend':['高亮与下划线标记当前操作涉及的位置；数字下方是下标。','Highlight and underline mark positions involved in this operation; indices appear below values.'],
'unchanged':['还没有上一帧。','No previous frame yet.']}
for p in LESSONS:
    id=p['id']; d=ROOT/str(id);d.mkdir(exist_ok=True)
    copy=dict(UI,docTitle=[f'{id} · {x}' for x in p['title']])
    for key in ['title','topic','statement','constraints','hand','cost','derive','proof','invariant','task','complexity','traps']:
        copy[key]=p[key]
    copy['title']=[f'#{id} · {title}' for title in p['title']]
    if id==23: copy['output']=['已输出的节点（永久身份 = 值）','Emitted nodes (permanent identity = value)']
    if id==30: copy['output']=['已记录的起点下标','Recorded starting indices']
    copy['quizQuestion']=p['quiz']['question']
    for i,option in enumerate(p['quiz']['options']):copy[f'option{i}']=option
    for i,pre in enumerate(p['presets']):copy[f'preset{i}']=pre['label']
    for i,(_,_,label) in enumerate(p['related']):copy[f'related{i}']=label
    copy['introducedLink']=p['related'][0][2]
    (d/'copy.js').write_text('window.LESSON_COPY = '+json.dumps(copy,ensure_ascii=False,indent=2)+';\nwindow.LESSON = '+json.dumps(p,ensure_ascii=False,indent=2)+';\n')
    (d/'app.js').write_text(f"'use strict';\nHardLesson.mount({id});\n")
    options=''.join(f'<option value="{i}" data-i18n="preset{i}"></option>' for i in range(len(p['presets'])))
    radios=''.join(f'<label><input type="radio" name="prediction" value="{i}"><span data-i18n="option{i}"></span></label>' for i in range(3))
    links=''.join(f'<a href="../{pid}/#step{step}" data-i18n="related{i}"></a>' for i,(pid,step,_) in enumerate(p['related']))
    nav=''.join(f'<a href="#step{i}" data-i18n="s{i}"></a>' for i in range(5))
    def section(i,body):return f'<section class="step" id="step{i}" data-step="{i}"><div class="step-inner"><p class="step-kicker">0{i+1}</p>{tr(f"s{i}","h2")}{body}</div></section>'
    s0=tr('statement')+tr('constraints','p','hint')+f'<a href="https://leetcode.com/problems/{p["slug"]}/" target="_blank" rel="noopener" data-i18n="official"></a>'+tr('handTitle','h3')+tr('hand')+tr('baselineTitle','h3')+f'<pre><code>{esc(p["baseline"])}</code></pre>'+tr('cost')
    pid,step,_=p['related'][0]
    s1=tr('derive')+tr('proof')+tr('invariant','p','question')+f'<a href="../{pid}/#step{step}" data-i18n="introducedLink"></a>'
    s2=tr('invariant','p','question')+tr('task')+'''<div class="stage">
<label for="preset" data-i18n="presets"></label><select id="preset">'''+options+'''</select>
<pre class="input-data" id="inputData"></pre>
<div class="controls"><button class="btn" id="prev" data-i18n="prev"></button><button class="btn primary" id="next" data-i18n="next"></button><button class="btn" id="reset" data-i18n="reset"></button></div>
<label class="range-label" for="position" data-i18n="position"></label><input id="position" type="range" min="0" value="0" step="1"><span id="progress" class="muted"></span>
<p class="readout" id="message" aria-live="polite"></p>
<div id="diagram" role="group"></div>
<details id="beforeDetails"><summary data-i18n="before"></summary><div id="beforeDiagram"></div></details>
<h3 data-i18n="state"></h3><dl id="state" class="state-grid"></dl>
<p class="readout correct" id="result" hidden></p>
<details><summary data-i18n="operation"></summary><pre><code id="operation"></code></pre></details>
<details><summary data-i18n="history"></summary><ol id="history"></ol></details>
</div>'''
    s3='<fieldset class="prediction-options">'+tr('quizQuestion','legend')+radios+'<button class="btn primary" id="reveal" data-i18n="reveal" disabled></button></fieldset><p id="feedback" class="readout" aria-live="polite"></p>'
    s4=tr('mapping','h3')+'<div class="table-wrap"><table><thead><tr><th data-i18n="quantity"></th><th data-i18n="meaning"></th></tr></thead><tbody id="mapping"></tbody></table></div>'+tr('complexity','p','question')+'''<div class="solution-actions"><button class="btn primary" id="copy" data-i18n="copy"></button><a href="solution.py" download data-i18n="download"></a><span id="copyStatus" aria-live="polite"></span></div><div id="manualCopy" hidden><label for="copyText" data-i18n="fallback"></label><textarea id="copyText" readonly rows="8"></textarea></div><details id="sourceDetails"><summary data-i18n="fullCode"></summary><pre><code id="pythonCode"></code></pre></details>'''+tr('trapsTitle','h3')+tr('traps')+tr('verifyTitle','h3')+tr('verify')+tr('related','h3')+f'<div class="related">{links}</div>'
    page=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{id} · {esc(p['title'][1])}</title><meta name="description" content="{esc(p['statement'][1])}"><link rel="stylesheet" href="../style.css?v=lc-ids1"><link rel="stylesheet" href="../hard-first-ten/style.css?v={VERSION}"></head>
<body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div class="lang-toggle" id="langToggle" role="group" aria-label="Language / 语言"><button data-lang="zh">中</button><button data-lang="en">EN</button></div></div><p class="eyebrow">LEETCODE {id} · HARD · PYTHON</p>{tr('title','h1')}{tr('topic','p','tagline')}<a class="official-link" href="https://leetcode.com/problems/{p['slug']}/" target="_blank" rel="noopener noreferrer" data-i18n="official"></a></header>
<nav class="step-nav" aria-label="Lesson steps / 学习步骤"><div class="step-nav-inner">{nav}</div></nav><main>{section(0,s0)}{section(1,s1)}{section(2,s2)}{section(3,s3)}{section(4,s4)}</main><footer class="site-foot" data-i18n="foot"></footer>
<noscript>Interactive lessons require JavaScript. <a href="solution.py">Python solution</a></noscript>
<script src="../common.js?v=lc2916-astra2"></script><script src="copy.js?v={VERSION}"></script><script src="../hard-first-ten/core.js?v={VERSION}"></script><script src="python-code.js?v={VERSION}"></script><script src="../hard-first-ten/lesson.js?v={VERSION}"></script><script src="app.js?v={VERSION}"></script></body></html>'''
    (d/'index.html').write_text(page)
    terms='\n'.join(f'| `{name}` | Steps 1–2; repeated in step 4 | {definition[1]} | Arrays, indices, the stated input contract |' for name,definition in p['mapping'])
    examples='\n'.join(f'- {x["label"][1]}: `{json.dumps(x["input"])}`.' for x in p['presets'])
    brief=f'''# {id}: {p['title'][1]}

Category: `leetcode`. Stage: `university`. Solution language: Python.
Target reader: basic Python, lists, loops, functions, and elementary recursion.
Job: explain the invariant, predict a transition, and reconstruct the Python.
Learning loop: collection → hand calculation → baseline → invariant → reversible
experiment → fresh prediction → Python mapping → independent checks.
Riskiest assumption: {p['task'][1]}

## Official contract

Verified 2026-10-17 from https://leetcode.com/problems/{p['slug']}/.
{p['statement'][1]}
{p['constraints'][1]}

## Step contract

| Step | Reader already knows | Single question | Input → desired output | Action → observation | Conditions |
| --- | --- | --- | --- | --- | --- |
| 0 | Python lists and loops | What does the result mean? | Small worked input → hand result | Read baseline and recompute the worked example | Official input contract above |
| 1 | Baseline and requested output | Why is work avoidable? | Repeated baseline work → sufficient state | Compare cases in the derivation → reconstruct invariant | {p['invariant'][1]} |
| 2 | Named state and transition | What changes in one operation? | Selected preset → trace and final result | {p['task'][1]} | Model implements the shown algorithm; changing preset restarts |
| 3 | Worked transitions | Can I predict a fresh case? | Unseen case → choice and causal feedback | Choose, explicitly reveal, change choice → stale feedback clears | Independent of trace; locale preserves choice and reveal |
| 4 | Transition and boundary cases | How does it map to Python? | Visible state → submission-shaped code | Inspect mapping, copy/download → identical source | {p['complexity'][1]} |

## Concept dependencies and first definitions

| Name | First introduction | Definition | Prerequisites |
| --- | --- | --- | --- |
{terms}

## Representative inputs and expected hand calculation

{examples}

{p['hand'][1]}

## Demonstration boundaries

Worked calculation, trace presets, and prediction are separate experiments.
The trace runs JavaScript, not Python. Full retained trace snapshots are teaching
storage and are excluded from the submitted algorithm's complexity claim.
For Sudoku, the first 180 events and final board are retained; an explicit final
notice identifies omitted events. Heap frames show completed operations, with
sift behavior explained in prose. DP retains the full table even where Python
uses rolling rows. Rewind restores a complete snapshot, not an inverse mutation.

## Verification

Run `python3 leetcode/tests/test_hard_solutions.py`,
`node leetcode/tests/test_hard_core.cjs`, and
`NODE_PATH=<playwright package directory> node leetcode/tests/test_hard_browser.cjs`.
See `../../specs/reviews/leetcode-first-ten-review.md` for observed review evidence.
No actual LeetCode submission or human learning test is claimed.
'''
    (d/'BRIEF.md').write_text(brief)
# Preserve the preexisting 2916 entry and register this batch deterministically.
registry=ROOT/'problems.config.js'
s=registry.read_text();old=s[s.index('  {\n    id: 2916'):s.rindex('\n];')]
entries=[]
for p in LESSONS:
    entries.append(json.dumps(dict(id=p['id'],title=dict(zip(['zh','en'],p['title'])),desc=dict(zip(['zh','en'],p['derive'])),difficulty='hard',topics=[dict(zip(['zh','en'],p['topic']))],path=f'{p["id"]}/',leetcodeUrl=f'https://leetcode.com/problems/{p["slug"]}/',language='Python',complexity={4:'O(log(min(m,n)+1))',10:'O(mn)',23:'O(k + N log(k+1))',25:'O(n)',30:'O(Lw + kw)',32:'O(n)',37:'O(9^E)',41:'O(n)',42:'O(n)',44:'O((m+1)(n+1))'}[p['id']]),ensure_ascii=False,indent=2))
registry.write_text('/* Ascending frontend ID; first ten Hard verified 2026-10-17. */\nwindow.LEETCODE_PROBLEMS = [\n'+',\n'.join(entries)+',\n'+old+'\n];\n')
(ROOT/'hard-first-ten/fixtures.json').write_text(json.dumps({p['id']:[x['input'] for x in p['presets']] for p in LESSONS},indent=2))

from pathlib import Path
p=Path(__file__).resolve().parents[1]
def para(k,cls=''):return f'<p class="{cls}" data-i18n="{k}"></p>'
def btn(id,key):return f'<button id="{id}" class="btn" data-i18n="{key}"></button>'
head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>363 · Max Sum of Rectangle No Larger Than K</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="local.css?v=1"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div id="langToggle" class="lang-toggle"><button data-lang="zh" lang="zh">中</button><button data-lang="en" lang="en">EN</button></div></div><h1 data-i18n="title"></h1><p class="tagline" data-i18n="intro"></p><div class="meta"><span class="badge" data-i18n="hard"></span><a class="official-link" href="https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/" data-i18n="official"></a></div></header><nav class="step-nav"><div class="step-nav-inner">'''
head+=''.join(f'<a href="#step{i}" data-i18n="nav{i}"></a>' for i in range(5))+'</div></nav><main>'
sections=[]
sections.append(para('p0')+para('rules')+'<div class="stage">'+para('handTask')+'<div class="matrix" style="--cols:3"><span>1</span><span class="band">0</span><span class="band">1</span><span>0</span><span class="band">−2</span><span class="band">3</span></div><button id="handReveal" class="btn" data-i18n="handShow" aria-controls="handAnswer" aria-expanded="false"></button><p id="handAnswer" class="readout" data-i18n="handAnswer" hidden></p></div>')
base='''def baseline(matrix, k):
    m, n = len(matrix), len(matrix[0])
    best = float('-inf')
    for top in range(m):
        for bottom in range(top, m):
            for left in range(n):
                for right in range(left, n):
                    total = sum(matrix[r][c]
                                for r in range(top, bottom + 1)
                                for c in range(left, right + 1))
                    if total &lt;= k:
                        best = max(best, total)
    return best'''
sections.append(para('p1')+para('baselineCost')+'<pre tabindex="0"><code>'+base+'</code></pre>'+para('reduction')+para('wrong','question'))
trace=para('traceTask')+para('simulation','hint')+'<div class="stage"><div class="controls"><label for="preset" data-i18n="preset"></label><select id="preset">'+''.join(f'<option value="{i}" data-i18n="pre{i}"></option>' for i in range(5))+'</select><label for="band" data-i18n="band"></label><select id="band"></select></div><h3 data-i18n="inputLabel"></h3><div id="matrix" class="matrix"></div><p id="cap"></p><h3 data-i18n="sumsLabel"></h3><div id="sums" class="pairs"></div><div class="controls">'+''.join(btn(i,i) for i in ['prev','next','reset','end'])+'</div><div id="progress" class="readout" role="status"></div><ol id="ledger"></ol></div>'
sections.append(''.join(para(k) for k in ['p2','derive','invariant','binary'])+trace)
sections.append(para('p3')+'<div class="stage"><fieldset class="prediction-options"><legend data-i18n="choose"></legend>'+''.join(f'<label><input type="radio" name="prediction" value="{v}"><span data-i18n="opt{v}"></span></label>' for v in [0,1,3])+'</fieldset><button id="reveal" class="btn primary" data-i18n="reveal" disabled></button><p id="feedback" class="readout" role="status"></p></div>')
sections.append(''.join(para(k) for k in ['p4','mapping','cost','bounds'])+'''<h3 data-i18n="sourceTitle"></h3><div class="solution-actions"><button id="copy" class="btn" data-i18n="copy"></button><a href="solution.py" download="solution.py" data-i18n="download"></a></div><p id="copyStatus" role="status"></p><div id="manualCopy" hidden><label for="manualSource" data-i18n="sourceTitle"></label><textarea id="manualSource" readonly rows="10"></textarea></div><pre tabindex="0"><code id="pythonSource"></code></pre><h3 data-i18n="related"></h3><div class="related"><a href="#step1" data-i18n="rel1"></a><a href="#step2" data-i18n="rel2"></a><a href="../327/#step2" data-i18n="rel3"></a></div>''')
html=head+''.join(f'<section class="step" id="step{i}" data-step="{i}"><div class="step-inner"><div class="step-kicker">0{i+1}</div><h2 data-i18n="h{i}"></h2>{body}</div></section>' for i,body in enumerate(sections))+'</main><footer class="site-foot" data-i18n="foot"></footer>'+''.join(f'<script src="{x}"></script>' for x in ['../common.js','copy.js?v=1','core.js?v=1','python-code.js?v=1','app.js?v=1'])+'</body></html>\n'
(p/'index.html').write_text(html)

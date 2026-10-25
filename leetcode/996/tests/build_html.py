from pathlib import Path
p=Path(__file__).resolve().parents[1]
def tx(key,tag='p',attrs=''):
 return f'<{tag} data-i18n="{key}" {attrs}></{tag}>'
def btn(id,key,extra=''):
 return tx(key,'button',f'type="button" class="btn" id="{id}" {extra}')
def section(n,body):
 return f'<section class="step" id="step{n}"><div class="step-inner">'+f'<p class="step-kicker">{n:02d}</p>'+tx('s'+str(n),'h2')+body+'</div></section>'
s='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>#996 · Number of Squareful Arrays</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=1"></head><body><header class="site-head"><div class="head-top">'''
s+=tx('back','a','class="back-link" href="../../"')+'''<div id="langToggle" class="lang-toggle" role="group" aria-label="Language / 语言"><button type="button" data-lang="zh" lang="zh-CN">中</button><button type="button" data-lang="en" lang="en">EN</button></div></div>'''
s+=tx('collection','a','href="../"')+tx('title','h1')+tx('intro','p','class="tagline"')+'<div class="meta">'+tx('badge','span','class="badge"')+tx('official','a','class="official-link" href="https://leetcode.com/problems/number-of-squareful-arrays/"')+'</div></header><nav class="step-nav"><div class="step-nav-inner">'
s+=''.join(tx('nav'+str(i),'a',f'href="#step{i}"') for i in range(5))+'</div></nav><main>'
s+=section(0,tx('p0')+'<div class="stage">'+btn('handReveal','handBtn','data-step="0" aria-expanded="false"')+tx('hand','p','id="hand" class="readout" hidden')+'</div>'+tx('constraints','p','class="hint"'))
s+=section(1,tx('p1')+'''<pre tabindex="0"><code>from itertools import permutations
from math import isqrt

def baseline(nums):
    unique_orders = set(permutations(nums))
    answer = 0
    for order in unique_orders:
        if all(isqrt(a + b) ** 2 == a + b
               for a, b in zip(order, order[1:])):
            answer += 1
    return answer
</code></pre>'''+tx('baselineCost')+tx('wrong','p','class="question"'))
trace='<div class="stage" id="traceStage">'+tx('presets','label','for="preset"')+'<select id="preset" data-step="2">'+''.join(f'<option value="{i}">{a}</option>' for i,a in enumerate(['[1,17,8]','[2,2,2]','[0,0,1]','[1,1,8,8]','[3]','[1,2]']))+'</select><p id="presetDescription" class="hint"></p>'+tx('sim','p','class="hint"')+'<div class="controls">'+''.join(btn(id,key,'data-step="2"') for id,key in [('prev','prev'),('next','next'),('reset','reset'),('end','end')])+'</div><p id="progress" class="readout" role="status"></p><p id="operation" class="question" role="status"></p>'+tx('pathLabel','h3')+'<div id="path" class="trace-path"></div>'+tx('countsLabel','h3')+'<div id="counts" class="counts"></div>'+tx('ledgerLabel','h3')+'<ol id="ledger" class="ledger"></ol><p id="noOrders"></p></div>'
s+=section(2,''.join(tx(k,'p','class="formula"' if k=='formula' else '') for k in ['p2','derive','formula','proof','guide'])+tx('rel1','a','href="../51/#step2"')+trace)
s+=section(3,tx('p3')+'<fieldset class="prediction-options" data-step="3">'+tx('legend','legend')+''.join(f'<label><input type="radio" name="prediction" value="{i}">'+tx('opt'+str(i),'span')+'</label>' for i in range(3))+'</fieldset>'+btn('reveal','reveal','data-step="3" disabled')+'<p id="feedback" class="readout" role="status" hidden></p>')
s+=section(4,tx('p4')+tx('mapping')+'''<pre tabindex="0"><code id="pythonSource"></code></pre><div class="solution-actions">'''+btn('copy','copy','data-step="4"')+tx('download','a','id="download" href="solution.py" download="solution.py"')+'''</div><p id="copyStatus" role="status"></p><div id="manualCopy" hidden>'''+tx('manualLabel','label','for="manualSource"')+'''<textarea id="manualSource" readonly spellcheck="false"></textarea></div>'''+tx('cost')+tx('boundaries')+tx('related','h3')+'<div class="related">'+tx('rel1','a','href="../51/#step2"')+tx('rel2','a','href="../940/#step2"')+'</div>')
s+='</main>'+tx('foot','footer','class="site-foot"')+''.join(f'<script src="{f}"></script>' for f in ['../common.js','copy.js?v=1','core.js?v=1','python-code.js?v=1','app.js?v=1'])+'</body></html>\n'
(p/'index.html').write_text(s)

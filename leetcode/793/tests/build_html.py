from pathlib import Path
p=Path(__file__).resolve().parents[1]
def text(key,tag='p',cls='explain'):
 return f'<{tag} class="{cls}" data-i18n="{key}"></{tag}>'
def btn(id,key,step,primary=False):
 return f'<button type="button" class="btn{" primary" if primary else ""}" id="{id}" data-step="{step}" data-i18n="{key}"></button>'
def section(n,body):
 return f'<section class="step" id="step{n}"><div class="step-inner"><p class="step-kicker">0{n+1}</p>{text(f"s{n}t","h2","")}{body}</div></section>'
head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>#793 · Preimage Size of Factorial Zeroes Function</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=793-r1"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div class="lang-toggle" id="langToggle" aria-label="语言 / Language"><button type="button" data-lang="zh">中</button><button type="button" data-lang="en">EN</button></div></div><span class="badge" data-i18n="hard"></span><h1 data-i18n="title"></h1><p class="tagline" data-i18n="intro"></p><p data-i18n="constraints"></p><a class="official-link" href="https://leetcode.com/problems/preimage-size-of-factorial-zeroes-function/" target="_blank" rel="noopener" data-i18n="official"></a></header><nav class="step-nav" aria-label="学习步骤 / Lesson steps"><div class="step-nav-inner">'''
head+=''.join(f'<a href="#step{n}" data-i18n="nav{n}"></a>' for n in range(5))+'</div></nav><main>'
s0=section(0,text('s0e')+text('s0derive')+text('zeroFormula',cls='formula')+text('handTask',cls='hint')+'''<div class="stage"><label for="handX" data-i18n="xLabel"></label><div class="hand-controls">'''+btn('minus','minus',0)+'''<input type="range" id="handX" min="0" max="30" value="24" data-step="0">'''+btn('plus','plus',0)+btn('handReset','reset',0)+'''</div><div class="number" id="handValue"></div><p class="readout" id="handRead" aria-live="polite"></p><ul id="layers"></ul>'''+text('handLimit',cls='hint')+'</div>')
baseline='''def baseline(k):
    def f(x):
        total = 0
        while x:
            x //= 5
            total += x
        return total

    return sum(f(x) == k for x in range(5 * (k + 1)))
'''
s1=section(1,text('s1e')+'<div class="blocks" id="blocks"></div>'+text('proof')+text('wrong',cls='question')+text('baseline')+'<details><summary data-i18n="baseSource"></summary><pre tabindex="0" aria-label="基线 Python / Baseline Python"><code>'+baseline+'</code></pre></details>')
s2=section(2,text('s2e')+text('countFormula',cls='formula')+text('invariant',cls='question')+text('direction')+text('traceTask',cls='hint')+'''<div class="stage"><label for="preset" data-i18n="presetLabel"></label><select id="preset" data-step="2">'''+''.join(f'<option value="{i}">k = {k:,}</option>' for i,k in enumerate([0,3,5,6,24,1000000000]))+'</select>'+text('sim',cls='hint')+'<div class="controls">'+btn('prev','prev',2)+btn('next','next',2,True)+btn('traceReset','reset',2)+btn('end','end',2)+'</div><p class="readout" id="frameRead" aria-live="polite"></p><div class="interval"><div><span data-i18n="loLabel"></span><b id="loValue"></b></div><div><span data-i18n="hiLabel"></span><b id="hiValue"></b></div></div><p class="formula" id="operation"></p><p id="boundary"></p><p class="readout" id="result"></p>'+text('history','h3','')+text('empty',cls='hint')+'<ol id="traceHistory" class="trace-history"></ol></div>')
s3=section(3,text('s3e')+'''<div class="stage"><label for="quiz" data-i18n="quizLabel"></label><select id="quiz" data-step="3"><option value="29">k = 29</option><option value="31">k = 31</option></select><fieldset class="prediction-options"><legend data-i18n="predictionLegend"></legend>'''+''.join(f'<label><input type="radio" name="prediction" value="{i}" data-step="3"><span data-i18n="option{i}"></span></label>' for i in range(3))+'</fieldset><div class="controls">'+btn('reveal','reveal',3,True)+btn('predictionReset','reset',3)+'</div><p class="readout" id="feedback" aria-live="polite"></p></div>')
s4=section(4,text('s4e')+'<ul>'+''.join(text('map'+str(i),'li','') for i in range(1,4))+'</ul>'+text('cost')+text('bounds')+'<div class="solution-actions">'+btn('copyPython','copy',4,True)+'''<a class="btn" href="solution.py" download data-i18n="download"></a><span role="status" id="copyStatus"></span></div><div id="sourceFallback" hidden><label for="manualSource" data-i18n="manualCopy"></label><textarea id="manualSource" readonly spellcheck="false" rows="12"></textarea></div><details id="sourceDetails"><summary data-i18n="source"></summary><pre tabindex="0" aria-label="Python 源码 / Python source"><code id="pythonCode"></code></pre></details><div class="related"><a href="../4/#step2" data-i18n="related1"></a><a href="../668/#step2" data-i18n="related2"></a></div>''')
foot='''</main><footer class="site-foot" data-i18n="foot"></footer><noscript>请启用 JavaScript。 / Enable JavaScript. <a href="solution.py">Python</a></noscript><script src="../common.js"></script><script src="copy.js?v=793-r1"></script><script src="core.js?v=793-r1"></script><script src="python-code.js?v=793-r1"></script><script src="app.js?v=793-r1"></script></body></html>'''
(p/'index.html').write_text(head+s0+s1+s2+s3+s4+foot)

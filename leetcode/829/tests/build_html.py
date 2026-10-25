"""Lesson-local deterministic HTML authoring helper; owns only ../index.html."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]
def txt(key,tag='p',cls='explain'):
    return f'<{tag} class="{cls}" data-i18n="{key}"></{tag}>'
def button(id,key,step,primary=False):
    return f'<button type="button" id="{id}" class="btn'+(' primary' if primary else '')+f'" data-step="{step}" data-i18n="{key}"></button>'
def section(i,body):
    return f'<section class="step" id="step{i}"><div class="step-inner"><p class="step-kicker">0{i+1}</p>'+txt(f's{i}t','h2','')+body+'</div></section>'
head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>#829 Consecutive Numbers Sum</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=829-r5"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div id="langToggle" class="lang-toggle" aria-label="语言 / Language"><button data-lang="zh" type="button">中</button><button data-lang="en" type="button">EN</button></div></div><span class="badge" data-i18n="hard"></span><h1 data-i18n="title"></h1><p class="tagline" data-i18n="intro"></p><a class="official-link" href="https://leetcode.com/problems/consecutive-numbers-sum/" target="_blank" rel="noopener" data-i18n="official"></a></header><nav class="step-nav" aria-label="学习步骤 / Lesson steps"><div class="step-nav-inner">'''
head+=''.join(f'<a href="#step{i}" data-i18n="nav{i}"></a>' for i in range(5))+'</div></nav><main>'
s0=txt('s0e')+txt('contract')+txt('handTask',cls='hint')+'<div class="stage"><div class="controls">'+''.join(button('hand'+str(i),'length'+str(i),0) for i in range(1,4))+button('handReset','reset',0)+'</div><div id="tiles" class="tiles"></div><p id="handRead" class="readout" aria-live="polite"></p></div>'
s1=txt('s1e')+'''<details><summary data-i18n="baselineCode"></summary><pre tabindex="0" aria-label="基线 Python / Baseline Python"><code>def baseline(n):
    answer = 0
    for a in range(1, n + 1):
        total = 0
        for end in range(a, n + 1):
            total += end
            if total == n:
                answer += 1
    return answer
</code></pre></details>'''+txt('baselineCost')+txt('wrong',cls='question')
s2=txt('s2e')+txt('formula',cls='formula')+txt('derive')+txt('zeroTrap',cls='question')+txt('invariant')+txt('traceTask',cls='hint')+'<div class="stage"><label for="preset" data-i18n="presetLabel"></label><select id="preset" data-step="2">'+''.join(f'<option value="{n}">n = {n}</option>' for n in [5,9,15,1,8,16,45])+'</select>'+txt('sim',cls='hint')+'<div class="controls">'+button('prev','prev',2)+button('next','next',2,True)+button('traceReset','reset',2)+button('end','end',2)+'</div><p id="frameRead" class="readout" aria-live="polite"></p><p id="event" class="formula"></p>'+txt('ledgerTitle','h3','')+'<ol id="ledger" class="ledger"></ol><p id="guard" class="hint"></p></div>'
s3=txt('s3e')+'<div class="stage"><fieldset class="prediction-options"><legend data-i18n="predictionLegend"></legend>'+''.join(f'<label><input type="radio" name="prediction" value="{i}" data-step="3"><span data-i18n="option{i}"></span></label>' for i in range(3))+'</fieldset><div class="controls">'+button('reveal','reveal',3,True)+button('quizReset','reset',3)+'</div><p id="feedback" class="readout" aria-live="polite"></p></div>'
s4=txt('s4e')+'<ul>'+''.join(txt('map'+str(i),'li','') for i in range(1,4))+'</ul>'+txt('cost')+txt('boundaries')+'<div class="solution-actions">'+button('copyPython','copy',4,True)+'<a class="btn" href="solution.py" download data-i18n="download"></a><span id="copyStatus" role="status"></span></div><div id="sourceFallback" hidden><label for="manualSource" data-i18n="manualCopy"></label><textarea id="manualSource" readonly rows="12" spellcheck="false"></textarea></div><details id="sourceDetails"><summary data-i18n="source"></summary><pre tabindex="0" aria-label="Python 源码 / Python source"><code id="pythonCode"></code></pre></details><div class="related"><a href="../483/#step2" data-i18n="related1"></a><a href="../233/#step2" data-i18n="related2"></a></div>'
foot='</main><footer class="site-foot" data-i18n="foot"></footer><noscript>请启用 JavaScript。 / Enable JavaScript. <a href="solution.py">Python</a></noscript>'+''.join(f'<script src="{s}"></script>' for s in ['../common.js','copy.js?v=829-r5','core.js?v=829-r5','python-code.js?v=829-r5','app.js?v=829-r5'])+'</body></html>\n'
p.joinpath('index.html').write_text(head+''.join(section(i,s) for i,s in enumerate([s0,s1,s2,s3,s4]))+foot)

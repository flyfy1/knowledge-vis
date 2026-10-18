# Rebuild static markup; no shared files are modified.
from pathlib import Path
p=Path(__file__).resolve().parents[1]
def txt(key,tag='p',cls='explain'):
 return f'<{tag} class="{cls}" data-i18n="{key}"></{tag}>'
def section(i,body):
 return f'<section class="step" id="step{i}" data-step="{i}"><div class="step-inner"><p class="step-kicker">0{i+1}</p><h2 data-i18n="s{i}"></h2>{body}</div></section>'
head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>#126 · Word Ladder II</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=126-1"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div class="lang-toggle" id="langToggle" role="group" aria-label="Language / 语言"><button type="button" data-lang="zh">中</button><button type="button" data-lang="en">EN</button></div></div><p class="eyebrow" data-i18n="meta"></p><h1 data-i18n="title"></h1><p class="tagline" data-i18n="topic"></p><a class="official-link" href="https://leetcode.com/problems/word-ladder-ii/" target="_blank" rel="noopener noreferrer" data-i18n="official"></a></header><nav class="step-nav" aria-label="Lesson steps / 学习步骤"><div class="step-nav-inner">'''
head+=''.join(f'<a href="#step{i}" data-i18n="s{i}"></a>' for i in range(5))+'</div></nav><main>'
s0=txt('statement')+txt('constraints','p','hint')+txt('hand')+'<div class="hand-routes"><code>aa → ab → bb</code><code>aa → ba → bb</code></div>'+txt('baseline')
s0 += '<details><summary data-i18n="baselineCode"></summary><pre tabindex="0" aria-label="Baseline Python / 基线 Python"><code>'+"""from collections import deque

def baseline(begin, end, words):
    queue = deque([[begin]])
    answer, best = [], None
    while queue:
        path = queue.popleft()
        if best is not None and len(path) &gt; best:
            break
        if path[-1] == end:
            best = len(path)
            answer.append(path)
            continue
        for word in words:
            if word not in path and sum(a != b for a, b in zip(path[-1], word)) == 1:
                queue.append(path + [word])
    return answer"""+'</code></pre></details>'
s1=''.join(txt(k) for k in ['derive','observations','rule','stop'])
s2=txt('task')+txt('simulation','p','hint')+'<div class="stage"><label for="preset" data-i18n="presets"></label><select id="preset">'+''.join(f'<option value="{i}" data-i18n="p{i}"></option>' for i in range(6))+'</select><p id="dictionary" class="hint"></p><div class="controls">'+''.join(f'<button type="button" class="btn {"primary" if k=="next" else ""}" id="{k}" data-i18n="{c}"></button>' for k,c in [('prev','prev'),('next','next'),('end','finish'),('reset','reset')])+'</div><label for="position" data-i18n="position"></label><input type="range" id="position" min="0" value="0"><p id="progress" class="hint"></p><p class="readout" id="message" role="status"></p><p id="queue"></p><div id="layers"></div><h3 data-i18n="history"></h3><ol id="history"></ol><h3 data-i18n="answers"></h3><div id="answers"></div></div>'
s3='<fieldset class="prediction-options"><legend data-i18n="quiz"></legend>'+''.join(f'<label><input type="radio" name="prediction" value="{i}"><span data-i18n="o{i}"></span></label>' for i in range(3))+'</fieldset><button type="button" class="btn primary" id="reveal" data-i18n="reveal" disabled></button><p id="feedback" class="readout" role="status" hidden></p>'
s4=''.join(txt(k) for k in ['proof','mapping','cost','boundaries'])+'''<div class="solution-actions"><button type="button" class="btn primary" id="copy" data-i18n="copy"></button><a href="solution.py" download data-i18n="download"></a><span id="copyStatus" role="status"></span></div><div id="manualCopy" hidden><label for="copyText" data-i18n="fallback"></label><textarea id="copyText" rows="10" readonly></textarea></div><details id="sourceDetails"><summary data-i18n="source"></summary><pre tabindex="0" aria-label="Python source / Python 源码"><code id="pythonCode"></code></pre></details>'''+txt('verify')+txt('related','h3')+'<div class="related"><a href="../51/#step2" data-i18n="related0"></a><a href="../115/#step1" data-i18n="related1"></a></div>'
foot='</main><footer class="site-foot" data-i18n="foot"></footer><noscript>请启用 JavaScript。 / Enable JavaScript. <a href="solution.py">Python</a></noscript><script src="../common.js"></script>'+''.join(f'<script src="{f}.js?v=126-1"></script>' for f in ['copy','core','python-code','app'])+'</body></html>'
(p/'index.html').write_text(head+''.join(section(i,s) for i,s in enumerate([s0,s1,s2,s3,s4]))+foot)

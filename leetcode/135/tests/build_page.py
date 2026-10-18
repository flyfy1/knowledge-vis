"""Rebuild this lesson's static markup only; no shared outputs."""
from pathlib import Path
P=Path(__file__).resolve().parents[1]
def para(k,cls='explain'):return f'<p class="{cls}" data-i18n="{k}"></p>'
def button(id,k):return f'<button type="button" class="btn" id="{id}" data-i18n="{k}"></button>'
def section(i,body):return f'<section class="step" id="step{i}" data-step="{i}"><div class="step-inner"><p class="step-kicker">0{i+1}</p><h2 data-i18n="s{i}"></h2>{para("q"+str(i),"question")}{body}</div></section>'
baseline='''def baseline(ratings):
    n = len(ratings)
    candies = [1] * n
    for _ in range(n - 1):
        old = candies[:]
        for i in range(n):
            for j in (i - 1, i + 1):
                if 0 <= j < n and ratings[i] > ratings[j]:
                    candies[i] = max(candies[i], old[j] + 1)
    return sum(candies)'''
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>#135 Candy</title><link rel="icon" href="data:,"><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=135-1"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div id="langToggle" class="lang-toggle" role="group"><button type="button" data-lang="zh">中</button><button type="button" data-lang="en">EN</button></div></div><span class="badge" data-i18n="badge"></span><h1 data-i18n="title"></h1><p class="tagline" data-i18n="intro"></p><a class="official-link" href="https://leetcode.com/problems/candy/" target="_blank" rel="noopener" data-i18n="official"></a></header><nav class="step-nav"><div class="step-nav-inner">'''
html+=''.join(f'<a href="#step{i}" data-i18n="s{i}"></a>' for i in range(5))+'</div></nav><main>'
html+=section(0,para('statement')+para('constraints','hint')+para('hand')+'<div class="hand-row">'+''.join(f'<div><span data-i18n="child{i}"></span><b data-i18n="candies{3-i}"></b></div>' for i in range(3))+'</div>'+para('equal'))
html+=section(1,para('baseline')+'<pre><code>'+baseline+'</code></pre>'+para('baselineCost')+para('wrong','question'))
stage='<div class="stage">'+para('simulation','hint')+'<label for="preset" data-i18n="preset"></label><select id="preset">'+''.join(f'<option value="{i}" data-i18n="p{i}"></option>' for i in range(6))+'</select><div class="range-group"><label id="editLabel" for="middle"></label><input type="range" id="middle" min="0" max="5" value="2"><output id="middleValue" for="middle"></output></div><div class="controls">'+''.join(button(i,k) for i,k in [('prev','prev'),('next','next'),('reset','reset'),('end','end')])+'</div><label for="position" data-i18n="position"></label><input id="position" type="range" min="0" value="0"><p id="progress" aria-live="polite"></p><div class="table-wrap"><table id="bounds"><thead id="tableHead"></thead><tbody id="tableBody"></tbody></table></div><p class="readout" id="calculation" aria-live="polite"></p><p class="readout" id="total"></p><h3 data-i18n="history"></h3><ol class="trace-log" id="history"></ol></div>'
html+=section(2,para('definitions')+para('derive')+para('invariant','question')+para('task')+stage)
html+=section(3,'<fieldset class="prediction-options"><legend data-i18n="quiz"></legend>'+''.join(f'<label><input type="radio" name="prediction" value="{i}"><span data-i18n="option{i}"></span></label>' for i in range(3))+'</fieldset>'+button('reveal','reveal')+'<p id="feedback" class="readout" hidden aria-live="polite"></p>')
html+=section(4,para('proof')+para('proof2')+'<ul>'+''.join(f'<li data-i18n="map{i}"></li>' for i in range(3))+'</ul>'+para('cost','question')+para('boundaries')+'<div class="solution-actions">'+button('copy','copy')+'<a href="solution.py" download data-i18n="download"></a><span id="copyStatus" role="status"></span></div><div id="manualCopy" hidden><label for="copyText" data-i18n="fallback"></label><textarea id="copyText" rows="10" readonly></textarea></div><details id="sourceDetails"><summary data-i18n="source"></summary><pre><code id="pythonCode"></code></pre></details>'+para('verify')+'<h3 data-i18n="related"></h3><div class="related"><a href="../42/#step1" data-i18n="related0"></a><a href="../41/#step1" data-i18n="related1"></a></div>')
html+='</main><footer class="site-foot" data-i18n="foot"></footer><noscript>交互需要 JavaScript。 / Enable JavaScript for interaction.</noscript><script src="../common.js"></script><script src="copy.js?v=135-1"></script><script src="core.js?v=135-1"></script><script src="python-code.js?v=135-1"></script><script src="app.js?v=135-1"></script></body></html>'
(P/'index.html').write_text(html)

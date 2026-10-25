from pathlib import Path
p=Path(__file__).resolve().parents[1]
def para(key,cls='explain'): return f'<p class="{cls}" data-i18n="{key}"></p>'
def button(id,key,step,primary=False):return f'<button type="button" data-step="{step}" id="{id}" class="btn'+(' primary' if primary else '')+f'" data-i18n="{key}"></button>'
def section(i,body):return f'<section class="step" id="step{i}"><div class="step-inner"><p class="step-kicker">0{i+1}</p><h2 data-i18n="s{i}t"></h2>{body}</div></section>'
baseline='''def baseline(nums, k):
    m = len(nums) - k + 1
    w = [sum(nums[i:i+k]) for i in range(m)]
    best_sum, answer = -1, None
    for a in range(m):
        for b in range(a+k, m):
            for c in range(b+k, m):
                triple = [a, b, c]
                total = w[a] + w[b] + w[c]
                if (total > best_sum or
                    (total == best_sum and triple < answer)):
                    best_sum, answer = total, triple
    return answer
'''
head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>#689 · Maximum Sum of 3 Non-Overlapping Subarrays</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=689-1"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div id="langToggle" class="lang-toggle" aria-label="语言 / Language"><button type="button" data-lang="zh">中</button><button type="button" data-lang="en">EN</button></div></div><span class="badge" data-i18n="hard"></span><h1 data-i18n="title"></h1><p class="tagline" data-i18n="intro"></p><a class="official-link" href="https://leetcode.com/problems/maximum-sum-of-3-non-overlapping-subarrays/" target="_blank" rel="noopener" data-i18n="official"></a></header><nav class="step-nav" aria-label="学习步骤 / Lesson steps"><div class="step-nav-inner">'''
head+=''.join(f'<a href="#step{i}" data-i18n="nav{i}"></a>' for i in range(5))+'</div></nav><main>'
s0=para('s0e')+para('contract')+para('handTask','hint')+'<div class="stage"><div id="handWindows" class="windows"></div>'+button('handToggle','handShow',0)+'<p id="handRead" class="readout" aria-live="polite"></p></div>'
s1=''.join(para(x) for x in ['s1e','handTable','proof','wrong','baseline'])+f'<details><summary data-i18n="baselineCode"></summary><pre tabindex="0" aria-label="基线 Python / Baseline Python"><code>{baseline.replace("<","&lt;")}</code></pre></details>'
s2=''.join(para(x,'formula' if x=='formula' else 'hint' if x=='traceTask' else 'explain') for x in ['s2e','invariant','formula','traceTask'])+'<div class="stage"><label for="preset" data-i18n="presetLabel"></label><select id="preset" data-step="2">'+''.join(f'<option value="{i}" data-i18n="preset{i}"></option>' for i in range(5))+'</select>'+para('sim','hint')+'<p id="inputRead"></p><div class="controls">'+''.join(button(id,key,2,id=='traceNext') for id,key in [('tracePrev','prev'),('traceNext','next'),('traceReset','reset'),('traceLast','end')])+'</div><p id="frameRead" class="readout" aria-live="polite"></p><h3 data-i18n="windowsTitle"></h3><div id="windows" class="windows"></div><div id="tableWrap" class="table-wrap" tabindex="0" role="region" aria-label="摘要累计表 / Accumulated summaries"><table><caption data-i18n="tableTitle"></caption><thead><tr>'+''.join('<th scope="col" data-i18n="'+key+'"></th>' for key in ['thI','thW','thL','thR'])+'</tr></thead><tbody id="summaryRows"></tbody></table></div><p id="bestRead" class="readout"></p><h3 data-i18n="ledgerTitle"></h3>'+para('empty','hint')+'<ol id="ledger" class="ledger-list"></ol></div>'
s3=para('s3e')+'<div class="stage"><fieldset class="prediction-options"><legend data-i18n="predictionLegend"></legend>'+''.join(f'<label><input type="radio" name="prediction" data-step="3" value="{i}"> {val}</label>' for i,val in enumerate(['[0,2,6]','[1,2,4]','[0,2,4]']))+'</fieldset><div class="controls">'+button('reveal','reveal',3,True)+button('predictionReset','reset',3)+'</div><p id="predictionFeedback" class="readout" aria-live="polite"></p></div>'
s4=para('s4e')+'<ul>'+''.join('<li data-i18n="'+k+'"></li>' for k in ['map1','map2','map3'])+'</ul>'+para('cost')+para('boundaries')+'<div class="solution-actions">'+button('copyPython','copy',4,True)+'<a class="btn" href="solution.py" download data-i18n="download"></a><span id="copyStatus" role="status"></span></div><div id="sourceFallback" hidden><label for="manualSource" data-i18n="manualCopy"></label><textarea id="manualSource" rows="12" readonly spellcheck="false"></textarea></div><details id="sourceDetails"><summary data-i18n="source"></summary><pre tabindex="0" aria-label="Python 源码 / Python source"><code id="pythonCode"></code></pre></details><div class="related"><a href="../239/#step2" data-i18n="related1"></a><a href="../123/#step2" data-i18n="related2"></a></div>'
foot='</main><footer class="site-foot" data-i18n="foot"></footer><noscript>请启用 JavaScript。 / Enable JavaScript. <a href="solution.py">Python</a></noscript>'+''.join(f'<script src="{src}"></script>' for src in ['../common.js','copy.js?v=689-1','core.js?v=689-1','python-code.js?v=689-1','app.js?v=689-1'])+'</body></html>\n'
(p/'index.html').write_text(head+''.join(section(i,b) for i,b in enumerate([s0,s1,s2,s3,s4]))+foot)

# Rebuild only this lesson's static skeleton and exact Python mirror.
import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]
(p/'python-code.js').write_text('window.PYTHON_SOURCE = '+json.dumps((p/'solution.py').read_text(),ensure_ascii=False)+';\n')
def para(k,cls='explain'):return f'<p class="{cls}" data-i18n="{k}"></p>'
def button(id,k,step):return f'<button type="button" class="btn" id="{id}" data-step="{step}" data-i18n="{k}"></button>'
def section(i,body):return f'<section class="step" id="step{i}"><div class="step-inner"><p class="step-kicker">0{i+1}</p><h2 data-i18n="s{i}t"></h2>{para(f"s{i}e")}{body}</div></section>'
baseline='''from collections import deque

def baseline(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    answer = []
    for start in range(n):
        distance = [-1] * n
        distance[start] = 0
        queue = deque([start])
        while queue:
            u = queue.popleft()
            for v in graph[u]:
                if distance[v] == -1:
                    distance[v] = distance[u] + 1
                    queue.append(v)
        answer.append(sum(distance))
    return answer
'''
(p/'tests/baseline.py').write_text(baseline)
import html
s0=para('contract')+para('handTask','hint')+'<div class="stage"><div id="handGraph"></div><div role="group" aria-label="选择起点 / Choose starting node" id="handControls" class="controls"></div><p id="handRead" class="readout" aria-live="polite"></p><div id="handTable"></div>'+button('handReset','reset',0)+'</div>'
s1=para('baselineCost')+para('wrong','question')+'<details><summary data-i18n="baselineCode"></summary><pre tabindex="0"><code>'+html.escape(baseline)+'</code></pre></details>'
s2=''.join(para(k) for k in ['derive','formula','fillExplain','invariant','traceTask','sim'])+'<div class="stage"><label for="preset" data-i18n="presetLabel"></label><select id="preset" data-step="2">'+''.join(f'<option value="{i}" data-i18n="preset{i}"></option>' for i in range(5))+'</select><div class="controls">'+''.join(button(id,k,2) for id,k in [('prev','prev'),('next','next'),('end','end'),('traceReset','reset')])+'</div><p id="frameRead" class="readout" aria-live="polite"></p><p id="order" class="hint"></p><div id="traceGraph"></div><p class="hint" data-i18n="tableScroll"></p><div class="table-wrap" tabindex="0" id="traceTable"></div><h3 data-i18n="ledgerTitle"></h3><p id="empty" data-i18n="empty"></p><ol id="ledger" class="trace-log"></ol></div>'
s3='<div class="stage"><div id="quizGraph"></div><fieldset class="prediction-options"><legend data-i18n="predictionLegend"></legend>'+''.join(f'<label><input type="radio" name="prediction" value="{i}" data-step="3"><span data-i18n="option{i}"></span></label>' for i in range(3))+'</fieldset><div class="controls">'+button('reveal','reveal',3)+button('quizReset','reset',3)+'</div><p id="feedback" class="readout" aria-live="polite"></p></div>'
s4='<ul>'+''.join(f'<li data-i18n="map{i}"></li>' for i in range(1,4))+'</ul>'+para('cost')+para('boundaries')+'<div class="solution-actions">'+button('copyPython','copy',4)+'<a class="btn" href="solution.py" download data-i18n="download"></a><span id="copyStatus" role="status"></span></div><div id="sourceFallback" hidden><label for="manualSource" data-i18n="manualCopy"></label><textarea id="manualSource" readonly rows="12" spellcheck="false"></textarea></div><details id="sourceDetails"><summary data-i18n="source"></summary><pre tabindex="0" aria-label="Python 源码 / Python source"><code id="pythonCode"></code></pre></details><div class="related"><a href="#step2" data-i18n="related1"></a><a href="#step0" data-i18n="related2"></a></div>'
page='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>#834 · Sum of Distances in Tree</title><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=834-r3"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div id="langToggle" class="lang-toggle" aria-label="语言 / Language"><button type="button" data-lang="zh">中</button><button type="button" data-lang="en">EN</button></div></div><span class="badge" data-i18n="hard"></span><h1 data-i18n="title"></h1><p class="tagline" data-i18n="intro"></p><a class="official-link" href="https://leetcode.com/problems/sum-of-distances-in-tree/" target="_blank" rel="noopener" data-i18n="official"></a></header><nav class="step-nav" aria-label="学习步骤 / Lesson steps"><div class="step-nav-inner">'''+''.join(f'<a href="#step{i}" data-i18n="nav{i}"></a>' for i in range(5))+'</div></nav><main>'+''.join(section(i,b) for i,b in enumerate([s0,s1,s2,s3,s4]))+'</main><footer class="site-foot" data-i18n="foot"></footer><noscript>请启用 JavaScript。 / Enable JavaScript. <a href="solution.py">Python</a></noscript>'+''.join(f'<script src="{s}"></script>' for s in ['../common.js','copy.js?v=834-r3','core.js?v=834-r3','python-code.js?v=834-r3','app.js?v=834-r3'])+'</body></html>'
(p/'index.html').write_text(page)
entry={'id':834,'title':{'zh':'树中距离之和','en':'Sum of Distances in Tree'},'desc':{'zh':'切开一条边，数清变近和变远的节点，推导线性换根算法。','en':'Cut one edge, count who gets closer or farther, and derive linear rerooting.'},'difficulty':'hard','topics':[{'zh':'树','en':'Tree'},{'zh':'换根动态规划','en':'Rerooting DP'}],'path':'834/','leetcodeUrl':'https://leetcode.com/problems/sum-of-distances-in-tree/','language':'Python','complexity':'O(n) time; O(n) auxiliary space','concepts':[{'name':'Edge-cut rerooting','step':2,'description':'Subtract the child-side count and add the outside count when moving the start.'},{'name':'Subtree distance summaries','step':2,'description':'Merge children before parents to obtain subtree sizes and distance sums.'}]}
(p/'lesson-entry.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n')

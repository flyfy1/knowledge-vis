"""Local markup builder; writes only this lesson's index.html and metadata."""
from pathlib import Path
import json
P=Path(__file__).resolve().parents[1]
def text(tag,key,cls=''):
 return f'<{tag}'+(f' class="{cls}"' if cls else '')+f' data-i18n="{key}"></{tag}>'
def para(key,cls='explain'):return text('p',key,cls)
def section(n,body):return f'<section class="step" id="step{n}" data-step="{n}"><div class="step-inner"><p class="step-kicker">0{n+1}</p>'+text('h2',f's{n}')+body+'</div></section>'
baseline='''from collections import Counter

def baseline(s, t):
    need = Counter(t)
    best = None
    for left in range(len(s)):
        have = Counter()
        for right in range(left, len(s)):
            have[s[right]] += 1
            if all(have[c] >= need[c] for c in need):
                width = right - left + 1
                if best is None or width < best[1] - best[0]:
                    best = (left, right + 1)
    return "" if best is None else s[best[0]:best[1]]'''
import html
body=section(0,para('statement')+para('constraints','hint')+text('h3','handTitle')+para('hand')+para('wrong','question')+para('examples','hint')+text('h3','baselineTitle')+para('baseline')+'<pre><code>'+html.escape(baseline)+'</code></pre>'+para('baselineCost'))
body+=section(1,para('derive')+para('thresholds')+para('formula','formula')+para('rule'))
experiment=para('task')+para('simulation','hint')+para('stateHelp','question')+'<div class="stage"><label for="preset" data-i18n="presets"></label><select id="preset">'+''.join(f'<option value="{i}" data-i18n="p{i}"></option>' for i in range(6))+'<option value="custom" disabled data-i18n="customPreset"></option></select><form id="customForm">'+para('custom','hint')+'<div class="input-pair"><label for="inputS">s<input id="inputS" type="text" maxlength="18" value="ABAAC" autocomplete="off" spellcheck="false"></label><label for="inputT">t<input id="inputT" type="text" maxlength="18" value="AAC" autocomplete="off" spellcheck="false"></label></div><button type="submit" class="btn" data-i18n="apply"></button></form><p id="validation" role="status" hidden></p><div class="controls">'+''.join(f'<button type="button" class="btn{ " primary" if x=="next" else ""}" id="{x}" data-i18n="{x}"></button>' for x in ['prev','next','reset'])+'</div><label for="position" data-i18n="position"></label><input id="position" type="range" min="0" value="0" max="1"><p id="progress" class="hint"></p><p id="message" class="readout" aria-live="polite"></p>'+text('h3','windowTitle')+para('legend','hint')+'<div id="tiles" class="tiles"></div><p id="state" class="readout"></p><p id="best" class="readout"></p>'+text('h3','counts')+'<table><thead><tr>'+''.join(text('th',k) for k in ['hChar','hNeed','hHave','hDeficit'])+'</tr></thead><tbody id="counts"></tbody></table>'+text('h3','ledger')+para('ledgerHint','hint')+'<div id="ledgerWrap" class="table-wrap" tabindex="0"><table><thead><tr>'+''.join(text('th',k) for k in ['hEvent','hWindow','hMissing','hBest'])+'</tr></thead><tbody id="rows"></tbody></table></div></div>'
body+=section(2,experiment)
body+=section(3,'<fieldset class="prediction-options">'+text('legend','quizQuestion')+''.join(f'<label><input type="radio" name="prediction" value="{i}"><span data-i18n="option{i}"></span></label>' for i in range(3))+'</fieldset><button id="reveal" type="button" class="btn primary" data-i18n="reveal" disabled></button><p id="feedback" class="readout" aria-live="polite" hidden></p>')
body+=section(4,para('proof')+para('proof2')+text('h3','mapping')+'<ul>'+''.join(text('li',k) for k in ['map1','map2','map3'])+'</ul>'+para('complexity','question')+para('boundaries')+'<div class="solution-actions"><button type="button" class="btn primary" id="copy" data-i18n="copy"></button><a href="solution.py" download data-i18n="download"></a><span id="copyStatus" aria-live="polite"></span></div><div id="manualCopy" hidden><label for="copyText" data-i18n="fallback"></label><textarea id="copyText" readonly rows="8"></textarea></div><details id="sourceDetails"><summary data-i18n="fullCode"></summary><pre><code id="pythonCode"></code></pre></details>'+text('h3','verifyTitle')+para('verify')+text('h3','related')+'<div class="related"><a href="../30/#step2" data-i18n="related0"></a><a href="../42/#step2" data-i18n="related1"></a></div>')
page='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>#76 · Minimum Window Substring</title><meta name="description" content="A bilingual interactive derivation of the minimum covering window, with duplicate counts, reversible traces and Python."><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=76-r1"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div class="lang-toggle" id="langToggle" role="group" aria-label="Language / 语言"><button type="button" data-lang="zh">中</button><button type="button" data-lang="en">EN</button></div></div>'''+para('meta','eyebrow')+text('h1','title')+para('topic','tagline')+'<a class="official-link" href="https://leetcode.com/problems/minimum-window-substring/" target="_blank" rel="noopener noreferrer" data-i18n="official"></a></header><nav class="step-nav" aria-label="Lesson steps / 学习步骤"><div class="step-nav-inner">'+''.join(f'<a href="#step{i}" data-i18n="s{i}"></a>' for i in range(5))+'</div></nav><main>'+body+'</main>'+text('footer','foot','site-foot')+'<noscript>交互需要 JavaScript，请启用后重新加载。 / Enable JavaScript and reload for interaction. <a href="solution.py">Python</a></noscript>'+''.join(f'<script src="{name}"></script>' for name in ['../common.js','copy.js?v=76-r1','core.js?v=76-r1','python-code.js?v=76-r1','app.js?v=76-r1'])+'</body></html>\n'
page=page.replace('<pre>', '<pre tabindex="0" aria-label="Python source / Python 源码">')
page=page.replace('<th data-i18n=', '<th scope="col" data-i18n=')
(P/'index.html').write_text(page)
entry={'id':76,'title':{'zh':'最小覆盖子串','en':'Minimum Window Substring'},'desc':{'zh':'按副本计数，扩展覆盖后收缩，推导线性最小窗口。','en':'Count required copies, expand to cover, then shrink to derive a linear minimum-window scan.'},'difficulty':'hard','topics':[{'zh':'滑动窗口','en':'Sliding window'},{'zh':'字符计数','en':'Character counts'}],'path':'76/','leetcodeUrl':'https://leetcode.com/problems/minimum-window-substring/','language':'Python','complexity':'O(m+n) time; O(k) auxiliary space, k≤52; O(L) output','concepts':[{'name':'Covering by multiplicity','step':0,'description':'A contiguous window must supply every requested copy.'},{'name':'Missing-copy invariant','step':1,'description':'Maintain the sum of positive count deficits using threshold crossings.'},{'name':'Monotone window boundaries','step':4,'description':'Discarded starts cannot improve the recorded answer at later right edges.'}]}
(P/'lesson-entry.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2)+'\n')

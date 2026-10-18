"""Rebuild only this lesson's static shell; no shared files are written."""
from pathlib import Path
p=Path(__file__).resolve().parents[1]
def text(key,tag='p',cls='explain'):
    return f'<{tag} class="{cls}" data-i18n="{key}"></{tag}>'
def section(i,body):
    return f'<section class="step" id="step{i}" data-step="{i}"><div class="step-inner"><p class="step-kicker">0{i+1}</p>'+text(f's{i}','h2','')+body+'</div></section>'
start='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>#87 · Scramble String</title><meta name="description" content="A bilingual interactive lesson on recursive splits and interval dynamic programming."><link rel="stylesheet" href="../style.css"><link rel="stylesheet" href="style.css?v=87-r1"></head><body><header class="site-head"><div class="head-top"><a class="back-link" href="../" data-i18n="back"></a><div class="lang-toggle" id="langToggle" role="group" aria-label="Language / 语言"><button type="button" data-lang="zh">中</button><button type="button" data-lang="en">EN</button></div></div>'''+text('meta','p','eyebrow')+text('title','h1','')+text('topic','p','tagline')+'''<a class="official-link" href="https://leetcode.com/problems/scramble-string/" target="_blank" rel="noopener noreferrer" data-i18n="official"></a></header><nav class="step-nav" aria-label="Lesson steps / 学习步骤"><div class="step-nav-inner">'''+''.join(f'<a href="#step{i}" data-i18n="s{i}"></a>' for i in range(5))+'</div></nav><main>'
baseline='''from functools import cache

@cache
def outcomes(s):
    if len(s) == 1:
        return {s}
    result = set()
    for k in range(1, len(s)):
        for left in outcomes(s[:k]):
            for right in outcomes(s[k:]):
                result.add(left + right)
                result.add(right + left)
    return result

# Small-input oracle: s2 in outcomes(s1)'''
import html
s0=section(0,text('statement')+text('constraints','p','hint')+text('hand')+text('wrong','p','question')+text('examples','p','hint')+text('baselineTitle','h3','')+text('baseline')+'<pre tabindex="0" aria-label="Python baseline / Python 基线"><code>'+html.escape(baseline)+'</code></pre>')
s1=section(1,text('derive')+text('stateDef')+text('formula','p','formula')+text('rule'))
s2=section(2,text('task')+text('simulation','p','hint')+text('legend','p','question')+'''<div class="stage"><label for="preset" data-i18n="presets"></label><select id="preset">'''+''.join(f'<option value="{i}" data-i18n="p{i}"></option>' for i in range(6))+'''<option value="custom" disabled data-i18n="customPreset"></option></select><form id="customForm">'''+text('custom','p','hint')+'''<div class="input-pair"><label for="inputA">s1<input id="inputA" type="text" maxlength="5" value="ab" autocomplete="off" spellcheck="false"></label><label for="inputB">s2<input id="inputB" type="text" maxlength="5" value="ba" autocomplete="off" spellcheck="false"></label></div><button type="submit" class="btn" data-i18n="apply"></button></form><p id="validation" role="status" hidden></p><div class="controls"><button class="btn" id="prev" type="button" data-i18n="prev"></button><button class="btn primary" id="next" type="button" data-i18n="next"></button><button class="btn" id="reset" type="button" data-i18n="reset"></button></div><label for="position" data-i18n="position"></label><input id="position" type="range" min="0" max="1" value="0"><p id="progress" class="hint"></p><p id="message" class="readout" aria-live="polite"></p><div id="pairs" class="alignments"></div>'''+text('tableTitle','h3','')+'''<div id="tables"></div>'''+text('ledger','h3','')+text('ledgerHint','p','hint')+'''<div class="table-wrap ledger-wrap" id="ledgerWrap" tabindex="0"><table><thead><tr>'''+''.join(f'<th scope="col" data-i18n="{k}"></th>' for k in ['hState','hCut','hKeep','hSwap','hValue'])+'''</tr></thead><tbody id="rows"></tbody></table></div></div>''')
s3=section(3,'''<fieldset class="prediction-options"><legend data-i18n="quiz"></legend>'''+''.join(f'<label><input type="radio" name="prediction" value="{i}"><span data-i18n="option{i}"></span></label>' for i in range(3))+'''</fieldset><button id="reveal" class="btn primary" type="button" data-i18n="reveal" disabled></button><p id="feedback" class="readout" aria-live="polite" hidden></p>''')
s4=section(4,text('proof')+text('mapping','h3','')+'<ul>'+''.join(text(f'map{i}','li','') for i in range(1,4))+'</ul>'+text('complexity','p','question')+text('boundaries')+'''<div class="solution-actions"><button id="copy" class="btn primary" type="button" data-i18n="copy"></button><a href="solution.py" download data-i18n="download"></a><span id="copyStatus" aria-live="polite"></span></div><div id="manualCopy" hidden><label for="copyText" data-i18n="fallback"></label><textarea id="copyText" readonly rows="8"></textarea></div><details id="sourceDetails"><summary data-i18n="fullCode"></summary><pre tabindex="0" aria-label="Python source / Python 源码"><code id="pythonCode"></code></pre></details>'''+text('verifyTitle','h3','')+text('verify')+text('related','h3','')+'''<div class="related"><a href="../10/#step2" data-i18n="related0"></a><a href="../44/#step2" data-i18n="related1"></a></div>''')
end='''</main><footer class="site-foot" data-i18n="foot"></footer><noscript>交互需要 JavaScript，请启用后重新加载。 / Enable JavaScript and reload for interaction. <a href="solution.py">Python</a></noscript><script src="../common.js"></script><script src="copy.js?v=87-r1"></script><script src="core.js?v=87-r1"></script><script src="python-code.js?v=87-r1"></script><script src="app.js?v=87-r1"></script></body></html>'''
(p/'index.html').write_text(start+s0+s1+s2+s3+s4+end)

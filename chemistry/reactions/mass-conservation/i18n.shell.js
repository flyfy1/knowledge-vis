'use strict';
const STR = /*@i18n-table@*/;
let lang;
function getLang(){ if(lang) return lang; try{const saved=localStorage.getItem('knowledge-lang'); if(saved==='zh'||saved==='en') return lang=saved;}catch(_e){} return lang=(navigator.language||'').toLowerCase().startsWith('zh')?'zh':'en'; }
function t(key, vars={}){ let s=(STR[getLang()]&&STR[getLang()][key])||key; return s.replace(/\{(\w+)\}/g,(_,k)=>vars[k]===undefined?'':String(vars[k])); }
function applyLang(next){ lang=(next==='zh'||next==='en')?next:getLang(); try{localStorage.setItem('knowledge-lang',lang);}catch(_e){} document.documentElement.lang=lang==='zh'?'zh-CN':'en'; document.title=t('docTitle'); document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);}); document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml);}); document.querySelectorAll('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.i18nAria));}); document.querySelectorAll('#langToggle button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang)); document.dispatchEvent(new CustomEvent('langchange')); }
function onLangRefresh(fn){ document.addEventListener('langchange',fn); document.querySelectorAll('#langToggle button').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.lang))); }

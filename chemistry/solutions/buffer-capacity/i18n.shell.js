'use strict';
const STR=/*@i18n-table@*/;
let current='zh';
function stored(){try{const v=localStorage.getItem('knowledge-lang');return v==='en'||v==='zh'?v:null;}catch(e){return null;}}
function text(key,params={}){let s=(STR[current]&&STR[current][key])||STR.zh[key]||key;Object.keys(params).forEach(k=>{s=s.split('{'+k+'}').join(String(params[k]));});return s;}
function applyLang(lang){current=lang==='en'?'en':'zh';try{localStorage.setItem('knowledge-lang',current);}catch(e){}document.documentElement.lang=current==='zh'?'zh-CN':'en';document.title=text('docTitle');document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=text(el.dataset.i18n));document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=text(el.dataset.i18nHtml));document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',text(el.dataset.i18nAria)));document.querySelectorAll('[data-lang]').forEach(el=>{el.classList.toggle('active',el.dataset.lang===current);el.setAttribute('aria-pressed',String(el.dataset.lang===current));});window.dispatchEvent(new CustomEvent('buffer-lang-change',{detail:{lang:current}}));}
function t(key,params){return text(key,params);}
if(typeof window!=='undefined'){window.BUFFER_I18N={STR,t,applyLang,getLang:()=>current};window.addEventListener('DOMContentLoaded',()=>{current=stored()||((navigator.language||'zh').toLowerCase().startsWith('en')?'en':'zh');document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.lang)));applyLang(current);});}
if(typeof module!=='undefined')module.exports={STR,t:()=>text};

'use strict';
const STR=/*@i18n-table@*/;
let lang=(typeof localStorage!=='undefined'&&localStorage.getItem('knowledge-lang'))||((navigator.language||'zh').toLowerCase().startsWith('zh')?'zh':'en');
if(!STR[lang])lang='zh';
const listeners=[];
function getLang(){return lang}
function t(key,params={}){let value=(STR[lang]&&STR[lang][key])??STR.zh[key]??key;return String(value).replace(/\{(\w+)\}/g,(_,k)=>params[k]??'')}
function applyLang(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('docTitle');document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml)});document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));document.querySelectorAll('[data-lang]').forEach(el=>el.classList.toggle('active',el.dataset.lang===lang));listeners.forEach(fn=>fn(lang))}
function setLang(next){if(!STR[next])return;lang=next;try{localStorage.setItem('knowledge-lang',lang)}catch(_e){}applyLang()}
function onLangRefresh(fn){listeners.push(fn)}
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));applyLang()});

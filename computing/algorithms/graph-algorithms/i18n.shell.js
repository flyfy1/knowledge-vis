'use strict';
const STR=/*@i18n-table@*/;
const STORE=typeof localStorage!=='undefined'?localStorage:null;
let LANG=STORE?STORE.getItem('graph-algorithms-lang')||'zh':'zh';
function getLang(){return LANG}
function t(key,vars){let s=(STR[LANG]&&STR[LANG][key])||STR.zh[key]||key;return String(s).replace(/\{(\w+)\}/g,(_,k)=>vars&&vars[k]!==undefined?vars[k]:'')}
function applyLang(){document.documentElement.lang=LANG==='zh'?'zh-CN':'en';document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-i18n-html]').forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===LANG));window.dispatchEvent(new CustomEvent('langchange'))}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{LANG=b.dataset.lang;if(STORE)STORE.setItem('graph-algorithms-lang',LANG);applyLang()}));applyLang()});
if(typeof module!=='undefined')module.exports={STR,t,getLang};

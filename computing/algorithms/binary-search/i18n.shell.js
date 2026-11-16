'use strict';
const STR=/*@i18n-table@*/;
let LANG='zh';
function getLang(){return LANG}
function t(key,vars){let v=(STR[LANG]&&STR[LANG][key])??STR.zh[key]??key;return String(v).replace(/\{(\w+)\}/g,(_,k)=>vars&&vars[k]!=null?vars[k]:'')}
function applyI18n(){document.documentElement.lang=LANG==='zh'?'zh-CN':'en';document.title=t('docTitle');document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml)});document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===LANG));window.dispatchEvent(new Event('langchange'))}
function setLang(next){if(next!=='zh'&&next!=='en')return;LANG=next;try{localStorage.setItem('knowledge-lang',next)}catch(e){}applyI18n()}
function initI18n(){try{const v=localStorage.getItem('knowledge-lang');if(v==='en'||v==='zh')LANG=v}catch(e){}document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));applyI18n()}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initI18n);
if(typeof module!=='undefined')module.exports={STR,t,getLang,setLang};

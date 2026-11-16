'use strict';
const I18N = /*@i18n-table@*/;
let lang=localStorage.getItem('knowledge-lang')||'zh';
function t(key){return (I18N[lang]&&I18N[lang][key])||I18N.zh[key]||key;}
function applyI18n(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('docTitle');document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml)});document.querySelectorAll('[data-lang]').forEach(el=>el.classList.toggle('active',el.dataset.lang===lang));window.dispatchEvent(new CustomEvent('langchange',{detail:{lang}}));}
function setLang(next){lang=next==='en'?'en':'zh';localStorage.setItem('knowledge-lang',lang);applyI18n();}
window.t=t;window.getLang=()=>lang;window.setLang=setLang;window.onLangRefresh=fn=>window.addEventListener('langchange',fn);window.I18N=I18N;
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>setLang(el.dataset.lang)));applyI18n();});

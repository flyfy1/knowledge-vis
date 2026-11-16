const STR = /*@i18n-table@*/;
let _lang = null, _langMem = 'zh';
function storedLang(){try{const v=localStorage.getItem('knowledge-lang');return v==='zh'||v==='en'?v:null;}catch(e){return null;}}
function saveLang(v){_langMem=v;try{localStorage.setItem('knowledge-lang',v);}catch(e){}}
function getLang(){if(_lang)return _lang;const s=storedLang();if(s){_lang=s;return s;}const n=(navigator.language||'en').toLowerCase();_lang=n.startsWith('zh')?'zh':'en';return _lang;}
function t(key,params){let s=(STR[getLang()]&&STR[getLang()][key])||STR.zh[key]||key;if(params)Object.keys(params).forEach(k=>{s=s.split('{'+k+'}').join(String(params[k]));});return s;}
const langRefreshers=[];
function onLangRefresh(fn){langRefreshers.push(fn);}
function applyLang(lang){_lang=lang;saveLang(lang);document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('docTitle');document.querySelectorAll('[data-i18n-aria]').forEach(e=>e.setAttribute('aria-label',t(e.dataset.i18nAria)));document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=t(e.dataset.i18n));document.querySelectorAll('[data-i18n-html]').forEach(e=>e.innerHTML=t(e.dataset.i18nHtml));document.querySelectorAll('#langToggle button').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang));});langRefreshers.forEach(fn=>{try{fn(lang);}catch(e){console.error(e);}});}
function initLangToggle(){const box=document.getElementById('langToggle');if(!box)return;box.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.lang!==getLang())applyLang(b.dataset.lang);}));applyLang(getLang());}
document.addEventListener('DOMContentLoaded',initLangToggle);

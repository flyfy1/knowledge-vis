const STR = /*@i18n-table@*/;
let _lang = null;
let _langMem = 'zh';
function storedLang(){try{const v=localStorage.getItem('knowledge-lang');return v==='zh'||v==='en'?v:null;}catch(e){return null;}}
function saveLang(v){_langMem=v;try{localStorage.setItem('knowledge-lang',v);}catch(e){}}
function getLang(){if(_lang)return _lang;const s=storedLang();if(s){_lang=s;return s;}const n=(navigator.language||'en').toLowerCase();_lang=n.startsWith('zh')?'zh':'en';return _lang;}
function t(key,params){let s=(STR[getLang()]&&STR[getLang()][key])||STR.zh[key]||key;if(params)Object.keys(params).forEach(k=>{s=s.split('{'+k+'}').join(String(params[k]));});return s;}
const langRefreshers=[];
function onLangRefresh(fn){langRefreshers.push(fn);}
function applyLang(lang){_lang=lang;saveLang(lang);document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('docTitle');document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml);});document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));document.querySelectorAll('[data-i18n-title]').forEach(el=>el.title=t(el.dataset.i18nTitle));document.querySelectorAll('[data-lang]').forEach(el=>el.classList.toggle('active',el.dataset.lang===lang));langRefreshers.forEach(fn=>fn());}
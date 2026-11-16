/* derivative 页 · 双语文案与切换（逻辑与 parabola / linear-functions 页相同） */
var LANG_KEY = 'knowledge-lang';
var _memLang = null;
function storedLang(){ try{ return localStorage.getItem(LANG_KEY) || _memLang; }catch(e){ return _memLang; } }
function saveLang(l){ _memLang = l; try{ localStorage.setItem(LANG_KEY, l); }catch(e){} }
function getLang(){
  var s = storedLang();
  if (s === 'zh' || s === 'en') return s;
  return (navigator.language || 'en').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
}
var STR = /*@i18n-table@*/;
function t(key, params){
  var lang = getLang();
  var s = (STR[lang] && STR[lang][key]) || STR.zh[key] || key;
  if (params) Object.keys(params).forEach(function(k){ s = s.split('{' + k + '}').join(String(params[k])); });
  return s;
}
var _langRefreshers = [];
function onLangRefresh(fn){ _langRefreshers.push(fn); }
function applyLang(){
  var lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(function(el){ el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){ el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('#langToggle button[data-lang]').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });
  document.title = t('docTitle');
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  _langRefreshers.forEach(function(fn){ fn(); });
}
function initLangToggle(){
  document.querySelectorAll('#langToggle button[data-lang]').forEach(function(b){
    b.addEventListener('click', function(){
      if (getLang() !== b.getAttribute('data-lang')){ saveLang(b.getAttribute('data-lang')); applyLang(); }
    });
  });
  applyLang();
}
document.addEventListener('DOMContentLoaded', initLangToggle);

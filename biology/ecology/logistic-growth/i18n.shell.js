'use strict';
/* ============================================================
   种群增长 · S 形曲线从哪来 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   ============================================================ */
const STR = /*@i18n-table@*/;
let _lang = null;
function storedLang() { try { return localStorage.getItem('knowledge-lang'); } catch (e) { return null; } }
function saveLang(l) { try { localStorage.setItem('knowledge-lang', l); } catch (e) {} }
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s === 'zh' || s === 'en') { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }
function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
  document.querySelectorAll('#langToggle button').forEach(b => { b.classList.toggle('active', b.dataset.lang === lang); });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => { if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang); });
  });
  applyLang(getLang());
}
document.addEventListener('DOMContentLoaded', initLangToggle);

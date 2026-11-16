'use strict';
const STR = /*@i18n-table@*/;
let currentLang;
function getLang() {
  if (currentLang) return currentLang;
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'zh' || saved === 'en') return currentLang = saved;
  } catch { /* In-memory language remains available without storage. */ }
  return currentLang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
function t(key, params = {}) {
  return STR[getLang()][key].replace(/\{(\w+)\}/g, (_, name) => String(params[name]));
}
function applyLang(lang) {
  currentLang = lang;
  try { localStorage.setItem('knowledge-lang', lang); } catch { /* Keep currentLang. */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-html]').forEach(el => el.innerHTML = t(el.dataset.i18nHtml));
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(el => {
    const active = el.dataset.lang === lang;
    el.classList.toggle('active', active);
    el.setAttribute('aria-pressed', String(active));
  });
  if (window.refreshLanguage) window.refreshLanguage();
}
getLang();

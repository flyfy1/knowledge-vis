'use strict';
window.LeetCodeLocale = function (pairs) {
  const STR = {zh: {}, en: {}};
  Object.entries(pairs).forEach(([key, value]) => {STR.zh[key] = value[0]; STR.en[key] = value[1];});
  let lang;
  try {lang = localStorage.getItem('knowledge-lang');} catch (_) {}
  if (lang !== 'zh' && lang !== 'en') lang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  const listeners = [];
  const t = (key, params = {}) => {
    if (!(key in STR[lang])) throw new Error('Missing translation: ' + key);
    return STR[lang][key].replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match);
  };
  function apply(next) {
    lang = next;
    try {localStorage.setItem('knowledge-lang', lang);} catch (_) {}
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = t('docTitle');
    document.querySelectorAll('[data-i18n]').forEach(el => {el.textContent = t(el.dataset.i18n);});
    document.querySelectorAll('[data-i18n-html]').forEach(el => {el.innerHTML = t(el.dataset.i18nHtml);});
    document.querySelectorAll('#langToggle button').forEach(button => {
      const active = button.dataset.lang === lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    listeners.forEach(fn => fn());
  }
  return {
    t, getLang: () => lang, onChange: fn => listeners.push(fn),
    init() {
      document.querySelectorAll('#langToggle button').forEach(button => button.addEventListener('click', () => apply(button.dataset.lang)));
      apply(lang);
    }
  };
};

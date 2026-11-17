/* power-converters: one string table, zh/en keys identical (specs/site-template.md §3c).
   The markup names keys with data-i18n / data-i18n-html / data-i18n-aria; app.js builds the readouts, plots,
   status lines and path descriptions from the same table through t(key, {placeholders}). */
const STR = /*@i18n-table@*/;
let currentLang = 'en';
function t(key, vars) {
  const d = STR[currentLang] || {};
  const s = Object.prototype.hasOwnProperty.call(d, key) ? d[key] : key;
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] !== undefined ? vars[k] : ''));
}
// Fills every keyed element; app.js decides the language (stored choice, else the browser's) and calls this.
function applyLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  if (typeof document === 'undefined') return;
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
}
if (typeof module !== 'undefined') module.exports = { STR, t, applyLang };

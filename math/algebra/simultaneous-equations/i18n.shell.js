/* simultaneous-equations: one dictionary, zh/en keys identical. All page text goes through t(). */
const STR = /*@i18n-table@*/;
let currentLang = 'en';
let memLang = null;
function t(key, vars) {
  const d = STR[currentLang] || {};
  const s = Object.prototype.hasOwnProperty.call(d, key) ? d[key] : key;
  return String(s).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] !== undefined ? vars[k] : ''));
}
function setLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  memLang = currentLang;
  try { localStorage.setItem('knowledge-lang', currentLang); } catch (e) { /* memory fallback */ }
  if (typeof document === 'undefined') return;
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => { const on = b.dataset.lang === currentLang; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  window.dispatchEvent(new CustomEvent('langchange'));
}
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('knowledge-lang'); } catch (e) { saved = memLang; }
  setLang(saved === 'zh' || saved === 'en' ? saved : ((typeof navigator !== 'undefined' && navigator.language) || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
}
if (typeof module !== 'undefined') module.exports = { STR, t, setLang };

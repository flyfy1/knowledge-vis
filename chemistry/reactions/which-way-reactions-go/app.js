/* Which way reactions go: i18n runtime. All visible text comes from copy.*.js (generated from content.<lang>.md by
   scripts/build-pages.cjs); the static diagrams are inline SVG partials (figures/dg-*.html).
   UNFINISHED (2026-11-18): the twelve labs (figures/ch*-model.html, ch3-pop.html) are not wired yet. Their models are in
   models.js and their strings in content.zh.md; the drawing and control code still has to be written here
   (see BRIEF.md "Unfinished / not verified"). The runtime head follows how-a-cpu-does-math/app.js. */
(() => {
'use strict';
const COPY = window.ESSAY_COPY || {};
const $$ = s => [...document.querySelectorAll(s)];
const LS = 'knowledge-lang';
let memLang = null;
function readLang() { try { return localStorage.getItem(LS); } catch (e) { return memLang; } }
function writeLang(v) { memLang = v; try { localStorage.setItem(LS, v); } catch (e) { /* in-memory fallback */ } }
let lang = readLang();
if (lang !== 'zh' && lang !== 'en') lang = /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
const enStub = !COPY.en || document.documentElement.dataset.langEn === 'stub';
const hasLang = l => !!COPY[l] && !(l === 'en' && enStub);
const effLang = () => (hasLang(lang) ? lang : 'zh');
function t(key, vars) {
  const L = effLang();
  let s = (COPY[L] && COPY[L][key] != null) ? COPY[L][key] : (COPY.zh && COPY.zh[key] != null ? COPY.zh[key] : key);
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
}
function applyLang() {
  document.documentElement.lang = effLang() === 'zh' ? 'zh-CN' : 'en';
  document.title = t('doc.title');
  const md = document.querySelector('meta[name=description]');
  if (md) md.content = t('doc.desc');
  $$('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  $$('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
  $$('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAria)); });
  $$('#langToggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}
$$('#langToggle button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; writeLang(lang); applyLang(); }));
applyLang();
window.__essayReady = true;
})();

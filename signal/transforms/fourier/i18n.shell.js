'use strict';
/* ============================================================
 * 傅里叶页字符串字典 + 语言管理（知识站统一双语规范 UI-I18N-SPEC.md）
 * - localStorage 键 knowledge-lang（zh/en），全站共享；读写 try/catch，失败退化为内存变量
 * - 默认：已存值优先，否则按 navigator.language（zh 开头 → zh，否则 en）
 * - 静态文本用 data-i18n（textContent）/ data-i18n-html（innerHTML）/ data-i18n-attr 标注
 * - JS 动态文本与 Canvas 文字一律经 t(key[, vars]) 取值，{name} 占位
 * ============================================================ */
const STR = /*@i18n-table@*/;

/* ---------- 语言状态（全站共享 knowledge-lang） ---------- */
let __langMem = null; // localStorage 不可用时的内存退化
function __readStoredLang() {
  try {
    const v = localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 忽略：退化到内存/默认 */ }
  return __langMem;
}
function __defaultLang() {
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.indexOf('zh') === 0 ? 'zh' : 'en';
}
let __lang = __readStoredLang() || __defaultLang();

function t(key, vars) {
  let s = (STR[__lang] && STR[__lang][key] != null) ? STR[__lang][key]
        : (STR.zh && STR.zh[key] != null) ? STR.zh[key] : key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
}

function applyLang() {
  document.documentElement.lang = __lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
      const i = pair.indexOf(':');
      if (i > 0) el.setAttribute(pair.slice(0, i).trim(), t(pair.slice(i + 1).trim()));
    });
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === __lang);
  });
  if (typeof window.__onLangChange === 'function') {
    try { window.__onLangChange(__lang); } catch (e) { console.error(e); }
  }
}

function setLang(l) {
  if (l !== 'zh' && l !== 'en') return;
  __lang = l; __langMem = l;
  try { localStorage.setItem('knowledge-lang', l); } catch (e) { /* 内存退化 */ }
  applyLang();
}

window.KI18N = {
  t,
  getLang: () => __lang,
  setLang,
  applyLang
};

/* 切换控件接线 + 首次填充（先定语言再渲染，避免错语言闪烁） */
(function initI18n() {
  const wire = () => {
    document.querySelectorAll('#langToggle button').forEach(b => {
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });
    applyLang();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();

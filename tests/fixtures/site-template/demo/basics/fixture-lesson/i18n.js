'use strict';
/* fixture lesson strings (tests/site-template.cjs §6) */
const STR = {
  zh: {
    docTitle: '样例小课 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '样例小课',
    tagline: '一页两步的样例课。',
    nav0: '0 钩子', nav1: '1 动手',
    s0k: '第 0 步 · 钩子', s0t: '先看一眼',
    s0e: '这一页引用 <a href="../fixture-essay/#ch2">样例长文第二章</a>，并且 <strong>加粗</strong> 一处。',
    s0aria: '样例画布', s0run: '开始',
    s0hint: '提示：数字 {n} 由脚本填写。',
    s0say: '已运行 {n} 次',
    s1k: '第 1 步 · 动手', s1t: '新的标题文字',
    s1e: '第二步的说明。',
    s1done: '完成',
    foot: '样例小课 · fixture',
  },
  en: {
    docTitle: 'A Sample Lesson · step by step',
    back: '← Index',
    pageTitle: 'A Sample Lesson',
    tagline: 'A two-step sample lesson.',
    nav0: '0 Hook', nav1: '1 Hands on',
    s0k: 'Step 0 · Hook', s0t: 'A first look',
    s0e: 'This page cites <a href="../fixture-essay/#ch2">chapter 2 of the sample essay</a> and makes one thing <strong>bold</strong>.',
    s0aria: 'Sample canvas', s0run: 'Run',
    s0hint: 'Hint: the number {n} is filled in by the script.',
    s0say: 'Ran {n} times',
    s1k: 'Step 1 · Hands on', s1t: 'The new title text',
    s1e: 'What step 1 is about.',
    s1done: 'Done',
    foot: 'A Sample Lesson · fixture',
  }
};

let lang = 'zh';
function t(key, params = {}) { const v = (STR[lang] && STR[lang][key]) ?? STR.zh[key] ?? key; return String(v).replace(/\{(\w+)\}/g, (_, k) => params[k] ?? ''); }
function applyLang() {
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
}

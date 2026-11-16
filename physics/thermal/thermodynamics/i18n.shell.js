'use strict';
const STR = /*@i18n-table@*/;
function getLang() { try { const x = localStorage.getItem('knowledge-lang'); if (x && STR[x]) return x; } catch (_) {} return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'; }
function setLang(lang) { try { localStorage.setItem('knowledge-lang', lang); } catch (_) {} }

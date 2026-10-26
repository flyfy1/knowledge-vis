'use strict';
window.copyCanonicalSource = async function (source, onFallback) {
  try { await navigator.clipboard.writeText(source); return {ok:true}; }
  catch (_) { onFallback(); return {ok:false}; }
};

'use strict';
/* Pre-fill (specs/site-template.md §8) and its exact inverse.
 *
 * prefill(html, Z): put the zh text into every empty data-i18n / data-i18n-html element and an aria-label next to
 *   every data-i18n-aria, so readers without JS see the essay. Values with runtime placeholders ({v}) are left
 *   for app.js. The build calls this; nothing else should.
 * unprefill(html, Z): remove exactly what prefill(html, Z) inserted and nothing else. Page tests that inspect the
 *   markup (a "no Chinese in index.html" check, regexes that expect empty elements) run on unprefill(html, Z):
 *   anything that survives was written into the markup by hand, including text inside a data-i18n element that
 *   is not that key's copy value. On a page that was never pre-filled it returns html unchanged.
 * Both live in one file so they cannot drift apart.
 */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const HAS_RUNTIME = /\{[a-zA-Z_][\w]*\}/;
const fillable = v => v != null && v !== '' && !HAS_RUNTIME.test(v);

function prefill(html, Z) {
  html = html.replace(/(<(\w+)\b[^<>]*?\bdata-i18n(-html)?="([^"]+)"[^<>]*>)(<\/\2>)/g, (m, open, tag, ishtml, k, close) => {
    const val = Z[k];
    if (val == null || HAS_RUNTIME.test(val)) return m;
    return open + (ishtml ? val : esc(val)) + close;
  });
  return html.replace(/<(\w+)\b([^<>]*?)\bdata-i18n-aria="([^"]+)"([^<>]*)>/g, (m, tag, a, k, b) => {
    if (/\baria-label=/.test(a + b) || Z[k] == null) return m;
    return `<${tag}${a}data-i18n-aria="${k}" aria-label="${esc(Z[k])}"${b}>`;
  });
}

function unprefill(html, Z) {
  // aria first: prefill inserted ` aria-label="…"` right after data-i18n-aria="k"
  html = html.replace(/\bdata-i18n-aria="([^"]+)" aria-label="([^"]*)"/g, (m, k, x) => (Z[k] != null && x === esc(Z[k]) ? `data-i18n-aria="${k}"` : m));
  const re = /<(\w+)\b[^<>]*?\bdata-i18n(-html)?="([^"]+)"[^<>]*>/g;
  let out = '', last = 0, m;
  while ((m = re.exec(html))) {
    const [open, tag, ishtml, k] = m, end = m.index + open.length;
    if (!fillable(Z[k])) continue;
    const val = ishtml ? Z[k] : esc(Z[k]);
    if (html.startsWith(val + '</' + tag + '>', end)) {
      out += html.slice(last, end);
      last = end + val.length;
      re.lastIndex = last;
    }
  }
  return out + html.slice(last);
}

module.exports = { prefill, unprefill, esc, HAS_RUNTIME };

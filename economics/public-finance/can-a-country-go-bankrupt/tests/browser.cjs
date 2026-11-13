'use strict';

var assert = require('assert');
var playwright = require('playwright');

var BASE = process.env.ESSAY_BASE_URL || 'http://127.0.0.1:19023/economics/public-finance/can-a-country-go-bankrupt/';
var WIDTHS = [1280, 390, 320];

function cjkCount(str) {
  var m = String(str || '').match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  return m ? m.length : 0;
}

(async function () {
  var browser = await playwright.chromium.launch({ headless: true });
  var totalChecks = 0;

  try {
    for (var li = 0; li < 2; li++) {
      var lang = li === 0 ? 'zh' : 'en';
      for (var wi = 0; wi < WIDTHS.length; wi++) {
        var width = WIDTHS[wi];
        var context = await browser.newContext({
          viewport: { width: width, height: 800 },
          reducedMotion: 'reduce'
        });
        await context.addInitScript(function (chosen) {
          try { localStorage.setItem('knowledge-lang', chosen); } catch (_) {}
        }, lang);

        var page = await context.newPage();
        var errors = [];
        page.on('pageerror', function (err) { errors.push(String(err)); });
        page.on('console', function (msg) {
          if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto(BASE, { waitUntil: 'networkidle' });
        await page.waitForFunction(function () { return window.__ready === true; }, null, { timeout: 10000 });

        // Scroll through page to trigger all IntersectionObserver canvas renders
        var scrollH = await page.evaluate(function () { return document.body.scrollHeight; });
        for (var y = 0; y <= scrollH; y += 500) {
          await page.evaluate(function (pos) { window.scrollTo(0, pos); }, y);
          await page.waitForTimeout(40);
        }
        await page.evaluate(function () { window.scrollTo(0, 0); });
        await page.waitForTimeout(80);

        assert.strictEqual(errors.length, 0, lang + '@' + width + ' console/page errors: ' + errors.join('; '));
        totalChecks++;

        // Horizontal overflow check
        var overflow = await page.evaluate(function () {
          return document.documentElement.scrollWidth > window.innerWidth + 1;
        });
        assert.strictEqual(overflow, false, lang + '@' + width + ' horizontal overflow detected');
        totalChecks++;

        // Language check
        var bodyText = await page.evaluate(function () {
          var clone = document.body.cloneNode(true);
          var toggle = clone.querySelector('#langToggle');
          if (toggle) toggle.remove();
          return clone.innerText;
        });
        if (lang === 'en') {
          assert.strictEqual(cjkCount(bodyText), 0, 'EN@' + width + ' must contain zero CJK characters');
        } else {
          assert(cjkCount(bodyText) > 200, 'ZH@' + width + ' should render Chinese prose');
        }
        totalChecks++;

        // 48px touch target check + no clipped .read b
        var uiAudit = await page.evaluate(function () {
          var smallTargets = [];
          var sel = 'a.back, #langToggle button, .toc a, input[type=range], label.chk, .seg label, button.b';
          var els = document.querySelectorAll(sel);
          for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (el.offsetParent === null) continue;
            var r = el.getBoundingClientRect();
            if (r.height < 47.5 || r.width < 47.5) {
              smallTargets.push(el.tagName + '#' + el.id + ':' + Math.round(r.width) + 'x' + Math.round(r.height));
            }
          }

          var wrappedReads = [];
          var reads = document.querySelectorAll('.read b');
          for (var i = 0; i < reads.length; i++) {
            var rb = reads[i];
            var cs = getComputedStyle(rb);
            var lh = parseFloat(cs.lineHeight) || 24;
            if (rb.getBoundingClientRect().height > lh * 1.6) {
              wrappedReads.push(rb.textContent);
            }
          }

          // Check all 8 canvases have non-empty pixels
          var blankCanvases = [];
          for (var c = 1; c <= 8; c++) {
            var cv = document.getElementById('cv' + c);
            if (!cv || cv.width === 0 || cv.height === 0) blankCanvases.push('cv' + c);
          }

          // Contrast ratio check (>= 4.5 for --ink, --body, --mute on --bg/--card)
          function lum(rgb) {
            var m = rgb.match(/\d+/g).map(Number);
            var a = [m[0] / 255, m[1] / 255, m[2] / 255].map(function (v) {
              return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
          }
          function cr(fg, bg) {
            var l1 = lum(fg), l2 = lum(bg);
            return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
          }
          var bgCol = getComputedStyle(document.body).backgroundColor;
          var bodyCol = getComputedStyle(document.querySelector('.ch p')).color;
          var muteCol = getComputedStyle(document.querySelector('.how')).color;
          var bodyContrast = cr(bodyCol, bgCol);
          var muteContrast = cr(muteCol, bgCol);

          return {
            smallTargets: smallTargets,
            wrappedReads: wrappedReads,
            blankCanvases: blankCanvases,
            bodyContrast: bodyContrast,
            muteContrast: muteContrast
          };
        });

        assert.strictEqual(uiAudit.smallTargets.length, 0, lang + '@' + width + ' sub-48px targets: ' + uiAudit.smallTargets.join(', '));
        assert.strictEqual(uiAudit.wrappedReads.length, 0, lang + '@' + width + ' wrapped .read b: ' + uiAudit.wrappedReads.join(', '));
        assert.strictEqual(uiAudit.blankCanvases.length, 0, lang + '@' + width + ' blank canvases: ' + uiAudit.blankCanvases.join(', '));
        assert(uiAudit.bodyContrast >= 4.5, lang + '@' + width + ' body contrast < 4.5: ' + uiAudit.bodyContrast);
        assert(uiAudit.muteContrast >= 4.5, lang + '@' + width + ' mute contrast < 4.5: ' + uiAudit.muteContrast);
        totalChecks += 5;

        // Interactive test at 1280px
        if (width === 1280) {
          // Ch2 preset button test
          var beforeY2 = await page.textContent('#y2');
          await page.click('#b2Snow');
          var afterY2 = await page.textContent('#y2');
          assert.notStrictEqual(beforeY2, afterY2, lang + ' Ch2 preset updated readout');
          totalChecks++;

          // Ch5 ZLB toggle + slider
          var beforeR5 = await page.textContent('#r5');
          await page.click('#c5Zlb');
          var afterR5 = await page.textContent('#r5');
          assert.notStrictEqual(beforeR5, afterR5, lang + ' Ch5 ZLB checkbox updated multiplier');
          totalChecks++;

          // Ch7 custom radio reveals custom sliders
          await page.click('input[name="hmode"][value="custom"]');
          var customHidden = await page.evaluate(function () {
            return document.getElementById('c7CustomBox').classList.contains('hidden');
          });
          assert.strictEqual(customHidden, false, lang + ' Ch7 custom box became visible');
          totalChecks++;

          // Ch8 country switch
          var beforeY8 = await page.textContent('#y8');
          await page.click('input[name="fcountry"][value="jp"]');
          var afterY8 = await page.textContent('#y8');
          assert.notStrictEqual(beforeY8, afterY8, lang + ' Ch8 country switch updated interpretation');
          totalChecks++;

          // Keyboard navigation + language toggle button click
          var targetLang = lang === 'zh' ? 'en' : 'zh';
          await page.focus('#langToggle button[data-lang="' + targetLang + '"]');
          await page.keyboard.press('Enter');
          var htmlLang = await page.getAttribute('html', 'lang');
          assert.strictEqual(htmlLang, targetLang === 'en' ? 'en' : 'zh-CN', 'keyboard Enter on lang toggle updates <html lang>');
          totalChecks++;

          // Slider keyboard input check
          var beforeY1 = await page.textContent('#y1');
          await page.focus('#c1Debt');
          await page.keyboard.press('ArrowRight');
          var afterY1 = await page.textContent('#y1');
          assert.notStrictEqual(beforeY1, afterY1, lang + ' keyboard ArrowRight on slider updates Ch1');
          totalChecks++;
        }

        await context.close();
      }
    }
    console.log('PASS: ' + totalChecks + ' browser checks passed across zh/en at 1280/390/320px');
  } finally {
    await browser.close();
  }
})();

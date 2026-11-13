'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = process.env.PORT || '19005';
const BASE_URL = process.env.ESSAY_BASE_URL || `http://127.0.0.1:${PORT}/chemistry/reactions/which-way-reactions-go/`;
const SHOT_DIR = '/tmp/agent-tasks/essays/which-way-reactions-go';

fs.mkdirSync(SHOT_DIR, { recursive: true });

let passed = 0;
let failed = 0;

function check(label, cond, extra) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error('FAIL:', label, extra !== undefined ? '-> ' + JSON.stringify(extra) : '');
  }
}

async function setRange(page, sel, val) {
  await page.locator(sel).evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, val);
  await page.waitForTimeout(80);
}

async function clickRadio(page, name, value) {
  await page.locator(`input[name="${name}"][value="${value}"]`).evaluate(el => {
    el.checked = true;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(80);
}

async function runViewportAudit(browser, width, height, tag) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  const badResponses = [];

  page.on('pageerror', err => pageErrors.push(String(err)));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('copy.en.js')) consoleErrors.push(txt);
    }
  });
  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('copy.en.js')) {
      badResponses.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__essayReady === true, { timeout: 10000 });

  // Scroll through every chapter so IntersectionObserver renders every canvas
  const totalH = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= totalH; y += Math.max(300, Math.floor(height * 0.7))) {
    await page.evaluate(yy => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  check(`${tag} zero pageerror`, pageErrors.length === 0, pageErrors);
  check(`${tag} zero console.error`, consoleErrors.length === 0, consoleErrors);
  check(`${tag} zero >=400 responses`, badResponses.length === 0, badResponses);

  // Check overflow, placeholders, NaN, canvas paint, touch targets, control overlaps
  const audit = await page.evaluate(() => {
    const vw = window.innerWidth;
    const sw = document.documentElement.scrollWidth;

    const badText = [];
    document.querySelectorAll('[data-i18n], [data-i18n-html], .say, .read b, output').forEach(el => {
      const txt = (el.textContent || '').trim();
      if (/\{[a-zA-Z0-9_]+\}/.test(txt) || /\bNaN\b|\bundefined\b/.test(txt)) {
        badText.push({ id: el.id || el.className, txt: txt.slice(0, 80) });
      }
    });

    const canvases = [...document.querySelectorAll('canvas')].map(cv => {
      const r = cv.getBoundingClientRect();
      let nonZero = false;
      try {
        const ctx2 = cv.getContext('2d');
        const img = ctx2.getImageData(0, 0, Math.min(cv.width, 64), Math.min(cv.height, 64)).data;
        for (let i = 3; i < img.length; i += 4) {
          if (img[i] > 0) { nonZero = true; break; }
        }
      } catch (_) {}
      return { id: cv.id, cw: cv.width, ch: cv.height, cssW: r.width, cssH: r.height, nonZero };
    });

    const smallTargets = [];
    document.querySelectorAll('button, select, input[type="range"], .seg label').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (el.closest('[hidden]') || el.hidden) return;
      if (r.height < 44) {
        smallTargets.push({ tag: el.tagName, id: el.id || el.textContent.trim().slice(0, 20), w: Math.round(r.width), h: Math.round(r.height) });
      }
    });

    const clipped = [];
    document.querySelectorAll('.lab, .read, .ctl').forEach(box => {
      const r = box.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 2 || box.scrollWidth > box.clientWidth + 4)) {
        clipped.push({ cls: box.className, sw: box.scrollWidth, cw: box.clientWidth, right: Math.round(r.right), vw });
      }
    });

    return { vw, sw, badText, canvases, smallTargets, clipped };
  });

  check(`${tag} no horizontal overflow (sw=${audit.sw} <= vw=${audit.vw})`, audit.sw <= audit.vw + 1, { sw: audit.sw, vw: audit.vw });
  check(`${tag} no unreplaced tokens or NaN/undefined`, audit.badText.length === 0, audit.badText);
  check(`${tag} all 11 canvases non-zero & painted`, audit.canvases.length === 11 && audit.canvases.every(c => c.cw > 0 && c.ch > 0 && c.nonZero), audit.canvases);
  check(`${tag} interactive targets height >= 44px`, audit.smallTargets.length === 0, audit.smallTargets);
  check(`${tag} no clipped lab/read/ctl boxes`, audit.clipped.length === 0, audit.clipped);

  await page.screenshot({ path: path.join(SHOT_DIR, `top-${tag}.png`), fullPage: false });

  if (tag === 'desktop-1280') {
    for (const id of ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9']) {
      const fig = page.locator(`#${id} figure.lab`).first();
      await fig.scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      await fig.screenshot({ path: path.join(SHOT_DIR, `${id}-${tag}.png`) });
    }
  } else {
    for (const id of ['ch3', 'ch6', 'ch9']) {
      const fig = page.locator(`#${id} figure.lab`).first();
      await fig.scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      await fig.screenshot({ path: path.join(SHOT_DIR, `${id}-${tag}.png`) });
    }
  }

  await ctx.close();
}

async function runControlTests(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__essayReady === true, { timeout: 10000 });

  // Ch1 controls
  await clickRadio(page, 'ch1mode', 'mixing');
  const sayMix = await page.locator('#ch1Say').textContent();
  check('ch1 switching to mixing updates say', sayMix.includes('红球') && sayMix.includes('蓝球'), sayMix);
  await clickRadio(page, 'ch1mode', 'energy');
  await setRange(page, '#ch1Na', 18);
  const wmax18 = await page.locator('#ch1Wmax').textContent();
  check('ch1 dragging NA changes Wmax', wmax18 !== '12.38%', wmax18);

  // Ch2 controls
  await setRange(page, '#ch2T', 1200);
  const rt1200 = await page.locator('#ch2Rt').textContent();
  check('ch2 T=1200 updates RT readout', rt1200.includes('9.98') || rt1200.includes('9.97'), rt1200);

  // Ch3 controls
  await page.selectOption('#ch3Rxn', 'caco3');
  await setRange(page, '#ch3T', 298);
  const dg298 = await page.locator('#ch3Dg').textContent();
  await setRange(page, '#ch3T', 1300);
  const dg1300 = await page.locator('#ch3Dg').textContent();
  check('ch3 CaCO3 flips sign from 298K to 1300K', dg298.startsWith('+') && dg1300.startsWith('−'), { dg298, dg1300 });

  // Ch4 controls
  await clickRadio(page, 'ch4sys', 'nh3');
  await setRange(page, '#ch4T', 723);
  await setRange(page, '#ch4P', 200);
  const xeqNh3 = await page.locator('#ch4Xeq').textContent();
  check('ch4 NH3 723K 200bar xeq ~ 53.4%', xeqNh3.includes('53.4'), xeqNh3);

  // Ch5 catalyst invariance
  const beqBefore = await page.locator('#ch5Beq').textContent();
  const thBefore = await page.locator('#ch5Thalf').textContent();
  await setRange(page, '#ch5Cat', 15);
  const beqAfter = await page.locator('#ch5Beq').textContent();
  const thAfter = await page.locator('#ch5Thalf').textContent();
  check('ch5 catalyst keeps Beq invariant', beqBefore === beqAfter && beqBefore === '81.8%', { beqBefore, beqAfter });
  check('ch5 catalyst cuts tHalf sharply', thBefore !== thAfter && parseFloat(thAfter) < parseFloat(thBefore), { thBefore, thAfter });

  // Ch6a ATP log-ratio slider reaches fail branch, Ch6b Ellingham
  await setRange(page, '#ch6Ratio', -5);
  await setRange(page, '#ch6Pi', 50);
  const dgNetFail = await page.locator('#ch6Dgnet').textContent();
  check('ch6a extreme low ATP ratio turns net ΔG positive', dgNetFail.startsWith('+'), dgNetFail);
  await setRange(page, '#ch6Ratio', 1);
  await setRange(page, '#ch6Pi', 5);

  await page.selectOption('#ch6Ox', 'feo');
  await setRange(page, '#ch6T', 1240);
  const feoRed = await page.locator('#ch6Dgred').textContent();
  await page.selectOption('#ch6Ox', 'al2o3');
  const alRed = await page.locator('#ch6Dgred').textContent();
  check('ch6b at 1240K FeO reduces (<0) while Al2O3 does not (>0)', !feoRed.startsWith('+') && alRed.startsWith('+'), { feoRed, alRed });

  // Ch7 Haber-Bosch
  const ch7DefaultSay = await page.locator('#ch7Say').textContent();
  check('ch7 default hits factory window copy', ch7DefaultSay.includes('工厂窗口'), ch7DefaultSay);
  await setRange(page, '#ch7T', 260);
  const ch7Cold = await page.locator('#ch7Say').textContent();
  check('ch7 260C hits slow branch', ch7Cold.includes('太冷了'), ch7Cold);

  // Ch8 Regular Solution
  await setRange(page, '#ch8Ttc', 1.1);
  const binSingle = await page.locator('#ch8Bin').textContent();
  check('ch8 T/Tc >= 1 goes single phase', binSingle.includes('单相'), binSingle);

  // Ch9 Frontier mode switching
  await clickRadio(page, 'ch9mode', 'dac');
  await setRange(page, '#ch9Ppm', 120000);
  const ppmOut = await page.locator('#ch9PpmOut').textContent();
  const dacHighSay = await page.locator('#ch9Say').textContent();
  check('ch9 DAC at 120000ppm shows 12.0% & high-conc copy', ppmOut.includes('12.0%') && dacHighSay.includes('12.0%'), { ppmOut, dacHighSay });

  await clickRadio(page, 'ch9mode', 'co2rr');
  await setRange(page, '#ch9Vcell', 2.0);
  await setRange(page, '#ch9Fe', 85);
  const effOut = await page.locator('#ch9Eff').textContent();
  check('ch9 CO2RR efficiency matches (1.15/2.0)*85 ~ 48.9%', effOut.includes('48.9%'), effOut);

  // Language toggle EN check (or safe fallback if copy.en.js is not present yet)
  const hasEnCopy = await page.evaluate(() => !!(window.ESSAY_COPY && window.ESSAY_COPY.en));
  await page.click('#langToggle button[data-lang="en"]');
  await page.waitForTimeout(100);
  if (hasEnCopy) {
    const cjkInEn = await page.evaluate(() => (document.body.innerText.match(/[\u4e00-\u9fff]+/g) || []).filter(s => s !== '中'));
    check('EN mode has zero stray CJK', cjkInEn.length === 0, cjkInEn);
  } else {
    const zhPressed = await page.getAttribute('#langToggle button[data-lang="zh"]', 'aria-pressed');
    check('without copy.en.js, lang toggle stays safely in zh', zhPressed === 'true', zhPressed);
  }

  await ctx.close();
}

async function runReducedMotionTest(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce'
  });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__essayReady === true, { timeout: 10000 });

  await page.locator('#ch1').scrollIntoViewIfNeeded();
  const curBefore = await page.locator('#ch1Cur').textContent();
  await page.waitForTimeout(450);
  const curAfter = await page.locator('#ch1Cur').textContent();
  check('reduced motion stops ch1 auto-stepping', curBefore === curAfter, { curBefore, curAfter });

  await page.locator('#ch5').scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const playTxt = await page.locator('#ch5Play').textContent();
  check('reduced motion pauses ch5 playback by default', playTxt.includes('继续'), playTxt);

  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    await runViewportAudit(browser, 1280, 800, 'desktop-1280');
    await runViewportAudit(browser, 390, 844, 'mobile-390');
    await runViewportAudit(browser, 320, 568, 'mobile-320');
    await runControlTests(browser);
    await runReducedMotionTest(browser);
  } finally {
    await browser.close();
  }
  console.log(`browser.cjs: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();

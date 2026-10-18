# Physics and mathematics lesson UI audit

Date: 2026-10-18 (Asia/Singapore)
Reviewer: independent Codex review run `/root/physics_ui_audit`; exact model identity unavailable.
Scope: read-only product audit, followed by this documentation-only write. The review did not change lesson source, including the pre-existing dirty `pythagoras` files.

## Independent design verdict

**Adopt the proposed shared lesson-shell CSS and JS for the 13 audited routes, subject to the interface and acceptance criteria below.** The evidence supports a small common presentation repair, not a lesson-engine rewrite or a new navigation framework. The user is a learner moving from the concept atlas to a specific explanation, manipulating a demonstration, and returning to the collection. The smallest useful outcome is a readable, correctly positioned lesson with usable phone controls and a visible indication of the current step.

The shared module earns its depth through locality: common layout, focus, link styling, and horizontal active-step visibility are maintained once for 13 real consumers. The deletion test passes because removing it would push the same fixes into 13 pages. Its interface should remain the existing lesson DOM classes, semantic controls, color tokens, and active-step class. No configuration registry, per-lesson navigation adapter, new state owner, or generic rendering framework is warranted. Existing lesson code remains authoritative for active-step selection and all simulation state. The browser-visible DOM is the test seam.

### Adopted priorities

| Priority | Adopted work | Observable completion criterion |
| --- | --- | --- |
| P0 | Reserve each authored height-attribute canvas's intended CSS pixel height in its HTML before lazy drawing begins. Retain its existing height attribute, width behavior, hidden state, and drawing logic. | Sampling `#step3` and `#step4` land at their own headings in fresh wide/phone contexts. First visible layout and later drawing have the same reserved CSS height. All 29 listed destinations retain a visible heading below the sticky nav. |
| P0 | Common header, nav content, and step-content alignment; wrapping header; readable link treatment. | The content edges align at wide widths. EN and zh at 320/390/1376px have no document overflow. Language controls remain visible. Normal-size links reach at least 4.5:1, preferably 7:1. |
| P0 | Controls at least 48 × 48 CSS px and 3px visible focus. | Language buttons, nav links, primary/secondary buttons, and range-input hit areas meet the target. Native checkbox/radio semantics remain intact; enlarge their associated label hit area where needed. Inline prose links retain natural text flow and are not padded into oversized blocks. Keyboard focus is visible without clipping. |
| P1 | Reveal the existing active nav item horizontally when its active class changes or the nav viewport changes. | Direct phone deep links show the active item within the nav scroller. Revealing it does not change `window.scrollY`, location hash, focus, simulation state, or the active-class owner. |
| P2 | None in this delivery. | No decorative work is required to resolve the observed problems. |

The highest-return slice is canvas height reservation plus one shared, narrow lesson-shell implementation. Centering the shell is a composition improvement; it must not be described as a confirmed repair of the user's right-shifted screenshot, which was not reproduced.

### Shared-module interface and constraints

- Load the shared CSS after local lesson CSS so its documented presentation hooks have predictable precedence. Keep it opt-in to these lessons; do not accidentally restyle the atlas, collection, LeetCode pages, or unrelated dirty pages.
- Use a common 920px content maximum with responsive outer gutters (20px wide, 12px at widths up to 640px). Account for padding when aligning header, nav contents, and `.step-inner`; matching outer max-width declarations alone does not guarantee matching text edges.
- Preserve existing native links, form controls, disabled states, localized text, `document.lang`, and local-storage locale behavior. Keep nav overflow horizontal on narrow screens. Header wrapping must allow long EN titles and CJK to grow.
- Reuse the existing palette: canvas `#0d1117`, alternating section `#0a0e14`, panel `#161b22`, control `#1c2330`, text `#e8edf4`, muted `#9aa7b8`, accent/link/focus `#6ee7ff`, and on-accent `#08131a`. Existing back-link `#7dd3fc` is also readable. Keep existing typography, radius, and spacing unless a listed repair requires a change.
- Measured opaque pairs: accent/canvas 13.10:1, accent/alternating-section 13.39:1, muted/panel 7.08:1, text/canvas 16.09:1, back-link/canvas 11.35:1, accent/control 10.91:1, on-accent/accent 13.00:1. These calculations are token evidence, not proof for every opacity/gradient/visited state.
- Focus uses a 3px outline with separation from the control edge. Verify contrast against both its control and surrounding surface and avoid clipping in `.lang-toggle` or the nav scroller; retain a forced-colors outline.
- The JS module may observe active-class changes on the nav items. Observe only the relevant attributes/subtree, do not watch or rerender the lesson body, and do not start another animation loop or polling timer. Handle initialization and viewport resize idempotently.
- Reveal using the nav scroller's horizontal position, with nearest-edge movement only when the item is outside its visible bounds. Avoid `scrollIntoView`, which can move the document vertically. Do not let horizontal reveal steal focus or repeatedly fight a user who is manually browsing other step links. Prefer immediate movement; any optional smooth motion must honor reduced motion.
- HTML canvas height reservation must match the lesson's existing intended display height, not the DPR-scaled backing-store height. Do not attach `display` rules that unhide canvases. Keep current fit functions and their `setTransform` behavior. All height-attribute canvases on these 13 routes may receive matching initial CSS heights; verify hidden tabs when revealed and drag coordinate alignment after resize.

### Deferred or rejected

- **Reject speculative hash timers or delayed forced scrolls.** Fourier's hash route passed after normal smooth scrolling settled. Sampling's confirmed cause is changing canvas geometry; fix that cause.
- **Defer a simulation-engine or DPR rewrite.** Repeated-resize checks found no backing-store/transform accumulation. No evidence justifies that scope.
- **Defer a broad visual redesign or new atlas-return convention.** The current Knowledge Index link accurately goes to `/`, and browser Back returns to the atlas. A new navigation convention needs a separate product decision.
- **Defer full lesson-content, scientific-correctness, real-device, screen-reader, and all canvas-text contrast certification.** This audit targets the shared browsing surface. Those claims require additional explicit coverage.

This is the independent reviewer's recommendation. The dispatcher should record acceptance or any override in the implementation brief before editing product code; this document does not attribute dispatcher approval that has not occurred.

## Scope and coverage

Local server: `http://127.0.0.1:18769`. Browser: Playwright Chromium using installed Chrome, headless. Desktop geometry: 1376px wide with DPR2. Phone geometry: 390px; narrow layout checks also use 320px. Local validation does not establish public deployment or physical-device behavior.

Audited routes: `trig`, `eigen`, `laplace`, `fourier`, `freqresp`, `sampling`, `lti`, `convolution`, `control`, `bayes`, `clt`, `montecarlo`, `kalman`.

The 29 unique internal atlas destinations, obtained from the running atlas's node and edge sources:

```text
/bayes/#step0
/bayes/#step2
/clt/#step3
/clt/#step5
/control/#step2
/convolution/#step2
/convolution/#step6
/eigen/#step1
/eigen/#step4
/eigen/#step5
/fourier/#step1
/fourier/#step2
/fourier/#step4
/fourier/#step5
/freqresp/#step0
/freqresp/#step5
/kalman/#step2
/kalman/#step6
/laplace/#step1
/laplace/#step2
/laplace/#step4
/lti/#step2
/lti/#step3
/montecarlo/#step2
/montecarlo/#step3
/sampling/#step3
/sampling/#step4
/trig/#step1
/trig/#step3
```

Executed coverage:

- 87 settled records: 29 destinations at wide width, after repeated 390→1376→320→1376 resizing, and at 390px. Canvas backing sizes and 2D transforms were inspected after resize at DPR2; no runaway scaling was found.
- 78 locale/layout states: 13 routes × EN/zh × 1376/390/320px. Document languages were `en` and `zh-CN`. No overflow at 1376/390; no overflow at 320 in zh. EN 320 overflow is detailed below.
- Actual phone UI flow: atlas's “Open interactive lesson” → Fourier `#step5` → browser Back returned to `/atlas/`; reopening and clicking “Knowledge Index” returned to `/`. All 13 lesson home links target `/`.
- Screenshots inspected: Fourier wide step5, phone view, the supplied user screenshot, and sampling's incorrect wide step3 landing. The user's right-heavy Fourier layout and failure to reach step5 did not reproduce. At 100ms, normal smooth scrolling is still in progress; early captures are not hash-failure evidence.

## Confirmed findings and diagnosis record

### F1 — Sampling's canvas layout shift invalidates deep-link scroll destinations

Red-capable feedback loop: fresh browser context, DPR2, 1376×900, navigate to `/sampling/#step3` or `#step4`, allow 2400ms for smooth scrolling, and assert target section top is between 0 and 250px with its own active nav link. Both routes failed twice in fresh contexts.

| Route | Observed target top | Active item |
| --- | ---: | --- |
| `/sampling/#step3` | -1239.375px | `#step4` |
| `/sampling/#step4` | -1239.6875px | `#step5` |

Ranked falsifiable hypotheses were sent to the dispatcher before source/cause tests:

1. Lazy canvas initialization changes heights after the browser calculates the anchor destination. Reserving those heights before scrolling should eliminate the displacement; frame traces should show a matching geometry change.
2. Locale initialization changes text layout after anchor resolution. Establishing the locale before navigation should remove the displacement if this is the cause.
3. Lesson JS applies an incorrect scroll offset. A trace of scroll calls should reveal that offset; removing the responsible call alone should fix it.

Confirmed hypothesis: **1**. A 20ms browser trace showed step3 document Y falling from 4808.21875 to 4090.625 and then 3492.625. `s0-canvas` shrank from 1077.59375 to 360px; `s1-canvas` shrank from 898 to 300px. Their combined 1315.59375px shrink matches the erroneous destination displacement. The document finished at scrollY 4732 while the target had moved upward.

Green cause test: a browser-only stylesheet response override appended `#s0-canvas{height:360px} #s1-canvas{height:300px}` before initial layout. The identical step3 route then ended at target y75.625 and active `#step3`. No product source was changed. The attempted smooth-scroll-off comparison initially used a route glob that missed the `?v=w2a` stylesheet URL; it is invalid evidence and was not used to exclude a hypothesis. The successful reservation override used `**/sampling/style.css*` and logged the intercepted URL.

Source: `sampling/app.js` `fitCanvas` captures the authored height and only assigns CSS height when called; `sampling/index.html` authors s0 height360 and s1 height300. Commit/closure evidence should state this confirmed cause explicitly.

### F2 — Fourier cross-page links inherit unreadable browser blue

Red-capable feedback loop: calculate computed anchor foreground against its nearest opaque ancestor background and assert at least 4.5:1. `/fourier/` step5 `.fourier-link` rendered `rgb(0,0,238)` on `rgb(10,14,20)`, **2.0579876:1**, and the command exited 1. Five cross-page links failed, at 2.01–2.06:1. Other 12 lessons' inspected links did not fail this check.

Ranked hypotheses declared before testing:

1. No author color rule matches `.fourier-link`; adding a scoped accent rule will fix these links.
2. A later or more-specific rule overrides an intended link color; matched rules should reveal it, and removing it should fix the issue.
3. A stale/missing stylesheet causes the mismatch; loaded styles or matching rules should differ from local source.

Confirmed hypothesis: **1**. Matching author color rules returned an empty array. Browser-only `.fourier-link {color:var(--accent)}` changed the computed color to `rgb(110,231,255)`. Current source had no `.fourier-link` color rule. The user-facing purpose is restoring readable cross-lesson navigation, not changing link destinations.

### F3 — Active phone navigation item is outside its scroller viewport

Red-capable feedback loop: at 390×844, navigate to `/fourier/#step5`, wait 1800ms, and assert the active item bounds fit within the nav viewport. The active step was correct but its bounds were x762.609375–901.03125px while the viewport was 390px and nav.scrollLeft was 0; command exited 1.

Ranked hypotheses declared before testing:

1. Active-class updates lack a horizontal reveal operation; manually moving the nav scroller should reveal the active item.
2. A reveal operation runs before width settles; a delayed repeat should fix it.
3. The container's clipping or overflow rules prevent scrolling; a manual scroll should fail.

Confirmed hypothesis: **1**. The existing observer in `fourier/app.js` only toggles `.active`. Assigning the nav's horizontal scroll position moved the active item's bounds to x87.609375–226.03125px, fully visible. This evidence does not justify replacing the existing active-step selection logic.

### F4 — Shared controls are undersized; three EN headers overflow at 320px

Observed across the 13 pages: language buttons approximately 29px tall, step links 35.796875px, ordinary action buttons approximately 41px, and range-input hit areas 26px. These are below the website-design skill's 48px target. This is a direct computed-geometry contract failure, not evidence that every control is unusable.

Fresh 320px EN browser contexts confirmed:

| Route | Document scroll width | Offscreen element |
| --- | ---: | --- |
| `/eigen/` | 361px | `#langToggle`, right 361.171875px |
| `/convolution/` | 338px | `#langToggle`, right 338.390625px |
| `/kalman/` | 386px | `#langToggle`, right 385.5px |

The narrow header's flex composition and intrinsic title width warrant the proposed wrapping/min-width repair. No browser-injected green test of this header repair was performed during the read-only audit; do not label its cause or implementation verified until the actual fix is tested. All other tested locale/width combinations avoided document overflow.

## Reproduction commands and durable minimal loop

Original commands actually run (temporary evidence paths may be cleared by the OS):

```sh
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-red.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-mobile-nav.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-anchor-red.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-sampling-fix-test.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-sweep.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-locale-flow.cjs
```

For a durable reproduction independent of those temporary scripts, save the following block as `/tmp/lesson-shell-repro.cjs` and run the command below. This reproduces F1–F4 against the running source; it exits nonzero while a checked symptom remains. `UI_AUDIT_PROOF=1` applies only the previously validated browser-local F1/F2/F3 cause interventions; header and target-size failures are intentionally still reported.

```sh
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/lesson-shell-repro.cjs
UI_AUDIT_PROOF=1 NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/lesson-shell-repro.cjs
```

```js
const {chromium} = require('playwright');
const base = process.env.UI_AUDIT_BASE || 'http://127.0.0.1:18769';
const proof = process.env.UI_AUDIT_PROOF === '1';
(async () => {
  const browser = await chromium.launch({headless:true, channel:'chrome'});
  const failures = [];
  const check = (name, pass, observed) => {
    console.log(JSON.stringify({name, pass, observed}));
    if (!pass) failures.push(name);
  };
  const page = async width => {
    const p = await browser.newPage({viewport:{width,height:900},deviceScaleFactor:2});
    await p.addInitScript(() => localStorage.setItem('knowledge-lang','en'));
    return p;
  };
  for (const step of [3,4]) {
    const p = await page(1376);
    if (proof) await p.route('**/sampling/style.css*', async route => {
      const response = await route.fetch();
      await route.fulfill({response, body:await response.text() +
        '\n#s0-canvas{height:360px} #s1-canvas{height:300px}'});
    });
    await p.goto(`${base}/sampling/#step${step}`);
    await p.waitForTimeout(2400);
    const r = await p.evaluate(() => ({
      y:document.querySelector(location.hash).getBoundingClientRect().y,
      active:document.querySelector('nav .active')?.getAttribute('href')
    }));
    check(`sampling-step${step}`,r.y>=0&&r.y<250&&r.active===`#step${step}`,r);
    await p.close();
  }
  const p = await page(390);
  await p.goto(`${base}/fourier/#step5`);
  await p.waitForTimeout(1800);
  if (proof) {
    await p.addStyleTag({content:'.fourier-link{color:var(--accent)}'});
    await p.evaluate(() => {
      const nav=document.querySelector('nav');
      nav.scrollLeft=nav.querySelector('.active').offsetLeft;
    });
  }
  const r = await p.evaluate(() => {
    const a=document.querySelector('#step5 .fourier-link');
    let el=a,bg;
    while(el){
      const color=getComputedStyle(el).backgroundColor;
      if(color!=='rgba(0, 0, 0, 0)'){bg=color;break;}
      el=el.parentElement;
    }
    const lum=c=>c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255)
      .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
      .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const fg=getComputedStyle(a).color,x=lum(fg),y=lum(bg);
    const active=document.querySelector('nav .active').getBoundingClientRect();
    return {fg,bg,contrast:(Math.max(x,y)+.05)/(Math.min(x,y)+.05),
      activeLeft:active.left,activeRight:active.right,width:innerWidth,
      navHeight:document.querySelector('nav a').getBoundingClientRect().height};
  });
  check('fourier-link-contrast',r.contrast>=4.5,r);
  check('phone-active-step-visible',r.activeLeft>=0&&r.activeRight<=r.width,r);
  check('step-target-height',r.navHeight>=48,r.navHeight);
  await p.close();
  for(const slug of ['eigen','convolution','kalman']){
    const p=await page(320);
    await p.goto(`${base}/${slug}/`);
    await p.waitForTimeout(600);
    const r=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    check(`${slug}-narrow-header`,r.scrollWidth<=r.width,r);
    await p.close();
  }
  await browser.close();
  process.exitCode=failures.length?1:0;
})();
```

The durable loop above was extracted from this document and actually run in both modes before implementation. Baseline: all 8 checks red, exit 1. Browser proof mode: both sampling anchors, Fourier contrast, and active-nav visibility green; target height and the three headers remained red as expected, exit 1. Proof-mode results: step3 y75.625, step4 y76.3125; Fourier link contrast 13.3883:1; active item x87.609375–226.03125px.

Raw temporary artifacts from the executed audit:

- `/tmp/physics-ui-sweep.json`, `/tmp/physics-ui-sweep-summary.json`: settled destination/resize records.
- `/tmp/physics-ui-locales.json`: locale/width records.
- `/tmp/sampling-trace-false.json`: frame-level geometry changes.
- `/tmp/fourier-audit-desktop.png`, `/tmp/fourier-audit-mobile-deeplink.png`: readability and active-nav evidence.
- `/tmp/sampling-1376-step3.png`, `/tmp/sampling-1376-step4.png`: wrong-step landing screenshots.

## Required narrow re-review after implementation

1. Run the durable symptom loop without browser proof injections; all checks must be green.
2. Revisit all 29 atlas destinations at wide and phone widths after scrolling settles, in both locales; assert correct step, visible heading, and no nav/document vertical-scroll interference.
3. Repeat 320/390/1376px layout checks and repeated canvas resize checks. Reveal hidden tabs and exercise representative canvas drag interactions.
4. Verify target hit areas, focused controls and links, forced-colors and reduced-motion behavior. Check both language toggles, unusually long titles, 120-character/CJK text at 320px, and 200% zoom; preserve disabled semantics. Keep each page’s total shipped CSS below 25,000 uncompressed bytes and serve the shared assets locally.
5. Re-run actual atlas→lesson→Back and lesson→Knowledge Index flows. Check lesson controls still operate and locale changes preserve their intended state.
6. Report public delivery separately from local browser verification. Do not sign off real devices or all scientific lesson branches based on this shared-shell review.

## Independent narrow re-review after implementation

Date: 2026-10-18. Reviewer: the same independent audit run, separate from the implementing run. Scope is the 13 legacy lessons and their shared shell; the new power-converter lesson is explicitly excluded.

**Verdict: the audited P0/P1 shared-shell repairs pass local browser re-review. No remaining blocker was found within this scope.** This is not a claim of public delivery, physical-device testing, exhaustive lesson-state correctness, or complete accessibility certification.

The dispatcher adopted this review in `specs/reviews/physics-ui-fix-brief.md`. The final re-review used these shared-asset SHA-256 hashes, verified unchanged before and after the final 116-route run:

```text
baba8033a0d98b04c85c2ec7b21f04093cd95f57b174af3c1ff64f76250d17a0  lesson-shell.css
c86fdfd8edfa28d98349e25fab95a54470bb56dd75e1f6dfc07533490a1c3353  lesson-shell.js
```

### Findings returned during re-review and their resolution

1. The first shell version repaired Fourier's `.head-top` but missed the other lessons' `.site-head`/`.head-main` flex structure. The archived symptom loop remained red for EN 320px headers: eigen 360px, convolution 341px, kalman 388px document widths. This was reported before continuing. After the implementer added wrapping and the shrinkable title structure, all three document widths were 320px and the complete locale matrix passed.
2. LTI and Kalman initially retained six `.chk` labels with 24.640625px hit-area height around native 17px checkboxes. This was reported as an adopted-contract gap. The implementer enlarged the labels; EN and zh measurements now show 48px minimum label height. Native checkbox dimensions and semantics remain unchanged.
3. An initial tab/resize probe sampled after 120ms and saw temporarily stale convolution backing widths. A before/after comparison with pre-change `HEAD:convolution/index.html` and a 600ms settled wait passed in both versions. The existing convolution resize handler is debounced. The complete tab matrix was repeated with the settled wait and passed; the early probe is not treated as a defect or regression.

### Final executed evidence

| Check | Coverage and result |
| --- | --- |
| Archived symptom loop | **8/8 green**, exit 0, without browser proof injections. Sampling step3 y87.890625, active step3; step4 y87.578125, active step4. Fourier link 13.388343:1, active nav bounds 243.609375–382.03125px within 390px viewport, nav target height 48px. Three narrow headers have scrollWidth 320. |
| Deep links after removing full-height sections | **116/116 pass**: all29 destinations × EN/zh × 1376/390px. Correct active step, heading below sticky nav and within the viewport, active nav item visible, no document overflow or page errors. Final checked assets match the hashes above. |
| Locale/layout matrix | **78/78 pass**: 13 routes × EN/zh × 1376/390/320px. No document overflow; correct `en`/`zh-CN` document language. |
| Control targets | Visible buttons, selects, text/number/range inputs and step controls meet 48px dimensions. Six native checkboxes use wrapping `.chk` labels at least 48px high in both languages. No remaining undersized associated hit area in the checked 13 routes. |
| Hidden tab/resize matrix | **64/64 pass**: sampling audio/image/wheel/audio and convolution audio/photo/data/audio, both locales, each at 390→1376→320→1376px. Initially hidden panels retained zero layout size. Visible canvas backing dimensions matched CSS size × DPR2 within rounding tolerance; 2D transforms remained 2 rather than accumulating. |
| Horizontal-only reveal | With document stationary at scrollY 7740 and hash `#step5`, changing the nav's active class moved nav.scrollLeft 519→671; scrollY and hash stayed unchanged. No focus request or lesson rerender is present in the shared module. |
| Focus/motion | A language button computed a 3px solid accent outline with 3px offset; its parent overflow is visible. Forced-colors retained a 3px outline. Reduced motion computed root `scroll-behavior:auto `. This is targeted rendered-style evidence, not a screen-reader certification. |
| CSS budget | Local lesson CSS plus shared CSS totals 7,391–14,148 uncompressed bytes per checked route, below 25,000. Shared resources are local. |
| Actual navigation | Atlas's open-lesson action reached Fourier `#step5`; browser Back returned to `/atlas/`; the lesson's Knowledge Index link reached `/`. |
| Visual inspection | Reviewed final Fourier wide step5 and eigen EN 320px screenshots. Content/navigation left edges align, cross-page links are readable, and the narrow title/language layout wraps without overflow. The original user screenshot's unexplained right shift remains unconfirmed and is not used as a repaired-bug claim. |

Commands executed for the narrow re-review:

```sh
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/lesson-shell-repro.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-rereview-routes.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-locale-flow.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-rereview-tabs-settled.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-convolution-compare.cjs
NODE_PATH=/Users/songyy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/physics-ui-rereview-access.cjs
```

Temporary detailed evidence: `/tmp/physics-ui-rereview-baseline.jsonl`, `/tmp/physics-ui-rereview-routes.json`, `/tmp/physics-ui-rereview-routes-summary.json`, `/tmp/physics-ui-rereview-locales-summary.json`, `/tmp/physics-ui-rereview-tabs.json`, `/tmp/physics-ui-rereview-tabs-summary.json`, `/tmp/physics-ui-rereview-access.json`, `/tmp/physics-ui-final-fourier.png`, and `/tmp/physics-ui-final-eigen-phone.png`. The symptom-loop source remains embedded above for durable reproduction.

Remaining coverage limits: physical phones, public assets, complete assistive-technology behavior, actual browser 200% zoom and artificial 120-character text stress, every simulation interaction, and all canvas-label contrast pairs were not certified by this narrow pass. Preserve those limits in delivery claims. P2 decoration and engine changes remain deferred.

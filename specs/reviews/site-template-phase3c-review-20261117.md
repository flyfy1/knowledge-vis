# Review: site template Phase 3 batch C (the five lessons batch B skipped)

- Reviewer: Claude Code (claude-opus-5-5), independent of the builder session, 2026-11-17.
- Instruction under review (Yangyu, 2026-11-17): 「请你把他们分别手工处理一下 而且多agent写同一篇的话 默认用更好的那个版本。做完直接部署上线」.
- Scope: the 18 unpushed commits 5173122d..373479cb:
  - promotions 408201ac (kepler-orbits), b383c6dc (acid-base-equilibrium), a3a44e7d (bayes-diagnostics),
    5f94f8bc (photosynthesis);
  - labels 1eec3614, 4a4db6ea, 167973f2, 58df5b17; generated 81f8ff07, d011a06c; acid-base table 5ac069a2; cache keys
    2afe5d0c; photosynthesis test 2d6f3d5a;
  - conversions c95ef919, 5ac22d79, 0e474801, c95ff8f9; docs 373479cb.
- Baselines: a `git archive 5173122d` copy for the replaced pages; `variants/claude-code/<slug>/` for the editions.
- Fix commits: 06000bd8, 67bc6af9 (authored), b8b27b51 (label, mechanical); this note, the HANDOFF line and three doc
  corrections in the next commit.

## Verdict

**Ready to deploy after 06000bd8, 67bc6af9 and b8b27b51.** The version choice is right in all five cases, the science
of the four promoted pages checks out, the promotions are faithful to the variants apart from the declared changes, the
authorship handling is honest and consistent with AUTHORSHIP.md §4, and the four conversions are exact. I found one
reader-visible defect (Chinese on an English canvas), two incoming links that land on the wrong step, and three stale
doc lines; all fixed. Nothing blocks deployment. Pushing and deploying still need Yangyu's go-ahead (the instruction
above gives it for this batch once reviewed).

## 1. Version choice

Compared independently against `5173122d` (old page text read from the archive copy, the variants from the tree).

- **kepler-orbits: agree, variant.** The old page is one step (three sliders, relative speed without units, English
  kicker and phase name on the zh page). The variant has seven steps with real units.
- **acid-base-equilibrium: agree, variant.** The old page's particle picture does not change visibly with Ka, c or the
  common ion. The variant's 200-molecule ledger reaches the analytic α, and every readout comes from the quadratic.
- **bayes-diagnostics: agree, variant.** The old four cards are correct but short. The variant adds the
  inverse-conditional step, repeat testing with likelihood ratios, and expected-vs-sampled counts.
- **photosynthesis: agree, variant; this was the closest call.** The Codex revised edition is careful (mobile, no-JS),
  but its rates are in relative units with no CO₂ unit, and it does not show respiration. The variant adds respiration,
  the compensation point, CO₂ in ppm, the mass budget and a day's net, all from one model. The old edition's no-JS
  fallback is covered by the template's zh pre-fill.
- **power-converters: agree, keep Codex.** Both editions are strong. `atlas/graph/core.json` has 22 deep links into
  the Codex page's specific steps (#step1 ×3, #step2 ×4, #step4 ×6, #step5 ×5, …), and the capacitor-rate and
  volt-second bridges and their tests are built on steps 2 and 4. Swapping would send those readers to steps about
  something else.

**Science, checked by hand** (the pages had only a self-check):

- **kepler-orbits:**
  - Constants: AU 1.495978707e11 m; GM☉ 1.32712440018e20; R☉ 6.957e8 m; R⊕ 6.371e6 m; R_J 7.1492e7 m, so Jupiter is
    11.2 R⊕.
  - Mean orbital speed 29.78 km/s. Earth e = 0.017: far/near 1.035, i.e. "about 3 %". Perihelion in early January.
  - Planet a, e and T values match standard tables (Mercury 0.387/0.206/0.241 … Neptune 30.07/0.009/164.8).
  - Halley: a 17.83 AU, e 0.967; √(17.83³) = 75.3 yr against the measured 75.3 yr.
  - Earth-size transit at 1 AU: (6371/695700)² = 84 ppm, lasting (T/π)·asin(1.0092/215.03) = 13.1 h. Jupiter-size:
    1.06 %.
  - Transit probability (R★ + Rp)/a ≈ 0.5 %. Inclination window at 1 AU for a Jupiter: acos(1.103/215.0) leaves 0.29°.
  - Duration ∝ √a. dA/dt = L/2m. Kepler's equation M = E − e sin E is stated correctly.
- **acid-base-equilibrium:**
  - Ka (25 °C): HClO₂ 1.1e-2, HF 6.8e-4, acetic 1.8e-5, HClO 2.9e-8, HCN 6.2e-10; all standard textbook values.
  - HClO₂ at 0.10 M: α = 28 %, "about a quarter". Ka = 1 at 0.1 M: α = 92 %, "above 90 % below pKa 0".
  - 100-fold dilution of acetic acid raises pH by about 1 (Ostwald). Tenfold dilution cuts Q to a tenth.
  - 0.1/0.1 acetate buffer has pH 4.74 = pKa.
  - [H⁺] ≥ 1e-6 everywhere a reader can go: step 2 offers only acetic acid and HF, and its slider lower bound is
    10^-4.5. Water error 0.117 %, pinned by the test.
  - Ka = kf/kr from mass action.
- **bayes-diagnostics:**
  - Default 2 %/90 %/95 %: PPV 18/67 = 26.9 %.
  - Specificity 95→99 % takes false alarms from 49 to 9.8. Prevalence 0.5 % gives 5 dots.
  - Repeat positives 26.9/86.9/99.2 %. LR at 80 % specificity: 4.5.
  - Quiz 99/99/0.1 %: 0.99/(0.99 + 9.99) = 9.0 %.
  - P(ill | negative) at 30 % prevalence: 4.3 %, "a few percent".
- **photosynthesis:**
  - (72 + 96)/180 = 93.3 % of glucose's mass from CO₂. The isotope note is correct (O₂ from water, glucose O from
    CO₂), and so is the 12 H₂O full equation.
  - van Helmont: 5 lb → 169 lb 3 oz, soil −2 oz = 2.27 → 76.74 kg, 57 g, published 1648.
  - Model (gross = min(0.12·I, 6/420·C)): saturation at 50 % light at 420 ppm, i.e. the lamp within 28.3 cm.
    Compensation point 8.3 %. Crossover 672 ppm at 80 % light. At 30 % light (and on an overcast day) CO₂ adds nothing.
    Net turns positive 19 min after a 06:00 sunrise.
  - Blackman 1905. Greenhouse 800–1000 ppm.
  - The splint text says only a "nearly pure" oxygen sample relights a glowing splint. That is a little strong (an
    enriched sample suffices), but it is standard school framing, so not changed.

## 2. Promotion

- **Faithful.** At each promotion commit `app.js`, `model.js` and `style.css` are byte copies of the variant. The other
  files differ only as declared:
  - `i18n.js`: `compare` removed and the footer's "parallel edition" clause dropped.
  - `index.html`: compare link and variant label removed; site-nav css/js added.
  - `tests/core.cjs`: the compare-link check inverted, the footer check loosened, and (photosynthesis) the CSS filter
    accepts `?v=`.
- **acid-base flattening (5ac069a2).** I re-ran the comparison: `STRINGS` before and after are `deepStrictEqual`.
- **Authorship.**
  - Each promotion commit carries `Built-By: Claude Code (claude-opus-5-5)`, the same agent and model as the variant
    creation commits (51e9f8bf, 1cb86a75, 185f4c6a, 95a55055). It is declared authored, and `Derived-From` cannot apply
    because the paths already exist (AUTHORSHIP.md §4).
  - `node scripts/authorship.cjs` gives `primary: claude-code` for `app.js`, `i18n.js`, `index.html`, `content.*.md`,
    `layout.html`, `BRIEF.md` and `tests/core.cjs` on all four pages. `created` still names the replaced file's first
    commit (9c0fcb64 unattributed, 95552271, 825d102c codex). That is correct: the path history is not rewritten.
  - `model.js` is created by 408201ac etc.
  - Honest: the text is this agent's own writing, and no other agent's work is attributed to Claude Code (the old
    authors keep their counted lines).
- **Labels.**
  - Per specs/visual-page-provenance.md "Promoting a parallel edition": three new Claude Code · original entries.
    photosynthesis changed from Codex · revised, its old 70d9f2e1 going to previousSourceRevision.
  - Each later page change was followed by a repoint (4a4db6ea, 167973f2, 58df5b17). The conversions are mechanical
    and are not pointed at (same as the batch B review's D4).
  - **originalSourceRevision left unset: agree.** The creation commits touched only `variants/`, and the core check
    requires a commit that touched the page. Writing the promotion commit there would also be wrong: it is the
    sourceRevision now, and it would freeze as "original" a commit that is a copy. The creation commits are named in
    `originalAuthorship`.
- **Removed files.**
  - photosynthesis `SCROLL-SPEC.md`, `build-report.md`, `tests/browser.cjs` and `tests/reproduce.cjs` tested the
    replaced edition's ids. bayes `tests/static.cjs` tested the replaced markup. All stay in history.
  - Two places still described them: AGENTS.md (the photosynthesis evidence directory) and
    specs/visual-page-provenance.md (the photosynthesis exception line). Both corrected in the note commit.
- **Incoming links.**
  - bayes: atlas `#step-posterior` → `#step3` (the PPV step) and `#step-likelihood` → `#step2` (four groups) are right;
    numbers-lie `#step-prior` → `#step1` with "a thousand dots" is right.
  - Stale reference: the hand-written CONCEPT-MAP.md line on numbers-lie (outside the generated blocks) still said
    `bayes-diagnostics#step-posterior`. Corrected in the note commit.
  - **photosynthesis `#step2`: two of the three links misled; fixed in 67bc6af9.** The old #step2 was the light curve;
    the new #step2 is van Helmont and the mass ledger. Two links promise "how chloroplasts turn light into organic
    matter" (cell-structure) and "how producers fix light energy into organic matter" (energy-pyramid), and the new
    #step2 mentions neither chloroplasts nor light. Both now go to `#step1`, which covers the inputs, products, light
    and chloroplasts. carbon-cycle's link ("how plants turn CO₂ into sugar") fits the mass step (93 % from CO₂), so it
    stays.
  - The edits were made in the `figures/` sources, then build-pages (photosynthesis linked-from rows, version
    20261117b, label not repointed) and build-registry.
- **Cache keys right.** `app.js`, `model.js` and `style.css` on the four pages carry `?v=20261117`. `i18n.js` uses
  `page.json` version 20261117a, now 20261117b on acid-base and photosynthesis after the fixes. site-nav uses
  `sn-20261116c`. numbers-lie's `copy.*.js` carry `?v=20261117` (its `app.js` and `models.js` did not change).
- **Not changed, for the team lead.** `variants/claude-code/{kepler-orbits,acid-base-equilibrium,bayes-diagnostics,photosynthesis}/`
  still show "对照另一版本 →" pointing at the canonical URL, which now serves the same lesson, and the variants index
  still lists them as two columns. This was left alone as instructed (variants are frozen). A reader who follows the
  link sees the same lesson again: harmless, but odd.

## 3. Conversions

- **Trailers exact on all four:**
  - `Built-By: script (deterministic, no model: scripts/convert-essay.cjs)`;
  - `Authorship-Impact: mechanical`;
  - an honest `Verified-By`;
  - one `Derived-From` per added file, `refs.json` excepted because it is generated. The old paths exist in the
    parent, and each target is added in that commit.
- **Other files in each commit:** only the page's own `index.html`, `i18n.js` and `page.json`, plus generated outputs
  of linked template pages, `site-registry.json` and `specs/atlas-edge-todo.md`.
- **Round trip, redone.** In a `git archive <conversion>` copy, I removed `version` and ran
  `build-pages --no-chrome --no-prefill`. `index.html` is byte-identical to the parent's on all four, and both string
  tables are equal key for key (130/109/119/139 keys, minus `site.*`).

## 4. Browser

Playwright at 1280/390/320, zh and en, reduced motion. Covered: the four pages plus numbers-lie, cell-structure,
energy-pyramid, carbon-cycle and atlas `?node=positive-predictive-value`. Every page was scrolled through so that
viewport-gated canvases draw.

- **What was checked:** horizontal overflow, page errors, HTTP ≥ 400, CJK in English text, and (new in this review)
  every `fillText`/`strokeText` string drawn on English canvases.
- **Results:**
  - **Defect, fixed in 06000bd8 (label b8b27b51).** acid-base step 1's pH chart title was 「pH · 横轴：pKa」 in English
    too. It came from the variant, and the converter had recorded the key in `enCjk` as a pre-existing exception.
    The fix is in `content.en.md`; `enCjk` was removed and `tests/core.cjs` now fails on any CJK in an English string.
    After the fix, no CJK is drawn on any English canvas of the four pages.
  - No overflow or errors on any of the 54 runs.
  - The only remaining CJK on English pages is not part of this batch: cell-structure's bilingual tag chips, carbon-cycle's
    Mini Claude Code footer, and atlas markup that is hidden or noscript-only. All three are the same at 5173122d.
- **Screenshots looked at:** acid-base step 1 at 1280 en, kepler step 4 at 320 zh, photosynthesis step 2 at 390 en,
  bayes step 3 at 1280 zh, plus full pages at 1280/320 zh/en.
- **Canvas sweeps:** results under Checks.

## Checks

All run one at a time on the final tree:

- **Labels, atlas and search:**
  - page-provenance-core: 275 pass.
  - build-atlas-data --check: OK.
  - build-search-index --check: OK (668 concepts).
  - data-quality: pass.
  - concept-search: 1752.
  - registry-import: 22.
  - authorship-derived-from: pass.
- **Site template, registry and navigation:**
  - build-pages --all --check: 203 pages.
  - site-template: 234.
  - build-registry --check: 249 pages.
  - build-registry tests: 60.
  - build-site-nav --check: pass.
  - site-nav: 2275.
  - test_index_pagination: ok.
- **Page tests:**
  - kepler: 9760.
  - acid-base: 5465.
  - bayes: 469490.
  - photosynthesis: 7619.
  - numbers-lie models: 1384.
- **Browser** (local server on 18871, stopped afterwards): canvas sweep 1280/390/320 zh/en all pass: kepler 7776, acid-base 450 (scroll-aware), bayes 3276, photosynthesis 2006 (scroll-aware) states. page-provenance-browser 275, site-nav-browser 389, home-concept-search 31.
- The evidence directories were checked out afterwards; `git status` shows no tracked changes outside the commits
  above.

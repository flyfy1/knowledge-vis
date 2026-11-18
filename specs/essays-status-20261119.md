# Essay status after the 2026-11-18/19 registration

Written by the registrar (Claude Code, claude-opus-5-5) on 2026-11-18 after registering nine reviewed essays. It is the hand-over
list for what is still open. Per-page decisions (aliases, links, cache keys, labels) are in `specs/<slug>.md`; the review records are
in `specs/reviews/`. Nothing here is deployed by the registrar; the team lead pushes and deploys.

Commits: essay commits 5f65e9f3 (chatbot), 4a16e24b (frontier), 1bfc5702 (a-secret), 9a934eae (chips), 25ab7a91 (fusion),
b60bb4cd (batteries), f7e8b240 (money), 351003c0 (atoms), b9d1df78 (quantum); registration and first labels 046b13df (its
message says "44 lesson pages"; it is 43 lesson pages plus how-a-computer-is-wired); atlas up-front limit 150,000 → 160,000
5a55828e; cross-links, atlas and aliases 3a4bbfb6; labels and cache keys de265446.

## 1. Registered (nine essays)

Open items below are copied from the last section of each review record ("Still open", "Open" or "Completion pass"), with
items the registration has since done marked as done.

### how-a-chatbot-writes (specs/reviews/how-a-chatbot-writes-review-20261118.md, "Completion pass" → "Still open")
- ~~ch9.links: the sequel what-a-frontier-model-takes is named in plain text in both languages. A registrar must turn it into a link
  when the sequel registers.~~ Done in 3a4bbfb6.
- The ch6 tie at the top-p cut and the ch4 function-word neighbours, as recorded above.
- Not checked: real touch devices and screen readers; the OpenAI Memory FAQ and o1 announcement (403); an independent re-derivation
  of the English bigram floor beyond ln 192, e^1.51 and the cat temperature values.

### what-a-frontier-model-takes (specs/reviews/what-a-frontier-model-takes-review-20261118.md, "Still open or unverified")
- EU amendment: whether the GPAI obligations were left undelayed is unconfirmed either way; regulation number and dates rest on
  law-firm summaries. SB 53 duties rest on the FPF explainer. Not read: Official Journal, SB 53 statute, the executive order's text,
  the CAC page, Williams 2009.
- Besiroglu's "about 70": the budget is not stated in the paper.
- "Used by Anthropic" (New Carlisle) and "used by OpenAI" (Abilene) were carried over from the page, not re-opened; only the owner
  column was verified in part 1.
- "Sonnet 5.5" is attributed to Anthropic on the page; the board lists the name without the company.
- Gao, Lieberum, Butlin and Chalmers: abstracts only.
- ch1's text input shows about 20 of the 24 default letters at 390 and 320 until scrolled.
- First-read notes left as design: ch1's live sentence names only the first earlier occurrence while the prose names both; ch11's
  default view has nothing removed; ch12 is nine dense bullets; ch7 carries two models.
- ~~Sibling links to `how-a-chatbot-writes` are for the registrar. No provenance label yet (needs a commit).~~ Done (3a4bbfb6, 046b13df).

### a-secret-in-public (specs/reviews/a-secret-in-public-review-20261118.md, §8 "Still open (none blocking)")
- The mersenneforum post for RSA-270 is still unread (403); the page says the item rests on Wikipedia. OMB M-26-15 not opened; the
  page says so. ML-KEM-768's 2^−164 is from draft-cfrg-schwabe-kyber-04 and was not checked against the FIPS 203 text. The compute
  figures of the three 2026 factorizations are the authors' own.
- Cosmetic, left as they are: negative numbers use a hyphen-minus ("-0.35"); the ch10 standards list is not in date order; at 320 px
  the long integers in the cube-root tiles break mid-number; four-digit numbers are written "2039" in headings and "2,039" in running
  text; in the narrow `mitm` diagram "Key Alice computes: 60" wraps with the number on its own line.
- The keyboard block runs at 1280 only (the controls are the same elements at 390/320, where the 48 px target check runs). Tab order
  was not walked control by control; reachability is checked by tabindex / disabled.
- No screen reader was used. The diagrams are `role="img"` with an `aria-label`, so the missing space between wrapped lines in
  `textContent` (§1) is not read out.
- REGISTRY.json was not reviewed. The registrar must turn the two draft titles back into links (`ch3.p4`, `ch8.p1`, `ch11.links`) once
  those pages are registered. — Registrar: ch8.p1 and ch11.links now link the quantum essay (3a4bbfb6). ch3.p4 and the other half of
  ch11.links name 《网页是怎么来到你手机上的》, still an unregistered draft, so they stay plain text. REGISTRY.json aliases were
  edited at registration (specs/a-secret-in-public.md).
- From HANDOFF: the RSA-896 sentence says only what the authors' post says (wording in §4 of the record); it waits for Yangyu to look.

### what-quantum-computers-do (specs/reviews/what-quantum-computers-do-review-20261118.md, "Completion pass" → "Still open")
- Willow spec-sheet numbers and the Nature peer-review file: see above (in the record).
- Items the first reviewer listed as search-result-only or not opened (Quantinuum October 2026 preprint, June 2026 Matters Arising,
  RSA-270 forum post) are unchanged and are worded as attributed on the page.
- ~~`page-provenance.json`, `page.json`, registration: not touched (outside this pass).~~ Done (046b13df).

### why-chips-are-hard (specs/reviews/why-chips-are-hard-review-20261118.md, "Still open")
- ~~fr.i18a is tagged 已量产: supported by The Register's report that laptops were about to go on sale, not by any opened source saying
  a unit shipped in 2025.~~ Retagged as a company claim on the team lead's decision (9a934eae; "Registrar change" in the record).
- Not verified from a primary source (unchanged from above): water n = 1.44, Mo/Si 75 %, Caughey–Thomas from the paper, Samsung's
  2022 release, IRDS 2025, Moon et al. 2023.
- Not independently recomputed by either reviewer: the items marked "not recomputed" above (all pinned to `models.js` by the node
  test; none of the fixes touched those models except the ch5 source extents, which the existing convergence check still passes).
- Live sentences at control extremes were not read one by one beyond what the browser test drives.
- The whole English page was read as copy and in section screenshots, not once more top to bottom in a browser.
- ~~Alias overlaps: unchanged, for the registrar.~~ Resolved at registration: existing owners kept chiplet words, Dennard scaling,
  threshold voltage, CoWoS, interconnect (specs/why-chips-are-hard.md).

### why-fusion-is-hard (specs/reviews/why-fusion-is-hard-review-20261118.md, "Still open")
- Screenshots were looked at in each model's default state; other states rest on the sweep, which does not see text lying on a line.
- From secondary sources only, worded as reported on the page: NIF "about 300 MJ" per shot (LLNL staff via Physics Today / Optica),
  ITER's roughly €5 bn extra cost (Physics World), BEST completion in 2027 (trade press).
- Not re-opened by either reviewer (covered by the builder's finishing pass): Kovari et al. 2018, Abdou et al. 2021, Eich et al. 2013,
  Wurzel & Hsu data points, the NIF shot list, JET / WEST / EAST / W7-X, CFS and Helion statements.
- Contrast and focus rings were not measured beyond what `tests/browser.cjs` covers.
- ~~Not registered: no `page.json`, no provenance label.~~ Done (046b13df). Scratch files remain in
  `/tmp/agent-tasks/essays/review2-why-fusion-is-hard/`.

### why-batteries-hold-so-little (specs/reviews/why-batteries-hold-so-little-review-20261118.md, "Still open or unverified")
- The standard's number and start date (official platform unreachable); the 20 % / 5 % thresholds rest on trade press only.
- Ricardo teardown: third-party copy only, one cell, no second mass breakdown.
- Nature 2026 cell: paper not read; cycle life and capacity unknown.
- Schmalstieg 2014 paper not opened; the 70 % fit floor stays an assumption (said on the page).
- Not checked by either reviewer: Naxtra deliveries, Shenxing 3, Blade 2.0, Amprius, Form Energy, ProLogium, EU regulation text,
  Frith, Ank, Ohneseit, OWID data, EVTank; link titles against `pages.config.js`; live sentences at control extremes in English (the
  Chinese branches are covered by `tests/models.cjs`). — Registrar: the consistency check at registration found no broken link and
  no unregistered quoted title.
- In headless Chromium the page's CJK-first font stack draws "°" full-width ("25 ° C") in both languages; not checked in a desktop
  browser. The stack is the site's shared one and was not changed.
- Design choice left as is: ch7 opens at 25 °C, outside the fit range (the page says so).
- Its finishing pass was done by a sub-agent whose model is not recorded (Built-By says "model unavailable").

### why-one-rate-moves-everything (specs/reviews/why-one-rate-moves-everything-review-20261118.md, "Still open or unverified")
- CBO 62105 / 62809 read only via the Wayback Machine. BoJ statement PDF, the europarl.europa.eu vote page, Treasury's
  average-maturity table: secondary sources only (as in §4). Papers listed in §4 as not opened: unchanged. NBER's dating lag
  ("several months to a year") rests on the first reviewer's note.
- The "inversions wholly inside a recession are not signals" clause is the reading needed to reproduce Estrella & Trubin's "no false
  signals"; the page says so, the paper does not state it as a rule.
- Fig. 3 English year labels are abbreviated ("End yr 1") to fit 320 px. SVG labels that wrap lose the space at the line break in
  copied text (`innerText`), not on screen.
- `tools/bey.cjs`, `tools/patch_data.cjs`: delete when convenient (with `git rm`). ~~Page not registered, no `page.json`, no provenance
  label, nothing committed (by instruction).~~ Done (f7e8b240, 046b13df).

### why-atoms-stick-together (specs/reviews/why-atoms-stick-together-review-20261119.md, "Open")
- Textbook measured values and classic volume/page numbers were compared with memory of the standard references, not with an open
  handbook.
- Not opened: the MatterGen Nature paper (figures are from Microsoft's blog; the page says so); the EPFL news release (search summary
  only); Cheetham & Seshadri, Zhao et al., Ao et al., Liu et al., OMol25 and Jumper et al. were not re-opened.
- The chapter 7 lab's live sentence is refreshed every 0.6 s while the "measured temperature" tile updates every frame, so the two can
  differ by a few hundredths of ε/k at a given moment. Left as is.
- `canvas-text-overlap --sweep` reports are summarised in the reviewer's final message; it cannot see text on lines.
- ~~Registration, provenance label and deployment are not part of this review. `tests/models.cjs` still asserts "no provenance label
  yet (unregistered draft)", which the registrar must replace.~~ Done in 046b13df (it now requires exactly one label); deployment is
  the team lead's.

### Left by the registration itself
- why-compute-waits-for-memory (Antigravity) links the chips essay (#ch4, #ch10) and the frontier essay (#ch8); all resolve now, but its
  English link texts still use old titles ("Why Faster Chips Keep Getting Harder", "…Frontier Language Model"). Fixing them is an
  authored change to an Antigravity page and needs an evidence note in specs/reviews/; not done.
- Search words that no page had as an alias but that reached an existing page through its title or description, and now reach a new
  essay: 晶体管 / transistor (switches-that-compute → chips #ch3), 隧穿 (quantum-tunneling → fusion #ch3), 纠错 (inside-a-phone #ecc →
  quantum #ch10), 签名 (boots #ch8 → a-secret #ch6), 量化 (where-money-comes-from → frontier #ch9), MoE, 算力, 漏电, 背面供电,
  Transformer是什么. Left; decide whether any should go back (specs/atlas-search-index.md).
- Atlas region choices: fusion → circuits and chips → tech are judgement calls (specs/essays.md).
- The atlas up-front index limit was raised to 160,000 bytes as a stop-gap (see Next steps 1).

## 2. Unreviewed drafts on main (not registered, not live)

| Directory | State | Known problems |
|---|---|---|
| `physics/electromagnetism/what-travels-through-empty-space/` | zh done, Haiku en, not reviewed | Translator's doubts: a ch2 caption says "magnetic fields" where the quantity is the current; a section link's text does not match its target heading; ch12 attributes the 2027–28 High-NA date to ASML's CEO while BRIEF cites trade press |
| `investment/derivatives/a-fair-price-for-a-bet/` | zh done, Haiku en, not reviewed | 元 is rendered "yuan" even in the LTCM passage; new subtopic `derivatives` needed |
| `chemistry/reactions/which-way-reactions-go/` | **unfinished** | Twelve labs not wired (app.js only switches language); never run in a browser; no browser.cjs (BRIEF "Unfinished / not verified") |
| `computing/ml/noise-into-pictures/` | zh only (2026-11-11) | No English, no review, no diagrams; see HANDOFF "未上线" table |
| `tech/networks/how-much-a-wire-can-carry/` | zh only | as above; browser test switched to instant scrolling, some numbers second-hand only |
| `tech/networks/how-a-web-page-arrives/` | zh only | as above; a-secret-in-public ch3.p4 / ch11.links and the OS and NIC essays name it in plain text |
| `tech/energy/how-electricity-reaches-you/` | zh only | as above; how-power-reaches-the-cpu names it in plain text |
| `economics/markets/why-a-few-firms-win/` | zh only | as above; Menlo (an Anthropic investor) share data — check the disclosure; two papers not opened |
| `arts/music/why-notes-sound-good-together/` | zh only | as above |
| `psychology/cognition/why-we-forget/` | zh only | as above; seven papers read as abstracts only |
| `earth/geo/what-magnitude-means/` | zh only | as above |
| `biology/body/why-we-get-sleepy/` | zh only | as above; **the model's jet-lag direction at the default τ = 24.2 h is opposite to measured data** |

## 3. Quantum

what-quantum-computers-do was registered in this batch on the team lead's word (new subtopic computing/quantum, atlas region
computing); its open items are in section 1.

## 4. Next steps

1. **Compact the atlas up-front index (option B), before the next essay import.** The limit was raised from 150,000 to 160,000 bytes
   as a stop-gap (5a55828e, team lead, reported to Yangyu); the index is 153,348 bytes. Proper fix: stop repeating the lesson slug in
   every row of an essay's concepts (about 25 bytes per concept) or similar, independently reviewed, so the limit can stay put.
2. The two drafts that have English (what-travels-through-empty-space, a-fair-price-for-a-bet): fix the translator's doubts
   above, then independent review, then registration.
3. which-way-reactions-go: finish the twelve labs and a browser test, then translation check and review. When it registers, the
   atoms essay's ch11.links (thermodynamics) becomes a link.
4. The nine Chinese drafts of 2026-11-11: finishing pass (facts, models, ≥ 6 diagrams), Haiku translation, independent review —
   the recipe in HANDOFF "2026-11-18 这一轮". why-we-get-sleepy's model direction first.
5. Small follow-ups on live pages: the why-compute-waits-for-memory English link titles (with an evidence note); the search words in
   section 1 that moved by title/description, if any should go back; `git rm` money's two scratch tools.
6. Yangyu: the RSA-896 wording in a-secret-in-public.

## 5. Deployed 2026-11-19, and what was not checked (team lead)

Deployed from `61993267` to https://visual.integ.life (pushed to `origin/main`). All nine registered essays and
the twelve unreviewed drafts in section 2 answer HTTP 200; the drafts are reachable by URL only (so section 2's
"not live" means "not registered": they are on the server). Section 3's placeholder is superseded: the quantum
essay is registered (section 1).

The owner asked to stop here. **Not checked** — pick up from this list:

- After registration (provenance label added to each page), the canvas sweep
  (`tests/canvas-text-overlap.cjs --sweep`) was not rerun on any of the nine essays. Each passed before
  registration, per its review record.
- `tests/browser.cjs` of `a-secret-in-public` and `why-fusion-is-hard` FAILED after registration: the "no CJK in
  English" check counted the Chinese half of the provenance label, which CSS hides in English mode (the registrar's
  diagnosis: a test bug, pages fine). A one-line fix to both tests (skip `.page-provenance .provenance-zh` only
  when its computed display is none) is committed but **has not been run**.
- The other seven essays' browser.cjs, the three site-wide browser tests and every node check passed on
  `61993267` (list in the registration report; summarised in HANDOFF).
- Nobody has looked at the live pages in a browser after deployment; only HTTP status codes were checked.
- Everything listed under each essay's "still open / unverified" above is still open.
- The atlas up-front index limit was raised from 150,000 to 160,000 bytes as a stop-gap (index 153,348 bytes);
  compacting the index is pending and should precede the next import.
- The RSA-896 sentence in `a-secret-in-public` (wording in its review record) awaits the owner's confirmation.

# Review: how-power-reaches-the-cpu (电是怎么送进 CPU 的 / How Power Reaches the CPU), 2026-11-15

Reviewer: Claude Code (claude-opus-5-5), independent (did not build the page). Built by Claude Code (claude-opus-5-5,
zh), English by Haiku. Scope: REVIEW-COMMON steps 1–7, STANDARD §4a, site-navigation includes, the builder's
unverified list, the translator's flags. All edits are inside `computing/systems/how-power-reaches-the-cpu/` and
this note. Nothing committed.

## Verdict

**Publishable after these fixes.** The models are real (alpha-power V/f, a three-point 80 PLUS loss fit, SLVA882B
ripple cancellation checked against a brute-force sum, a time-domain PDN ladder plus |Z(f)|, a menu-style governor
over `skl_cstates`, an EWMA PL1/PL2/Tau over a thermal RC chain), every prose number comes from `prose()` and is
pinned, and the tuned parameters are labelled where they are used. The main errors were one reversed sourced
figure, a misreading of the droop decomposition, a nanosecond claim that did not match the model's ramp, and a
Tau value from one generation applied to another without saying so.

## First-read notes (zh, 1280)

1. ch5: the readouts implied the 152 mV dip was "123 mV of load line + 29 mV". It isn't: the trace shows the dip at
   about 11 ns, before the regulator has moved, and the voltage then rebounds to near 1.22 V before settling to the
   load-line value. The dip is all PDN; 123 mV is only where it ends. The model itself shows this: the dip is
   152 mV with or without a load line.
2. Hero and ch5 said "几纳秒" but the model's step rises in 10 ns, and ch5.limit said that ramp "does not excite"
   the 44 MHz peak, although the peak is what causes the extra 29 mV.
3. ch9 said Tau is 56 s next to the 14900K's 125/253 W, but 56 s is the 10th-gen datasheet value. It also gave
   34 s (closed form) and 36 s (simulation) for the same run without explaining the difference.
4. ch2.p3 "功率涨 1.70 倍，几乎刚好翻倍" read as contradictory. In Chinese, "多了 1.17 倍" means +117 %.
5. ch3.p3 sent the reader to "上一章" for the chapter-1 default and quoted a literal 400 W. ch1.say.full said
   "下一章说为什么", but the headroom is explained in ch3, not ch2.

## Errors found and fixed

- **ATX efficiency reversed** (ch3.p2, both languages). The text gave "70/72/65%" in a sentence whose other triples
  are in 20/50/100 % order. Table 4-14 of rev 2.1a is 70 % full / 72 % typical / 65 % light, so the 20/50/100 order
  is **65/72/70**. The test pinned the wrong string; it now builds the string from `SRC.atx.req` and checks the
  table order.
- **Droop decomposition** (ch5.p4, ch5.say.ok, ch5.read.static and ch5.read.droop in both languages). The text now
  says the voltage sinks by up to 152 mV, settles 123 mV lower, and so bottoms out only 29 mV below its final value.
  ch5.p3's AVP explanation was rewritten: the dip and the release overshoot fall inside room set aside in advance
  (the old text said the voltage "does not overshoot and bounce back", which the trace contradicts). The LLC
  "price" was called 过冲 for what the model shows as an undershoot; it now names both.
- **Time scale**: 几纳秒 → 十来纳秒 / "about ten nanoseconds" in doc.desc, REGISTRY desc (zh+en), the meta
  description, hero.sub, hero.lead, ch5.law and ch5.p1. ch5.limit now quantifies the steeper case. I added
  `PDN.riseFast` (2 ns) and a `rise` option to `pdnStep`. The new values `sFast` = 183 mV and `riseFast` are
  pinned, and the tests now check that a steeper ramp sinks deeper and that the dip is the same with LL = 0. On
  the rate itself: 10 A/ns at the die is an order-of-magnitude choice, and ch5.tuned now says so. It is the
  die-level first-droop scale, not the socket-level VR di/dt, which is about 100× slower.
- **Tau** (ch9.p2 both languages): the text now says the 14900K's Tau was not found. 56 s is the i9-10900K
  datasheet value, borrowed by the model, and the 125/253/56 combination is illustrative. ch9.p4 explains why the
  simulation's 36 s exceeds the formula's 34 s (100 MHz steps keep the sprint power just under 253 W).
- ch2.p3 ratios reworded (dynamic power doubles and leakage stays the same, so the total is ×1.70; 1.17× / 1.69×).
  ch2.p4: the old text said 5 V chips were slow because power goes with V². The reason is now voltage scaling with
  transistor size (power and oxide).
- ch3.p3: 上一章 → 第 1 章, and `{c253wall}` instead of a literal 400. ch1.say.full: 下一章 → 第 3 章.
- ch5.p2 capacitor bands now agree with the model and the diagram (bulk ~10 kHz–1 MHz, not "below tens of kHz").
  dg.pdn.f1 is 200 kHz, to match ch5.tuned.
- ch6.p2: ICCmax was presented as caused by electromigration ("所以"); now "one reason". ch6.p4: per-cluster rails
  hedged from 通常 to 很多.
- ch10.p1, Google: "至少省电 30%" → "能效至少高 30%", which is the blog's wording, with a note that it does not
  say which losses it counts.
- ch11.d1: "standard-cell utilization" → "cell density", the newsroom's word. ch11.c1: A16 "2026" → "H2 2026"
  (FRONTIER and test updated).
- ch1.limit: notes that efficiencies come from the 115 V table while the chain runs on 220 V. ch8.limit: the
  "average of 8" rule is a simplification of menu, which also uses the next timer.
- Footer: removed 「英文稿待翻译。」 from the zh footer.
- English: the draft titles now match the drafts' REGISTRY titles ("Why Faster Chips Keep Getting Harder", "Where
  the Power Comes From the Instant You Flip the Switch"), so site-nav will auto-link them once those pages are
  live. desc.en is aligned with hero.sub.
- Diagrams: the "Powered-off core" label overflowed its box in en at every width (→ "Core off"). The psu label
  "Secondary (safe low voltage)" sat on the isolation line in en at 1280 (now end-anchored left of the line). "Floor
  0.70 V" is shortened to clear the curve at 320. The vrm and bspd captions said left/right, which is wrong in the
  stacked narrow layout (now neutral wording). bspd: backside bumps carry signal too. The cst caption notes that
  C7s and C9 are omitted.
- Alias: `LLC` → `防掉压`. LLC reads as last-level cache in a computing search.

## Sources spot-checked (opened)

Intel ATX rev 2.1a PDF: Table 3-3, Table 2-1 and its note, §2.2.1, the +12 V table, Table 4-14. 80 PLUS 115 V
tiers (Wikipedia table; CLEAResult page now 404). Intel PowerVia newsroom. Google 2016 OCP blog. NVIDIA 800 V
blog. AMD Ryzen Master guide (PPT/TDC/EDC). hwbusters Intel profile table (125/253 W, ICCmax 307 A, no Tau).
Searched the A16 schedule. By hand: SLVA882B k = 0.148; VRM loss 14.0 W; static 123 mV; boost 33.5 s; steady Tj
at 0.20 / 0.08 K/W.

## Still unverified

The 230 W PPT (press). The Smith 1999 paper, Sakurai–Newton and Black, by name only. The 20A cancellation and
Panther Lake's January 2026 availability (press). A16 actually in production (not found). "Many boards set
PL1 = PL2" (press; now attributed). PROCHOT bidirectionality. The 14900K's Tau. Per-cluster rails. Ruby's
20/50/100 % points (one secondary table).

## Tests (final runs, serial, port 18992)

- `node tests/models.cjs` → `PASS: 4371 checks (…)`
- `ESSAY_BASE_URL=http://127.0.0.1:18992 node tests/browser.cjs` → `PASS: browser smoke test (zh+en at 1280/390/320 … ten diagrams … reduced motion)`
- `CANVAS_BASE_URL=http://127.0.0.1:18992 node tests/canvas-text-overlap.cjs --sweep computing/systems/how-power-reaches-the-cpu/`:
  first run `FAIL: 2 findings; 1197 canvas states checked` ("10 µs" × "Final settling" on #pdCv at 200 A step, en 390/320);
  fixed in app.js (the label goes below the final-voltage line only if it clears the time axis); rerun
  `PASS: 1197 canvas states … have no colliding or clipped text`. (Two copy edits landed during that rerun: shorter
  en ch1 bar labels and a zh caption; both only shorten text.)
- Screenshots viewed: all 10 diagrams at zh-1280, en-1280 and en-320; psu/bspd/pdn at zh-390, pdn at zh-320; all 8
  models at zh-1280 and en-320; ch1/2/5/9 at zh-320; ch5 at en-390. The en-320 ch1 bar labels were tiny (long en
  labels shrank the font); shortened to "PSU (AC → 12 V)", "VRM (12 V → core)", "Socket and package". The zh pdn
  caption said 越往右 although the narrow diagram is vertical, so it is now neutral. Not individually viewed:
  zh-390/en-390 models other than ch5; the full-page reduced-motion shot (covered by the browser test's
  reduced-motion checks). Shots in /tmp/agent-tasks/arch/review-power/shots2.

## Left as is (design, not errors)

The thermal "Intel" preset label keeps "PL1 125 / PL2 253 / Tau 56"; the prose now says the combination is
illustrative. The pl diagram's EWMA curve looks nearly linear. Script cache keys are still `?v=20261115`, and the
registrar should bump them if that version was ever served.

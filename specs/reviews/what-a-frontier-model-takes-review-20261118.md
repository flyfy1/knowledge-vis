# Independent review — computing/ml/what-a-frontier-model-takes/ — 2026-11-18

Reviewer: Claude Code (claude-fable-5-2), a session that did not write, fact-check or translate the page.
Brief followed: `specs/essay-briefs/REVIEW-COMMON.md` (seven steps), plus the seven points in the task.
Scratch and screenshots: `/tmp/agent-tasks/essays/review-what-a-frontier-model-takes/`.

## 1. First-read notes (Chinese, 1280, in the browser, before BRIEF.md or code)

Written after reading the rendered page top to bottom and looking at all sixteen models in their default
state. Numbers I could check in my head or on paper while reading are marked (ok).

1. **The hero promises a bill the page never produces.** The subtitle says the page "算到几亿美元的账单"
   (a bill of several hundred million dollars). The only bill the reader sees is the Llama 3.1 405B one:
   7,787 万美元 at the default, i.e. under one hundred million. Either the model reaches several hundred
   million somewhere, or the subtitle overstates.
2. **ch1 live sentence and prose disagree on a detail.** The sentence under the model says "「t」在第 0 位出现过";
   the paragraph below it says t appeared at positions 0 and 6. Both are in front of the reader at once.
3. **ch2's closing caveat undermines its own model.** After a model whose readouts are quoted to two digits
   (8.2×10³), the last paragraph says the readouts differ from the infinite-width theory by "几倍到十几倍" and
   quotes 1.4×10⁵ for the same quantity. A reader is left not knowing which number to believe, or why a
   64-wide network would be 17× off. Needs checking and a clearer explanation (see §3).
4. **ch9 diagram: "每秒 1,979 万亿次运算（按峰值的50% 计）".** 1,979 is also the number ch6 told me to distrust
   (the sparse figure on the H100 datasheet). Here it is 4 cards × 989 × 50%, a coincidence the reader cannot
   see through. Also a missing space before 50%.
5. **ch11's default view shows nothing.** No head is ablated when the reader arrives: 100.0%, "一个头也没拆".
   The chapter's whole point (0.6% without head 1.1) is two clicks away and is given away by the prose instead.
6. ch8, first model: the "generated" tile shows 19 letters and the axis runs 1–19, while the how line says the
   model "写满 24 个位置". 6 + 19 = 25. The 24 are the positions read, not the letters written; one clause would
   fix it. The tile also breaks the string mid-word.
7. ch12 is a wall of nine dense bullets; it is the one place the essay reads like a list. The labels
   确立 / 已公布 / 估计 do the work the brief asked for. The chart's default selection is an Epoch estimate
   (Mistral Large 4, "把握大"), which is a fair default for a chapter whose law is "most of this is estimates".
8. ch7 carries two unrelated models (LoRA, benchmark noise) and is the longest chapter; the benchmark one is
   the better of the two (22% reversal at a 2-point gap is not given away by the law).
9. ch5: the Hoffmann-vs-refit paragraph is the best paragraph on the page, but "87" (this page's number) and
   "约 70" (Besiroglu's) sit side by side without a reason for the difference.
10. ch12/ch8/ch9/ch10 name three companies' products and prices; Anthropic's own model appears in price
    comparisons and the HLE line. Needs the self-interest pass (§5).
11. Sums that worked on paper while reading (ok): 989×0.41×3600 → 2,596 万卡时; 66 days; 18,169 MWh; 7,787 万美元;
    LoRA 18,874,368 = 2·96·2·4·12288; KV 327,680 bytes; 42.9 GB; roofline 16.9 ms, 1,889 tok/s, $1.76 and
    $35.8; ±3.5 points and 22%; speculative 3.36, 2.80, 3.09 at γ = 8.

(Sections 2–8 below were written after reading BRIEF.md, the code and the sources.)

## STATUS: review stopped early (team lead's wind-down, owner out of token budget)

**No file in the essay directory was edited by this review except BRIEF.md (a status note).** Everything
below is a finding with a proposed fix, not a fix. Verdict so far: **ready after the listed fixes**; no model
is wrong, several sentences are.

Tests at the point of stopping (unchanged files):
- `node tests/models.cjs` → `2203/2203 checks passed`
- `tests/browser.cjs` (port 19022) → `browser: all checks passed (zh at 1280/390/320, en; every model driven; reduced motion)`
- copy.zh.js / copy.en.js: 590 keys each, identical key sets.
- Server on 19022 stopped.

## 2. Models re-derived (own script, `/tmp/agent-tasks/essays/review-what-a-frontier-model-takes/rederive.cjs`)

Own forward pass, quantiser, ablation and counters; `models.js` used only for the data generator.
All reproduce the page:
- Forward pass vs `tests/reference.json`: max |Δ| 5.3e-15 over 5 sequences; 27,930 weights.
- ch1: P(o) 0.9994 at position 12; head 1.1 puts 0.846 on position 1 (0.995 on positions 1+7); P(t) 0.091 at position 4.
- Bayes floor 0.9261 (own enumeration). Ablation: 0.6% / 16.6% / 100% / 100%; both heads 1.1%.
- Quantisation: 4-bit 18,496 bytes, loss 0.991; 3-bit 96.7%; 2-bit 15.5%.
- KV: 7,569,600 vs 648,192 MACs (11.68×), 3,072 cached numbers.
- Parameters: GPT-3 174,604,259,328; Llama 8B 8,030,261,248; 70B 70,553,706,496; 405B 405,853,388,800. 160.5 GFLOP, 13.4% / 71.2%.
- Chinchilla (numeric minimum on a grid, not the closed form): re-fit 18.7 tokens/param at 10^23.5; gap 0.0166; GPT-3's loss at 60.9% of its compute; Llama 8B 102× the optimal ratio, gap 0.054.
- Bill 3.791e25 FLOP, 2.5955e7 GPU-h, 66.0 days, 18,169 MWh, $77.87M at $3 ($79.7M at the $3.07 index, $119.1M at Lambda's $4.59).
- LoRA 18,874,368 = 1/9,251; 2.79 TB vs 349.5 GB. Roofline 16.9 ms / 2.6 ms, 59.0, 1,889, $1.76; batch 1: 93.2, $35.77; batch 64: 171.8 GB; 4-bit 110.6.
- Speculative decoding Monte Carlo 3.366 vs formula 3.362. Benchmark ±3.51, z 0.777. Trend 2.54 / 4.43 / 1.99.

### Findings on models
- **ch2, "17× off theory": true for this draw, but misleading as written.** `depthRun` uses one seed (5).
  Seeds 1–7 at 48 layers, gain 0.8 give for the un-normalised residual stack 8.2e3 (seed 5), 1.1e5, 4.7e4,
  8.9e4, 2.3e5, 4.7e4, 9.0e4, against theory 1.4e5. Seed 5 is the low outlier; the typical draw is within
  about 3× of theory. The plain stack's 3× shortfall is systematic (finite width lowers the typical value:
  seeds give 7e-6 to 2e-4 vs 2.2e-5). `ch2.limit` blames width 64 in general ("几倍到十几倍"). PROPOSED:
  rewrite `ch2.limit` to say this is one draw, that other draws of the same network range over about 30×
  (give the two ranges), and pin that range in `tests/models.cjs`; or average log-readouts over several
  draws (changes six pinned numbers). Not done.
- **Tokens per parameter, 87 vs 70.** Rounded exponents (0.34/0.28) give 87.5 at 10^23.5 (checked).
  Hoffmann's reported, unrounded parameters (Besiroglu Table 1: 0.3392/0.2849) give 56 at 10^23.5 and 76 at
  10^25. Besiroglu §3.3 says "approximately 70 tokens per parameter" without stating a budget. The page's
  "(他们按原文参数算出约 70 个)" is a correct quotation; it would be clearer to add that the figure depends on
  the budget. Not changed.
- MoE toy γ = 0.01 vs 0.001: disclosed in ch10.p4. Fine.

## 3. Facts opened by this reviewer on 2026-11-18

Confirmed as the page states them:
- Lambda (lambda.com/pricing): HGX H100 $4.59/GPU-h on demand; no reserved price; **no date on the page**.
- Together AI: $3.99 on demand, $3.45 reserved 31–90 days; table labelled **"Prices as of October 2026"** (also $3.69 for 7–30 days, not on the page).
- Silicon Data SDH100RT: $3.07, **no date shown**; described as neo-cloud and marketplace rentals (the hyperscaler reading is $7.08).
- Anthropic pricing: Fable 5.2 $8 / $40, cache hit $0.20 (0.025×). OpenAI GPT-6 Astra: $10 / $50, **cached input $1 (1/10)**, 1,050,000 / 922,000 / 128,000, 2× above 272K, text+image in, text out. DeepSeek: V4-Pro $0.66–1.32 / $1.98–3.96, cache hit $0.022–0.044; V4.1-Flash accepts images.
- HLE board (updated 17 Sept 2026): GPT 6 Astra 54.80 ± 1.94 (calibration 39); Fable 5.1 46.50 ± 2.00 (20); **gemini-3.1-pro-preview 46.44 ± 1.96 (51); Sonnet 5.5 46.12 ± 1.95**.
- Epoch CSV (downloaded again): Astra 9.4e26 "Likely"; 25 above 1e25, 4 above 1e26; Mistral Large 4 1.05T, Kimi K3 2.8T, GLM-5 744B, DeepSeek-V4-Pro 1.6T. Epoch data centres (6 Nov 2026): New Carlisle 1,037 MW (owner listed: Amazon), Colossus 2 946 MW (SpaceXAI), Abilene 824 MW (owner listed: Oracle), then Microsoft Fairwater Atlanta 636 MW.
- DeepSeek-V4-Pro model page: 1.6T / 49B, 1M, >32T tokens, MIT, "10% of KV cache".
- Llama 3.1 model card: 30.84M / 39.3M GPU-h, 700 W. GPT-3 Table D.1: 3.14E+23, 174,600M, 300B. LoRA abstract: 10,000× and 3×. Kaplan abstract. Besiroglu Table 1 = `FITS.epoch`.
- DeepMind post (26 Mar 2025) loaded this time: SAEs underperformed linear probes; team is "deprioritising fundamental SAE research". Matches ch11.p5.
- He 2015 (init), He 2015/16 (ResNet, arXiv Dec 2015), Ba 2016, Xiong 2020 (ICML), Loshchilov & Hutter (ICLR 2019): arXiv abstracts opened, match.
- A100: 312 TFLOPS dense BF16, 2,039 GB/s and 400 W (SXM). DGX B200: 8 GPUs, about 14.3 kW.
- AI Act Art. 51(2): 10^25 FLOP presumption. EO 14365, signed 11 Dec 2025, AI Litigation Task Force (search summaries of the order and govinfo record; order text not read).
- xAI–SpaceX: SpaceX announced the acquisition on 2 Feb 2026 (press; Epoch lists "SpaceXAI").

Wrong or imprecise on the page (NOT yet fixed):
1. **ch1.p2 (both languages): "2022 年 Anthropic 的研究者在真实的大模型里找到了做这件事的电路".** Olsson et al. claim causal evidence only in small attention-only models and correlational evidence in larger ones. PROPOSED: "在小的、只有注意力的模型里拿到了因果证据，在更大的模型里只有相关性证据".
2. **ch4.p3: "Olsson 等在大模型训练里也看到了同样的现象".** The paper says "language models of every size (provided they have more than one layer)" among the 34 it trained. PROPOSED: "在他们训练的各种大小的语言模型里（只要多于一层）".
3. **ch12.f.law, SB 53.** The frontier AI framework must be published only by *large* frontier developers (revenue above $500M); transparency reports apply to all frontier developers (FPF explainer). The page gives both duties to all.
4. **ch12.f.law, omnibus.** Now known: Regulation (EU) 2026/1744, OJ 24 July 2026, in force 27 July 2026; Annex III high-risk moved to 2 Dec 2027, Annex I to 2 Aug 2028 (Lewis Silkin, search summaries). That the GPAI part was *not* delayed is still unconfirmed: no source I opened addresses it. Keep the condition; add the regulation number.
5. **ch12.f.law, China (English only).** Use "Measures for Labeling of AI-Generated Synthetic Content" (China Law Translate, ETO AGORA), not the translator's "Labelling".
6. **ch12.f.clusters.** Say who Epoch lists as owner (Amazon; Oracle) and replace "据报道 xAI 已并入 SpaceX" with the dated announcement (Feb 2026).
7. **ch6.p3.** Date each price: Together "as of October 2026" (its page), Lambda and Silicon Data undated on their pages (seen 18 Nov 2026). Say in so many words that the $3 default is the index rounded and is below both on-demand list prices. The sentence "这两家的页面上都只写‘联系销售’" is right for Lambda and for Together beyond 90 days.
8. **hero.sub (both).** "几亿美元 / hundreds of millions of dollars": the page's bill is $78M at the default. PROPOSED: "几千万美元 / tens of millions of dollars".
9. ch8 how line: "写满 24 个位置" while 19 letters are written (24 positions are read).

Not opened / not confirmed: Williams 2009 text (OSTI record only; ACM 403, LBL pages 404); EU OJ text; the
executive order's own text; the CAC page; SB 53 statute text (law-firm summaries give 1 Jan 2026).

## 4. Self-interest check (findings; NO sentence changed yet)

- **HLE (ch12.f.bench).** The page names Claude Fable 5.1 "second" at 46.50 ± 2.00. Google's
  gemini-3.1-pro-preview is at 46.44 ± 1.96 and Sonnet 5.5 at 46.12: places two to four are a statistical tie.
  PROPOSED: say so and name the Google model.
- **Calibration (ch12.q4).** Only the first-place (OpenAI) model's 39% is quoted. The board lists 20 to 51
  among the top five. PROPOSED: give the range, without singling out one company.
- **Cache-hit prices (ch8.p4).** Anthropic 1/40 and DeepSeek 1/30 are quoted; OpenAI's 1/10 ($1 on $10) is
  left out. PROPOSED: quote all three.
- **Interpretability (ch11.p4).** Anthropic's SAE result gets a sentence with sizes; OpenAI's (Gao et al.
  2024) and DeepMind's (Gemma Scope, 2024) are absent, and DeepMind appears only as the team that stepped
  back. PROPOSED: name the other two (to be opened first; not opened by me).
- **ch1.p2** overstates an Anthropic paper (item 1 above).
- **Training compute (ch12.f.compute / chart).** No Anthropic or recent Google point appears. Epoch's CSV has
  no compute estimate for any Claude model after 3.7 Sonnet or for Gemini 3.x. PROPOSED: one clause saying
  Anthropic and Google publish nothing either and Epoch gives no estimate for their current models.
- Prices (ch9.p3, ch12.f.price): all three companies quoted from their own pages with the date; the
  sentence on why closed-model prices are higher names profit and R&D for OpenAI and Anthropic alike. Fine.
- Consciousness (ch12.q5): describes the computation and says a separate literature exists, but cites
  nothing. PROPOSED: cite both sides (e.g. Butlin et al. 2023; Chalmers 2023), after opening them.
- Disclosure sentence in ch12.note is present in both languages.

## 5. English (read in full in the browser at 1280; NOT yet fixed)

- The English reads well; no CJK visible except the toggle.
- `ch8.mem` live sentence: "1 requests of 131,072 tokens each" (plural at the default).
- ch2 live sentence: "only 7.3×10⁻⁶× the input is left" → "7.3×10⁻⁶ of the input".
- ch3 radio label "the small model on this page" starts lower-case; ch9 tile "memory bandwidth" likewise.
- `num.squeeze` "(?!)" never matches; harmless. Setting it to "" would skip the replace (`t()` tests truthiness). Not changed.
- `ch10.say.nosteps`: not examined.
- Sibling essay title "How a Chatbot Writes a Sentence" / 《聊天 AI 是怎么“写”出一句话的》 matches its copy files and is plain text in hero.p1 and ch13.links. Registered titles "Why Compute Waits for Memory" and "How a Pile of Switches Learned to Do Arithmetic" match `pages.config.js`.
- Number formats seen at defaults in English are right (70.55 billion, 856 million, 25.96 million, $77.9 million). Extremes not swept.

## 6. NOT checked (stopped before reaching these)

- The 42 shortened `dg.*` labels against their diagrams; any diagram screenshot in either language.
- Screenshots at 390 and 320 in either language, and at 1280 in English. Only Chinese 1280 was looked at
  (all sixteen models; nothing clipped or overlapping; ch8's generated-string tile breaks mid-word).
- `tests/browser.cjs` not extended: it already repeats layout, targets, CJK and diagram checks in English at
  three widths, but drives the models (live sentences, extremes) in Chinese only.
- `tests/canvas-text-overlap.cjs --sweep` not run.
- Live sentences at control extremes in English; keyboard operation; focus visibility.
- AUTHORSHIP.md reviewer entry not added (the review is incomplete; adding it would overstate).

## Completion pass — 2026-11-18

Reviewer: Claude Code (claude-fable-5-2), a second session that did not write, fact-check, translate or
part-review the page. Brief: `/tmp/agent-tasks/essays/FINISH-REVIEW-COMMON.md`. Scratch and screenshots:
`/tmp/agent-tasks/essays/review2-what-a-frontier-model-takes/`. Nothing in sections 1–6 above was re-verified;
their facts and re-derivations were taken as given. The essay's title was not changed. Mentions of
`how-a-chatbot-writes` stay plain text.

### Fixed (both languages unless marked)

Facts and wording (§3, items 1–9):
1. ch1.p2: Olsson et al. now "causal evidence in small attention-only models, only correlational evidence in larger ones".
2. ch4.p3: "in the language models of every size that they trained, provided more than one layer".
3. ch12.f.law, SB 53: transparency reports for all frontier developers; the framework only for large ones (revenue above $500M); attributed to the FPF explainer, statute not read.
4. ch12.f.law, omnibus: Regulation (EU) 2026/1744, in force 27 July 2026, high-risk dates December 2027 and August 2028, attributed to law-firm summaries. The GPAI sentence now says what is known: no summary read says that part was postponed, none says outright it was not, Official Journal not checked.
5. ch12.f.law (en): "Measures for Labeling of AI-Generated Synthetic Content".
6. ch12.f.clusters: owners as Epoch lists them (Amazon, Oracle, "SpaceXAI"), SpaceX's announcement dated 2 February 2026, Epoch's data date (6 November 2026); sites listed by size.
7. ch6.p3: each price dated (seen 18 November 2026; Together's page says October 2026; Lambda and Silicon Data undated); the $3 default said to be the index rounded and below both on-demand list prices (pinned); "contact sales" sentence made exact. English regained "newer cloud providers and marketplaces".
8. hero.sub: "几千万美元 / tens of millions of dollars"; the test now checks the default bill is between $20M and $100M.
9. ch8.model.how: the model reads 24 positions and writes one more letter after the last, so 19 letters follow a 6-letter prompt.
- Also: ch5.p4 says Besiroglu's "about 70" uses the unrounded parameters, states no budget, and changes with the budget. ch1.limit (en) said "hundreds of thousands" of tokens for 十几万; now "more than a hundred thousand".

ch2, "17×": the model is unchanged (seed 5). `ch2.limit` no longer blames width for one draw. It now says each
readout is a single draw and gives the range over seeds 1–20 at 48 layers, gain 0.8, computed from `depthRun`:
plain stack 1.4×10⁻⁶ to 1.8×10⁻⁴, residual 8.2×10³ to 2.3×10⁵ (the page's draw is the lowest of the twenty),
pre-LN 5.2 to 6.0; 14 of the 20 plain-stack draws fall below the theory value. `tests/models.cjs` derives every
one of these from `models.js` and checks the sentence contains them.

Self-interest (§4):
- ch12.f.bench: first place OpenAI's GPT-6 Astra; places two to four given as indistinguishable, all three named with owner and error bar (Anthropic's Claude Fable 5.1, Google's gemini-3.1-pro-preview, Anthropic's Sonnet 5.5). Pinned from new `FRONTIER.hle` fields, including that the spread is smaller than every error bar.
- ch12.q4: calibration error given as the top-five range, 20% to 51%, with the top entry's 39%.
- ch8.p4: all three cache-hit ratios (Anthropic 1/40, DeepSeek 1/30, OpenAI 1/10), dated; OpenAI's pinned from `FRONTIER.cacheHit`.
- ch11.p4/p5: three labs' 2024 SAE results in the same form: Anthropic (Templeton et al., May), OpenAI (Gao et al., June, 16 million features on GPT-4), Google DeepMind (Gemma Scope, Lieberum et al., August). DeepMind's 2025 step back is now dated March 2025. Opened: arXiv abstracts 2406.04093 and 2408.05147.
- ch12.f.compute: Anthropic and Google publish no training compute either; Epoch has no estimate for Claude after 3.7 Sonnet or for Gemini 3.x, so the chart has no point for them.
- ch12.f.price: owners named for all three models.
- ch12.q5: cites Butlin et al. 2023 and Chalmers 2023 with their conclusions (arXiv abstracts 2308.08708 and 2303.07103 opened). Both lean the same way (current systems probably not conscious, successors possibly); the page reports them as such and does not claim they are opposite sides.

English and copy:
- "1 requests" → `ch8.say.req.one` / `.many`; sentence reworded to "{req} with {T} tokens of context per request".
- Found by the new English drive: "1 GPUs" in ch6 and ch9 live sentences → new `u.gpus.one`.
- ch2.say.vanish: "{plain} of the input", "{plainG} of its size at the top".
- New `model.tiny.label` (capitalised radio label); ch9 bottleneck tile capitalised.
- `ch10.say.nosteps` removed from both copy files; the branch in `app.js` now passes an empty string.
- Not changed: `num.squeeze` in English (harmless, as §5 says).
- copy.zh.js and copy.en.js: 593 keys each, identical key sets.

Layout (every diagram and all sixteen models looked at, 1280/390/320, zh and en: 156 screenshots, read as 42 contact sheets):
- ch1 canvas (en): "Attention heads" ran over the first letters of the string → "Heads".
- ch10 canvas: "Expert →" / "专家 →" cut at the bottom edge → bottom margin 30 → 36.
- ch2 canvas: "Layer →" cut at the bottom edge (found by the canvas sweep, 69 findings) → same margin change.
- ch6 canvas: "This run" crossed by a dashed threshold line at 390/320 → label drawn on a background patch; "California 10²⁶" ran off the right edge at 320 (en) → moved to a second row ending at the edge.
- ch8 generated-string tile broke mid-word at 1280 → smaller monospace; it still wraps at 390 and 320 (19 letters do not fit a half-width tile).
- ch9 diagram: compute label now reads "(4 cards, each at 50% of peak)" so 1,979 is not mistaken for the datasheet's sparse figure.
- The 42 shortened English diagram labels: read against the drawings and the Chinese; none wrong, clipped or overlapping.

Tests:
- `tests/models.cjs`: new pins listed above.
- `tests/browser.cjs`: new English block at 1280 and 320 that sets every range of every model to both ends (singly and all together), every radio and checkbox, and after each reads the live sentence and tiles (no placeholder, no CJK, no plural after 1, nothing clipped, no overflow); keyboard check at 1280 (arrow key moves each of the ranges, focus ring visible, Enter on the toggle). No existing check or tolerance was loosened.

### Test output after the last edit

- `node tests/models.cjs` → `2223/2223 checks passed`
- `tests/browser.cjs` (port 19045) → `browser: all checks passed (zh at 1280/390/320, en at 1280/390/320; every model driven in zh and in en (1280, 320; keyboard); reduced motion)`
- `tests/canvas-text-overlap.cjs --sweep` → `PASS: 2456 canvas states across 1 pages × 1280/390/320 × zh/en (with slider/button sweep) have no colliding or clipped text` (scroll-aware mode in all six runs)
- Server on 19045 stopped.

### Still open or unverified

- EU amendment: whether the GPAI obligations were left undelayed is unconfirmed either way; regulation number and dates rest on law-firm summaries. SB 53 duties rest on the FPF explainer. Not read: Official Journal, SB 53 statute, the executive order's text, the CAC page, Williams 2009.
- Besiroglu's "about 70": the budget is not stated in the paper.
- "Used by Anthropic" (New Carlisle) and "used by OpenAI" (Abilene) were carried over from the page, not re-opened; only the owner column was verified in part 1.
- "Sonnet 5.5" is attributed to Anthropic on the page; the board lists the name without the company.
- Gao, Lieberum, Butlin and Chalmers: abstracts only.
- ch1's text input shows about 20 of the 24 default letters at 390 and 320 until scrolled.
- First-read notes left as design: ch1's live sentence names only the first earlier occurrence while the prose names both; ch11's default view has nothing removed; ch12 is nine dense bullets; ch7 carries two models.
- Sibling links to `how-a-chatbot-writes` are for the registrar. No provenance label yet (needs a commit).

Verdict: ready to register.

# Review: computing/ml/how-a-chatbot-writes (2026-11-18)

Reviewer: Claude Code (claude-opus-5-5), an independent reviewer that did not write the essay. Wound down early on the team lead's instruction (owner out of token budget). Changes are in the working tree only; nothing was committed.

Verdict: **ready after the last few checks listed under "Not checked"**. All of the model, prose and English errors I found are fixed and pinned by tests. Three edits made after the last browser run have not yet been seen in a browser.

## First-read notes (zh at 1280, then en)
1. The English page runs on its own corpus. Several adapted sentences did not match what its models show:
   - ch1.p3 called the first merge "␣t" a pair that "sat next to each other". It also said the sample's longest token "because" showed that tokens are not always words, but "because" is a word.
   - ch2.p3 said "only 1 token reaches that count" (a `{top1ties}` placeholder kept from the Chinese).
   - ch3.p1 called "the cat is sweet" a slip, but that is acceptable English.
2. Nothing in the English page explained "␣".
3. ch6 diagram, English: after "eat", temperature 0.5 plus top-p 0.5 left a single token, so "draw from what remains" had only one token to draw from.
4. Number agreement in English live text: "1 times", "token(s)", "sentence(s)", "only 1 are distinct", "1 tokens left", "wrote 1 tokens", "With only 1 numbers". ch8 also showed a drawn token at "probability 0%".
5. Layout:
   - English ch8 chat diagram: "summarized" was clipped at the SVG edge.
   - ch5 slider label overflowed at 390/320.
   - ch5 token buttons broke words ("bough t", "becau se") at 320.
   - The English ch8 scale table needed sideways scrolling at 320.
   - Merge-tree labels sat on the edge lines in both languages.
   - English loop box text spilled out of its box, and the attention label wrapped a lone "k".

## Errors fixed (both languages where the key is shared)
- ch1.p1 (en): tokens running across words is now attributed to languages without spaces, because the English tokenizer pre-splits at words. This is pinned.
- ch1.p3 (en) is rewritten: first merge = space + "t" (210); "this" is still cut into ␣th + is at merge 273, while "because" is one token; "characters (spaces and punctuation included)".
- ch1.p4 (en): "the last pieces built include whole words".
- ch1.say.rote (en) no longer claims that sentences are memorised, since English merges never cross words.
- dg.bpe.cap (zh+en): the "#15 · 13" example was hard-coded and wrong in English. It is now filled from the first tree's root (en #55 · 19).
- ch2.p3 (en): no tie clause.
- ch3.p1 (en): "although in this corpus only fruit is ever sweet".
- ch3.p3 and ch3.say.mid (en): grammar fixed.
- ch6: `corpus.en.js` sampleContexts now starts with " cat" (24/47/74 %), and the test pins that top-p leaves at least 2 tokens.
- ch6.p4 (zh+en): the Holtzman quote is now "unreliable tail" / 不可靠的尾巴. The abstract reads "the unreliable tail".
- ch9.q3 (zh+en): the memory attribution now says what Claude's help page actually describes: memories saved as topics, plus a RAG search over past chats.
- ch9.links (en): the sequel is plain text, "What It Takes to Build and Run a Frontier Large Language Model". zh keeps the sequel's own title 《造出并运行一个最前沿的大语言模型，需要什么》, which the test checks. **A registrar must turn both into links when what-a-frontier-model-takes registers.**
- Plurals: new singular keys ch2.unit.c1, dg.row.c1, ch3.unit.order1, ch3.unit.sent1, ch6.unit.sent1, ch4.say.good1/poor1, ch8.say.end1/endGreedy1. The zh values equal the plural ones. The `tn()` helper is in app.js.
- English ch6 and ch8 live sentences are rephrased so they read correctly with any count.
- ch8 probabilities under 1 % are shown with one decimal.
- Layout fixes:
  - halo on merge-tree labels, drawn after the edges;
  - chat diagram box narrower (214);
  - shorter en labels: dg.attn.s1, dg.loop.model, ch5.ctl.slope;
  - en ch5 slots in 5/3 columns at ≤640/≤420 px;
  - en scale table uses 175B / 405B / 300B / 15.6T and shorter headers.

## Facts checked against primary sources (opened 2026-11-18)
| Fact | Source |
|---|---|
| Claude Opus 5.5: omit temperature/top_p/top_k; temperature 0 "never guaranteed identical outputs" | platform.claude.com/docs/en/models/opus-5-5/migration-guide |
| OpenAI latest models (GPT-6.2 Astra/Sol): "omit temperature, top_p…" | developers.openai.com/api/docs/guides/latest-model |
| Context window up to 1M tokens; thinking tokens count toward the window and are billed as output | platform.claude.com/docs/en/build-with-claude/context-windows |
| Gemini: "1 million or more tokens" | aistudio.google.com/docs/long-context |
| DeepSeek-V3 671B/37B/14.8T; Kimi K2 1T/32B/15.5T; Qwen3 36T | arXiv 2412.19437, 2507.20534, 2505.09388 (html, Introduction) |
| DeepSeek-R1 in Nature 645:633–638 (2025); RL, verifiable maths and coding tasks | Europe PMC record, DOI 10.1038/s41586-025-09422-z |
| o1: "trained with large-scale reinforcement learning to reason using chain of thought" (Dec 2024) | arXiv 2412.16720 |
| GPT-3: 175B, 96 layers, d_model 12288, 96 heads, 300B tokens, n_ctx 2048 | ar5iv 2005.14165 |
| Llama 3: 126 layers, 15.6T tokens, 128K vocabulary, 128K context | arXiv html 2407.21783 |
| InstructGPT: demonstrations, then rankings, then RLHF | arXiv 2203.02155 |
| Holtzman: "bland and strangely repetitive", "unreliable tail" | arXiv 1904.09751 |
| ALiBi: "penalty that is proportional to their distance" | arXiv 2108.12409 |
| BPE "compression algorithm" segmentation | arXiv 1508.07909 |
| Claude memory saved "as a set of individual topics"; chat search uses RAG | support.claude.com/en/articles/11817273 |

OpenAI Memory FAQ, the memory announcement and the o1 announcement all returned 403, so they were not used.

## Tests (last runs)
- `node tests/models.cjs`: `PASS: 1169 checks` (run after all edits). It now:
  - loads copy.en.js;
  - checks key order parity and that English placeholders are facts;
  - pins every English literal claim;
  - pins the ch6 diagram leaving at least 2 tokens.
- `tests/browser.cjs` drives every model in both languages and checks token-button wrapping. Last run `PASS` (zh and en at 1280/390/320), **before** the slot-column CSS, the scale-table compaction and the "spaces included" edit.
- Canvas sweep: `PASS: 732 canvas states … × zh/en`.
- Diagram screenshots at 1280/390/320 in both languages looked at, before the halo, attn-label and loop-label edits.

## Not checked / left
- No browser run after the last edits: slot columns, scale table, halo labels, the attn and loop labels. Run `tests/browser.cjs` once with SHOT_DIR, and look at ch5 and ch8 at 320 in English.
- ch8 scale table at 320: not re-measured after compaction.
- ch6 diagram: a tie at the top-p cut ("and" kept, "," cut at equal probability, by table order). zh has the same thing. Left as is.
- ch4: the nearest neighbours of "cat"/小猫 include function words and fragments (the, in / 爷, 面). These are model output; there is no prose about them.
- Real touch devices and screen readers.
- Independent re-derivation of the English bigram floor (only ln 192, e^1.51 and the cat temperature values were checked by hand).

## Completion pass (2026-11-18, Claude Code, claude-opus-5-5)

A second reviewer finished the items under "Not checked". It read the whole English page in a browser at 1280 and found no mistranslation, date or number-format problem, or visible Chinese. It looked at screenshots of all nine diagrams at 1280/390/320 in both languages, before and after its fixes, and at ch5 and ch8 in English at 320. Changes are in the working tree only.

Fixed:
- dg.bpe (both languages): the halo did not cover the gaps between characters, so the edge from a merged node up to its parent showed through its own "#n · c" label (e.g. "#45 ·-· 24 times"). The edge now leaves from above the label (app.js).
- dg.attn (en): the mono tokens "because" and "they" touched. A token row with any token wider than its column now staggers onto two lines (app.js); zh is unchanged.
- dg.loop (en): "Compute next-token probabilities" wrapped to three lines and touched its box border. It is now "Next-token probabilities".
- dg.vec (en): "coffee" touched its strip. The strips now start at x = 70 instead of 64.
- ch5 table (en): it needed 74 px of sideways scroll at 320 and 4 px at 390. The headers are now Token / Key / q·k / ÷2 / Dist. / Weight (the feature order is still in the "Query for …" line above the table), and English cells are padded 2 px at ≤ 640 px. Measured: the table is 262 px in a 262 px box at 320, and 332 in 332 at 390.
- ch8 scale table (en): it needed 20 px of scroll at 320. The headers are now "This page’s count table (3 back)" and "This page’s network (d = 8)", and the cells read "3,264 params" and "≤ 128K". It now measures 289 px in a 288 px box, the same 1 px rounding as zh. tests/models.cjs pins ">≤ 128K<" in place of "up to 128K", which is the same fact.
- Already fine when checked: ch5 slot buttons at 320 en (3 columns, no broken words), the chat diagram, and the merge-label halos elsewhere.

Tests after the last edit:
- `node tests/models.cjs`: `PASS: 1169 checks (prose numbers come from the models, for both corpora)`
- `ESSAY_BASE_URL=http://127.0.0.1:19041 SHOT_DIR=… node tests/browser.cjs`: `PASS: browser smoke test (zh and en at 1280/390/320: overflow, clipped text, 48px targets, no CJK in English; toggle, every control of all eight models at its extremes in both languages, training, reduced motion; ≥ 6 diagrams checked)`
- `CANVAS_BASE_URL=http://127.0.0.1:19041 node tests/canvas-text-overlap.cjs --sweep computing/ml/how-a-chatbot-writes/`: `PASS: 732 canvas states across 1 pages × 1280/390/320 × zh/en (with slider/button sweep) have no colliding or clipped text`

Still open:
- ch9.links: the sequel what-a-frontier-model-takes is named in plain text in both languages. A registrar must turn it into a link when the sequel registers.
- The ch6 tie at the top-p cut and the ch4 function-word neighbours, as recorded above.
- Not checked: real touch devices and screen readers; the OpenAI Memory FAQ and o1 announcement (403); an independent re-derivation of the English bigram floor beyond ln 192, e^1.51 and the cat temperature values.

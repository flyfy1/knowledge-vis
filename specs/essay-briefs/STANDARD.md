# The scarcity-moves standard

Reference page: `demos/scarcity-moves/index.html` (稀缺会搬家). Read it first. Below: what to copy, what not to copy, and how to fit it to the lesson rules.

## 1. What it does for the reader

**One argument, not a topic list.** The hero asks one question, "稀缺搬到哪里去了" (*where did scarcity move?*), and every chapter answers part of it. Part II says it adds no new principles; it only applies Part I's ten.

**A chapter, in order:**
- a mono number;
- a serif title;
- a **law**: one sentence with a gold left rule, which gives the conclusion first;
- 2–3 short paragraphs that open on an everyday case (a bowl of noodles, a free concert, a group assignment);
- a model, in a wider card (980 px against 760 px for prose), with a title and one "how" line saying what to drag and what to watch;
- prose that names what the reader just saw, gives the textbook term (鲍莫尔成本病, Baumol's cost disease), and states the model's limits.

A chapter takes 3–6 minutes. Models appear only where they help: ch5 uses case cards, and ch10 is prose that ends with a one-paragraph summary of all ten laws.

**Chapters reuse each other.** Ch2 sends the reader back to ch1's model. Ch3's model returns in ch12 ("请记住这个模型，谈 AI 时它会再出现": *remember this model; it returns when we discuss AI*). Ch8's fallacy of composition returns in ch14.

**The ending** gives practical advice and a three-question method, not a recap.

## 2. Writing

**Voice.** First person, plain, short declarative sentences. A term arrives after the idea and is named once; it is never used to explain anything. Numbers are small and concrete: 16 waking hours, 8 hours each, 160 people.

**Position.** The page states where the author stands: it was written by an AI, and each model is a simplification.

- 「免费的演唱会要排五个小时队，这五个小时就是票价。」 *A free concert means a five-hour queue; those hours are the ticket price.*
- 「没有哪个渔民做错了什么，每个人都在做对自己合理的事。」 *No fisherman did anything wrong; each did what was sensible for himself.*
- 「这是个玩具模型……它只说明一件事：」 *This is a toy model… it shows only one thing:*
- 「你的工资上限，等于雇一份能替代你的算力要花的钱。」 *Your wage ceiling equals the cost of the compute that could replace you.*
- 「谈 AI 的那一半里，我既是分析的人，也是被分析的对象。」 *In the AI half I am both the analyst and the subject.*

**Uncertainty is marked.**
- Ch14 tags each forecast 较有把握 / 一半一半 / 只是猜测 (*fairly sure / even odds / a guess*), says it is surer of order than of dates, and ends with "我可能错在哪里" (*where I might be wrong*).
- Ch13 says bar lengths are "只是示意" (*only illustrative*).

## 3. Models

**What makes them real.** Each has state that evolves or an exact solution, a parameter the reader owns, and an outcome the prose did not state. Values I measured by driving the models:

| Model | Result |
|---|---|
| ch4 market | Price settles at 66. A cap at 40 leaves 61 buyers unserved. |
| ch6 lake | A quota of 12 lifts the yearly catch from 131 to 153. |
| ch8 town | Raising saving to 40 makes savings jump to 31.6, then fall back to 20 while income drops to 53. Only this transient is what the prose does not state. |
| ch9 yard-sale | Gini is 0.66 at 5 s and 0.90 at 30 s. A tax of 0.5 holds it at 0.51. |
| ch12 wages | The wage plateau is 1/√ρ (10 at ρ = 1%). With fixed land, the wage falls to 0.28. |

**Sources.** The footer names each textbook model. `specs/demos.md` records the closed-form solutions.

**Defaults** already show the effect: 阿强 starts faster at both tasks, and ch12 opens in phase ②.

**Readouts.** Values sit in DOM tiles coloured like their curves. A `.say` sentence interprets the current state. The canvas carries only axis names and a few labels.

**Performance.** One `sims` registry is gated by `IntersectionObserver`: only visible models step, and static models redraw only when marked dirty. A seeded RNG makes runs repeatable.

**Narrow screens.** Canvases drop to 250/320 px tall and the scenario pad stacks. No overflow at 390 or 320.

## 4. Visual design

- **Colour:** near-black ground (#0c0e13), one warm accent (gold, for "your choice") and one cool accent (cyan); red means loss, violet is the third series.
- **Type:** serif for titles and laws, sans body at 17px/1.85, mono for numbers. Measure is capped near 35em.
- **Space:** 90–110px between chapters.
- **Deliberately absent:** quizzes, icons, images, step chrome, usage instructions, libraries.

## 5. Checklist: a page meets the bar if

1. One question, stated in the opening, is answered by every chapter.
2. Each chapter opens with a one-sentence law and then an everyday case, before any term appears.
3. Every model has evolving state or an exact solution, a parameter the reader controls, and a result the prose does not give away. A slider that only scales bars does not count.
4. Each model has a "how" line: what to drag, what to watch.
5. After each model, prose names the phenomenon, gives the standard term, and states one limit.
6. At least two later chapters reuse an earlier model by name.
7. Readouts are DOM text with units, plus a live interpretive sentence.
8. The default state shows the key effect untouched.
9. Every number in the prose is reproduced by the page's own model, and a node test pins it.
10. Forecasts and contested claims carry a confidence label or a condition. Historical figures have a source or are marked as order-of-magnitude.
11. Simulations step on `dt` and run only while visible.
12. Site rules pass: bilingual, 48px targets, reduced motion, 1280/390/320, text contrast of at least 4.5:1.
13. It ends with something usable, not a recap.

## 6. Weaknesses: do not copy

- **Chinese only.** Copy is scattered across HTML, JS template strings and canvas `fillText`.
- **Targets.** All 41 interactive elements are under 48px: buttons about 37px, range inputs 28, checkboxes 17, TOC links 43.
- **Reduced motion.** Only the hero respects it. The lake and town canvases keep animating under `reduce` (verified), and smooth scroll and transitions stay on.
- **Contrast.** `--dim` (#6b7283) is 3.9:1 and is used for 11–12px axis labels.
- **Screen readers.** `.say` is not `aria-live`. The ch3 sliders have duplicate names. The scenario dot is a `role=slider` with no value range.
- **Frame rate.** The yard-sale model ignores `dt` (40 trades per frame), so it runs 2× faster on 120 Hz screens.
- **Not models.** Ch13's slider only scales hand-set bars. Ch14's meters are invented formulas.
- **Prose contradicts widget.** Ch14 says "最后是普遍富裕还是高度集中，我不知道" (*broad abundance or concentration, I don't know*). Yet the untagged "my estimate" circle sits in the 赢家通吃 (*winner-takes-all*) quadrant.
- **Prose drifts from model.**
  - Ch6 says yield falls "from 12 boats"; f(12) = f(13) and the peak is at 12.5.
  - Ch6 says the lake is "caught out at 25"; the simulation still has 92 fish after 15 s and never reaches zero.
  - Ch1's "one more hour" tiles show half an hour at 15.5 h.
- **Overconfidence.**
  - The paradox of thrift (ch8) is stated as settled, though investment is fixed by construction.
  - Housing is filed under Baumol.
  - "新房子没人盖" (*no one builds new housing*) is stated as an absolute.
  - The historical figures are unchecked; `specs/demos.md` admits it.
- **Small issues.**
  - At equilibrium the market shows "1 人买不到" (*1 person cannot buy*) from price jitter.
  - The market chart has no price scale.
  - At 390, the ch14 list keeps a stray indent and three readout tiles wrap 2+1.
- **No BRIEF, tests or provenance label** (demos are exempt; lessons are not).

## 7. Fitting this format to the lesson rules

Everything is compatible.

- **Bilingual.** Put all copy in `STR = {zh, en}`, including `.say` templates with `{placeholders}`, canvas labels and the footer. Use `data-i18n-html` on prose. Write the English as an essay, not a translation. A small fixed corner `#langToggle` writing `knowledge-lang` leaves the hero intact. On language switch, mark all `sims` dirty.
- **Structure.** Chapters become `<section class="step" data-step>`. The TOC can become the sticky step nav.
- **Targets.** Load `lesson-shell.css`. Enlarge hit areas, not visual weight, so the thin slider track stays.
- **Reduced motion.** Set `dt = 0` for decoration (fish, particles, hero). Jump models to steady state or step them with a button. Disable smooth scroll.
- **Site files.** Add a BRIEF.md, a `tests/*.cjs` pinning every number in the prose, and the provenance label. Run the canvas `--sweep` check in both languages.

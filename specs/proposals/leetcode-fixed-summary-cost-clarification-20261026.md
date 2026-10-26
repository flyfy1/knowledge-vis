# Small cost-bound example clarification; no localization policy change

**Proposed only, not adopted.** Existing requirements already justify both findings. No rubric, lesson, acceptance, prompt, queue or active policy changes. Current rendered-state contract SHA-256: `816990a6035d174692115767e5332be077ba79d3400bdcfc3f5f2e6f47c0002c`. The live pinned #854 handoff must keep this identity.

## Audit conclusion

**#878: no spec amendment.** The [explainer's localization key/meaning contract](../leetcode-explainers.md#localization-key-and-meaning-binding), [review-gates localization check](../leetcode-review-gates.md), and Python-transfer teaching requirement already require intended rendered meaning, not merely unique keys or two-string pairs. At frozen candidate `6edbe661e03cd4d7a07f979a3f2269d54e5ac4a0`, [archived copy.js](../reviews/878-round1-outcome-20261026/candidate/copy.js) lines45–47 binds map0/1/2 to `n=4 · a=2 · b=3`, `n=1 · a=2 · b=3`, `n=5 · a=4 · b=6`; [archived index.html](../reviews/878-round1-outcome-20261026/candidate/index.html) consumes them as explanatory list items. The [original878-R1 report](../reviews/878-round1-outcome-20261026/878-review-1-e7e2fb2d.md) confirms those rendered labels in both languages instead of code mappings despite passing unique-key/pair checks. This is a semantic-purpose mismatch, not evidence of duplicate keys or unequal translations. The report charges Python transfer and preserves the separate bilingual score. Adding another localization rule would duplicate current guidance.

**#996: existing obligation, useful example gap.** [Rendered-state §9](../leetcode-rendered-state-contract.md#9-check-cost-bounds-at-valid-parameter-boundaries) already requires actual cost/parameter checks and says numerical correctness does not validate cost. Its concrete example emphasizes a parameter becoming zero. The distinct practical case is a summarized size staying **positive and constant**, while the original input scan varies; no zero-boundary test exposes it. Also, n and distinct-count k satisfy1≤k≤n: “independent parameters” should not be read as requiring freely independent values. A small wording/example extension would make the existing check easier to apply, without adding a new gate.

The [original996-R1-COST-01 report](../reviews/996-outcome-20261026/996-review-1-1d9a6502.md) records candidate `f3eec8c23092990d0309b8f227d5e2a2cf233d1d`, unqualified bilingual “Preprocessing takes O(k²)” / “预处理 O(k²)”. Actual [canonical source](../reviews/996-outcome-20261026/round1-solution.py) line7 executes `frequency = Counter(nums)`, followed by sorting k values and building a k×k matrix. With `[2]`, `[2]*6`, `[2]*12`, k=1 but input visits are1,6,12. The bounded source probe reproduced those archived counts using the unchanged callable; [audit evidence and hashes](leetcode-fixed-summary-cost-evidence-20261026/audit.json). The scan establishes the missing O(n) term; three measurements do not prove asymptotics. The lesson's domain is n≤12, and no larger invalid input or timing benchmark is needed.

Scope remains the **preprocessing phase claim**: O(n+k²) includes the O(n) scan and O(k log k) sorting (absorbed by k² for k≥1). The original total O(n·n!+k²) time and O(n+k²) space bounds were already conservative/correct. This was not a numerical algorithm failure. [Round2](../reviews/996-acceptance-20261026/996-review-2-f1f3e97e.md) closed it against `0cd4cc9fd8de9a9e349a8d9c74313cb7c3ec3b38`; no retrospective rescore or new failure is proposed.

## Minimal prospective edit to §9

Replace only its second sentence:

> For a bound with several parameters, respect their valid relationships and check whether one can stay zero or at a positive constant while input processing, output materialization, or base-level work grows.

Add this paragraph after the existing formula-expansion example:

> A summarized input size can also hide work without becoming zero. If n counts input entries and k counts distinct values, `Counter(nums)` still reads n entries when k=1. With all-equal inputs of different valid lengths, an unqualified O(k²) preprocessing claim omits that scan; counting, sorting the distinct values and constructing a k×k matrix together take O(n+k²). Alternatively, limit O(k²) explicitly to the matrix stage and account for counting separately. Check the actual phase named by the claim; a conservative total-program bound does not validate each phase's explanation.

Keep the existing small-case/loop-audit, non-timing-proof, proportionality, baseline/submission/snapshot separation and no-rubric-change paragraphs. No mandatory Counter test, blanket additive n term, benchmark suite or new UI is proposed; the example applies when the actual code performs the scan.

## Adoption boundary

A separate reviewer should assess whether this example is useful or redundant; dispatcher may adopt the two small edits or defer them. Do not edit active specs while the pinned #854 handoff is running. Any adoption belongs at a separately authorized stopped boundary with no active lane using the old shared-policy identity, and must be reflected in the normal policy hash/checkpoint workflow. Existing frozen candidates and historical finding/closure records remain untouched. This proposal alone changes nothing.

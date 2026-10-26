# Codex page attribution: independent design gate

**APPROVE the simplified static implementation, with the boundaries below.** This is necessary to satisfy the user's explicit attribution request. Native details + one scoped CSS file + an auditable JSON allowlist is smaller and more reliable than runtime injection, locale observers or API calls. No browser was opened, no product files were edited and no publication was performed by this reviewer.

## Attribution decision

Use **“Codex 开发 · 改进版本” / “Developed by Codex · Revised version”** consistently for all14 reviewed entries. Atlas is included as a revised version: its earliest creation commit/review does not establish which tool created it, so this gate does not endorse a pure-Codex-origin claim. The manifest/docs should retain that unknown rather than reconstruct a creator from a commit title or author name.

The positive evidence is the parent's explicitly identified Codex-built revision `1d90150cf9c1db194769dff92dc4178ce7779fb0` and its actual lesson changes. A read-only runtime-path check finds15 changed directories in that revision, including atlas and the separately owned frozen-bubble. The present non-worker scope is therefore **atlas +13 revised courses =14 pages**, not15 revised courses:

`atlas, complex-numbers, derivative, freqresp, integral, laplace, lens, linear-functions, pinhole-camera, reflection-refraction, sampling, trig, velocity-vt, ztransform`.

The expanded text should say this version is based on/improves the original page and preserves credit for its original contributions. It should not imply all content was invented by Codex, that an untouched original alternative is currently hosted, or that an original author/tool name is known when it is not.

## Source revision versus running variant

The `1d90150c` destination is a **Source revision / 源码修订** link, not a live old-version switch. Pin the immutable revision (full hash preferred) and the correct repository. A human-readable ID such as codex-20261026 is fine when explicitly associated with that source evidence; do not confuse a version label with proof of sole authorship or final worker contents.

Do not display a Claude Code link or other version entry before an actual independently served static directory exists. A future `variants/claude-code/<slug>/` namespace can preserve the canonical page and link both ways once its content/ownership is verified. No placeholder link, guessed route, automatic alternative generation or overwrite is justified now.

The three worker pages—photosynthesis, frozen-bubble and power-converters—are outside this implementation and await their own actual integrated revisions. Photosynthesis has mixed known history and must not be attributed as purely new Codex work. None may be added to this14-page runtime allowlist merely because a future worker change is planned.

## Static component contract

- Put the normal13 components inside `.head-main` at its end, preserving existing header-flex siblings. Atlas may place it at the header end below its hero. Do not insert a third unwrapped flex child beside title/language controls.
- Use one namespaced component class and scoped CSS; no global summary/details/header overrides. Reuse page colors through existing tokens with safe fallbacks and ordinary inherited type. Give the native summary a48px target, visible3px focus, wrapping text and forced-color readability. Opening details must not cover navigation or force horizontal overflow.
- Render paired language spans under the same native controls, selected by the existing html lang value (including zh-CN). Provide a sensible fallback language. CSS-hidden inactive text should not duplicate the accessible name; do not add a fixed-language aria-label that overrides the visible bilingual summary. Keep a focused source link/control itself stable when language changes.
- No runtime JS, observer, fetch, persistence, animation, progress/mastery inference or new route. The only extra runtime request is the same-origin static stylesheet; “no API/runtime data request” is the precise claim, rather than pretending CSS needs no request.
- The allowlist is **audit metadata**, not fetched dynamically. It should identify path, revised status, developer, source revision/version ID and evidence/exception policy. Keep its entries and the static markup in sync with a bounded check/generator; no broad filename heuristic or default badge on unknown pages.
- Preserve each page's scientific text, model, quiz/state/navigation and existing author notices. The component communicates provenance, not scientific validation, endorsement or a guarantee of content quality.

## Minimum acceptance before worker integration/release

1. All14 allowlisted pages have exactly one component and correct source link; the JSON and static metadata agree. The revised pages have actual evidence in the named revision. Workers remain untouched. No unknown/negative sample page gains a badge or import; no LeetCode edits.
2. Actual EN/ZH at desktop and320px, plus representative actual2x-font/forced-color checks. Cover the normal header and atlas placement, long disclosure/source text,48px summary and3px focus. Verify initial hash navigation/sticky-step headings remain usable after header height changes.
3. Native keyboard Enter/Space open/close; Tab reaches source; focus stays visible; language switching while open retains native open state and the focused control, without duplicate language output. It is fine that a real reload resets this presentation state; do not add persistence to fix it.
4. No application errors, duplicate IDs or changed model/quiz/storage behavior. Dynamic page locale/render routines must not delete or duplicate the static component. Existing local assets/relative links continue to work from their current paths.
5. Source revision link is honestly labeled and immutable; there is no nonexistent live/Claude variant. Negative controls include existing non-Codex/unknown pages, so passing14 positives does not hide incorrect global labeling.

Commit/push is user-authorized for the parent's implementation; deployment remains gated on integration and acceptance of the independently owned workers. This design gate is not that deployment approval or a claim that browser validation has already run.

## Evidence/method limits

Read-only checks confirmed release-git HEAD1d90150c and an initially clean status, inspected runtime-change paths and relevant atlas/header/repository records. No tool identity was inferred from Git metadata alone. The parent narrowed the original plan to14 revised pages, source-revision labels and no runtime JS, and withdrew the unsupported atlas-origin assertion; these are the adopted necessary changes. No remaining design blocker is known under this final proposal. Final implementation and native UI behavior still require the tests above.

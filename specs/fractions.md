# fractions · 修复记录

页面：[`math/arithmetic/fractions/`](../math/arithmetic/fractions/)。这个页面原来没有 BRIEF 或 spec，按 AGENTS.md「每次修复都要同步更新对应的 spec」新建本文件。

- 2026-11-09 canvas 文字修复（Claude Code，self-check）：页面加载 [`canvas-label-guard.js`](../canvas-label-guard.js)（说明见 [canvas-label-guard](canvas-label-guard.md)），重叠的画布标注会错开、文字不伸出画布。修后 `tests/canvas-text-overlap.cjs --sweep` 结果见 specs/reviews/canvas-text-survey-20261109.md。

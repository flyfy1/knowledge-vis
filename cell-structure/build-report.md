# build-report · cell-structure
构建：Codex（gpt-6.1-sol，M5 pipeline clone）写完全部四件套后，会话被模型容量错误中断（未及写报告/提交）；Alberto 收回文件收尾。
验证（Alberto）：node --check app.js/i18n.js 通过；i18n 中英 84/84 对齐；行为（SVG 点选/动植物对照/情境判定）待独立评审实测。
内容：6 步（逐级放大 → 膜与核 → 细胞器巡游 → 动植物找不同 → 情境判定 → 终章）。SVG 剖面图。
待：独立评审后注册（需新增 biology 分类；CONCEPT-MAP 拟 #step2/#step3）。

## Fix pass (independent review pair1)
Probe: `/tmp/csfix/probe.cjs` (stub DOM, runs real `init()` + renders) — 466 PASS / 0 FAIL; `node --check` app.js/i18n.js pass; zh/en keys 95/95, placeholders matched. Headless Chrome screenshots of steps 0–3 checked by eye.
1. Mitochondria outside the cell: `zoomScene(z)` is now a pure function, and organelles sit at fractions of the cell radius. The probe checks every z from 0 to 100: all mitochondria are inside the membrane.
2. Wall inside the membrane: the plant layout (`LAYOUTS.plant`) draws one wall rect, strictly outside the membrane. The spurious inner rect is removed, and so is the black `.dim` rect in the animal view.
3. Cytoplasm blob: the stray path is gone. Cytoplasm is now the fill of the membrane interior, painted under the organelles, and the membrane is stroke-only.
4. Step 2 lighting: it now uses the plant cell, which has chloroplasts. `svgCell` applies `lit`: lit parts get a highlight and a label, and unlit organelles are dimmed. The count total comes from `ORGANELLES.length`. A reset button was added.
5. Step 3 self-test: there are 7 choices, including 4 shared distractors, in the buttons and also as clickable diagram regions (hit areas ≥ 40 px). The pure `diffCheck` returns hit, shared or switch, with feedback for each. Wrong picks earn no credit, and a pick in the animal view prompts you to switch. Found differences are auto-marked and labelled.
6. Animal/plant statement: the shared list is derived from `STRUCTURES` (membrane, cytoplasm, nucleus, mitochondrion). It is followed by a vacuole note (small vacuole if any, versus a large vacuole), and found differences are labelled 大液泡 / Large vacuole.
7. i18n: `data-i18n-aria` is now handled. The four SVG `<title>`s get bilingual keys, and the footer is filled in.
8. zh tagline: 打包 → 储存.
9. Zoom clipping: the scale transform is removed. The cell always fits inside the frame (r ≤ 100 within 206 px of height), and the frame stays inside the viewBox.
Trivial SHOULD-FIX items also done: the zh list separator is now 、; the slider starts at 0 (leaf); the step-2 reset key is wired; the plant vacuole is now central, with the nucleus pushed to the side.

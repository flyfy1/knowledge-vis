# Galaxy independent UI-first cold walk

Decision: **bounded PASS; 0 must-fix findings** in this short actual-browser walk. Desktop 1280×900 and mobile-emulated 390×844 were tested serially against `http://127.0.0.1:18917/atlas/` → `/atlas/galaxy.html`. All launched Chrome instances were closed. No product files, source, specs or previous reports were read or modified before or during this walk; only rendered UI, DOM accessibility/control information and browser behavior were inspected.

## First-view interpretation

The prominent Atlas banner made the 3D alternative discoverable. The Galaxy first view looks like linked, differently colored planets rather than an unrelated decorative backdrop: topic clusters, thin network lines, a visibly selected star and an adjacent real concept description make the metaphor legible. The selected-path view provides brighter emphasis and a concrete numbered relationship path. Default unselected lines are deliberately subtle; inspecting a selected relation gives clearer detail than attempting to read the whole network simultaneously.

I understood proximity as a loose visualization of fewer graph connections plus topic grouping. The visible reading note says this is conceptual similarity rather than a universal metric, and equal planet sizes do not encode importance or physical meaning. The origin prompt explicitly says connections are not required learning steps. I did not interpret depth/proximity as subject difficulty, a mandatory curriculum, or literal physical distance. This is one reviewer's interpretation, not evidence of general learner comprehension.

## Actual tasks and observations

- Entered through the new prominent Atlas 3D link. Codex revised-edition attribution was visible in EN desktop and ZH mobile.
- Desktop pointer drag changed the rendered galaxy; zoom control changed its rendering. Focused canvas accepted ArrowRight and + while keeping keyboard focus.
- Clicked the visible upper-left violet planet: selection became `?node=vectors`, with a real `../eigen/#step1` lesson target (`planet.json`).
- Selected concepts through the native list. Traced Unit circle → Sine & cosine using the native keyboard Enter path. The UI reported `1 connection · shortest undirected path`, numbered the two concepts, and explained `Unit circle → Sine & cosine: defines` (`path.json`). The highlighted path and selected planet are visible in screenshot 02.
- Opened the Eigenvectors real course at `/eigen/#step1`, then browser Back. Galaxy returned with the same selected node and path origin (`?node=eigen&from=eigen`). This tests that concrete round trip, not every course's reading-state contract.
- Switched to low-power list: canvas became hidden; all 38 matching concepts, relationships and the lesson entry remained available. Mode button offered re-enabling 3D.
- Mobile: entered 3D touch mode, performed a real emulated touch drag, and observed changed canvas pixels. The toggle changed from “进入 3D 操作” to “完成 · 恢复页面滚动”; selecting Done restored its entry label. A touch swipe starting in the canvas then scrolled the page from 30px to 287px. The page measured 390px content width at 390px viewport, without horizontal overflow.
- In mobile low-power mode, selected 特征向量 and confirmed its course target remains `../eigen/#step1`. ZH text, attribution and interaction entry were readable in the saved 390px viewport.

No application pageerror was recorded in the main desktop/mobile action walk. Each browser process closed normally.

## Evidence and limits

- `actions.cjs` / `actions.json`: desktop rotation/zoom/keyboard, native selections, actual lesson/Back, low-power and mobile touch exit/scroll.
- `path.cjs` / `path.json`: concrete one-edge relationship task and mobile touch visual change.
- `planet.cjs` / `planet.json`: actual 3D star pick, rather than list-only selection.
- Three screenshots only: `01-atlas-desktop.png` (entry), `02-galaxy-desktop.png` (relationship path), `03-galaxy-mobile.png` (390px ZH 3D entry and scene). All three were visually reviewed.

This was a bounded five-minute UI-first integration review, not an exhaustive scientific graph audit, full accessibility conformance check, real-device GPU/performance test, pinch-gesture coverage, all-course Back matrix, or measured learning outcome. Reduced-motion/WebGL-unavailable auto fallback, real touch hardware, 200% text, complete Tab ordering and assistive technology were not independently covered in this batch. No new scope or product change is requested as a condition of this acceptance.

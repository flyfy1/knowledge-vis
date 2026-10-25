# Reproduce author checks

Run from the repository root. Use an external OUTPUT_DIR to keep the candidate frozen:

```bash
OUTPUT_DIR=/tmp/803-review python3 -B leetcode/803/tests/check.py
OUTPUT_DIR=/tmp/803-review node leetcode/803/tests/browser.cjs
python3 -B scripts/register_leetcode_lesson.py 803 --validate-only
OUTPUT_DIR=/tmp/803-review/selected node leetcode/803/tests/selected-label.cjs
```

Python 3.9+ and Node are needed. The browser runner uses installed Playwright via
NODE_PATH, honors PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, and uses the existing
http://127.0.0.1:18785 preview (override PREVIEW_ROOT if the reviewer already has a
different preview). It never starts a service. acorn parses translation object
keys before evaluation so duplicate keys cannot disappear silently.

check.py executes the actual Solution.hitBricks method against baseline.py, a
forward set-difference/search oracle. It enumerates all binary 1×1, 1×3, 2×2,
2×3 grids with unique ordered hit sequences up to length 3, plus 1,000 seeded
cases. It checks maximum dimensions and hits, a long column, originally floating
bricks, source bytes, and real intermediate DSU root sizes using sys.settrace.
core-check.cjs checks each browser frame against repeated grid relaxation and
the forward oracle results (not against the canonical DSU implementation).

browser.cjs checks the actual served page in Chromium: both locales; every
preset, every restore, rewind/replay, endpoints, reset/end; hand disclosure;
each prediction choice, reveal, change and locale preservation; actual native
clipboard success and four fallback transfers with independently verified fresh
sentinels (Linux Control+C); downloaded/displayed/embedded source exact equality;
keyboard focus; live deep links; blocked storage and file:// offline operation;
local asset/console failures; rendered contrast and CSS byte count.

Widths: 320, 390, 736, 1440. Zoom: CSS zoom=2 at every width, doubling text and
layout in the real browser, not an assertion of testing browser-chrome zoom UI.
Element trace screenshots temporarily hide the sticky navigation to avoid a
full-element screenshot compositor overlay. Full-page and focused viewport
screenshots retain it. At 320/200%, grids intentionally scroll horizontally;
focused arrow-key scrolling and the scrolled view are checked. Captions remain
outside scrolling regions, with table aria-labelledby associations.

All emitted data, JSON, screenshots and downloads honor OUTPUT_DIR. Numeric
helpers emit only stdout. Official provenance is retained input, not refetched
by tests. These are author self-checks; separate review remains pending.

selected-label.cjs covers 803-R1: the closed native control must fit its complete
A–E identity with text/padding and a conservative 24 CSS px Chromium arrow budget.
The full localized name wraps directly below it; both it and the hit description
are associated with the control. Every preset is checked in both locales at
320/390 and CSS zoom 2, including D intermediate/end captures and locale retention.
Read the captures as well as the width predicate: a conservative budget alone
does not prove clipping. repair-r1/red retains the original visible failure;
repair-r1/green retains the repaired selected identities and full descriptions.
browser.cjs also asserts exact formulas and completed-hit/ledger accounting at
initial/intermediate/end and rewind/replay states in both locales.

# Frozen soap bubbles

Integrated lesson for visual.integ.life, registered under Physics & Circuits / Junior High.

From the repository root:

```sh
python3 -m http.server 18775 --bind 127.0.0.1
# http://127.0.0.1:18775/frozen-bubble/
```

The site has no package installation, build, TypeScript or bundler step. It uses the existing zero-dependency static lesson architecture, shared `knowledge-lang`, `lesson-shell.css/js`, homepage filtering and concept deep links.

## Checks

```sh
node --check frozen-bubble/app.js
node --check frozen-bubble/i18n.js
node --check frozen-bubble/model.js
node --check pages.config.js
node frozen-bubble/tests/core.cjs
# Use an existing Playwright installation; the browser runner uses installed Chrome.
NODE_PATH=/path/to/node_modules LESSON_BASE_URL=http://127.0.0.1:18775 \
  LESSON_SCREENSHOTS=/tmp/frozen-bubble-evidence node frozen-bubble/tests/browser.cjs
```

On the checked Mac, the existing module was found at `/Users/songyy/Documents/integ-life/integ-games/node_modules`; it is used only by development checks, never by the page. No dependencies were installed or changed in that project.

`model.js` contains prescribed teaching curves, not a thermal/flow solver. Time is in diagram units. Undercooling recomputes a hypothetical same-time comparison, preserving seeds and time; it does not integrate a cooling history. Step 1 and 2 have independent experiments; the environment comparison shares one clock between its scenes. Reset clears and stops the affected experiment. Language and step navigation preserve state. Reload begins fresh. New seeds are disabled at the final time; seek backward or reset first, so every seed can have a growth interval.

See `BRIEF.md` for source, assumptions and term definitions; `../specs/reviews/frozen-bubble-design.md` for independent design adjudication; and `../specs/reviews/frozen-bubble-verification.md` for verification and limitations.

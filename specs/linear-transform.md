# Linear transform visual spec

## Problem

The existing eigen lesson starts with a matrix's special directions. Learners who do not yet see what a matrix does to the *whole plane* can memorize `Av=λv` without understanding the basis that makes the equation useful. This slice provides the missing geometric foundation.

## Single source of truth

`linear-transform/app.js` owns matrix state, determinant, inverse, vector application, composition, and canvas drawing. `linear-transform/i18n.js` owns all learner-facing text. The four matrix sliders are the only user-editable matrix controls; all sections read the same state.

## Deliberate limitations

The drawings are explanatory geometry, not a high-precision plotting tool. Canvas labels round to two decimals. The lesson does not model affine translation (`Ax+t`), 3D transforms, or floating-point conditioning. `det=0` is checked with an exact zero preset in the UI; arbitrary near-zero matrices are shown with their rounded determinant and are not classified as numerically singular.

## QA evidence to collect

- `node --check linear-transform/app.js` and `node --check linear-transform/i18n.js`.
- Static key/ID check: every `data-i18n` key exists in both locales; every canvas/control ID referenced by `app.js` exists in `index.html`.
- Browser smoke: load `linear-transform/`, move all four sliders, click every preset, toggle inverse, switch composition order, answer quiz, switch language, and verify no console error.

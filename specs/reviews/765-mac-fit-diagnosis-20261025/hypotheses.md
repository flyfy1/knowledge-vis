# Ranked hypotheses before differential tests

2026-10-25. The focused actual Chromium loop has run and exited 1: English
preset 3 at 320px measures 209.43997px against 206px after the original 24px
arrow reserve; all other ten-locale/preset combinations pass. This reproduces
the original assertion in under a second. These hypotheses precede interventions:

1. Actual text/padding budget is too tight: reducing only horizontal padding
   from 15px to 12px will make the unchanged fit assertion pass and show the
   complete label without changing font or meaning. Conversely baseline remains red.
2. The 24px arrow allowance is conservative and creates a numerical false positive:
   a pixel-identical original screenshot will already show the complete final
   character and clear separation from the arrow; an equivalent text-width DOM
   probe will agree with canvas, but actual native paint remains complete.
3. Canvas uses an incorrect font/shorthand: DOM text measurement with copied
   computed text styles will materially disagree with canvas, predicting an
   inaccurate numerical fit result rather than a genuine text budget problem.
4. Locale switching leaves stale rendering: an EN→ZH→EN roundtrip or a fresh EN
   load will change measurements or remove clipping without any style change.

Diagnostic DOM overrides are temporary only; the frozen snapshot remains unchanged.

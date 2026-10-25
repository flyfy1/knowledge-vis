Author test development: first Python run reached the maximum-n k=1 fixture
then failed an exact float-equality assertion for expected 10000. Python floating
multiplication returns a value within floating error, permitted by the statement.
Changed this assertion to math.isclose(abs_tol=1e-7), preserving exact Fraction
oracle checks with tight tolerances. This was a harness correction, not a runtime
repair. The subsequent core test had no generated oracle-fixtures.json because
the preceding test stopped before writing it. Rerun Python successfully first.

First browser layout run: English 320px with CSS zoom 2 yielded native select
width=108px; longest option text=165.488px before padding and arrow. Product fix:
short bilingual option names (Tiny/Ex.1/Ex.2/Drop/Ties/k=1/k=n/n=1), with complete
selected preset description rendered in a wrapping paragraph immediately after
the control. This preserves honest advertised results and visible input values.
Rerun the full browser suite against the new author candidate.

Second browser run passed trace, copy, 16 layouts, keyboard and contrast, then
its final screenshot setup tried to reveal an already revealed selection after
switching locales. Reveal was correctly disabled: locale preserves reveal state.
Harness fix resets the independent exercise before each screenshot setup, leaving
all state-preservation assertions intact. No product code change for this issue.

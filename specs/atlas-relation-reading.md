# Reading an existing relationship: sine → harmonic motion

Contract: WORKFLOW, Atlas/Galaxy and provenance specs remain applicable.
[Independent gate](reviews/atlas-relation-reading-20261026/design-review.md) approved
only the existing `sine:oscillation` representation edge. The initial shorthand
unit-circle→oscillation was wrong: the real graph passes through sine. Do not add
a fabricated edge to accommodate an assumed UI. Counts stay38/48/11.

## Gap / bounded decision

Both surfaces already show reasons and sources. Do not duplicate that system.
The selected representation lacks novice guidance on what the label means and
where to start. P0/high-return slice: one optional canonical edge.reading block,
used under the existing relationship explanation in Atlas and Galaxy. Explain
that a mathematical representation is neither a physical cause/trajectory nor
a mandatory learning order; offer the canonical sine lesson and existing free
projection experiment. P1: sources/state/accessibility verification. Deferred:
all-edge glossaries, new relation types/edges, new lessons/models, user profiles,
or making every foundation relationship an enforced prerequisite.

## Canonical content and scientific limits

Keep original reason and15.1 source. Add own concise explanation and named
[OpenStax15.3 comparison](https://openstax.org/books/university-physics-volume-1/pages/15-3-comparing-simple-harmonic-motion-and-circular-motion).
15.4 is Pendulums, not this comparison. Primary15.3 was read, including projection
and angular-frequency conditions; no textbook figures or prose are copied.

For the ideal free Hookean model, m,k>0, no damping or sustained drive: displacement
is sinusoidal; uniform circular projection is a way of representing it. The spring
mass moves along a line, not around that circle. The restoring force is still
present and the function does not cause the motion. A constant-speed circle does
not imply constant velocity of its projection. Do not generalize this model to
all back-and-forth motion or to driven/resonant examples.

Start is optional: if phase/coordinates are unfamiliar, revisit the existing
`sine` node source; otherwise go directly to the free projection experiment.
No read/unread or mastery claim. Graph category names remain editorial metadata,
not scientific evidence: retain the actual claim, model conditions and sources.

## UI and data contract

`edge.reading` owns bilingual title/meaning/startHint/bounds, a starter node,
existing trail/target node and primary source. Both surfaces derive node labels
and canonical lesson links from the actual graph. Existing outer explanation
disclosure contains this text; no new globally expanded glossary or controller.
Experiment link uses trail=motion/node=oscillation and existing projection view.
Explicit locale hints on the existing Galaxy↔Atlas path are reused; other
lesson URLs remain untouched. Back retains the selected concept, language and
URL context; native explanation folds follow existing surface behavior without
introducing another disclosure-persistence mechanism.

Use existing colors/typography/focus; one unobtrusive text boundary,12px spacing,
body14px/1.65 and links≥48px. Native folds,3px focus,320/200%text/EN-ZH/forcedcolors.
No animation or new clock. In-data assertions validate metadata/real endpoints,
not universal proof of scientific claims.

The current experiment adapter supports only the free `motion` projection and
`#motion-title`; a real but incompatible driven `response` route must fail data
validation, not silently focus the wrong experiment. Extending it requires an
explicit contract rather than accepting any existing trail. Galaxy's legacy
`.relation a` and important paragraph styles can override a less-specific new
class: use scoped selectors and measure computed font/target sizes. Doubled-text
checks must actually override those important rules; a nominal test stylesheet
that loses the cascade does not verify200% text.
Also verify computed block/flex display and separate action rows:48px alone can
pass while a legacy inline rule visually runs two distinct learning links together.

## Acceptance / prevention

- Confirm actual edge ID/type before editing;48IDs/endpoints and38nodes remain
  identical to base39905de2, no prerequisite flag inferred.
- Reject malformed/missing bilingual/source/starter/experiment metadata with
  structured errors; use valid endpoint and real trail node.
- Both edge endpoints and surfaces: existing reason/source remain, new meaning
  and optional starter show correctly; exact course/experiment links work,
  projection math/parameter state unchanged, Back keeps node/locale/context.
- Compare the existing unit-circle/sine projection with block position at
  quarter cycles; bounds are continuous ideal mechanics, no new numerical model.
- Focused mobile/keyboard/locales and affected navigation regressions only;
  no whole-site audit or claims of measured beginner comprehension.

## Separate release boundary

The prepared39905de2 combined10-file package stays byte-for-byte immutable.
This new candidate must have its own source/manifest/release decision, never
silently replace that pending package. No deployment until forwarded approval.
Prior urllib public-manifest HTTP403 is a site response, not tool denial; do not
retry or use an alternate public access method in this batch.

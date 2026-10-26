# Galaxy concept → matching signal-route station

Read WORKFLOW, atlas-galaxy.md, atlas-signal-path.md and visible provenance policy.
[Independent gate](reviews/galaxy-signal-connector-20261026/design-review.md):
reuse one contextual link, no graph/model/controller or new dependency.

## Chosen scope and acceptance first

P0/high-return slice: on the4real signal-route concepts only, keep the existing
direct lesson link and add a distinct “guided experiment route / this concept”
link. Derive membership/station from actual ATLAS.trails.stationTasks, not a
second4-ID list. Destination selects the same concept on trail=signal/view=list
and targets the current question heading. P1: prove browser return/locale/focus.
Deferred: other routes, auto-running audio, parameter transfer, new planets,
learning profiles and a general recommendation system—none needed here.

The linked guide supplies action/observation/source for existing experiments;
this CTA is navigation, not a new physics model or a prerequisite/mastery claim.
Graph data and all original lesson URLs are unchanged.

## State/locale contract

- Native same-tab anchor navigation; do not intercept/preventDefault or add an
  independent return controller. Immediately before leaving, use existing
  replaceState/save to snapshot Galaxy camera and retain node/from/q/group/low.
  Merge foreign history fields. Returning must not reset selection/path/filter/
  low-power choice or start rotation/audio. Restricted history is best effort,
  not a promise of persistence where browser APIs are denied.
- Pass an explicit validated lang=zh/en to the Atlas guide. Both apps consume a
  valid hint on initial entry and popstate; preserve/update explicit hints when
  existing URL state is saved. Galaxy snapshots its current language on leaving;
  a locale toggle is also explicit intent. No new storage. Legacy Atlas URLs
  without lang keep their prior storage/default behavior and are not rewritten
  solely to add a hint. Invalid values are ignored, never injected.
- This ensures Galaxy↔Atlas reading language even if localStorage is denied.
  It does not alter the original lesson URLs or promise language/knob sync for
  every other course. Direct course links remain separate and functional.
- Dynamic #route-task-title arrival must have a visible focused question heading,
  not merely a syntactically valid URL. Reuse Atlas's existing task focus seam.

## Appearance and prevention

Reuse Galaxy panel/ink/muted/accent/line tokens,12px gap/radius and16px padding.
The direct course CTA remains primary; the contextual route link is bordered,
static, wraps fully at320px/200%text and has≥48px target. Existing3px focus,
forced-colors and reduced-motion behavior apply; no decorative animation.

Acceptance: each4concepts reaches its exact real station and retains its direct
coursehref; other concepts/missing signal-route data have no false CTA. Actual
WebGL+low-power list, EN/ZH390/320/desktop, keyboard activation and focused heading,
Back/reload restore node/from/q/group/low/camera/foreignhistory. Test blocked
storage with URL hints and popstate locale as well as ordinary nohint Atlas.
Run affected Galaxy lifecycle/navigation and Atlas continuity regressions; no
new scientific claim requires re-auditing the whole curriculum. Update sourced
edition records; distinguish main push from publication. No public endpoint
retry/alternate-route bypass following the previous urllib HTTP403.

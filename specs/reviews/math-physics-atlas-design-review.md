# Mathematics and physics atlas design review

Date: 2026-10-18. Independent reviewer: math_physics_design_review.
Reviewed before implementation, against website-design/SKILL.md, UI-I18N-SPEC.md,
the current index, and CONCEPT-MAP.md.

Verdict: build `/atlas/` as navigation within the existing product. Reuse static
lessons and section links; no new service or graph framework.

## Adjudication

- Adopt: explicitly scope coverage to waves, systems and measurement, rather than
  imply a complete physics curriculum.
- Adopt: atlas regions are local editorial groups, not global categories or levels.
- Adopt: a readable relation statement and its evidence are the primary reading unit.
- Adopt: stable positions, only selected-node edges, and a full textual alternative.
- Adopt: mobile defaults to the list. Graph overflow stays inside its own region.
- Adopt: filters affect discovery only; when selection falls outside results, show
  a notice and reset action. Relation navigation clears filters explicitly.
- Adopt: selected concept, trail, query, group, and view are URL state; history and
  language changes preserve context.
- Adopt: trails are editorial suggestions, never prerequisite or completion claims.
- Adopt: check scientific conditions against lesson content, not only link existence.
- Adopt: exact tokens, contrast, keyboard focus and bilingual exceptional states.
- Deferred: semantic zoom, additional clusters, AI extraction, 3D, force layout and
  scale work until actual use identifies a need.

No recommendation was overridden. Before coding, the brief must specify relation
semantics and applicable conditions. Before delivery, verify narrow screens,
keyboard, storage denial, invalid URLs, navigation, evidence and public assets.
Real-device usability and improved learning remain unverified by automated checks.

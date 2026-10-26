# S6 eigen cross-link: narrow design review

Verdict: adopt the proposed bilingual copy-only correction after the separate cold UI walkthrough finishes. Zero blockers in the proposed design. No runtime edits or browser were performed in this review.

Actual source checked: complex-numbers/i18n.js s6lkEigen; complex-numbers/index.html links to ../eigen/#step2; eigen/app.js rot preset [[0.55,-0.953],[0.953,0.55]]; eigen/i18n.js button labels in both languages.

The existing blanket claim about rotation matrices is false: a 180-degree planar rotation is -I, has real eigenvalue -1, and every nonzero real vector is an eigenvector. A pure rotation preserves radius, so calling its trajectory a general spiral is also misleading. The selected rotation–scaling preset instead has eigenvalues 0.55 ± 0.953i, discriminant -3.632836, and no real eigendirection; each application scales lengths by approximately 1.100322 and rotates by approximately 60.0097 degrees. These checks are recorded in eigen-link-design-check.json.

Minimum accepted wording: explicitly ask the reader to choose the existing “旋转缩放：复 λ / Rotation–scaling: complex λ” preset, then say “in this example” there is no real eigendirection and the eigenvalues are a non-real conjugate pair. Invite observation of rotation combined with scaling. Do not claim that the link automatically selects this preset: its existing anchor only opens step2. No need to change that URL, the target lesson, or its model for this bounded repair.

Suggested English: “On the eigenvalues page, choose ‘Rotation–scaling: complex λ’. In this example there is no real eigendirection, and the eigenvalues form a non-real complex-conjugate pair. See rotation and scaling combine →”

Suggested Chinese: “去特征值页，选择‘旋转缩放：复 λ’预设：这一例没有实特征方向，特征值是一对非实共轭复数。看看旋转与缩放如何结合 →”

This verifies only the cross-link claim and that concrete preset, not the general eigen lesson or every editable matrix. Keep the current UI frozen until the cold reviewer finishes; record this subsequent copy correction separately so that their original observation is not rewritten.

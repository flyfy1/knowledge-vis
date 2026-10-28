# BRIEF · 2D Linear Maps / 二维线性变换

## Learning contract

- **Audience:** senior-high / early-university learners who can read coordinates and a 2×2 table but have not yet connected a matrix to a geometric map.
- **Question:** How can four numbers determine where every point in a plane goes?
- **Sequence:** (0) drag a matrix and see the basis vectors move with the grid; (1) keep the coefficients of a point while replacing its basis vectors; (2) read signed area from `det A = ad − bc`; (3) distinguish invertible and singular maps; (4) compare composition order and self-check the determinant.
- **Boundary:** real 2D linear maps only. No translation, 3D coordinates, numerical conditioning, or claim that every matrix has real eigenvectors. The final card links to the existing eigen lesson for that next question.

## Interaction contract

- Matrix sliders update all five canvases from the same `{a,b,c,d}` state. Presets cover identity, shear, reflection, positive determinant, negative determinant, and a rank-one `det=0` map.
- Basis step keeps `p=(x,y)` and reports both `p=xe₁+ye₂` and `Ap=xAe₁+yAe₂` using the same matrix state.
- Determinant step draws the unit square and transformed parallelogram. The readout states signed determinant, absolute area scale, and orientation.
- Inverse step reports the exact 2×2 inverse when `det ≠ 0`; singular state explicitly refuses an inverse. Composition step draws `BAp` versus `ABp` with fixed matrices and a fixed probe point.
- Language toggle uses the site `knowledge-lang` convention and refreshes static labels plus dynamic canvas/readout text without changing state.

## Acceptance checks

1. With the default matrix `[[1.2,.35],[-.2,.8]]`, determinant is `1.03` and the unit parallelogram area is `1.03`.
2. The zero preset `[[1,1],[2,2]]` reports `det=0`, singular, and never prints a finite inverse.
3. Changing `a,b,c,d` changes all matrix-dependent canvases; basis coefficients remain the selected `x,y` values.
4. `A → B` and `B → A` produce distinct endpoints for the probe point, proving composition order is visible.
5. Switching zh/en keeps the same matrix and coordinates while translating the readout.

## Sources

- Gilbert Strang, *Introduction to Linear Algebra*, sections on linear transformations and determinants.
- Georgia Tech Interactive Linear Algebra, [Linear Transformations](https://textbooks.math.gatech.edu/ila/linear-transformations.html) and [Determinants](https://textbooks.math.gatech.edu/ila/determinants.html).

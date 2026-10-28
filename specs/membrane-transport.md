# Biology slice: membrane transport

## Target knowledge graph

`concentration gradient -> net diffusion -> membrane permeability -> osmotic pressure -> cell volume`

The page should make the causal chain visible rather than presenting transport modes as a glossary.

## Proposed page

`membrane-transport/`

### Five-step teaching flow

1. **Gradient first** — place solute particles on each side of a membrane; move the concentration slider and show random motion plus the resulting net flux arrow. The headline should distinguish individual random motion from population-level directional transport.
2. **Selective barrier** — toggle membrane permeability for small nonpolar solute, ion, and water. The same gradient should produce different fluxes depending on permeability and channel state.
3. **Facilitated vs active** — toggle a channel and ATP pump. Show facilitated transport down the gradient; show active transport continuing against it while consuming ATP. Keep a small energy ledger: gradient energy versus ATP input.
4. **Osmosis and volume** — switch external solution between hypotonic, isotonic, and hypertonic. Animate water flux and cell volume; keep solute amount and membrane area visible so the learner can connect water movement to concentration difference.
5. **Boundary case** — set equal concentrations, close all channels, or set a very high permeability. Explain that zero net flux can coexist with ongoing microscopic exchange, and that the model ignores membrane damage and active regulation limits.

## Interaction contract

- Primary controls: inside concentration `Ci` (0-100), outside concentration `Co` (0-100), permeability toggles for solute/water, channel toggle, ATP pump toggle, external tonicity preset.
- Derived readouts: gradient `Co-Ci`, net solute flux (signed), net water flux (signed), cell volume (0.6-1.4), ATP/s, and a sentence-level causal explanation.
- Every slider update must update both the visual and the bilingual explanation. Presets must be reversible and keyboard reachable.
- For a fixed gradient, turning permeability off must drive net flux to zero while preserving the gradient; turning the active pump on must permit uphill flux and decrement ATP.

## Visual model

Use a split cell view with a membrane band and particles on both sides. Draw net arrows from concentration difference, a water-only overlay for osmosis, and a compact energy ledger for ATP. Avoid implying that every particle moves in one direction; use short random trails plus a thicker net arrow.

## Bilingual copy anchors

- EN: `Particles still move randomly in both directions; the thicker arrow shows the net movement.`
- ZH: `粒子仍会向两个方向随机运动；较粗的箭头表示净移动。`
- EN: `A gradient is not enough: the membrane must also let that substance cross.`
- ZH: `只有浓度梯度还不够，膜还必须允许这种物质通过。`
- EN: `Active transport can move solute uphill because ATP pays the energy cost.`
- ZH: `主动运输能把溶质逆梯度移动，因为 ATP 支付了能量成本。`
- EN: `Water follows the effective solute gradient, changing cell volume.`
- ZH: `水会跟随有效溶质梯度移动，从而改变细胞体积。`

## Focused tests

1. Node/page import check and no console errors.
2. EN and ZH Playwright smoke at 390px and desktop width.
3. Set `Ci=80`, `Co=20`, solute permeable: net solute flux is negative; then close permeability: flux becomes zero while gradient remains.
4. Toggle ATP pump with `Ci=20`, `Co=80`; uphill flux appears only with pump and ATP ledger decreases.
5. Hypotonic preset increases cell volume; hypertonic preset decreases it; isotonic leaves it near baseline.
6. Keyboard interaction updates derived readouts; no horizontal overflow at 390px.

## Implementation checklist when Mac mini is unlocked

- inspect adjacent lesson page and shared shell conventions
- add page, bilingual strings, route/index entry, BRIEF, review spec, worklog entry
- run focused tests and both locale Playwright smoke
- commit locally; do not push or deploy

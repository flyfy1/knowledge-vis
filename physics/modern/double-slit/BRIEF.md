# BRIEF · double-slit 双缝实验

category `physics`, stage `university`. Built-By: Claude Sonnet 5.5 (via Mini Claude Code, batch r1); template: mean-median-mode skeleton (shared r1 generator); Verified-By: self-probe only, no independent review. Visible identifier: bilingual footer credit (no provenance rule for Claude editions; uncertainty noted).
Dedup: interference covers two-source path difference with a short double-slit mention; quantum-basics covers a single qubit. This page covers fringe spacing, the single-slit envelope, single-particle accumulation, which-path visibility, de Broglie wavelength and the factors that wash fringes out (<35% overlap; step 0 intentionally small).

## Steps
**0 Fringe spacing.** Knows: waves add. Question: what sets the spacing? Inputs λ 400–700 nm, d 0.1–0.6 mm, L 1–3 m; seek Δy = λL/d. Controls: sliders stretch the pattern.
**1 Envelope.** Knows: spacing. Question: why do fringes fade? Inputs a (20–200 µm), d; seek first zero λL/a and visible fringes. Controls: sliders; cyan = single slit.
**2 One at a time.** Knows: intensity curve. Question: do single particles build fringes? Buttons: Fire 1/10/100/1000, Reset; seek share of hits in dark zones (<5% intensity). Holds: seeded sampling from the curve; not a physical simulation of detection.
**3 Which slit.** Knows: fringes. Question: what does path information do? Input D 0–100%; seek V = √(1−D²), V²+D². 
**4 Matter waves.** Knows: wavelength. Question: why can't a baseball interfere? Inputs object, speed factor 10^(±2); seek λ = h/(mv), spacing = λ·1 m/100 nm and 1 µm resolvability.
**5 What decides it.** Knows: all. Question: which factors wipe the fringes? Inputs second slit on/off, D, spread (0–40%); seek V from one fringe period. Links: interference#step0, quantum-basics#step0, photoelectric-effect#step0.

## First-appearance terms
Fringe spacing (0), sinc² envelope (1), probability distribution of hits (2), visibility, distinguishability (3), de Broglie wavelength (4), coherence/spread (5).

## Simulation vs reality
Idealised coherent far-field model; V²+D² = 1 only in the ideal case; electron and molecule speeds are representative; no claims about the nature of measurement.

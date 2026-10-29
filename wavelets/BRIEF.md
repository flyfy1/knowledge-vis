# Wavelets · build brief

- Slug: `wavelets` · category: `signal` · stage: `university` (outline v2 draft entry, "R" pool; no new ids)
- Built-By: Claude Sonnet (claude-sonnet-5-5) via Mini Claude Code, batch b4, first edition. Verified-By: author self-check only (node probe + headless Chrome smoke); no independent review yet.
- Template used (structure only): `cell-structure` (header, step skeleton, language toggle, dark tokens). Provenance: not a Codex edition, so no Codex disclosure; a bilingual footer credit line is shown instead (spec unclear for Claude editions; flagged for the coordinator).
- Dedup: closest pages are `fourier` (frequency components), `convolution`, `sampling`. None teaches time-frequency localisation; overlap well under 80%.

## Steps

### Step 0 · Can a Fourier spectrum tell you when?
- Reader knows: a signal can be split into sine components (fourier page).
- One question: can the magnitude spectrum alone tell "low then high" from "high then low"?
- Inputs / quantity sought: switch time u0; the sought quantity is max|A_k − B_k| between the magnitude spectra of A and its time reversal B, versus the RMS waveform difference.
- Controls / expected: drag the switch time; both waveforms change, cyan bars (A) and orange dots (B) stay coincident; spectral difference prints ≈1e-14, waveform RMS ≈ 0.7+.
- Holds when: real signal, magnitude spectrum, exact index reversal over the whole record (circular DFT).

### Step 1 · The cost of windowing
- Reader knows: the spectrum has no "when" (step 0).
- One question: if we analyse only a window, can we see both when and how many Hz?
- Inputs / quantity: window length L (samples at 256/s); measured frequency FWHM of the 12 Hz ridge at t = 0.25 s; computed σt = L/(6·256) s.
- Controls / expected: slide L; the spectrogram ridge thickens in frequency as L shrinks and blurs in time as L grows; the window bell is drawn to true duration.
- Holds when: Gaussian window with σ = L/6, zero padding outside the record, tones at 12/40 Hz with a 0.2-wide cross-fade.

### Step 2 · The stretching wavelet
- Reader knows: windowing trades time and frequency (step 1).
- One question: how does a wavelet get a narrow window at high frequency and a wide one at low frequency?
- Inputs / quantity: analysis frequency f (4–64 Hz), position τ; sought: envelope σ = ω₀/(2πf) and coefficient magnitude |W(f,τ)| (≈1 for a matched unit sine).
- Controls / expected: changing f fattens/thins the orange wavelet and moves the cyan bump between halves; position slider or Sweep reveals the curve progressively (bright = swept, dashed = not yet); Reset stops the sweep.
- Holds when: Morlet ω₀ = 6, amplitude-normalised by the envelope sum; edges attenuated by zero padding.

### Step 3 · The scalogram
- Reader knows: fixed windows (step 1) and scaled wavelets (step 2).
- One question: given one long low tone and two short high clicks, can both window types show them clearly?
- Inputs / quantity: STFT length L, wavelet ω₀; sought: σt, σf of each window at 8 Hz and 48 Hz.
- Controls / expected: L long → 8 Hz band thin but clicks merge; L short → clicks separate but 8 Hz band smears. Wavelet map keeps both (ω₀ trades them against each other). Each map is normalised to its own maximum.
- Holds when: ideal Gaussian/Morlet windows; the "σt < half the gap" separation hint is a rule of thumb, not a theorem.

### Step 4 · Haar and sparsity
- Reader knows: coefficients of an orthonormal basis (steps 0–3 use Fourier-type bases).
- One question: how many coefficients does a signal with sharp jumps need?
- Inputs / quantity: kept count K and noise sd; sought: RMSE of the Haar and Fourier rebuilds against the noise-free original. Because both bases are orthonormal, squared error equals the dropped coefficient energy.
- Controls / expected: raise K; Haar overtakes Fourier from K ≈ 12 (noise-free) and Fourier shows ringing at the edges; raise noise and the gap shrinks to a tie.
- Holds when: this one hand-built signal (weak sine + two pulses), 128 samples, fixed noise seed; no general winner claimed.

### Step 5 · Finale
- Reader knows: all of the above.
- One question: what does each tool answer?
- Inputs: none (recap cards, model-limits card, three deep links).
- Controls / expected: follow links ../fourier/#step5, ../convolution/#step1, ../sampling/#step3.
- Holds when: the scope notes above are respected.

## New terms (first appearance)
| Term | Step | Plain definition given at the point of use |
|---|---|---|
| Fourier spectrum / magnitude spectrum | 0 | strength of each frequency component; 1 = unit sine over whole record |
| Hz | 0 | vibrations per second |
| spectrogram / STFT | 1 | windowed Fourier analysis drawn as time × frequency × brightness |
| FWHM | 1 | band width above half its peak |
| σt | 1 | std of the Gaussian window, how wide it is in time |
| wavelet / Morlet | 2 | short fading oscillation = Gaussian × cosine |
| wavelet coefficient | 2 | similarity of signal to the wavelet at a position |
| scalogram | 3 | wavelet coefficients of all frequencies as an image |
| σf, ω₀ | 3 | std of the window's frequency spread; cycles inside the envelope |
| RMSE | 4 | root of mean squared difference to the noise-free original |
| Haar basis | 4 | orthonormal basis of local averages and differences |

## Simulation versus reality / model mismatch
Everything is a discrete, noise-seeded teaching calculation at 256 Hz. Real analyses use other window shapes, boundary handling other than zero padding, and other wavelet families. The Haar-versus-Fourier comparison uses one constructed signal. Spectrogram/scalogram brightness is per-map normalised. Nothing here is an instrument measurement. Not yet validated by a human learner walk-through or independent review.

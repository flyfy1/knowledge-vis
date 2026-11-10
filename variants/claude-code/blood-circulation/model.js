'use strict';
// Blood circulation (Claude Code edition) — model. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Every time, volume, speed and saturation on the page is computed here; tests/core.cjs pins the claims.
// Textbook approximations for a resting adult; a teaching model, never a basis for health judgements.
(function (root) {
  const BLOOD_VOLUME = 5000;          // mL of blood in the body
  const REST = { HR: 72, SV: 70 };    // beats per minute, mL per beat
  const O2_PER_L = 200;               // mL of O2 carried by 1 L of blood when 98 % saturated
  const SAT_ART = 0.98;               // arterial oxygen saturation
  const MAX_EXTRACTION = 0.8;         // tissues can take at most ~80 % of the O2 delivered
  const O2_REST = 250;                // mL O2 used per minute at rest

  /* ---------- step 0: the route of one drop ---------- */
  // Ten stretches in order, with the blood volume each holds (mL, sums to BLOOD_VOLUME).
  // A drop spends volume ÷ flow in each stretch, so the time share equals the volume share.
  const SEGMENTS = [
    { id: 'LV', vol: 90, loop: 'heart' },
    { id: 'artery', vol: 650, loop: 'body' },
    { id: 'bodyCap', vol: 350, loop: 'body', exchange: 'body' },
    { id: 'vein', vol: 3250, loop: 'body' },
    { id: 'RA', vol: 60, loop: 'heart' },
    { id: 'RV', vol: 90, loop: 'heart' },
    { id: 'lungArt', vol: 150, loop: 'lung' },
    { id: 'lungCap', vol: 100, loop: 'lung', exchange: 'lung' },
    { id: 'lungVein', vol: 200, loop: 'lung' },
    { id: 'LA', vol: 60, loop: 'heart' },
  ];
  const cardiacOutput = (HR = REST.HR, SV = REST.SV) => HR * SV;                 // mL/min
  const segmentSeconds = (seg, CO = cardiacOutput()) => seg.vol / CO * 60;
  const roundTripSeconds = (CO = cardiacOutput()) => BLOOD_VOLUME / CO * 60;
  function loopSeconds(loop, CO = cardiacOutput()) { return SEGMENTS.filter(s => s.loop === loop).reduce((a, s) => a + segmentSeconds(s, CO), 0); }

  /* ---------- step 4: oxygen delivery (Fick principle) ---------- */
  // delivered = CO × 200 mL/L; extraction = used ÷ delivered, capped at MAX_EXTRACTION.
  function oxygen(use, COL) {
    const delivered = COL * O2_PER_L, need = use / delivered;
    const extraction = Math.min(need, MAX_EXTRACTION);
    return { delivered, use, need, extraction, enough: need <= MAX_EXTRACTION + 1e-12, venousSat: SAT_ART * (1 - extraction),
      shortfall: Math.max(0, use - MAX_EXTRACTION * delivered), minCO: use / (MAX_EXTRACTION * O2_PER_L) };
  }
  const SAT_VEN = oxygen(O2_REST, cardiacOutput() / 1000).venousSat; // resting venous saturation

  // Saturation of the drop at a point of the route (exchange stretches change linearly along their length).
  function saturationAt(index, frac) {
    const seg = SEGMENTS[index];
    if (seg.exchange === 'body') return SAT_ART + (SAT_VEN - SAT_ART) * frac;
    if (seg.exchange === 'lung') return SAT_VEN + (SAT_ART - SAT_VEN) * frac;
    const bodyCap = SEGMENTS.findIndex(s => s.exchange === 'body'), lungCap = SEGMENTS.findIndex(s => s.exchange === 'lung');
    return index > bodyCap && index < lungCap ? SAT_VEN : SAT_ART;
  }

  /* ---------- step 1: one heartbeat ---------- */
  // Phase boundaries as fractions of one beat (atrial contraction first).
  const PHASES = [
    { id: 'atrial', from: 0, to: 0.125, av: true, semi: false },
    { id: 'isoContract', from: 0.125, to: 0.1875, av: false, semi: false },
    { id: 'eject', from: 0.1875, to: 0.5, av: false, semi: true },
    { id: 'isoRelax', from: 0.5, to: 0.5625, av: false, semi: false },
    { id: 'fill', from: 0.5625, to: 1, av: true, semi: false },
  ];
  const EDV = 120, ESV = 50, PRE_KICK = 110; // left-ventricle volumes (mL)
  const phaseAt = p => PHASES.find(ph => p >= ph.from && p < ph.to) || PHASES[PHASES.length - 1];
  const smooth = x => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
  // Left-ventricle volume over the beat: atrial kick 110 → 120, constant, ejection 120 → 50, constant, filling 50 → 110.
  function lvVolume(p) {
    p = ((p % 1) + 1) % 1;
    const ph = phaseAt(p), x = (p - ph.from) / (ph.to - ph.from);
    if (ph.id === 'atrial') return PRE_KICK + (EDV - PRE_KICK) * smooth(x);
    if (ph.id === 'isoContract') return EDV;
    if (ph.id === 'eject') return EDV - (EDV - ESV) * smooth(x);
    if (ph.id === 'isoRelax') return ESV;
    return ESV + (PRE_KICK - ESV) * (1 - Math.exp(-4 * x)) / (1 - Math.exp(-4));
  }
  // How hard the atria / ventricles squeeze (0 relaxed … 1 fully contracted), for the picture.
  function squeeze(p) {
    const ph = phaseAt(p), x = (p - ph.from) / (ph.to - ph.from);
    const atria = ph.id === 'atrial' ? Math.sin(Math.PI * x) : 0;
    const ventricles = (EDV - lvVolume(p)) / (EDV - ESV);
    return { atria, ventricles };
  }
  const strokeVolume = () => EDV - ESV;
  // With a leaky mitral valve a fraction r of each ejection goes back into the left atrium.
  const forwardStroke = (r = 0) => strokeVolume() * (1 - r);

  /* ---------- step 2: pumping per minute ---------- */
  // Cumulative volume pumped after t seconds (each beat adds SV at its start, first beat at t = 0).
  const pumpedBy = (t, HR, SV) => (Math.floor(t * HR / 60 + 1e-9) + 1) * SV;
  // The beat and time at which the pumped total first reaches the whole blood volume.
  function fullVolumeBeat(HR, SV) { const n = Math.ceil(BLOOD_VOLUME / SV - 1e-9); return { beat: n, seconds: (n - 1) * 60 / HR }; }

  /* ---------- step 3: vessels and speed (continuity: v = Q ÷ total cross-section) ---------- */
  const STATIONS = [
    { id: 'aorta', area: 3 },
    { id: 'arteries', area: 20 },
    { id: 'capillaries', area: 2500 },
    { id: 'veins', area: 80 },
    { id: 'cavae', area: 10 },
  ];
  const flowCm3s = COL => COL * 1000 / 60;
  const speed = (station, COL) => flowCm3s(COL) / station.area; // cm/s
  const CAP_LENGTH = 0.1; // cm (1 mm)
  const capillaryTransit = COL => CAP_LENGTH / speed(STATIONS[2], COL); // s

  const api = { BLOOD_VOLUME, REST, O2_PER_L, SAT_ART, MAX_EXTRACTION, O2_REST, SEGMENTS, cardiacOutput, segmentSeconds, roundTripSeconds, loopSeconds,
    oxygen, SAT_VEN, saturationAt, PHASES, EDV, ESV, PRE_KICK, phaseAt, lvVolume, squeeze, strokeVolume, forwardStroke,
    pumpedBy, fullVolumeBeat, STATIONS, flowCm3s, speed, CAP_LENGTH, capillaryTransit };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BLOOD_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);

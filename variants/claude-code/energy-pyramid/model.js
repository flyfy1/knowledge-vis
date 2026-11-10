'use strict';
// Energy pyramid lesson model (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Pure functions shared by the page (window.EP_MODEL) and node tests (module.exports).
// All magnitudes are illustrative round numbers, chosen to be in the right range for a grassland / a farm.
(function (root) {

/* ---------- step 0: where one level's energy goes ---------- */
const PLANT_YEAR = 1000; // kJ of new plant growth on a patch in one year (the starting amount)
// eaten: share of plant growth the herbivores eat; absorbed: share of what they eat that is digested;
// growth: share of what they absorb that becomes new body (the rest is burned in respiration, lost as heat).
function budget(eaten, absorbed, growth, start = PLANT_YEAR) {
  const E = start * eaten, A = E * absorbed, G = A * growth;
  return { start, eaten: E, notEaten: start - E, absorbed: A, feces: E - A, growth: G, respiration: A - G, transfer: G / start };
}

/* ---------- step 1: level after level ---------- */
const PRODUCERS = 10000; // kJ per m² per year stored by plants (illustrative grassland)
const LEVELS = 4;
const levels = (eff, n = LEVELS, p = PRODUCERS) => Array.from({ length: n }, (_, k) => p * Math.pow(eff, k));

/* ---------- step 2: room at the top ---------- */
const NEED = 700000;      // kJ of food a fox-sized animal eats in a year (about 1900 kJ a day)
const FIELD = 105 * 68;   // m², a football pitch for scale
// The animal eats at level `eats` (1 = plants, 2 = herbivores, 3 = carnivores). At most it can take the whole
// yearly production of that level, so this is the smallest possible area.
function territory(eats, eff) { const food = PRODUCERS * Math.pow(eff, eats - 1); return { food, area: NEED / food, perKm2: 1e6 / (NEED / food) }; }

/* ---------- step 3: can a pyramid stand on its head? ---------- */
// Production (g dry mass per m² per year) of each level; biomass on hand = production / turnover per year.
const SEA = { P1: 600, eff: 0.1, zooTurnover: 3 };
function sea(phytoTurnover) {
  const P2 = SEA.P1 * SEA.eff, B1 = SEA.P1 / phytoTurnover, B2 = P2 / SEA.zooTurnover;
  return { P1: SEA.P1, P2, B1, B2, invertedBiomass: B1 < B2, invertedProduction: P2 > SEA.P1 };
}
const flipTurnover = () => SEA.P1 / (SEA.P1 * SEA.eff / SEA.zooTurnover); // turnover above which biomass inverts

/* ---------- step 4: diet and people fed ---------- */
const PERSON = 3.8e6;  // kJ of food per person per year (about 10,400 kJ ≈ 2500 kcal a day)
const CROP = 4e7;      // kJ of edible crop per hectare per year (illustrative)
// meat: share of the person's food energy that comes from animals; conv: animal-food energy out per feed energy in.
function diet(meat, conv) {
  const plantLand = PERSON * (1 - meat) / CROP, animalLand = PERSON * meat / conv / CROP, land = plantLand + animalLand;
  return { plantLand, animalLand, land, perHa: 1 / land };
}

const api = { PLANT_YEAR, budget, PRODUCERS, LEVELS, levels, NEED, FIELD, territory, SEA, sea, flipTurnover, PERSON, CROP, diet };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (root) root.EP_MODEL = api;
})(typeof window !== 'undefined' ? window : null);

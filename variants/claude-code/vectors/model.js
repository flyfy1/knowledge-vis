'use strict';
// Vectors (Claude Code edition) — pure model shared by the page and tests/core.cjs.
// Author: Claude Code (claude-opus-5-5), 2026-11-09. No DOM access here.
(function (root) {

const v = (x, y) => ({ x, y });
const add = (a, b) => v(a.x + b.x, a.y + b.y);
const sub = (a, b) => v(a.x - b.x, a.y - b.y);
const scale = (k, a) => v(k * a.x, k * a.y);
const mag = a => Math.hypot(a.x, a.y);
const dot = (a, b) => a.x * b.x + a.y * b.y;
const cross = (a, b) => a.x * b.y - a.y * b.x;
const DEG = Math.PI / 180;
// direction angle measured counter-clockwise from +x, in [0, 360); null for the zero vector
const dirDeg = a => (mag(a) < 1e-12 ? null : ((Math.atan2(a.y, a.x) / DEG) % 360 + 360) % 360);
const polar = (r, deg) => v(r * Math.cos(deg * DEG), r * Math.sin(deg * DEG));
// angle between two non-zero vectors, 0..180
const between = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (mag(a) * mag(b))))) / DEG;
// signed length of b's shadow on the line of a
const projLen = (b, a) => dot(a, b) / mag(a);
const projVec = (b, a) => scale(dot(a, b) / dot(a, a), a);

/* step 3: c = s·e1 + t·e2 (Cramer's rule); null when e1, e2 are parallel */
function decompose(c, e1, e2) {
  const d = cross(e1, e2);
  if (Math.abs(d) < 1e-12) return null;
  return { s: cross(c, e2) / d, t: cross(e1, c) / d };
}
const BASIS = { e1: v(2, 0), e2: v(1, 2), e2par: v(3, 0) };

/* step 5: flying north through a crosswind */
const FLIGHT = { air: 200, dist: 300 }; // km/h airspeed, km due north
// heading φ in degrees east of north; wind w km/h blowing toward the east
function flight(phi, w) {
  const air = v(FLIGHT.air * Math.sin(phi * DEG), FLIGHT.air * Math.cos(phi * DEG)), wind = v(w, 0), ground = add(air, wind);
  const track = Math.atan2(ground.x, ground.y) / DEG, hours = FLIGHT.dist / ground.y;
  return { air, wind, ground, speed: mag(ground), track, hours, drift: ground.x * hours };
}
const aimHeading = w => -Math.asin(w / FLIGHT.air) / DEG;

const api = { v, add, sub, scale, mag, dot, cross, dirDeg, polar, between, projLen, projVec, decompose, BASIS, FLIGHT, flight, aimHeading, DEG };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.VEC_MODEL = api;
})(typeof window !== 'undefined' ? window : globalThis);

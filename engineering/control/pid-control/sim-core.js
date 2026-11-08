'use strict';

// A small, deterministic second-order plant for the lesson.
// x is the measured output, v its rate, and u the bounded actuator force.
// The plant is intentionally simple: it exposes the P/I/D trade-offs without
// hiding them behind a browser-only animation.
const DT = 0.01;
const DEFAULTS = Object.freeze({
  setpoint: 1,
  Kp: 2.4,
  Ki: 0,
  Kd: 0,
  duration: 12,
  disturbance: false,
  disturbanceAt: 5,
  disturbanceDuration: 0.35,
  disturbanceForce: -1.7,
  actuatorLimit: 20,
  mass: 1,
  damping: 1.25,
  stiffness: 0.8,
  integralLimit: 8,
});

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function simulate(options = {}) {
  const cfg = { ...DEFAULTS, ...options };
  const steps = Math.max(1, Math.round(cfg.duration / DT));
  let x = 0;
  let v = 0;
  let integral = 0;
  let previousError = cfg.setpoint;
  const points = [];
  let maxOutput = 0;
  let maxControl = 0;
  let minOutput = Infinity;
  let overshoot = 0;
  let finalError = 0;
  let signChanges = 0;
  let previousSign = 0;

  for (let step = 0; step <= steps; step += 1) {
    const t = step * DT;
    const error = cfg.setpoint - x;
    integral += error * DT;
    // Anti-windup is kept visible in the explanation: the stored area is
    // bounded before it can make the actuator saturate indefinitely.
    integral = clamp(integral, -cfg.integralLimit, cfg.integralLimit);
    const derivative = step === 0 ? 0 : (error - previousError) / DT;
    const rawControl = cfg.Kp * error + cfg.Ki * integral + cfg.Kd * derivative;
    const control = clamp(rawControl, -cfg.actuatorLimit, cfg.actuatorLimit);
    const disturbance = cfg.disturbance && t >= cfg.disturbanceAt && t < cfg.disturbanceAt + cfg.disturbanceDuration
      ? cfg.disturbanceForce
      : 0;
    const acceleration = (control + disturbance - cfg.damping * v - cfg.stiffness * x) / cfg.mass;

    points.push({ t, setpoint: cfg.setpoint, output: x, error, control, integral, derivative, disturbance });
    maxOutput = Math.max(maxOutput, x);
    minOutput = Math.min(minOutput, x);
    maxControl = Math.max(maxControl, Math.abs(control));
    overshoot = Math.max(overshoot, x - cfg.setpoint);
    const sign = Math.sign(error);
    if (sign && previousSign && sign !== previousSign) signChanges += 1;
    if (sign) previousSign = sign;

    // Semi-implicit Euler: update velocity first, then position.
    v += acceleration * DT;
    x += v * DT;
    previousError = error;
  }

  const tail = points.filter(point => point.t >= cfg.duration - 1.0);
  finalError = Math.abs(mean(tail.map(point => point.error)));
  const tolerance = Math.max(0.02 * Math.abs(cfg.setpoint), 0.02);
  let settlingTime = null;
  for (let i = 0; i < points.length; i += 1) {
    const remainsInside = points.slice(i).every(point => Math.abs(point.error) <= tolerance);
    if (remainsInside) {
      settlingTime = points[i].t;
      break;
    }
  }
  const overshootPercent = Math.max(0, overshoot) / Math.max(Math.abs(cfg.setpoint), 0.001) * 100;
  const stable = maxOutput < Math.abs(cfg.setpoint) * 3.5 + 0.5 && settlingTime !== null;
  return {
    config: cfg,
    points,
    metrics: {
      maxOutput,
      minOutput,
      overshoot: Math.max(0, overshoot),
      overshootPercent,
      finalError,
      settlingTime,
      maxControl,
      signChanges,
      stable,
    },
  };
}

function compare(a, b) {
  return {
    steadyErrorDelta: a.metrics.finalError - b.metrics.finalError,
    overshootDelta: a.metrics.overshootPercent - b.metrics.overshootPercent,
    settlingDelta: (a.metrics.settlingTime ?? Infinity) - (b.metrics.settlingTime ?? Infinity),
  };
}

const CONTROL_MODEL = { DT, DEFAULTS, clamp, simulate, compare };
if (typeof module !== 'undefined' && module.exports) module.exports = CONTROL_MODEL;
if (typeof window !== 'undefined') window.FEEDBACK_CONTROL = CONTROL_MODEL;

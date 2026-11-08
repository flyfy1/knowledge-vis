'use strict';
/* ============================================================
   反馈与控制 — 物理核心（Node 与浏览器共用同一份，零 DOM 依赖）
   模型（页面明示的简化模型）：点质量倒立摆，摆长 L、重力 g，
   基座（轮轴）水平加速度 a 由电机驱动。
     θ'' = (g/L)·sinθ − (a/L)·cosθ      （非线性原式，不用小角度近似）
   坡度 φ：重力方向在小车坐标中偏转 φ，θ 与 a 项都按 (θ−φ) 计。
   积分：半隐式欧拉，固定 dt = 1/480 s，子步数与帧率解耦。
   控制器（离散 PID）：e = θ_target − θ_meas
     u = Kp·e + Ki·∫e dt + Kd·de/dt（导数经一阶低通，τ=12ms）
     a = clamp(−u, ±aMax)   —— e 定义为「目标−当前」，故电机符号取负：
     车往右倾(θ>0)时 e<0、u<0、a=−u>0，正是「往倾倒方向追」。
   积分防饱和：积分状态钳制到 |Ki·I| ≤ aMax。
   延迟：测量走整数步环形缓冲，标注 ms = 步数 × dt × 1000。
   噪声：加在测量上的高斯噪声，mulberry32 定种子 → 同种子同曲线。
   ============================================================ */
const SIM_DT = 1 / 480;
const GRAV = 9.8;
const FALL_RAD = 85 * Math.PI / 180;
const DERIV_TAU = 0.012; // 导数低通时间常数（秒）

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let x = Math.imul(a ^ a >>> 15, 1 | a);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
function makeGauss(rng) {
  let spare = null;
  return function () {
    if (spare !== null) { const v = spare; spare = null; return v; }
    let u = 0, v = 0;
    while (u === 0) u = rng();
    v = rng();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };
}
function clampNum(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

class BalanceSim {
  constructor(opts) {
    opts = opts || {};
    this.L = opts.L !== undefined ? opts.L : 0.5;
    this.Kp = opts.Kp || 0;
    this.Ki = opts.Ki || 0;
    this.Kd = opts.Kd || 0;
    this.aMax = opts.aMax !== undefined ? opts.aMax : 25;
    this.slopeDeg = opts.slopeDeg || 0;
    this.noiseDeg = opts.noiseDeg || 0;
    this.target = opts.target || 0; // 目标角（弧度），全页默认 0
    this.rng = mulberry32(opts.seed !== undefined ? opts.seed : 20261015);
    this.gauss = makeGauss(this.rng);
    this.setDelayMs(opts.delayMs || 0);
    this.reset(opts.theta0 || 0, opts.omega0 || 0);
  }
  setDelayMs(ms) {
    this.delaySteps = Math.round(ms / 1000 / SIM_DT);
    this.delayMsActual = this.delaySteps * SIM_DT * 1000;
    // 环形缓冲重建：全部填当前 θ，切换延迟不引入假跳变
    const th = this.theta !== undefined ? this.theta : 0;
    this.buf = new Float64Array(this.delaySteps + 1).fill(th);
    this.bufHead = 0;
  }
  reset(theta0, omega0) {
    this.theta = theta0 || 0;
    this.omega = omega0 || 0;
    this.t = 0;
    this.integ = 0;
    this.ePrev = null;
    this.deFilt = 0;
    this.a = 0;
    this.u = 0;
    this.meas = this.theta;
    this.fallen = false;
    this.fallTime = null;
    this.xVis = 0; this.vVis = 0;
    if (this.buf) this.buf.fill(this.theta);
  }
  /* 一步：dt 固定 SIM_DT。manualA 给定时绕过 PID 直接用该加速度（手动模式）。 */
  substep(manualA) {
    if (this.fallen) return;
    // 1) 测量：真实 θ 入缓冲，取 delaySteps 步之前的值，再叠噪声
    this.buf[this.bufHead] = this.theta;
    const delayed = this.buf[(this.bufHead - this.delaySteps + this.buf.length) % this.buf.length];
    this.bufHead = (this.bufHead + 1) % this.buf.length;
    let meas = delayed;
    if (this.noiseDeg > 0) meas += this.gauss() * this.noiseDeg * Math.PI / 180;
    this.meas = meas;
    // 2) 控制
    if (manualA !== undefined && manualA !== null) {
      this.a = clampNum(manualA, -this.aMax, this.aMax);
      this.u = -this.a;
    } else {
      const e = this.target - meas;
      this.integ += e * SIM_DT;
      if (this.Ki > 0) {
        const iLim = this.aMax / this.Ki;
        this.integ = clampNum(this.integ, -iLim, iLim);
      } else if (this.Ki === 0) {
        this.integ = 0;
      }
      let de = 0;
      if (this.ePrev !== null) {
        const deRaw = (e - this.ePrev) / SIM_DT;
        this.deFilt += (deRaw - this.deFilt) * (SIM_DT / (DERIV_TAU + SIM_DT));
        de = this.deFilt;
      }
      this.ePrev = e;
      this.u = this.Kp * e + this.Ki * this.integ + this.Kd * de;
      this.a = clampNum(-this.u, -this.aMax, this.aMax);
    }
    // 3) 物理：半隐式欧拉，非线性原式
    const phi = this.slopeDeg * Math.PI / 180;
    const th = this.theta - phi;
    const alpha = (GRAV / this.L) * Math.sin(th) - (this.a / this.L) * Math.cos(th);
    this.omega += alpha * SIM_DT;
    this.theta += this.omega * SIM_DT;
    this.t += SIM_DT;
    // 基座位移仅作画面用：对 a 的阻尼积分（不反馈进 θ 动力学）
    this.vVis += this.a * SIM_DT;
    this.vVis *= Math.exp(-SIM_DT / 0.8);
    this.xVis += this.vVis * SIM_DT;
    if (Math.abs(this.theta) > FALL_RAD) {
      this.fallen = true;
      this.fallTime = this.t;
    }
  }
  /* 跑 seconds 秒（整步数），返回自身便于链式调用 */
  run(seconds, manualFn) {
    const n = Math.round(seconds / SIM_DT);
    for (let i = 0; i < n; i++) {
      this.substep(manualFn ? manualFn(this) : undefined);
      if (this.fallen) break;
    }
    return this;
  }
  kick(dOmega) { if (!this.fallen) this.omega += dOmega; }
}

/* 悬挂摆（秋千）：平衡点在下，α = −(g/L)·sinφ，无控制、不发散 */
class HangingSim {
  constructor(opts) {
    opts = opts || {};
    this.L = opts.L !== undefined ? opts.L : 0.5;
    this.reset(opts.theta0 || 0);
  }
  reset(theta0) {
    this.theta = theta0 || 0;
    this.omega = 0;
    this.t = 0;
  }
  substep() {
    const alpha = -(GRAV / this.L) * Math.sin(this.theta);
    this.omega += alpha * SIM_DT;
    this.theta += this.omega * SIM_DT;
    this.t += SIM_DT;
  }
  run(seconds) {
    const n = Math.round(seconds / SIM_DT);
    for (let i = 0; i < n; i++) this.substep();
    return this;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BalanceSim, HangingSim, SIM_DT, GRAV, FALL_RAD, mulberry32 };
}

# Knowledge Index · 知识索引

**Live site: [visual.integ.life](https://visual.integ.life)**

Hard concepts, turned into interactive pages you can play with — one topic per
page, shallow to deep, one hands-on interaction per step. Play with it until it
clicks.

把难懂的知识点，做成可以上手玩的交互页：每页一个主题，由浅入深，一步一个交互，玩到最后就懂了。

## Pages · 已上线

| Page | What it teaches |
| --- | --- |
| [Fourier Transform · 傅里叶变换](https://visual.integ.life/fourier/) | Any waveform — any drawing — is a sum of rotating circles. Seven steps from a single sine wave to drawing your own shape and watching epicycles redraw it via a real DFT. |
| [Convolution · 卷积](https://visual.integ.life/convolution/) | Blurring a photo, echoing a sound, smoothing data — one machine underneath. Seven steps from sliding averages to meeting the Fourier transform in the frequency domain. |
| [Mandelbrot Set · 分形](https://visual.integ.life/mandelbrot/) | One line of arithmetic, z → z² + c, grows endless complexity. Zoom a hundred billion times, then meet the Julia set hiding behind every point. |
| [Feedback & Control · 反馈与控制](https://visual.integ.life/control/) | Why a two-wheeled balancing bot never falls: be the controller yourself, tune a PID badly then well, then let delay, noise and saturation wreck it. |
| [Sampling & Aliasing · 采样与混叠](https://visual.integ.life/sampling/) | Why wheels spin backwards on video: peeking at the world too lazily invents signals that were never there. The Nyquist line, real sampled audio, and anti-aliasing. |
| [Trigonometric Functions · 三角函数](https://visual.integ.life/trig/) | Sine is a height, cosine a position, tangent a slope — three projections of one turning point on the unit circle. The prequel to the Fourier transform. |
| [Monte Carlo · 蒙特卡洛](https://visual.integ.life/montecarlo/) | Scatter points, count the fraction inside a circle, and π surfaces on its own — plus Buffon's needle, areas with no formula, and why grids die in high dimensions while sampling survives. |
| [Laplace Transform & ROC · 拉普拉斯与 ROC](https://visual.integ.life/laplace/) | Fourier assumes every tone rings forever; Laplace asks whether it is dying or exploding — terrain, poles and convergence regions on the s-plane. |
| [Bayes · 贝叶斯](https://visual.integ.life/bayes/) | A positive test with a 9% true-positive chance — the test didn't lie, the base rate is thin. Priors, likelihood ratios, chained evidence and prior washout. |
| [Central Limit Theorem · 中心极限定理](https://visual.integ.life/clt/) | A single die has nothing bell-shaped about it, yet averages always turn normal — σ/√n verified live, the heavy-tail failure exhibit included. |
| [Z-Transform · Z 变换](https://visual.integ.life/ztransform/) | Rolling the s-plane into the unit circle with z = e^{sT}: poles live inside, sing on the rim, explode outside — the discrete world's Laplace. |
| [Gradient Descent · 梯度下降](https://visual.integ.life/gradient-descent/) | Training is feeling your way downhill blind: the slope is your only information, and the step size decides everything. Momentum, SGD jitter, saddles, and a live-trained model. |

## Run it locally · 本地运行

No build step, no dependencies — plain static files.

```bash
# any static server works, e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk also works.

## Add a page · 新增知识页

1. Create a folder for the topic, e.g. `laplace/`, with its `index.html`
   (plus any `style.css` / `app.js` it needs — vanilla JS + Canvas, no CDN).
2. Register it in [`pages.config.js`](pages.config.js) — one entry with
   `slug`, `title`, `desc`, `tags`, `status` (`live` / `planned`) and `path`.
3. Done — the index page renders its cards from that config.

新增页面只需两步：在配置里加一条记录，把页面放进同名子目录；首页不用改。

## How these pages are made · 制作方式

Each page is built through an iterate-and-review loop: a development agent
builds it, then a *separate* review agent (fresh context, never involved in
building) operates the page, checks the math quantitatively, and scores it
across content accuracy, teaching arc, interaction quality, visuals,
performance and mobile. Pages ship only after repeated rounds drive the
must-fix list to zero. The Fourier page went through 3 rounds: 84 → 88 → 96.

## Tech

Vanilla HTML/CSS/JavaScript, Canvas 2D, zero dependencies, zero build.

## License

[MIT](LICENSE)

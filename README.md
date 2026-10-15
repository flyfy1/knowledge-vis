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

/* Editorial atlas data. Positions indicate regions, not inferred similarity. */
(() => {
  'use strict';
  const b = (zh, en) => ({zh, en});
  const node = (id, group, zh, en, dz, de, formula, source, help) => ({id, group, title:b(zh,en), description:b(dz,de), formula, source,...(help?{help}: {})});
  const edge = (from,to,type,zh,en,rz,re,source,reading) => ({id:`${from}:${to}`,from,to,type,label:b(zh,en),reason:b(rz,re),source,...(reading?{reading}: {})});
  window.ATLAS = {
    groups: [
      {id:'math', label:b('数学基础','Mathematical tools'), mark:'01'},
      {id:'waves', label:b('运动与波动','Motion & waves'), mark:'02'},
      {id:'systems', label:b('系统与响应','Systems & response'), mark:'03'},
      {id:'measurement', label:b('测量与不确定性','Measurement & uncertainty'), mark:'04'},
      {id:'circuits', label:b('电路与能量','Circuits & energy'), mark:'05'}
    ],
    types: {foundation:b('理解工具','Foundation'),representation:b('表示方式','Representation'),application:b('应用','Application'),connection:b('数学联系','Connection')},
    nodes: [
      node('snell','waves','Snell关系与全反射','Snell relation & total internal reflection','两角都从界面法线量起，n=c/v为无量纲折射率。斜光从高n到低n时可能没有实折射角；临界点与严格超临界分开。','Both angles start at the interface normal; n=c/v is dimensionless. Oblique rays from higher to lower index may have no real refraction angle. The critical limiting case is distinct from strictly supercritical incidence.','n₁ sinθ₁ = n₂ sinθ₂','../reflection-refraction/#snell-bridge',{title:b('法线、正弦范围与临界条件','Normal, sine range and critical conditions'),body:b('法线垂直界面。固定均匀、无吸收介质，s=(n₁/n₂)sinθ₁；s>1没有实θ₂。仅n₁>n₂有θc=arcsin(n₂/n₁)：θ₁=θc对应沿界面极限光线，θ₁>θc为全反射。本页只算方向，不算能量比例或传播时间。','The normal is perpendicular to the interface. For fixed homogeneous, non-absorbing media, s=(n₁/n₂)sinθ₁; s>1 gives no real θ₂. Only n₁>n₂ has θc=arcsin(n₂/n₁): equality gives the limiting ray along the interface; θ₁>θc gives total internal reflection. The lesson models direction, not energy fractions or travel time.'),sources:[{href:'https://openstax.org/books/university-physics-volume-3/pages/1-3-refraction',label:b('折射与Snell关系 · OpenStax ↗','Refraction & Snell · OpenStax ↗')},{href:'https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection',label:b('临界角与全反射 · OpenStax ↗','Critical angle & TIR · OpenStax ↗')}]}),
      node('slope','math','直线斜率','Straight-line slope','非竖直直线的斜率是两点竖直坐标差除以水平坐标差，在同一直线上不变。一般单位为Y的单位除以X的单位；几何双轴同用长度单位时无量纲。','A nonvertical line’s slope is vertical-coordinate change divided by horizontal-coordinate change and stays constant along the line. Its units are Y-units per X-unit; for two geometric length axes it is dimensionless.','k = ΔY / ΔX, ΔX ≠ 0','../linear-functions/#step2'),
      node('pinhole-ratio','waves','相似三角形与小孔倒像','Similar triangles & pinhole inversion','在均匀介质的孔心光线模型中，物距u与屏距v均为正，带符号像高差与物高之比为−v/u；负号表示倒像，正尺寸取其绝对值。','In the homogeneous-medium central-ray model, object distance u and screen distance v are positive. Signed image-height difference divided by object height is−v/u: the negative sign marks inversion; positive size uses the absolute value.','h_s/H = −v/u; h = |h_s|','../pinhole-camera/#geometry-bridge',{title:b('符号、单位与光学边界','Symbols, units and optical scope'),body:b('H与h是正的长度(cm)，h_s是按对应端点相减的带符号坐标差(cm)，M=h_s/H无量纲。物体和屏平行，孔心取原点且Y向上；相似三角形来自直线关系。这里没有透镜焦距条件；有限孔径几何模糊和极小孔衍射需分别说明。','H and h are positive lengths(cm); h_s is the signed difference between corresponding image endpoints(cm), and M=h_s/H is dimensionless. Object and screen planes are parallel, the hole is the origin, and Y points upward. Similar triangles follow the straight-line geometry. No lens focal-length condition is used; finite-aperture geometric blur and tiny-aperture diffraction have distinct scopes.'),sources:[{href:'https://openstax.org/books/elementary-algebra-2e/pages/8-7-solve-proportion-and-similar-figure-applications',label:b('相似与比例 · OpenStax ↗','Similarity & proportion · OpenStax ↗')},{href:'https://openstax.org/books/college-physics-2e/pages/25-1-the-ray-aspect-of-light',label:b('射线近似 · OpenStax ↗','Ray approximation · OpenStax ↗')},{href:'https://openstax.org/books/college-physics-2e/pages/27-6-limits-of-resolution-the-rayleigh-criterion',label:b('衍射与分辨率 · OpenStax ↗','Diffraction & resolution · OpenStax ↗')}]}),
      node('work-energy','waves','功与能量变化','Work & energy changes','质点沿实际位移所受的净功等于动能变化。本理想水平弹簧中，弹簧力是唯一做非零功的力，故 Wspring=ΔK=−ΔU。','Net work along a particle’s displacement equals its kinetic-energy change. In this ideal horizontal spring, only the spring does nonzero work, so Wspring=ΔK=−ΔU.','Wnet = ∫ Fnet dx = ΔK','https://openstax.org/books/university-physics-volume-1/pages/7-3-work-energy-theorem',{"title": {"zh": "本模型中的能量与单位", "en": "Energy and units in this model"}, "body": {"zh": "K=½mv² 是动能，U=½kx² 是弹簧弹性势能（平衡处取 U=0），E=K+U。1J=1N·m。本实验限于无阻尼、无持续驱动的理想水平弹簧；回复力仍存在。", "en": "K=½mv² is kinetic energy; U=½kx² is elastic spring energy, with U=0 at equilibrium; E=K+U. One joule is1N·m. This experiment is an ideal horizontal spring with no damping or sustained driving; restoring force remains."}, "sources": [{"href": "https://openstax.org/books/university-physics-volume-1/pages/8-1-potential-energy-of-a-system", "label": {"zh": "OpenStax · 弹簧势能 ↗", "en": "OpenStax · elastic energy ↗"}}]}),

      node('integral','math','定积分与有符号累加','Definite integral & signed accumulation','定积分累加带符号的贡献。在正向时间区间，速度积分是位移，速率积分才是路程；位置差与位置坐标不同。','A definite integral accumulates signed contributions. Over forward time, integrating velocity gives displacement; integrating speed gives distance. Position difference is distinct from a position coordinate.','∫aᵇ v dt = x(b) − x(a)','../integral/#step2'),
      node('derivative','math','导数与瞬时变化率','Derivatives & instantaneous rates','可微函数的导数是瞬时变化率，也是切线斜率。位置对时间的导数是带方向的速度，速度对时间的导数是加速度。','A derivative is an instantaneous rate and tangent slope. For position versus time it gives signed velocity; differentiating velocity gives acceleration.','f′(t) = lim Δf/Δt','../derivative/#step2'),
      node('net-force','waves','净力与牛顿第二定律','Net force & Newton’s second law','在惯性参考系、质量恒定时，合外力等于质量乘加速度。它决定速度如何改变，而不是此刻速度有多大。','In an inertial frame with constant mass, the sum of external forces equals mass times acceleration. It determines how velocity changes, not the current velocity.','ΣF = m a','https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law'),
      node("power","circuits","电压、电流与功率","Voltage, current & power","电压是能量除以电荷，电流是电荷流率；功率是电压与电流的乘积。","Voltage is energy per charge; current is charge flow per time. Power is their product.","P = VI","../power-converters/#step0"),
      node("inductor","circuits","电感与磁场储能","Inductor & magnetic energy","电感两端电压决定电流的变化速度；有限电压不能使电流瞬间跳变。","Voltage across an inductor sets the rate of current change; finite voltage cannot cause an instantaneous current jump.","vL = L di/dt","../power-converters/#step1"),
      node("capacitor","circuits","电容与电场储能","Capacitor & electric energy","流入电容正端的电流改变电压；理想电容在零电流时保持已有电压。","Current into the positive terminal changes voltage; an ideal capacitor holds its voltage at zero current.","iC = C dv/dt","../power-converters/#step2"),
      node("switch-diode","circuits","开关与二极管","Switches & diodes","理想开关选择导通或断开，二极管提供从阳极到阴极的单向路径。","An ideal switch opens or closes a path; a diode provides one-way conduction from anode to cathode.","route current","../power-converters/#step3"),
      node("pwm","circuits","脉宽调制 PWM","Pulse-width modulation","在固定周期内改变开关导通时间。占空比是导通时间占周期的比例。","Vary switch ON time within a fixed period. Duty is the fraction of the period spent ON.","D = ton / T","../power-converters/#step3"),
      node("buck","circuits","Buck 降压电路","Buck converter","电源间歇接入。连续导通 CCM 指电感电流全周期不归零，不是恒定电流。理想周期稳态、直流输入恒定时，周期平均输出电压 ⟨Vout⟩ 为 D 倍输入；瞬时值可有纹波。","CCM means inductor current never reaches zero during a cycle, not that it stays constant. With ideal components, periodic steady state and constant DC input, cycle-average output voltage ⟨Vout⟩ is D times input; instantaneous voltage can ripple.","⟨Vout⟩ = D Vin","../power-converters/#step4"),
      node("boost","circuits","Boost 升压电路","Boost converter","先给电感储能，再让电源与电感共同向输出供能。周期平均电压 ⟨Vout⟩ 的关系采用理想小纹波周期稳态近似，要求恒定直流输入、连续导通 CCM（电感电流全周期不归零）及 0<D<1；瞬时值可有纹波。","Store energy in an inductor, then let source and inductor feed the output. The relation for cycle-average voltage ⟨Vout⟩ uses the ideal small-ripple periodic steady-state approximation with constant DC input, CCM (inductor current never zero) and0<D<1; instantaneous voltage can ripple.","⟨Vout⟩ ≈ Vin / (1−D)","../power-converters/#step5"),
      node('unit-circle','math','单位圆','Unit circle','半径为 1 的圆；圆上点的横、纵坐标分别定义 cos θ 和 sin θ。','A circle of radius one: a point’s horizontal and vertical coordinates define cos θ and sin θ.','(cos θ, sin θ)','../trig/#step1'),
      node('sine','math','正弦与余弦','Sine & cosine','匀速绕圆运动的坐标随时间周期变化。振幅、频率和相位分别决定大小、快慢和起点。','Coordinates of uniform circular motion vary periodically. Amplitude, frequency and phase set the size, rate and starting point.','A sin(2πft + φ)','../trig/#step3',{"title": {"zh": "相位、弧度与每秒周期数", "en": "Phase, radians and cycles per second"}, "body": {"zh": "θ 表示一周期内的进度。弧度是弧长除以半径，一周为 2π rad。f 是每秒周期数（Hz），T 是一周期的秒数，ω=2πf 是每秒变化的弧度数（rad/s），T=1/f。正弦式中的 φ 设定起始相位。", "en": "θ marks progress through a cycle. A radian angle is arc length divided by radius; one turn is2π rad. f counts cycles per second (Hz), T is seconds per cycle, and ω=2πf measures radians per second; T=1/f. In the sine formula, φ sets the starting phase."}, "sources": [{"href": "https://openstax.org/books/algebra-and-trigonometry-2e/pages/7-1-angles", "label": {"zh": "OpenStax · 弧度定义 ↗", "en": "OpenStax · radian definition ↗"}}, {"href": "https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion", "label": {"zh": "OpenStax · 周期与角频率 ↗", "en": "OpenStax · period & angular frequency ↗"}}]}),
      node('complex','math','复数与旋转','Complex rotation','把平面点写成复数后，乘以单位模复数可以表示旋转；实部和虚部给出两个坐标。','Represent a plane point as a complex number. Multiplication by a unit-magnitude complex number rotates it; real and imaginary parts are coordinates.','z = cos θ + i sin θ','../complex-numbers/#step4'),
      node('vectors','math','向量与线性变换','Vectors & linear maps','向量是一组有顺序的数；矩阵把输入向量变为输出向量，并保持加法和数乘。','A vector is an ordered collection of numbers. A matrix maps vectors while preserving addition and scalar multiplication.','v ↦ Av','../eigen/#step1'),
      node('eigen','math','特征向量','Eigenvectors','非零向量经过矩阵变换后仍在原来的直线上，只乘了一个比例 λ。','A nonzero vector that stays on its original line under a matrix transformation, scaled by a factor λ.','Av = λv','../eigen/#step1'),
      node('laplace','math','拉普拉斯变换','Laplace transform','用带有增长或衰减的复指数分析信号；必须同时说明积分在哪些 s 值上收敛。','Analyze signals with growing or decaying complex exponentials. The region of s values where the integral converges is part of the description.','s = σ + iω','../laplace/#step1'),
      node('oscillation','waves','简谐振动','Harmonic motion','理想弹簧振子的回复力与位移成正比、方向相反。在无阻尼、无持续外力驱动时，位移随时间呈正弦变化；回复力仍然存在。','An ideal spring has a restoring force proportional and opposite to displacement. Without damping or driving, its motion is sinusoidal.','m x″ + kx = 0','https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion',{"title": {"zh": "x′ 和 x″ 分别读什么？", "en": "What do x′ and x″ mean?"}, "body": {"zh": "x 是相对平衡位置的坐标（m）。x′=dx/dt 是带方向的速度（m/s）；再对时间求一次导数，x″=d²x/dt² 就是加速度（m/s²）。两个撇号表示求两次导数，不是把 x 平方。", "en": "x is position relative to equilibrium (m). x′=dx/dt is signed velocity (m/s); differentiating once more gives x″=d²x/dt², acceleration (m/s²). Two primes mean two time derivatives, not x squared."}, "sources": [{"href": "https://openstax.org/books/university-physics-volume-1/pages/3-3-average-and-instantaneous-acceleration", "label": {"zh": "OpenStax · 加速度与变化率 ↗", "en": "OpenStax · acceleration as a rate ↗"}}]}),
      node('superposition','waves','波的叠加','Superposition','把多个信号在同一时刻的值相加，得到合成信号；物理系统是否允许这样叠加取决于其线性。','Add signals at the same instant to form a combined signal. Applying this to a physical system requires linear behavior.','y(t) = x₁(t) + x₂(t)','../fourier/#step2'),
      node('fourier','waves','傅里叶分析','Fourier analysis','用不同频率的正弦或复指数分量描述信号。周期信号用级数，有限采样数据可用离散傅里叶变换。','Describe a signal using sinusoidal or complex-exponential components. Periodic signals use a series; finite sampled data can use a discrete Fourier transform.','time ↔ frequency','../fourier/#step5'),
      node('spectrum','waves','频谱','Spectrum','按频率列出信号分量的幅度与相位。幅度图只展示其中一部分，不能单独还原一般信号。','Describe a signal’s component amplitudes and phases by frequency. A magnitude plot alone cannot reconstruct a general signal.','X(f)','../fourier/#step5'),
      node('resonance','waves','共振','Resonance','受周期驱动的系统，响应幅度可能在某个频率附近出现峰值；阻尼会改变峰的高度和位置。','A periodically driven system may respond most strongly near a particular frequency. Damping changes the peak height and location.','drive → response peak','../freqresp/#step5'),
      node('sampling','waves','采样与混叠','Sampling & aliasing','按固定时间间隔记录信号。理想带限信号的采样率需高于最高频率的两倍，才能避免频谱重叠。','Record a signal at fixed intervals. For an ideally band-limited signal, a sampling rate above twice its highest frequency avoids overlapping spectral copies.','fₛ > 2fₘₐₓ','../sampling/#step3'),
      node('lti','systems','线性时不变系统','LTI systems','线性意味着输入加权组合对应输出的同样组合；时不变意味着延迟输入只会延迟输出。','Linearity preserves weighted combinations of inputs. Time invariance means delaying an input only delays its output.','linear + time invariant','../lti/#step3'),
      node('impulse','systems','冲激响应','Impulse response','给离散系统输入一个单位脉冲后得到的输出。对初始静止的线性时不变系统，它足以确定任意输入的响应。','The output produced by a discrete unit impulse. For an initially resting LTI system, it determines the response to any input.','δ[n] → h[n]','../lti/#step2'),
      node('convolution','systems','卷积','Convolution','把一个序列翻转、平移，与另一个序列对应相乘后求和；每个位移产生一个输出值。','Reverse and shift one sequence, multiply it against another, then sum. Each shift produces one output value.','y[n] = Σ x[k]h[n−k]','../convolution/#step2'),
      node('freqresp','systems','频率响应','Frequency response','对稳定 LTI 系统，频率响应描述正弦输入的稳态幅度与相位变化。连续时间（CT）用 H(iω)，ω 单位 rad/s；离散时间（DT）用 H(e^{iΩ})，Ω 单位 rad/样本。','For a stable LTI system, frequency response describes steady-state sinusoidal amplitude and phase changes. Continuous time (CT) uses H(iω), with ω in rad/s; discrete time (DT) uses H(e^{iΩ}), with Ω in rad/sample.','CT: H(iω); DT: H(e^{iΩ})','../freqresp/#step0'),
      node('poles','systems','极点与稳定性','Poles & stability','极点关联响应中的指数模式。连续时间因果有理系统的传递函数极点全在左半平面时，输入输出稳定。','Poles describe exponential response modes. A causal continuous-time rational system is input-output stable when all transfer-function poles lie in the left half-plane.','Re(p) < 0','../laplace/#step4'),
      node('feedback','systems','反馈控制','Feedback control','测量输出，与目标比较，再据此调整输入。反馈效果取决于控制器、系统、延迟及噪声。','Measure an output, compare it with a target, and adjust the input. Results depend on the controller, system, delay and noise.','measure → compare → act','../control/#step2'),
      node('probability','measurement','概率模型','Probability models','用概率描述可能结果及其不确定性；模型中的概率需要与观察证据区分。','Use probabilities to describe possible outcomes and uncertainty. Model probabilities are distinct from observed evidence.','0 ≤ P(A) ≤ 1','../bayes/#step0'),
      node('bayes','measurement','贝叶斯更新','Bayesian updating','先验是观测前的概率，后验是观测后的更新。似然描述给定假设下观测如何出现；本页离散例子中是观测概率。把它与先验结合并归一化，得到依赖观测模型的后验。','A prior is a probability before evidence; a posterior is its update afterward. Likelihood describes evidence under a hypothesis—in this lesson’s discrete examples it is an observation probability. Combine it with the prior and normalize; the result depends on the observation model.','posterior ∝ likelihood × prior','../bayes/#step1'),
      node('variance','measurement','方差','Variance','与均值的偏差平方的期望，用于描述分散程度。其单位是原变量单位的平方。','The expected squared deviation from the mean, measuring spread. Its units are the square of the variable’s units.','Var(X) = E[(X−μ)²]','../clt/#step3'),
      node('gaussian','measurement','正态分布与中心极限定理','Normal distributions & CLT','独立同分布、方差有限且非零时，样本均值经过适当标准化后，随样本量增加趋于标准正态分布。','For iid samples with finite, nonzero variance, the appropriately standardized sample mean approaches a standard normal distribution as sample size grows.','SE(mean) = σ / √n','../clt/#step3'),
      node('montecarlo','measurement','蒙特卡洛估计','Monte Carlo estimation','通过随机样本的平均估计期望或积分。误差大小依赖采样方式、样本量及被估计量的方差。','Estimate expectations or integrals using random-sample averages. Error depends on sampling, sample count and the variance of the quantity estimated.','estimate = sample average','../montecarlo/#step3'),
      node('kalman','measurement','卡尔曼滤波','Kalman filtering','先用动态模型预测状态，再根据测量及其不确定性修正。协方差表示模型估计的不确定性，并不保证真实误差同样小。','Predict a state with a dynamic model, then correct it using measurements and their uncertainty. Covariance describes model uncertainty, not guaranteed real-world error.','predict → correct','../kalman/#step2')
    ],
    edges: [
      edge('unit-circle','snell','application','正弦范围判断折射解','sine range tests refraction solutions','单位圆给出sin的值域；Snell关系要求sinθ₂=(n₁/n₂)sinθ₁，右侧超过1时没有传播折射光线。光学角从法线起，而不是单位圆默认的水平轴。','The unit circle supplies sine’s range. Snell requires sinθ₂=(n₁/n₂)sinθ₁; above1, no propagating refracted ray exists. Optical angles start at the normal, rather than the unit circle’s usual horizontal axis.','../reflection-refraction/#critical-proof'),
      edge('slope','pinhole-ratio','application','用同一直线得到相似比','uses one straight line to obtain the ratio','以孔心为原点，同一条非竖直光线保持斜率；孔两侧三角形相似，坐标反号给出带符号放大率M=−v/u。光线斜率与放大率不是同一个量，这个关系不是透镜焦距公式。','With the hole as origin, a nonvertical ray keeps one slope. Similar triangles on opposite sides reverse the coordinate sign, giving signed magnification M=−v/u. Ray slope and magnification are different quantities; this is not a lens focal-length formula.','../pinhole-camera/#geometry-bridge'),
      edge('integral','inductor','application','把电压面积换成电流改变量','maps voltage area to current change','恒定理想L、被动端口符号下，∫vL dt=L[iL(b)−iL(a)]。有符号伏秒决定电流改变量，不是能量；重复周期净面积为零时电流回到起值，不必为零。暂态区间不要求平衡。','For constant ideal L with passive terminal signs, ∫vL dt=L[iL(b)−iL(a)]. Signed voltseconds determine current change, not energy. Zero net area over a repeating period returns current to its initial value, not necessarily zero. Transient intervals need not balance.','https://wiki.analog.com/university/courses/electronics/buck_converter_basics'),
      edge('integral','work-energy','application','对位移累加力的作用','integrates force over displacement','一维功沿路径积 F dx，单位 N·m=J；a、b 可选时间端点，但积分变量 x 是位移，不是时间。弹簧往返时各段可做正功或负功。','One-dimensional work integrates F dx along the path, in N·m=J. Time bounds a,b choose endpoint positions, but the integration variable x is displacement, not time. Spring work can be positive or negative along different legs.','https://openstax.org/books/university-physics-volume-1/pages/7-1-work'),
      edge('net-force','work-energy','application','把净功联系到动能变化','connects net work with kinetic change','本例重力与支持力都不做功，弹簧力做功即物块净功。换系统或添加阻尼/驱动后，不能把单个力的功直接等同净功，也不能照搬本例机械能守恒。','Here weight and support do zero work, so spring work is the block’s net work. In another system or with damping/driving, one force’s work is not generally net work, and this mechanical-energy conservation statement does not transfer automatically.','https://openstax.org/books/university-physics-volume-1/pages/7-3-work-energy-theorem'),

      edge('integral','oscillation','application','累加往返的位移','accumulates signed travel','本振子往返一周回到同一位置，正负速度贡献抵消，位移为零；路程为4A。交换积分限使有向积分变号，按时间先后的路程仍非负。','One oscillator cycle returns to the same position: opposite velocity contributions cancel, giving zero displacement but distance4A. Reversing limits changes an oriented integral’s sign; chronological path length remains nonnegative.','https://openstax.org/books/calculus-volume-1/pages/5-2-the-definite-integral'),
      edge('derivative','capacitor','application','把电流读成电压变化率','reads current as voltage rate','对恒定理想电容，q=Cv且i=dq/dt，所以i=C·dv/dt；电流流入电压标正的端子。零电流保持已有电压；这不是漏电或电阻充电模型，也不是必修顺序。','For constant ideal capacitance, q=Cv and i=dq/dt give i=C·dv/dt, with current entering the voltage-positive terminal. Zero current preserves existing voltage; this is not leakage or resistive charging, nor a mandatory learning order.','https://openstax.org/books/university-physics-volume-2/pages/9-1-electrical-current'),
      edge('derivative','oscillation','representation','描述运动的变化率','describes motion rates','本振子的可微位置 x(t) 给出 v=dx/dt、a=dv/dt；有方向的速度可以为负，速率是 |v|。微分描述运动，不是产生运动的物理原因。','For this oscillator, v=dx/dt and a=dv/dt. Signed velocity can be negative; speed is |v|. Differentiation describes motion rather than causing it.','../derivative/#step0'),
      edge('oscillation','net-force','application','用净力决定加速度','links net force to acceleration','本水平无摩擦弹簧模型中，竖直重力与支持力抵消，水平合外力为 −kx=ma。不能把单个弹簧力在其他系统中也当作净力。','In this horizontal frictionless spring model, weight and support cancel vertically; horizontal net force is −kx=ma. A single spring force is not generally the net force in other systems.','https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law'),
      edge("power","inductor","foundation","解释储能","explains storage","电压与电流的乘积是流入电感的功率，积分得到磁场储能变化。","Voltage times current is power entering the inductor; integration gives the magnetic-energy change.","../power-converters/#step1"),
      edge("power","capacitor","foundation","解释储能","explains storage","电容吸收或释放的功率等于其电压与电流的乘积。","Power absorbed or released by a capacitor equals its voltage times current.","../power-converters/#step2"),
      edge("inductor","capacitor","connection","互补地记住状态","store complementary states","电感记住电流，电容记住电压；两者在电路中交换储能，但元件定律不同。","Inductors retain current and capacitors retain voltage. Both exchange stored energy, under different component laws.","../power-converters/#step2"),
      edge("inductor","buck","application","保持连续电流","maintains current","开关断开后，电感通过续流二极管继续向输出送电。","When the switch opens, the inductor continues delivering current through the freewheel diode.","../power-converters/#step4"),
      edge("inductor","boost","application","向更高电压供能","feeds a higher voltage","关断时电感电流下降，电感右端电势升高，电源与电感共同供能。","During OFF, current falls and the right inductor terminal rises; source and inductor deliver energy together.","../power-converters/#step5"),
      edge("capacitor","buck","application","补偿电流差","balances current difference","电感电流与负载电流的差流入或流出输出电容。","The difference between inductor and load current charges or discharges the output capacitor.","../power-converters/#step4"),
      edge("capacitor","boost","application","在开关闭合时供电","supplies load during ON","开关闭合时二极管截止，负载由输出电容供电。","During ON the diode blocks, and the output capacitor supplies the load.","../power-converters/#step5"),
      edge("switch-diode","buck","application","建立两条电流路径","establishes two current paths","开关闭合连接输入；开关断开时续流二极管提供回路。","The closed switch connects the input; the freewheel diode provides the OFF loop.","../power-converters/#step4"),
      edge("switch-diode","boost","application","交替储能与放能","alternates storage and release","开关闭合给电感储能，断开时电流经二极管流向输出。","ON stores energy in the inductor; OFF routes current through the diode to the output.","../power-converters/#step5"),
      edge("pwm","buck","application","设定理想电压比例","sets ideal voltage ratio","在连续导通理想稳态，伏秒平衡给出 ⟨Vout⟩ = D Vin。","Ideal steady-state CCM volt-second balance gives ⟨Vout⟩ = D Vin.","../power-converters/#step4"),
      edge("pwm","boost","application","设定理想升压比例","sets ideal boost ratio","在恒定直流输入、理想 CCM 的小纹波周期稳态近似下，平均电压 ⟨Vout⟩ ≈ Vin/(1−D)，0<D<1。","With constant DC input, ideal CCM and the small-ripple periodic steady-state approximation, ⟨Vout⟩ ≈ Vin/(1−D), with0<D<1.","../power-converters/#step5"),
      edge("boost","feedback","application","用测量调节占空比","uses measurements to adjust duty","实际稳压器可测量输出并调节占空比；本课只解释此接口，不模拟控制器。","A real regulator can measure output and adjust duty; this lesson explains the connection without simulating a controller.","../power-converters/#step6"),
      edge('unit-circle','sine','foundation','定义','defines','圆上点的纵、横坐标定义正弦、余弦；匀速转动使这些坐标成为时间函数。','Vertical and horizontal coordinates define sine and cosine; uniform rotation makes them functions of time.','../trig/#step3'),
      edge('unit-circle','complex','representation','用复数表示旋转','represents rotation with complex numbers','单位圆上的点可以写成 cos θ + i sin θ，角度变化对应平面旋转。','A point on the unit circle is cos θ + i sin θ; changing its angle rotates it in the plane.','https://openstax.org/books/algebra-and-trigonometry-2e/pages/10-5-polar-form-of-complex-numbers'),
      edge('sine','oscillation','representation','描述理想运动','describes ideal motion','无阻尼、无持续外力驱动（回复力仍存在）的理想弹簧振子满足 x″ + (k/m)x = 0，其解为正弦和余弦的组合。','An ideal spring without damping or sustained driving, with its restoring force still present, obeys x″ + (k/m)x = 0, whose solutions combine sine and cosine.','https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion',{
  "title": {
    "zh": "这是一种表示方式，不是必修箭头",
    "en": "A representation, not a mandatory learning order"
  },
  "meaning": {
    "zh": "正弦／余弦函数描述理想弹簧的位移怎样变化，并不产生运动。圆周投影是看懂这个函数的辅助图像；弹簧块实际沿直线往返，不沿圆周运动。",
    "en": "Sine and cosine describe how an ideal spring’s position changes; they do not cause the motion. Circular projection helps visualize that function. The spring mass travels along a line, not around the circle."
  },
  "startNode": "sine",
  "startHint": {
    "zh": "如果振幅、频率或相位还陌生，可先看正弦与余弦；已经熟悉就直接试投影实验，不必按箭头重新学一遍。",
    "en": "If amplitude, frequency or phase are unfamiliar, revisit sine and cosine first. If familiar, try the projection experiment directly; the arrow does not require repeating a course."
  },
  "trail": "motion",
  "tryNode": "oscillation",
  "bounds": {
    "zh": "这里限定 m、k 为正的理想线性弹簧，无阻尼、无持续驱动，回复力仍然存在。圆点匀速转动，不代表它的投影匀速往返；其他往返运动不一定符合这套模型。",
    "en": "This comparison uses a positive-mass, positive-stiffness ideal linear spring without damping or sustained driving; its restoring force remains. Constant-speed rotation does not make the projection’s velocity constant. Other oscillations need not fit this model."
  },
  "source": "https://openstax.org/books/university-physics-volume-1/pages/15-3-comparing-simple-harmonic-motion-and-circular-motion"
}),
      edge('sine','fourier','foundation','提供频率分量','provides frequency components','傅里叶分析以不同频率的正弦、余弦或复指数为分量；每个分量有自己的幅度和相位。','Fourier analysis uses sine, cosine or complex-exponential components at different frequencies, with their own amplitudes and phases.','../fourier/#step1'),
      edge('complex','fourier','representation','表示旋转分量','represents rotating components','欧拉公式把正弦和余弦写成复指数的组合，复数傅里叶变换由此统一表示正、负频率分量。','Euler’s formula expresses sine and cosine as combinations of complex exponentials, allowing the complex Fourier transform to represent positive and negative frequencies together.','https://www.dspguide.com/CH31.PDF#page=3'),
      edge('superposition','fourier','foundation','把分量合成信号','combines components into signals','傅里叶级数通过叠加谐波近似周期波形；有限项近似在跳变附近可能出现吉布斯现象。','A Fourier series combines harmonics to approximate a periodic waveform; finite sums may show Gibbs overshoot near jumps.','../fourier/#step4'),
      edge('fourier','spectrum','representation','给出频率表示','produces a frequency representation','变换结果包含各频率分量的信息；查看幅度与相位，才能保留一般信号的完整表示。','The transform records frequency components; both amplitude and phase are needed for a complete representation of a general signal.','../fourier/#step5'),
      edge('fourier','convolution','connection','把卷积变为乘法','turns convolution into multiplication','当相应变换存在时，时域卷积对应频域乘法。本课用有限序列比较直接卷积与频域计算的结果。','When the transforms exist, time-domain convolution corresponds to frequency-domain multiplication. This lesson compares direct convolution with frequency-domain computation on finite sequences.','../convolution/#step6'),
      edge('spectrum','sampling','foundation','解释频谱重叠','explains spectral overlap','均匀采样使频谱按采样率周期重复；重复的谱相互重叠时产生混叠。','Uniform sampling repeats the spectrum at multiples of the sampling rate; overlap between copies produces aliasing.','../sampling/#step4'),
      edge('oscillation','resonance','application','受周期驱动时可能共振','may resonate under periodic driving','给振子施加周期外力，其稳态响应随驱动频率变化；阻尼决定峰值的强弱与位置。','A periodic force produces a frequency-dependent steady-state response; damping affects the peak strength and location.','https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations'),
      edge('resonance','freqresp','representation','表现为响应峰值','appears as a response peak','在线性系统的频率响应幅度图上，共振表现为某段频率附近的峰；并非所有系统都有明显峰值。','In a linear system’s frequency-response magnitude, resonance appears as a peak; not every system has a pronounced one.','../freqresp/#step5'),
      edge('lti','impulse','connection','可由冲激响应刻画','is characterized by its impulse response','对初始静止的 LTI 系统，把输入分解为加权、平移的单位脉冲，就能由 h 重建输出。','For an initially resting LTI system, decompose the input into weighted shifted impulses and reconstruct the output from h.','../lti/#step2'),
      edge('impulse','convolution','application','与输入卷积得到输出','convolves with input to produce output','输出是各个平移冲激响应的加权和，这正是离散卷积 y[n] = Σ x[k]h[n−k]。','The output sums weighted shifted impulse responses: precisely the discrete convolution y[n] = Σ x[k]h[n−k].','../lti/#step2'),
      edge('convolution','freqresp','representation','时域卷积成为频域相乘','time convolution becomes frequency multiplication','对零初态离散LTI系统，y=x*h；当相应变换存在时，Y(e^{iΩ})=X(e^{iΩ})H(e^{iΩ})。h绝对可和可保证稳定频率响应。Ω单位为rad/样本，不能直接当成Hz。','For an initially resting discrete LTI system, y=x*h. When the transforms exist, Y(e^{iΩ})=X(e^{iΩ})H(e^{iΩ}); absolute summability of h ensures a stable frequency response. Ω is rad/sample, not directly Hz.',"https://ocw.mit.edu/courses/res-6-007-signals-and-systems-spring-2011/9434f9bde960fd3b2b81de3ad442f902_MITRES_6_007S11_lec11.pdf#page=5"),
      edge('impulse','freqresp','representation','傅里叶变换给出频率响应','Fourier-transforms into frequency response','离散 h[n] 的离散时间傅里叶变换是 H(e^{iΩ})，Ω 单位 rad/样本；连续 h(t) 的傅里叶积分是 H(iω)，ω 单位 rad/s。变换需存在；稳定系统的绝对可和/可积是相应充分条件。不能把 δ[n] 与连续冲激直接混用。','The DTFT of discrete h[n] is H(e^{iΩ}), with Ω in rad/sample; the Fourier integral of continuous h(t) is H(iω), with ω in rad/s. The transform must exist; absolute summability/integrability supplies the respective stable-system condition. A discrete unit impulse is not a continuous Dirac impulse.','https://dspguide.com/ch9/2.htm'),
      edge('lti','superposition','connection','满足叠加性','obeys superposition','线性保证输入的加权组合产生相同权重的输出组合；时不变是另一项独立条件。','Linearity preserves weighted combinations of input-output pairs; time invariance is a separate condition.','../lti/#step3'),
      edge('laplace','fourier','connection','在收敛条件下限制到虚轴','restricts to the imaginary axis when convergent','当拉普拉斯变换的收敛域包含虚轴时，在 s = iω 处取值可得到傅里叶变换。','If the Laplace region of convergence contains the imaginary axis, evaluating at s = iω gives the Fourier transform.','../laplace/#step2'),
      edge('laplace','poles','representation','揭示指数模式','reveals exponential modes','对本课中的有理变换，极点的实部关联增长或衰减，虚部关联振荡；还要结合因果性和收敛域判断稳定性。','For the rational transforms in this lesson, pole real parts describe growth or decay and imaginary parts describe oscillation; stability also depends on causality and convergence.','../laplace/#step4'),
      edge('poles','freqresp','connection','影响频率响应形状','shapes the frequency response','当冲激响应的拉普拉斯收敛域包含虚轴时，H(iω) 给出频率响应。极点靠近虚轴可能形成尖峰，零点也会影响结果。','When the Laplace region of convergence of the impulse response contains the imaginary axis, H(iω) gives frequency response. Nearby poles may produce sharp peaks; zeros also matter.','https://www.dspguide.com/CH32.PDF#page=18'),
      edge('vectors','eigen','foundation','定义特征方向','defines eigen-directions','在矩阵变换下寻找只被缩放的非零向量，就得到 Av = λv 的特征向量问题。','Finding nonzero vectors that are only scaled by a matrix leads to the eigenvector equation Av = λv.','../eigen/#step1'),
      edge('eigen','variance','application','找出协方差主方向','finds principal covariance directions','对协方差矩阵，特征向量给出互相正交的主方向，特征值给出沿这些方向的方差。','For a covariance matrix, an orthonormal eigenbasis gives principal directions, and eigenvalues give variances along them.','../eigen/#step5'),
      edge('probability','bayes','foundation','为证据更新提供模型','provides a model for evidence updates','先验和似然都来自概率模型；贝叶斯公式将它们结合成给定观测后的条件概率。','The prior and likelihood come from a probability model; Bayes’ rule combines them into a probability conditional on observations.','../bayes/#step1'),
      edge('bayes','kalman','application','在线性高斯条件下形成状态更新','gives state updates under linear Gaussian assumptions','在线性动态与观测模型、适当高斯先验和独立高斯噪声条件下，卡尔曼更新可用均值与协方差表示贝叶斯更新。','With linear dynamics and measurements, an appropriate Gaussian prior and independent Gaussian noises, Kalman updates express Bayesian updating using means and covariances.','../kalman/#step6'),
      edge('variance','kalman','application','参与测量权重计算','helps determine measurement weights','预测不确定性与测量噪声共同决定增益；模型给出的不确定性必须与真实估计误差区分。','Predicted uncertainty and measurement noise jointly determine the gain; model uncertainty must be distinguished from actual estimation error.','../kalman/#step2'),
      edge('kalman','feedback','application','提供用于控制的状态估计','supplies state estimates for control','无法直接观测的状态可先估计，再交给控制器；估计质量和模型误差会影响控制效果。','Estimate states that cannot be measured directly, then pass them to a controller; estimation quality and model mismatch affect control.','../kalman/#step6'),
      edge('variance','gaussian','foundation','决定均值的标准误差','sets the standard error of a mean','独立同分布的单个观测总体方差为 σ² 时，n 个样本的均值方差为 σ²/n；正态近似还需要适用的极限定理条件。','For iid observations each having population variance σ², the mean of n samples has variance σ²/n; a normal approximation additionally needs appropriate limit-theorem conditions.','../clt/#step3'),
      edge('probability','montecarlo','application','用随机采样估计期望','estimates expectations by random sampling','按指定概率模型采样，用样本平均估计期望；积分也可改写成相应的期望。','Sample from a specified probability model and average to estimate an expectation; integrals can also be written as expectations.','../montecarlo/#step3'),
      edge('variance','montecarlo','connection','决定估计误差尺度','sets the estimation error scale','独立同分布且方差有限时，样本平均的标准误差按 1/√n 缩小；这是误差尺度，不是每次运行的保证。','For iid samples with finite variance, the sample mean’s standard error scales as 1/√n; this is an error scale, not a guarantee for each run.','../montecarlo/#step2'),
      edge('convolution','gaussian','connection','描述独立变量相加的分布','describes distributions of independent sums','独立随机变量之和的分布由卷积给出；反复相加后的正态近似需满足中心极限定理的条件。','Convolution gives the distribution of a sum of independent random variables; a normal approximation after repeated sums requires central-limit conditions.','../clt/#step5')
    ],
    trails: [
{
  "id": "uncertainty",
  "background": [
    "variance",
    "montecarlo"
  ],
  "title": {
    "zh": "样本四倍，每次误差都减半吗？",
    "en": "Four times the samples: does every error halve?"
  },
  "nodes": [
    "variance",
    "montecarlo"
  ],
  "stationTasks": [
    {
      "node": "variance",
      "question": {
        "zh": "原始数据的分散，和平均值的分散一样吗？",
        "en": "Is data spread the same as the spread of its mean?"
      },
      "action": {
        "zh": "打开CLT第3步，保留均匀U(0,1)，按“一次跑完”。比较样本量n与4n的均值标准差。",
        "en": "Open CLT step3,keep uniformU(0,1),then Run all. Compare the standard deviation of means at n and4n."
      },
      "observe": {
        "zh": "理论上单个观测方差为σ²，n个独立观测的均值方差为σ²/n，标准误差为σ/√n。实测拟合和标准差比有波动，不必恰等−0.5或0.5。",
        "en": "One observation has population varianceσ²; the mean of n independent observations has varianceσ²/n and SEσ/√n. Empirical fitted slopes/SD ratios fluctuate; they need not be exactly−0.5 or0.5."
      },
      "bridge": {
        "zh": "下一站换成圆内0/1命中和πHat=4×命中率。N是每次估计的点数，20是重复次数；不传递这页的分布或参数。",
        "en": "Next switch to inside/outside0/1 hits and πHat=4×hit rate. N is points per estimate;20 is replications. This page’s distribution/parameters are not transferred."
      },
      "href": "../clt/#step3",
      "evidenceEdge": "variance:montecarlo",
      "source": "https://openstax.org/books/introductory-statistics-2e/pages/7-1-the-central-limit-theorem-for-sample-means-averages",
      "evidenceLabel": {
        "zh": "OpenStax7.1 · 平均值的方差与SE ↗",
        "en": "OpenStax7.1 · variance/SE of a mean ↗"
      }
    },
    {
      "node": "montecarlo",
      "question": {
        "zh": "同样N，为什么20次估计并不相同？",
        "en": "Why do20 estimates differ at the same N?"
      },
      "action": {
        "zh": "选择“20颗种子同跑”，依次按“每次N=100／400／1600”。这些键暂停并重放同一种子的前缀。比较轨迹束、20次估计的样本标准差和理论SE；可换种子再看。",
        "en": "Choose20 seeds at once,then N100/400/1600. These buttons pause and replay prefixes of the same seeds. Compare the bundle,20-estimate sampleSD and theoreticalSE; optionally change seed and repeat."
      },
      "observe": {
        "zh": "N四倍使理论SE减半；一次误差和20次的样本标准差可能不减半，甚至变大。浅带用已知π作教学参照，不是未知π的置信区间或整条轨迹的保证。",
        "en": "Four times N halves theoreticalSE. One error or the sampleSD of20 runs need not halve,and can increase. The pale band uses knownπ as a teaching reference,not a confidence interval for unknownπ or a whole-trajectory guarantee."
      },
      "bridge": {
        "zh": "展开“这些方差各指什么”：0/1数据的样本方差、π估计的理论方差及其平方根SE有不同对象。20次估计的样本SD也不是20次均值的SE。",
        "en": "Expand “Which variance is which?”: samplevariance of0/1data,theoreticalvariance of π estimates and its square-rootSE describe different objects. The20-estimate sampleSD is not the SE of their average."
      },
      "href": "../montecarlo/#step2",
      "evidenceEdge": "variance:montecarlo",
      "source": "https://openstax.org/books/introductory-statistics-2e/pages/7-1-the-central-limit-theorem-for-sample-means-averages",
      "evidenceLabel": {
        "zh": "OpenStax7.1 · N不是重复次数 ↗",
        "en": "OpenStax7.1 · N is not replications ↗"
      }
    }
  ]
},
{
  "id": "volt-second",
  "background": [
    "integral",
    "inductor"
  ],
  "title": {
    "zh": "平均电压为零，为何电流不停？",
    "en": "Zero average voltage: why does current continue?"
  },
  "nodes": [
    "integral",
    "inductor",
    "buck"
  ],
  "stationTasks": [
    {
      "node": "integral",
      "question": {
        "zh": "有符号累加，究竟累加什么？",
        "en": "What does a signed integral accumulate?"
      },
      "action": {
        "zh": "打开积分第2步，增加切条数并比较左端／中点／右端取高。这里的v是速度，不是电压。",
        "en": "Open integral step2. Increase strip count and compare left/mid/right samples. Here v is velocity, not voltage."
      },
      "observe": {
        "zh": "速度×时间累加成位移；本例v=t≥0，精确位移2m。换成电压vL时，面积单位变为V·s，不是m或J。",
        "en": "Velocity times time accumulates displacement; here v=t≥0 gives exact displacement2m. Switching to voltage vL changes area units toV·s, not metres or joules."
      },
      "bridge": {
        "zh": "下一站换理想电感：积电压，再除以电感量，得到电流的改变量，不是绝对电流。",
        "en": "Next change to an ideal inductor: integrate voltage and divide by inductance to obtain a current change, not absolute current."
      },
      "href": "../integral/#step2",
      "evidenceEdge": "integral:inductor",
      "source": "https://wiki.analog.com/university/courses/electronics/buck_converter_basics",
      "evidenceLabel": {
        "zh": "Analog Devices · 电感斜率与伏秒平衡 ↗",
        "en": "Analog Devices · current ramps and volt-second balance ↗"
      }
    },
    {
      "node": "inductor",
      "question": {
        "zh": "零电压，会把已有电流清零吗？",
        "en": "Does zero voltage erase an existing current?"
      },
      "action": {
        "zh": "重置电感，依次按+2V两次、0V一次、−2V一次，看电流曲线。每次0.5ms，L=10mH。",
        "en": "Reset the inductor. Apply+2V twice,0V once,then−2V once. Each interval is0.5ms with L=10mH."
      },
      "observe": {
        "zh": "电流0→0.1→0.2→0.2→0.1A。每个正／负矩形面积±0.001V·s，除以0.01H得到±0.1A；零电压保持0.2A。",
        "en": "Current goes0→0.1→0.2→0.2→0.1A. Each signed rectangle is±0.001V·s; dividing by0.01H gives±0.1A. Zero voltage keeps0.2A."
      },
      "bridge": {
        "zh": "下一站是不同参数的Buck：L=1mH，周期50µs，初态已取稳态谷值；不会传递这里的电流或脉冲。",
        "en": "Next is a different Buck case: L=1mH,period50µs, starting at a steady-state valley. No current or pulse parameters transfer."
      },
      "href": "../power-converters/#step1",
      "evidenceEdge": "integral:inductor",
      "source": "https://wiki.analog.com/university/courses/electronics/buck_converter_basics",
      "evidenceLabel": {
        "zh": "Analog Devices · 电感斜率与伏秒平衡 ↗",
        "en": "Analog Devices · current ramps and volt-second balance ↗"
      }
    },
    {
      "node": "buck",
      "question": {
        "zh": "正负电压面积抵消，电流也为零吗？",
        "en": "If voltage areas cancel, must current be zero?"
      },
      "action": {
        "zh": "设置Vin=12V、D=50%，展开“从刚才的斜率推导输出电压”，按“查看ON结束”与“查看一周期”。保持一周期时刻，再把D改75%，比较填色面积。",
        "en": "Set Vin=12V,D=50%. Expand “Derive output voltage from those slopes”; use Inspect ON end,then Inspect one period. Keep the one-period time and change D to75%; compare the filled areas."
      },
      "observe": {
        "zh": "默认ON结束：+150Vµs，Δi=+0.15A；一周期+150与−150抵消，电流回到0.925A，不是零。D=75%时矩形高宽都变，净面积仍为零。",
        "en": "At default ON end:+150Vµs,Δi=+0.15A. At one period,+150 and−150 cancel; current returns to0.925A,not zero. D=75% changes rectangle heights/widths while net area remains zero."
      },
      "bridge": {
        "zh": "这是已建立的理想周期稳态；调参比较另一个稳态，不模拟启动或控制器。任意暂态区间仍满足积分关系，但未必伏秒平衡。",
        "en": "This is an established ideal periodic steady state. Parameter edits compare another steady case,not startup or a controller. The integral relation still holds during a transient,but its voltage area need not balance."
      },
      "href": "../power-converters/#step4",
      "evidenceEdge": "inductor:buck",
      "source": "https://wiki.analog.com/university/courses/electronics/buck_converter_basics",
      "evidenceLabel": {
        "zh": "Analog Devices · 电感斜率与伏秒平衡 ↗",
        "en": "Analog Devices · current ramps and volt-second balance ↗"
      }
    }
  ]
},
{
  "id": "charge",
  "background": [
    "derivative",
    "capacitor"
  ],
  "title": {
    "zh": "电流为零，电压为何还在？",
    "en": "Zero current: why does voltage remain?"
  },
  "nodes": [
    "derivative",
    "capacitor"
  ],
  "stationTasks": [
    {
      "node": "derivative",
      "question": {
        "zh": "曲线的高度，等于它的变化率吗？",
        "en": "Is a curve’s height the same as its rate of change?"
      },
      "action": {
        "zh": "打开导数第2步，把P点横坐标x设为−1、0、1，对比y=x²的切线与导数图。",
        "en": "Open derivative step2. Set probe x to−1,0,1 and compare the tangent to y=x² with its derivative plot."
      },
      "observe": {
        "zh": "y分别为1、0、1，解析斜率分别是−2、0、2；同样高度也可以一边下降、一边上升。数值差商是近似值，不冒充解析等式。",
        "en": "Heights are1,0,1, while analytic slopes are−2,0,2. Equal height can accompany falling or rising. The numeric finite-difference readout is approximate, not an exact analytic equality."
      },
      "bridge": {
        "zh": "下一站换成电压v对时间t的曲线，不传递x²参数。斜率单位变为V/s，理想电容电流等于电容量乘这个变化率。",
        "en": "Next change examples to voltage v versus time t; x² parameters are not transferred. Slope has unitsV/s, and ideal capacitor current equals capacitance times this rate."
      },
      "href": "../derivative/#step2",
      "evidenceEdge": "derivative:capacitor",
      "source": "https://openstax.org/books/university-physics-volume-2/pages/9-1-electrical-current",
      "evidenceLabel": {
        "zh": "OpenStax9.1 · 电流是电荷变化率 ↗",
        "en": "OpenStax9.1 · current is charge rate ↗"
      }
    },
    {
      "node": "capacitor",
      "question": {
        "zh": "不再流入电荷，电压会消失吗？",
        "en": "If charge stops arriving, does voltage disappear?"
      },
      "action": {
        "zh": "先重置电容，再依次按两次+20mA、一次0mA、一次−20mA。对比完整电压曲线与“最后一个区间”的横向时间、纵向Δv。",
        "en": "Reset the capacitor, then press+20mA twice,0mA once and−20mA once. Compare the full voltage trace with the last interval’s horizontal time and vertical Δv."
      },
      "observe": {
        "zh": "C=100µF、每段0.5ms：电压0→0.1→0.2→0.2→0.1V。三种电流对应段内斜率+200、0、−200V/s。零电流留下0.2V；负电流可继续使带符号电压穿过零点。",
        "en": "At C=100µF and0.5ms per interval: voltage goes0→0.1→0.2→0.2→0.1V. The three currents give within-segment slopes+200,0,−200V/s. Zero current leaves0.2V; negative current can take signed voltage throughzero."
      },
      "bridge": {
        "zh": "由q=Cv与i=dq/dt得到i=C·dv/dt。本模型每段恒流，所以区间斜率恰等段内导数；电流真正跳变处电压没有双侧导数。新文档重载会重置脉冲；返回地图保留站点。",
        "en": "q=Cv and i=dq/dt give i=C·dv/dt. Each segment has constant current, so its interval slope equals the interior derivative; at a true current jump voltage has no two-sided derivative. New-document reload resets pulses; Back retains the Atlas station."
      },
      "href": "../power-converters/#step2",
      "evidenceEdge": "derivative:capacitor",
      "source": "https://openstax.org/books/university-physics-volume-2/pages/8-1-capacitors-and-capacitance",
      "evidenceLabel": {
        "zh": "OpenStax8.1 · 电荷q=Cv ↗",
        "en": "OpenStax8.1 · charge q=Cv ↗"
      }
    }
  ]
},
      {
        "id": "signal",
        "background": [
          "lti",
          "sine"
        ],
        "title": {
          "zh": "移动平均为什么能消掉一个频率？",
          "en": "Why can a moving average cancel one frequency?"
        },
        "nodes": [
          "lti",
          "impulse",
          "convolution",
          "freqresp"
        ],
        "stationTasks": [
          {
            "node": "lti",
            "evidenceLabel": {
              "zh": "LTI课程 · 叠加与延迟检验 ↗",
              "en": "LTI lesson · superposition and delay tests ↗"
            },
            "question": {
              "zh": "什么时候，一份h才足够？",
              "en": "When is one h enough?"
            },
            "action": {
              "zh": "打开公理检验台：比较累加器与平方器的叠加性偏差。再看时变增益的延迟检验。",
              "en": "Open the axiom bench. Compare the accumulator and squarer under superposition, then inspect the time-varying gain under a delay."
            },
            "observe": {
              "zh": "平方器的反例否定线性；时变增益可以线性却不时不变。几组输入通过检验不等于对任意输入的证明。",
              "en": "The squarer supplies a counterexample to linearity; time-varying gain can be linear without time invariance. Passing a few inputs is not a proof for all inputs."
            },
            "bridge": {
              "zh": "接下来固定使用零初态的3点平均器，看看它的h怎样决定输出。",
              "en": "Next, fix a zero-initial 3-point moving average and inspect how its h determines output."
            },
            "href": "../lti/#step3",
            "evidenceEdge": "lti:superposition",
            "source": "../lti/#step3"
          },
          {
            "node": "impulse",
            "evidenceLabel": {
              "zh": "LTI课程 · h的加权叠加 ↗",
              "en": "LTI lesson · weighted copies of h ↗"
            },
            "question": {
              "zh": "三根等高的h，怎样改变输入？",
              "en": "What do three equal taps do to the input?"
            },
            "action": {
              "zh": "选“3点滑动平均”，比较输入与输出图；可点击“播放输入／播放处理后”。查看每份平移h的叠加。",
              "en": "Choose “3-point moving average”. Compare the input/output plots; optionally play input and processed sound. Inspect the shifted copies of h."
            },
            "observe": {
              "zh": "h[0]=h[1]=h[2]=1/3，其他项为0。输出取最近3点的平均；相邻项可能相加，也可能抵消。试听是明确时间映射的合成模式，不是实录。",
              "en": "h[0]=h[1]=h[2]=1/3, zero elsewhere. Each output averages the latest 3 samples; terms can reinforce or cancel. Audition uses an explicitly mapped synthetic pattern, not a recording."
            },
            "bridge": {
              "zh": "下一站换一组便于手算的f、g，把同一种卷积运算拆成每项乘积；不会自动同步这页的数值。",
              "en": "The next lesson changes to small hand-calculation arrays f and g to unpack the same convolution operation. It does not transfer this page’s parameters."
            },
            "href": "../lti/#step2",
            "evidenceEdge": "impulse:convolution",
            "source": "../lti/#step2"
          },
          {
            "node": "convolution",
            "evidenceLabel": {
              "zh": "MIT/Oppenheim · 讲义11，卷积性质（11-5页）↗",
              "en": "MIT/Oppenheim · lecture11, convolution property (11-5) ↗"
            },
            "question": {
              "zh": "一个输出点，到底把哪些项加起来？",
              "en": "Which terms make one output sample?"
            },
            "action": {
              "zh": "先保留默认f=[1,2,3,2,1]、g=[1,0,−1]。按“单步”观察核翻转、对齐、相乘、求和；改一个核值后直接单步重算；“重置”会恢复默认数值。",
              "en": "Keep default f=[1,2,3,2,1] and g=[1,0,−1]. Use Step to inspect flip, alignment, products and sum. After editing a kernel value, step again to recompute; Reset restores the defaults."
            },
            "observe": {
              "zh": "每列乘积是f[k]g[n−k]，把重叠列相加才得到该n的输出。这组g不是上一站的平均核；运算相同，数值例子不同。",
              "en": "Each column contributes f[k]g[n−k]; summing overlapping columns gives output at n. This g is not the previous averaging kernel: same operation, different example."
            },
            "bridge": {
              "zh": "回到3点平均器，用正弦作输入：在频域，这份卷积可以用一个复数倍率H表达。",
              "en": "Return to the 3-point average with a sinusoidal input. In frequency, this convolution is represented by a complex multiplier H."
            },
            "href": "../convolution/#step2",
            "evidenceEdge": "convolution:freqresp",
            "source": "https://ocw.mit.edu/courses/res-6-007-signals-and-systems-spring-2011/9434f9bde960fd3b2b81de3ad442f902_MITRES_6_007S11_lec11.pdf#page=5"
          },
          {
            "node": "freqresp",
            "evidenceLabel": {
              "zh": "MIT/Oppenheim · 讲义11，卷积性质（11-5页）↗",
              "en": "MIT/Oppenheim · lecture11, convolution property (11-5) ↗"
            },
            "question": {
              "zh": "平均3点，为什么能让一个正弦消失？",
              "en": "Why can a 3-point average cancel a sinusoid?"
            },
            "action": {
              "zh": "将平均长度M设为3，再点“送零点频率2π/M”。先预测：保持频率不动，改M=2，还会完全抵消吗？观察下方输出波形。",
              "en": "Set average length M=3, then use the exact first-zero 2π/M preset. Predict: keep frequency unchanged and set M=2. Will cancellation remain complete? Inspect the output waveform."
            },
            "observe": {
              "zh": "Ω=2π/3 rad/样本时，3个相隔该相位的贡献相加为0；M=2时幅值比为1/2。零点指正弦建立后的响应，不保证启动的前两点为0，也不代表上一站多频试听全静音。不要手输四舍五入的2.094来冒充精确零点。",
              "en": "At Ω=2π/3 rad/sample, the 3 phase-shifted contributions sum to zero; M=2 gives magnitude 1/2. This describes the established sinusoidal response, not necessarily the first 2 startup samples, nor silence of the earlier multi-frequency clip. Use the exact preset, not rounded 2.094."
            },
            "bridge": {
              "zh": "把h的逐项乘加与H的幅相联系起来：这是同一固定LTI系统的两种表示，不是新的滤波器。",
              "en": "Connect the multiply-and-sum view of h to the magnitude/phase of H: two representations of one fixed LTI system, not a new filter."
            },
            "href": "../freqresp/#step3",
            "evidenceEdge": "convolution:freqresp",
            "source": "https://ocw.mit.edu/courses/res-6-007-signals-and-systems-spring-2011/9434f9bde960fd3b2b81de3ad442f902_MITRES_6_007S11_lec11.pdf#page=5"
          }
        ]
      },
      {id:'optics',background:['unit-circle','snell'],title:b('角从哪里量，何时没有折射角？','Where does the angle start, and when is refraction impossible?'),nodes:['unit-circle','snell']},
      {id:'geometry',background:['slope','pinhole-ratio'],title:b('一条直线，怎样得到小孔倒像？','How does one straight line produce an inverted image?'),nodes:['slope','pinhole-ratio']},
      {id:'work',background:['work-energy','net-force'],title:b('往返净功为零，途中能量去哪了？','Zero return work: where did the energy go?'),nodes:['integral','work-energy','net-force']},
      {id:'travel',background:["integral"],title:b('回到起点，为什么还走了路？','Back at the start: where did the distance go?'),nodes:['integral','oscillation']},
      {id:'kinematics',background:["derivative", "net-force"],check:'free-crossing-v1',title:b('从斜率到净力','From slopes to net force'),nodes:['derivative','oscillation','net-force']},
      {id:'motion',background:["sine", "oscillation"],check:'free-crossing-v1',title:b('圆的投影，为什么像弹簧？','Why does a circle’s projection match a spring?'),nodes:['unit-circle','sine','oscillation']},
      {id:'power',background:["pwm", "buck"],title:b('电压变了，能量去哪了？','Where does the energy go?'),nodes:['power','capacitor','inductor','buck','pwm','boost']},
      {id:'waves',background:["sine", "superposition"],title:b('从圆到波形','From circles to waveforms'),nodes:['unit-circle','sine','fourier','convolution']},
      {id:'response',background:["sine", "oscillation"],backgroundNote:{"zh": "本实验有阻尼与持续驱动；下面的自由振子方程只用于回看符号。暂态是初始状态带来的额外运动，在本页正阻尼模型中会衰减。稳态是随后保留的持续周期运动，不是静止；黏性阻尼通过反向于速度的力耗能。响应图中的 φ 是位移相对驱动力的相位差。", "en": "This lab has damping and sustained driving; the free-spring equation below is background for its symbols. A transient is extra motion associated with the initial state; it decays in this positive-damping model. Steady state is the sustained periodic motion left afterward, not rest. Viscous damping removes energy through a force opposing velocity. Here φ is displacement’s phase difference relative to the driving force."},backgroundSource:'https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations',title:b('为什么会共振？','Why does resonance happen?'),nodes:['oscillation','resonance','freqresp','poles']},
      {id:'estimate',background:["probability", "bayes"],title:b('从测量到控制','From measurements to control'),nodes:['probability','bayes','kalman','feedback']}
    ]
  };
})();

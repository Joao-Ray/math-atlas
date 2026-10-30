import type { Formula, Problem, Topic } from '@/types';

type Lesson = Omit<Topic, 'formulaIds' | 'problemIds'> & {
  formula: Omit<Formula, 'id' | 'courseId' | 'topicId'>;
  problems: Omit<Problem, 'courseId' | 'topicId'>[];
};
const original = { kind: 'original', label: '自编配套练习 · 非教材原题、非历年真题' } as const;
const reference = (text: string) => `参考阅读：${text}。本页定义、讲解与配套题为重新编写，不是教材原文或原题摘录。`;
const lessons: Lesson[] = [
  {
    id: 'differential-error-estimates', courseId: 'calculus', title: 'Differentials and Error Estimates', titleZh: '微分近似与误差估计',
    summary: '把线性主部和真正的函数增量分开，再判断近似有多可靠。',
    definition: 'f 在 x 处可微表示增量可分成 f′(x)Δx 与比 Δx 更高阶的小量。微分是线性主部，不是一般情况下的精确增量。二阶导数有界时可进一步控制余项。',
    intuition: '切线在附近给出好估计，但离开切点后曲率会带来偏差。',
    prerequisites: ['derivatives', 'taylor-series'], learningNotes: ['写清展开点和实际增量；近似号不能换成等号。', '相对误差要除以非零的原值；误差上界还需额外的二阶可导条件。'],
    sourceNote: reference('同济《高等数学》第八版上册，第二章第五节“函数的微分”'),
    formula: { title: 'Linear differential approximation', titleZh: '可微函数的线性主部', latex: '\\Delta f=f^{\\prime}(x)\\Delta x+o(\\Delta x)', conditions: 'f 在展开点 x 处可微，Δx→0；二阶余项估计另需邻域内二阶导数的界。', explanation: 'df=f′(x)Δx 只取增量的一阶主部，余项相对于 Δx 趋于零。' },
    problems: [
      { id: 'sqrt-differential-bound', title: '估算平方根并给出误差界', difficulty: 3, source: original, prompt: '用 x=16 处的微分近似计算 √16.08，并用二阶导数给出绝对误差上界。', formulas: [], hints: ['f′(16)=1/8；在 [16,16.08] 上控制 |f″|。'],
        steps: [{ title: '取线性近似', body: 'Δx=0.08，df=0.08/8=0.01，所以近似值是 4.01。' }, { title: '估计二阶余项', body: '|f″(x)|=1/(4x^(3/2))≤1/256。拉格朗日余项不超过 (1/2)(1/256)(0.08)²=1/80000。' }, { title: '判断误差方向', body: '平方根函数凹，切线在曲线上方，所以 4.01 是偏大的估计。' }], answer: '√16.08≈4.01，绝对误差≤1/80000=0.0000125，近似值偏大。' },
      { id: 'sphere-relative-differential', title: '半径误差如何传到体积', difficulty: 2, source: original, prompt: '球的半径从 10 增加到 10.02。用微分估计体积的相对增量，并与精确相对增量比较。', formulas: ['V(r)=\\frac{4\\pi}{3}r^3'], hints: ['dV/V=3dr/r；精确比值为 (1+dr/r)³−1。'],
        steps: [{ title: '传播一阶误差', body: 'dr/r=0.002，故 dV/V=0.006，即约 0.6%。' }, { title: '计算精确比值', body: '(1.002)³−1=0.006012008。由于体积函数在正半轴凸，线性估计略小。' }], answer: '一阶估计 0.6%；精确为 0.6012008%，一阶估计略小。' },
    ],
  },
  {
    id: 'parametric-curvature', courseId: 'calculus', title: 'Parametric Curvature', titleZh: '参数曲线与曲率',
    summary: '用速度与加速度刻画曲线弯曲，而不依赖能否写成 y=f(x)。',
    definition: '平面正则 C² 参数曲线的曲率是单位切向量对弧长的变化率之模。速度不为零时可由一、二阶参数导数计算；参数变化快慢不是曲率本身。',
    intuition: '直线方向不变，曲率为零；小圆比大圆转得更急，曲率更大。',
    prerequisites: ['derivatives', 'scalar-line-integrals'], learningNotes: ['分母中的速度不能为零；尖点或退化参数点需单独处理。', 'x′=0 不表示曲率公式失效，只要总速度仍非零。'],
    sourceNote: reference('同济《高等数学》第八版上册，第三章“曲率”及参数方程求导相关章节'),
    formula: { title: 'Curvature of a regular planar curve', titleZh: '平面参数曲线的曲率', latex: '\\kappa=\\frac{|x^{\\prime}y^{\\prime\\prime}-y^{\\prime}x^{\\prime\\prime}|}{((x^{\\prime})^2+(y^{\\prime})^2)^{3/2}}', conditions: 'x(t)、y(t) 二阶连续可微，且 x′(t)²+y′(t)²>0。', explanation: '分子刻画速度方向的变化，分母消除参数速度带来的尺度。' },
    problems: [
      { id: 'circle-curvature-radius-three', title: '半径为三的圆有多弯', difficulty: 2, source: original, prompt: '曲线 x=3cos t，y=3sin t，求各点曲率。', formulas: [], hints: ['先计算速度平方与分子中的行列式。'],
        steps: [{ title: '计算导数', body: 'x′=−3sin t，y′=3cos t，x″=−3cos t，y″=−3sin t。速度平方为 9。' }, { title: '代入曲率', body: '|x′y″−y′x″|=9，而分母为 9^(3/2)=27，因此曲率处处为 1/3。' }], answer: 'κ=1/3，曲率半径为 3。' },
      { id: 'vertical-tangent-curvature', title: '垂直切线不妨碍计算曲率', difficulty: 3, source: original, prompt: '对参数曲线 x=t²、y=t，求 t=0 处的切线方向与曲率。能否直接用 y′(x)=y′(t)/x′(t) 在该点求斜率？', formulas: [], hints: ['速度为 (2t,1)，在零点不是零向量。'],
        steps: [{ title: '判断正则性', body: '在零点速度为 (0,1)，因此切线竖直，且参数曲率公式可用。' }, { title: '计算弯曲程度', body: 'x″=2、y″=0，分子绝对值为 2，分母为 1，所以 κ=2。斜率比式因 x′=0 不能直接除。' }], answer: '切线竖直（x=0），κ=2；不能在该点直接除以 x′(0)。' },
    ],
  },
  {
    id: 'second-order-linear-odes', courseId: 'calculus', title: 'Second-order Linear ODEs', titleZh: '二阶常系数方程与共振',
    summary: '先解齐次特征方程，再为外力寻找不与齐次解重复的特解。',
    definition: '常系数线性方程的齐次解由特征根决定。二重实根需补上 x 倍的解；非齐次方程的通解是齐次通解加一个特解，共振时试探式也要乘相应次数的 x。',
    intuition: '已有的振动模式不能再单独承担同频外力，需要加入随时间变化的振幅。',
    prerequisites: ['ordinary-differential-equations', 'linear-first-order-odes', 'complex-roots'], learningNotes: ['二阶初值问题通常需要两个初值，最后必须回代原方程。', '待定系数法只适合相应的特殊右端；重根、共振都不能漏乘 x。'],
    sourceNote: reference('同济《高等数学》第八版上册，第七章第七、八节“常系数线性微分方程”'),
    formula: { title: 'Repeated real characteristic root', titleZh: '二重特征根的齐次通解', latex: 'r^2+ar+b=(r-r_0)^2\\quad\\Longrightarrow\\quad y_h=(C_1+C_2x)e^{r_0x}', conditions: '实常数 a、b；方程 y″+ay′+by=0 的特征方程有二重实根 r₀。', explanation: '仅有 e^(r₀x) 不够，需要第二个线性无关解 xe^(r₀x)。' },
    problems: [
      { id: 'repeated-root-initial-value', title: '重根初值问题不能少一个解', difficulty: 3, source: original, prompt: '解 y″−4y′+4y=0，y(0)=1，y′(0)=0。', formulas: [], hints: ['特征方程为 (r−2)²=0。'],
        steps: [{ title: '写齐次通解', body: 'y=(C₁+C₂x)e^(2x)，由 y(0)=1 得 C₁=1。' }, { title: '代入导数初值', body: 'y′=[C₂+2C₁+2C₂x]e^(2x)，在零点得到 C₂+2=0。' }], answer: 'y=(1−2x)e^(2x)。' },
      { id: 'resonant-sine-forcing', title: '同频正弦外力与共振特解', difficulty: 4, source: original, prompt: '解 y″+y=sin x，y(0)=0，y′(0)=0。', formulas: [], hints: ['sin x 已是齐次解，试探特解时乘 x。'],
        steps: [{ title: '处理共振', body: '齐次解为 C₁cos x+C₂sin x。取特解 −xcos x/2，直接求两次导数可验证其二阶导数加自身等于 sin x。' }, { title: '满足初值', body: 'y(0)=0 给 C₁=0；特解导数在零点为 −1/2，所以 C₂=1/2。' }, { title: '核对', body: '最终解及其一阶导数在零点均为零，代回 y″+y 得到 sin x。' }], answer: 'y=(sin x−xcos x)/2。' },
    ],
  },
  {
    id: 'total-variance-decomposition', courseId: 'probability', title: 'Law of Total Variance', titleZh: '全方差与混合模型',
    summary: '总体波动由条件内波动与条件均值之间的波动共同构成。',
    definition: '将 X−E[X] 分成 X−E[X|Y] 与 E[X|Y]−E[X]，交叉项期望为零，得到全方差分解。仅平均各条件方差可能漏掉组间差异。',
    intuition: '不同班级内部的分数波动，与各班平均分的差别，都会贡献总体方差。',
    prerequisites: ['conditional-expectation', 'expectation-variance'], learningNotes: ['Var(E[X|Y]) 通常不为零；不能把它遗漏。', '这里要求 X 的二阶矩有限；条件均值与条件方差本身是 Y 的函数。'],
    sourceNote: reference('帕普里斯、佩莱《概率、随机变量与随机过程》第四版，第六章“条件期望”；何书元《随机过程》第一章“条件概率和条件数学期望”'),
    formula: { title: 'Total variance', titleZh: '全方差分解', latex: '\\operatorname{Var}(X)=E[\\operatorname{Var}(X\\mid Y)]+\\operatorname{Var}(E[X\\mid Y])', conditions: 'E[X²]<∞；条件期望和条件方差相对于同一个 Y。', explanation: '条件残差对所有可积的 Y 函数正交，因而交叉项为零。' },
    problems: [
      { id: 'bernoulli-mixture-total-variance', title: '两类人群的条件均值和方差', difficulty: 3, source: original, prompt: 'Y 为成功概率 1/4 的伯努利变量，给定 Y 时 E[X|Y]=2Y，Var(X|Y)=1+Y。求 E[X] 与 Var(X)。', formulas: [], hints: ['先算组内方差的平均，再算 2Y 的方差。'],
        steps: [{ title: '全期望', body: 'E[X]=2E[Y]=1/2。' }, { title: '两项方差', body: 'E[1+Y]=5/4；Var(2Y)=4×(1/4)×(3/4)=3/4。' }, { title: '相加', body: 'Var(X)=5/4+3/4=2。只保留第一项会少算 3/4。' }], answer: 'E[X]=1/2，Var(X)=2。' },
      { id: 'uniform-binomial-mixture-variance', title: '成功概率本身也是随机的', difficulty: 4, source: original, prompt: 'U 在 [0,1] 均匀分布，给定 U 时 X 服从 Binomial(4,U)。求 E[X] 和 Var(X)。', formulas: [], hints: ['E[U]=1/2，E[U²]=1/3，Var(U)=1/12。'],
        steps: [{ title: '条件特征', body: 'E[X|U]=4U，Var(X|U)=4U(1−U)。' }, { title: '分别求平均与方差', body: 'E[X]=2；组内部分为 4(1/2−1/3)=2/3，组间部分为 16/12=4/3。' }, { title: '混合后的总体波动', body: '两部分相加为 2，比固定成功概率为 1/2 时的二项方差 1 更大。' }], answer: 'E[X]=2，Var(X)=2。' },
    ],
  },
  {
    id: 'probability-generating-functions', courseId: 'probability', title: 'Probability Generating Functions', titleZh: '概率生成函数与独立求和',
    summary: '用幂级数保存非负整数分布，把独立求和化为函数相乘。',
    definition: '非负整数随机变量的概率生成函数为 G(s)=E[s^X]，0≤s≤1。各幂系数就是概率；在有限二阶矩条件下，边界导数给出一阶矩和二阶阶乘矩。',
    intuition: '分布被装进一个函数中，独立和的卷积就变成乘法。',
    prerequisites: ['distributions', 'expectation-variance'], learningNotes: ['只对非负整数变量按这里的幂级数定义使用；不要与矩母函数混淆。', 'G″(1) 是 E[X(X−1)]，不是 E[X²]；边界导数取左侧极限。'],
    sourceNote: reference('方兆本、缪柏其《随机过程》第三版，第一章“矩母函数及生成函数”'),
    formula: { title: 'Moments from a PGF', titleZh: '生成函数给出均值和方差', latex: 'E[X]=G^{\\prime}(1),\\quad\\operatorname{Var}(X)=G^{\\prime\\prime}(1)+G^{\\prime}(1)-(G^{\\prime}(1))^2', conditions: 'X 为非负整数变量且 E[X²]<∞，G(1) 处的导数按从左侧的极限理解。', explanation: '先求阶乘矩，再用 X²=X(X−1)+X 转为通常的二阶矩。' },
    problems: [
      { id: 'binomial-pgf-moments', title: '从生成函数恢复二项分布矩', difficulty: 3, source: original, prompt: '已知 G(s)=(0.6+0.4s)^5。识别分布，并通过导数求均值与方差。', formulas: [], hints: ['G′(1)=5×0.4，G″(1)=5×4×0.4²。'],
        steps: [{ title: '识别并求导', body: '对应 Binomial(5,0.4)。G′(1)=2，G″(1)=3.2。' }, { title: '恢复二阶矩', body: 'E[X²]=3.2+2=5.2，所以方差为 5.2−2²=1.2。' }], answer: 'X~Binomial(5,0.4)，E[X]=2，Var(X)=1.2。' },
      { id: 'two-geometric-pgf-sum', title: '两个等待失败次数的和', difficulty: 4, source: original, prompt: 'X、Y 独立且 P(X=k)=P(Y=k)=2^(−k−1)，k=0,1,…。求 S=X+Y 的生成函数、P(S=2)、均值与方差。', formulas: [], hints: ['每个变量的生成函数是 1/(2−s)，独立和相乘。'],
        steps: [{ title: '生成函数相乘', body: 'G_S(s)=1/(2−s)²。每个变量的均值为 1、方差为 2。' }, { title: '提取系数', body: 'S=2 有 (0,2)、(1,1)、(2,0) 三种组合，每种概率 1/16，因此总概率 3/16。' }, { title: '相加矩', body: '独立性给 E[S]=2，Var(S)=4；也可对 G_S 求导核验。' }], answer: 'G_S(s)=1/(2−s)²；P(S=2)=3/16；E[S]=2，Var(S)=4。' },
    ],
  },
  {
    id: 'nonhomogeneous-poisson', courseId: 'stochastic-process', title: 'Nonhomogeneous Poisson Processes', titleZh: '非齐次泊松过程与累计强度',
    summary: '到达强度随时间变化时，用强度的积分代替固定的 λt。',
    definition: '非齐次泊松过程从零出发，具有独立增量；区间增量服从参数为该区间强度积分的泊松分布。一般不再具有平稳增量。',
    intuition: '同样长的两段时间，繁忙时段和空闲时段的平均到达数可以不同。',
    prerequisites: ['poisson-process', 'integrals'], learningNotes: ['强度 λ(t) 不是累计均值；先积分再代入泊松概率。', '下一次等待时间一般不是固定参数指数分布，也不能直接套用无记忆性。'],
    sourceNote: reference('何书元《随机过程》第二章“非时齐泊松过程”；方兆本、缪柏其《随机过程》第三版，第二章“非齐次 Poisson 过程”'),
    formula: { title: 'Integrated intensity of an increment', titleZh: '累计强度决定增量分布', latex: 'N(t)-N(s)\\sim\\operatorname{Poisson}\\!\\left(\\int_s^t\\lambda(u)\\,du\\right)', conditions: '0≤s<t；λ 为非负局部可积确定函数，N 为相应非齐次泊松过程。', explanation: '均值和方差都等于区间内的强度积分，但不同区间的参数未必相同。' },
    problems: [
      { id: 'nhpp-quadratic-intensity-count', title: '强度递增时的区间计数', difficulty: 3, source: original, prompt: '非齐次泊松过程的强度为 λ(t)=2t，t≥0。求 E[N(3)−N(1)] 与 P(N(3)−N(1)=2)。', formulas: [], hints: ['计算从 1 到 3 的强度积分，而不是取某一点的强度乘时长。'],
        steps: [{ title: '积分强度', body: '区间累计强度为 ∫₁³2t dt=9−1=8。' }, { title: '代入泊松概率', body: '增量服从 Poisson(8)，均值为 8，取值为 2 的概率为 e^(−8)8²/2!=32e^(−8)。' }], answer: '期望为 8，所求概率为 32e^(−8)。' },
      { id: 'nhpp-waiting-not-memoryless', title: '时间变化为何破坏指数等待公式', difficulty: 4, source: original, prompt: '仍令 λ(t)=2t，T 为首次到达时刻。对 u≥0，求 P(T>1+u | T>1)，并说明是否等于 P(T>u)。', formulas: [], hints: ['首次到达的生存概率等于对应区间零次到达的概率。'],
        steps: [{ title: '首次到达尾概率', body: 'P(T>t)=P(N(t)=0)=e^(−t²)。' }, { title: '条件化', body: '比值为 exp(−(1+u)²+1)=exp(−2u−u²)，而 P(T>u)=exp(−u²)。' }, { title: '解释', body: '除 u=0 外一般不同；强度随时间增加，已经等到时刻 1 后的到达风险更高。' }], answer: 'exp(−2u−u²)，对 u>0 不等于 exp(−u²)，没有这里的无记忆性。' },
    ],
  },
  {
    id: 'compound-poisson-moments', courseId: 'stochastic-process', title: 'Compound Poisson Processes', titleZh: '复合泊松过程与随机总量',
    summary: '计数每次事件的随机贡献，而不只统计事件次数。',
    definition: 'S(t) 是泊松到达数 N(t) 个独立同分布标记的和，空和为零。标记序列与计数过程独立时，总量的均值和方差可以通过条件化得到。',
    intuition: '当天有几笔索赔是计数问题，每笔赔多少共同决定总赔付。',
    prerequisites: ['poisson-process', 'total-variance-decomposition'], learningNotes: ['方差使用标记的二阶矩 E[Y²]，不只是 Var(Y)。', '总量未必仍服从泊松分布；标记为 2 时只可能出现偶数总量。'],
    sourceNote: reference('何书元《随机过程》第二章“复合泊松过程”；方兆本、缪柏其《随机过程》第三版，第二章“复合 Poisson 过程”'),
    formula: { title: 'Compound Poisson mean and variance', titleZh: '随机总量的均值和方差', latex: 'E[S(t)]=\\lambda tE[Y],\\qquad\\operatorname{Var}(S(t))=\\lambda tE[Y^2]', conditions: 'N 为强度 λ 的齐次泊松过程；标记 Yᵢ 独立同分布且独立于 N，E[Y²]<∞。', explanation: '计数本身的随机波动也贡献方差，通过全方差公式恰好合成为二阶矩。' },
    problems: [
      { id: 'compound-poisson-two-claim-sizes', title: '两种赔付金额的总波动', difficulty: 3, source: original, prompt: '一天索赔数 N~Poisson(3)，每笔金额独立且以各 1/2 的概率为 1 或 3，并与 N 独立。求总金额 S 的均值、方差。', formulas: [], hints: ['E[Y]=2，E[Y²]=5。'],
        steps: [{ title: '计算标记矩', body: '均值为 2、二阶矩为 5、方差为 1。' }, { title: '处理随机笔数', body: 'E[S]=3×2=6；Var(S)=3×1+3×2²=15，而不是只取 3×1。' }], answer: 'E[S]=6，Var(S)=15。' },
      { id: 'compound-poisson-even-support', title: '两倍泊松变量还是泊松吗', difficulty: 3, source: original, prompt: 'N~Poisson(4)，每次贡献固定为 2，S=2N。求 S 的均值、方差，并判断 S 是否服从某个泊松分布。', formulas: [], hints: ['观察支持集，也可比较均值与方差。'],
        steps: [{ title: '缩放计数', body: '均值乘 2、方差乘 4，因此 E[S]=8、Var(S)=16。' }, { title: '排除泊松分布', body: '非退化泊松分布有所有非负整数取值的正概率，且均值等于方差。本题只取偶数且两个矩不等。' }], answer: 'E[S]=8，Var(S)=16；S 不服从泊松分布。' },
    ],
  },
  {
    id: 'renewal-reward-theorem', courseId: 'stochastic-process', title: 'Renewal Reward Theorem', titleZh: '更新报酬与长期时间平均',
    summary: '长期单位时间收益等于每周期平均收益除以平均周期时长。',
    definition: '独立同分布的周期对 (Yᵢ,Rᵢ) 中，Yᵢ>0 是周期长度，Rᵢ 是完成该周期的报酬。有限均值条件下，已完成周期的总报酬除以时间收敛到 E[R]/E[Y]。',
    intuition: '不同周期长短不一，不能把每周期的比值直接不加权平均。',
    prerequisites: ['renewal-processes', 'law-large-numbers'], learningNotes: ['周期内的时长与报酬可相关，但不同周期对需要满足所述独立同分布条件。', '长期时间平均与固定时刻的极限不是同一结论；剩余寿命还涉及长度偏差。'],
    sourceNote: reference('何书元《随机过程》第三章“有偿更新过程”与“年龄、剩余寿命和更新间隔的比较”'),
    formula: { title: 'Long-run reward rate', titleZh: '更新报酬率', latex: '\\frac{\\sum_{i=1}^{N(t)}R_i}{t}\\longrightarrow\\frac{E[R_1]}{E[Y_1]}\\quad\\text{a.s.}', conditions: '周期对独立同分布，Yᵢ>0，0<E[Y₁]<∞，E[|R₁|]<∞；N(t) 计截至 t 已完成的周期。', explanation: '把每周期的大数定律与完成周期数除以时间的极限相乘。' },
    problems: [
      { id: 'machine-renewal-revenue-rate', title: '机器维修周期的长期收入', difficulty: 3, source: original, prompt: '机器按独立同分布的“运行—维修”周期重复，平均运行 4 小时、维修 1 小时。运行时每小时收入 3，维修时为零。求长期运行比例和单位时间平均收入。', formulas: [], hints: ['平均周期时长为 5，平均周期收入为 12。'],
        steps: [{ title: '选择周期和报酬', body: '周期从一次运行开始到下一次运行开始，期望时长为 4+1=5。运行时长作为报酬，其期望为 4。' }, { title: '求时间平均', body: '运行比例为 4/5；周期收入均值为 3×4=12，因此每小时长期平均收入为 12/5。' }], answer: '长期运行比例为 4/5，长期平均收入为每小时 12/5。' },
      { id: 'renewal-inspection-paradox', title: '随机观察为何更容易碰到长间隔', difficulty: 4, source: original, prompt: '更新间隔独立且以各 1/2 的概率为 2 或 6。考察长期连续时间平均的“距下一次更新的剩余等待”。求其平均值，并与 E[Y]/2 比较；不要求固定时刻的分布极限。', formulas: [], hints: ['长度为 Y 的周期内，剩余等待对时间积分为 Y²/2。'],
        steps: [{ title: '计算每周期面积', body: '周期内剩余等待线性从 Y 降到 0，面积为 Y²/2。E[Y]=4，E[Y²]=(4+36)/2=20。' }, { title: '时间加权', body: '每单位时间平均面积为 E[Y²]/(2E[Y])=20/8=2.5，比 E[Y]/2=2 更大。' }, { title: '说明结论范围', body: '这是长期时间平均（亦对应长区间均匀抽取观察时刻），不是在某个固定相位时刻取分布极限；整数格点间隔尤其应区分这两者。' }], answer: '长期时间平均剩余等待为 2.5，大于 E[Y]/2=2。' },
    ],
  },
  {
    id: 'markov-periodicity', courseId: 'stochastic-process', title: 'Periodicity and Convergence', titleZh: '马尔可夫链周期性与收敛',
    summary: '有平稳分布不等于每个初始分布都会逐步收敛到它。',
    definition: '有正概率返回状态 i 的步数集合，其最大公约数称为该状态的周期。有限不可约链有唯一平稳分布；加上非周期条件，转移分布才保证从任意状态收敛到它。',
    intuition: '若系统只能按固定节拍来回切换，就可能永远振荡而不是逐步稳定。',
    prerequisites: ['markov-chains', 'stationary-distributions'], learningNotes: ['自环能证明该状态周期为 1，但没有自环不意味着周期一定大于 1。', '这里的收敛结论限定有限不可约非周期链；一般无限状态链还需额外条件。'],
    sourceNote: reference('何书元《随机过程》第四章“状态的命名和周期性”；方兆本、缪柏其《随机过程》第三版，第三章“互达性和周期性”'),
    formula: { title: 'Period of a state', titleZh: '状态周期', latex: 'd(i)=\\gcd\\{n\\ge1:(P^n)_{ii}>0\\}', conditions: '离散时间齐次马尔可夫链，状态存在正概率的返回步数；同一互达类中的周期相同。', explanation: '必须对所有可能返回步数取最大公约数，而不只是寻找最短返回路径。' },
    problems: [
      { id: 'alternating-chain-stationary-not-limit', title: '平稳但不逐步收敛的两状态链', difficulty: 3, source: original, prompt: '转移矩阵 P=[[0,1],[1,0]]。求周期和平稳分布，并说明从状态 0 出发的分布是否收敛。', formulas: [], hints: ['只能经过偶数步回到起点。'],
        steps: [{ title: '周期与平稳方程', body: '返回步数为 2、4、6、…，周期为 2。πP=π 给两个分量相等，故 π=(1/2,1/2)。' }, { title: '观察转移分布', body: '从 0 出发，偶数步在 0、奇数步在 1，分布在两点质量之间振荡，不收敛。' }], answer: '周期 2，π=(1/2,1/2)；从单一状态出发不收敛到 π。' },
      { id: 'self-loop-irreducible-chain-limit', title: '一个自环如何打破周期', difficulty: 3, source: original, prompt: '转移矩阵 P=[[0,1],[1/2,1/2]]。求平稳分布，并说明从任意状态出发是否收敛。', formulas: [], hints: ['状态 1 有自环；两个状态互达。'],
        steps: [{ title: '检查周期', body: '状态 1 的周期为 1。链不可约，故两个状态的周期都为 1；状态 0 也有长度为 2 和 3 的返回路径。' }, { title: '解平稳方程', body: 'π₀=π₁/2 且 π₀+π₁=1，得到 π=(1/3,2/3)。有限不可约非周期性保证任意初始状态的分布收敛到它。' }], answer: 'π=(1/3,2/3)，从任意状态出发的分布均收敛到 π。' },
    ],
  },
  {
    id: 'branching-extinction', courseId: 'stochastic-process', title: 'Branching Process Extinction', titleZh: '分支过程与灭绝概率',
    summary: '灭绝概率是后代生成函数的不动点，但要选择最小的那个。',
    definition: 'Galton–Watson 过程中，每个个体独立产生同分布的非负整数个后代。从一个个体出发的最终灭绝概率，是后代概率生成函数在 [0,1] 中的最小不动点。',
    intuition: '下一代所有家系都灭绝，整个家族才会灭绝；不同家系的独立性产生生成函数。',
    prerequisites: ['probability-generating-functions', 'markov-chains'], learningNotes: ['q=1 永远是不动点，但不一定是灭绝概率。', '均值等于 1 时不能忽略“必定只有一个后代”的退化特例；该特例永不灭绝。'],
    sourceNote: reference('何书元《随机过程》第四章“离散时间分支过程”；方兆本、缪柏其《随机过程》第三版，第三章“分支过程”'),
    formula: { title: 'Minimal fixed point for extinction', titleZh: '灭绝概率的最小不动点', latex: 'q=\\min\\{s\\in[0,1]:G(s)=s\\}', conditions: '从一个个体出发的 Galton–Watson 过程；各个体的后代数独立同分布。', explanation: '从 q₀=0 迭代 qₙ₊₁=G(qₙ)，单调得到最终灭绝概率。' },
    problems: [
      { id: 'supercritical-binary-extinction', title: '平均后代数大于一也可能灭绝', difficulty: 4, source: original, prompt: '每个个体以 1/4 概率无后代，以 3/4 概率产生两个后代。初始一个个体，求最终灭绝概率及存活概率。', formulas: [], hints: ['解 q=1/4+3q²/4，并取 [0,1] 中较小的根。'],
        steps: [{ title: '建立不动点', body: 'G(s)=1/4+3s²/4，方程为 3q²−4q+1=0，根为 1 和 1/3。' }, { title: '选择正确根', body: '灭绝概率为最小根 1/3；存活概率为 2/3。平均后代数为 3/2，大于 1 并不保证必然存活。' }], answer: '灭绝概率 1/3，存活概率 2/3。' },
      { id: 'critical-branching-constant-mean', title: '期望恒定不代表不会灭绝', difficulty: 4, source: original, prompt: '每个个体以各 1/2 的概率产生 0 或 2 个后代，初始一个个体。求灭绝概率与第 n 代数量的期望，说明为何两者不矛盾。', formulas: [], hints: ['G(s)=(1+s²)/2；每代期望乘以后代均值 1。'],
        steps: [{ title: '不动点', body: 'q=(1+q²)/2 等价于 (q−1)²=0，因此最终灭绝概率为 1。' }, { title: '代际期望', body: '后代均值为 1，故 E[Zₙ]=1。越来越少的存活家系可以拥有越来越大的规模。' }, { title: '不要交换极限与期望', body: 'Zₙ 几乎处处趋于零，但仅凭 E[Zₙ]=1 不能交换极限和期望；这里没有所需的一致可积性。' }], answer: '灭绝概率为 1，所有 n 的 E[Zₙ]=1；不能据此交换极限与期望。' },
    ],
  },
  {
    id: 'weak-stationarity-spectrum', courseId: 'stochastic-process', title: 'Weak Stationarity and Spectra', titleZh: '宽平稳过程与协方差谱',
    summary: '区分状态分布的平稳性与随机信号的二阶平稳性。',
    definition: '实过程具有有限二阶矩、常数均值，且协方差只依赖时差时称为宽平稳。对均方连续的宽平稳过程，中心化协方差可积时，可用其傅里叶变换表示协方差谱密度。',
    intuition: '把观察时钟整体平移，不改变均值和两个时刻之间的二阶关系。',
    prerequisites: ['covariance-correlation', 'integrals'], learningNotes: ['这里只控制均值和协方差，不一般保证全部有限维分布平移不变。', '这里采用角频率与中心化协方差约定，逆变换带 1/(2π)；非零均值的原始相关谱还需考虑零频原子。', '周期协方差通常不可积，其谱可能含离散原子，不能硬套普通可积函数的傅里叶积分。'],
    sourceNote: reference('帕普里斯、佩莱《概率、随机变量与随机过程》第四版，第九章“功率谱”；方兆本、缪柏其《随机过程》第三版，第四章“协方差函数和功率谱密度”'),
    formula: { title: 'Covariance spectral density convention', titleZh: '中心化协方差的角频率谱', latex: 'S(\\omega)=\\int_{-\\infty}^{\\infty}C(\\tau)e^{-i\\omega\\tau}\\,d\\tau', conditions: '均方连续的实宽平稳过程，C(τ)=Cov(X(t+τ),X(t)) 且 C∈L¹(R)；采用角频率 ω 的傅里叶约定。', explanation: '均方连续保证协方差在零点连续。该约定下 C(0)=(1/(2π))∫S(ω)dω。S 描述中心化波动，不直接混入均值。' },
    problems: [
      { id: 'random-sinusoid-wide-stationarity', title: '随机振幅不自动产生宽平稳', difficulty: 4, source: original, prompt: 'A、B 独立、均值 0、方差 1。比较 X(t)=Acos t 与 Y(t)=Acos t+Bsin t 是否宽平稳。不要额外假定 A、B 为正态。', formulas: [], hints: ['分别计算均值和协方差；用 cos(s−t) 的恒等式。'],
        steps: [{ title: '单个振幅', body: 'X 的均值为零，但 Var(X(t))=cos²t 随时间变化，所以不宽平稳。' }, { title: '两个正交分量', body: 'Y 的均值为零，Cov(Y(s),Y(t))=cos s cos t+sin s sin t=cos(s−t)，因此宽平稳。' }, { title: '限制结论', body: '只给矩条件不能一般推出严格平稳；其周期协方差也不满足本页普通谱积分的 L¹ 条件。' }], answer: 'X 不宽平稳；Y 宽平稳，协方差为 cos(s−t)，不据此断言严格平稳。' },
      { id: 'exponential-covariance-spectrum', title: '指数协方差的角频率谱', difficulty: 4, source: original, prompt: '零均值宽平稳实过程的协方差为 C(τ)=3e^(−2|τ|)。按本页角频率约定求 S(ω)，并核对方差。', formulas: [], hints: ['把正负半轴积分合并为两倍余弦变换。'],
        steps: [{ title: '计算傅里叶积分', body: 'S(ω)=6∫₀∞e^(−2t)cos(ωt)dt=6×2/(4+ω²)=12/(4+ω²)。' }, { title: '逆变换核对', body: '∫R 1/(4+ω²)dω=π/2，因此 (1/(2π))∫S=3，与 C(0)=3 一致。' }], answer: 'S(ω)=12/(4+ω²)，方差为 3。' },
    ],
  },
  {
    id: 'ito-isometry', courseId: 'stochastic-process', title: 'Itô Isometry', titleZh: '伊藤等距与随机积分二阶矩',
    summary: '把随机积分的二阶矩转化为被积过程平方的时间积分。',
    definition: '对标准布朗运动和可预测、平方可积的被积过程，伊藤积分均值为零，其二阶矩等于被积过程平方积分的期望。适应性与可积性都是关键条件。',
    intuition: '独立增量使不同时段的交叉贡献在期望中消失，剩下每段的方差累积。',
    prerequisites: ['ito-calculus', 'brownian-motion', 'expectation-variance'], learningNotes: ['被积过程可以依赖过去，但不能任意使用未来的信息。', '确定性被积函数的积分是高斯变量；一般随机被积过程的伊藤积分不一定高斯。'],
    sourceNote: reference('方兆本、缪柏其《随机过程》第三版，第五章“关于 Brown 运动的积分”'),
    formula: { title: 'Itô isometry', titleZh: '伊藤积分等距式', latex: 'E\\!\\left[\\left(\\int_0^T H_t\\,dB_t\\right)^2\\right]=E\\!\\left[\\int_0^T H_t^2\\,dt\\right]', conditions: 'B 是相对于给定滤过的标准布朗运动；H 可预测且 E[∫₀ᵀHₜ²dt]<∞。', explanation: '左侧是随机积分的二阶矩；在这些条件下均值为零，因此也等于方差。' },
    problems: [
      { id: 'deterministic-ito-integral-variance', title: '时间权重的布朗积分', difficulty: 3, source: original, prompt: '设 B 为标准布朗运动，I=∫₀¹2t dBₜ。求均值、方差与分布。', formulas: ['I=\\int_0^1 2t\\,dB_t'], hints: ['确定性平方可积被积函数给出中心高斯积分。'],
        steps: [{ title: '均值与二阶矩', body: 'E[I]=0，伊藤等距给 Var(I)=∫₀¹4t²dt=4/3。' }, { title: '识别分布', body: '确定性权重的积分是布朗增量高斯线性组合的 L² 极限，因此 I~N(0,4/3)。' }], answer: 'E[I]=0，Var(I)=4/3，I~N(0,4/3)。' },
      { id: 'brownian-integrand-not-gaussian', title: '随机被积函数不保证高斯结果', difficulty: 4, source: original, prompt: '设 J=∫₀¹Bₜ dBₜ。求 J 的均值、方差，并判断是否为正态变量。', formulas: ['J=\\int_0^1 B_t\\,dB_t'], hints: ['对 Bₜ² 使用伊藤公式，再用等距式核对方差。'],
        steps: [{ title: '用伊藤公式识别积分', body: 'd(Bₜ²)=2BₜdBₜ+dt，因此 J=(B₁²−1)/2。' }, { title: '计算两个矩', body: 'E[J]=0，等距式给 Var(J)=∫₀¹E[Bₜ²]dt=∫₀¹t dt=1/2。' }, { title: '排除正态性', body: 'J≥−1/2 且方差非零，不可能是无下界的非退化正态变量。' }], answer: 'J=(B₁²−1)/2，均值 0，方差 1/2，不服从正态分布。' },
    ],
  },
];

export const textbookTopics: Topic[] = lessons.map(({ formula, problems, ...topic }) => ({ ...topic, formulaIds: [topic.id + '-formula'], problemIds: problems.map((problem) => problem.id) }));
export const textbookFormulas: Formula[] = lessons.map((lesson) => ({ ...lesson.formula, id: lesson.id + '-formula', courseId: lesson.courseId, topicId: lesson.id }));
export const textbookProblems: Problem[] = lessons.flatMap((lesson) => lesson.problems.map((problem) => ({ ...problem, courseId: lesson.courseId, topicId: lesson.id })));

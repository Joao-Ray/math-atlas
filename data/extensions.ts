import type { Formula, Paper, Problem, Topic } from '@/types';

// Each extension includes prerequisites, formulas, and a worked example.
// Keep IDs stable because favorites and progress are stored by ID.
export const extensionTopics: Topic[] = [
  {
    id: 'integration-techniques', courseId: 'calculus', title: 'Integration Techniques', titleZh: '换元与分部积分',
    summary: '把复杂积分变为熟悉的形式，或把乘积中的求导与积分交换。',
    definition: '换元法来自链式法则；分部积分来自乘积求导公式的积分形式。',
    intuition: '换元是换一把计算的尺子，分部积分是把难求的部分转移到更容易求导的一边。',
    prerequisites: ['integrals', 'derivatives'], formulaIds: ['substitution-rule', 'integration-by-parts'], problemIds: ['integrate-x-exp'],
    learningNotes: ['定积分换元后必须同步更换上下限，不能混用新旧变量。', '分部积分优先让多项式充当 u，求导后次数会降低；最后求导检查答案。'],
  },
  {
    id: 'constrained-extrema', courseId: 'calculus', title: 'Constrained Extrema', titleZh: '拉格朗日乘子与约束极值',
    summary: '在曲线或曲面约束下寻找函数的极值候选点。',
    definition: '在约束梯度非零的正则极值点，目标函数梯度与约束函数梯度平行。',
    intuition: '沿可行方向已经不能继续上升或下降时，目标函数的梯度只能指向约束的法向。',
    prerequisites: ['multivariable-calculus'], formulaIds: ['lagrange-multiplier'], problemIds: ['circle-product-extrema'],
    learningNotes: ['乘子方程只给出候选点，还要比较函数值，并检查约束梯度为零的特殊点。', '在紧约束集合上，连续函数一定取得最大值和最小值；非紧集合不保证。'],
  },
  {
    id: 'diagonalization', courseId: 'linear-algebra', title: 'Diagonalization', titleZh: '矩阵对角化',
    summary: '在特征向量基下，把矩阵作用化为逐坐标缩放。',
    definition: 'n×n 矩阵可对角化，当且仅当在所选数域内有 n 个线性无关特征向量。',
    intuition: '找对坐标系后，耦合在一起的变化可以拆成互不干扰的缩放。',
    prerequisites: ['eigenvalues', 'linear-systems'], formulaIds: ['diagonalization-power'], problemIds: ['symmetric-matrix-square'],
    learningNotes: ['有重复特征值不等于不能对角化，关键是独立特征向量是否足够。', '可对角化与可逆不是一回事；零特征值不妨碍对角化。'],
  },
  {
    id: 'positive-definite', courseId: 'linear-algebra', title: 'Positive Definite Matrices', titleZh: '二次型与正定矩阵',
    summary: '判断二次型是否在所有非零方向上都为正。',
    definition: '实对称矩阵 A 若满足 xᵀAx>0 对所有非零 x 成立，则称 A 正定。',
    intuition: '正定二次型像一个向上张开的碗，从原点往任意方向走都会升高。',
    prerequisites: ['matrices', 'eigenvalues'], formulaIds: ['quadratic-form', 'sylvester-criterion'], problemIds: ['positive-definite-two-by-two'],
    learningNotes: ['这里的特征值判据和顺序主子式判据针对实对称矩阵。', '正定要求严格大于 0；半正定允许某些非零方向取值 0。'],
  },
  {
    id: 'variable-transformations', courseId: 'probability', title: 'Transformations of Random Variables', titleZh: '随机变量变换',
    summary: '从已知分布推导函数变换后的分布。',
    definition: 'Y=g(X) 的分布可先通过 Fᵧ(y)=P(g(X)≤y) 求出；单调可微变换还可用密度换元公式。',
    intuition: '变换压缩或拉伸了横轴，密度也必须相应改变，才能保持总概率不变。',
    prerequisites: ['distributions', 'derivatives'], formulaIds: ['density-transformation'], problemIds: ['uniform-square-density'],
    learningNotes: ['先确定新变量的取值范围，再计算分布函数或密度。', '非单调变换可能有多个原像，不能只代入一个反函数分支。'],
  },
  {
    id: 'probability-inequalities', courseId: 'probability', title: 'Probability Inequalities', titleZh: '马尔可夫与切比雪夫不等式',
    summary: '不用知道完整分布，也能用矩信息控制尾部概率。',
    definition: '马尔可夫不等式约束非负变量的上尾；切比雪夫不等式用有限方差约束偏离均值的概率。',
    intuition: '平均值或方差有限，就限制了极端结果能占据多大的概率。',
    prerequisites: ['expectation-variance'], formulaIds: ['markov-inequality', 'chebyshev-inequality'], problemIds: ['chebyshev-deviation-bound'],
    learningNotes: ['马尔可夫不等式要求变量非负；一般变量可先考虑其绝对值或平方。', '上界可能很宽，甚至超过 1，此时应与平凡上界 1 取较小值；概率上界不是精确概率。'],
  },
  {
    id: 'student-t-inference', courseId: 'statistics', title: 'Student t Inference', titleZh: '未知方差的 t 推断',
    summary: '用样本标准差替代未知总体标准差，估计正态总体的均值。',
    definition: '正态独立同分布样本的标准化均值 (X̄−μ)/(S/√n) 服从自由度 n−1 的 t 分布。',
    intuition: '标准差也由有限样本估计，额外的不确定性让 t 分布的尾部比正态更厚。',
    prerequisites: ['confidence-intervals', 'estimation'], formulaIds: ['t-statistic', 't-confidence'], problemIds: ['small-sample-t-interval'],
    learningNotes: ['σ 未知时用 S，不应把 S 当成已知总体标准差继续使用 Z 的精确结论。', '小样本精确 t 推断依赖正态假设；遇到严重偏态或离群点时尤其需要谨慎。'],
  },
  {
    id: 'chi-square-goodness-of-fit', courseId: 'statistics', title: 'Chi-square Goodness of Fit', titleZh: '卡方拟合优度检验',
    summary: '比较类别计数与某个假设分布的预期计数。',
    definition: 'Pearson 卡方统计量把每类观测与期望计数之差平方，除以期望计数后求和。',
    intuition: '每一类都贡献一份偏差，整体偏差太大时，假设的比例模型就值得怀疑。',
    prerequisites: ['hypothesis-testing', 'distributions'], formulaIds: ['pearson-chi-square'], problemIds: ['three-category-chi-square'],
    learningNotes: ['检验使用计数而不是直接使用百分比，所有期望计数应由同一个总样本量计算。', '卡方分布是大样本近似；这里采用各期望计数至少 5 的常见经验规则，过小时考虑合并类别或精确方法。'],
  },
  {
    id: 'random-walks', courseId: 'stochastic-process', title: 'Random Walks', titleZh: '随机游走',
    summary: '把一串独立随机步长累积为离散时间的位置过程。',
    definition: '简单对称随机游走从 0 出发，每一步独立地以相同概率向 +1 或 −1 移动。',
    intuition: '没有确定的行进方向，但走得越久，可能位置的分散程度越大。',
    prerequisites: ['expectation-variance', 'markov-chains'], formulaIds: ['symmetric-walk-moments'], problemIds: ['four-step-return'],
    learningNotes: ['奇数步不可能回到原点，这是由步长 ±1 的奇偶性决定的。', '位置 Sₙ 是很多步长之和，并不只取 ±1；一步的方差为 1，n 步的位置方差为 n。'],
  },
  {
    id: 'poisson-superposition', courseId: 'stochastic-process', title: 'Poisson Superposition & Thinning', titleZh: '泊松过程叠加与稀疏化',
    summary: '合并独立事件流，或按独立标记把一条事件流拆开。',
    definition: '独立齐次泊松过程叠加后速率相加；对每次事件独立保留概率 p，得到速率 pλ 的泊松过程。',
    intuition: '两条独立到达流合并后更密集；随机挑走一部分事件后，剩下的流仍保持泊松结构。',
    prerequisites: ['poisson-process', 'conditional-probability'], formulaIds: ['poisson-rate-rules'], problemIds: ['combined-thinned-arrivals'],
    learningNotes: ['叠加结论要求事件流相互独立；仅知道两个边缘分布是泊松还不够。', '稀疏化中的保留决定须彼此独立，并与原过程独立；依赖时间或历史的筛选不能直接套固定速率公式。'],
  },
];

export const extensionFormulas: Formula[] = [
  {
    id: 'total-variance', courseId: 'probability', topicId: 'conditional-expectation', title: 'Law of total variance', titleZh: '全方差公式',
    latex: '\\operatorname{Var}(X)=E[\\operatorname{Var}(X\\mid G)]+\\operatorname{Var}(E[X\\mid G])',
    explanation: '总波动分成平均组内波动与组均值之间的波动。', conditions: 'X 的二阶矩有限，G 表示一个 σ-代数或条件信息；有限分组时按各组概率加权。',
  },
  {
    id: 'substitution-rule', courseId: 'calculus', topicId: 'integration-techniques', title: 'Substitution rule', titleZh: '定积分换元',
    latex: '\\int_a^b f(g(x))g^{\\prime}(x)\\,dx=\\int_{g(a)}^{g(b)}f(u)\\,du',
    explanation: '令 u=g(x)，连同微分和上下限一起变换。', conditions: 'g 在 [a,b] 上连续可微，f 在包含 g([a,b]) 的区间上连续，这是常用充分条件。',
  },
  {
    id: 'integration-by-parts', courseId: 'calculus', topicId: 'integration-techniques', title: 'Integration by parts', titleZh: '分部积分公式',
    latex: '\\int_a^b u v^{\\prime}\\,dx=[uv]_a^b-\\int_a^b u^{\\prime}v\\,dx',
    explanation: '把乘积的一部分从积分转移为求导，适合多项式与指数、三角函数的乘积。', conditions: 'u、v 在 [a,b] 上连续可微，这是常用充分条件。',
    derivation: [
      { title: '从乘积求导开始', body: '乘积的导数包含两项。', latex: '(uv)^{\\prime}=u^{\\prime}v+uv^{\\prime}' },
      { title: '两边在同一区间积分', body: '左侧用微积分基本定理变为边界项。', latex: '[uv]_a^b=\\int_a^b u^{\\prime}v\\,dx+\\int_a^b uv^{\\prime}\\,dx' },
      { title: '移项', body: '把较容易计算的积分移到右边，就得到分部积分公式。' },
    ],
  },
  {
    id: 'lagrange-multiplier', courseId: 'calculus', topicId: 'constrained-extrema', title: 'Lagrange multiplier condition', titleZh: '单约束乘子条件',
    latex: '\\nabla f(x)=\\lambda\\nabla g(x),\\quad g(x)=c',
    explanation: '正则约束上的极值候选点满足两个梯度平行。', conditions: 'f、g 在候选点附近连续可微，且 ∇g≠0；这是必要条件，不是充分条件。',
  },
  {
    id: 'diagonalization-power', courseId: 'linear-algebra', topicId: 'diagonalization', title: 'Powers of a diagonalizable matrix', titleZh: '对角化与矩阵幂',
    latex: 'A=PDP^{-1}\\quad\\Longrightarrow\\quad A^k=PD^kP^{-1}',
    explanation: 'P 的列是独立特征向量，D 的对角元是对应特征值。', conditions: 'A 在所选数域中可对角化，P 可逆；这里 k 是非负整数。',
  },
  {
    id: 'quadratic-form', courseId: 'linear-algebra', topicId: 'positive-definite', title: 'Quadratic form', titleZh: '二次型',
    latex: 'q(x)=x^{\\mathsf T}Ax,\\quad A=A^{\\mathsf T}',
    explanation: '实对称矩阵的特征值全部为正，当且仅当该二次型正定。', conditions: 'A 是实对称矩阵，x 是同维的实列向量。',
  },
  {
    id: 'sylvester-criterion', courseId: 'linear-algebra', topicId: 'positive-definite', title: 'Sylvester criterion', titleZh: '正定的顺序主子式判据',
    latex: 'A\\succ0\\quad\\Longleftrightarrow\\quad\\det(A_{1:k,1:k})>0,\\ k=1,\\ldots,n',
    explanation: '检查左上角依次增大的主子矩阵行列式是否全为正。', conditions: 'A 是 n×n 实对称矩阵。半正定不能直接把此处的 > 换成 ≥。',
  },
  {
    id: 'density-transformation', courseId: 'probability', topicId: 'variable-transformations', title: 'Density change of variables', titleZh: '单调变换的密度公式',
    latex: 'f_Y(y)=f_X(g^{-1}(y))\\left|\\frac{d}{dy}g^{-1}(y)\\right|',
    explanation: '反函数导数的绝对值补偿变换对区间长度的拉伸或压缩。', conditions: 'X 有密度，g 在相应取值区间严格单调且有可微反函数；在新变量取值范围内使用，端点可单独处理。',
    derivation: [
      { title: '先看递增变换', body: '当 g 递增时，Y≤y 与 X≤g⁻¹(y) 是同一个事件。', latex: 'F_Y(y)=F_X(g^{-1}(y))' },
      { title: '对分布函数求导', body: '链式法则给出密度与反函数导数的乘积。' },
      { title: '兼容递减情形', body: '递减变换会反转不等号，求导时负号被抵消，所以统一使用导数的绝对值。' },
    ],
  },
  {
    id: 'markov-inequality', courseId: 'probability', topicId: 'probability-inequalities', title: 'Markov inequality', titleZh: '马尔可夫不等式',
    latex: 'P(X\\ge a)\\le\\frac{E[X]}a',
    explanation: '仅由非负随机变量的均值就能给出上尾概率界。', conditions: 'X≥0，E[X]<∞，a>0。不要与马尔可夫链的马尔可夫性混淆。',
  },
  {
    id: 'chebyshev-inequality', courseId: 'probability', topicId: 'probability-inequalities', title: 'Chebyshev inequality', titleZh: '切比雪夫不等式',
    latex: 'P(|X-\\mu|\\ge a)\\le\\frac{\\sigma^2}{a^2}',
    explanation: '方差越小，远离均值的概率上界越小。', conditions: 'X 具有有限均值 μ 和有限方差 σ²，a>0；不需要正态分布假设。',
    derivation: [
      { title: '构造非负变量', body: '令 Y=(X−μ)²，它非负且期望是方差。', latex: 'E[Y]=E[(X-\\mu)^2]=\\sigma^2' },
      { title: '改写事件', body: '绝对偏差至少为 a，等价于平方偏差至少为 a²。', latex: 'P(|X-\\mu|\\ge a)=P(Y\\ge a^2)' },
      { title: '应用马尔可夫不等式', body: '把 Y 的期望除以阈值 a²，即得所需上界。', latex: 'P(Y\\ge a^2)\\le\\frac{E[Y]}{a^2}=\\frac{\\sigma^2}{a^2}' },
    ],
  },
  {
    id: 't-statistic', courseId: 'statistics', topicId: 'student-t-inference', title: 'Student t statistic', titleZh: 't 统计量',
    latex: 'T=\\frac{\\bar X-\\mu}{S/\\sqrt n}\\sim t_{n-1}',
    explanation: '在正态样本中，用样本标准差代替总体标准差后得到 t 分布。', conditions: 'n≥2，样本独立同分布于方差大于 0 的正态总体，S² 使用 n−1 分母。',
  },
  {
    id: 't-confidence', courseId: 'statistics', topicId: 'student-t-inference', title: 'Student t confidence interval', titleZh: '未知方差均值的 t 区间',
    latex: '\\bar x\\pm t_{n-1,1-\\alpha/2}\\frac{s}{\\sqrt n}',
    explanation: 't 下标的第二项表示分位数概率，第一项表示自由度。', conditions: '正态独立同分布样本、总体方差未知且大于 0、n≥2、0<α<1。非正态时此区间不再有精确覆盖保证。',
  },
  {
    id: 'pearson-chi-square', courseId: 'statistics', topicId: 'chi-square-goodness-of-fit', title: 'Pearson chi-square statistic', titleZh: 'Pearson 卡方统计量',
    latex: '\\chi^2=\\sum_{i=1}^k\\frac{(O_i-E_i)^2}{E_i}',
    explanation: '大样本下按卡方分布判断偏差是否过大。', conditions: '独立观测归入互斥且穷尽的 k 类，Eᵢ>0 且足够大。固定假设概率时自由度 k−1；若常规条件下由样本估计 r 个参数，自由度通常为 k−1−r。',
  },
  {
    id: 'symmetric-walk-moments', courseId: 'stochastic-process', topicId: 'random-walks', title: 'Symmetric walk moments', titleZh: '对称随机游走的均值与方差',
    latex: 'S_n=\\sum_{i=1}^n\\xi_i,\\quad E[S_n]=0,\\quad\\operatorname{Var}(S_n)=n',
    explanation: '无偏的步长使平均位置为 0，但不确定性随步数增加。', conditions: '从 0 出发，ξᵢ 独立，分别以 1/2 概率取 ±1。',
    derivation: [
      { title: '求一步的矩', body: '对称性给出均值为 0，平方恒为 1，因此方差为 1。', latex: 'E[\\xi_i]=0,\\quad E[\\xi_i^2]=1' },
      { title: '均值相加', body: '期望线性性不要求独立，每一步均值为 0。', latex: 'E[S_n]=\\sum_{i=1}^n E[\\xi_i]=0' },
      { title: '使用独立性加方差', body: '步长独立，协方差项为 0，所以总方差为 n。', latex: '\\operatorname{Var}(S_n)=\\sum_{i=1}^n\\operatorname{Var}(\\xi_i)=n' },
    ],
  },
  {
    id: 'poisson-rate-rules', courseId: 'stochastic-process', topicId: 'poisson-superposition', title: 'Poisson rate rules', titleZh: '叠加与稀疏化的速率',
    latex: '\\lambda_{\\mathrm{sum}}=\\lambda_1+\\lambda_2,\\quad\\lambda_{\\mathrm{kept}}=p\\lambda',
    explanation: '独立流叠加相加速率，独立保留事件则按保留概率缩小速率。', conditions: '原过程均为齐次泊松过程，叠加时相互独立；稀疏化标记独立同分布且与原过程独立，0≤p≤1。',
    derivation: [
      { title: '固定时间观察计数', body: '时长 t 内两条流的计数是独立的泊松变量。' },
      { title: '用生成函数合并计数', body: '独立和的概率生成函数相乘，结果仍是泊松形式。', latex: 'e^{\\lambda_1t(z-1)}e^{\\lambda_2t(z-1)}=e^{(\\lambda_1+\\lambda_2)t(z-1)}' },
      { title: '保留标记并检查增量', body: '给定 N(t)，保留数是 Binomial(N(t),p)，生成函数化为速率 pλ 的泊松形式。独立增量也由原过程与独立标记保留。', latex: 'E[(1-p+pz)^{N(t)}]=e^{p\\lambda t(z-1)}' },
    ],
  },
];

export const extensionProblems: Problem[] = [
  {
    id: 'integrate-x-exp', courseId: 'calculus', topicId: 'integration-techniques', title: '分部积分求指数乘积', difficulty: 2,
    prompt: '计算定积分 ∫₀¹ x eˣ dx，并通过求导检查原函数。', formulas: ['\\int u\\,dv=uv-\\int v\\,du'],
    hints: ['让 u=x，dv=eˣdx。'],
    steps: [
      { title: '选择 u 与 dv', body: 'u=x 的导数为 1，v=eˣ。', latex: 'u=x,\\quad du=dx,\\quad v=e^x' },
      { title: '求原函数并检查', body: '原函数为 (x−1)eˣ；乘积求导后正好得到 xeˣ。', latex: '\\int xe^x\\,dx=(x-1)e^x+C' },
      { title: '代入上下限', body: '上端值为 0，下端值为 −1，因此定积分为 1。', latex: '[(x-1)e^x]_0^1=0-(-1)=1' },
    ], answer: '定积分为 1；可取原函数 (x−1)eˣ。',
  },
  {
    id: 'circle-product-extrema', courseId: 'calculus', topicId: 'constrained-extrema', title: '单位圆上的乘积极值', difficulty: 3,
    prompt: '在约束 x²+y²=1 下，求 f(x,y)=xy 的最大值与最小值。', formulas: ['\\nabla f=\\lambda\\nabla g'],
    hints: ['建立 y=2λx 与 x=2λy。', '用 (x±y)²≥0 验证结果。'],
    steps: [
      { title: '建立乘子方程', body: '约束梯度 (2x,2y) 在单位圆上从不为 0。', latex: 'y=2\\lambda x,\\quad x=2\\lambda y,\\quad x^2+y^2=1' },
      { title: '求候选点', body: 'x、y 都非零，代回方程得到 4λ²=1。于是 y=x 或 y=−x，坐标绝对值均为 1/√2。' },
      { title: '比较并作全局验证', body: '同号点给出 1/2，异号点给出 −1/2；由两种平方非负也能直接得到 −1/2≤xy≤1/2。', latex: '-\\frac12\\le xy\\le\\frac12' },
    ], answer: '最大值 1/2，在 (±1/√2,±1/√2) 的同号点取得；最小值 −1/2，在异号点取得。',
  },
  {
    id: 'symmetric-matrix-square', courseId: 'linear-algebra', topicId: 'diagonalization', title: '用对角化计算矩阵平方', difficulty: 3,
    prompt: '对 A=[[2,1],[1,2]] 找一组正交特征向量，并利用对角化求 A²。', formulas: ['A^2=PD^2P^{-1}'], hints: ['考虑方向 (1,1) 和 (1,−1)。'],
    steps: [
      { title: '找到特征方向', body: '(1,1) 对应特征值 3，(1,−1) 对应特征值 1。' },
      { title: '归一化组成 P', body: '这两个向量正交且长度为 √2，归一化后 P⁻¹=Pᵀ。', latex: 'P=\\frac1{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix},\\quad D=\\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}' },
      { title: '对角元平方再变回', body: 'D² 的对角元为 9 和 1，乘回原坐标。', latex: 'A^2=PD^2P^{\\mathsf T}=\\begin{pmatrix}5&4\\\\4&5\\end{pmatrix}' },
    ], answer: '正交特征向量为 (1,1)/√2、(1,−1)/√2；A²=[[5,4],[4,5]]。',
  },
  {
    id: 'positive-definite-two-by-two', courseId: 'linear-algebra', topicId: 'positive-definite', title: '两种方法判断正定', difficulty: 2,
    prompt: '判断实对称矩阵 A=[[2,1],[1,2]] 是否正定，并用配方再次验证。', formulas: ['q(x,y)=2x^2+2xy+2y^2'], hints: ['计算左上角的 1 阶和 2 阶顺序主子式。'],
    steps: [
      { title: '检验对称性', body: 'Aᵀ=A，因此可以使用实对称矩阵的正定判据。' },
      { title: '检查顺序主子式', body: '第一个为 2>0，第二个为 4−1=3>0，故 A 正定。' },
      { title: '二次型配方', body: '非零 (x,y) 时，下面三个平方不可能同时为 0。', latex: 'q(x,y)=(x+y)^2+x^2+y^2>0' },
    ], answer: 'A 正定；两个顺序主子式分别为 2、3。',
  },
  {
    id: 'uniform-square-density', courseId: 'probability', topicId: 'variable-transformations', title: '均匀变量平方后的密度', difficulty: 3,
    prompt: '设 X~Uniform(0,1)，Y=X²。求 Y 的分布函数和密度，并检查密度总积分。', formulas: ['F_Y(y)=P(Y\\le y)'], hints: ['在 0<y<1 时，X²≤y 等价于 X≤√y。'],
    steps: [
      { title: '确认取值范围', body: 'Y 位于 (0,1)。y≤0 时分布函数为 0，y≥1 时为 1。' },
      { title: '在内部求分布函数', body: '均匀变量的区间概率等于长度。', latex: 'F_Y(y)=P(X\\le\\sqrt y)=\\sqrt y,\\quad0<y<1' },
      { title: '求导并检查归一化', body: '在 (0,1) 上密度为 1/(2√y)，其他区域密度为 0，端点取值不影响概率。', latex: '\\int_0^1\\frac1{2\\sqrt y}\\,dy=1' },
    ], answer: 'Fᵧ(y) 在 y≤0、0<y<1、y≥1 时依次为 0、√y、1；密度在 (0,1) 为 1/(2√y)，其余处为 0。',
  },
  {
    id: 'chebyshev-deviation-bound', courseId: 'probability', topicId: 'probability-inequalities', title: '只知道方差时的偏差上界', difficulty: 2,
    prompt: '已知 E[X]=10、Var(X)=4，但不知道分布。给出 P(|X−10|≥6) 的上界，并说明是否为精确概率。',
    formulas: ['P(|X-\\mu|\\ge a)\\le\\frac{\\sigma^2}{a^2}'], hints: ['这里 a=6，分子用方差 4 而不是标准差 2。'],
    steps: [
      { title: '确认可用信息', body: '均值与方差都有限，切比雪夫不等式不要求 X 是正态变量。' },
      { title: '代入阈值', body: '把方差除以偏差阈值的平方。', latex: 'P(|X-10|\\ge6)\\le\\frac4{36}=\\frac19' },
      { title: '解释上界', body: '概率最多为 1/9，但具体分布未知，不能断言实际概率恰好是 1/9。' },
    ], answer: '上界为 1/9（约 0.1111），它不是由现有信息确定的精确概率。',
  },
  {
    id: 'small-sample-t-interval', courseId: 'statistics', topicId: 'student-t-inference', title: '小样本的 t 置信区间', difficulty: 3,
    prompt: '正态总体方差未知。独立样本量 n=9，样本均值 20，样本标准差 s=3。用 t₈,₀.₉₇₅≈2.306 构造均值的 95% 置信区间。',
    formulas: ['\\bar x\\pm t_{n-1,0.975}\\frac{s}{\\sqrt n}'], hints: ['自由度是 8，标准误是 3/√9。'],
    steps: [
      { title: '选择分布与自由度', body: 'σ 未知、正态样本，因此使用自由度 9−1=8 的 t 分布。' },
      { title: '计算标准误与半宽', body: '标准误为 1，区间半宽为 2.306。', latex: '\\frac s{\\sqrt n}=1,\\quad2.306\\times1=2.306' },
      { title: '构造并解释区间', body: '均值两侧加减半宽。95% 描述反复使用该构造程序时的覆盖率，而不是已固定参数的随机概率。', latex: '(20-2.306,20+2.306)=(17.694,22.306)' },
    ], answer: '95% 置信区间约为 (17.694,22.306)。',
  },
  {
    id: 'three-category-chi-square', courseId: 'statistics', topicId: 'chi-square-goodness-of-fit', title: '三类计数的卡方检验', difficulty: 3,
    prompt: '60 次独立观测分为三类，计数为 (30,20,10)。检验三类概率均为 1/3，在 5% 水平使用自由度 2 的临界值 5.991。',
    formulas: ['\\chi^2=\\sum_i\\frac{(O_i-E_i)^2}{E_i}'], hints: ['每一类的期望计数都是 20，没有由数据拟合额外参数。'],
    steps: [
      { title: '计算期望与自由度', body: '各期望计数为 60/3=20，满足常见大样本经验规则；自由度为 3−1=2。' },
      { title: '累加标准化平方偏差', body: '中间类别没有偏差，另外两类各贡献 5。', latex: '\\chi^2=\\frac{(30-20)^2}{20}+0+\\frac{(10-20)^2}{20}=10' },
      { title: '比较右尾临界值', body: '10>5.991，在 5% 水平拒绝均匀类别概率假设。这不表示任意一个具体替代分布已被证明。' },
    ], answer: 'χ²=10，自由度 2，按卡方近似在 5% 水平拒绝 H₀。',
  },
  {
    id: 'four-step-return', courseId: 'stochastic-process', topicId: 'random-walks', title: '四步随机游走回到原点', difficulty: 2,
    prompt: '从 0 出发的简单对称随机游走每步独立取 ±1。求四步后回到 0 的概率，并求 S₄ 的方差。',
    formulas: ['S_4=\\xi_1+\\xi_2+\\xi_3+\\xi_4'], hints: ['回到原点恰好要求两步向右、两步向左。'],
    steps: [
      { title: '计数返回路径', body: '从四个位置中选两个为 +1，共 C(4,2)=6 条路径。' },
      { title: '计算返回概率', body: '16 条步长序列等概率。', latex: 'P(S_4=0)=\\frac{\\binom42}{2^4}=\\frac38' },
      { title: '把步长方差相加', body: '每步均值为 0，方差为 1，独立性使协方差项消失。', latex: '\\operatorname{Var}(S_4)=4' },
    ], answer: '返回概率为 3/8；S₄ 的方差为 4。',
  },
  {
    id: 'combined-thinned-arrivals', courseId: 'stochastic-process', topicId: 'poisson-superposition', title: '合并再筛选的到达流', difficulty: 3,
    prompt: '两条独立齐次泊松到达流的速率分别为每分钟 2、3 次。合并后独立保留每个事件的概率为 0.4。求保留流两分钟内恰有一次事件的概率。',
    formulas: ['P(N(t)=k)=e^{-\\lambda t}\\frac{(\\lambda t)^k}{k!}'], hints: ['先相加速率，再乘保留概率，最后乘观察时长。'],
    steps: [
      { title: '合并速率', body: '独立流叠加，合并速率为每分钟 5 次。' },
      { title: '保留事件', body: '独立稀疏化后速率为 0.4×5=2 次/分钟，两分钟的计数参数为 4。' },
      { title: '代入泊松概率', body: '用 λt=4 而不是速率 2 作为计数参数。', latex: 'P(N(2)=1)=4e^{-4}\\approx0.0733' },
    ], answer: '保留速率为每分钟 2 次；所求概率为 4e⁻⁴≈0.0733。',
  },
  {
    id: 'composite-exponential-derivative', courseId: 'calculus', topicId: 'derivatives', title: '指数复合函数的链式求导', difficulty: 2,
    prompt: '求 f(x)=e^(x²) 的导数，并说明为何不能只写 e^(x²)。', formulas: ['(e^{g(x)})^{\\prime}=e^{g(x)}g^{\\prime}(x)'],
    hints: ['分清外层函数 eᵘ 和内层函数 x²。'],
    steps: [
      { title: '拆分内外层', body: '外层对 u 的导数为 eᵘ，内层对 x 的导数为 2x。' },
      { title: '相乘', body: '把内层值代入外层导数，再乘内层导数。', latex: 'f^{\\prime}(x)=2xe^{x^2}' },
      { title: '检查易错点', body: '只写 e^(x²) 会漏掉内层变化率；例如 x=0 时正确导数为 0 而不是 1。' },
    ], answer: 'f′(x)=2xe^(x²)。',
  },
  {
    id: 'projection-orthogonal-residual', courseId: 'linear-algebra', topicId: 'orthogonality', title: '投影后的残差为什么正交', difficulty: 2,
    prompt: '把 v=(3,1) 投影到 u=(1,1) 张成的直线上，求投影 p 和残差 r=v−p，并验证 r⊥u。',
    formulas: ['p=\\frac{v\\cdot u}{u\\cdot u}u'], hints: ['先算点积，再检查残差的点积。'],
    steps: [
      { title: '计算投影系数', body: 'v·u=4，u·u=2，所以系数为 2。' },
      { title: '计算投影与残差', body: 'p=2u=(2,2)，r=(3,1)−(2,2)=(1,−1)。' },
      { title: '验证正交', body: '残差与投影方向的点积为 0。', latex: 'r\\cdot u=1-1=0' },
    ], answer: 'p=(2,2)，r=(1,−1)，且 r⊥u。',
  },
  {
    id: 'die-total-variance', courseId: 'probability', topicId: 'conditional-expectation', title: '按奇偶分组重建骰子方差', difficulty: 4,
    prompt: '公平六面骰子的点数为 X，G 表示点数奇偶性。利用 Var(X)=E[Var(X|G)]+Var(E[X|G]) 计算 Var(X)。',
    formulas: ['\\operatorname{Var}(X)=E[\\operatorname{Var}(X\\mid G)]+\\operatorname{Var}(E[X\\mid G])'],
    hints: ['奇数组为 {1,3,5}，偶数组为 {2,4,6}。', '先分别求每组均值与方差，再考虑两个组均值的波动。'],
    steps: [
      { title: '组内均值与方差', body: '奇数组均值 3，偶数组均值 4。两组的离均差都为 −2、0、2，故组内方差均为 8/3。' },
      { title: '组均值的方差', body: '条件均值以各 1/2 的概率取 3 或 4，整体均值为 3.5，方差为 1/4。', latex: '\\operatorname{Var}(E[X\\mid G])=\\frac12(3-3.5)^2+\\frac12(4-3.5)^2=\\frac14' },
      { title: '相加两种波动', body: '总方差等于平均组内方差与组均值方差之和。', latex: '\\operatorname{Var}(X)=\\frac83+\\frac14=\\frac{35}{12}' },
    ], answer: 'Var(X)=35/12；这里必须使用每组真实概率分布的方差，而不是 n−1 分母的样本方差。',
  },
  {
    id: 'beta-predictive-probability', courseId: 'statistics', topicId: 'bayesian-inference', title: '后验分布预测下一次正面', difficulty: 3,
    prompt: '硬币正面概率 p 的后验为 Beta(3,2)，给定 p 的下一次投掷为 Bernoulli(p)。求下一次正面的后验预测概率。',
    formulas: ['P(Y=1\\mid D)=E[p\\mid D]'], hints: ['Beta(a,b) 的均值为 a/(a+b)。'],
    steps: [
      { title: '保留参数不确定性', body: '预测概率应对整个后验分布积分，而不是随意选一个 p。' },
      { title: '用全期望公式', body: '给定 p 时正面概率为 p，因此后验预测概率等于 p 的后验均值。', latex: 'P(Y=1\\mid D)=\\int_0^1 p\\,f(p\\mid D)\\,dp' },
      { title: '计算 Beta 均值', body: '代入 a=3、b=2。', latex: 'E[p\\mid D]=\\frac3{3+2}=0.6' },
    ], answer: '下一次正面的后验预测概率为 0.6。',
  },
  {
    id: 'brownian-square-martingale', courseId: 'stochastic-process', topicId: 'martingales', title: '布朗运动平方减时间是鞅', difficulty: 4,
    prompt: '设 W 为标准布朗运动，ℱₜ 为其自然滤过。证明 Mₜ=Wₜ²−t 是关于 ℱₜ 的鞅。',
    formulas: ['E[M_t\\mid\\mathcal F_s]=M_s,\\quad0\\le s\\le t'], hints: ['写成 Wₜ=Wₛ+(Wₜ−Wₛ)。', '增量独立于 ℱₛ，均值为 0，二阶矩为 t−s。'],
    steps: [
      { title: '适应性与可积性', body: 'Mₜ 由时刻 t 的信息确定；E[|Mₜ|]≤E[Wₜ²]+t=2t<∞。' },
      { title: '展开平方的条件期望', body: '交叉项条件期望为 0，增量平方的条件期望为 t−s。', latex: 'E[W_t^2\\mid\\mathcal F_s]=W_s^2+(t-s)' },
      { title: '减去确定性时间项', body: '剩余正好是较早时刻的 Mₛ。', latex: 'E[M_t\\mid\\mathcal F_s]=W_s^2+(t-s)-t=W_s^2-s=M_s' },
    ], answer: 'Mₜ 适应、可积，且满足条件期望等于 Mₛ，所以是鞅。',
  },
];

// Metadata checked against arXiv on 2026-10-04. Dates are first submission dates.
// Abstracts below are original Chinese summaries, not full-text reproductions.
export const extensionPapers: Paper[] = [
  {
    id: 'arxiv-2506-16457', title: 'Scientific Applications Leveraging Randomized Linear Algebra',
    authors: 'Vivak Patel, D. Adrian Maldonado, Maksim Melnichenko, et al.', category: 'Numerical Analysis', publishedAt: '2025-06-19',
    abstract: '以成像、基因组学和动力系统中的大型矩阵为背景，讨论随机化线性代数如何应对内存、数据访问和计算成本瓶颈，以及后续研究方向。',
    tags: ['Randomized Linear Algebra', 'Applications', 'Large Matrices'], source: 'arXiv:2506.16457', url: 'https://arxiv.org/abs/2506.16457',
    topicIds: ['svd', 'qr-decomposition', 'matrices'],
    readingGuide: '先复习 SVD 与 QR，理解为什么完整矩阵分解代价很高，再从一个应用场景读起。重点比较近似误差与计算成本；这是应用报告，不是完整的入门教材。',
  },
  {
    id: 'arxiv-2406-06851', title: 'Unbiased Markov Chain Monte Carlo: what, why, and how',
    authors: 'Yves F. Atchadé, Pierre E. Jacob', category: 'Statistics', publishedAt: '2024-06-10',
    abstract: '面向已有 MCMC 使用经验的读者，介绍消除初始化或预热偏差的方法，并讨论对并行计算、收敛诊断与性能评价的影响。',
    tags: ['MCMC', 'Unbiased Estimation', 'Coupling'], source: 'arXiv:2406.06851', url: 'https://arxiv.org/abs/2406.06851',
    topicIds: ['markov-chains', 'stationary-distributions', 'estimation'],
    readingGuide: '先阅读已有 MCMC 概念导论，再区分有限时长初始化偏差与估计的随机误差。耦合方法需要额外背景，可以先看动机和方法示意，再读理论结果。',
  },
  {
    id: 'arxiv-2011-02258', title: 'Concentration Inequalities for Statistical Inference',
    authors: 'Huiming Zhang, Song Xi Chen', category: 'Statistics Theory', publishedAt: '2020-11-04',
    abstract: '综述统计推断中的非渐近集中不等式，涵盖多种尾部条件，并讨论高维线性与泊松回归中的应用。',
    tags: ['Concentration', 'Non-asymptotic', 'Statistical Inference'], source: 'arXiv:2011.02258', url: 'https://arxiv.org/abs/2011.02258',
    topicIds: ['probability-inequalities', 'law-large-numbers', 'regression'],
    readingGuide: '从切比雪夫的有限方差界开始，比较额外尾部假设能带来什么更强的界。阅读时逐一记录变量是否独立、尾部类型以及常数，不要把不同前提下的结论直接替换。',
  },
  {
    id: 'arxiv-2002-01387', title: 'Randomized Numerical Linear Algebra: Foundations & Algorithms',
    authors: 'Per-Gunnar Martinsson, Joel Tropp', category: 'Numerical Analysis', publishedAt: '2020-02-04',
    abstract: '系统介绍概率型矩阵算法的理论与实践，包括低秩近似、随机嵌入、回归、矩阵分解和误差估计。',
    tags: ['Randomized Linear Algebra', 'Low-rank Approximation', 'Survey'], source: 'arXiv:2002.01387', url: 'https://arxiv.org/abs/2002.01387',
    topicIds: ['svd', 'positive-definite', 'regression', 'probability-inequalities'],
    readingGuide: '先复习 SVD、最小二乘和概率上界，再选读低秩近似部分。先明确算法输出近似了什么，再看误差控制；全文较长，适合按主题分段阅读。',
  },
];

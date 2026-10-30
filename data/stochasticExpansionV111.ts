import type { Formula, Problem, Topic } from '@/types';
import { roadmapTopicId as id } from './curriculumRoadmap';
type Exercise = Omit<Problem, 'id' | 'courseId' | 'topicId' | 'formulas' | 'source'>;
type Lesson = Omit<Topic, 'id' | 'courseId' | 'formulaIds' | 'problemIds'> & { key: string; formula: Omit<Formula, 'id' | 'courseId' | 'topicId'>; exercises: Exercise[] };
const ex = (title: string, prompt: string, hint: string, steps: [string, string][], answer: string, difficulty: Problem['difficulty'] = 3): Exercise => ({ title, prompt, hints: [hint], steps: steps.map(([title, body]) => ({ title, body })), answer, difficulty });
const courseId = 'stochastic-process' as const;
const lessons: Lesson[] = [
  {
    key: 'index-state', title: 'Index Sets and State Spaces', titleZh: '时间指标与状态空间',
    summary: '什么时候观察与观察值能取什么，是两个不同维度。',
    definition: '随机过程是在同一概率空间上按指标 t∈T 排列的一族随机变量 X_t。T 是指标集，S 是各随机变量的状态空间；二者可分别为离散或连续。连续时间并不意味着数值连续，离散状态也不意味着时间离散。若讨论路径连续性，还需另行说明随时间变化的性质。',
    intuition: '横轴决定观察的时刻，纵轴决定可能看到的数值。',
    prerequisites: ['random-variables'], learningNotes: ['连续时间计数过程的状态可以是非负整数。', '“连续状态”与“样本路径连续”不是同一条件，例如带跳跃的实值过程。'],
    formula: { title: 'A family of random variables', titleZh: '过程作为随机变量族', latex: 'X_t:\\Omega\\longrightarrow S,\\quad t\\in T', conditions: '各 X_t 在共同概率空间上为可测映射；T 为指标集，S 为带有指定可测结构的状态空间。', explanation: '固定 t 得到一个随机变量，固定样本结果得到一条路径。' },
    exercises: [
      ex('连续时间的离散状态', 'N(t) 记录从 0 到 t 分钟进入图书馆的总人数，允许在任意 t≥0 观察。写出指标集与一个自然状态空间。', '观察时刻可连续取值，人数必须是整数。', [['指标集', 'T=[0,∞)，时间以分钟计但不限制为整数分钟。'], ['状态空间', '可取 S={0,1,2,…}，它是离散状态空间；这属于连续时间、离散状态过程。']], 'T=[0,∞)，S={0,1,2,…}。', 2),
      ex('每天一次的连续测量', '每天中午测量同一地点的温度，X_n 是第 n 天的实数温度。它是连续时间过程吗？', '连续测量值不等于连续观察时间。', [['指标', 'n=1,2,…，观测指标为离散集合。'], ['状态', '温度可用实数表示，状态空间取 R；这是离散时间、连续状态过程。']], '不是；它是离散时间、连续状态过程。', 2),
    ],
  },
  {
    key: 'sample-paths', title: 'Sample Paths and Time Sections', titleZh: '样本路径与随机变量截面',
    summary: '固定随机结果得到曲线，固定时间得到随机变量。',
    definition: '过程可以写成 X(t,ω)。对固定 ω，t↦X(t,ω) 是样本路径；对固定 t，ω↦X(t,ω) 是该时刻的随机变量。路径反映一次实现的时间变化，边缘分布描述在同一时刻跨不同实现的变异，两种观察不能相互混同。',
    intuition: '一条录像是一个样本路径，同一秒钟的很多次录像画面构成一个截面。',
    prerequisites: [id(courseId, 'index-state')], learningNotes: ['一条路径的平均值未必等于同一时刻的总体期望。', '看到每条路径都连续，也不能推断不同时刻独立。'],
    formula: { title: 'Random-slope process', titleZh: '随机斜率的截面和路径', latex: 'X(t,\\omega)=tZ(\\omega),\\quad E[X_t]=tE[Z]', conditions: 't≥0，Z 是同一概率空间上的可积随机变量。', explanation: '每次实现先选定一个斜率，再沿这条直线随时间前进。' },
    exercises: [
      ex('先选一次斜率', 'Z 等概率取 −1 或 1，X_t=tZ。写出两类样本路径及 X_2 的分布。', '整个过程共用同一个 Z。', [['路径', 'Z=1 时路径是 t，Z=−1 时路径是 −t，均为连续直线。'], ['截面', 't=2 时 X_2 等概率取 −2、2，期望为 0。']], '路径为 t 或 −t；X_2 以各 1/2 概率取 −2、2。', 2),
      ex('同一路径上的两个值', '仍取 X_t=tZ，Z 等概率为 ±1。求 P(X_2=2|X_1=1)，并判断 X_1、X_2 是否独立。', 'X_1=1 已经确定了斜率。', [['条件化', 'X_1=1 意味着 Z=1，所以 X_2=2 的条件概率为 1。'], ['比较边缘', 'P(X_2=2)=1/2，与条件概率不同，因此两个截面不独立。']], '条件概率 1；X_1、X_2 不独立。'),
    ],
  },
  {
    key: 'finite-dimensional', title: 'Finite-dimensional Distributions', titleZh: '有限维分布',
    summary: '单个时刻的分布还不够，需要描述多个时刻如何共同变化。',
    definition: '选取任意有限多个时刻 t1,…,tk，向量 (X_t1,…,X_tk) 的联合分布称为有限维分布。所有这些分布共同描述过程在有限观测中的概率结构；仅给每个时刻的边缘分布不能确定依赖关系。涉及连续路径等额外性质时，还需要合适的路径空间或正则性条件。',
    intuition: '知道每一张照片的颜色比例，不代表知道前后照片之间如何关联。',
    prerequisites: [id(courseId, 'sample-paths'), 'joint-density-independence'], learningNotes: ['同样的一维边缘可以来自完全独立或完全相关的过程。', '给定的联合分布族必须在删去时刻、交换顺序时保持一致。'],
    formula: { title: 'Joint distribution at selected times', titleZh: '有限时刻的联合分布函数', latex: 'F_{t_1,\\ldots,t_k}(x_1,\\ldots,x_k)=P(X_{t_1}\\le x_1,\\ldots,X_{t_k}\\le x_k)', conditions: '实值过程，k 为任意正整数，各 t_j 属于指标集。', explanation: '联合分布保存了各时刻之间的依赖信息。' },
    exercises: [
      ex('边缘一样，联合不同', 'A_n 为独立公平 0/1 变量；B_n=Z，其中 Z 是一个公平 0/1 变量。比较 P(A_1=1,A_2=1) 与 P(B_1=1,B_2=1)。', '第二个过程的所有时刻共用一次抽样。', [['独立过程', 'P(A_1=1,A_2=1)=(1/2)²=1/4。'], ['常值过程', 'B_1=B_2=Z，两个同时为 1 等价于 Z=1，概率为 1/2；尽管各时刻边缘都公平。']], '分别为 1/4 和 1/2。'),
      ex('从联合分布恢复边缘', 'P(X=0,Y=0)=0.1，P(0,1)=0.2，P(1,0)=0.3，P(1,1)=0.4。求 P(X=1) 与 P(Y=1|X=1)。', '先沿 Y 的两种取值求和。', [['边缘', 'P(X=1)=0.3+0.4=0.7。'], ['条件', 'P(Y=1|X=1)=0.4/0.7=4/7。']], 'P(X=1)=0.7；条件概率为 4/7。', 2),
    ],
  },
  {
    key: 'stationary-increments', title: 'Stationary Increments', titleZh: '平稳增量',
    summary: '相同长度时间段的变化量同分布，过程的绝对水平仍可能改变。',
    definition: '本页按增量区间分布定义：对 t,h≥0，X_(t+h)−X_t 的分布只依赖长度 h，不依赖起点 t，称具有平稳增量。这不等于 X_t 自身的分布与 t 无关，也不蕴含不同区间的增量独立。应用时要把过程的平稳性、增量的平稳性、增量独立性分开核对。',
    intuition: '每隔同样长时间看变化，其统计规则一样，但累计高度可以越来越大。',
    prerequisites: [id(courseId, 'finite-dimensional')], learningNotes: ['泊松过程与布朗运动有平稳增量，却不是以零为起点的平稳水平过程。', '共同随机斜率可以产生平稳增量，但把所有区间绑定在一起。'],
    formula: { title: 'Stationary increment distributions', titleZh: '同长度增量同分布', latex: 'X_{t+h}-X_t\\overset{d}{=}X_h-X_0,\\quad t,h\\ge0', conditions: '实值过程以 [0,∞) 为时间指标；等号上方 d 表示分布相同，不表示逐路径相等。', explanation: '右侧选起点零作为参照，但没有要求 X_0 必为零。' },
    exercises: [
      ex('计数的高度会变，增量规则不变', 'N(t) 为速率 2 的齐次泊松过程。比较 N(5)−N(3) 与 N(9)−N(7) 的分布，并判断 N(t) 是否为平稳过程。', '区间长度均为 2，绝对计数的期望为 2t。', [['增量', '两增量均服从 Poisson(4)，所以这两个区间的变化同分布。'], ['水平', 'E[N(t)]=2t 随 t 改变，N(0)=0 而 N(1) 随机，因此过程本身不平稳。']], '两增量均为 Poisson(4)；N(t) 本身不平稳。'),
      ex('平稳增量不保证独立', 'Z 等概率取 ±1，X_t=tZ。判断增量是否平稳，并计算 [0,1] 与 [1,2] 两段增量的协方差。', '每段单位长度增量都是同一个 Z。', [['平稳', 'X_(t+h)−X_t=hZ，分布只与 h 有关。'], ['依赖', '两个单位增量都是 Z，协方差 Var(Z)=1，因而不独立。']], '有平稳增量；两单位增量协方差为 1，不独立。'),
    ],
  },
  {
    key: 'strict-stationarity', title: 'Strict and Weak Stationarity', titleZh: '严格平稳与宽平稳',
    summary: '严格平稳保持全部有限维分布，宽平稳只约束一二阶矩。',
    definition: '严格平稳要求任意有限时刻向量整体平移后联合分布不变，只允许平移后的时刻仍在指标集内。宽平稳要求二阶矩有限、均值为常数且协方差仅依赖时差。严格平稳且有有限二阶矩可推出宽平稳；缺少矩条件时不能推出。一般宽平稳也不自动给出严格平稳。',
    intuition: '严格平稳像整段影片的概率规律不随播放起点改变，宽平稳只比较均值和二阶关联。',
    prerequisites: [id(courseId, 'finite-dimensional'), 'weak-stationarity-spectrum'], learningNotes: ['不能只用每时刻同分布证明严格平稳，仍须联合分布保持。', '高斯过程在宽平稳条件下可推出严格平稳，这依赖联合高斯结构。'],
    formula: { title: 'Strict stationarity', titleZh: '整体时间平移保持联合分布', latex: '(X_{t_1+h},\\ldots,X_{t_k+h})\\overset{d}{=}(X_{t_1},\\ldots,X_{t_k})', conditions: '任意有限 k、任意时刻及所有允许的共同平移 h；等式要求联合分布相同。', explanation: '一维边缘只是 k=1 的特殊情况。' },
    exercises: [
      ex('所有时刻同一个随机值', 'Z 等概率取 ±1，X_n=Z，n∈Z。判断严格平稳、宽平稳，并给出均值与协方差。', '任意时刻向量都只是 Z 的重复。', [['严格平稳', '整体移动时刻不会改变向量 (Z,…,Z)，所以严格平稳。'], ['二阶矩', '均值为 0，Cov(X_n,X_m)=1，只依赖时差（事实上恒定），且二阶矩有限，所以宽平稳。']], '严格平稳且宽平稳；均值 0，协方差恒为 1。'),
      ex('二阶规则一样但边缘不同', '各 X_n 相互独立：偶数 n 时等概率取 ±1，奇数 n 时服从标准正态。判断宽平稳和严格平稳。', '两类边缘均值 0、方差 1，但分布不同。', [['宽平稳', '均值恒为 0，同一时刻协方差 1，不同时刻独立故协方差 0，只依赖时差。'], ['不严格平稳', '平移一个单位把离散 ±1 分布变成连续正态分布，连一维分布都不保持。']], '宽平稳，但不严格平稳。', 4),
    ],
  },
  {
    key: 'gaussian-process', title: 'Defining Gaussian Processes', titleZh: '高斯过程的确定方式',
    summary: '每个有限时刻向量必须联合高斯，单点正态远远不够。',
    definition: '高斯过程要求任意有限时刻的实线性组合都服从一维正态分布，允许方差为零的退化正态。这等价于所有有限时刻向量联合高斯。均值函数与协方差函数决定它的有限维分布；作为协方差的候选函数还必须对称且半正定，不能任意指定。',
    intuition: '不仅每个单独切片呈钟形，跨时刻的每个线性方向也要满足正态结构。',
    prerequisites: [id(courseId, 'finite-dimensional'), 'covariance-correlation'], learningNotes: ['联合高斯的零协方差可推出独立，只有边缘正态时不能这样推。', '协方差矩阵可奇异，此时联合高斯可能没有通常的多维密度，但仍是合法分布。'],
    formula: { title: 'Variance of a Gaussian linear combination', titleZh: '高斯线性组合的分布', latex: '\\sum_{j=1}^ka_jX_{t_j}\\sim N\\!\\left(\\sum_ja_jm(t_j),\\sum_{i,j}a_ia_jC(t_i,t_j)\\right)', conditions: 'X 为实高斯过程，a_j 为实常数；右侧方差为零时解释为确定常数。', explanation: '均值与协方差给出每个线性方向的分布。' },
    exercises: [
      ex('随机直线是退化高斯过程', 'Z 为标准正态，X_t=tZ。证明它是高斯过程，并求均值、协方差及 X_2−2X_1 的分布。', '任意线性组合仍为 Z 的常数倍。', [['联合高斯', 'Σa_jX_tj=(Σa_jt_j)Z，为正态或恒零，故过程高斯。'], ['参数', 'm(t)=0，C(s,t)=st，X_2−2X_1=0，分布为退化 N(0,0)。']], '高斯过程；m(t)=0，C(s,t)=st；差恒为 0。'),
      ex('边缘正态却不是联合高斯', 'Z 为标准正态，S 独立于 Z 且等概率取 ±1。令 X=Z、Y=SZ。说明 X、Y 都标准正态且不相关，但不是联合高斯。', '检查 X+Y 在零点是否有正概率。', [['边缘和协方差', '正态分布关于零对称，所以 SZ 仍标准正态；E(XY)=E(S)E(Z²)=0。'], ['线性组合', 'S=−1 时 X+Y=0，S=1 时为 2Z，因此其零点概率为 1/2，同时方差为 2。它既非非退化正态也非恒定，故不是联合高斯。']], '两者标准正态且协方差 0；X+Y 在 0 有概率 1/2，因此不是联合高斯。', 4),
    ],
  },
  {
    key: 'mean-square', title: 'Mean-square Continuity', titleZh: '均方连续',
    summary: '相邻时刻差的平方期望趋零，是一种二阶意义的连续性。',
    definition: '若二阶过程满足 E|X_(t+h)−X_t|²→0，则称在 t 均方连续，趋近只取指标集允许的时刻。它关注整体平方误差，蕴含依概率连续，但不能单凭此定义断言选定版本的每条样本路径连续。检验时应展开二阶矩，不能只比较均值是否连续。',
    intuition: '时间很接近时，跨很多次实现平均计算的平方差也很小。',
    prerequisites: [id(courseId, 'sample-paths'), 'expectation-variance'], learningNotes: ['均值相等并不保证随机变量接近，仍需控制差的二阶矩。', '泊松过程可均方连续，同时样本路径仍有跳跃。'],
    formula: { title: 'Second-moment continuity criterion', titleZh: '均方连续的二阶展开', latex: 'E[(X_s-X_t)^2]=E[X_s^2]+E[X_t^2]-2E[X_sX_t]\\longrightarrow0', conditions: '实值二阶过程，s→t 且 s 在指标集内；各期望均有限。', explanation: '两个平方项与交叉项共同决定相邻截面的接近程度。' },
    exercises: [
      ex('布朗运动的均方连续', 'B_t 为标准布朗运动，证明它均方连续。', '利用增量均值和方差。', [['二阶差', 'B_s−B_t 均值 0、方差 |s−t|，所以平方差期望为 |s−t|。'], ['趋近', 's→t 时该值趋于 0，满足均方连续定义。']], 'E[(B_s−B_t)²]=|s−t|→0，故均方连续。', 2),
      ex('有跳跃也能均方连续', 'N(t) 为速率 λ>0 的泊松过程。计算 E[(N(t+h)−N(t))²]（h>0），判断右侧均方连续性。', 'Poisson(λh) 的二阶矩为方差加均值平方。', [['计算', '增量均值 λh、方差 λh，故二阶矩为 λh+(λh)²。'], ['取极限', 'h↓0 时两项均趋零，所以右侧均方连续；路径有跳跃与这一期望意义的结论并不矛盾。']], 'λh+(λh)²→0，右侧均方连续。'),
    ],
  },
  {
    key: 'independent-increments', title: 'Independent Increments', titleZh: '独立增量',
    summary: '互不重叠时间段的变化量独立，不等于过程各时刻的累计值独立。',
    definition: '对任意递增时刻 t0<…<tn，若 X_t1−X_t0,…,X_tn−X_t(n−1) 相互独立，称过程有独立增量。此性质本身不要求增量分布只依赖长度。累计值通常共享早期增量，从而相关；区间重叠时也不能直接套用独立增量条件。',
    intuition: '每一段新增的部分可以互不影响，但后面的总量仍包含前面的积累。',
    prerequisites: [id(courseId, 'stationary-increments'), 'conditional-probability'], learningNotes: ['相互独立强于两两不相关，非高斯情形不能只检查协方差。', '计算两段计数的乘积概率前，先画出区间并核对是否重叠。'],
    formula: { title: 'Factorization for disjoint increments', titleZh: '不交区间增量的概率分解', latex: 'P(\\Delta_1\\in A,\\Delta_2\\in B)=P(\\Delta_1\\in A)P(\\Delta_2\\in B)', conditions: '过程有独立增量，Δ1、Δ2 来自互不重叠的时间区间，A、B 为可测集合。', explanation: '独立性作用于新增部分，不直接作用于累计水平。' },
    exercises: [
      ex('两段分别计数', 'N 为速率 1 的泊松过程。求 P(N(1)=1，N(3)−N(1)=0)。', '两段长度为 1 和 2。', [['分布', 'N(1)~Poisson(1)，N(3)−N(1)~Poisson(2)，且两增量独立。'], ['相乘', '概率为 e^(−1)×e^(−2)=e^(−3)。']], 'e^(−3)。', 2),
      ex('累计值为什么相关', 'N 为速率 λ>0 的泊松过程，0<s<t。求 Cov(N(s),N(t))，判断两个累计值独立与否。', '把 N(t) 拆成旧计数与新计数。', [['拆分', 'N(t)=N(s)+[N(t)−N(s)]，方括号与 N(s) 独立。'], ['协方差', '协方差等于 Var(N(s))=λs>0，所以累计值不独立。']], 'Cov(N(s),N(t))=λs；不独立。'),
    ],
  },
  {
    key: 'ergodicity', title: 'Ergodicity and Time Averages', titleZh: '遍历性与总体平均',
    summary: '平稳说明规律不变，遍历还要求一条足够长的轨迹能反映总体。',
    definition: '离散平稳过程可在路径空间用时间平移描述；若所有平移不变事件的概率均为零或一，称为遍历。平稳且遍历并满足可积性时，时间样本均值几乎处处趋于总体期望。本页同时用均方误差检查较弱的“均值遍历”性质；仅证明某一个变量的均值收敛不能代替完整遍历性的判别。',
    intuition: '持续观察同一个系统，不能永远被锁在一个只属于部分样本的随机状态里。',
    prerequisites: [id(courseId, 'strict-stationarity'), 'law-large-numbers'], learningNotes: ['平稳过程不必遍历，随机常值过程是最直接的反例。', '均值遍历、几乎处处收敛和完整的遍历定义要区分，结论必须写清所用意义。'],
    formula: { title: 'Ergodic average for an integrable stationary process', titleZh: '平稳遍历过程的平均极限', latex: '\\frac1n\\sum_{k=1}^nX_k\\xrightarrow{a.s.}E[X_1]', conditions: '离散时间过程平稳且遍历，E|X1|<∞；a.s. 表示几乎处处收敛。', explanation: '遍历条件把可能依赖不变信息的极限收缩为一个总体常数。' },
    exercises: [
      ex('平稳但无法平均掉随机常数', 'Z 等概率取 ±1，X_n=Z。时间均值能趋于 E(X_1)=0 吗？说明它不遍历。', '无论平均多少项，随机符号不会重新抽取。', [['时间均值', '每个 n 的时间均值都等于 Z，平方误差期望为 1，不能趋于 0。'], ['不变事件', '事件“整条路径为 1”在平移下不变且概率为 1/2，所以不满足遍历定义。']], '不能；时间均值恒为 Z，不变事件概率 1/2，过程不遍历。'),
      ex('独立样本平均会稳定', 'X_n 独立同分布，等概率取 ±1。计算 n 项均值的均方误差，并说明其长期平均。', '独立使不同项协方差为零。', [['均方误差', '均值期望 0，方差为 n/n²=1/n，因此均方误差趋于零。'], ['长期结果', '强大数定律进一步给出时间均值几乎处处趋于 0；独立同分布序列也是标准的平稳遍历例子。']], '均方误差 1/n；时间均值几乎处处趋于 0。'),
    ],
  },
  {
    key: 'interarrival', title: 'Exponential Interarrival Times', titleZh: '独立指数到达间隔',
    summary: '齐次泊松过程的连续到达间隔独立同分布，参数使用速率。',
    definition: '对速率 λ>0、从零开始的齐次泊松过程，记第 n 次到达时刻 T_n，令 T_0=0、W_n=T_n−T_(n−1)。这些间隔独立且均服从速率参数 λ 的指数分布，均值 1/λ。到达时刻是间隔的部分和；非齐次泊松过程不能原样套用独立同分布指数间隔结论。',
    intuition: '时钟在每次到达后重新等待；齐次性让每次等待遵循同一规则。',
    prerequisites: ['poisson-process', id(courseId, 'independent-increments')], learningNotes: ['速率 λ 与均值尺度 1/λ 是不同参数约定，写密度时必须明确。', '无记忆性适用于指数等待；它不表示已经发生的历史时长等于零。'],
    formula: { title: 'Exponential survival and memorylessness', titleZh: '指数尾概率与无记忆性', latex: 'P(W>s+t\\mid W>s)=e^{-\\lambda t},\\quad s,t\\ge0', conditions: 'W~Exp(λ)，λ>0 为速率；条件概率分母 e^(−λs)>0。', explanation: '尚未到达时，再等 t 的尾概率只取决于新增时长。' },
    exercises: [
      ex('等过之后还要再等', '到达速率为每分钟 2 次。已知第一次等待超过 1 分钟，再超过 0.5 分钟的条件概率是多少？', '代入新增时长而非总时长。', [['条件比', 'P(W>1.5)/P(W>1)=e^(−3)/e^(−2)。'], ['结果', '得到 e^(−1)，也等于一开始等待超过半分钟的概率。']], 'e^(−1)。', 2),
      ex('第二次到达时刻的矩', '速率每分钟 2 次，求第二次到达时刻 T_2 的期望和方差。', 'T_2 是两个独立指数间隔之和。', [['单个间隔', '每个 W 的均值 1/2 分钟，方差 1/4 分钟²。'], ['求和', '独立使方差相加，因此 E(T_2)=1 分钟，Var(T_2)=1/2 分钟²。']], '期望 1 分钟；方差 1/2 分钟²。'),
    ],
  },
];
export const stochasticV111Topics: Topic[] = lessons.map(({ key, formula, exercises, ...topic }) => ({ ...topic, courseId, id: id(courseId, key), sourceNote: '原创讲解与自编配套练习；非教材原文、非历年真题。', formulaIds: [id(courseId, key) + '-formula'], problemIds: exercises.map((_, n) => id(courseId, key) + '-exercise-' + (n + 1)) }));
export const stochasticV111Formulas: Formula[] = lessons.map(({ key, formula }) => ({ ...formula, courseId, id: id(courseId, key) + '-formula', topicId: id(courseId, key) }));
export const stochasticV111Problems: Problem[] = lessons.flatMap(({ key, exercises }) => exercises.map((exercise, n) => ({ ...exercise, courseId, id: id(courseId, key) + '-exercise-' + (n + 1), topicId: id(courseId, key), formulas: [], source: { kind: 'original', label: '自编配套练习 · 非教材原题、非历年真题' } })));

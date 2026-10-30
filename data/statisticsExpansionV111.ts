import type { Formula, Problem, Topic } from '@/types';
import { roadmapTopicId as id } from './curriculumRoadmap';
type Exercise = Omit<Problem, 'id' | 'courseId' | 'topicId' | 'formulas' | 'source'>;
type Lesson = Omit<Topic, 'id' | 'courseId' | 'formulaIds' | 'problemIds'> & { key: string; formula: Omit<Formula, 'id' | 'courseId' | 'topicId'>; exercises: Exercise[] };
const ex = (title: string, prompt: string, hint: string, steps: [string, string][], answer: string, difficulty: Problem['difficulty'] = 3): Exercise => ({ title, prompt, hints: [hint], steps: steps.map(([title, body]) => ({ title, body })), answer, difficulty });
const courseId = 'statistics' as const;
const lessons: Lesson[] = [
  {
    key: 'sample-quantiles', title: 'Sample Quantile Conventions', titleZh: '样本分位数',
    summary: '排序之后还要说明取点规则，不同软件的插值约定可能不同。',
    definition: '本页采用经验分布函数的广义逆：对 0<p≤1，取累计比例首次达到 p 的最小观测值，即第 ceil(np) 个次序统计量。这是一种明确的样本分位数约定；线性插值以及偶数样本中间两项平均的中位数规则可能给出不同结果，不能在计算中混用。',
    intuition: '从最小值向右数，第一次覆盖指定比例时停下。',
    prerequisites: [id(courseId, 'empirical-cdf')], learningNotes: ['先排序，重复观测仍按出现次数计数。', '比较软件结果之前先比较分位数定义；本页不把这一约定称为唯一正确规则。'],
    formula: { title: 'Inverse empirical CDF quantile', titleZh: '经验分布逆分位数', latex: 'Q_n(p)=X_{(\\lceil np\\rceil)},\\quad 0<p\\le1', conditions: 'n≥1，X_(1)≤…≤X_(n) 为排序后的实数观测；采用经验分布广义逆约定。', explanation: 'ceil 表示向上取整，端点 p=1 对应最大值。' },
    exercises: [
      ex('同一组数据的两个四分位数', '数据为 8、1、4、2、9、3。按本页约定求 Q(0.25)、Q(0.75)。', '排序后算 ceil(6p)。', [['排序', '得到 1、2、3、4、8、9。'], ['定位', 'ceil(1.5)=2，ceil(4.5)=5，因此取第二项 2、第五项 8。']], 'Q(0.25)=2，Q(0.75)=8。', 2),
      ex('为什么两个中位数结果不同', '对 1、2、10、20，分别求经验逆分位数 Q(0.5) 和中间两项平均的中位数。', '两种约定分别计算即可。', [['经验逆', 'ceil(4×0.5)=2，Q(0.5)=2。'], ['平均约定', '中间两项平均为 (2+10)/2=6；差异来自定义，不是排序出错。']], '经验逆分位数为 2；中间两项平均为 6。', 2),
    ],
  },
  {
    key: 'boxplot', title: 'Reading Boxplots', titleZh: '箱线图的解释边界',
    summary: '箱体描述四分位范围，须线之外的点只是进一步核查的线索。',
    definition: '常见箱线图以 Q1、Q3 构成箱体，以中位数标中心。四分位距 IQR=Q3−Q1，按 1.5IQR 规则将外侧观测标为潜在异常；须通常延伸到界限内最远观测，而非必定等于界限。箱线图不能完整显示多峰结构，也不能单凭一个外点认定数据录入错误。',
    intuition: '它是分布的简短摘要，适合比较位置和散布，但不会保留每个细节。',
    prerequisites: [id(courseId, 'sample-quantiles')], learningNotes: ['题目或软件必须给出四分位数约定；小样本尤其容易出现差异。', '恰在界限上的点不因严格超界规则被标出；须端点与界限值应区分。'],
    formula: { title: 'Tukey fences', titleZh: '四分位距与异常界限', latex: 'IQR=Q_3-Q_1,\\quad L=Q_1-1.5IQR,\\quad U=Q_3+1.5IQR', conditions: '采用 1.5IQR 箱线规则，Q1、Q3 已按明确约定计算；小于 L 或大于 U 才超界。', explanation: '界限用于标记，不能替代数据质量调查。' },
    exercises: [
      ex('算界限也算须的位置', '数据 1、2、3、4、5、6、7、20。用经验逆分位数和 1.5IQR 规则，求界限、潜在异常点及须端点。', 'Q1 是第二项，Q3 是第六项。', [['界限', 'Q1=2，Q3=6，IQR=4，界限为 −4 和 12。'], ['观测位置', '只有 20 超界；界限内最小和最大观测为 1、7，因此须端点为 1 和 7。']], '界限 −4、12；20 超界；须端点 1、7。'),
      ex('边界值是否算异常', '已知 Q1=10、Q3=14，观测 4、20、21 中哪些被 1.5IQR 规则标出？能否直接删除？', '严格比较界限，不把边界算作超界。', [['比较', 'IQR=4，界限为 4、20；只有 21 严格超界。'], ['解释', '21 可能是真实但少见的观测，须核查来源和分析目的，不能仅靠箱线规则删除。']], '仅 21 被标出；不能据此直接认定错误并删除。', 2),
    ],
  },
  {
    key: 'scatter', title: 'Scatterplots and Association', titleZh: '散点图与变量关系',
    summary: '先看形状、分组和离群点，再用相关系数概括线性关系。',
    definition: '散点图以成对观测为点，显示变量间的形态与异质性。皮尔逊相关衡量标准化后的线性共变，只在两个方差均正且有限时有定义。相关为零不排除非线性依赖；强相关也不自动建立因果关系，可能受到混杂、反向作用或选择机制影响。',
    intuition: '弯曲关系可以很确定，却在直线相关的尺子下抵消成零。',
    prerequisites: ['covariance-correlation'], learningNotes: ['零方差变量的相关系数未定义，不能写成零。', '散点图要保留配对关系；分别排序两个变量会制造虚假的相关。'],
    formula: { title: 'Population Pearson correlation', titleZh: '皮尔逊相关的方差条件', latex: '\\rho_{XY}=\\frac{\\operatorname{Cov}(X,Y)}{\\sqrt{\\operatorname{Var}(X)\\operatorname{Var}(Y)}}', conditions: 'X、Y 二阶矩有限，且两个方差均严格为正。', explanation: '分母去除量纲，分子仍然只表达线性共变。' },
    exercises: [
      ex('完全依赖却不相关', 'X 等概率取 −1、0、1，Y=X²。求相关系数，并判断独立性。', '先算 E(X)、E(X³)，再检查条件概率。', [['相关', 'E(X)=E(XY)=0，Var(X)=2/3，Var(Y)=2/9，因此协方差及相关系数均为 0。'], ['依赖', 'X=0 时 Y 必为 0，而 P(Y=0)=1/3，所以 X、Y 不独立。']], '相关系数 0，但不独立。'),
      ex('直线关系不能独自说明因果', '三对观测为 (1,2)、(2,4)、(3,6)。样本相关系数是多少？能据此证明改变 X 会使 Y 加倍吗？', '先识别直线，再区分观察和干预。', [['计算', 'Y=2X 且 X 不为常数，中心化后仍成正比例，样本相关系数为 1。'], ['推断边界', '观测关联没有提供随机干预或排除混杂的证据，不能单凭三对数值证明因果。']], '样本相关系数 1；不能单凭这些观测证明因果。', 2),
    ],
  },
  {
    key: 'outliers', title: 'Outliers and Robust Summaries', titleZh: '异常值与稳健性',
    summary: '极端观测对不同统计量影响不同，处理方式应结合数据来源。',
    definition: '异常值是相对于给定模型或数据主体显得偏离的观测，不必然是错误。均值会随单个极大值持续移动，中位数在一定比例的污染下更稳定。稳健性描述对偏离假设或污染的敏感程度；采用稳健统计量也不能弥补系统性抽样偏差。',
    intuition: '均值像一个会被远处重物拉动的支点，中位数更依赖排序中的位置。',
    prerequisites: [id(courseId, 'sample-statistics')], learningNotes: ['“对异常值稳健”不表示在所有分布下方差最小。', '先区分单位错误、重复记录和真实极端事件，再决定是否修正或保留。'],
    formula: { title: 'Effect of replacing one observation', titleZh: '单个替换对均值的影响', latex: '\\bar x_{\\mathrm{new}}-\\bar x=\\frac{M-x_j}{n}', conditions: '样本量 n 固定，仅把第 j 个观测替换为 M；其余数据保持原样。', explanation: 'M 可任意大时，均值的改变量也没有固定上界。' },
    exercises: [
      ex('一个数改变了多少', '数据 1、2、3、4、5，把 5 换成 105。比较替换前后的均值和通常中位数。', '均值增加 (105−5)/5。', [['均值', '原均值为 3，新均值为 23，增加 20。'], ['中位数', '排序后中间第三项仍为 3，所以中位数保持 3。']], '均值 3→23；中位数仍为 3。', 2),
      ex('中位数也有承受范围', '原样本为 1、2、3、4、5。把前三项均替换成 M>5，求新的通常中位数，并说明能否任意大。', '排序后的前三个位置不再对应原来的前三个位置。', [['重新排序', '新样本排序为 4、5、M、M、M，中间第三项为 M。'], ['污染比例', '五个观测中三个被替换，中位数也会被推到任意大的 M；稳健不意味着免疫所有污染。']], '新中位数为 M，可任意大。'),
    ],
  },
  {
    key: 'random-sampling', title: 'Sampling and Representation', titleZh: '随机抽样与代表性',
    summary: '抽到谁由抽样机制决定，样本大并不保证覆盖目标总体。',
    definition: '不放回简单随机抽样使总体中每个固定大小的子集等可能；每个单位的入样概率为 n/N。分层抽样允许不同层抽取不同数量，但总体均值须按总体层权重组合。代表性涉及覆盖范围、选择和未响应机制；便利样本增加数量不会自动消除系统性偏差。',
    intuition: '调查结果能代表谁，首先取决于谁有机会进入样本。',
    prerequisites: [id(courseId, 'sample-statistics')], learningNotes: ['随机抽样和随机分组是两个不同环节，前者关乎总体推断，后者常用于干预比较。', '不等比例分层时，直接合并样本均值可能把样本比例错当总体比例。'],
    formula: { title: 'Stratified mean', titleZh: '按总体层权重组合', latex: '\\widehat\\mu=\\sum_{h=1}^{H}\\frac{N_h}{N}\\bar X_h,\\quad N=\\sum_hN_h', conditions: '各层总体大小已知且各层有样本；层内均值作为该层均值的估计。', explanation: '权重由总体层规模决定，不一定等于各层样本比例。' },
    exercises: [
      ex('两个层各抽十人', '总体 A 层 80 人、B 层 20 人，各抽 10 人，样本均值分别 60、90。求分层总体均值估计及直接合并的样本均值。', '两组有相同样本量，却有不同总体规模。', [['总体加权', '0.8×60+0.2×90=66。'], ['直接合并', '各十人直接合并得到 (60+90)/2=75，使用了 1/2、1/2 的样本权重。']], '分层估计 66；直接合并 75。'),
      ex('入样机会与便利样本', '从 100 个单位中简单随机不放回抽 10 个，某指定单位的入样概率是多少？只调查最先回复的 10 人是否同样保证该概率？', '简单随机与回复速度不是同一抽样机制。', [['等机会', '由对称性每个单位的入样概率为 10/100=0.1。'], ['回复选择', '先回复者取决于回复意愿和条件，未给出等概率机制，不能保证每人都是 0.1。']], '简单随机时为 0.1；先回复者抽样没有这一保证。', 2),
    ],
  },
  {
    key: 'bootstrap', title: 'The Nonparametric Bootstrap', titleZh: '自助法的基本流程',
    summary: '从已有样本有放回地重抽，观察同一个统计量如何变化。',
    definition: '普通非参数自助法在给定样本条件下，将每个观测赋相同权重，独立有放回抽取 n 次形成新样本，重复计算目标统计量。重复值可以出现，原值也可能未入选。它以经验分布近似总体，依赖抽样和统计量的正则性；时间相关数据或边界、极值问题不能直接套用普通流程。',
    intuition: '用现有数据构造一个小型总体，在其中重复模拟相同的抽样实验。',
    prerequisites: [id(courseId, 'empirical-cdf'), id(courseId, 'random-sampling')], learningNotes: ['无放回抽满 n 项只是重排，样本均值不会变化，不能代替普通 bootstrap。', '重抽次数 B 增加主要减小模拟误差，不会创造原样本未包含的总体信息。'],
    formula: { title: 'Bootstrap Monte Carlo standard error estimate', titleZh: '重复统计量的标准差估计', latex: '\\widehat{SE}_{boot}=\\sqrt{\\frac{1}{B-1}\\sum_{b=1}^B(T_b^*-\\bar T^*)^2}', conditions: 'B≥2，T_b* 为按同一重抽方案得到的统计量；这是 bootstrap 分布标准差的模拟估计。', explanation: '对均值等合适统计量，可用重抽波动近似原抽样波动。' },
    exercises: [
      ex('完整枚举二点重抽', '观测为 0、2，每次独立有放回抽两次。列出 bootstrap 均值的分布、期望和方差。', '四个有序抽样结果等可能。', [['枚举', '(0,0)、(0,2)、(2,0)、(2,2) 各概率 1/4，均值分别 0、1、1、2。'], ['计算', '均值分布概率为 1/4、1/2、1/4，期望 1，方差 (1+0+0+1)/4=1/2。']], '均值 0、1、2 的概率为 1/4、1/2、1/4；期望 1，方差 1/2。'),
      ex('重排为什么不够', '对同样的样本 0、2，若每次不放回抽满两项，均值的重抽标准差是多少？为何不适合作普通 bootstrap？', '不放回抽满会把两项都拿走。', [['所有结果', '只能得到 (0,2) 或 (2,0)，均值恒为 1，标准差为 0。'], ['缺少波动', '只改变顺序没有改变经验权重，不能模拟有放回抽样的均值波动。']], '标准差为 0；它只是重排，未实施普通有放回自助法。', 2),
    ],
  },
  {
    key: 'missing-data', title: 'Missingness Mechanisms', titleZh: '缺失机制与分析偏差',
    summary: '缺失是否与数值有关，会影响只分析完整记录的结论。',
    definition: '令 R=1 表示目标变量 Y 被观测，X 为完整观测的协变量。在本页单变量缺失情形，MCAR 表示观测概率与 X、Y 均无关；MAR 表示给定 X 后不再依赖 Y；MNAR 表示给定 X 后仍依赖未见的 Y。MAR 是关于缺失机制的假设，不意味着完整案例均值自动无偏，也通常不能仅由已见数据确证。',
    intuition: '空白不是数字零；谁留下了答案，本身可能带有选择信息。',
    prerequisites: ['conditional-probability', id(courseId, 'random-sampling')], learningNotes: ['MAR 的“随机”不等于简单随机丢失；它允许缺失率随已观测协变量改变。', '均值填补会压缩变异，不应把填补值当作新增的独立观测。'],
    formula: { title: 'MAR for one partially observed variable', titleZh: '单变量缺失下的 MAR 条件', latex: 'P(R=1\\mid X,Y)=P(R=1\\mid X)', conditions: 'X 完整观测，Y 可能缺失，R 标识 Y 是否被观测；条件概率在相应支持上定义。', explanation: '给定已观测 X 后，Y 不再为观测概率提供额外信息。' },
    exercises: [
      ex('依赖协变量的缺失', 'Y 的回复概率只由完整记录的年龄组 X 决定：年轻组 0.8、年长组 0.4，组内不再依赖 Y。属于 MAR 还是 MCAR？', '比较给定 X 后的依赖和不加条件的依赖。', [['MAR', '按题设，给定年龄组后观测概率与 Y 无关，满足 MAR。'], ['不是 MCAR', '两个组的回复概率不同，观测机制依赖 X，因此不满足 MCAR。']], 'MAR，但不是 MCAR。', 2),
      ex('高数值更少被看到', '总体 Y 等概率为 0 或 10，无其他协变量。Y=0 时必回复，Y=10 时以 1/2 概率回复。求总体均值和回复者条件均值，并判断机制。', '先计算回复者中高值所占比例。', [['回复权重', '回复且 Y=0 的概率为 1/2，回复且 Y=10 的概率为 1/4，总回复概率 3/4，因此回复者中高值比例 1/3。'], ['偏差与机制', '总体均值为 5，E(Y|R=1)=10/3。回复依赖未必观测到的 Y，在无协变量情形属于 MNAR。']], '总体均值 5，回复者均值 10/3；MNAR。'),
    ],
  },
  {
    key: 'moments', title: 'Method of Moments', titleZh: '矩估计法',
    summary: '把模型的理论矩与样本矩相等，再解出参数。',
    definition: '矩估计用样本原点矩替代理论原点矩，求解参数方程。若有 k 个未知参数，通常需要足以识别它们的 k 个矩关系；相关矩须存在，所得解应落在允许参数空间。矩估计不自动等于最大似然估计，也不自动无偏、唯一或最有效。',
    intuition: '先让模型和样本在几个汇总特征上对齐，再读取模型参数。',
    prerequisites: ['estimation', 'expectation-variance'], learningNotes: ['二阶样本原点矩是平均 X²，不是无偏样本方差。', '参数方程出现多个解时要检查识别性及参数约束，不能随便选根。'],
    formula: { title: 'Moment matching equations', titleZh: '理论矩与样本矩匹配', latex: 'E_{\\theta}[X^j]=\\frac1n\\sum_{i=1}^nX_i^j,\\quad j=1,\\ldots,k', conditions: '所用矩存在，矩关系能够识别参数；右侧为相应样本原点矩。', explanation: '解方程得到估计值后还须核对模型允许范围。' },
    exercises: [
      ex('均匀分布的矩估计', 'X_i 独立同分布于 Uniform(0,θ)，θ>0。由第一矩推导 θ 的矩估计；对观测 1、2、3 给出数值。', 'E(X)=θ/2。', [['矩匹配', 'θ/2=X̄，故 θ̂=2X̄。'], ['代入', '样本均值 2，矩估计为 4；该数值大于样本最大值 3。']], 'θ̂=2X̄，本例为 4。', 2),
      ex('二阶原点矩与样本方差', '正态总体均值 μ、方差 σ² 均未知。由前两阶矩求矩估计；对 1、2、3 求 μ̂、σ̂²。', 'E(X²)=μ²+σ²。', [['解方程', 'μ̂=X̄，σ̂²=(ΣX_i²)/n−X̄²=(Σ(X_i−X̄)²)/n。'], ['数值', 'μ̂=2，σ̂²=(1+0+1)/3=2/3；无偏样本方差用 n−1 作分母，为 1，二者不同。']], 'μ̂=2，σ̂²=2/3；无偏样本方差为 1。'),
    ],
  },
];
export const statisticsV111Topics: Topic[] = lessons.map(({ key, formula, exercises, ...topic }) => ({ ...topic, courseId, id: id(courseId, key), sourceNote: '原创讲解与自编配套练习；非教材原文、非历年真题。', formulaIds: [id(courseId, key) + '-formula'], problemIds: exercises.map((_, n) => id(courseId, key) + '-exercise-' + (n + 1)) }));
export const statisticsV111Formulas: Formula[] = lessons.map(({ key, formula }) => ({ ...formula, courseId, id: id(courseId, key) + '-formula', topicId: id(courseId, key) }));
export const statisticsV111Problems: Problem[] = lessons.flatMap(({ key, exercises }) => exercises.map((exercise, n) => ({ ...exercise, courseId, id: id(courseId, key) + '-exercise-' + (n + 1), topicId: id(courseId, key), formulas: [], source: { kind: 'original', label: '自编配套练习 · 非教材原题、非历年真题' } })));

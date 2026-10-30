import type { CourseId, Formula, Problem, Topic } from '@/types';
import { roadmapTopicId } from './curriculumRoadmap';

// Only complete lessons belong here. A roadmap title alone is not published content.
type Exercise = Omit<Problem, 'id' | 'courseId' | 'topicId' | 'source' | 'formulas'>;
type Lesson = Omit<Topic, 'id' | 'courseId' | 'formulaIds' | 'problemIds'> & {
  courseId: CourseId; key: string;
  formula: Omit<Formula, 'id' | 'courseId' | 'topicId'>;
  exercises: Exercise[];
};
const exercise = (title: string, prompt: string, hint: string, work: [string, string][], answer: string, difficulty: Problem['difficulty'] = 2): Exercise => ({
  title, prompt, hints: [hint], steps: work.map(([title, body]) => ({ title, body })), answer, difficulty,
});
const lessons: Lesson[] = [
  {
    courseId: 'calculus', key: 'one-sided', title: 'One-sided Limits', titleZh: '单侧极限与双侧极限',
    summary: '左右分别靠近同一点，只有到达同一个有限值时才能合并。',
    definition: '左极限限制自变量从小于 a 的一侧趋向 a；右极限从大于 a 的一侧趋向 a。对于在 a 两侧去心邻域都有定义的函数，有限双侧极限存在当且仅当两个单侧极限存在且相等。函数在 a 的取值不决定极限。',
    intuition: '从桥的两端走向接缝，左右高度一致才接得上；接缝本身的标记不影响两侧的高度。',
    prerequisites: ['limits'], learningNotes: ['分段函数先按趋近方向选表达式，不要直接代入另一段。', '两个单侧极限不同，双侧极限不存在；连续还要核对该点的函数值。'],
    formula: { title: 'Two-sided limit criterion', titleZh: '双侧有限极限判别', latex: '\\lim_{x\\to a}f(x)=L\\iff\\lim_{x\\to a^-}f(x)=\\lim_{x\\to a^+}f(x)=L', conditions: 'f 在 a 两侧的某个去心邻域有定义，L 为有限实数。', explanation: '双侧趋近必须同时约束左侧与右侧。' },
    exercises: [
      exercise('绝对值商的左右极限', '求 f(x)=|x|/x 在 x=0 的左右极限及双侧极限。', '先分别写出 x<0 和 x>0 的表达式。', [['左侧', 'x<0 时 |x|=−x，所以 f(x)=−1，左极限为 −1。'], ['右侧与结论', 'x>0 时 f(x)=1，右极限为 1。两者不同，所以双侧极限不存在。']], '左极限 −1，右极限 1，双侧极限不存在。'),
      exercise('连续不等于可导', 'f(x)=3x+1（x<1），f(x)=x²+b（x≥1）。使 f 在 1 连续的 b 是多少？此时是否可导？', '连续要使左极限等于右极限与 f(1)。', [['匹配函数值', '左极限为 4，右极限与 f(1) 都为 1+b，故 b=3。'], ['检查导数', '此时左导数为 3，右导数为 2。左右导数不同，因此连续但不可导。']], 'b=3；在 1 连续但不可导。', 3),
    ],
  },
  {
    courseId: 'calculus', key: 'limit-laws', title: 'Limit Laws and Nonzero Denominators', titleZh: '极限运算法则及非零分母',
    summary: '加减乘可以组合有限极限，除法还要求分母极限非零。',
    definition: '当 f、g 在同一趋近过程中分别具有有限极限 a、b 时，和、差、积的极限分别为 a+b、a−b、ab。商的法则另需 b≠0，这保证分母在充分靠近时不为零。0/0 是未定式，不是数值零。',
    intuition: '除法会放大分母接近零的变化，因此比加法和乘法多一个检查条件。',
    prerequisites: ['limits'], learningNotes: ['只有各部分的有限极限存在时才能直接拆分，不能把 ∞−∞ 当成零。', '分母极限为零时法则不适用，但原商可能有极限，也可能没有。'],
    formula: { title: 'Quotient limit rule', titleZh: '有限极限的商法则', latex: '\\lim\\frac{f(x)}{g(x)}=\\frac{a}{b}\\quad(\\lim f=a,\\ \\lim g=b\\ne0)', conditions: '同一趋近过程，a、b 有限且 b≠0；函数在相应去心邻域有定义。', explanation: '非零极限保证分母最终远离零。' },
    exercises: [
      exercise('先检查分母再合并', '已知 x→a 时 f(x)→2、g(x)→−1，求 (f(x)²+3g(x))/(f(x)−g(x)) 的极限。', '先分别算分子与分母极限。', [['分子和分母', '分子极限为 2²+3(−1)=1，分母极限为 2−(−1)=3。'], ['应用商法则', '分母极限 3 非零，所以商的极限为 1/3。']], '1/3。'),
      exercise('同为零极限却得到不同的商', 'x→0 时，比较 x/x 与 2x/x（均取 x≠0）。能否只由分子分母都趋于零确定商的极限？', '在去心邻域先化简。', [['约分', 'x≠0 时两个商分别恒等于 1 和 2，所以各自极限为 1 和 2。'], ['解释条件', '分子分母都趋于零并不能决定其相对速度；直接代入得到的 0/0 不是合法商法则。']], '分别为 1 和 2；仅凭两个零极限不能确定商的极限。'),
    ],
  },
  {
    courseId: 'linear-algebra', key: 'independence', title: 'Linear Independence', titleZh: '线性无关与冗余向量',
    summary: '线性无关意味着没有向量能被其余向量线性表示。',
    definition: '域上的有限向量组称为线性无关，如果等于零向量的线性组合只能有全零系数。存在非零系数关系则线性相关。包含零向量的非空向量组一定相关。',
    intuition: '每个无关向量都贡献一个无法被其他方向替代的新方向。',
    prerequisites: ['vectors'], learningNotes: ['向量个数不能超过所在有限维空间的维数，否则必相关。', '在多项式空间中也可以逐项比较系数，不能只检查某一个自变量值。'],
    formula: { title: 'Independence criterion', titleZh: '零线性组合判别', latex: '\\sum_{j=1}^m a_jv_j=0\\ \\Longrightarrow\\ a_1=\\cdots=a_m=0', conditions: 'v₁,…,vₘ 为同一域上线性空间中的有限向量组。', explanation: '只有平凡的零组合，才叫线性无关。' },
    exercises: [
      exercise('第三个方向是否新增', '判断 (1,0,1)、(0,1,1)、(1,1,2) 是否线性无关，并给出关系。', '把前两个向量相加。', [['找到关系', 'v₁+v₂=(1,1,2)=v₃。'], ['核对非平凡性', 'v₁+v₂−v₃=0 的系数不是全零，所以三个向量相关；前两个却相互无关。']], '线性相关，关系为 v₁+v₂−v₃=0。'),
      exercise('用两个一次多项式表示目标', '证明 1+x、1−x 线性无关，并将 2+3x 表为它们的线性组合。', '分别比较常数项与 x 的系数。', [['无关性', 'a(1+x)+b(1−x)=0 给出 a+b=0、a−b=0，因此 a=b=0。'], ['求坐标', '表示 2+3x 时 a+b=2、a−b=3，得到 a=5/2、b=−1/2。']], '线性无关；2+3x=(5/2)(1+x)−(1/2)(1−x)。', 3),
    ],
  },
  {
    courseId: 'linear-algebra', key: 'rref', title: 'Reduced Row Echelon Form', titleZh: '行最简形与主元',
    summary: '用行变换把主元列和自由变量明确分开。',
    definition: '行最简形要求非零行在零行上方、每行首个非零元为 1、主元向右阶梯排列，且每个主元是其所在列唯一的非零元。每个矩阵的行最简形唯一。初等行变换保持秩与方程组解集，但一般改变列空间本身。',
    intuition: '消元把依赖关系整理成可直接读取的说明书。',
    prerequisites: ['matrices', 'linear-systems'], learningNotes: ['原矩阵的列空间基要取原矩阵的主元位置列，而不是替换成变换后的列。', '增广列出现主元意味着方程组不相容，不能把它当普通未知量列。'],
    formula: { title: 'Row equivalence and rank', titleZh: '行等价保持秩', latex: 'R=EA,\\quad E\\text{ invertible}\\quad\\Longrightarrow\\quad\\operatorname{rank}R=\\operatorname{rank}A', conditions: 'R 由 A 经有限次初等行变换得到，E 是这些初等矩阵的乘积。', explanation: '可逆行变换不创造也不消除独立方程。' },
    exercises: [
      exercise('找出主元列', '求矩阵 [[1,2,1],[2,4,3]] 的行最简形、秩及主元列编号。', '先用第二行减去第一行的两倍。', [['消去首列', '第二行变为 [0,0,1]。'], ['清除第三列上方', '第一行减第二行得到 [1,2,0]。行最简形为 [[1,2,0],[0,0,1]]，有两个主元。']], '行最简形 [[1,2,0],[0,0,1]]；秩 2；主元列为第 1、3 列。'),
      exercise('一条独立约束的通解', '解 x+2y=3，2x+4y=6，并解释自由变量个数。', '第二个方程是第一个的两倍。', [['消去冗余行', '增广矩阵经行变换得到 [[1,2,3],[0,0,0]]。'], ['设置自由变量', '两个未知量只有一个主元，设 y=t，则 x=3−2t，t 可为任意实数。']], '(x,y)=(3−2t,t)，t∈R；有 1 个自由变量。'),
    ],
  },
  {
    courseId: 'probability', key: 'inclusion-exclusion', title: 'Inclusion–Exclusion', titleZh: '容斥原理',
    summary: '并集中的重复计数，需要按交集层数交替修正。',
    definition: '容斥将有限事件并集的概率表示为单事件、两两交、三重交等项的交替和。三个事件时先加单项，再减两两交，最后加三重交。此恒等式不要求独立，交集概率必须按题设计算。',
    intuition: '一人属于两组时被多算一次；同时属于三组时又被减多了，需要补回来。',
    prerequisites: ['conditional-probability'], learningNotes: ['独立与互斥不同；不能在无独立条件时把交集概率写成乘积。', '“至少一个”也可转化为“一件也没有”的补事件。'],
    formula: { title: 'Three-event inclusion–exclusion', titleZh: '三个事件的容斥公式', latex: 'P(A\\cup B\\cup C)=P(A)+P(B)+P(C)-P(A\\cap B)-P(A\\cap C)-P(B\\cap C)+P(A\\cap B\\cap C)', conditions: 'A、B、C 为同一概率空间中的事件；不需要独立。', explanation: '按每个样本点被计入的次数检验，最终恰好计一次。' },
    exercises: [
      exercise('至少一个与一个也没有', 'P(A)=0.6，P(B)=0.5，P(A∩B)=0.2。求至少一个发生及二者都不发生的概率。', '两事件版本只减一次交集。', [['计算并集', 'P(A∪B)=0.6+0.5−0.2=0.9。'], ['取补事件', '二者都不发生的概率为 1−0.9=0.1。']], '至少一个发生为 0.9；都不发生为 0.1。'),
      exercise('三枚硬币至少一次正面', '独立掷三枚公平硬币，用容斥求至少一枚正面的概率。', '各事件概率 1/2，两两交 1/4，三重交 1/8。', [['逐项相加', '三个单项和为 3/2，三个两两交之和为 3/4，三重交为 1/8。'], ['容斥并核验', '结果 3/2−3/4+1/8=7/8；也等于 1−全部反面的概率 1/8。']], '7/8。'),
    ],
  },
  {
    courseId: 'probability', key: 'lotus', title: 'Expectation of a Function', titleZh: '随机变量函数的期望',
    summary: '求 g(X) 的平均值，不必先求出 g(X) 的完整分布。',
    definition: '对可测函数 g，若 E|g(X)| 有限，则离散情形 E[g(X)] 为 g(x) 按概率加权求和；具有密度时为 g(x) 与密度乘积的积分。一般 E[g(X)] 不等于 g(E[X])，只有特定函数或分布才会相等。',
    intuition: '先对每个可能值做变换，再按原来的概率权重求平均。',
    prerequisites: ['random-variables', 'expectation-variance'], learningNotes: ['积分区间是 X 的取值范围，不是 g(X) 的取值范围。', '非负函数可定义扩展期望；有正负抵消的无穷积分不可随意赋值。'],
    formula: { title: 'Law of the unconscious statistician', titleZh: '密度形式的函数期望', latex: 'E[g(X)]=\\int_{\\mathbb R}g(x)f_X(x)\\,dx', conditions: 'X 有密度 f_X，g 可测且 E|g(X)|<∞。', explanation: '按 X 的分布积分，不需要对 g 求逆。' },
    exercises: [
      exercise('平均平方与平均的平方', 'X 在 [−1,1] 均匀分布，求 E[X²]，并与 (E[X])² 比较。', '区间上的密度为 1/2。', [['积分', 'E[X²]=(1/2)∫从 −1 到 1 的 x² dx=1/3。'], ['比较', '由对称性 E[X]=0，因此 (E[X])²=0，与 1/3 不同。']], 'E[X²]=1/3，(E[X])²=0。'),
      exercise('伯努利变量的指数期望', 'X~Bernoulli(0.3)，求 E[e^X]，能否直接写成 e^0.3？', 'X 只取 0 和 1，逐项加权。', [['按质量函数求和', 'E[e^X]=0.7e⁰+0.3e¹=0.7+0.3e。'], ['说明差异', '指数函数严格凸，且 X 不恒定，詹森不等式给出 E[e^X]>e^(E[X])=e^0.3。']], '0.7+0.3e，严格大于 e^0.3。', 3),
    ],
  },
  {
    courseId: 'statistics', key: 'unbiased-variance', title: 'Unbiased Sample Variance', titleZh: '无偏样本方差',
    summary: '估计均值用掉一个自由度，因此围绕样本均值的平方和除以 n−1。',
    definition: '对具有有限方差的独立同分布样本，样本方差 S² 为离均差平方和除以 n−1，其期望等于总体方差。不要求总体正态。若总体均值已知，围绕已知均值的平方和除以 n 也是无偏估计，但这是另一个统计量。',
    intuition: '样本均值主动贴近这批数据，使围绕它计算的平方距离略显偏小。',
    prerequisites: ['estimation', 'expectation-variance'], learningNotes: ['无偏是重复抽样的平均性质，不意味着某一次估计等于真实参数。', 'n≥2；对不独立、异分布的样本不能直接套这里的无偏结论。'],
    formula: { title: 'Bessel-corrected variance', titleZh: '贝塞尔校正的样本方差', latex: 'S^2=\\frac{1}{n-1}\\sum_{i=1}^n(X_i-\\bar X)^2,\\quad E[S^2]=\\sigma^2', conditions: 'n≥2，Xᵢ 独立同分布且有有限方差 σ²。', explanation: '离均差和为零，只剩 n−1 个自由度。' },
    exercises: [
      exercise('三个观测值的方差', '样本为 1、2、6，求样本均值与无偏样本方差，并比较除以 n 的数值。', '先算均值，再加三个离均差平方。', [['均值与平方和', '均值为 3，平方和为 (1−3)²+(2−3)²+(6−3)²=14。'], ['选分母', 'S²=14/(3−1)=7；若除以 n，则为 14/3，对未知均值下的总体方差估计有向下偏差。']], '均值 3，S²=7；除以 n 得 14/3。'),
      exercise('已知均值时换了什么', '总体均值已知为 2，观察到样本 0、4。分别计算围绕已知均值的无偏方差估计与通常的 S²。', '两个统计量的分母分别是 n 与 n−1。', [['已知均值', '[(0−2)²+(4−2)²]/2=4。在独立同分布、有限方差假设下，它的期望为 σ²。'], ['估计均值', '样本均值恰为 2，但 S²=8/(2−1)=8。两者各自无偏不代表一次观察结果相同，也不能断言真实方差为 4 或 8。']], '已知均值估计为 4，通常 S² 为 8；不能据此确定总体方差。', 3),
    ],
  },
  {
    courseId: 'statistics', key: 'mse', title: 'Bias–Variance and Mean Squared Error', titleZh: '偏差方差与均方误差',
    summary: '有偏估计不一定差，要把偏差平方与抽样波动一起衡量。',
    definition: '估计量 T 对参数 θ 的均方误差为 E[(T−θ)²]。当 T 有有限二阶矩时，它等于方差加偏差平方。MSE 通常随未知参数变化，某一点更好不代表在所有参数下都更好。',
    intuition: '射箭既要看箭群是否分散，也要看箭群中心偏离靶心多远。',
    prerequisites: ['estimation', 'expectation-variance'], learningNotes: ['无偏只令偏差项为零，并不保证方差最小。', '比较两个估计量时应写清样本量和参数值或参数范围。'],
    formula: { title: 'MSE decomposition', titleZh: '均方误差分解', latex: 'E[(T-\\theta)^2]=\\operatorname{Var}(T)+(E[T]-\\theta)^2', conditions: 'θ 为固定参数，T 有有限二阶矩。', explanation: '以 E[T] 为中心展开，交叉项的期望为零。' },
    exercises: [
      exercise('伯努利均值的风险', '10 个独立 Bernoulli(p) 样本，以样本均值估计 p。p=0.2 时求偏差、方差与 MSE。', '均值无偏，方差为 p(1−p)/n。', [['偏差', 'E[X̄]=p，偏差为 0。'], ['方差和风险', 'Var(X̄)=0.2×0.8/10=0.016，所以 MSE=0.016。']], '偏差 0，方差与 MSE 都为 0.016。'),
      exercise('收缩估计是否总更好', '仍取 n=10，令 T=0.5X̄+0.25。在 p=0.5 和 p=0.2 时比较 T 与 X̄ 的 MSE。', 'T 的偏差是 0.25−0.5p，方差是原方差的 1/4。', [['p=0.5', 'T 无偏，方差 0.25×0.25/10=0.00625；原均值 MSE 为 0.025，T 较小。'], ['p=0.2', 'T 偏差为 0.15，方差为 0.004，MSE=0.004+0.15²=0.0265，大于原均值的 0.016。']], 'p=0.5 时为 0.00625 对 0.025；p=0.2 时为 0.0265 对 0.016。收缩并非处处更好。', 4),
    ],
  },
  {
    courseId: 'stochastic-process', key: 'arrival-conditional', title: 'Poisson Arrivals Given the Count', titleZh: '给定计数的到达时刻',
    summary: '已知区间总到达数后，无序到达位置像独立均匀抽样，有序时刻是其顺序统计量。',
    definition: '齐次泊松过程在 [0,T] 内给定 N(T)=n 后，到达时刻的联合分布等于 n 个独立 Uniform(0,T) 变量排序后的分布。因此子区间计数为二项分布。排序后的时刻相互依赖，不能说它们仍独立均匀。',
    intuition: '总数确定后，剩下的不确定性是这 n 个点落在时间轴的什么位置。',
    prerequisites: ['poisson-process', 'distributions'], learningNotes: ['这里要求齐次强度；非齐次过程的条件位置分布一般不均匀。', '给定总数会使不相交区间的计数相互制约，不能再直接使用无条件的独立增量。'],
    formula: { title: 'Conditional binomial count', titleZh: '条件子区间计数', latex: 'N(s)\\mid N(T)=n\\sim\\operatorname{Binomial}(n,s/T)', conditions: '齐次泊松过程，强度 λ>0，T>0，0≤s≤T，n 为非负整数。', explanation: '每个无序到达位置独立落入 [0,s] 的概率为 s/T。' },
    exercises: [
      exercise('四小时五次到达', '已知 N(4)=5，求 N(1) 的条件分布、条件期望及没有到达的条件概率。', '把一小时看成全区间的四分之一。', [['识别条件分布', 'N(1)|N(4)=5 服从 Binomial(5,1/4)。'], ['计算矩和概率', '条件期望为 5/4；零次的概率为 (3/4)^5=243/1024。']], 'Binomial(5,1/4)；条件期望 5/4；零次概率 243/1024。', 3),
      exercise('已知两次到达时第一次何时发生', '已知 N(4)=2，求第一次到达 T₁ 的条件生存函数及条件期望。', '第一次晚于 t 等价于两个均匀位置都晚于 t。', [['求生存函数', '0≤t≤4 时概率为 (1−t/4)²；t<0 时为 1，t≥4 时为 0。'], ['积分求平均', '条件期望等于 ∫₀⁴(1−t/4)²dt=4/3。这里第一次到达不再是通常的指数等待时间。']], '生存函数在 [0,4] 为 (1−t/4)²，区间外按 1、0 延拓；条件期望 4/3。', 4),
    ],
  },
  {
    courseId: 'stochastic-process', key: 'chapman', title: 'Chapman–Kolmogorov Equations', titleZh: '查普曼柯尔莫哥洛夫方程',
    summary: '跨多步的转移，按中间状态求和，而不是直接相加概率。',
    definition: '时间齐次离散马尔可夫链的 m+n 步转移概率，是经各中间状态的 m 步与 n 步转移概率乘积之和。取行随机矩阵和行向量初始分布时，n 步分布是 μPⁿ。条件转移概率与联合概率不能混同。',
    intuition: '走两段路时，把所有可能中转站的路径概率加起来。',
    prerequisites: ['markov-chains', 'matrices'], learningNotes: ['矩阵行列约定必须统一；这里每行和为 1，分布从左乘。', '非齐次链需要按时间顺序乘不同转移矩阵，不能直接写单一 P 的幂。'],
    formula: { title: 'Semigroup of a homogeneous chain', titleZh: '齐次转移矩阵的半群关系', latex: 'P^{(m+n)}_{ij}=\\sum_k P^{(m)}_{ik}P^{(n)}_{kj},\\quad P^{(n)}=P^n', conditions: '时间齐次离散时间马尔可夫链，m、n 为非负整数；按行随机矩阵约定。', explanation: '利用马尔可夫性，对中间状态做全概率分解。' },
    exercises: [
      exercise('两步转移', '状态为 0、1，P=[[0.8,0.2],[0.3,0.7]]。求 P² 以及从 0 出发两步到 1 的概率。', '从 0 到 1 可经中间状态 0 或 1。', [['第一行', 'P²₀₀=0.8²+0.2×0.3=0.70；P²₀₁=0.8×0.2+0.2×0.7=0.30。'], ['第二行', 'P²₁₀=0.3×0.8+0.7×0.3=0.45，P²₁₁=0.55。每行仍和为 1。']], 'P²=[[0.70,0.30],[0.45,0.55]]；所求为 0.30。', 3),
      exercise('联合概率不是两步边际', '仍用上述 P，初始分布 μ=(0.4,0.6)。求第二步分布及 P(X₀=0,X₂=1)。', '联合事件需要先乘初始概率。', [['传播分布', 'μP=(0.5,0.5)，再乘 P 得 μP²=(0.55,0.45)。'], ['计算联合', '联合概率为 P(X₀=0)P(X₂=1|X₀=0)=0.4×0.3=0.12，不等于第二步边际 0.45。']], '第二步分布 (0.55,0.45)；联合概率 0.12。', 3),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'bezout', title: 'Polynomial Bézout Identity', titleZh: '多项式贝祖等式',
    summary: '最大公因式不仅能整除，还能由原多项式线性组合得到。',
    definition: '域 F 上不全为零的 f、g 有唯一首一最大公因式 d，存在 u、v∈F[x] 使 uf+vg=d。欧几里得算法反向代回可构造 u、v。只有互素时才能把右端规范为 1。',
    intuition: '辗转相除既找到共同部分，也保留了从原对象拼回它的方法。',
    prerequisites: ['polynomial-gcd'], learningNotes: ['系数域重要，例如整数系数环中不能无条件除以常数。', '贝祖系数通常不唯一，验证时直接展开回代即可。'],
    formula: { title: 'Bézout identity over a field', titleZh: '域上多项式的贝祖表示', latex: 'u(x)f(x)+v(x)g(x)=\\gcd(f,g)', conditions: 'f、g∈F[x] 不全为零，F 为域，最大公因式取首一形式。', explanation: '欧几里得算法的每个余式都是原多项式的线性组合。' },
    exercises: [
      exercise('余式为常数的互素证明', '在 R[x] 中令 f=x²+1，g=x+1，求 uf+vg=1 的一组系数。', '先用 f 除以 g。', [['带余除法', 'f=(x−1)g+2，最后非零余式是常数，所以首一最大公因式为 1。'], ['反向代入', '1=(1/2)f−((x−1)/2)g；展开可得 x 项与二次项完全抵消。']], 'u=1/2，v=−(x−1)/2。', 3),
      exercise('右端不一定能写成一', 'f=x²−1，g=x²−x，求首一最大公因式并写贝祖表示。能否组合成 1？', '两式作差。', [['分解与作差', 'f=(x−1)(x+1)，g=x(x−1)，且 f−g=x−1。'], ['判断最大与不可约去的因子', 'x−1 整除两式且能由两式组合得到，故为首一最大公因式。任意组合仍被 x−1 整除，不能等于 1。']], 'gcd=x−1=f−g；不能组合成 1。', 3),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'dimension-formula', title: 'Dimension of a Sum of Subspaces', titleZh: '子空间维数公式',
    summary: '相加的两个空间会重复计算交集中的方向。',
    definition: '同一有限维线性空间中的子空间 U、V，其和空间由 u+v 构成。选择交空间的一组基并分别扩充为两空间的基，可以证明和空间维数等于两维数之和减去交空间维数。交空间为零时和才是直和。',
    intuition: '两份方向清单合并时，共有方向只能数一次。',
    prerequisites: ['vector-space-basis'], learningNotes: ['U∪V 一般不是子空间，公式说的是 U+V。', '维数只给出数量约束，不自动给出交空间的具体基。'],
    formula: { title: 'Grassmann dimension formula', titleZh: '格拉斯曼维数公式', latex: '\\dim(U+V)=\\dim U+\\dim V-\\dim(U\\cap V)', conditions: 'U、V 是同一有限维线性空间的子空间。', explanation: '从共同基扩充时，交集的基被重复数了一遍。' },
    exercises: [
      exercise('两个坐标平面的和与交', '在 R³ 中 U=span(e₁,e₂)，V=span(e₂,e₃)。求交空间、和空间及其维数。', '共有方向只有 e₂。', [['求交与和', 'U∩V=span(e₂)，U+V 包含三个坐标方向，所以等于 R³。'], ['核验维数', '交的维数为 1，和的维数为 3，与 2+2−1=3 一致。']], '交为 span(e₂)，维数 1；和为 R³，维数 3。'),
      exercise('四维空间中两个三维子空间', 'R⁴ 中 dim U=dim V=3，交空间维数可能是多少？', '和空间维数不超过 4。', [['给出界', 'dim(U∩V)=6−dim(U+V)≥2，且交空间不超过 U 的维数 3。'], ['说明可达', 'U=V 时交维数 3；取 U=span(e₁,e₂,e₃)、V=span(e₁,e₂,e₄) 时交维数 2。']], '只能是 2 或 3，两种都能达到。', 3),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'log-branches', title: 'Branches of the Complex Logarithm', titleZh: '复对数的支与运算法则',
    summary: '复指数的周期性使对数多值；选支后普通对数法则也要重新检查。',
    definition: '非零复数 z 的所有对数为 ln|z|+i(arg z+2kπ)。在删去非正实轴的平面上取 Arg∈(−π,π)，得到全纯的主支 Log，其导数为 1/z。跨越割线时辐角会跳变，不能全局无条件应用乘积、幂的实对数法则。',
    intuition: '绕原点一周，相同位置累积了一个完整角度；割线是在平面上选定“从哪里重新计角”。',
    prerequisites: ['complex-roots', 'holomorphic-cr'], learningNotes: ['这里的解析主支定义域是 C 去掉 (−∞,0]，负实轴不在域内。', '不同教材可能采用不同边界辐角约定，应明确本题采用的支。'],
    formula: { title: 'Principal analytic logarithm', titleZh: '解析主对数支', latex: '\\operatorname{Log}z=\\ln|z|+i\\operatorname{Arg}z,\\quad -\\pi<\\operatorname{Arg}z<\\pi', conditions: 'z 为复数且不在非正实轴 (−∞,0]；在这个割平面上主支全纯。', explanation: '删去割线后，辐角可连续且单值地选定。' },
    exercises: [
      exercise('负虚轴上的对数', '求主支 Log(−i) 及 −i 的所有复对数。', '模为 1，主辐角为 −π/2。', [['主支', 'ln|−i|=0，主辐角为 −π/2，所以 Log(−i)=−iπ/2。'], ['所有分支值', '指数每增加 2πi 不变，因此所有对数为 −iπ/2+2kπi，k∈Z。']], '主支 −iπ/2；所有值 −iπ/2+2kπi。'),
      exercise('主对数的平方规则为何失败', '令 z=e^(3πi/4)，比较 Log(z²) 与 2Log z。', 'z² 的辐角 3π/2 不在主支范围内。', [['分别选主辐角', 'Log z=3πi/4；z²=−i，因此 Log(z²)=−πi/2。'], ['比较差值', '2Log z=3πi/2，比 Log(z²) 多 2πi。两者均有定义，但不相等。']], 'Log(z²)=−πi/2，2Log z=3πi/2；后者多 2πi。', 3),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'winding', title: 'Winding Numbers and Orientation', titleZh: '绕数与带方向的围道',
    summary: '围道绕一个点多少圈，正反方向要带符号。',
    definition: '分段 C¹ 闭曲线 γ 对不在曲线上的点 a 的绕数是沿曲线积分 1/(z−a) 再除以 2πi，取整数值。逆时针绕一周通常为 +1，顺时针为 −1；曲线可多重绕行。它在补集的每个连通分支上保持常数。',
    intuition: '沿路径持续记录目标点的视线角，累计角度除以一整圈。',
    prerequisites: ['cauchy-integral-formula', 'residue-theorem'], learningNotes: ['点落在曲线上时此积分定义不可直接使用。', '非简单闭曲线不要只用“内外”二分，需要计算有方向的绕数。'],
    formula: { title: 'Index of a closed contour', titleZh: '闭曲线的绕数积分', latex: 'n(\\gamma,a)=\\frac{1}{2\\pi i}\\oint_\\gamma\\frac{dz}{z-a}', conditions: 'γ 为分段 C¹ 闭曲线，a 不在其迹上。', explanation: '逆时针角度增加，顺时针角度减少，多次绕行累加。' },
    exercises: [
      exercise('同一圆对不同点的绕数', 'γ 为逆时针圆 |z|=2，求 n(γ,1) 与 n(γ,3)。', '两个点分别在圆内与圆外。', [['圆内点', '圆围绕 1 逆时针一周，积分为 2πi，绕数为 1。'], ['圆外点', '1/(z−3) 在圆及内部全纯，积分为零，绕数为 0。']], '分别为 1 和 0。', 3),
      exercise('顺时针两圈', 'γ(t)=e^(−2it)，0≤t≤2π。求对原点的绕数及 ∮γ dz/z。', '参数总角度变化为 −4π。', [['按参数计算', 'dz/z=−2i dt，从 0 到 2π 积分得到 −4πi。'], ['还原绕数', '除以 2πi 得 −2，表示顺时针绕行两圈。']], '绕数 −2，积分 −4πi。', 3),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'direction-cosines', title: 'Direction Cosines', titleZh: '方向角与方向余弦',
    summary: '用单位方向向量表达与三个正坐标轴的夹角。',
    definition: '在三维正交直角坐标系中，非零向量与三个正坐标轴的方向角分别为 α、β、γ，其余弦为三个分量除以向量长度。平方和为 1。无向直线夹角通常取不超过 π/2 的小角，需要对方向向量点积取绝对值。',
    intuition: '把箭头长度缩到 1，剩下的三个投影就是方向信息。',
    prerequisites: ['triple-product'], learningNotes: ['零向量无方向角，不能除以零长度。', '向量夹角与无向直线夹角的取值范围不同，不要一律取绝对值。'],
    formula: { title: 'Normalized direction components', titleZh: '方向余弦的归一化', latex: '(\\cos\\alpha,\\cos\\beta,\\cos\\gamma)=\\frac{(v_x,v_y,v_z)}{\\sqrt{v_x^2+v_y^2+v_z^2}}', conditions: '三维正交直角坐标系，v≠0，方向角相对正坐标轴。', explanation: '单位向量的长度为 1，因此三个方向余弦平方和为 1。' },
    exercises: [
      exercise('一个负方向余弦', '求 v=(2,−1,2) 的方向余弦，判断与正 y 轴的方向角是锐角还是钝角。', '先求长度 3。', [['归一化', '长度为 √(4+1+4)=3，所以方向余弦为 (2/3,−1/3,2/3)。'], ['解释符号', '与正 y 轴夹角的余弦为负，故方向角为钝角；三个平方之和为 1。']], '(2/3,−1/3,2/3)；与正 y 轴为钝角。'),
      exercise('两条无向直线的夹角', '两直线方向向量分别为 (1,1,0) 与 (1,0,1)，求小夹角。', '点积除以长度乘积，再按无向直线取绝对值。', [['计算余弦', '点积为 1，长度乘积为 2，故小夹角余弦为 1/2。'], ['确定角度', '取 [0,π/2] 内的角得 π/3；把任一方向向量换号不改变直线的小夹角。']], 'π/3，即 60°。'),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'sphere-plane', title: 'Sphere–Plane Intersections', titleZh: '球面与平面的交圆',
    summary: '先比较球心到平面的距离与半径，再判断交圆、切点或空集。',
    definition: '球心到平面的垂足是交圆圆心。若距离 d 小于球半径 R，交圆半径由直角三角形得到 √(R²−d²)；d=R 时只有一个切点，d>R 时无交点。空间中的球面不是实心球。',
    intuition: '切片越靠近球心越大，接近球顶时缩为一点。',
    prerequisites: ['spatial-distances', 'quadric-surfaces'], learningNotes: ['距离取绝对值且除以法向量长度，不能直接拿平面常数作距离。', '半径平方为负表示无实交点，不能继续取实平方根。'],
    formula: { title: 'Radius of a spherical section', titleZh: '球面截圆半径', latex: 'r=\\sqrt{R^2-d^2}\\quad(0\\le d<R)', conditions: '球半径 R>0，d 为球心到平面的欧氏距离；d=R 为切点，d>R 无交点。', explanation: '球半径、平面距离和截圆半径组成直角三角形。' },
    exercises: [
      exercise('偏离球心三单位的截面', '球心 (1,2,3)、半径 5，平面 z=6。求交圆圆心、半径与方程。', '球心在平面上的正交投影为圆心。', [['求距离和圆心', '距离 |6−3|=3，垂足为 (1,2,6)。'], ['截圆方程', '半径 √(25−9)=4，交圆可写为 z=6 且 (x−1)²+(y−2)²=16。']], '圆心 (1,2,6)，半径 4；z=6 且 (x−1)²+(y−2)²=16。'),
      exercise('平面常数不是距离', '球面 x²+y²+z²=4 与平面 x+y+z=4 是否相交？把右端改为何值会相切？', '法向量长度为 √3。', [['比较距离', '球心为原点，半径 2；到平面距离为 4/√3>2，所以不相交。'], ['解相切条件', '若右端改为 c，距离为 |c|/√3。令它等于 2，得到 c=±2√3。']], '不相交；右端为 ±2√3 时相切。', 3),
    ],
  },
  {
    courseId: 'measure-theory', key: 'continuity', title: 'Continuity of Measures', titleZh: '测度的上下连续性',
    summary: '递增集合可直接取测度极限，递减集合还要留意有限性。',
    definition: '可测集合列 Aₙ 递增时，并集的测度等于测度序列的极限，允许无穷值。Bₙ 递减且 μ(B₁)<∞ 时，交集的测度也等于测度极限。缺少有限测度条件的递减情形可能失败。',
    intuition: '逐步加进集合时可累加新部分；逐步删去时不能随意做 ∞−∞。',
    prerequisites: ['sigma-algebra-measure'], learningNotes: ['集合的端点是否属于极限集合，与其测度极限是否相同是两个问题。', '递减情形只要某一项测度有限，也可从那项开始应用定理。'],
    formula: { title: 'Continuity from below', titleZh: '测度从下连续', latex: 'A_n\\uparrow A\\quad\\Longrightarrow\\quad\\mu(A)=\\lim_{n\\to\\infty}\\mu(A_n)', conditions: 'Aₙ 为可测递增集合列，A=∪ₙAₙ；递减版本另需某一项测度有限。', explanation: '把递增集合分为互不相交的新增部分，用可列可加性。' },
    exercises: [
      exercise('端点没加入但测度达到一', '实线上的勒贝格测度，Aₙ=[0,1−1/n]，n≥1。求并集及测度极限。', '每个严格小于 1 的非负实数最终都在某一项里。', [['识别并集', '所有集合均不含 1，但并集包含 [0,1) 内每一点，故并集为 [0,1)。'], ['取测度', 'μ(Aₙ)=1−1/n→1，也等于 μ([0,1))。端点没有加入不影响这里的测度。']], '并集 [0,1)，测度极限为 1。', 3),
      exercise('递减版本的无穷测度陷阱', 'Bₙ=[n,∞)。求交集，比较 μ(∩Bₙ) 与 lim μ(Bₙ)。', '没有实数能大于等于所有正整数。', [['求交集', '对任何实数 x，取 n>x 就有 x∉Bₙ，所以交集为空，测度为 0。'], ['核对前提', '每项测度都为 ∞，测度极限为 ∞。递减连续性缺少有限测度前提，故不能应用。']], '交集测度 0，测度极限 ∞；说明有限性前提不可省略。', 3),
    ],
  },
  {
    courseId: 'measure-theory', key: 'null-completion', title: 'Null Sets and Completion', titleZh: '零集与测度完备化',
    summary: '完备测度空间允许把零测集的任意子集也当作可测零集。',
    definition: '测度空间完备，是指每个可测零集的任意子集都可测且测度为零。完备化通过补入这些子集得到扩展 σ 代数，原有可测集合的测度不变。实值可测函数在零集上的任意修改，在完备空间上仍可测。',
    intuition: '零集虽然不贡献积分，但它的子集仍可能在原来的可测清单之外；完备化补齐这张清单。',
    prerequisites: ['sigma-algebra-measure', 'measurable-functions'], learningNotes: ['零测集必须原本可测；“任意不可测集都当零集”是不允许的。', '不完备空间上，几乎处处相等并不保证另一个函数也可测。'],
    formula: { title: 'Completion of a sigma algebra', titleZh: '补入零集子集的完备化', latex: '\\overline{\\mathcal F}=\\{A\\cup N:A\\in\\mathcal F,\\ N\\subseteq Z\\in\\mathcal F,\\ \\mu(Z)=0\\}', conditions: '(Ω,F,μ) 为测度空间；扩展测度定义为 μ̄(A∪N)=μ(A)。', explanation: '不同表示的差只落在可测零集中，因此扩展值一致。' },
    exercises: [
      exercise('三点空间的完备化', 'Ω={a,b,c}，F={∅,{a,b},{c},Ω}，μ({a,b})=0、μ({c})=1。它是否完备？完备化有多少个可测集合？', '检查 {a,b} 的子集 {a}。', [['发现缺口', '{a} 是零集 {a,b} 的子集，却不在 F 中，所以原空间不完备。'], ['补齐并计数', '补入 {a}、{b} 及它们与 {c} 的并，得到 Ω 的全部 8 个子集。含 c 的集合测度为 1，其余为 0。']], '不完备；完备化为幂集，共 8 个可测集合。', 3),
      exercise('几乎处处修改是否仍可测', '沿用三点空间，f≡0，g=1_{a}。二者是否几乎处处相等？g 在原空间与完备化上分别是否可测？', 'g 与 f 不同的点包含在可测零集 {a,b} 中。', [['几乎处处相等', '除可测零集 {a,b} 外两者相等，所以 f=g 几乎处处。'], ['检查逆像', 'g 的正值集合为 {a}，原 F 中没有它，故 g 不可测；在完备化中 {a} 可测，所以 g 可测。']], '几乎处处相等；g 在原空间不可测，在完备化上可测。', 4),
    ],
  },
  {
    courseId: 'mathematical-analysis', key: 'subsequence-bw', title: 'Bolzano–Weierstrass for Sequences', titleZh: '有界数列与收敛子列',
    summary: '有界实数列总能抽出收敛的一部分，但整列未必收敛。',
    definition: '波尔查诺魏尔斯特拉斯定理断言每个有界实数列都有收敛子列。可由反复二分闭区间并保留含无限项的半区间证明。反过来，存在一个收敛子列不保证整列有界，更不保证整列收敛。',
    intuition: '无限多的点被关在有限区间里，总有一簇点能越聚越紧。',
    prerequisites: ['real-completeness', 'cauchy-sequences'], learningNotes: ['子列指标必须严格递增，不能反复选择同一个下标。', '若两个子列极限不同，整列不可能有极限。该定理依赖实数的完备性。'],
    formula: { title: 'Bounded real sequence has a convergent subsequence', titleZh: '有界实数列的子列紧性', latex: '\\sup_n|a_n|<\\infty\\quad\\Longrightarrow\\quad\\exists\\,n_k\\uparrow\\infty,\\ a_{n_k}\\to L\\in\\mathbb R', conditions: '实数列；有限维欧氏空间也有对应结论，无限维空间不能照搬。', explanation: '整列可不收敛，但至少有一个有限聚点。' },
    exercises: [
      exercise('奇偶两条收敛路线', 'aₙ=(−1)ⁿ+1/n。找出两个收敛子列，并判断整列是否收敛。', '分别取 n=2k 与 n=2k−1。', [['偶数项', 'a₂ₖ=1+1/(2k)→1。'], ['奇数项与整列', 'a₂ₖ₋₁=−1+1/(2k−1)→−1。子列极限不一致，故整列不收敛。']], '偶数子列趋于 1，奇数子列趋于 −1，整列不收敛。'),
      exercise('一个收敛子列不能控制整列', '定义 a₂ₙ=0，a₂ₙ₋₁=n，n≥1。是否有收敛子列？整列是否有界？', '零项和增长项交替出现。', [['提取子列', '偶数项恒为 0，所以构成收敛到 0 的子列。'], ['检查整列', '奇数项为 1、2、3、…，无上界。因此整列无界，不能倒用有界数列定理。']], '有收敛到 0 的偶数子列；整列无界。'),
    ],
  },
  {
    courseId: 'mathematical-analysis', key: 'limsup-inf', title: 'Limit Superior and Limit Inferior', titleZh: '上极限与下极限',
    summary: '对越来越靠后的尾部取上下界，描述数列最终的振荡范围。',
    definition: '对有界实数列，尾部上确界单调递减，尾部下确界单调递增，其有限极限分别叫上极限与下极限。它们相等当且仅当整列收敛，公共值就是极限。不是只对前几项取最大最小。',
    intuition: '不断忽略早期项，看后续项还能反复靠近的最高与最低边界。',
    prerequisites: ['real-completeness', roadmapTopicId('mathematical-analysis', 'subsequence-bw')], learningNotes: ['上确界与最大值不同，尾部上确界不一定由某一项达到。', '这里先讨论有界数列；无界数列可在扩展实数中定义，但有限极限判别需对应调整。'],
    formula: { title: 'Tail definitions of limsup and liminf', titleZh: '尾部上下确界的极限', latex: '\\limsup a_n=\\lim_{n\\to\\infty}\\sup_{k\\ge n}a_k,\\quad\\liminf a_n=\\lim_{n\\to\\infty}\\inf_{k\\ge n}a_k', conditions: 'aₙ 为有界实数列时两者都是有限值。', explanation: '删去有限个开头项不改变上下极限。' },
    exercises: [
      exercise('振荡数列的两个边界', '求 aₙ=(−1)ⁿ+1/n 的上极限与下极限。', '除奇偶子列外，还需要控制所有足够靠后的项。', [['尾部控制', '当 n 很大时 1/n 任意小，所以所有尾项都落在 −1 附近至 1 附近之间。'], ['达到边界', '偶数子列趋于 1，奇数子列趋于 −1，说明这两个边界不能再收紧。']], '上极限 1，下极限 −1。', 3),
      exercise('有零项的振荡也能收敛', 'bₙ=(1+(−1)ⁿ)/(2n)，求上下极限并判断收敛性。', '整个数列被 0 与 1/n 夹住。', [['夹住所有尾项', '0≤bₙ≤1/n，所以任意尾部上确界不超过 1/n，下确界为 0。'], ['取极限', '上下极限都为 0，因此整列收敛到 0，尽管奇数项为零、偶数项为正。']], '上下极限均为 0，整列趋于 0。'),
    ],
  },
];

export const course70Topics: Topic[] = lessons.map(({ key, exercises, formula, ...topic }) => ({
  ...topic, id: roadmapTopicId(topic.courseId, key),
  sourceNote: '原创讲解与自编配套练习；非教材原文、非历年真题。',
  formulaIds: [roadmapTopicId(topic.courseId, key) + '-formula'],
  problemIds: exercises.map((_, index) => roadmapTopicId(topic.courseId, key) + '-exercise-' + (index + 1)),
}));
export const course70Formulas: Formula[] = lessons.map(({ courseId, key, formula }) => ({ ...formula, courseId, topicId: roadmapTopicId(courseId, key), id: roadmapTopicId(courseId, key) + '-formula' }));
export const course70Problems: Problem[] = lessons.flatMap(({ courseId, key, exercises }) => exercises.map((problem, index) => ({
  ...problem, id: roadmapTopicId(courseId, key) + '-exercise-' + (index + 1), courseId, topicId: roadmapTopicId(courseId, key), formulas: [],
  source: { kind: 'original', label: '自编配套练习 · 非教材原题、非历年真题' },
})));

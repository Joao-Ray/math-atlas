import type { CourseId, Formula, Problem, Topic } from '@/types';
import { roadmapTopicId as id } from './curriculumRoadmap';

type Exercise = Omit<Problem, 'id' | 'courseId' | 'topicId' | 'source' | 'formulas'>;
type Lesson = Omit<Topic, 'id' | 'courseId' | 'formulaIds' | 'problemIds'> & {
  courseId: CourseId; key: string;
  formula: Omit<Formula, 'id' | 'courseId' | 'topicId'>;
  exercises: Exercise[];
};
const ex = (title: string, prompt: string, hint: string, work: [string, string][], answer: string, difficulty: Problem['difficulty'] = 3): Exercise => ({
  title, prompt, hints: [hint], steps: work.map(([title, body]) => ({ title, body })), answer, difficulty,
});

const lessons: Lesson[] = [
  {
    courseId: 'higher-algebra', key: 'irreducible', title: 'Irreducibility Depends on the Field', titleZh: '不可约多项式',
    summary: '不可约必须指定系数域；没有有理根也不总能推出不可约。',
    definition: '域 F 上的非常数多项式 f 若不能写成 F[x] 中两个正次数多项式的乘积，就称在 F 上不可约。乘上非零常数不影响此性质。二次或三次多项式可约，当且仅当在 F 中有根；四次及以上可能分成两个没有一次因子的低次因子，因此无根不再足够。',
    intuition: '能否拆开取决于允许使用哪些系数，就像一块积木在不同工具箱中有不同拆法。',
    prerequisites: ['polynomial-gcd', id('higher-algebra', 'division')],
    learningNotes: ['实数域上的不可约多项式只有一次式及判别式为负的二次式；复数域上只有一次式。', '先说明系数域，再选择根判别、模素数或艾森斯坦等工具；判据不能使用不等于多项式可约。'],
    formula: { title: 'Root criterion in degrees two and three', titleZh: '二三次多项式的根判别', latex: '\\deg f\\in\\{2,3\\}\\quad\\Longrightarrow\\quad(f\\text{ irreducible over }F\\iff f\\text{ has no root in }F)', conditions: 'F 为域，f∈F[x]；次数限制不能省略。', explanation: '次数为 2 或 3 的非平凡分解必含一次因子，反之根给出一次因子。' },
    exercises: [
      ex('同一个多项式换了系数域', '判断 x²+1 在 Q、R、C 上是否不可约，并说明理由。', '二次多项式只需检查系数域中是否有根。', [['在实数及有理数中', '对任意实数 x，x²+1>0，没有实根，当然也没有有理根。由二次判别，在 Q、R 上均不可约。'], ['在复数中', 'i 与 −i 都是根，x²+1=(x−i)(x+i)，两个因子都有正次数。']], '在 Q、R 上不可约，在 C 上可约。', 2),
      ex('四次无有理根仍然可约', '证明 x⁴+4 在 Q 上没有根，却可约。', '将 x⁴+4 写成 (x²+2)²−(2x)²。', [['排除实根', 'x⁴+4≥4，对所有实数均不为零，所以不存在有理根。'], ['展示非平凡分解', '平方差给出 (x²−2x+2)(x²+2x+2)。两因子都在 Q[x] 中且次数为 2。']], '无有理根，但 x⁴+4=(x²−2x+2)(x²+2x+2)，在 Q 上可约。'),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'factorization', title: 'Unique Polynomial Factorization', titleZh: '唯一因式分解',
    summary: '固定系数域并将因子首一化后，不可约因子及其重数唯一。',
    definition: '域 F 上每个非零非常数多项式可写为一个非零常数与有限个互异首一不可约多项式正整数幂的乘积。除因子排列次序外，此分解唯一。常数、零多项式和单位因子必须分清；改变系数域后，不可约因子可能继续分裂。',
    intuition: '首一不可约因子扮演多项式的质数，重数记录同一因子出现的次数。',
    prerequisites: [id('higher-algebra', 'irreducible'), id('higher-algebra', 'multiplicity')],
    learningNotes: ['没有首一化时，可在因子之间移动非零常数，因此“唯一”要忽略单位倍数。', '最大公因式取各因子的最小指数，最小公倍式取最大指数；通常统一选首一式。'],
    formula: { title: 'Factorization into monic irreducibles', titleZh: '首一不可约因子的唯一分解', latex: 'f=c\\prod_{j=1}^{r}p_j^{m_j},\\quad c\\in F\\setminus\\{0\\},\\quad m_j\\ge1', conditions: 'f∈F[x] 非零非常数；pⱼ 为互异首一不可约多项式；唯一性忽略排列。', explanation: '常数 c 保留首项系数，其余因子与重数由 f 唯一决定。' },
    exercises: [
      ex('有理分解与复数分解', '将 x⁴−1 分别在 Q 与 C 上分解成首一不可约因子的乘积。', '先用两次平方差；在 Q 中检查剩余二次式。', [['在 Q 上', 'x⁴−1=(x²−1)(x²+1)=(x−1)(x+1)(x²+1)。最后一个二次式没有有理根。'], ['在 C 上', 'x²+1=(x−i)(x+i)，故四个一次因子分别为 x−1、x+1、x−i、x+i，重数均为 1。']], 'Q 上为 (x−1)(x+1)(x²+1)；C 上为 (x−1)(x+1)(x−i)(x+i)。'),
      ex('用指数求公因式与公倍式', '设 f=(x−1)²(x+2)，g=(x−1)(x+2)³。求首一最大公因式与首一最小公倍式。', '分别取两个因子指数的较小值与较大值。', [['最大公因式', 'x−1 的指数取 min(2,1)=1，x+2 的指数取 min(1,3)=1。'], ['最小公倍式', '相应最大指数为 2 与 3，得到 (x−1)²(x+2)³。其与公因式的乘积等于 fg。']], '最大公因式 (x−1)(x+2)；最小公倍式 (x−1)²(x+2)³。'),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'rational-roots', title: 'The Rational Root Test', titleZh: '有理根判别',
    summary: '首项和常数项把有理根限制在有限候选集，候选不等于实际根。',
    definition: '整系数多项式 aₙxⁿ+⋯+a₀ 的有理根写成最简分数 p/q，q>0，则 p 整除 a₀，q 整除 aₙ。对首一整系数多项式，有理根必为整数。通常先提取零根，再在常数项非零时列出有限候选；逐个代入或因式分解才能确定实际根。',
    intuition: '清除分母后，互素的分子分母只能分别来自常数项和首项系数的因子。',
    prerequisites: [id('higher-algebra', 'division'), id('higher-algebra', 'irreducible')],
    learningNotes: ['p/q 必须约成最简分数，否则分母整除首项的结论不能直接套用。', '高次多项式排尽有理根，只能排除有理一次因子；三次式才可进一步判不可约。'],
    formula: { title: 'Divisibility constraints on a rational root', titleZh: '最简有理根的整除约束', latex: 'f(p/q)=0,\\ \\gcd(p,q)=1\\quad\\Longrightarrow\\quad p\\mid a_0,\\ q\\mid a_n', conditions: 'f∈Z[x]，aₙ≠0，q>0；列有限候选时先处理 a₀=0 的零根。', explanation: '这是必要条件，候选必须代回原多项式核验。' },
    exercises: [
      ex('非首一三次式的全部有理根', '求 2x³−3x²−8x+12 的全部有理根。', '最简候选为 ±1、±2、±3、±4、±6、±12、±1/2、±3/2；也可分组。', [['分组提因子', 'x²(2x−3)−4(2x−3)=(2x−3)(x²−4)。'], ['核验并穷尽', '再分为 (2x−3)(x−2)(x+2)，三个一次因子已占满三次，故没有其他根。']], '全部有理根为 −2、3/2、2。'),
      ex('无有理根的三次式', '证明 x³−x−1 在 Q 上不可约。', '首一式的有理根只能是常数项的整数因子。', [['排除候选', '候选只有 1 与 −1，代入分别得到 −1 与 −1，都不是零。'], ['使用次数条件', '该多项式是三次式，在域上若可约则必有一次因子，从而必有有理根；矛盾。']], '没有有理根，由三次根判别知在 Q 上不可约。'),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'eisenstein', title: "Eisenstein's Criterion", titleZh: '艾森斯坦判别',
    summary: '一个素数同时控制各系数，可给出有理数域上的不可约充分条件。',
    definition: '若整系数正次数多项式 f 的首项系数不被素数 p 整除，其余所有系数都被 p 整除，而常数项不被 p² 整除，则 f 在 Q 上不可约。零系数也被 p 整除。判据不满足时不能据此判可约；有时平移变量后才出现可用的素数。',
    intuition: '模 p 后只剩最高次项，但常数项只含一层 p，阻止两个正次数因子同时分担它。',
    prerequisites: [id('higher-algebra', 'irreducible'), id('higher-algebra', 'factorization')],
    learningNotes: ['必须同时核对首项、全部低次项和常数项的平方整除条件。', 'f(x)↦f(x+a) 在 Q[x] 中可逆且保次数，因此平移前后的不可约性等价。'],
    formula: { title: 'Eisenstein coefficient conditions', titleZh: '素数整除的三项条件', latex: 'p\\nmid a_n,\\quad p\\mid a_j\\ (0\\le j<n),\\quad p^2\\nmid a_0\\quad\\Longrightarrow\\quad f\\text{ irreducible over }\\mathbb Q', conditions: 'f=aₙxⁿ+⋯+a₀∈Z[x]，n≥1，p 为素数。', explanation: '这是充分条件，不是所有不可约多项式都能直接使用。' },
    exercises: [
      ex('零系数也要检查', '证明 x⁵+10x+5 在 Q 上不可约。', '取 p=5，并把缺少的项看作零系数。', [['逐项验证', '5 不整除首项系数 1；5 整除低次项的系数 0、0、0、10、5。'], ['检查平方条件', '25 不整除常数项 5，三个条件齐备，使用判据即可。']], '取 p=5，艾森斯坦判别成立，在 Q 上不可约。'),
      ex('先平移再判别', '用艾森斯坦判别证明 x⁴+1 在 Q 上不可约。', '考察 f(x+1)，不要因原式没有合适素数就放弃。', [['展开平移式', '(x+1)⁴+1=x⁴+4x³+6x²+4x+2。'], ['判别并返回', '取 p=2，首项不被 2 整除，低次项均被 2 整除，常数 2 不被 4 整除。平移式不可约；反向平移可逆，原式也不可约。']], '平移后取 p=2；x⁴+1 在 Q 上不可约。', 4),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'mobius', title: 'Mobius Transformations and Their Inverses', titleZh: '莫比乌斯变换',
    summary: '非零行列式使分式线性变换在扩充复平面上一一对应。',
    definition: 'T(z)=(az+b)/(cz+d)，其中 ad−bc≠0，称为莫比乌斯变换。在黎曼球面上，c≠0 时令 T(−d/c)=∞、T(∞)=a/c；c=0 时 T(∞)=∞。逆变换为 (dw−b)/(a−cw)，同样按无穷远点约定延拓。四个系数同乘非零常数给出同一变换。',
    intuition: '伸缩、旋转、平移与倒数的组合，可以把有限点移到无穷远而仍保持整体可逆。',
    prerequisites: ['complex-roots', id('complex-analysis', 'log-branches')],
    learningNotes: ['ad−bc=0 时通常约分成常数，不能把所有分式都叫莫比乌斯变换。', '极点只表示有限坐标失效，在球面坐标中仍有明确定义的像。'],
    formula: { title: 'Inverse of a Mobius transformation', titleZh: '分式线性变换的逆', latex: 'T(z)=\\frac{az+b}{cz+d},\\quad T^{-1}(w)=\\frac{dw-b}{a-cw},\\quad ad-bc\\ne0', conditions: 'a、b、c、d∈C；分母为零及无穷远点按球面延拓解释。', explanation: '交叉相乘解出 z；行列式非零保证所得映射不是常数。' },
    exercises: [
      ex('求逆并追踪两个特殊点', 'T(z)=(2z+1)/(z+1)。求逆变换、T(−1) 与 T(∞)。', '先算行列式，再由 w(z+1)=2z+1 解 z。', [['验证并求逆', '行列式 2·1−1·1=1，非零。整理为 (w−2)z=1−w，故逆为 (w−1)/(2−w)。'], ['延拓特殊点', 'z=−1 是极点，像为 ∞；z→∞ 时首项系数比为 2，所以 ∞ 的像是 2，逆变换在 w=2 的像为 ∞。']], 'T⁻¹(w)=(w−1)/(2−w)，T(−1)=∞，T(∞)=2。'),
      ex('约分成常数的陷阱', 'S(z)=(z+1)/(2z+2) 能否成为莫比乌斯变换？z=−1 处该如何理解？', '计算 ad−bc，再检查约分后的函数。', [['非退化条件失败', '系数行列式为 1·2−1·2=0，不满足定义。对 z≠−1，S(z)=1/2。'], ['理解缺失点', '−1 处原表达式是 0/0，但作为函数在该点可去延拓为 1/2。延拓后仍是常数，不可能一一对应球面。']], '不是莫比乌斯变换；−1 处可去延拓为 1/2，整体为常函数。'),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'cross-ratio', title: 'Cross Ratios and Three-Point Normalization', titleZh: '交比',
    summary: '明确交比次序后，三个互异点可唯一归一化到 0、1、∞。',
    definition: '本页约定 C(z;a,b,c)=(z−a)(b−c)/((z−c)(b−a))，a、b、c 互异。它将 a、b、c 依次映为 0、1、∞，并在无穷远处用极限解释。对四个互异球面点，同时施加莫比乌斯变换不改变这个交比。不同教材的排列约定可能不同，不能只比较名称。',
    intuition: '先用三个点固定坐标标尺，第四个点在这个标尺中的位置不会被莫比乌斯变换改变。',
    prerequisites: [id('complex-analysis', 'mobius')],
    learningNotes: ['交换点的次序可能把交比变成倒数或 1 减原值，计算前先写出定义。', '涉及 ∞ 时取相应极限并消去共同最高阶项，不进行未经定义的 ∞−∞ 运算。'],
    formula: { title: 'The chosen cross-ratio convention', titleZh: '本页采用的交比约定', latex: 'C(z;a,b,c)=\\frac{(z-a)(b-c)}{(z-c)(b-a)},\\quad C(a)=0,\\ C(b)=1,\\ C(c)=\\infty', conditions: 'a、b、c 互异；球面无穷远点处取延拓值。四点互异时可直接使用交比不变性。', explanation: '同一约定下，三个点的指定像唯一决定一个莫比乌斯变换。' },
    exercises: [
      ex('把 0、1、2 送到标准三点', '求将 0、1、2 分别送到 0、1、∞ 的莫比乌斯变换，并求 3 的像。', '令 a=0、b=1、c=2。', [['代入约定', 'C(z;0,1,2)=−z/(z−2)=z/(2−z)。分别在 0、1、2 延拓核验。'], ['求第四点的像', 'z=3 时为 3/(2−3)=−3；非零行列式和三点归一化保证唯一。']], 'T(z)=z/(2−z)，T(3)=−3。'),
      ex('用倒数变换核验交比', '计算 C(4;1,2,3)，再计算将四点同时取倒数后的 C(1/4;1,1/2,1/3)。', '两个表达式必须用相同的点次序。', [['原四点', '(4−1)(2−3)/((4−3)(2−1))=−3。'], ['变换后的四点', '分子为 (−3/4)(1/6)=−1/8，分母为 (−1/12)(−1/2)=1/24，商仍为 −3。这是交比不变性的直接核验。']], '两个交比都等于 −3。'),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'riemann-sphere', title: 'The Riemann Sphere and Its Charts', titleZh: '黎曼球面',
    summary: '给复平面补上一个无穷远点，可用两张坐标图覆盖整个球面。',
    definition: '扩充复平面 C∪{∞} 可与单位球面通过从北极出发的球面投影对应。有限点 z=x+iy 对应 (2x,2y,|z|²−1)/(|z|²+1)，∞ 对应北极 (0,0,1)。近有限点用 z 作坐标，近无穷远用 w=1/z 且 w(∞)=0，两图重叠处通过倒数切换。',
    intuition: '平面上越来越远的点，在球面上都靠近同一个北极；无穷远只是一张坐标图的盲点。',
    prerequisites: ['complex-roots', id('complex-analysis', 'argument')],
    learningNotes: ['球面只有一个无穷远点，不按方向区分多个无穷远。', '有限 z 坐标中的极点可在 w 坐标变为零点，但全纯性还要检查具体函数的局部表达。'],
    formula: { title: 'Inverse stereographic coordinates', titleZh: '有限复数对应的单位球面坐标', latex: '(X,Y,Z)=\\left(\\frac{2x}{1+|z|^2},\\frac{2y}{1+|z|^2},\\frac{|z|^2-1}{1+|z|^2}\\right)', conditions: 'z=x+iy∈C，单位球面北极对应 ∞；投影方向约定固定为北极投影。', explanation: '坐标满足 X²+Y²+Z²=1；原点位于南极，单位圆位于赤道。' },
    exercises: [
      ex('两个虚轴点的球面位置', '求 z=i 和 z=2i 在上述单位球面上的坐标。', '分别代入模平方 1 与 4。', [['单位圆上的点', 'z=i 时 x=0、y=1、|z|²=1，得到 (0,1,0)，位于赤道。'], ['更远的点', 'z=2i 时分母为 5，得到 (0,4/5,3/5)。坐标平方和为 16/25+9/25=1。']], 'i 对应 (0,1,0)；2i 对应 (0,4/5,3/5)。'),
      ex('倒数在无穷远的局部表达', '将 f(z)=1/z 延拓到球面。在无穷远附近用 w=1/z 作源坐标，求 f 的局部表达和 f(∞)。', '把 z=1/w 代回有限目标坐标。', [['切换源坐标', '在 w≠0 的重叠区域，f(1/w)=w。这个表达可在 w=0 延拓。'], ['给出球面值', '局部表达是恒等函数 w，故 f(∞)=0；同样在 z=0 附近用目标坐标 1/f 可得 1/f=z，故 f(0)=∞。']], '无穷远附近局部表达为 w；f(∞)=0，f(0)=∞。'),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'extended-plane', title: 'Neighborhoods of Infinity', titleZh: '无穷远点邻域',
    summary: '复数趋于无穷远由模长决定，方向可以振荡。',
    definition: '扩充复平面中，∞ 的邻域包含某个集合 {∞}∪{z:|z|>R}。因此 zₙ→∞ 等价于 |zₙ|→∞，也等价于最终非零且 1/zₙ→0。函数 z→∞ 的极限，可改写为 w→0 时 f(1/w) 的极限。这里的 ∞ 是球面上的一个点，不是可任意相加减的复数。',
    intuition: '只需走出每一个足够大的圆盘，不需要朝着固定方向离开。',
    prerequisites: [id('complex-analysis', 'riemann-sphere')],
    learningNotes: ['无界数列未必趋于 ∞；需模长最终超过每个给定界，而不是只有一个子列变大。', '趋于无穷远与实数意义的趋于正无穷不同，负轴、虚轴等方向都通向同一个球面点。'],
    formula: { title: 'Testing a limit at infinity by inversion', titleZh: '倒数坐标判定无穷远极限', latex: 'z_n\\to\\infty\\iff |z_n|\\to\\infty\\iff 1/z_n\\to0', conditions: 'zₙ 为最终非零的有限复数；∞ 采用黎曼球面的拓扑。', explanation: '大圆外部在倒数映射下变为原点附近的小圆盘。' },
    exercises: [
      ex('方向振荡与模长振荡', '判断 zₙ=(−1)ⁿn 与 uₙ（偶数项为 n，奇数项为 1）是否趋于球面无穷远。', '比较每一项的模长，而不是只看数列是否无界。', [['第一列', '|zₙ|=n→∞，因此尽管方向交替，仍趋于无穷远点。它在实数扩充意义下不趋于正无穷。'], ['第二列', 'uₙ 无界，但奇数子列恒为 1，始终不能最终离开半径为 2 的圆盘，所以不趋于无穷远。']], 'zₙ 趋于无穷远点；uₙ 无界但不趋于无穷远。'),
      ex('在有限极点和无穷远处求极限', '求 f(z)=1/(z−2) 在 z→2 及 z→∞ 时的球面极限。', '有限极点看模长，无穷远用 w=1/z。', [['趋近有限极点', '|f(z)|=1/|z−2|→∞，故 z→2 的球面极限为 ∞。'], ['改用倒数坐标', 'f(1/w)=w/(1−2w)→0，故 z→∞ 时极限为 0。不需要固定趋近方向。']], 'z→2 时极限为 ∞；z→∞ 时极限为 0。'),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'inner-product', title: 'Dot Products, Angles and Projections', titleZh: '空间点积',
    summary: '点积将长度、夹角和正交投影联系起来，计算分量需使用正交单位坐标。',
    definition: '三维欧氏空间中，正交单位基下 u·v=Σuᵢvᵢ，也等于 |u||v|cosθ。非零向量 v 方向上的正交投影为 (u·v)/(v·v) 倍 v，余项与 v 正交。一般非正交基下应引入基向量的格拉姆矩阵，不能照搬坐标逐项相乘。',
    intuition: '点积衡量一个向量沿另一个方向的有效分量，同时保留同向或反向的符号。',
    prerequisites: ['triple-product', id('analytic-geometry', 'direction-cosines')],
    learningNotes: ['求夹角时两个向量必须非零；零点积判垂直的代数式允许零向量，但零向量没有几何方向角。', '投影向量、投影长度和带符号的标量投影是三个不同对象。'],
    formula: { title: 'Orthogonal projection on a line direction', titleZh: '沿非零向量的正交投影', latex: '\\operatorname{proj}_v u=\\frac{u\\cdot v}{v\\cdot v}v,\\quad (u-\\operatorname{proj}_v u)\\cdot v=0', conditions: '欧氏内积，v≠0；写成坐标点积时使用正交单位基。', explanation: '令余项与方向正交，即可唯一确定投影系数。' },
    exercises: [
      ex('点积、夹角与向量投影', 'u=(1,2,2)，v=(2,0,1)。求点积、夹角余弦及 u 在 v 方向的投影。', 'v·v=5，投影系数为 (u·v)/5。', [['点积与长度', 'u·v=4，|u|=3、|v|=√5，因此 cosθ=4/(3√5)。'], ['投影并核验', '投影为 (4/5)v=(8/5,0,4/5)。余项为 (−3/5,2,6/5)，与 v 点积 −6/5+6/5=0。']], '点积 4，cosθ=4/(3√5)，投影 (8/5,0,4/5)。'),
      ex('参数方向的正交条件', '求使 (1,a,1) 与 (2,−1,3) 正交的实数 a。', '两个向量都非零，令点积为零。', [['建立条件', '点积为 2−a+3=5−a，正交要求等于 0。'], ['回代检查', 'a=5 时点积 2−5+3=0，且两向量均非零，条件充分。']], 'a=5。', 2),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'affine-combination', title: 'Affine Combinations and Barycentric Coordinates', titleZh: '仿射组合',
    summary: '系数和为一，使点的组合不依赖坐标原点；非负性再限定凸包。',
    definition: '点 P₁,…,Pₘ 的仿射组合是 P=ΣαᵢPᵢ，要求 Σαᵢ=1。更换原点时各坐标统一减去同一向量，这个系数条件保证结果仍表示同一个点。若系数还都非负，则称凸组合。对三个不共线点，每个共面点具有唯一的仿射重心坐标；允许负系数时可表示三角形外的点。',
    intuition: '把总权重固定为一，组合表示一个位置，而不是受原点影响的一组位移。',
    prerequisites: ['line-plane-equations', id('analytic-geometry', 'cross-product')],
    learningNotes: ['仿射组合允许负权重；三角形内部或边界的凸组合才要求所有权重非负。', '唯一性需要点仿射无关；共线三点通常不能给出唯一的三个重心坐标。'],
    formula: { title: 'Affine coordinates and the sum-one constraint', titleZh: '仿射组合的权重条件', latex: 'P=\\sum_{i=1}^{m}\\alpha_iP_i,\\quad\\sum_{i=1}^{m}\\alpha_i=1', conditions: 'Pᵢ 为同一仿射空间中的点；若另外 αᵢ≥0，则 P 位于这些点的凸包。', explanation: '统一平移 t 后，Σαᵢ(Pᵢ+t)=P+t，说明构造与原点选择一致。' },
    exercises: [
      ex('三角形内的重心坐标', 'A=(0,0)、B=(2,0)、C=(0,2)。求 P=(1/2,1/2) 的仿射重心坐标，并判断是否位于三角形内。', '设 P=αA+βB+γC，再加上系数和为一。', [['由位置求系数', '2β=1/2、2γ=1/2，故 β=γ=1/4；α=1−β−γ=1/2。'], ['唯一性与位置', '三点不共线，坐标唯一；三个权重均为正，P 位于三角形内部。']], '重心坐标 (1/2,1/4,1/4)，位于三角形内部。'),
      ex('仿射组合可以在三角形外', '仍取 A=(0,0)、B=(2,0)、C=(0,2)，求 P=(3,1) 的仿射重心坐标。能否是三点的凸组合？', '负系数不违反仿射组合定义，但违反凸组合条件。', [['解出权重', 'β=3/2、γ=1/2，α=1−3/2−1/2=−1，所以 P=−A+(3/2)B+(1/2)C。'], ['排除凸组合', '三个点仿射无关，权重唯一，而 α 为负，故不能另找全非负权重；P 在三角形外。']], '重心坐标 (−1,3/2,1/2)；是仿射组合，不是凸组合。'),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'frames', title: 'Affine Frames and Coordinate Recovery', titleZh: '空间基与标架',
    summary: '空间坐标需要原点和有序基，斜基中的坐标不是正交投影长度。',
    definition: '三维仿射标架由一个原点 O 和三个有序线性无关向量 b₁、b₂、b₃ 构成。点 P 的坐标 c 唯一满足 P−O=Bc，其中 B 以三个基向量为列。换原点先做平移，换基再解线性方程。B 的行列式非零保证唯一，符号相对固定右手单位基描述定向。',
    intuition: '先决定从哪里出发，再决定沿哪三个方向计步，同一点会得到不同的坐标。',
    prerequisites: ['line-plane-equations', id('analytic-geometry', 'cross-product')],
    learningNotes: ['基矩阵把坐标变成几何向量，恢复坐标通常要用逆矩阵，而不是再次乘 B。', '只有正交单位基下，坐标才等于在基方向上的点积；一般斜基不能直接取点积。'],
    formula: { title: 'Coordinates relative to an affine frame', titleZh: '标架下的坐标方程', latex: 'P-O=Bc,\\quad c=B^{-1}(P-O),\\quad B=[b_1\\ b_2\\ b_3],\\ \\det B\\ne0', conditions: 'O、P 用同一外部坐标表示，b₁、b₂、b₃ 为有序基，B 按列排列。', explanation: '先减原点，再求基向量线性组合的唯一系数。' },
    exercises: [
      ex('斜基坐标不是点积', '原点不变，b₁=(1,0,0)、b₂=(1,1,0)、b₃=(0,1,1)。求向量 (3,4,2) 的基坐标，并判断基的定向。', '从第三坐标开始回代。', [['解线性组合', '设系数 c₁、c₂、c₃，依次有 c₃=2、c₂+c₃=4、c₁+c₂=3，故 c=(1,2,2)。'], ['定向与核验', '列矩阵上三角且对角均为 1，行列式为 1，属于右手定向。线性组合 (1,0,0)+(2,2,0)+(0,2,2)=(3,4,2)。']], '基坐标为 (1,2,2)，行列式 1，右手定向。'),
      ex('同时更换原点和基', '新原点 O=(1,−1,2)，基依次为 e₂、−e₁、e₃。求点 P=(3,2,5) 的新坐标。', '先求 P−O，再按新基比较分量。', [['减去新原点', 'P−O=(2,3,3)。不能把 P 的原坐标直接作为向量做换基。'], ['恢复坐标', 'c₁e₂−c₂e₁+c₃e₃=(−c₂,c₁,c₃)，与 (2,3,3) 比较得到 (c₁,c₂,c₃)=(3,−2,3)。']], '新坐标为 (3,−2,3)。'),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'gram-determinant', title: 'Gram Determinants and Volume', titleZh: '格拉姆行列式与体积',
    summary: '只用点积就能恢复面积或体积的平方，但无法恢复定向符号。',
    definition: '向量 v₁,…,vₖ 的格拉姆矩阵 G 的元素为 vᵢ·vⱼ，它半正定。在三维欧氏空间中 k≤3 时，det G 是这些向量张成的 k 维平行体体积的平方；行列式为零当且仅当向量线性相关。三个向量时等于混合积的平方，因此不携带右手或左手的符号。',
    intuition: '所有两两长度关系构成一张表，表的行列式量出向量能撑开多少空间。',
    prerequisites: ['triple-product', id('analytic-geometry', 'inner-product'), id('analytic-geometry', 'cross-product')],
    learningNotes: ['矩阵本身是点积表，不能把其中每一项误认为长度；非对角元素可能为负。', '交换向量或翻转一个向量不会改变体积平方，但会改变混合积的定向。'],
    formula: { title: 'Gram determinant as squared volume', titleZh: '体积平方的格拉姆公式', latex: 'G=(v_i\\cdot v_j)_{i,j=1}^{k},\\quad V_k^2=\\det G,\\quad 1\\le k\\le3', conditions: 'vᵢ∈R³，采用欧氏点积；Vₖ 为非负的 k 维平行体体积，相关时取零。', explanation: '三向量时 G=BᵀB，det G=(det B)²。' },
    exercises: [
      ex('用点积表核验混合积', 'u=(1,0,0)、v=(1,2,0)、w=(0,1,3)。求格拉姆行列式与平行六面体体积。', '先列出 3×3 点积表。', [['构造矩阵', 'G=[[1,1,0],[1,5,2],[0,2,10]]。按第一行展开得 1·(50−4)−1·10=36。'], ['取平方根', '体积为 √36=6；也可用 u·(v×w)=6 核验。格拉姆行列式只给正的体积平方。']], '格拉姆行列式为 36，体积为 6。'),
      ex('退化方向的格拉姆行列式', 'u=(1,0,0)、v=(2,0,0)。求格拉姆矩阵、行列式和围出面积。', '两个方向线性相关。', [['点积表', 'G=[[1,2],[2,4]]，行列式 1·4−2·2=0。'], ['解释退化', 'v=2u，两个边只撑开一条直线，二维面积为 0；矩阵仍半正定，但不正定。']], 'G=[[1,2],[2,4]]，行列式 0，面积 0。', 2),
    ],
  },
  {
    courseId: 'measure-theory', key: 'trace', title: 'Trace Sigma-Algebras', titleZh: '迹 σ 代数',
    summary: '把可测事件与子集相交，可为该子集建立自己的可测结构。',
    definition: '给定可测空间 (Ω,F) 与任意 E⊆Ω，定义 F|E={A∩E:A∈F}，称为 E 上的迹 σ 代数。这里补集相对于 E 而非 Ω。构造迹结构不要求 E∈F；但若要把原测度直接按 μ|E(B)=μ(B) 限制到所有迹事件，通常需先要求 E 可测。',
    intuition: '只观察 E 内部时，两个在外部不同的事件可能变成同一个可见事件。',
    prerequisites: ['sigma-algebra-measure', id('measure-theory', 'generated')],
    learningNotes: ['迹 σ 代数中的全集是 E，空集和相对补都要在 E 中理解。', 'E 任意时，迹事件未必属于原 F，因此不能未经检查就对其使用原测度。'],
    formula: { title: 'Restriction of a sigma-algebra to a subset', titleZh: '相交得到的迹结构', latex: '\\mathcal F|_E=\\{A\\cap E:A\\in\\mathcal F\\},\\quad E\\setminus(A\\cap E)=E\\cap A^c', conditions: '(Ω,F) 为可测空间，E⊆Ω 可任意；相对补以 E 为全集。', explanation: '原结构对可数并封闭，相交与可数并可交换，所以迹仍为 σ 代数。' },
    exercises: [
      ex('原来不可测的子集也能取迹', 'Ω={a,b,c}，F={∅,{a,b},{c},Ω}，E={a,c}。求 F|E，并判断 E 是否属于 F。', '将 F 中四个事件逐一与 E 相交。', [['列出迹事件', '依次得到 ∅、{a}、{c}、E，四个互不相同，因此迹是 E 的全部子集。'], ['区分原空间', 'E={a,c} 本身不在原 F 中，但仍能作为新全集建立迹结构；这不自动赋予原测度在 {a} 上的值。']], '迹 σ 代数共有 4 个事件：∅、{a}、{c}、E；E 不属于原 F。'),
      ex('有理数上的波莱尔迹', '求 B(R)|Q，是否等于 Q 的幂集？', 'Q 的任意子集都是可数个单点的并。', [['任意子集可测', '若 A⊆Q，则 A 可数，每个单点为 R 中的闭集，故 A 是 R 中的波莱尔集。于是 A=A∩Q 属于迹。'], ['反向包含', '每个迹事件当然都是 Q 的子集，故两个集合族相等。这里用到了 Q 可数，不能照搬到所有不可数子集。']], 'B(R)|Q=P(Q)，即 Q 的全部子集。'),
    ],
  },
  {
    courseId: 'measure-theory', key: 'product-sigma', title: 'Product Sigma-Algebras', titleZh: '乘积 σ 代数',
    summary: '可测矩形只是生成元，乘积中的可测集合通常不止矩形。',
    definition: '两个可测空间 (X,F)、(Y,G) 的乘积 σ 代数 F⊗G，是由所有 A×B（A∈F、B∈G）生成的最小 σ 代数。可测矩形族本身通常不对并封闭。乘积可测结构与乘积测度是不同层次：前者只规定哪些集合可测，后者还需要给这些集合赋予大小。',
    intuition: '先允许分别检查两个坐标，再允许用可数次事件逻辑组合成更复杂的联合事件。',
    prerequisites: ['sigma-algebra-measure', id('measure-theory', 'generated')],
    learningNotes: ['不能把“由矩形生成”理解为“每个可测集合都是一个矩形”。', '有限集且两个因子都取幂集时，单点矩形生成乘积幂集；一般空间不能直接套用这个有限结论。'],
    formula: { title: 'Sigma-algebra generated by measurable rectangles', titleZh: '可测矩形生成乘积结构', latex: '\\mathcal F\\otimes\\mathcal G=\\sigma\\bigl(\\{A\\times B:A\\in\\mathcal F,\\ B\\in\\mathcal G\\}\\bigr)', conditions: '(X,F)、(Y,G) 是给定的可测空间；这里未定义或假设任何乘积测度。', explanation: '取 σ 闭包才能保证补集及可数并交仍在结构中。' },
    exercises: [
      ex('一个坐标不可分辨时', 'X={a,b} 取平凡 σ 代数，Y={0,1} 取幂集。求乘积 σ 代数的全部事件，{(a,0)} 可测吗？', 'X 方向无法区分 a 与 b，只能按 Y 方向分成两块。', [['生成的原子块', '非空最小块为 X×{0} 与 X×{1}，它们互不相交且覆盖 X×Y。'], ['所有并与不可测例子', '所有事件为 ∅、X×{0}、X×{1}、X×Y，共 4 个。单点 {(a,0)} 不是任一块的并，因此不可测。']], '共有 4 个事件：∅、X×{0}、X×{1}、X×Y；{(a,0)} 不可测。'),
      ex('不是一个矩形的可测集合', 'X=Y={0,1} 且均取幂集。乘积 σ 代数有多少事件？对角集 D={(0,0),(1,1)} 是否是一个矩形？', '每个单点都是矩形，但两个单点的并未必是矩形。', [['全部事件可测', '四个单点矩形可生成任意子集，所以乘积 σ 代数为四点集的幂集，事件数 2⁴=16。D 是两个单点矩形的并，故可测。'], ['排除单个矩形', '若 D=A×B，包含 (0,0) 和 (1,1) 会迫使 A、B 都含 0、1，从而也包含 (0,1)，矛盾。']], '共有 16 个事件；D 可测，但不能表示为一个矩形。'),
    ],
  },
  {
    courseId: 'measure-theory', key: 'counting', title: 'Counting Measure and Series', titleZh: '计数测度',
    summary: '计数测度把积分变成求和，总质量未必为一或有限。',
    definition: '在集合 X 的幂集上，计数测度 # 给有限集合赋其元素个数，给无限集合赋 +∞。它对可数个互不相交集合满足可数可加性。对可数 X={x₁,x₂,…} 的非负函数，积分等于非负级数 Σf(xₙ)；对带符号函数，可积性等价于绝对值级数有限。',
    intuition: '每个点各放一个单位砝码，函数积分就是逐点加权后的总和。',
    prerequisites: ['sigma-algebra-measure', 'lebesgue-simple-integral'],
    learningNotes: ['无限可数集的总计数为 ∞，不是某个普通实数，也不是概率测度。', '有限集上的均匀概率是计数测度除以总点数，不能漏掉归一化。'],
    formula: { title: 'Integration with respect to counting measure', titleZh: '计数测度下的积分即级数', latex: '\\int_X f\\,d\\#=\\sum_{n=1}^{\\infty}f(x_n)', conditions: 'X={x₁,x₂,…} 无重复；f≥0 时允许 +∞；带符号时要求 Σ|f(xₙ)|<∞。', explanation: '可数求和是勒贝格积分在原子质量均为 1 时的特例。' },
    exercises: [
      ex('计数积分与均匀期望', 'X={a,b,c}，f(a)=1、f(b)=−2、f(c)=3。求计数积分与均匀概率下的期望。', '计数总质量为 3，均匀概率需除以 3。', [['计数积分', '积分为 1−2+3=2，总计数测度 #(X)=3。'], ['归一化', '均匀概率每点权重为 1/3，期望为 2/3。相同函数在不同测度下积分不同。']], '计数积分为 2，均匀概率期望为 2/3。'),
      ex('无限总质量仍可有有限积分', 'X={1,2,3,…} 取计数测度，f(n)=2^(−n)。求 ∫f d# 与 ∫1 d#。', '使用从 n=1 开始的几何级数。', [['对 f 求和', '部分和 Σₙ₌₁ᴺ2^(−n)=1−2^(−N)，N→∞ 得积分 1。'], ['对常数求和', '常数 1 的积分为 Σₙ₌₁∞1=∞。空间总质量无限，但 f 仍可积。']], '∫f d#=1，∫1 d#=∞。'),
    ],
  },
  {
    courseId: 'measure-theory', key: 'dirac', title: 'Dirac Measures and Discrete Mixtures', titleZh: '狄拉克测度',
    summary: '点质量把积分变成函数取值，点质量不是普通的勒贝格密度函数。',
    definition: '可测空间中固定 a，定义 δₐ(A)=1（a∈A）或 0（a∉A），这就是狄拉克概率测度。对非负可测函数或 δₐ 可积函数，∫f dδₐ=f(a)。有限个点质量按非负权重组合仍是测度，权重和为 1 时为概率测度。在实线波莱尔空间中，δₐ 与勒贝格测度互相奇异。',
    intuition: '所有质量集中在一个点，积分只会读取该点的函数值。',
    prerequisites: ['sigma-algebra-measure', 'lebesgue-simple-integral', id('measure-theory', 'counting')],
    learningNotes: ['δₐ 是集合上的测度；把它写成“无限高的普通函数”并不能得到一个勒贝格密度。', '讨论 f 的几乎处处性质时必须说明测度：勒贝格零集可能承载全部点质量。'],
    formula: { title: 'Integration against a point mass', titleZh: '点质量积分公式', latex: '\\int f\\,d\\delta_a=f(a),\\quad\\delta_a(A)=\\mathbf1_A(a)', conditions: 'a 为固定点，f 可测且非负或对 δₐ 可积；有限带符号取值时直接成立。', explanation: '所有不含 a 的集合质量为零，函数在别处的值不贡献积分。' },
    exercises: [
      ex('两个点质量的均值和方差', '在 R 上令 μ=0.3δ₋₁+0.7δ₂，随机变量为恒等映射 X(x)=x。求均值、二阶矩和方差。', '逐点加权，再用方差等于二阶矩减均值平方。', [['计算矩', '均值为 0.3·(−1)+0.7·2=1.1；二阶矩为 0.3·1+0.7·4=3.1。'], ['计算方差', '3.1−1.1²=1.89。也可算 0.3·(−1−1.1)²+0.7·(2−1.1)² 核验。']], '均值 1.1，二阶矩 3.1，方差 1.89。'),
      ex('为何没有普通勒贝格密度', '在 R 的波莱尔结构上，能否找到非负可测 g，使所有波莱尔 A 都满足 δ₀(A)=∫_A g dλ？λ 为勒贝格测度。', '取 A={0}，比较两种测度。', [['零集的积分', 'λ({0})=0，任何非负可测函数在该集合上的勒贝格积分均为 0，即使在 0 处取 +∞。'], ['与点质量矛盾', 'δ₀({0})=1，不可能等于 0。因此没有这种普通密度；集合 {0} 承载全部 δ₀ 质量，却是勒贝格零集。']], '不存在这样的勒贝格密度；δ₀({0})=1 而 ∫_{ {0} }g dλ=0。', 4),
    ],
  },
];

export const expansionV112Topics: Topic[] = lessons.map(({ key, formula, exercises, ...topic }) => ({
  ...topic, id: id(topic.courseId, key), sourceNote: '原创讲解与自编配套题；非教材原文、非历年真题。',
  formulaIds: [id(topic.courseId, key) + '-formula'],
  problemIds: exercises.map((_, i) => id(topic.courseId, key) + '-exercise-' + (i + 1)),
}));
export const expansionV112Formulas: Formula[] = lessons.map(({ key, courseId, formula }) => ({
  ...formula, id: id(courseId, key) + '-formula', topicId: id(courseId, key), courseId,
}));
export const expansionV112Problems: Problem[] = lessons.flatMap(({ key, courseId, exercises }) => exercises.map((exercise, i) => ({
  ...exercise, id: id(courseId, key) + '-exercise-' + (i + 1), topicId: id(courseId, key), courseId,
  formulas: [], source: { kind: 'original', label: '自编配套练习 · 非教材原题、非历年真题' },
})));

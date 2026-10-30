import type { CourseId, Formula, Problem, Topic } from '@/types';
import { roadmapTopicId } from './curriculumRoadmap';

type Exercise = Omit<Problem, 'id' | 'courseId' | 'topicId' | 'source' | 'formulas'>;
type Lesson = Omit<Topic, 'id' | 'courseId' | 'formulaIds' | 'problemIds'> & {
  courseId: CourseId; key: string;
  formula: Omit<Formula, 'id' | 'courseId' | 'topicId'>;
  exercises: Exercise[];
};
const ex = (title: string, prompt: string, hint: string, work: [string, string][], answer: string, difficulty: Problem['difficulty'] = 3): Exercise => ({
  title, prompt, hints: [hint], steps: work.map(([title, body]) => ({ title, body })), answer, difficulty,
});
const lessonId = roadmapTopicId;
// Reserved roadmap IDs become published only with a full lesson and worked exercises.
const lessons: Lesson[] = [
  {
    courseId: 'higher-algebra', key: 'division', title: 'Polynomial Division', titleZh: '多项式带余除法',
    summary: '用次数严格下降的余式，把整除、求根和辗转相除联系起来。',
    definition: '域 F 上给定多项式 f 和非零多项式 g，存在唯一 q、r 使 f=gq+r，且 r=0 或 deg r<deg g。每一步用 g 的首项消去当前余式的最高项，次数下降保证有限步终止。除数是常数时余式必为零。',
    intuition: '每消掉一个最高次项，就离一个不能继续被除数消去的小余块更近。',
    prerequisites: ['polynomial-gcd'], learningNotes: ['余式次数必须严格小于除数次数；回代相等还不足以保证已做完除法。', '系数在域中才能总是除以非零首项系数；整数系数环不具有同样的无条件结论。'],
    formula: { title: 'Euclidean division of polynomials', titleZh: '带余除法及次数约束', latex: 'f=gq+r,\\quad r=0\\ \\text{or}\\ \\deg r<\\deg g', conditions: 'f、g∈F[x]，F 为域，g≠0。', explanation: '商和满足次数约束的余式都唯一，整除等价于余式为零。' },
    exercises: [
      ex('一次除式与余数定理', '用 x−2 除 2x³−3x²+4x−5，求商和余式。', '也可在最后用 f(2) 核验余数。', [['逐次消元', '最高项依次得到 2x²、x、6。将 (x−2)(2x²+x+6) 展开为 2x³−3x²+4x−12。'], ['求余并核验', '原式比乘积多 7；常数余式次数小于 1，且 f(2)=7。']], '商 2x²+x+6，余式 7。', 2),
      ex('对二次除式求余', '求 x⁴+2x³+3x+4 除以 x²+1 的商和余式。', '余式至多一次；模 x²+1 时可用 x²≡−1。', [['先识别余式', 'x⁴≡1、x³≡−x，所以原式余式为 1−2x+3x+4=x+5。'], ['核验完整分解', '(x²+1)(x²+2x−1)+(x+5)=x⁴+2x³+3x+4，且余式次数为 1<2。']], '商 x²+2x−1，余式 x+5。'),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'multiplicity', title: 'Repeated Roots and Formal Derivatives', titleZh: '重根与形式导数',
    summary: '根的重数对应在该点连续消失的导数阶数。',
    definition: '非零多项式 f 在 a 的根重数为 m，是指 f=(x−a)^m h 且 h(a)≠0。在实数或复数域上，这等价于从零阶到 m−1 阶的导数均在 a 为零，而 m 阶导数非零。重根至少同时是 f 与 f′ 的根。',
    intuition: '因子重复越多，图像或局部展开在根附近越平坦。',
    prerequisites: ['polynomial-gcd', lessonId('higher-algebra', 'division')], learningNotes: ['先排除零多项式，它不能按这里的方式赋予某个有限重数。', '导数阶数判别在正特征域要另行讨论，不能漏掉系数域条件。'],
    formula: { title: 'Multiplicity criterion in characteristic zero', titleZh: '特征零域上的重数判别', latex: 'f(a)=\\cdots=f^{(m-1)}(a)=0,\\quad f^{(m)}(a)\\ne0', conditions: 'f 为实或复系数非零多项式，1≤m≤deg f；此时 a 恰为 m 重根。', explanation: '在 a 展开时，第一个非零系数出现在 m 次项。' },
    exercises: [
      ex('区分二重根与单根', '求 f(x)=x³−3x+2 的全部根及重数，并用导数核验。', '试根 x=1，再做多项式除法。', [['因式分解', 'f=(x−1)²(x+2)，因此候选重数是 1 处二重、−2 处一重。'], ['导数核验', 'f′=3x²−3，f′(1)=0 而 f″(1)=6≠0；f′(−2)=9≠0。']], '1 是二重根，−2 是单根。'),
      ex('用重根条件求参数', 'f(x)=x³+ax+b 在 x=1 有重根。求 a、b，并判断能否是三重根。', '同时令 f(1)=0、f′(1)=0。', [['解两个条件', '1+a+b=0，3+a=0，故 a=−3、b=2。'], ['检查更高阶', 'f″(x)=6x，在 1 处为 6≠0，所以根恰为二重，不能是三重。']], 'a=−3，b=2；恰为二重根。'),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'interpolation', title: 'Lagrange Polynomial Interpolation', titleZh: '拉格朗日插值',
    summary: '互异节点上的有限数据，唯一决定有次数上限的插值多项式。',
    definition: '给定域上 n+1 个互异节点 xᵢ 及值 yᵢ，存在唯一次数至多 n 的多项式满足 p(xᵢ)=yᵢ。拉格朗日基多项式在自己的节点为 1、其他节点为 0。唯一性来自次数至多 n 的非零多项式不可能有 n+1 个互异根。',
    intuition: '先为每个节点造一个只在该处亮起的开关，再按目标值叠加。',
    prerequisites: [lessonId('higher-algebra', 'division')], learningNotes: ['节点必须互异，否则分母可能为零；重复节点需另加导数信息。', '不限制次数时通常有无穷多解；插值也不保证区间外预测稳定。'],
    formula: { title: 'Lagrange interpolation formula', titleZh: '拉格朗日插值表达式', latex: 'p(x)=\\sum_{i=0}^{n}y_i\\prod_{j\\ne i}\\frac{x-x_j}{x_i-x_j}', conditions: 'x₀,…,xₙ 互异，yᵢ 在同一系数域中，所得次数≤n。', explanation: '逐个节点代入时，恰好只保留对应的那一项。' },
    exercises: [
      ex('三个节点确定二次多项式', '求次数至多 2 的 p，使 p(0)=1、p(1)=3、p(2)=7。', '也可设 p=ax²+bx+c 并验证唯一性。', [['求系数', 'c=1，a+b=2，4a+2b=6，得到 a=1、b=1。'], ['核验与唯一', 'p=x²+x+1 在三个节点分别为 1、3、7。两候选解之差次数≤2 却有三个不同零点，只能为零。']], 'p(x)=x²+x+1。'),
      ex('为什么必须规定次数', '要求 p(−1)=p(1)=2。次数至多 1 的解是什么？若取消次数限制，是否唯一？', 'x²−1 在两个节点都为零。', [['次数受限时', '设 p=ax+b，−a+b=2、a+b=2，故 p≡2。'], ['取消限制时', 'p=2+(x²−1)h(x) 对任意多项式 h 都满足条件。例如 x²+1 与常数 2 不同，却具有相同节点值。']], '次数≤1 时唯一为 2；无次数限制时不唯一。'),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'subspaces', title: 'The Subspace Test', titleZh: '子空间的判别',
    summary: '非空与线性组合封闭，是判断子空间的核心。',
    definition: '线性空间 V 的子集 W 若在继承的加法与数乘下也是线性空间，就叫子空间。等价地，W 非空且任意 u、v∈W、任意域元素 a、b 都有 au+bv∈W。齐次线性约束的解集是子空间，非齐次约束通常只给出仿射集合。',
    intuition: '子空间是始终通过原点、沿内部方向伸缩与叠加都不会离开的平坦结构。',
    prerequisites: ['vector-space-basis'], learningNotes: ['包含零向量只是必要条件，不足以保证子空间。', '判断线性组合封闭必须覆盖任意两个元素与任意系数，不能只挑几个例子验证。'],
    formula: { title: 'Closure under linear combinations', titleZh: '线性组合封闭判别', latex: 'W\\ne\\varnothing,\\quad u,v\\in W\\Rightarrow au+bv\\in W\\quad(\\forall a,b\\in F)', conditions: 'W 是 F 上线性空间 V 的子集，运算继承自 V。', explanation: '该条件同时保证零向量、加法封闭和数乘封闭。' },
    exercises: [
      ex('齐次平面的基', 'W={(x,y,z)∈R³:x−2y+z=0}。证明是子空间并求一组基。', '将 x 表示为自由变量 y、z 的组合。', [['验证封闭', '线性形式 x−2y+z 对线性组合也按系数组合，两个零值仍给零值；零向量在 W 中。'], ['构造基', '(x,y,z)=y(2,1,0)+z(−1,0,1)。这两向量由第二、三坐标可判无关，故为基，维数 2。']], '是子空间；基可取 (2,1,0)、(−1,0,1)，维数 2。'),
      ex('两种不同的失败方式', '判断 R² 中 A={(x,y):x+y=1} 与 B={(x,y):xy=0} 是否为子空间。', 'A 检查零向量；B 检查两个坐标方向之和。', [['非齐次约束', '零向量不满足 x+y=1，因此 A 不是子空间。'], ['零向量仍不够', '(1,0)、(0,1) 都属于 B，但和 (1,1) 不属于 B，所以 B 不对加法封闭。']], 'A、B 都不是子空间；A 缺零向量，B 不对加法封闭。', 2),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'direct-sum', title: 'Direct Sums of Subspaces', titleZh: '直和的唯一分解',
    summary: '空间相加还不够，只有交空间为零时分解才唯一。',
    definition: '子空间 U、W 的和中的每个向量都可写为 u+w。若这种表示唯一，称为直和，记为 U⊕W。对于两个子空间，唯一表示等价于 U∩W={0}。若还要得到整个 V，需另验证 U+W=V。',
    intuition: '两个互不重复的方向系统共同描述位置，坐标分配就没有歧义。',
    prerequisites: [lessonId('higher-algebra', 'subspaces'), lessonId('higher-algebra', 'dimension-formula')], learningNotes: ['U∩W={0} 只保证和为直和，不自动保证和等于预先指定的 V。', '直和不要求两空间正交；正交直和是带内积结构的额外性质。'],
    formula: { title: 'Direct-sum criterion', titleZh: '二子空间直和判别', latex: 'U+W=U\\oplus W\\iff U\\cap W=\\{0\\}', conditions: 'U、W 为同一线性空间的子空间；若记 V=U⊕W，还需 U+W=V。', explanation: '两种分解相减后得到的公共向量，只能是零。' },
    exercises: [
      ex('不正交也能直和', 'R³ 中 U=span(e₁,e₂)，W=span((1,1,1))。证明 R³=U⊕W，并分解 (2,3,4)。', 'W 的第三坐标控制其系数。', [['交与维数', '若 t(1,1,1)∈U，则第三坐标 t=0，交为零；维数 2+1=3，和覆盖 R³。'], ['求唯一分解', 'W 部分第三坐标须为 4，所以 w=(4,4,4)，u=(−2,−1,0)。两空间并不正交，但分解仍唯一。']], '(2,3,4)=(−2,−1,0)+(4,4,4)，分别属于 U 与 W。'),
      ex('有公共方向时分解不唯一', 'R² 中 U=span(e₁)，W=R²。U+W 是否为直和？给出 e₁ 的两种分解。', '整个 U 都在交空间中。', [['检查交集', 'U∩W=U≠{0}，故不是直和，尽管 U+W=R²。'], ['展示歧义', 'e₁=e₁+0，也可为 0+e₁；前项在 U、后项在 W，两个分解不同。']], '不是直和；e₁=e₁+0=0+e₁。', 2),
    ],
  },
  {
    courseId: 'higher-algebra', key: 'quotient', title: 'Quotient Vector Spaces', titleZh: '商空间',
    summary: '把只相差一个指定子空间方向的向量视作同一个元素。',
    definition: '对 V 的子空间 W，定义 v∼u 当且仅当 v−u∈W。等价类 v+W 组成商空间 V/W，类的相加与数乘由代表元运算诱导。W 中所有向量在商空间中都成为零类。有限维时商空间维数为 dim V−dim W。',
    intuition: '忽略不关心的方向，只保留不能被该子空间吸收的变化。',
    prerequisites: [lessonId('higher-algebra', 'subspaces')], learningNotes: ['商空间的元素是陪集，不是从 V 中任意挑出的一批向量。', '在等价类上定义函数要检查与代表元无关；不同代表元可能有不同点值。'],
    formula: { title: 'Dimension of a quotient', titleZh: '有限维商空间的维数', latex: '\\dim(V/W)=\\dim V-\\dim W', conditions: 'V 有限维，W≤V；零元素为 W 这个等价类。', explanation: '将 W 的基扩充为 V 的基，新增基向量的类构成商空间的基。' },
    exercises: [
      ex('忽略水平坐标', 'V=R³，W=span(e₁,e₂)。求 V/W 的维数、一组基，以及 (1,2,3)+W 的坐标。', '只剩第三坐标不能被 W 吸收。', [['商空间的基', '维数为 3−2=1，基可取 e₃+W。'], ['比较代表元', '(1,2,3)−(0,0,3)∈W，所以该类等于 3(e₃+W)，在这组基下坐标为 3。']], '维数 1；基 {e₃+W}；所给类坐标为 3。'),
      ex('多项式中忽略常数项', 'V=P₂(R)，W 为常数多项式空间。求类 [2+3x−x²] 在商基 {[x],[x²]} 下的坐标。规则 [p]↦p(0) 是否定义良好？', '同一类可以加上任意常数。', [['求商坐标', '常数项属于 W，被忽略，故 [2+3x−x²]=3[x]−[x²]，坐标为 (3,−1)。'], ['检查代表元', 'p 与 p+1 属于同一类，但在 0 的值差 1。因此点值规则不与代表元无关，不能定义为商空间上的函数。']], '坐标 (3,−1)；[p]↦p(0) 不定义良好。', 4),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'argument', title: 'Modulus and Argument', titleZh: '模与辐角',
    summary: '复数的长度单值，角度则只在相差整圈的意义下确定。',
    definition: '非零复数 z=x+iy 可写为 r(cos θ+i sin θ)，其中 r=√(x²+y²)>0，全部辐角为 θ+2kπ。本页主辐角 Arg 取 (−π,π]。乘法的模相乘，辐角相加后仍需按整圈约定归一化；零复数没有辐角。',
    intuition: '复数相乘相当于一次伸缩和一次旋转，转满一圈不会改变终点。',
    prerequisites: ['complex-roots'], learningNotes: ['arctan(y/x) 不能单独判断象限，要结合 x、y 的符号。', '主辐角的端点约定与主对数解析支的定义域是两回事；负实轴处不能据此声称主对数全纯。'],
    formula: { title: 'Multiplication in polar form', titleZh: '乘积的模与辐角', latex: '|zw|=|z||w|,\\quad\\arg(zw)\\equiv\\arg z+\\arg w\\pmod{2\\pi}', conditions: 'z、w 非零；这里的辐角等式是模 2π 的意义，不一定是主辐角的普通相等。', explanation: '乘积的长度和旋转角分别按乘法与加法组合。' },
    exercises: [
      ex('先辨象限再求角', '求 z=−√3+i 的模、主辐角与全部辐角。', '实部负、虚部正，点在第二象限。', [['模与象限', '模为 √(3+1)=2，归一化坐标是 (−√3/2,1/2)。'], ['给出角度', '主辐角为 5π/6，全部辐角为 5π/6+2kπ，k∈Z。']], '模 2，主辐角 5π/6，全部辐角 5π/6+2kπ。', 2),
      ex('相加后越过主辐角范围', 'z=e^(4πi/5)，w=e^(3πi/5)，求 Arg(zw)，与 Arg z+Arg w 比较。', '将 7π/5 减去一整圈。', [['相乘', 'zw=e^(7πi/5)，模仍为 1。'], ['归一化', '7π/5 不在 (−π,π]，减去 2π 得 −3π/5。普通的角度和与主辐角相差 2π。']], 'Arg(zw)=−3π/5；Arg z+Arg w=7π/5，二者相差 2π。'),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'exponential', title: 'The Complex Exponential', titleZh: '复指数与周期',
    summary: '实部控制长度、虚部控制旋转，周期性使复指数不是单射。',
    definition: '复指数由处处收敛的幂级数定义，并满足 e^(x+iy)=e^x(cos y+i sin y)。它处处全纯、导数等于自身、从不为零。两个复数有相同指数值当且仅当它们相差 2kπi，k 为整数；它没有单值的全局逆对数。',
    intuition: '沿实轴移动会伸缩，沿虚轴移动则沿圆旋转。',
    prerequisites: [lessonId('complex-analysis', 'argument')], learningNotes: ['|e^z|=e^(Re z)，不是通常意义下的 e^|z|。', '解 e^z=w 时 w=0 无解，w≠0 时必须包括全部周期，不只一个主值。'],
    formula: { title: 'Euler form of the complex exponential', titleZh: '复指数的欧拉表达', latex: 'e^{x+iy}=e^x(\\cos y+i\\sin y),\\quad |e^{x+iy}|=e^x', conditions: 'x、y 为实数；周期为 2πi，指数值永不为零。', explanation: '幅度取决于实部，相位取决于虚部。' },
    exercises: [
      ex('求指数方程全部解', '在复数域解 e^z=2i。', '先比较模，再比较辐角。', [['实部', '设 z=x+iy，e^x=|2i|=2，故 x=ln 2。'], ['虚部及周期', 'e^(iy)=i，故 y=π/2+2kπ，k∈Z。']], 'z=ln 2+i(π/2+2kπ)，k∈Z。', 2),
      ex('相同指数值不意味着自变量相等', '比较 e^(1+iπ) 与 e^(1−iπ) 的值及模，并说明是否能由相等的指数值得到自变量相等。', '两个虚部相差 2π。', [['直接计算', 'cos(±π)=−1，sin(±π)=0，所以两者都等于 −e，模都为 e。'], ['检查单射性', '1+iπ 与 1−iπ 是不同复数，但差为 2πi。因此复指数不是单射，不能直接“消掉 e”。']], '两者均为 −e，模 e；不能推出自变量相等。', 2),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'powers', title: 'Multivalued Complex Powers', titleZh: '复幂的多值性',
    summary: '先选对数再定义幂；不同对数值可能给出不同幂值。',
    definition: '非零复数 z 的复幂 z^a 按 exp(a log z) 定义全部值，其中 log z 包括相差 2kπi 的全部对数。指定解析对数支后，exp(a Log z) 才是该支的单值幂函数。整数指数时所有对数选择给出相同结果，非整数时一般多值。',
    intuition: '底数绕原点多走的一整圈，经指数 a 缩放后不一定仍是一整圈。',
    prerequisites: [lessonId('complex-analysis', 'log-branches'), lessonId('complex-analysis', 'exponential')], learningNotes: ['主值只是所有值中的一个，不能默认题目只求主值。', '分数幂的嵌套、乘积法则依赖分支和定义域，不应机械沿用实数运算法则。'],
    formula: { title: 'All values of a complex power', titleZh: '复幂的全部值', latex: 'z^a=\\left\\{\\exp\\!\\left(a(\\ln|z|+i(\\theta+2k\\pi))\\right):k\\in\\mathbb Z\\right\\}', conditions: 'z≠0，θ 是 z 的任一辐角，a∈C；集合形式表示全部值。', explanation: '对数的每种取值代入指数，重复的结果只算一次。' },
    exercises: [
      ex('平方根的全部值与主值', '求 i^(1/2) 的全部值，并指出由主对数得到的主值。', '把 π/2+2kπ 除以 2。', [['计算全部值', 'exp(iπ/4+ikπ)=±(1+i)/√2，只有两个不同值。'], ['选主值', '主对数 Log i=iπ/2，代入 exp((1/2)Log i) 得 (1+i)/√2。']], '全部值 ±(1+i)/√2；主值 (1+i)/√2。'),
      ex('虚数的虚数次幂也可为实数', '求 i^i 的全部值与主值。', 'i·i(π/2+2kπ) 是实数。', [['代入所有对数', 'i 的对数为 i(π/2+2kπ)，乘以 i 后成为 −π/2−2kπ。'], ['指数与主值', '全部值为 e^(−π/2−2kπ)，都是正实数且两两不同；主对数对应 k=0。']], '全部值 e^(−π/2−2kπ)，k∈Z；主值 e^(−π/2)。', 4),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'contours', title: 'Contour Parametrization and Orientation', titleZh: '围道参数化与方向',
    summary: '复线积分沿参数方向累加，反向会改变积分符号。',
    definition: '若 γ:[a,b]→C 分段 C¹，f 在曲线迹上连续，定义沿 γ 的积分为 ∫f(γ(t))γ′(t)dt。方向保持的合法重参数化不改积分，反向参数化使积分变号。路径无关性则需原函数等额外条件，并非所有连续被积函数都具备。',
    intuition: '沿曲线行走时，被积函数还要乘每一步带方向的位移 dz。',
    prerequisites: ['cauchy-integral-formula'], learningNotes: ['dz=γ′(t)dt，不能只替换 z 却忘掉导数因子。', '共轭函数在平面上不全纯；闭曲线积分不一定为零。'],
    formula: { title: 'Parametric contour integral', titleZh: '复线积分的参数表达', latex: '\\int_\\gamma f(z)\\,dz=\\int_a^b f(\\gamma(t))\\gamma^{\\prime}(t)\\,dt', conditions: 'γ 分段 C¹，f 在曲线迹上连续；不要求 f 全纯才能定义积分。', explanation: '右端是实参数下的复值函数积分。' },
    exercises: [
      ex('直线段与反向积分', '沿从 0 到 1+i 的直线段计算 ∫ z dz，再求反向路径的积分。', '取 γ(t)=(1+i)t，0≤t≤1。', [['参数代入', 'γ′=1+i，被积乘积为 (1+i)²t=2it，积分为 i。'], ['反向', '反向路径积分变号，所以为 −i；也可由原函数 z²/2 核验。']], '正向积分 i，反向积分 −i。', 2),
      ex('闭曲线上共轭函数的积分', '沿逆时针圆 |z|=2 计算 ∮ z̄ dz。为什么不能直接说闭曲线积分为零？', '取 z=2e^(it)，0≤t≤2π。', [['按参数相乘', 'z̄=2e^(−it)，dz=2ie^(it)dt，乘积为 4i dt，积分为 8πi。'], ['检查定理前提', 'z̄ 不是全纯函数，不能使用需要全纯性的闭路积分为零结论。']], '8πi；共轭函数不全纯，闭曲线本身不足以保证积分为零。'),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'removable', title: 'Removable Singularities', titleZh: '可去奇点判别',
    summary: '能在缺失点填入一个值，使函数继续全纯，才叫可去。',
    definition: '设 f 在 a 的去心圆盘内全纯。若存在有限复极限 lim(z→a)f(z)，在 a 填入该值就得到唯一全纯延拓。等价条件是 f 在某个去心邻域有界，或其洛朗展开没有负幂项。单凭留数为零不能保证可去，因为更高阶负幂仍可能存在。',
    intuition: '图像只是漏标了一个点，而不是在该点真正爆炸。',
    prerequisites: ['laurent-expansion'], learningNotes: ['极限必须与所有复方向一致，不是只沿实轴求极限。', '留数仅是 (z−a)^(−1) 的系数；不能据此忽略其他负幂项。'],
    formula: { title: 'Finite limit and removable extension', titleZh: '有限极限给出的可去延拓', latex: '\\lim_{z\\to a}f(z)=L\\in\\mathbb C\\quad\\Longrightarrow\\quad\\widetilde f(a)=L', conditions: 'f 在 a 的某个去心圆盘全纯；延拓在其他点保持原函数值。', explanation: '有限极限加去心全纯性保证补点后也全纯。' },
    exercises: [
      ex('正弦商的补点与导数', 'f(z)=sin z/z，z≠0。求在 0 的全纯延拓值与延拓函数在 0 的导数。', '使用 sin z 的幂级数。', [['展开', 'sin z/z=1−z²/6+z⁴/120−…，在 0 附近没有负幂项。'], ['读取系数', '补点值为常数项 1，一次项系数为 0，因此延拓后的导数为 0。']], '延拓值 1，延拓函数在 0 的导数为 0。'),
      ex('留数为零却不可去', 'f(z)=1/z² 在 0 的留数是多少？0 是否可去？', '洛朗展开中没有 z^(−1)，但有 z^(−2)。', [['读取留数', 'z^(−1) 的系数为 0，所以留数为零。'], ['判断奇点', '沿正实轴趋零，1/z² 无界，没有有限极限；0 是二阶极点，不是可去奇点。']], '留数 0；0 是二阶极点，不可去。'),
    ],
  },
  {
    courseId: 'complex-analysis', key: 'poles', title: 'Poles and Residues', titleZh: '极点与留数',
    summary: '极点阶数描述发散强度，留数只提取决定围道积分的一项。',
    definition: '若 f 在 a 的去心邻域全纯且 (z−a)^m f(z) 可延拓为在 a 非零的全纯函数，a 就是 m 阶极点。留数为洛朗展开的一次负幂系数。将极点消去后求 m−1 阶导数，可直接提取这个系数。阶数与留数是不同的信息。',
    intuition: '先把强烈的负幂外壳剥掉，再从剩下的常规泰勒展开中读出所需系数。',
    prerequisites: ['laurent-expansion', 'residue-theorem'], learningNotes: ['必须确认是几阶极点，不能对二阶极点直接套简单极点的极限公式。', '抵消公因子后阶数可能下降；分母有几重零不一定就是商的极点阶数。'],
    formula: { title: 'Residue at a pole of order m', titleZh: 'm 阶极点的留数', latex: '\\operatorname{Res}(f,a)=\\frac{1}{(m-1)!}\\left.\\frac{d^{m-1}}{dz^{m-1}}\\left[(z-a)^m f(z)\\right]\\right|_{z=a}', conditions: 'a 是 f 的 m 阶极点；方括号内函数先在 a 作全纯延拓。', explanation: '取出消去极点后的 m−1 次泰勒系数。' },
    exercises: [
      ex('简单极点的系数', '求 f(z)=(z+1)/(z−2) 在 2 的极点阶数和留数。', '改写为 1+3/(z−2)。', [['确认阶数', '分子在 2 为 3 非零，分母单零，所以为一阶极点。'], ['取系数', 'f=1+3/(z−2)，留数为 3；也可计算 lim(z→2)(z−2)f(z)。']], '2 是一阶极点，留数 3。', 2),
      ex('二阶极点也可能只有小留数', '求 e^z/z² 在 0 的阶数和留数，并计算沿逆时针单位圆的积分。', '消去 z² 后对 e^z 求一次导数。', [['阶数和留数', 'e⁰=1≠0，故为二阶极点；留数为 (e^z)′ 在 0 的值，即 1。'], ['应用留数定理', '单位圆内只有这一极点，正向积分为 2πi×1=2πi。']], '二阶极点，留数 1；积分 2πi。', 4),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'cross-product', title: 'Cross Products and Area', titleZh: '叉积与面积',
    summary: '叉积同时给出法向方向与平行四边形面积。',
    definition: '在三维定向正交坐标系中，u×v 是垂直于 u、v 的向量，方向遵循右手规则，长度为 |u||v|sin θ。它对每个变量线性且交换次序变号；平行向量叉积为零。三角形面积是相应平行四边形面积的一半。',
    intuition: '两个边张开得越大，扫出的面积越大，法向箭头记录张开的方向。',
    prerequisites: ['triple-product'], learningNotes: ['叉积不是点积：一个输出向量，一个输出标量。', '交换两向量会改变法向方向，但不改变面积；坐标公式依赖右手正交坐标约定。'],
    formula: { title: 'Triangle area from the cross product', titleZh: '叉积给出的三角形面积', latex: 'S_{\\triangle}=\\frac12\\|u\\times v\\|,\\quad u\\times v=(u_2v_3-u_3v_2,u_3v_1-u_1v_3,u_1v_2-u_2v_1)', conditions: 'u、v 是同一顶点出发的两条边，使用三维右手正交坐标系。', explanation: '取模消除方向，除以二从平行四边形得到三角形。' },
    exercises: [
      ex('不在坐标平面的面积', '由 u=(1,2,0)、v=(0,1,3) 张成的三角形面积是多少？给一个法向量。', '先按分量计算叉积，再取模。', [['计算法向', 'u×v=(6,−3,1)，与 u 点积为 6−6=0，与 v 点积为 −3+3=0。'], ['取模求面积', '叉积长度为 √(36+9+1)=√46，三角形面积为 √46/2。']], '法向量可取 (6,−3,1)，面积 √46/2。'),
      ex('三个坐标点决定的平面', 'A=(1,0,0)，B=(0,1,0)，C=(0,0,1)。求三角形面积及所在平面方程。', '取 AB 与 AC，而不是直接拿 B、C 作两条边。', [['边与法向', 'AB=(−1,1,0)，AC=(−1,0,1)，叉积为 (1,1,1)。'], ['平面与面积', '过 A 的平面为 (x−1)+y+z=0，即 x+y+z=1；叉积模为 √3，面积 √3/2。']], '面积 √3/2；平面 x+y+z=1。'),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'orthogonal-change', title: 'Orthogonal Coordinate Changes', titleZh: '正交坐标变换',
    summary: '换到另一组正交单位基时，坐标改变，长度和夹角不变。',
    definition: '设新旧坐标系原点相同，Q 的列是在旧基中表示的新正交单位基，则 QᵀQ=I，旧坐标 x 与新坐标 x′ 满足 x=Qx′，所以 x′=Qᵀx。正交变换保持点积、长度和距离；行列式为 −1 的情形还会翻转定向。',
    intuition: '换一把摆放方向不同的直角尺，物体没动，只是读数改变。',
    prerequisites: [lessonId('analytic-geometry', 'direction-cosines'), 'orthogonality'], learningNotes: ['这里讨论换基读数，和对固定坐标系主动旋转物体的矩阵方向不同。', '平移原点还需先减去新原点位置；正交矩阵不能单独表示平移。'],
    formula: { title: 'Coordinates in a new orthonormal frame', titleZh: '同原点正交换基公式', latex: 'x^{\\prime}=Q^T x,\\quad Q^TQ=I,\\quad\\|x^{\\prime}\\|=\\|x\\|', conditions: 'Q 的列为新基在旧正交单位基中的坐标，两坐标系原点相同。', explanation: '逆矩阵等于转置，因而点积和长度保持不变。' },
    exercises: [
      ex('新基转了九十度', '新基为 e₁′=(0,1,0)、e₂′=(−1,0,0)、e₃′=(0,0,1)。求旧坐标 (2,3,4) 的新坐标。', '新坐标分别是与三个新单位基的点积。', [['取投影', '三个点积为 3、−2、4，所以新坐标是 (3,−2,4)。'], ['核验不变量', '旧长度平方为 4+9+16=29，新长度平方为 9+4+16=29；由 3e₁′−2e₂′+4e₃′ 可还原原向量。']], '新坐标 (3,−2,4)，长度仍为 √29。'),
      ex('保持长度是否就是旋转', 'Q=diag(1,1,−1) 是否正交？是否保持长度？是否保持右手定向？', '检查 QᵀQ 与 det Q。', [['正交与长度', 'QᵀQ=I，把 (x,y,z) 变为 (x,y,−z)，长度平方不变。'], ['定向', 'det Q=−1，因此它是关于 xy 平面的反射，翻转定向，不是保定向的空间旋转。']], '正交且保长度，但翻转定向，是反射。'),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'line-plane-angle', title: 'Angle Between a Line and a Plane', titleZh: '线面夹角',
    summary: '线面夹角是方向向量与法向量夹角的余角，要用正弦公式。',
    definition: '直线与平面的无向夹角 θ 取 [0,π/2]，定义为直线方向与其平面投影方向的夹角；垂直时按 π/2 处理。方向向量 v 与法向量 n 的点积绝对值，除以两者长度乘积，得到 sin θ。θ=0 只说明方向平行，直线可能在平面内也可能不在。',
    intuition: '法向量指向离开平面的方向，方向向量在这条方向上投影越大，线就越陡。',
    prerequisites: ['line-plane-equations', lessonId('analytic-geometry', 'direction-cosines')], learningNotes: ['不要把这里的 sin θ 误写成 cos θ；点积直接给的是与法线的夹角余弦。', '平面法向量和直线方向向量均须非零；判断包含关系还需要直线上的点。'],
    formula: { title: 'Line–plane angle', titleZh: '线面夹角的正弦公式', latex: '\\sin\\theta=\\frac{|v\\cdot n|}{\\|v\\|\\|n\\|},\\quad 0\\le\\theta\\le\\frac\\pi2', conditions: 'v≠0 为直线方向，n≠0 为平面法向量，θ 取无向小夹角。', explanation: '法向投影长度占总长度的比例，等于线面夹角的正弦。' },
    exercises: [
      ex('倾斜方向与水平平面', '方向向量 (1,1,√2) 的直线与平面 z=0 的夹角是多少？', '法向量为 (0,0,1)，方向向量长度为 2。', [['计算正弦', '点积绝对值为 √2，两长度乘积为 2，所以 sin θ=√2/2。'], ['选定范围', 'θ∈[0,π/2]，因此 θ=π/4。直线经过哪个点不影响这个夹角。']], 'π/4，即 45°。', 2),
      ex('零夹角不意味着线在面内', '直线 (x,y,z)=(0,0,2)+t(1,2,0) 与平面 z=5 的夹角是多少？直线是否在平面内？', '方向点积为零，但直线高度恒为 2。', [['方向关系', 'v·n=0，所以 sin θ=0，线面夹角为 0。'], ['位置关系', '直线上的所有点都满足 z=2，不满足 z=5，所以直线与平面平行且不包含于其中。']], '夹角 0；直线不在平面内，与平面平行。', 2),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'skew-closest', title: 'Common Perpendiculars of Skew Lines', titleZh: '异面直线的公垂线',
    summary: '最短连接向量同时垂直两条直线的方向。',
    definition: '两条非平行直线 L₁=A+su、L₂=B+tv，若不相交则异面。最短距离为 B−A 在 u×v 的单位方向上投影长度。公垂线端点可通过连接向量分别与 u、v 点积为零求出。若方向平行，叉积为零，须改用平行线距离公式。',
    intuition: '沿任一直线方向继续挪动端点都不能再缩短距离时，连接线必与两个方向都成直角。',
    prerequisites: ['spatial-distances', lessonId('analytic-geometry', 'cross-product')], learningNotes: ['非平行但相交时同一距离公式给零；要称为异面还需排除相交。', '点到另一条直线的垂足不一定给出两条直线的最短距离，需同时优化两个参数。'],
    formula: { title: 'Distance between nonparallel lines', titleZh: '非平行空间直线的距离', latex: 'd=\\frac{|(B-A)\\cdot(u\\times v)|}{\\|u\\times v\\|}', conditions: 'u、v 非零且不平行；分子非零时两线异面，分子为零时两线相交。', explanation: '两条线方向上的移动都不改变沿公共法向的投影。' },
    exercises: [
      ex('上下两条坐标方向线', 'L₁=(s,0,0)，L₂=(0,t,1)。求距离和公垂线端点。', '方向为 e₁、e₂，公共法向为 e₃。', [['投影距离', 'B−A 可取 (0,0,1)，与公共单位法向点积为 1，所以距离为 1。'], ['端点', '连接向量为 (−s,t,1)，与 e₁、e₂ 点积都为零给 s=t=0，端点为 (0,0,0)、(0,0,1)。']], '距离 1，端点 (0,0,0) 与 (0,0,1)。'),
      ex('两个参数都要优化', 'L₁=(s,0,0)，L₂=(0,1+t,t)。求距离和最近点对。', '连接向量 (−s,1+t,t) 应同时垂直 (1,0,0) 与 (0,1,1)。', [['解垂直条件', '与第一方向点积为 −s，故 s=0；与第二方向点积为 1+2t，故 t=−1/2。'], ['求距离并核验', '最近点为 (0,0,0)、(0,1/2,−1/2)，距离为 √(1/4+1/4)=1/√2。叉积公式也给 1/√2。']], '距离 1/√2；最近点 (0,0,0)、(0,1/2,−1/2)。', 4),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'sphere-equation', title: 'Completing Squares for Spheres', titleZh: '球面方程与配方',
    summary: '标准球面、单点与空集，只差配方后半径平方的符号。',
    definition: '在正交直角坐标中，方程 x²+y²+z²+Dx+Ey+Fz+G=0 配方后，中心为 (−D/2,−E/2,−F/2)，半径平方为 (D²+E²+F²)/4−G。它为正才是通常球面，为零退化成单点，为负没有实点。二次项系数不同或含交叉项时不能直接套这个式子。',
    intuition: '配方把混在坐标里的平移还原为球心位置，再看剩下多少半径。',
    prerequisites: ['quadric-surfaces'], learningNotes: ['球面是满足等式的边界，不是半径内全部点构成的球体。', '从一般二次方程识别球面时先检查三个平方项等系数且无交叉项。'],
    formula: { title: 'Center and radius after completing squares', titleZh: '配方后的球心与半径平方', latex: 'C=(-D/2,-E/2,-F/2),\\quad R^2=\\frac{D^2+E^2+F^2}{4}-G', conditions: '方程平方项均为 1 且无交叉项；R²>0 为球面，R²=0 为点，R²<0 为空集。', explanation: '对三个坐标分别配方，常数项总计补入 (D²+E²+F²)/4。' },
    exercises: [
      ex('由展开式找球心', '求 x²+y²+z²−2x+4y−6z+5=0 的球心、半径。', '分别对 x、y、z 配方。', [['完成平方', '(x−1)²+(y+2)²+(z−3)²=1+4+9−5=9。'], ['读取几何量', '球心为 (1,−2,3)，半径为正平方根 3，而不是 9。']], '球心 (1,−2,3)，半径 3。', 2),
      ex('参数改变几何类型', '按实参数 c 分类 x²+y²+z²+2x−4y+2z+c=0 的实点集。', '固定中心后检查 6−c 的正负。', [['配方', '(x+1)²+(y−2)²+(z+1)²=6−c，中心候选为 (−1,2,−1)。'], ['分类', 'c<6 时半径 √(6−c) 的球面；c=6 时只有中心；c>6 时非负平方和不能为负，无实点。']], 'c<6 为球面，c=6 为单点 (−1,2,−1)，c>6 为空集。'),
    ],
  },
  {
    courseId: 'analytic-geometry', key: 'tangent-plane', title: 'Tangent Planes to Spheres', titleZh: '球面的切平面',
    summary: '球面在一点的法向，就是从球心指向该点的半径。',
    definition: '球心 C、半径 R>0 的球面，在球面上一点 P 的切平面垂直于非零向量 P−C，并经过 P。切平面的点 X 满足 (P−C)·(X−P)=0。球心到该平面的距离恰为 R，可作为独立核验。若 P 不在球面上，这个平面一般不是球面的切平面。',
    intuition: '接触处的平面沿球面滑过，而半径正对着接触方向。',
    prerequisites: ['line-plane-equations', lessonId('analytic-geometry', 'sphere-equation')], learningNotes: ['先验证切点在球面上；不能把任意外点直接代入切点公式。', '球半径为零时是单点，不能再用非零法向唯一指定切平面。'],
    formula: { title: 'Tangent plane at a point on a sphere', titleZh: '球面点处的切平面', latex: '(P-C)\\cdot(X-P)=0,\\quad\\|P-C\\|=R>0', conditions: 'P 必须在球心 C、半径 R 的球面上，X 表示平面上的任意点。', explanation: '平面内位移 X−P 与半径方向正交。' },
    exercises: [
      ex('偏移球面的切平面', '球心 (1,−2,3)，半径 3。在 P=(1,1,3) 求切平面。', '半径向量只有 y 分量非零。', [['核验切点', 'P−C=(0,3,0)，长度为 3，确在球面上。'], ['写平面并核验', '(0,3,0)·(x−1,y−1,z−3)=0，得到 y=1；球心到它距离 |−2−1|=3。']], '切平面 y=1。', 2),
      ex('外点误当切点', '球面 x²+y²+z²=9。有人在 Q=(3,3,0) 套公式写出平面 x+y=6，称其为切平面。判断并解释。', '先算 Q 到球心的距离，再算球心到该平面的距离。', [['切点前提不成立', 'Q 的长度为 √18=3√2，不是半径 3，因此 Q 不在球面上。'], ['检查所写平面', '原点到 x+y=6 的距离为 6/√2=3√2>3，平面与球面甚至不相交，更不是切平面。']], '错误；Q 不在球面上，x+y=6 与球面不相交。'),
    ],
  },
  {
    courseId: 'measure-theory', key: 'set-limits', title: 'Limit Superior and Inferior of Sets', titleZh: '集合上下极限',
    summary: '最终一直属于，与反复无穷多次属于，是不同的成员条件。',
    definition: '集合列 Aₙ 的下极限由那些从某项起始终属于 Aₙ 的点组成；上极限由属于无穷多个 Aₙ 的点组成。下极限总包含于上极限，二者相等时称集合列收敛。若每个 Aₙ 可测，可数并交保证它们的上下极限也可测。',
    intuition: '“以后每次都来”比“以后还会来无穷多次”要求更强。',
    prerequisites: ['sigma-algebra-measure'], learningNotes: ['上极限不是所有集合的并；只出现有限次的点最终被排除。', '集合上下极限与拓扑中的聚点集合不同，不能只看端点的几何趋近。'],
    formula: { title: 'Set liminf and limsup', titleZh: '集合上下极限的可数并交', latex: '\\liminf A_n=\\bigcup_{m=1}^\\infty\\bigcap_{n\\ge m}A_n,\\quad\\limsup A_n=\\bigcap_{m=1}^\\infty\\bigcup_{n\\ge m}A_n', conditions: 'Aₙ 为同一全集的子集；若均可测，则上下极限也可测。', explanation: '下极限先要求尾部全部满足，上极限要求任意尾部至少一次满足。' },
    exercises: [
      ex('两个区间交替出现', 'A₂ₙ₋₁=[0,1]，A₂ₙ=[1,2]。求集合下极限与上极限。', '共有点最终每次出现，其余点隔一次出现。', [['下极限', '每个尾部都同时含两类区间，所以最终一直出现的只有交集 {1}。'], ['上极限', '两区间中的每一点都至少出现在一个奇偶子列中，出现无穷次，故上极限为 [0,2]。']], '下极限 {1}，上极限 [0,2]。'),
      ex('趋向零却不包含零', 'Aₙ=(0,1/n)，求上下极限。0 是不是上极限的元素？', '固定一个点后，再看它属于多少项。', [['正点与非正点', '每个 x>0 在 n>1/x 时就不再属于 Aₙ；每个 x≤0 从来不属于。'], ['成员结论', '没有点属于无穷多项，因此上极限为空，下极限也为空。0 虽是端点的极限，却从未属于任何 Aₙ。']], '上下极限均为空集；0 不属于上极限。'),
    ],
  },
  {
    courseId: 'measure-theory', key: 'generated', title: 'Generated Sigma Algebras', titleZh: '生成的 σ 代数',
    summary: '从指定集合出发，补齐对补集和可数并的封闭性。',
    definition: '集合族 C 生成的 σ 代数 σ(C)，是包含 C 的所有 σ 代数的交，也是包含 C 的最小 σ 代数。有限全集时，可按各生成集的成员资格把全集分成不可再区分的原子块，生成的 σ 代数就是这些块的任意并。',
    intuition: '生成集像观察窗口，能区分的点才会被分进不同的可测块。',
    prerequisites: ['sigma-algebra-measure'], learningNotes: ['把生成集列出来还不等于得到 σ 代数，必须满足规定的封闭运算。', '有限全集上可使用有限原子分块；无限情形不能机械地说任意原子并都可测。'],
    formula: { title: 'Minimal sigma algebra containing a family', titleZh: '生成 σ 代数的最小性', latex: '\\sigma(\\mathcal C)=\\bigcap\\{\\mathcal F:\\mathcal F\\text{ is a sigma algebra},\\ \\mathcal C\\subseteq\\mathcal F\\}', conditions: 'C 是同一全集 Ω 的子集族；幂集总是一个候选 σ 代数。', explanation: '候选族非空，任意 σ 代数之交仍是 σ 代数。' },
    exercises: [
      ex('一个观测集合生成多少信息', 'Ω={a,b,c,d}，A={a,b}。求 σ({A})。{a} 是否必在其中？', '除 A 外至少还需补集、空集和全集。', [['封闭候选', '{∅,{a,b},{c,d},Ω} 已对补集和可数并封闭，且包含 A。'], ['最小性', '任何包含 A 的 σ 代数都必须含上述四个集合，所以这就是生成结果；其中没有 {a}。']], 'σ({A})={∅,{a,b},{c,d},Ω}；不包含 {a}。', 2),
      ex('两个交叉观测区分所有点', 'Ω={1,2,3,4}，A={1,2}，B={2,3}。σ({A,B}) 有多少个集合？', '计算交、差及同时在两者之外的部分。', [['分出原子', 'A∩B={2}，A∖B={1}，B∖A={3}，(A∪B)ᶜ={4}。四个单点都可测。'], ['取全部并', '任意子集都是这些单点的并，故生成 σ 代数是整个幂集，有 2⁴=16 个集合。']], '整个幂集，共 16 个集合。'),
    ],
  },
  {
    courseId: 'measure-theory', key: 'borel', title: 'The Borel Sigma Algebra', titleZh: '波莱尔 σ 代数',
    summary: '开集经过可数次集合运算，产生实分析中最常用的可测结构。',
    definition: '实线的波莱尔 σ 代数 B(R) 是所有开集生成的 σ 代数；等价地，可由有理端点开区间生成。闭集、半开区间、可数集合都在其中，但波莱尔并不是“开或闭”的同义词。可数操作是定义的一部分，任意不可数并不自动保持波莱尔性。',
    intuition: '从能用开区间观察的事件出发，逐步组合出更细致但仍可追踪的集合。',
    prerequisites: [lessonId('measure-theory', 'generated')], learningNotes: ['σ 代数对可数并封闭，不是对任意并封闭。', '波莱尔可测性与相对某测度的完备化不同；不要把“波莱尔集”与“所有勒贝格可测集”直接等同。'],
    formula: { title: 'A countable generator of real Borel sets', titleZh: '有理端点区间生成波莱尔集', latex: '\\mathcal B(\\mathbb R)=\\sigma\\{(p,q):p,q\\in\\mathbb Q,\\ p<q\\}', conditions: '实线取通常拓扑；有理端点开区间组成一个可数拓扑基。', explanation: '每个开集都是这个可数基中适当成员的并。' },
    exercises: [
      ex('稠密的可数集仍可测', '说明 Q∩[0,1] 是波莱尔集，并求其勒贝格测度。', '将有理数逐个列出，利用单点集闭且测度为零。', [['可测性', '每个有理单点为闭集，集合 Q∩[0,1] 是可数个闭单点的并，因此是波莱尔集。'], ['测度', '每个单点勒贝格测度为零，可数次可加性给总测度为零；稠密不意味着正测度。']], '是波莱尔集，勒贝格测度为 0。'),
      ex('非开非闭并不妨碍波莱尔性', '把 [0,1) 表为开区间的可数交，说明它是否为波莱尔集。', '左端点可通过逐步从负侧靠近来保留。', [['给出表示', '[0,1)=∩ₙ≥₁(−1/n,1)。0 属于每项，所有负数最终被排除，1 从不属于。'], ['使用封闭性', '开区间波莱尔可测，可数交仍波莱尔可测。该集虽非开也非闭，仍在 B(R) 中。']], '[0,1)=∩ₙ≥₁(−1/n,1)，是波莱尔集。'),
    ],
  },
  {
    courseId: 'measure-theory', key: 'composition', title: 'Composition of Measurable Maps', titleZh: '可测函数的复合',
    summary: '可测性通过逆像传递，但中间空间的可测结构必须匹配。',
    definition: '若 f:(Ω,F)→(S,Σ) 与 g:(S,Σ)→(T,Τ) 可测，则 g∘f 可测，因为逆像满足复合恒等式。实值可测函数再复合连续实函数仍可测。只知道复合结果可测，不能反推每一层都可测。',
    intuition: '从目标事件向回追踪两次，得到源空间中仍在可测清单上的事件。',
    prerequisites: ['measurable-functions'], learningNotes: ['f 的目标 σ 代数必须与 g 的源 σ 代数一致，不能省略中间结构。', '这里说的是逆像保可测性；可测函数的正向像不一定具有对应的可测性。'],
    formula: { title: 'Preimages under composition', titleZh: '复合函数的逆像恒等式', latex: '(g\\circ f)^{-1}(B)=f^{-1}(g^{-1}(B))', conditions: 'B∈Τ，f、g 对各自指定且匹配的 σ 代数可测。', explanation: '先回到中间空间，再回到源空间，两次可测逆像保证结论。' },
    exercises: [
      ex('平方保持实值可测性', 'f 为实值可测函数。证明 f² 可测，并写出 {f²>t}。', '平方函数连续；也可分别讨论 t 的符号。', [['写出逆像', 't<0 时事件为 Ω；t≥0 时为 {f>√t}∪{f<−√t}。'], ['可测性', '右端事件都由 f 的可测性得到，因此对所有 t 都可测，证明 f² 可测。']], 'f² 可测；t≥0 时 {f²>t}={f>√t}∪{f<−√t}，t<0 时为 Ω。'),
      ex('复合可测不能倒推外层可测', 'S={a,b}，Σ={∅,S}。令 g(a)=0、g(b)=1，目标为实线波莱尔结构；f 从单点空间恒映为 a。判断 g 与 g∘f 是否可测。', '检查 g 对单点 {0} 的逆像。', [['外层失败', 'g⁻¹({0})={a} 不在 Σ 中，所以 g 不可测；f 对 Σ 的逆像只有空集与全集，故 f 可测。'], ['复合却成功', 'g∘f 恒为 0，是常函数，当然可测。这说明不能由复合可测倒推 g 可测。']], 'g 不可测，f 与 g∘f 可测。', 4),
    ],
  },
  {
    courseId: 'measure-theory', key: 'limits', title: 'Limits of Measurable Functions', titleZh: '可测函数列的极限',
    summary: '可数上确界和点态极限保持可测，不代表保持连续。',
    definition: '同一可测空间上的可测实函数列，其可数上确界、下确界、上极限与下极限在扩展实数意义下可测。若点态极限存在且有限，它也是实值可测函数。证明通过把水平集写成可数并交；换成不可数族时一般没有这种保证。',
    intuition: '无穷次但可数的阈值比较，仍能用 σ 代数的封闭规则描述。',
    prerequisites: ['measurable-functions', lessonId('measure-theory', 'set-limits')], learningNotes: ['点态极限保持可测性，但连续函数的点态极限未必连续。', '上确界不需要在某一个下标处达到；也可能取无穷值，要明确目标空间。'],
    formula: { title: 'Level set of a countable supremum', titleZh: '可数上确界的水平集', latex: '\\left\\{\\sup_{n\\ge1}f_n>a\\right\\}=\\bigcup_{n=1}^\\infty\\{f_n>a\\}', conditions: 'fₙ 均可测，a∈R；左边允许上确界为 +∞。', explanation: '上确界严格超过阈值，当且仅当至少有一项严格超过该阈值。' },
    exercises: [
      ex('连续函数的极限可以跳跃', '在 [0,1] 上 fₙ(x)=xⁿ。求点态极限，判断极限的连续性与波莱尔可测性。', '分开 x<1 与 x=1。', [['逐点求极限', '0≤x<1 时 xⁿ→0，x=1 时恒为 1，所以极限为 {1} 的示性函数。'], ['区分两种性质', '极限在 1 处不连续，但 {1} 是闭集，示性函数波莱尔可测，也符合可测函数列极限定理。']], '极限是集合 {1} 的示性函数，在 1 不连续，但波莱尔可测。'),
      ex('没有最大项的上确界', '实线上 fₙ(x)=x−1/n。求 supₙfₙ(x)，是否由某一项达到？结果是否可测？', '固定 x 后，项值从下方趋于 x。', [['求上确界', '每项都小于 x，而任意小于 x 的数最终被某项超过，故上确界恰为 x。'], ['最大值与可测性', '没有任何有限 n 达到 x，所以没有最大项；上确界函数 x 本身连续，因而波莱尔可测。']], '上确界为 x，任何一项都不达到；结果可测。'),
    ],
  },
  {
    courseId: 'measure-theory', key: 'simple-approximation', title: 'Monotone Simple-Function Approximation', titleZh: '简单函数的单调逼近',
    summary: '先截断高度再向下取有限网格，得到可积分的逐步逼近。',
    definition: '对非负扩展实值可测函数 f，令 sₙ=2^(−n)⌊2ⁿmin(f,n)⌋。每个 sₙ 只取有限多个非负值，且可测；网格变细、截断高度提高，保证 sₙ 单调增加并逐点趋于 f。这是构造非负勒贝格积分的重要基础。',
    intuition: '用越来越细、越来越高的台阶，从下方贴近函数。',
    prerequisites: ['measurable-functions', 'lebesgue-simple-integral'], learningNotes: ['简单函数要求有限个取值，不要求函数连续或定义域有限。', '小于 2^(−n) 的误差界只在未被高度截断的区域成立，不能据此断言全空间一致逼近无界函数。'],
    formula: { title: 'Truncated dyadic approximation', titleZh: '截断后的二进网格逼近', latex: 's_n=2^{-n}\\left\\lfloor2^n\\min(f,n)\\right\\rfloor\\uparrow f', conditions: 'f:Ω→[0,+∞] 可测，n≥1；min(f,n) 总有限，∞ 处也有明确定义。', explanation: '截断保证每项只有有限值，向下取整保证不超过 f。' },
    exercises: [
      ex('一次函数的台阶积分', '在 [0,1] 取 f(x)=x，按上述构造求 s₂ 的取值，并计算其勒贝格积分。', '网格宽度为 1/4，端点 x=1 另作一个零测度点。', [['写台阶', '在 [0,1/4)、[1/4,1/2)、[1/2,3/4)、[3/4,1) 上分别取 0、1/4、1/2、3/4，在 x=1 取 1。'], ['积分', '各区间长 1/4，单点贡献为零，积分为 (0+1/4+1/2+3/4)/4=3/8；小于 ∫₀¹x dx=1/2。']], 's₂ 的有限值为 0、1/4、1/2、3/4、1；积分 3/8。', 4),
      ex('截断使全局误差不能统一变小', '在 [0,∞) 取 f(x)=x。求 s₁(3)、s₂(3)、s₄(3)，这种 sₙ 是否在全空间一致趋于 f？', '每个 sₙ≤n，但 f 无上界。', [['固定点的值', 'x=3 时，min(3,1)=1、min(3,2)=2、min(3,4)=3，均落在相应网格上，故依次为 1、2、3。'], ['否定一致收敛', '对任意固定 n，sₙ(x)≤n，而 x 可任意大，supₓ|x−sₙ(x)|=∞。逐点逼近成立，却不是全空间一致收敛。']], '依次为 1、2、3；逐点趋于 f，但全空间不一致收敛。', 4),
    ],
  },
];

export const expansionV19Topics: Topic[] = lessons.map(({ key, formula, exercises, ...topic }) => ({
  ...topic, id: lessonId(topic.courseId, key), sourceNote: '原创讲解与自编配套题；非教材原文、非历年真题。',
  formulaIds: [lessonId(topic.courseId, key) + '-formula'],
  problemIds: exercises.map((_, i) => lessonId(topic.courseId, key) + '-exercise-' + (i + 1)),
}));
export const expansionV19Formulas: Formula[] = lessons.map(({ key, courseId, formula }) => ({ ...formula, id: lessonId(courseId, key) + '-formula', topicId: lessonId(courseId, key), courseId }));
export const expansionV19Problems: Problem[] = lessons.flatMap(({ key, courseId, exercises }) => exercises.map((exercise, i) => ({
  ...exercise, id: lessonId(courseId, key) + '-exercise-' + (i + 1), topicId: lessonId(courseId, key), courseId, formulas: [], source: { kind: 'original', label: '自编配套练习 · 非教材原题、非历年真题' },
})));

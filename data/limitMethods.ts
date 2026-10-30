import { dailyLimitBank, DailyLimitProblem, LimitLevel } from './dailyLimits';

export type LimitMethodId = 'algebra' | 'standard' | 'existence' | 'squeeze' | 'lhopital' | 'taylor' | 'logarithm' | 'sequence' | 'integral';
export type MethodCheck = { id: string; statement: string; latex?: string; answer: boolean; explanation: string };
export type LimitMethod = {
  id: LimitMethodId; title: string; shortTitle: string; summary: string; conditions: string;
  steps: { title: string; body: string; latex?: string }[];
  pitfalls: string[]; checks: MethodCheck[];
};

export const limitMethods: LimitMethod[] = [
  {
    id: 'algebra', title: '代入与代数化简', shortTitle: '代数化简', summary: '先检查连续性，再考虑因式分解、有理化、通分与最高次项。',
    conditions: '直接代入要求相关函数在该点连续，分母极限不为零。约分只需在充分小的去心邻域成立，不要求原式在极限点有定义。',
    steps: [
      { title: '先判断形式', body: '若分母极限不为零，通常可直接代入；0/0 和无穷大减无穷大都是未定式，不是结果。' },
      { title: '按结构化简', body: '多项式用因式分解，根式差用共轭式，分式差先通分，无穷远的有理式比较最高次项。', latex: '\\frac{x^2-1}{x-1}=x+1\\quad(x\\ne1)' },
      { title: '化简后再取极限', body: '重新检查分母、定义域和符号。例如 √(x²)=|x|，只有 x>0 时才能写成 x。' },
    ], pitfalls: ['不能把 0/0 写成 0，也不能直接相减两个不存在的极限。', '不要为了使用洛必达而忽略更简单的代数变形。'],
    checks: [
      { id: 'algebra-continuity', statement: '分子分母都在极限点连续，且分母在该点非零，可以直接代入。', answer: true, explanation: '商在分母非零的点连续，极限等于函数值。' },
      { id: 'algebra-zero', statement: '直接代入得到 0/0，因此这个极限等于 0。', answer: false, explanation: '0/0 是未定式，可能得到不同结果，也可能没有极限，必须进一步分析。' },
    ],
  },
  {
    id: 'standard', title: '重要极限与等价无穷小', shortTitle: '重要极限', summary: '凑出标准比值，保留变量缩放的系数。',
    conditions: '以下公式在实变量 u→0 时使用，三角函数采用弧度；对数要求 1+u>0。等价替换在乘除中常用，在相减时不能不加分析地逐项替换。',
    steps: [
      { title: '识别基本形式', body: '正弦、指数和对数的一阶小量都可以与变量 u 比较。', latex: '\\frac{\\sin u}{u}\\to1,\\quad\\frac{e^u-1}{u}\\to1,\\quad\\frac{\\ln(1+u)}u\\to1' },
      { title: '进行变量缩放', body: '先凑成标准分母，再补上系数，不能漏掉常数。', latex: '\\frac{\\sin(3x)}x=3\\frac{\\sin(3x)}{3x}\\to3' },
      { title: '检查抵消', body: '若两个一阶项会相消，转用恒等变形或更高阶展开，保留决定极限的项。' },
    ], pitfalls: ['sin x 与 tan x 都等价于 x，不意味着它们的差可以直接替换成 0。', '分母中的变量缩放系数必须保留。'],
    checks: [
      { id: 'standard-radians', statement: '采用弧度时，下列重要极限成立。', latex: '\\lim_{x\\to0}\\frac{\\sin x}{x}=1', answer: true, explanation: '弧度是这个标准公式的前提，角度单位不能混用。' },
      { id: 'standard-subtraction', statement: '因为 tan x 和 sin x 都等价于 x，所以计算它们的差时可以直接将两项都换成 x。', answer: false, explanation: '一阶项抵消后，三阶信息决定差值的大小；逐项替换会丢失这些信息。' },
    ],
  },
  {
    id: 'existence', title: '存在性与单侧极限', shortTitle: '单侧极限', summary: '先确认趋近方向与定义域，再判断能否谈双侧极限。',
    conditions: '当定义域允许从左右两侧趋近时，有限双侧极限存在，当且仅当两个单侧极限存在且相等。只有单侧定义域时，应按题目和定义域讨论。',
    steps: [
      { title: '检查定义域', body: '根号、对数和实数幂可能限制趋近方向。xˣ 在 x→0⁺ 的问题中可以取实对数，不能直接当成无条件双侧问题。' },
      { title: '分别看左右', body: '绝对值和分段函数通常需要分两侧计算。', latex: '\\lim_{x\\to0^-}\\frac{|x|}x=-1,\\quad\\lim_{x\\to0^+}\\frac{|x|}x=1' },
      { title: '比较后作结论', body: '两侧不相等时双侧极限不存在。振荡因子自身没有极限，不代表它与趋零因子的乘积也没有极限。' },
    ], pitfalls: ['只代入正的小数，不能证明双侧极限存在。', '左右极限不相等时不能取平均。'],
    checks: [
      { id: 'existence-average', statement: '某函数左极限为 −1、右极限为 1，所以双侧极限等于两者的平均数 0。', answer: false, explanation: '左右极限必须相等，不能通过取平均得到双侧极限。' },
      { id: 'existence-product', statement: 'sin(1/x) 在 x→0 时没有极限，但 x sin(1/x) 仍有极限 0。', answer: true, explanation: '乘积的绝对值不超过 |x|，由夹逼准则趋于 0。' },
    ],
  },
  {
    id: 'squeeze', title: '夹逼准则与有界因子', shortTitle: '夹逼准则', summary: '处理振荡时，先估计整体的绝对值。',
    conditions: '在趋近点的充分小去心邻域，若 g(x)≤f(x)≤h(x)，并且两边趋于同一有限值 L，则中间也趋于 L。',
    steps: [
      { title: '找到有界部分', body: '正弦和余弦的绝对值不超过 1，即使它们的复合函数自身振荡，也能使用这个界。' },
      { title: '用绝对值控制整体', body: '负 x 的符号容易出错，绝对值估计更稳妥。', latex: '0\\le\\left|x\\sin\\frac1x\\right|\\le|x|' },
      { title: '确认两边同极限', body: '右边 |x|→0，由夹逼得到乘积的绝对值趋零，从而乘积也趋零。' },
    ], pitfalls: ['只有有界性，不足以推出函数有极限。', '不能假设振荡因子存在极限，再使用乘积的极限定理。'],
    checks: [
      { id: 'squeeze-bound', statement: '下面的估计足以证明 x sin(1/x) 在 x→0 时趋于 0。', latex: '\\left|x\\sin\\frac1x\\right|\\le|x|', answer: true, explanation: '绝对值被一个趋于 0 的非负函数控制。' },
      { id: 'squeeze-bounded', statement: 'sin(1/x) 有界，因此它在 x→0 时一定存在极限。', answer: false, explanation: '有界不等于收敛；这里正弦值会持续振荡。' },
    ],
  },
  {
    id: 'lhopital', title: '洛必达法则与适用条件', shortTitle: '洛必达', summary: '先确认未定式和条件，再分别对分子、分母求导。',
    conditions: '常见充分条件：原式为 0/0 或 ∞/∞ 型，分子分母在相应去心邻域可导，分母导数不为零，而且导数之比有极限（有限或正负无穷）。每次重复使用都要重新检查。',
    steps: [
      { title: '判断是否适用', body: '乘积型和差值型要先改写；不是看到分式就能使用洛必达。' },
      { title: '分别求导', body: '不是计算整个商的导数；满足条件时才能用导数之比求原极限。', latex: "\\lim\\frac{f(x)}{g(x)}=\\lim\\frac{f'(x)}{g'(x)}" },
      { title: '必要时再使用一次', body: '若导数之比不收敛，本次法则无法给出结论，但不能据此断定原式没有极限。' },
    ], pitfalls: ['先验证条件，不能机械地分子分母一直求导。', '导数之比没有极限，不等于原比值没有极限。'],
    checks: [
      { id: 'lhopital-quotient', statement: '洛必达法则要求先求整个商 (f/g) 的导数，再取极限。', answer: false, explanation: '应分别求 f′ 和 g′ 后计算 f′/g′，并检查法则条件。' },
      { id: 'lhopital-log-growth', statement: '对 ln x/x 在 x→+∞ 时使用洛必达，导数之比为 1/x，因此原极限为 0。', answer: true, explanation: '原式为 ∞/∞ 型，分母导数是 1，导数之比趋于 0，条件满足。' },
    ],
  },
  {
    id: 'taylor', title: '泰勒展开与抵消阶数', shortTitle: '泰勒展开', summary: '先判断哪些项会抵消，再展开到足够阶数。',
    conditions: '在展开点附近确认函数有足够阶的可导性及相应定义域。这里使用 x→0 的佩亚诺余项；含参数时先固定参数，不把参数当作随 x 变化的量。',
    steps: [
      { title: '观察分母与抵消', body: '分母为 x³ 且一次项抵消时，只保留一阶近似通常不够。' },
      { title: '写出足够阶数和余项', body: '例如正弦的三阶展开，角度仍使用弧度。', latex: '\\sin x=x-\\frac{x^3}6+o(x^3)' },
      { title: '相减、相除后再取极限', body: '余项必须能控制到所需阶数。', latex: '\\frac{\\sin x-x}{x^3}=-\\frac16+o(1)' },
    ], pitfalls: ['展开阶数过低，会丢失极限的主导项。', 'ln(1+x) 与根式的正负号、系数常被写错。'],
    checks: [
      { id: 'taylor-first-order', statement: '计算 (sin x−x)/x³ 时，只知道 sin x=x+o(x) 就足以确定极限数值。', answer: false, explanation: 'o(x) 除以 x³ 仍未受控，需要保留三阶项或使用其他有效方法。' },
      { id: 'taylor-remainder', statement: '由下式可以推出 (sin x−x)/x³→−1/6。', latex: '\\sin x-x=-\\frac{x^3}6+o(x^3)', answer: true, explanation: 'o(x³)/x³→0，因此商趋于 −1/6。' },
    ],
  },
  {
    id: 'logarithm', title: '幂指型极限先取对数', shortTitle: '对数化', summary: '把指数搬下来，先求对数的极限，再取指数。',
    conditions: '取实对数前，底数必须在相应去心邻域内为正。若对数趋于有限 L，原式由指数连续性趋于 eᴸ；不能把未定式 1^∞ 或 0⁰ 直接代入。',
    steps: [
      { title: '检查底数为正', body: '设 y(x)=a(x)^{b(x)}，先确认实数范围的定义。' },
      { title: '先处理对数', body: '把幂指型改写成乘积，必要时再用标准极限或泰勒。', latex: '\\ln y(x)=b(x)\\ln a(x)' },
      { title: '由连续性回到原式', body: '例如 ln(1+2x)/x→2，故原幂指型趋于 e²。', latex: '(1+2x)^{1/x}=\\exp\\!\\left(\\frac{\\ln(1+2x)}x\\right)\\to e^2' },
    ], pitfalls: ['底数不能为非正数时，不能直接使用实对数。', '底数趋于 1 并不意味着整个幂一定趋于 1。'],
    checks: [
      { id: 'logarithm-continuity', statement: '若 y(x)>0 且 ln y(x)→L，其中 L 有限，则 y(x)→eᴸ。', answer: true, explanation: 'y=exp(ln y)，利用指数函数连续性即可。' },
      { id: 'logarithm-power', statement: '底数趋于 1、指数趋于正无穷时，整个幂一定趋于 1。', answer: false, explanation: '1^∞ 是未定式，结果取决于底数偏离 1 的速度与指数增长速度。' },
    ],
  },
  {
    id: 'sequence', title: '数列极限与单调有界', shortTitle: '数列收敛', summary: '显式数列可化简或取对数，递推数列先证明收敛。',
    conditions: '单调有界实数数列必收敛。递推式中取极限时，还要确认相关函数在候选极限处连续；解出固定点不等于证明收敛。',
    steps: [
      { title: '显式与递推分开看', body: '比值可同除最高次幂，n 次根常先取对数；递推数列先找能保持的区间。' },
      { title: '证明有界与单调', body: '对 a₁=1、aₙ₊₁=√(2+aₙ)，可归纳证明 1≤aₙ≤2，再证明单调递增。' },
      { title: '收敛后再解方程', body: '若 L∈[1,2]，连续性给出 L=√(2+L)，可排除负根。', latex: 'L^2-L-2=0,\\quad L\\in[1,2]\\quad\\Longrightarrow\\quad L=2' },
    ], pitfalls: ['仅解 L=F(L)，没有证明原数列真的收敛。', '平方会产生不符合取值范围的根，必须筛选。'],
    checks: [
      { id: 'sequence-fixed-point', statement: '递推数列的固定点方程有解，就说明这个数列一定收敛到该解。', answer: false, explanation: '固定点只是候选极限；仍须证明数列收敛，并处理初值与取值范围。' },
      { id: 'sequence-monotone', statement: '一个单调递增并且有上界的实数数列一定有有限极限。', answer: true, explanation: '这是单调有界收敛定理。' },
    ],
  },
  {
    id: 'integral', title: '积分型极限与差商', shortTitle: '积分型', summary: '把变上限积分看作函数，识别导数或先算积分。',
    conditions: '若 f 在 0 附近连续，F(x)=∫₀ˣf(t)dt 可导，且 F′(x)=f(x)。x<0 时应使用带方向的积分；更高阶抵消需进一步分析。',
    steps: [
      { title: '识别差商结构', body: 'F(0)=0，因此 F(x)/x 正是 F 在 0 处的导数差商。', latex: '\\lim_{x\\to0}\\frac1x\\int_0^x f(t)\\,dt=f(0)' },
      { title: '注意积分方向', body: 'x<0 时上限小于下限，积分本身带方向；不能漏掉方向符号。' },
      { title: '遇到二阶分母再展开', body: '例如先算出 ∫₀ˣ(eᵗ−1)dt=eˣ−1−x，再用二阶展开，而不是只代入被积函数的值。', latex: '\\int_0^x(e^t-1)\\,dt=e^x-1-x' },
    ], pitfalls: ['对变上限积分求导，应得到上限处的函数值，不是把被积函数求导后再积分。', '分母是 x² 时，不能直接套用除以 x 的平均值极限。'],
    checks: [
      { id: 'integral-average', statement: '若 f 在 0 附近连续，则 (1/x)∫₀ˣf(t)dt→f(0)。', answer: true, explanation: '将其写成 F 在 0 处的导数差商，应用微积分基本定理。' },
      { id: 'integral-derivative', statement: '若 f 在附近连续，对 F(x)=∫₀ˣf(t)dt 求导，应得到 ∫₀ˣf′(t)dt。', answer: false, explanation: '正确结果是 F′(x)=f(x)；连续性甚至不保证 f′ 存在。' },
    ],
  },
];

// Stable IDs only: adding method links never changes daily scheduling or saved answers.
export const limitProblemMethods: Record<string, LimitMethodId[]> = {
  'limit-factor': ['algebra'], 'limit-rationalize': ['algebra'], 'limit-sine-scale': ['standard'],
  'limit-log-scale': ['standard'], 'limit-exp-scale': ['standard'], 'limit-leading-power': ['algebra'],
  'limit-sequence-ratio': ['algebra', 'sequence'], 'limit-cosine-square': ['algebra', 'standard'],
  'limit-tan-sin': ['algebra', 'standard'], 'limit-squeeze-oscillation': ['squeeze', 'existence'],
  'limit-log-second-order': ['taylor'], 'limit-two-radicals': ['algebra'], 'limit-power-log': ['logarithm', 'standard'],
  'limit-sequence-radical': ['algebra', 'sequence'], 'limit-sine-third-order': ['taylor'], 'limit-log-third-order': ['taylor'],
  'limit-exp-second-order': ['taylor', 'lhopital'], 'limit-x-power-x': ['logarithm', 'lhopital'],
  'limit-one-sided-disagreement': ['existence'], 'limit-euler-error': ['logarithm', 'taylor', 'sequence'],
  'limit-sine-power': ['logarithm', 'taylor'], 'limit-cubic-factor': ['algebra'], 'limit-log-sine-ratio': ['standard'],
  'limit-base-two': ['standard'], 'limit-sine-ratio': ['standard'], 'limit-radical-infinity': ['algebra'],
  'limit-geometric-sequence': ['sequence', 'logarithm'], 'limit-continuous-ratio': ['algebra'],
  'limit-lhopital-log': ['lhopital'], 'limit-lhopital-infinity': ['lhopital'],
  'limit-reciprocal-difference': ['algebra', 'taylor'], 'limit-integral-average': ['integral'],
  'limit-recursive-sequence': ['sequence'], 'limit-nth-root': ['logarithm', 'sequence', 'lhopital'],
  'limit-parameter-sine': ['taylor'], 'limit-root-second-order': ['taylor'],
  'limit-log-rational-difference': ['taylor'], 'limit-exponential-sine': ['taylor'],
  'limit-integral-second-order': ['integral', 'taylor'], 'limit-log-square-product': ['lhopital'],
  'limit-parameter-exponential': ['taylor'], 'limit-sine-fifth-order': ['taylor'],
};

export function getLimitMethod(id: string | undefined) { return limitMethods.find((item) => item.id === id); }
export function getMethodsForLimitProblem(id: string) {
  const ids = Object.prototype.hasOwnProperty.call(limitProblemMethods, id) ? limitProblemMethods[id] : [];
  return ids.map(getLimitMethod).filter((item): item is LimitMethod => !!item);
}
export function getProblemsForLimitMethod(id: string) {
  return dailyLimitBank.filter((problem) => limitProblemMethods[problem.id]?.some((method) => method === id));
}

export function filterLimitPracticeItems<T extends { problem: DailyLimitProblem }>(items: readonly T[],
  filter: { query: string; level: LimitLevel | null; methodId: LimitMethodId | null }) {
  const text = filter.query.trim().toLowerCase();
  return items.filter(({ problem }) => (!filter.level || problem.level === filter.level)
    && (!filter.methodId || limitProblemMethods[problem.id]?.includes(filter.methodId))
    && (!text || [problem.title, problem.level, ...getMethodsForLimitProblem(problem.id).map((method) => method.title)].join(' ').toLowerCase().includes(text)));
}

const single = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
export function resolveLimitPracticeParams(params: { mode?: string | string[]; method?: string | string[]; problem?: string | string[] }) {
  const mode = single(params.mode) === 'bank' ? 'bank' : 'review';
  const methodId = getLimitMethod(single(params.method))?.id ?? null;
  const problemId = single(params.problem);
  const problem = mode === 'bank' && dailyLimitBank.find((item) => item.id === problemId
    && (!methodId || limitProblemMethods[item.id]?.includes(methodId)));
  return { mode, methodId, selected: problem ? `bank:bank:${problem.id}` : null } as const;
}

export function gradeLimitMethodCheck(method: LimitMethod, answers: Record<string, boolean>) {
  const answered = method.checks.filter((item) => typeof answers[item.id] === 'boolean').length;
  const total = method.checks.length;
  if (answered !== total) return { complete: false as const, answered, total };
  return { complete: true as const, answered, total,
    correct: method.checks.filter((item) => answers[item.id] === item.answer).length };
}

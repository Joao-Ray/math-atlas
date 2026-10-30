export type LimitLevel = '基础巩固' | '方法练习' | '进阶挑战';
export type DailyLimitProblem = {
  id: string;
  title: string;
  level: LimitLevel;
  expression: string;
  hint: string;
  steps: { title: string; body: string; latex?: string }[];
  answer: string;
};
export type DailyLimitAttempt = {
  draft: string;
  revealed: boolean;
  result: 'correct' | 'review' | null;
};
export type DailyLimitRecords = Record<string, Record<string, DailyLimitAttempt>>;
export const emptyDailyLimitAttempt: DailyLimitAttempt = { draft: '', revealed: false, result: null };

export function normalizeDailyLimitRecords(value: unknown): DailyLimitRecords {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([date, entries]) => {
    try { getDailyLimitProblems(date); } catch { return []; }
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return [];
    const attempts = Object.entries(entries).flatMap(([id, raw]) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];
      const attempt = raw as Partial<DailyLimitAttempt>;
      const revealed = attempt.revealed === true;
      return [[id, {
        draft: typeof attempt.draft === 'string' ? attempt.draft.slice(0, 1000) : '', revealed,
        result: revealed && (attempt.result === 'correct' || attempt.result === 'review') ? attempt.result : null,
      }]];
    });
    return [[date, Object.fromEntries(attempts)]];
  }));
}

export const limitLevels: LimitLevel[] = ['基础巩固', '方法练习', '进阶挑战'];

// Fixed IDs and order keep each local calendar day's set reproducible.
// Keep the first seven IDs in each level in their original order for legacy dates.
export const dailyLimitRotationDays = 14;
export const expandedRotationStarts = '2026-10-10';
export const dailyLimitBank: DailyLimitProblem[] = [
  {
    id: 'limit-factor', level: '基础巩固', title: '因式分解消去零因子',
    expression: '\\lim_{x\\to1}\\frac{x^2-1}{x-1}', hint: '把分子写成 (x−1)(x+1)，极限过程中 x 不等于 1。',
    steps: [
      { title: '识别未定式', body: '直接代入得到 0/0，需要先化简，不能把 0/0 当成数。' },
      { title: '分解并约分', body: '在 x≠1 时等式成立，足以用于求极限。', latex: '\\frac{x^2-1}{x-1}=x+1' },
      { title: '利用连续性', body: 'x+1 在 1 处连续，代入得到 2。' },
    ], answer: '2',
  },
  {
    id: 'limit-rationalize', level: '基础巩固', title: '根式有理化',
    expression: '\\lim_{x\\to0}\\frac{\\sqrt{1+x}-1}{x}', hint: '分子分母同乘 √(1+x)+1。',
    steps: [
      { title: '有理化', body: '利用平方差去掉分子根号。', latex: '\\frac{\\sqrt{1+x}-1}{x}=\\frac1{\\sqrt{1+x}+1}' },
      { title: '取极限', body: '分母趋于 2，不再是 0/0。' },
    ], answer: '1/2',
  },
  {
    id: 'limit-sine-scale', level: '基础巩固', title: '重要极限的变量缩放',
    expression: '\\lim_{x\\to0}\\frac{\\sin(3x)}x', hint: '把分母补成 3x，再补偿一个系数。角度使用弧度。',
    steps: [
      { title: '凑出标准形式', body: '令 u=3x，u 也趋于 0。', latex: '\\frac{\\sin(3x)}x=3\\frac{\\sin(3x)}{3x}' },
      { title: '应用重要极限', body: 'sin u/u→1，因此结果为 3。' },
    ], answer: '3',
  },
  {
    id: 'limit-log-scale', level: '基础巩固', title: '对数的一阶小量',
    expression: '\\lim_{x\\to0}\\frac{\\ln(1+2x)}x', hint: '在 0 附近 ln(1+u)/u→1，先令 u=2x。',
    steps: [
      { title: '检查定义域', body: '要求 1+2x>0，在 0 的一个双侧邻域内成立。' },
      { title: '缩放变量', body: '补上分母 2x。', latex: '\\frac{\\ln(1+2x)}x=2\\frac{\\ln(1+2x)}{2x}\\longrightarrow2' },
    ], answer: '2',
  },
  {
    id: 'limit-exp-scale', level: '基础巩固', title: '指数的一阶小量',
    expression: '\\lim_{x\\to0}\\frac{e^{3x}-1}x', hint: '使用 (eᵘ−1)/u→1。',
    steps: [
      { title: '缩放变量', body: '令 u=3x，改写成指数函数在 0 点的差商。', latex: '\\frac{e^{3x}-1}x=3\\frac{e^{3x}-1}{3x}' },
      { title: '取极限', body: '右侧第二个因子趋于 1，因此极限为 3。' },
    ], answer: '3',
  },
  {
    id: 'limit-leading-power', level: '基础巩固', title: '无穷远处比较最高次项',
    expression: '\\lim_{x\\to+\\infty}\\frac{3x^2-x+1}{2x^2+5}', hint: '分子分母同除以 x²。',
    steps: [
      { title: '除以最高次幂', body: '把可能无界的多项式变为常数和趋零项。', latex: '\\frac{3-1/x+1/x^2}{2+5/x^2}' },
      { title: '逐项取极限', body: '1/x 与 1/x² 都趋于 0，分母极限不为 0。' },
    ], answer: '3/2',
  },
  {
    id: 'limit-sequence-ratio', level: '基础巩固', title: '数列比值极限',
    expression: '\\lim_{n\\to\\infty}\\frac{n}{n+1}', hint: '同除以 n，或改写为 1−1/(n+1)。',
    steps: [
      { title: '拆出趋零项', body: 'n 为正整数。', latex: '\\frac n{n+1}=1-\\frac1{n+1}' },
      { title: '取极限', body: '后面的分数趋于 0。' },
    ], answer: '1',
  },
  {
    id: 'limit-cosine-square', level: '方法练习', title: '半角公式处理二阶小量',
    expression: '\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}', hint: '用 1−cos x=2sin²(x/2)，再应用正弦重要极限。',
    steps: [
      { title: '使用半角公式', body: '把分子变成正弦的平方。', latex: '\\frac{1-\\cos x}{x^2}=\\frac12\\left(\\frac{\\sin(x/2)}{x/2}\\right)^2' },
      { title: '取极限', body: '括号内趋于 1，得到 1/2。' },
    ], answer: '1/2',
  },
  {
    id: 'limit-tan-sin', level: '方法练习', title: '相减时不能直接替换等价无穷小',
    expression: '\\lim_{x\\to0}\\frac{\\tan x-\\sin x}{x^3}', hint: '先通分：tan x−sin x=sin x(1−cos x)/cos x。',
    steps: [
      { title: '保留差值的高阶信息', body: '不能把 tan x 与 sin x 都替换成 x 后相减，那会丢失决定极限的三阶项。' },
      { title: '改写为已知极限的乘积', body: '在 0 附近 cos x 非零。', latex: '\\frac{\\tan x-\\sin x}{x^3}=\\frac{\\sin x}{x}\\frac{1-\\cos x}{x^2}\\frac1{\\cos x}' },
      { title: '相乘', body: '三个因子的极限依次为 1、1/2、1。' },
    ], answer: '1/2',
  },
  {
    id: 'limit-squeeze-oscillation', level: '方法练习', title: '振荡函数的夹逼',
    expression: '\\lim_{x\\to0}x\\sin\\frac1x', hint: 'sin(1/x) 自身没有极限，但绝对值不超过 1。',
    steps: [
      { title: '估计绝对值', body: '对所有 x≠0，正弦都有界。', latex: '\\left|x\\sin\\frac1x\\right|\\le|x|' },
      { title: '夹逼取极限', body: '|x|→0，所以乘积趋于 0。不能把它写成 0 乘一个不存在的极限。' },
    ], answer: '0',
  },
  {
    id: 'limit-log-second-order', level: '方法练习', title: '对数差值的二阶展开',
    expression: '\\lim_{x\\to0}\\frac{\\ln(1+x)-x}{x^2}', hint: '展开 ln(1+x) 到二阶，保留余项。',
    steps: [
      { title: '展开到足够阶数', body: '一阶项会被减掉，所以至少要保留二阶项。', latex: '\\ln(1+x)=x-\\frac{x^2}2+o(x^2)' },
      { title: '消去并除以 x²', body: 'o(x²)/x²→0。', latex: '\\frac{\\ln(1+x)-x}{x^2}=-\\frac12+o(1)' },
    ], answer: '−1/2',
  },
  {
    id: 'limit-two-radicals', level: '方法练习', title: '两个根式相减',
    expression: '\\lim_{x\\to0}\\frac{\\sqrt{1+x}-\\sqrt{1-x}}x', hint: '乘以两个根式的和；注意分子平方差是 2x。',
    steps: [
      { title: '检查并有理化', body: '|x|<1 时两个根式均有定义；对 x≠0 约分。', latex: '\\frac{\\sqrt{1+x}-\\sqrt{1-x}}x=\\frac2{\\sqrt{1+x}+\\sqrt{1-x}}' },
      { title: '取极限', body: '分母趋于 2，所以结果为 1。' },
    ], answer: '1',
  },
  {
    id: 'limit-power-log', level: '方法练习', title: '幂指型极限先取对数',
    expression: '\\lim_{x\\to0}(1+2x)^{1/x}', hint: '底数在 0 附近为正。设原式为 y，先求 ln y 的极限。',
    steps: [
      { title: '把指数移到前面', body: 'x≠0 时可写成指数函数。', latex: '(1+2x)^{1/x}=\\exp\\!\\left(\\frac{\\ln(1+2x)}x\\right)' },
      { title: '求指数中的极限', body: 'ln(1+2x)/x→2。' },
      { title: '用指数函数连续性', body: '再取指数，得到 e²。' },
    ], answer: 'e²',
  },
  {
    id: 'limit-sequence-radical', level: '方法练习', title: '数列中的根式差',
    expression: '\\lim_{n\\to\\infty}n\\left(\\sqrt{1+\\frac1n}-1\\right)', hint: '先有理化，n 与分子里的 1/n 会抵消。',
    steps: [
      { title: '有理化', body: 'n 为正整数。', latex: 'n\\left(\\sqrt{1+\\frac1n}-1\\right)=\\frac1{\\sqrt{1+1/n}+1}' },
      { title: '取极限', body: '分母趋于 2。' },
    ], answer: '1/2',
  },
  {
    id: 'limit-sine-third-order', level: '进阶挑战', title: '正弦的三阶差值',
    expression: '\\lim_{x\\to0}\\frac{\\sin x-x}{x^3}', hint: 'sin x 的一阶项会被消去，展开到三阶。',
    steps: [
      { title: '写出三阶展开', body: '角度使用弧度。', latex: '\\sin x=x-\\frac{x^3}6+o(x^3)' },
      { title: '相减并除以 x³', body: '余项除以 x³ 后趋于 0。', latex: '\\frac{\\sin x-x}{x^3}=-\\frac16+o(1)' },
    ], answer: '−1/6',
  },
  {
    id: 'limit-log-third-order', level: '进阶挑战', title: '对数的三阶差值',
    expression: '\\lim_{x\\to0}\\frac{\\ln(1+x)-x+x^2/2}{x^3}', hint: '前两阶已经被消去，要展开到三阶。',
    steps: [
      { title: '展开并保持符号', body: '在 0 附近对数有定义。', latex: '\\ln(1+x)=x-\\frac{x^2}2+\\frac{x^3}3+o(x^3)' },
      { title: '化简', body: '分子留下 x³/3 与余项，除以 x³ 得到 1/3。' },
    ], answer: '1/3',
  },
  {
    id: 'limit-exp-second-order', level: '进阶挑战', title: '指数函数消去前两项',
    expression: '\\lim_{x\\to0}\\frac{e^x-1-x}{x^2}', hint: '需要 eˣ 的二阶展开，而不只是 eˣ−1~x。',
    steps: [
      { title: '二阶展开', body: '常数项与一次项将被减去。', latex: 'e^x=1+x+\\frac{x^2}2+o(x^2)' },
      { title: '除以 x²', body: '分子为 x²/2+o(x²)，所以极限为 1/2。' },
    ], answer: '1/2',
  },
  {
    id: 'limit-x-power-x', level: '进阶挑战', title: '0 的 0 次幂型极限',
    expression: '\\lim_{x\\to0^+}x^x', hint: '先求 x ln x。可令 t=1/x，转为 −ln t/t。',
    steps: [
      { title: '用指数表示原式', body: '右极限中 x>0，可以取对数。', latex: 'x^x=e^{x\\ln x}' },
      { title: '求指数极限', body: '令 t=1/x→+∞。对 ln t/t 使用洛必达法则，导数之比 1/t→0。', latex: 'x\\ln x=-\\frac{\\ln t}t\\longrightarrow0' },
      { title: '取指数', body: '指数函数连续，结果为 e⁰=1；未定式 0⁰ 不能直接代入。' },
    ], answer: '1',
  },
  {
    id: 'limit-one-sided-disagreement', level: '进阶挑战', title: '判断双侧极限是否存在',
    expression: '\\lim_{x\\to0}\\frac{|x|}x', hint: '分别看 x>0 与 x<0，不要只从一侧代入。',
    steps: [
      { title: '右侧极限', body: 'x>0 时 |x|=x，商恒为 1。', latex: '\\lim_{x\\to0^+}\\frac{|x|}x=1' },
      { title: '左侧极限', body: 'x<0 时 |x|=−x，商恒为 −1。', latex: '\\lim_{x\\to0^-}\\frac{|x|}x=-1' },
      { title: '比较两侧', body: '两个单侧极限不相等，所以双侧极限不存在；不是 0，也不是无穷大。' },
    ], answer: '不存在（左极限 −1，右极限 1）',
  },
  {
    id: 'limit-euler-error', level: '进阶挑战', title: '重要数列极限的误差阶',
    expression: '\\lim_{n\\to\\infty}n\\left[\\left(1+\\frac1n\\right)^n-e\\right]',
    hint: '先把 n ln(1+1/n) 展开到 1/n 项，再用 eᵘ−1~u。',
    steps: [
      { title: '展开对数', body: '由 ln(1+u)=u−u²/2+o(u²)，取 u=1/n 后乘以 n。', latex: 'n\\ln(1+1/n)=1-\\frac1{2n}+o(1/n)' },
      { title: '提取 e', body: '令 aₙ=−1/(2n)+o(1/n)，则 aₙ→0 且 naₙ→−1/2。', latex: '(1+1/n)^n-e=e(e^{a_n}-1)' },
      { title: '用指数一阶极限', body: '(eᵃⁿ−1)/aₙ→1，因此乘以 n 后得到 −e/2。', latex: 'ne(e^{a_n}-1)\\longrightarrow-\\frac e2' },
    ], answer: '−e/2',
  },
  {
    id: 'limit-sine-power', level: '进阶挑战', title: '幂指型极限中的二阶信息',
    expression: '\\lim_{x\\to0}\\left(\\frac{\\sin x}x\\right)^{1/x^2}',
    hint: '底数在 0 附近为正。取对数后，需要 sin x/x 的二阶展开。',
    steps: [
      { title: '保留二阶偏差', body: '不能只把 sin x/x 替换为 1，因为指数同时趋于无穷。', latex: '\\frac{\\sin x}x=1-\\frac{x^2}6+o(x^2)' },
      { title: '取对数', body: '由 ln(1+u)=u+o(u)，对数除以 x² 后趋于 −1/6。', latex: '\\frac{\\ln(\\sin x/x)}{x^2}\\longrightarrow-\\frac16' },
      { title: '取指数', body: '原式的极限等于对数极限的指数。' },
    ], answer: 'e^(−1/6)',
  },
  {
    id: 'limit-cubic-factor', level: '基础巩固', title: '立方差的因式分解',
    expression: '\\lim_{x\\to2}\\frac{x^3-8}{x-2}', hint: '用 a³−b³=(a−b)(a²+ab+b²)。',
    steps: [
      { title: '分解立方差', body: '不能把 0/0 当作结果；先在 x≠2 时约分。', latex: '\\frac{x^3-8}{x-2}=x^2+2x+4' },
      { title: '代入连续多项式', body: '约分后的表达式在 2 处连续，得到 4+4+4。' },
    ], answer: '12',
  },
  {
    id: 'limit-log-sine-ratio', level: '基础巩固', title: '两个一阶小量的比值',
    expression: '\\lim_{x\\to0}\\frac{\\ln(1+x)}{\\sin x}', hint: '把分子与分母分别除以 x；角度使用弧度。',
    steps: [
      { title: '凑两个重要极限', body: '在 0 的充分小去心邻域中，分母非零且对数有定义。', latex: '\\frac{\\ln(1+x)}{\\sin x}=\\frac{\\ln(1+x)/x}{\\sin x/x}' },
      { title: '使用商的极限定理', body: '分子和分母分别趋于 1，分母极限不为零。' },
    ], answer: '1',
  },
  {
    id: 'limit-base-two', level: '基础巩固', title: '一般底数的指数极限',
    expression: '\\lim_{x\\to0}\\frac{2^x-1}{x}', hint: '把 2ˣ 改写为 e^(x ln 2)。',
    steps: [
      { title: '转换为自然指数', body: '补出分母 x ln 2。', latex: '\\frac{2^x-1}{x}=\\ln2\\,\\frac{e^{x\\ln2}-1}{x\\ln2}' },
      { title: '应用指数重要极限', body: '后面的商趋于 1，注意底数不是 e，系数不能漏掉。' },
    ], answer: 'ln 2',
  },
  {
    id: 'limit-sine-ratio', level: '基础巩固', title: '不同频率正弦的比值',
    expression: '\\lim_{x\\to0}\\frac{\\sin(5x)}{\\sin(2x)}', hint: '分别凑成 sin(5x)/(5x) 和 sin(2x)/(2x)。',
    steps: [
      { title: '保留缩放系数', body: '角度使用弧度。', latex: '\\frac{\\sin(5x)}{\\sin(2x)}=\\frac52\\frac{\\sin(5x)/(5x)}{\\sin(2x)/(2x)}' },
      { title: '取极限', body: '两个标准比值都趋于 1，留下系数 5/2。' },
    ], answer: '5/2',
  },
  {
    id: 'limit-radical-infinity', level: '基础巩固', title: '无穷远处的根式差',
    expression: '\\lim_{x\\to+\\infty}\\left(\\sqrt{x^2+3x}-x\\right)', hint: '无穷大减无穷大是未定式，先乘共轭式。',
    steps: [
      { title: '有理化并除以 x', body: 'x→+∞ 时 x>0，所以 √(x²+3x)/x=√(1+3/x)。', latex: '\\sqrt{x^2+3x}-x=\\frac{3x}{\\sqrt{x^2+3x}+x}=\\frac3{\\sqrt{1+3/x}+1}' },
      { title: '取极限', body: '分母趋于 2。若 x→−∞，不能照搬这一步的符号。' },
    ], answer: '3/2',
  },
  {
    id: 'limit-geometric-sequence', level: '基础巩固', title: '几何数列趋零',
    expression: '\\lim_{n\\to\\infty}\\left(\\frac23\\right)^n', hint: '公比的绝对值小于 1，或取对数看指数的符号。',
    steps: [
      { title: '改写为指数', body: 'ln(2/3)<0，是固定的负数。', latex: '(2/3)^n=e^{n\\ln(2/3)}' },
      { title: '分析指数', body: '指数趋于负无穷，因此原数列趋于 0，而不是趋于 2/3。' },
    ], answer: '0',
  },
  {
    id: 'limit-continuous-ratio', level: '基础巩固', title: '先检查是否可以直接代入',
    expression: '\\lim_{x\\to2}\\frac{x^2+3}{x+1}', hint: '不是所有极限都需要洛必达：先看分母极限是否为零。',
    steps: [
      { title: '检查连续性与分母', body: '分子分母都是多项式，分母在 2 处等于 3，不为零。' },
      { title: '直接代入', body: '商在此处连续。', latex: '\\frac{2^2+3}{2+1}=\\frac73' },
    ], answer: '7/3',
  },
  {
    id: 'limit-lhopital-log', level: '方法练习', title: '洛必达法则的 0/0 型',
    expression: '\\lim_{x\\to1}\\frac{\\ln x}{x-1}', hint: '先检查是否为 0/0，再分别对分子、分母求导。',
    steps: [
      { title: '检查适用条件', body: '这是 0/0 型；在 1 附近 x>0，分子分母可导，分母导数等于 1。' },
      { title: '分别求导后取极限', body: '不是对整个分式求导；导数之比的极限存在。', latex: '\\lim_{x\\to1}\\frac{1/x}{1}=1' },
    ], answer: '1',
  },
  {
    id: 'limit-lhopital-infinity', level: '方法练习', title: '对数与线性增长的比较',
    expression: '\\lim_{x\\to+\\infty}\\frac{\\ln x}{x}', hint: '这是 ∞/∞ 型，可检查条件后使用洛必达。',
    steps: [
      { title: '检查条件', body: 'x>0 时函数可导，分母导数为 1，分子分母都趋于正无穷。' },
      { title: '导数比值趋零', body: 'ln x 的增长速度比 x 慢。', latex: '\\lim_{x\\to+\\infty}\\frac{1/x}{1}=0' },
    ], answer: '0',
  },
  {
    id: 'limit-reciprocal-difference', level: '方法练习', title: '倒数差先通分',
    expression: '\\lim_{x\\to0}\\left(\\frac1x-\\frac1{\\sin x}\\right)', hint: '先通分，再保留 sin x−x 的三阶项。',
    steps: [
      { title: '通分', body: '两个倒数不能各自取极限再相减。', latex: '\\frac1x-\\frac1{\\sin x}=\\frac{\\sin x-x}{x\\sin x}' },
      { title: '比较阶数', body: '弧度下 sin x−x=−x³/6+o(x³)，而 x sin x=x²(1+o(1))。商等于 x[−1/6+o(1)]/[1+o(1)]。' },
      { title: '双侧取极限', body: '最后仍有一个趋零因子 x，所以结果为 0。' },
    ], answer: '0',
  },
  {
    id: 'limit-integral-average', level: '方法练习', title: '积分平均值的极限',
    expression: '\\lim_{x\\to0}\\frac1x\\int_0^x e^{t^2}\\,dt', hint: '令 F(x)=∫₀ˣ e^(t²)dt，把原式看成 F 在 0 处的导数。',
    steps: [
      { title: '识别差商', body: 'F(0)=0，所以原式是 [F(x)−F(0)]/(x−0)。' },
      { title: '用微积分基本定理', body: '被积函数在 0 附近连续；左侧 x<0 时也可使用带方向的积分。', latex: "F'(0)=e^{0^2}=1" },
    ], answer: '1',
  },
  {
    id: 'limit-recursive-sequence', level: '方法练习', title: '递推数列先证明收敛',
    expression: 'a_1=1,\\quad a_{n+1}=\\sqrt{2+a_n},\\quad \\lim_{n\\to\\infty}a_n=?',
    hint: '先归纳证明 1≤aₙ≤2，再证明单调，最后才能在递推式中取极限。',
    steps: [
      { title: '有界性', body: '若 1≤aₙ≤2，则 1≤√(2+aₙ)≤2，归纳得整个数列位于 [1,2]。' },
      { title: '单调性', body: '在 [1,2] 上，2+aₙ−aₙ²=(2−aₙ)(aₙ+1)≥0，所以 aₙ₊₁≥aₙ；单调有界数列收敛。' },
      { title: '确定极限', body: '连续性给出 L=√(2+L)，平方后解得 L=2 或 −1。由 L∈[1,2] 排除 −1。', latex: 'L^2-L-2=0\\quad\\Longrightarrow\\quad L=2' },
    ], answer: '2',
  },
  {
    id: 'limit-nth-root', level: '方法练习', title: 'n 次根的数列极限',
    expression: '\\lim_{n\\to\\infty}\\sqrt[n]{n}', hint: '取对数，转为 ln n/n 的极限。',
    steps: [
      { title: '转换为指数', body: 'n 是正整数，原式为正。', latex: '\\sqrt[n]n=\\exp\\!\\left(\\frac{\\ln n}{n}\\right)' },
      { title: '先求对数极限', body: '由连续变量 ln x/x→0，可得其正整数子列 ln n/n→0。' },
      { title: '用连续性取指数', body: '得到 e⁰=1，而不是无穷大。' },
    ], answer: '1',
  },
  {
    id: 'limit-parameter-sine', level: '方法练习', title: '含参三阶极限',
    expression: '\\lim_{x\\to0}\\frac{\\sin(ax)-ax}{x^3},\\quad a\\in\\mathbb R\\text{ 为常数}',
    hint: 'a 固定时，对 sin(ax) 展开到三阶；要包括 a=0。',
    steps: [
      { title: '固定参数展开', body: '对于固定非零 a，余项 o((ax)³) 也是 o(x³)；a=0 时原式恒为 0。', latex: '\\sin(ax)=ax-\\frac{a^3x^3}6+o(x^3)' },
      { title: '约去一阶项', body: '除以 x³ 后得到 −a³/6，a=0 也满足这个结果。' },
    ], answer: '−a³/6（a 为固定实数）',
  },
  {
    id: 'limit-root-second-order', level: '进阶挑战', title: '根式差的二阶项',
    expression: '\\lim_{x\\to0}\\frac{\\sqrt{1+x}-1-x/2}{x^2}', hint: '一阶项已消去，展开根式到二阶。',
    steps: [
      { title: '二阶展开', body: '在 0 的邻域内 1+x>0。', latex: '\\sqrt{1+x}=1+\\frac x2-\\frac{x^2}8+o(x^2)' },
      { title: '消去并除以 x²', body: '分子留下 −x²/8+o(x²)。不要只用 √(1+x)−1~x/2。' },
    ], answer: '−1/8',
  },
  {
    id: 'limit-log-rational-difference', level: '进阶挑战', title: '对数与分式的二阶差',
    expression: '\\lim_{x\\to0}\\frac{\\ln(1+x)-x/(1+x)}{x^2}', hint: '两项的一阶部分相同，要分别保留二阶。',
    steps: [
      { title: '展开两项', body: '在 0 附近对数和分式都有定义。', latex: '\\ln(1+x)=x-\\frac{x^2}2+o(x^2),\\quad\\frac{x}{1+x}=x-x^2+o(x^2)' },
      { title: '相减', body: '二阶系数为 −1/2−(−1)=1/2；除以 x² 后余项趋零。' },
    ], answer: '1/2',
  },
  {
    id: 'limit-exponential-sine', level: '进阶挑战', title: '不同函数之间的抵消',
    expression: '\\lim_{x\\to0}\\frac{e^x-1-\\sin x}{x^2}', hint: '分别展开到二阶；正弦在此阶没有 x² 项。',
    steps: [
      { title: '比较两种展开', body: '角度使用弧度；sin x=x+O(x³)，也就是 x+o(x²)。', latex: 'e^x=1+x+\\frac{x^2}2+o(x^2),\\quad\\sin x=x+o(x^2)' },
      { title: '相减再取极限', body: '分子留下 x²/2+o(x²)，所以结果为 1/2。' },
    ], answer: '1/2',
  },
  {
    id: 'limit-integral-second-order', level: '进阶挑战', title: '积分型极限的二阶信息',
    expression: '\\lim_{x\\to0}\\frac{\\int_0^x(e^t-1)\\,dt}{x^2}', hint: '可先算出积分，或者对积分上限求导后使用洛必达。',
    steps: [
      { title: '计算定积分', body: '一个原函数是 eᵗ−t。', latex: '\\int_0^x(e^t-1)\\,dt=e^x-1-x' },
      { title: '二阶展开', body: 'eˣ−1−x=x²/2+o(x²)。' },
      { title: '除以 x²', body: '得到 1/2，不能把被积函数直接替换为其在 0 的函数值。' },
    ], answer: '1/2',
  },
  {
    id: 'limit-log-square-product', level: '进阶挑战', title: '对数平方乘趋零因子',
    expression: '\\lim_{x\\to0^+}x(\\ln x)^2', hint: '令 t=−ln x，把问题转成 t²/eᵗ。',
    steps: [
      { title: '换变量', body: '右侧 x>0，t→+∞ 且 x=e⁻ᵗ。', latex: 'x(\\ln x)^2=\\frac{t^2}{e^t}' },
      { title: '两次洛必达', body: '先为 ∞/∞，第一次求导得到 2t/eᵗ，仍为 ∞/∞；第二次得到 2/eᵗ→0。', latex: '\\lim_{t\\to+\\infty}\\frac{t^2}{e^t}=\\lim_{t\\to+\\infty}\\frac{2t}{e^t}=\\lim_{t\\to+\\infty}\\frac2{e^t}=0' },
    ], answer: '0',
  },
  {
    id: 'limit-parameter-exponential', level: '进阶挑战', title: '含参指数与正弦的差',
    expression: '\\lim_{x\\to0}\\frac{e^{ax}-1-a\\sin x}{x^2},\\quad a\\in\\mathbb R\\text{ 为常数}',
    hint: 'a 固定时，分别保留指数和正弦的二阶信息。',
    steps: [
      { title: '固定参数展开', body: 'a=0 时原式恒为 0；其他固定 a 也可使用以下展开。', latex: 'e^{ax}=1+ax+\\frac{a^2x^2}2+o(x^2),\\quad a\\sin x=ax+o(x^2)' },
      { title: '消去一次项', body: '分子剩下 a²x²/2+o(x²)，除以 x² 后得到 a²/2。' },
    ], answer: 'a²/2（a 为固定实数）',
  },
  {
    id: 'limit-sine-fifth-order', level: '进阶挑战', title: '正弦的五阶抵消',
    expression: '\\lim_{x\\to0}\\frac{\\sin x-x+x^3/6}{x^5}', hint: '一阶和三阶都已消去，需要展开到五阶。',
    steps: [
      { title: '五阶展开', body: '角度使用弧度；注意三阶项为负、五阶项为正。', latex: '\\sin x=x-\\frac{x^3}6+\\frac{x^5}{120}+o(x^5)' },
      { title: '消去并除以 x⁵', body: '剩下 1/120+o(1)。展开的阶数必须足以覆盖分母阶数。' },
    ], answer: '1/120',
  },
];

export function getLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getDailyLimitProblems(dateKey: string): DailyLimitProblem[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new Error('Invalid practice date');
  const [year, month, day] = dateKey.split('-').map(Number);
  const dayNumber = Date.UTC(year, month - 1, day);
  if (new Date(dayNumber).toISOString().slice(0, 10) !== dateKey) throw new Error('Invalid practice date');
  const absoluteDay = Math.floor(dayNumber / 86400000);
  // Do not reshuffle the questions attached to dates from the original release.
  const startDay = Date.UTC(2026, 9, 10) / 86400000;
  const slot = dateKey < expandedRotationStarts
    ? ((absoluteDay % 7) + 7) % 7
    : ((absoluteDay - startDay + 7) % dailyLimitRotationDays + dailyLimitRotationDays) % dailyLimitRotationDays;
  return limitLevels.map((level) => dailyLimitBank.filter((problem) => problem.level === level)[slot]);
}

export type LimitReviewItem = { date: string; problem: DailyLimitProblem };

export function getLimitReviewItems(records: DailyLimitRecords, throughDate: string): LimitReviewItem[] {
  getDailyLimitProblems(throughDate);
  return Object.keys(records).filter((date) => date <= throughDate).sort().flatMap((date) => {
    try { getDailyLimitProblems(date); } catch { return []; }
    return dailyLimitBank.filter((problem) => records[date]?.[problem.id]?.revealed === true
      && records[date]?.[problem.id]?.result === 'review').map((problem) => ({ date, problem }));
  });
}

export function getDailyLimitSummary(records: DailyLimitRecords, dateKey: string) {
  const attempts = getDailyLimitProblems(dateKey).map((problem) => records[dateKey]?.[problem.id]);
  return {
    assessed: attempts.filter((attempt) => attempt?.result).length,
    correct: attempts.filter((attempt) => attempt?.result === 'correct').length,
    review: attempts.filter((attempt) => attempt?.result === 'review').length,
  };
}

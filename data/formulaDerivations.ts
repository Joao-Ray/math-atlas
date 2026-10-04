import type { Formula } from '@/types';

// Proofs of existing core formulas; extension proofs live beside their formulas.
export const formulaDerivations: Record<string, NonNullable<Formula['derivation']>> = {
  'variance-identity': [
    { title: '从定义开始', body: '记 μ=E[X]，它是常数。二阶矩有限保证以下期望都存在。', latex: '\\operatorname{Var}(X)=E[(X-\\mu)^2]' },
    { title: '展开平方并使用线性性', body: '常数可以提出期望符号，E[X]=μ。', latex: 'E[X^2-2\\mu X+\\mu^2]=E[X^2]-2\\mu E[X]+\\mu^2' },
    { title: '合并常数项', body: '两项均值平方相减后留下一个负的 μ²。', latex: '\\operatorname{Var}(X)=E[X^2]-\\mu^2' },
  ],
  'sample-variance': [
    { title: '分解离均差平方和', body: '记总体均值为 μ，展开平方并利用 Σ(Xᵢ−X̄)=0。', latex: '\\sum_i(X_i-\\bar X)^2=\\sum_i(X_i-\\mu)^2-n(\\bar X-\\mu)^2' },
    { title: '两边取期望', body: '独立同分布给出 Var(X̄)=σ²/n，第一项的期望为 nσ²。', latex: 'E\\!\\left[\\sum_i(X_i-\\bar X)^2\\right]=n\\sigma^2-n\\frac{\\sigma^2}n=(n-1)\\sigma^2' },
    { title: '除以 n−1', body: 'n≥2 时分母非零，于是样本方差的期望等于总体方差。', latex: 'E[S^2]=\\sigma^2' },
  ],
  'brownian-covariance': [
    { title: '先设 s≤t', body: '较晚时刻等于较早时刻加上后续增量。', latex: 'W_t=W_s+(W_t-W_s)' },
    { title: '利用独立增量', body: 'Wₜ−Wₛ 与 Wₛ 独立，协方差为 0，Wₛ 的方差为 s。', latex: '\\operatorname{Cov}(W_s,W_t)=\\operatorname{Var}(W_s)+0=s' },
    { title: '交换时刻得到统一形式', body: '协方差对称，因此两个时刻中较小的那个决定共享波动。', latex: '\\operatorname{Cov}(W_s,W_t)=\\min(s,t)' },
  ],
  'cauchy-schwarz': [
    { title: '处理零向量', body: 'v=0 时两边都为 0，不等式立即成立。下面设 v≠0。' },
    { title: '考察平方长度', body: '任意实数 t 都有 ‖u−tv‖²≥0，取 t=(u·v)/‖v‖²。', latex: '0\\le\\|u\\|^2-\\frac{(u\\cdot v)^2}{\\|v\\|^2}' },
    { title: '整理并开平方', body: '两边乘以正的 ‖v‖²再开平方。等号要求 u 为 v 的倍数。', latex: '|u\\cdot v|\\le\\|u\\|\\|v\\|' },
  ],
  'simple-regression': [
    { title: '写出平方损失', body: '含截距的直线为 b₀+b₁x，目标是最小化残差平方和。', latex: 'L(b_0,b_1)=\\sum_i(y_i-b_0-b_1x_i)^2' },
    { title: '对截距求导', body: '一阶条件使残差总和为 0，解出截距。', latex: 'b_0=\\bar y-b_1\\bar x' },
    { title: '对斜率求导并代入', body: '只要 x 不全相同，分母为正，平方损失有唯一最小点。', latex: 'b_1=\\frac{\\sum_i(x_i-\\bar x)(y_i-\\bar y)}{\\sum_i(x_i-\\bar x)^2}' },
  ],
};

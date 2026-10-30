import type { CourseId, Topic } from '@/types';

export const COURSE_TOPIC_TARGET = 70;
export const roadmapTopicId = (course: CourseId, key: string) => `c70-${course}-${key}`;
// @id links to existing content. key=title reserves a stable ID, not a published lesson.
// Publishing a reserved lesson never changes its ID or silently turns other plans into content.
type ChapterSpec = { title: string; entries: string };
export const courseBlueprints: Record<CourseId, ChapterSpec[]> = {
  calculus: [
    { title: '极限与连续', entries: '@limits|@asymptotic-cancellation|one-sided=单侧极限与双侧极限|limit-laws=极限运算法则及非零分母|squeeze=夹逼定理的使用条件|infinite-limits=无穷极限与渐近线|infinitesimal-orders=等价无穷小的替换边界|continuity-types=间断点的分类|iv-properties=介值性质与零点存在|elementary-limits=两个重要极限的变形' },
    { title: '导数及其应用', entries: '@derivatives|@mean-value-theorem|@differential-error-estimates|@implicit-extrema|@parametric-curvature|derivative-rules=乘积商与复合求导|exp-log-diff=对数求导与幂指函数|monotone-convex=单调性、凹凸与拐点|optimization=实际最值问题的建模|lhopital=洛必达法则的条件检查' },
    { title: '一元积分', entries: '@integrals|@integration-techniques|@variable-limit-integrals|@integral-symmetry|@improper-integrals|@wallis-integrals|@gamma-beta-integrals|riemann-sums=黎曼和与定积分定义|partial-fractions=有理函数的部分分式|integral-estimates=定积分的估值与比较' },
    { title: '数列与级数', entries: '@taylor-series|@sequences-series|geometric=几何级数与收敛区间|p-series=p 级数与比较判别|ratio=比值判别与失效情形|root=根值判别|alternating=交错级数的误差估计|abs-cond=绝对收敛与重排边界|power-radius=幂级数的收敛半径|termwise=幂级数逐项求导与积分' },
    { title: '多元微分', entries: '@multivariable-calculus|@constrained-extrema|partial-diff=偏导数与可微性的区别|total-diff=全微分及线性近似|chain-multi=多元复合函数链式法则|implicit-multi=隐函数存在与偏导|directional=方向导数的定义|gradient=梯度与最速上升|hessian=海森矩阵与局部极值|lagrange-two=多个约束下的乘子法' },
    { title: '多重积分与曲线曲面', entries: '@polar-area|@scalar-line-integrals|@graph-surface-area|@triple-integral-slicing|double-rect=矩形区域二重积分|double-general=一般区域的积分次序|cylindrical=柱坐标积分|spherical=球坐标积分|jacobian-volume=变量代换与体积雅可比|green-theorem=格林公式与方向约定' },
    { title: '微分方程', entries: '@ordinary-differential-equations|@bernoulli-ode-substitution|@linear-first-order-odes|@second-order-linear-odes|separable=可分离变量方程与常数解|exact=恰当方程与积分因子|ode-existence=初值问题的存在唯一性|order-reduction=可降阶方程|euler-equations=欧拉型微分方程|linear-systems=线性微分方程组入门' },
  ],
  'linear-algebra': [
    { title: '向量与空间', entries: '@vectors|linear-combination=线性组合的求解|span=生成空间|independence=线性无关与冗余向量|basis-coordinates=基与坐标表示|dimension=维数与基的扩充|vector-rank=向量组的秩|column-space=列空间|row-space=行空间|nullspace=零空间的参数描述' },
    { title: '矩阵运算', entries: '@matrices|transpose=转置及乘积次序|inverse=逆矩阵的存在条件|elementary=初等矩阵|block=分块矩阵运算|trace=迹的性质|powers=矩阵幂与递推|triangular=三角矩阵|sym-skew=对称与反对称分解|orth-columns=列正交矩阵' },
    { title: '方程组与消元', entries: '@linear-systems|rref=行最简形与主元|rank-nullity=秩与自由变量个数|homogeneous=齐次方程解空间|param-solutions=非齐次方程的通解|consistency=增广矩阵的相容性|lu=LU 分解与选主元|pivots=主元位置和线性关系|rank-product=矩阵乘积的秩界|gauss-jordan=高斯约当消元求逆' },
    { title: '行列式', entries: '@determinants|laplace=按行按列展开|permutations=排列符号与行列式定义|row-swap=行变换对行列式的影响|det-product=乘积行列式|cramer=克拉默法则的适用范围|adjugate=伴随矩阵|vandermonde=范德蒙德行列式|block-det=分块三角行列式|det-parameter=含参数行列式与奇异点' },
    { title: '特征结构', entries: '@eigenvalues|@diagonalization|@nilpotent-matrix-series|char-poly=特征多项式|multiplicity=代数重数与几何重数|eigenspace=特征子空间的维数|similarity=相似矩阵的不变量|real-complex=实矩阵的复特征值|trace-det-eigen=迹与行列式的谱表达|jordan-preview=不可对角化矩阵的例子' },
    { title: '正交与分解', entries: '@orthogonality|@qr-decomposition|@svd|@orthogonal-isometries|gram-schmidt=施密特正交化|least-squares=最小二乘与正规方程|orth-complement=正交补空间|projection-matrix=正交投影矩阵|spectral=实对称矩阵谱定理|pseudoinverse=广义逆与最小范数解' },
    { title: '二次型及计算', entries: '@positive-definite|symmetric-reduction=二次型的正交化简|sylvester=顺序主子式判别|inertia=正负惯性指数|level-sets=二次型的等值集合|semidefinite=半正定与零空间|cholesky=乔列斯基分解|conditioning=条件数与误差放大|low-rank=低秩近似|matrix-norms=常见矩阵范数' },
  ],
  probability: [
    { title: '事件与概率', entries: '@conditional-probability|event-sets=事件的集合运算|axioms=概率公理及推论|addition=互斥事件与加法公式|independence=事件独立的定义|inclusion-exclusion=容斥原理|total-probability=全概率公式|bayes=贝叶斯公式的先验与后验|mutual-independence=两两独立与相互独立|conditional-independence=条件独立与无条件独立' },
    { title: '随机变量与分布', entries: '@random-variables|@distributions|pmf=离散概率质量函数|cdf=分布函数的连续方向|density=密度不是单点概率|quantiles=分位数与逆分布|bernoulli-binomial=伯努利与二项分布|poisson-limit=泊松近似的参数|geom-neg-binomial=几何与负二项的计数约定|exp-gamma=指数与伽马的参数化' },
    { title: '联合分布与变换', entries: '@variable-transformations|@joint-density-independence|multivariate-cdf=联合分布函数|jacobian=多元变量代换|standard-normal=正态标准化|order-statistics=次序统计量的分布|max-min=最大值与最小值的分布|convolution=独立和的卷积|polar-transform=极坐标下的随机变量|discrete-transform=离散映射的概率合并' },
    { title: '期望与相关结构', entries: '@expectation-variance|@covariance-correlation|lotus=随机变量函数的期望|moments=原点矩与中心矩|cauchy-schwarz=随机变量的柯西施瓦茨不等式|jensen=詹森不等式与等号|indicator-count=示性变量求期望|tail-integrals=尾概率积分公式|covariance-matrix=协方差矩阵的半正定性|correlation-bounds=相关系数的界与限制' },
    { title: '条件期望与混合', entries: '@conditional-expectation|@total-variance-decomposition|conditional-pmf=离散条件分布|conditional-density=条件密度|tower=条件期望的塔式性质|projection=条件期望的投影解释|partition=对事件分割进行条件化|mixtures=混合分布|conditional-covariance=全协方差公式|random-sums=随机项数求和' },
    { title: '生成函数与极限', entries: '@probability-generating-functions|@law-large-numbers|@central-limit-theorem|mgf=矩母函数的存在区间|characteristic=特征函数的基本性质|sum-characteristic=独立和的特征函数|delta=Delta 方法入门|slutsky=斯卢茨基定理|continuous-mapping=连续映射定理|convergence-modes=几种概率收敛方式' },
    { title: '概率界与综合', entries: '@probability-inequalities|chernoff=切尔诺夫界|hoeffding=有界独立变量的集中界|union-bound=联合界及使用误差|borel-cantelli-one=第一波莱尔康泰利引理|borel-cantelli-two=第二波莱尔康泰利引理|rare-events=稀有事件的估计|poisson-approx=二项分布的泊松近似|normal-approx=连续性修正与正态近似|zero-one=独立尾事件的零一律' },
  ],
  statistics: [
    { title: '样本与数据描述', entries: 'sample-statistics=样本、总体与统计量|empirical-cdf=经验分布函数|unbiased-variance=无偏样本方差|sample-quantiles=样本分位数|boxplot=箱线图的解释边界|scatter=散点图与变量关系|outliers=异常值与稳健性|random-sampling=随机抽样与代表性|bootstrap=自助法的基本流程|missing-data=缺失机制与分析偏差' },
    { title: '点估计', entries: '@estimation|@maximum-likelihood|@sufficient-statistics|unbiasedness=无偏性的定义|mse=偏差方差与均方误差|consistency=估计量的一致性|efficiency=估计效率比较|fisher=费舍尔信息|cramer-rao=克拉美罗下界|moments=矩估计法' },
    { title: '区间估计', entries: '@confidence-intervals|@student-t-inference|z-mean=已知方差的均值区间|paired-t=配对样本的 t 区间|welch=异方差两样本区间|proportion=总体比例的区间|variance-ci=正态总体方差区间|prediction=预测区间与均值区间|coverage=置信区间的覆盖率|pivot=枢轴量的构造' },
    { title: '假设检验', entries: '@hypothesis-testing|@chi-square-goodness-of-fit|error-types=两类错误及权衡|power=功效函数与样本量|p-value=p 值不代表原假设概率|neyman-pearson=奈曼皮尔逊检验|likelihood-ratio=似然比检验|one-sided=单侧检验的方向|bonferroni=多重检验与校正|independence-test=列联表独立性检验' },
    { title: '回归建模', entries: '@regression|@logistic-regression|ols=最小二乘假设|residuals=残差诊断|dummy=虚拟变量编码|interactions=交互项的解释|multicollinearity=多重共线性|heteroskedastic=异方差与标准误|regularization=岭回归与套索概念|cross-validation=交叉验证与数据泄漏' },
    { title: '方差分析与设计', entries: '@analysis-of-variance|two-way=双因素方差分析|blocks=随机区组设计|contrasts=对比与可估函数|multiple-comparisons=事后多重比较|effect-size=效应量与显著性|randomization=随机分配的作用|paired-design=配对与重复测量|confounding=混杂变量|causal-association=相关和因果的区别' },
    { title: '贝叶斯与非参数方法', entries: '@bayesian-inference|beta-binomial=贝塔二项共轭模型|normal-conjugacy=正态共轭更新|map=后验众数与最大似然|mcmc=MCMC 的平稳目标|credible=可信区间与置信区间|posterior-odds=后验赔率与贝叶斯因子|sign-test=符号检验|wilcoxon=秩检验的假设|ks=柯尔莫哥洛夫斯米尔诺夫检验' },
  ],
  'stochastic-process': [
    { title: '过程概念与平稳性', entries: '@weak-stationarity-spectrum|index-state=时间指标与状态空间|sample-paths=样本路径与随机变量截面|finite-dimensional=有限维分布|stationary-increments=平稳增量|strict-stationarity=严格平稳与宽平稳|gaussian-process=高斯过程的确定方式|mean-square=均方连续|independent-increments=独立增量|ergodicity=遍历性与总体平均' },
    { title: '泊松与计数过程', entries: '@poisson-process|@poisson-superposition|@nonhomogeneous-poisson|@compound-poisson-moments|arrival-conditional=给定计数的到达时刻|interarrival=独立指数到达间隔|erlang=第 n 次到达的分布|marked=标记泊松过程|laplace-functional=泊松过程的拉普拉斯泛函|compensator=计数过程的补偿' },
    { title: '离散时间马尔可夫链', entries: '@markov-chains|@stationary-distributions|@hitting-time-equations|@markov-periodicity|@branching-extinction|chapman=查普曼柯尔莫哥洛夫方程|irreducible=互达类与不可约性|recurrence=常返与暂留|absorbing=吸收链与吸收概率|fundamental=吸收链的基本矩阵' },
    { title: '连续时间马尔可夫链', entries: '@continuous-time-markov|generator=生成矩阵与转移速率|holding=状态停留时间|jump-chain=嵌入跳链|birth-death=生灭过程|pure-birth=纯生过程与爆炸检查|poisson-ctmc=泊松过程作为连续时间链|forward=柯尔莫哥洛夫向前方程|backward=柯尔莫哥洛夫向后方程|ctmc-stationary=连续时间链的平稳方程' },
    { title: '更新与再生', entries: '@renewal-processes|@renewal-reward-theorem|renewal-equation=更新方程|renewal-function=更新函数|blackwell=布莱克韦尔更新定理|key-renewal=关键更新定理的条件|equilibrium-age=平衡年龄分布|residual-life=剩余寿命分布|inspection=观察悖论与长度偏差|alternating=交替更新过程' },
    { title: '布朗运动与随机积分', entries: '@brownian-motion|@ito-calculus|@ito-isometry|brownian-increments=布朗增量的协方差|brownian-bridge=布朗桥的条件化|quadratic-variation=二次变差|girsanov=测度变换的初步图景|geometric-brownian=几何布朗运动|ornstein-uhlenbeck=奥恩斯坦乌伦贝克过程|ito-product=伊藤乘积法则' },
    { title: '鞅、停时与随机游走', entries: '@martingales|@random-walks|filtration=滤过与信息流|stopping-time=停时的定义|optional-stopping=可选停止的条件|doob-max=鞅的极大不等式|uniform-integrability=一致可积与鞅|martingale-convergence=鞅收敛定理|gambler-ruin=赌徒破产边界问题|walk-limit=随机游走的扩散极限' },
  ],
  'higher-algebra': [
    { title: '多项式', entries: '@polynomial-gcd|division=多项式带余除法|bezout=多项式贝祖等式|irreducible=不可约多项式|multiplicity=重根与形式导数|factorization=唯一因式分解|rational-roots=有理根判别|eisenstein=艾森斯坦判别|interpolation=拉格朗日插值|symmetric=对称多项式' },
    { title: '线性空间', entries: '@vector-space-basis|subspaces=子空间的判别|sum-intersection=子空间的和与交|dimension-formula=子空间维数公式|direct-sum=直和的唯一分解|quotient=商空间|dual=对偶空间|annihilator=零化子空间|coordinates=基下的坐标同构|change-basis=过渡矩阵与基变换' },
    { title: '线性映射', entries: '@linear-map-kernel-image|rank-nullity=线性映射的维数定理|first-isomorphism=线性空间第一同构定理|projections=幂等算子与投影|operator-algebra=线性算子代数|composition=复合映射的核与像|functionals=线性泛函|dual-map=对偶映射|rank-factorization=秩分解|one-sided-inverse=左逆与右逆' },
    { title: '标准形与不变子空间', entries: '@minimal-polynomial|@invariant-subspaces|characteristic=特征多项式的不变性|cayley-hamilton=凯莱哈密顿定理|primary=主分解|cyclic=循环子空间|jordan-chains=若尔当链|nilpotent-index=幂零指数与块大小|commuting=可交换算子的共同不变空间|simultaneous=同时对角化的条件' },
    { title: '双线性型与二次型', entries: '@quadratic-inertia|bilinear=双线性型的矩阵|congruence=合同与相似的区别|polarization=极化恒等式|positive-forms=正定双线性型|gram=格拉姆矩阵|orthogonal-forms=双线性型的正交补|isotropic=迷向向量|complex-forms=复数域上的二次型|inertia-law=实二次型惯性定律证明' },
    { title: '内积空间与算子', entries: 'inner-product=实与复内积空间|cauchy-schwarz=内积空间的柯西施瓦茨不等式|gram-schmidt=正交基的构造证明|adjoint=伴随算子|self-adjoint=自伴算子|unitary=酉算子|normal=正规算子|spectral=有限维谱定理|positive-operator=正算子|singular-values=算子的奇异值' },
    { title: '域与结构拓展', entries: 'characteristic-field=域的特征|finite-fields=有限域的基本例子|extensions=域扩张与次数|algebraic=代数元|transcendental=超越元|minimal-field=代数元的最小多项式|tensor=张量积入门|exterior=外积与交替性|det-exterior=行列式的外代数解释|canonical=有理标准形入门' },
  ],
  'complex-analysis': [
    { title: '复数与基本函数', entries: '@complex-roots|argument=模与辐角|exponential=复指数与周期|log-branches=复对数的支与运算法则|powers=复幂的多值性|stereographic=球面投影|mobius=莫比乌斯变换|cross-ratio=交比|riemann-sphere=黎曼球面|extended-plane=无穷远点邻域' },
    { title: '全纯与调和', entries: '@holomorphic-cr|@harmonic-conjugates|limits=复函数极限|wirtinger=维尔廷格导数|cr-sufficiency=柯西黎曼方程的充分条件|higher-derivatives=全纯函数的高阶可导性|analytic-power=解析与幂级数|conformal=保角性的局部条件|local-inverse=全纯局部逆|harmonic-mean=调和函数均值性质' },
    { title: '复积分与整体性质', entries: '@cauchy-integral-formula|contours=围道参数化与方向|path-independence=路径无关性|primitives=原函数的存在|cauchy-goursat=柯西古萨定理|winding=绕数与带方向的围道|homotopy=围道同伦|morera=莫雷拉定理|liouville=刘维尔定理|maximum=最大模原理' },
    { title: '级数与局部展开', entries: '@laurent-expansion|taylor-radius=泰勒展开的收敛半径|compact-uniform=紧集上一致收敛|identity=恒等定理|zero-order=零点的阶|meromorphic=亚纯函数|principal-part=洛朗展开的主部|annuli=不同环域的不同展开|multivalued=多值函数的处理|branch-points=分支点与割线' },
    { title: '奇点与留数应用', entries: '@residue-theorem|essential=本性奇点|removable=可去奇点判别|poles=极点与留数|multiple-poles=高阶极点的留数|argument-principle=辐角原理|rouche=儒歇定理|jordan=约当引理的条件|residue-infinity=无穷远留数|real-integrals=实积分的围道选择' },
    { title: '保角映射与边值', entries: 'disk-automorphisms=圆盘自同构|half-plane=半平面到圆盘映射|strips=带形区域的映射|joukowski=儒可夫斯基变换|schwarz=施瓦茨引理|schwarz-pick=施瓦茨皮克不等式|riemann-mapping=黎曼映射定理入门|poisson-kernel=圆盘泊松核|dirichlet=圆盘狄利克雷问题|reflection=施瓦茨反射原理' },
    { title: '解析函数进阶', entries: 'normal-families=正规族|montel=蒙泰尔定理入门|weierstrass=魏尔斯特拉斯一致收敛定理|products=全纯函数的无穷乘积|mittag-leffler=米塔列夫勒展开入门|continuation=解析延拓|monodromy=单值性与延拓路径|gamma=复伽马函数入门|zeta=黎曼泽塔函数的初始定义|log-derivative=对数导数的零极点信息' },
  ],
  'analytic-geometry': [
    { title: '空间向量与坐标', entries: '@triple-product|coordinates=空间坐标系|inner-product=空间点积|direction-cosines=方向角与方向余弦|cross-product=叉积与面积|frames=空间基与标架|orthogonal-change=正交坐标变换|affine-combination=仿射组合|orientation=右手系与定向|gram-determinant=格拉姆行列式与体积' },
    { title: '直线与平面', entries: '@line-plane-equations|@spatial-distances|@point-line-projection|line-parameter=直线参数式与对称式|plane-normal=平面的法向式|line-angle=两直线夹角|line-plane-angle=线面夹角|plane-angle=二面角|skew-closest=异面直线的公垂线|plane-pencil=平面束与交线' },
    { title: '球面与空间圆', entries: 'sphere-plane=球面与平面的交圆|sphere-equation=球面方程与配方|two-spheres=两球位置关系|tangent-plane=球面的切平面|radical-plane=两球的根平面|space-circle=空间圆的表示|point-sphere=点到球面的距离|power=点对球的幂|orthogonal-spheres=正交球面|coaxial=共轴球系入门' },
    { title: '二次曲线', entries: '@conic-principal-axes|ellipse=椭圆标准式与焦点|hyperbola=双曲线标准式|parabola=抛物线标准式|eccentricity=离心率与统一定义|directrix=准线与焦参数|asymptotes=双曲线渐近线|conic-determinant=一般二次曲线的判别|rotated-coordinates=消去交叉项的旋转|parametric-conics=圆锥曲线参数式' },
    { title: '二次曲面', entries: '@quadric-surfaces|ellipsoid=椭球面|one-sheet=单叶双曲面|two-sheet=双叶双曲面|elliptic-paraboloid=椭圆抛物面|hyperbolic-paraboloid=双曲抛物面|cones=二次锥面|cylinders=柱面与母线|quadric-rank=二次曲面的秩与类型|degenerate=退化二次曲面' },
    { title: '变换与射影拓展', entries: 'translation=平移与中心化|rotation=空间旋转|reflection=镜面反射|affine=仿射变换|homogeneous=齐次坐标|projective=射影变换入门|infinity=无穷远方向|dual-conic=对偶二次曲线|polarity=极点与极线|invariants=二次方程的几何不变量' },
    { title: '曲线曲面拓展', entries: 'space-curvature=空间曲线曲率|torsion=挠率|frenet=弗雷内标架|surface-tangent=曲面切平面|surface-normal=曲面法向|parametric-surface=曲面参数化|first-form=第一基本形式入门|second-form=第二基本形式入门|gaussian-curvature=高斯曲率入门|geodesics=测地线的局部解释' },
  ],
  'measure-theory': [
    { title: '集合与可测结构', entries: '@sigma-algebra-measure|set-limits=集合上下极限|algebras=集合代数|generated=生成的 σ 代数|borel=波莱尔 σ 代数|pi-lambda=π-λ 定理|monotone-class=单调类定理|product-sigma=乘积 σ 代数|trace=迹 σ 代数|atoms=原子与非原子' },
    { title: '测度及其构造', entries: 'continuity=测度的上下连续性|outer-measure=外测度|caratheodory=卡拉泰奥多里可测性|premeasure=预测度|extension=测度扩张定理|uniqueness=测度的唯一性|lebesgue=勒贝格测度|counting=计数测度|dirac=狄拉克测度|probability=概率测度的规范化' },
    { title: '可测函数与零集', entries: '@measurable-functions|composition=可测函数的复合|limits=可测函数列的极限|simple-approximation=简单函数的单调逼近|ae=几乎处处收敛|null-completion=零集与测度完备化|pushforward=像测度|distribution=分布函数构造测度|random-variables=随机变量的可测性|supremum=可数上确界的可测性' },
    { title: '勒贝格积分', entries: '@lebesgue-simple-integral|nonnegative=非负函数的积分|integrable=可积性与绝对可积|positive-negative=正负部分的分解|monotonicity=积分的单调性|ae-invariance=几乎处处相等与积分|markov=积分形式的马尔可夫界|layer-cake=分层积分公式|change-measure=换测度积分|riemann=黎曼积分与勒贝格积分比较' },
    { title: '收敛定理', entries: '@monotone-convergence|@dominated-convergence|@fatou-lemma|in-measure=依测度收敛|egorov=叶果罗夫定理|lusin=卢津定理|uniform-integrability=一致可积的判别|vitali=维塔利收敛定理|scheffe=谢费引理|reverse-fatou=反向法图引理' },
    { title: 'Lp 空间', entries: 'holder=赫尔德不等式|minkowski=闵可夫斯基不等式|norm=Lp 范数|completeness=Lp 空间的完备性|l2-projection=L² 正交投影|simple-density=简单函数的稠密性|continuous-density=连续函数的稠密性|duality=Lp 对偶性入门|inclusions=有限测度上的 Lp 包含关系|weak=弱收敛入门' },
    { title: '乘积测度与测度导数', entries: 'tonelli=托内利定理|fubini=富比尼定理|sections=可测截面|product-measure=乘积测度的构造|conditional-fubini=交换积分次序的条件|radon-nikodym=拉东尼科迪姆导数|lebesgue-decomposition=勒贝格分解|absolute-continuity=测度的绝对连续性|singular=互相奇异的测度|differentiation=勒贝格微分定理入门' },
  ],
  'mathematical-analysis': [
    { title: '实数与数列', entries: '@real-completeness|@cauchy-sequences|@sequence-limit-proof|subsequence-bw=有界数列与收敛子列|limsup-inf=上极限与下极限|monotone-sequences=单调有界数列定理|stolz=斯托尔茨定理|recursive=递推数列的收敛证明|asymptotic=渐近符号的量词|subsequence-criterion=子列判别法' },
    { title: '连续性与紧致性', entries: '@uniform-continuity|heine=海涅定理|compact=紧集与有限覆盖|intermediate=介值定理的证明|extreme-value=最值定理|discontinuities=间断点集合|oscillation=函数振幅|lipschitz=利普希茨连续|modulus=连续模|connected-images=连续像与连通性' },
    { title: '微分理论', entries: 'darboux=导数的介值性质|fermat=费马引理与驻点|rolle=罗尔定理的证明|cauchy-mvt=柯西中值定理|taylor-peano=佩亚诺余项的泰勒公式|taylor-lagrange=拉格朗日余项|convexity=凸函数的导数判别|inverse-derivative=反函数求导的证明|implicit-one=一元隐函数的局部求导|derivative-integrability=导数与可积性的区别' },
    { title: '积分理论', entries: '@auxiliary-integral-sign|@singular-integral-tests|@integral-mean-inequalities|darboux-sums=达布和|riemann-criterion=黎曼可积性准则|fundamental=微积分基本定理的证明|parts=分部积分的理论条件|dirichlet-integral=反常积分的狄利克雷判别|uniform-improper=反常积分的一致收敛|parameter-diff=含参积分求导的控制条件' },
    { title: '数项级数', entries: '@series-convergence-tests|@dirichlet-series-test|@geometric-majorants|cauchy-product=级数的柯西乘积|abel=阿贝尔判别|raabe=拉阿伯判别法|comparison=正项级数比较判别|ratio-root=比值与根值判别的边界|absolute-rearrangement=绝对收敛与重排|multiple-series=重级数的求和次序' },
    { title: '函数列与幂级数', entries: '@uniform-convergence|@power-series-boundaries|m-test=魏尔斯特拉斯 M 判别|uniform-cauchy=一致柯西准则|exchange-integral=一致收敛下交换积分|exchange-derivative=函数列导数与极限|abel-limit=阿贝尔极限定理|power-analytic=幂级数与解析性|fourier=傅里叶级数的初步收敛|pointwise=逐点与一致收敛的反例' },
    { title: '多元分析及综合', entries: '@functional-consistency|multivariate-limits=多元极限的路径检验|frechet=弗雷歇可微|chain-maps=向量映射的链式法则|hessian=二阶微分与对称性|inverse-mapping=反函数定理入门|implicit-mapping=隐函数定理入门|compact-metric=度量空间的紧致性|complete-functions=函数空间的完备性|arzela-ascoli=阿尔泽拉阿斯科利定理入门' },
  ],
};

export type RoadmapEntry = { id: string; title: string; published: boolean };
export function getCourseRoadmap(course: CourseId, topics: readonly Topic[]) {
  const map = new Map(topics.filter((topic) => topic.courseId === course).map((topic) => [topic.id, topic]));
  return courseBlueprints[course].map((chapter, index) => ({
    id: `${course}-chapter-${index + 1}`, title: chapter.title,
    entries: chapter.entries.split('|').map((spec): RoadmapEntry => {
      const existing = spec.startsWith('@');
      const separator = spec.indexOf('=');
      const id = existing ? spec.slice(1) : roadmapTopicId(course, spec.slice(0, separator));
      const topic = map.get(id);
      return { id, title: topic?.titleZh ?? (existing ? id : spec.slice(separator + 1)), published: !!topic };
    }),
  }));
}
export function getRoadmapSummary(course: CourseId, topics: readonly Topic[]) {
  const entries = getCourseRoadmap(course, topics).flatMap((chapter) => chapter.entries);
  const published = entries.filter((entry) => entry.published).length;
  return { target: COURSE_TOPIC_TARGET, planned: entries.length - published, published };
}

// Filtering changes visible rows, never the target, chapter numbering or real content counts.
export function getVisibleRoadmap(course: CourseId, topics: readonly Topic[], publishedOnly = false) {
  return getCourseRoadmap(course, topics).map((chapter, index) => ({
    ...chapter, position: index + 1, total: chapter.entries.length,
    publishedCount: chapter.entries.filter((entry) => entry.published).length,
    entries: chapter.entries.map((entry, i) => ({ ...entry, position: i + 1 })).filter((entry) => !publishedOnly || entry.published),
  })).filter((chapter) => chapter.entries.length > 0);
}

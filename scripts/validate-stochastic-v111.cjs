const assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m,f) => m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
let batch;
try { batch=require('../data/stochasticExpansionV111.ts'); }
finally { if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts']; }
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
const answer=(key,n,text)=>assert.ok(batch.stochasticV111Problems.find(p=>p.id===`c70-stochastic-process-${key}-exercise-${n}`)?.answer.includes(text));
assert.equal(batch.stochasticV111Topics.length,10);assert.equal(batch.stochasticV111Problems.length,20);
const signs=[-1,1]; const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
assert.deepEqual(signs.map(z=>2*z),[-2,2]);assert.equal(signs.filter(z=>z===1&&2*z===2).length/signs.filter(z=>z===1).length,1);answer('sample-paths',2,'不独立');
const iid=signs.flatMap(x=>signs.map(y=>[x,y]));near(iid.filter(([x,y])=>x===1&&y===1).length/4,1/4);near(signs.filter(z=>z===1).length/2,1/2);answer('finite-dimensional',1,'1/4 和 1/2');near(.4/(.3+.4),4/7);
for(const t of [0,1,4])for(const h of [.5,1,2])for(const z of signs)near((t+h)*z-t*z,h*z);
near(mean(signs.map(z=>z*z)),1);answer('stationary-increments',2,'协方差为 1');answer('strict-stationarity',2,'不严格平稳');
// For X=Z,Y=SZ: E[S]=0, E[Z²]=1, so covariance is zero;
// X+Y has an atom from S=-1 while Var(X+Y)=2. That excludes both Gaussian cases.
near(mean(signs),0);near(mean(signs.map(s=>(1+s)**2)),2);near(signs.filter(s=>1+s===0).length/2,.5);answer('gaussian-process',2,'概率 1/2');
for(const z of [-2,.25,4])near(2*z-2*z,0);answer('gaussian-process',1,'差恒为 0');
for(const lambda of [.5,2]) { const errors=[.1,.01,.001].map(h=>lambda*h+(lambda*h)**2);assert.ok(errors[2]<errors[1]&&errors[1]<errors[0]); }
answer('mean-square',2,'λh+(λh)²');near(Math.exp(-1)*Math.exp(-2),Math.exp(-3));answer('independent-increments',1,'e^(−3)');
// Exact Rademacher enumeration: persistent sign has error 1, independent n-sample mean error 1/n.
for(let n=1;n<=8;n++){let mse=0;for(let mask=0;mask<2**n;mask++){let sum=0;for(let k=0;k<n;k++)sum+=(mask&(1<<k))?1:-1;mse+=(sum/n)**2;}near(mse/2**n,1/n);for(const z of signs)near((Array(n).fill(z).reduce((a,b)=>a+b,0)/n)**2,1);}
answer('ergodicity',1,'不遍历');answer('ergodicity',2,'1/n');near(Math.exp(-3)/Math.exp(-2),Math.exp(-1));near(2/(2**2),.5);answer('interarrival',2,'方差 1/2');
console.log('Stochastic V111: finite distributions, shared-increment counterexample, Gaussian mixture atom, second moments, exact time-average enumeration and waiting times passed.');

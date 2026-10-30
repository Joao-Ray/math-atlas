const assert = require('node:assert/strict'), fs = require('node:fs'), ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, f);
let batch;
try { batch = require('../data/statisticsExpansionV111.ts'); }
finally { if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts']; }
const near = (a, b) => assert.ok(Math.abs(a-b) < 1e-10, `${a} != ${b}`);
const answer = (key, n, text) => assert.ok(batch.statisticsV111Problems.find(p => p.id === `c70-statistics-${key}-exercise-${n}`)?.answer.includes(text));
const mean = a => a.reduce((s,x) => s+x, 0)/a.length;
const variance = a => mean(a.map(x => (x-mean(a))**2));
const quantile = (a,p) => [...a].sort((a,b)=>a-b)[Math.ceil(a.length*p)-1];
assert.equal(batch.statisticsV111Topics.length, 8); assert.equal(batch.statisticsV111Problems.length, 16);
assert.equal(quantile([8,1,4,2,9,3], .25), 2); assert.equal(quantile([8,1,4,2,9,3], .75), 8);
assert.equal(quantile([1,2,10,20], .5), 2); near((2+10)/2, 6); answer('sample-quantiles',2,'为 6');
const a=[1,2,3,4,5,6,7,20], q1=quantile(a,.25), q3=quantile(a,.75), lo=q1-1.5*(q3-q1), hi=q3+1.5*(q3-q1);
assert.deepEqual([lo,hi],[-4,12]); assert.deepEqual(a.filter(x=>x<lo||x>hi),[20]); assert.deepEqual([4,20,21].filter(x=>x<4||x>20),[21]); answer('boxplot',1,'须端点 1、7');
const x=[-1,0,1], y=x.map(v=>v*v); near(mean(x.map((v,i)=>v*y[i]))-mean(x)*mean(y),0); near(variance(x),2/3); near(variance(y),2/9); answer('scatter',1,'不独立');
near(mean([1,2,3,4,105])-mean([1,2,3,4,5]),20); assert.equal(quantile([1,2,3,4,105],.5),3); assert.equal(quantile([100,100,100,4,5],.5),100); answer('outliers',1,'3→23');
near(.8*60+.2*90,66); near((60+90)/2,75); near(10/100,.1); answer('random-sampling',1,'66');
const bootstrapMeans=[0,2].flatMap(a=>[0,2].map(b=>(a+b)/2)); assert.deepEqual(bootstrapMeans,[0,1,1,2]); near(mean(bootstrapMeans),1); near(variance(bootstrapMeans),.5); near(variance([1,1]),0); answer('bootstrap',1,'方差 1/2');
const responded=[{y:0,weight:.5},{y:10,weight:.25}]; near(responded.reduce((s,v)=>s+v.y*v.weight,0)/responded.reduce((s,v)=>s+v.weight,0),10/3); answer('missing-data',2,'10/3');
near(2*mean([1,2,3]),4); near(variance([1,2,3]),2/3); answer('moments',2,'2/3');
console.log('Statistics V111: quantiles, fences, dependence, robustness, weighting, exact bootstrap enumeration, missingness and moment calculations passed.');

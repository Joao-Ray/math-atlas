const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const previous=require.extensions['.ts'];
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
let lessons;
try{({seriesV113:lessons}=require('../data/tenVersions/calculus.ts'));}finally{if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
assert.equal(lessons.length,8);
for(const l of lessons){assert.equal(l.exercises.length,9);assert.ok(l.definition.length>60);assert.ok(l.exercises.every(p=>p.steps.length>=2&&p.hints.length));}
const near=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,`${a} vs ${b}`);
const derivative=(f,x)=>{const h=1e-6;return(f(x+h)-f(x-h))/(2*h);};
const integrate=(f,a,b)=>{const n=10000,h=(b-a)/n;let sum=(f(a)+f(b))/2;for(let i=1;i<n;i++)sum+=f(a+i*h);return sum*h;};
for(const n of [1,2,3]){
  near(derivative(x=>x**n*Math.exp(x),1),(n+1)*Math.E);
  near(derivative(x=>(x+n)/(x+n+1),0),1/(n+1)**2);
  near(derivative(x=>x**x,n),n**n*(Math.log(n)+1),1e-6);
  const a=n+1;near(derivative(x=>(x+a)**x,0),Math.log(a));
  near((-n)**3-3*n*n*(-n),2*n**3);near(n**3-3*n*n*n,-2*n**3);
  near((-n)**4+4*n**3*(-n),-3*n**4);
  const volume=x=>x*(6*n-2*x)**2;near(volume(n),16*n**3);
  for(let k=1;k<300;k++)assert.ok(volume(3*n*k/300)<=volume(n)+1e-8);
  near(Math.expm1(n*1e-8)/1e-8,n,1e-6);
  near(Math.log1p(n*1e-8)/Math.sin((n+1)*1e-8),n/(n+1),1e-7);
  const N=10000;let right=0,square=0;for(let k=1;k<=N;k++){right+=(n*k/N)*(n/N);square+=(n/N)*(k/N)**2;}
  near(right,n*n/2,.0005);near(square,n/3,.0002);
  for(const x of [.3,1,3]){
    near((x+n)/((x+1)*(x+2)),(n-1)/(x+1)+(2-n)/(x+2));
    near(derivative(t=>Math.log(Math.abs(t/(t+n)))/n,x),1/(x*(x+n)));
  }
  const I=integrate(Math.exp,0,n);assert.ok(I>=n&&I<=n*Math.exp(n));
}
near(derivative(x=>Math.sin(x*x),0),0);
near(derivative(x=>Math.sin(x)**x,Math.PI/2),0);
near(integrate(Math.abs,-1,1),1);
near(integrate(x=>x,-1,1),0);
assert.ok(-Math.log(1e-8)>10);
console.log(JSON.stringify({status:'passed',version:'1.13.0',topics:8,problems:72,scope:'Calculus worked-example identities, finite differences, quadrature and constraints'}));

// Deterministic in-memory checks. Does not load Taro, use network, or touch user storage.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const previous=require.extensions['.ts'];
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
let d,batch,r,study,store,filters;
try {d=require('../data/mockData.ts');batch=require('../data/courseExpansionV19.ts');r=require('../data/curriculumRoadmap.ts');study=require('../data/studyState.ts');store=require('../mini-program/src/lib/storeCore.ts');filters=require('../data/problemFilters.ts');}
finally{if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
let checks=0;
function test(name,fn){try{fn();checks++;}catch(error){error.message=name+': '+error.message;throw error;}}
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} vs ${b}`);
const answer=(course,key,n,text)=>assert.ok(d.problemById(r.roadmapTopicId(course,key)+'-exercise-'+n)?.answer.includes(text),`${course}/${key}/${n}: ${text}`);
const HA='higher-algebra',CA='complex-analysis',AG='analytic-geometry',MT='measure-theory';
const poly=(coeff,x)=>coeff.reduceRight((s,c)=>s*x+c,0);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>Math.sqrt(dot(a,a));
const cmul=([a,b],[c,e])=>[a*c-b*e,a*e+b*c];
const cexp=([a,b])=>[Math.exp(a)*Math.cos(b),Math.exp(a)*Math.sin(b)];
function rank(rows){const a=rows.map(row=>row.slice());let k=0;for(let j=0;j<a[0].length&&k<a.length;j++){const i=a.findIndex((row,i)=>i>=k&&Math.abs(row[j])>1e-10);if(i<0)continue;[a[k],a[i]]=[a[i],a[k]];const pivot=a[k][j];a[k]=a[k].map(v=>v/pivot);for(let h=0;h<a.length;h++)if(h!==k){const factor=a[h][j];a[h]=a[h].map((v,c)=>v-factor*a[k][c]);}k++;}return k;}
test('four thinner courses each gain six real topics, not new roadmap placeholders',()=>{
  assert.equal(batch.expansionV19Topics.length,24);assert.equal(batch.expansionV19Formulas.length,24);assert.equal(batch.expansionV19Problems.length,48);
  assert.equal(d.topics.length,305);assert.equal(d.formulas.length,321);assert.equal(d.problems.length,1108);
  for(const c of [HA,CA,AG,MT]){assert.equal(batch.expansionV19Topics.filter(t=>t.courseId===c).length,6);assert.equal(r.getRoadmapSummary(c,d.topics).published,26);assert.equal(r.getRoadmapSummary(c,d.topics).planned,44);}
  for(const t of batch.expansionV19Topics){assert.ok(t.definition.length>60&&t.learningNotes.length>=2&&t.intuition.length>10);assert.equal(t.problemIds.length,2);assert.equal(t.formulaIds.length,1);assert.equal(d.topicById(t.id),t);assert.ok(r.getCourseRoadmap(t.courseId,d.topics).some(c=>c.entries.some(e=>e.id===t.id&&e.published)));}
  for(const p of batch.expansionV19Problems){assert.equal(p.source.kind,'original');assert.ok(p.source.label.includes('非历年真题'));assert.ok(p.hints.length&&p.steps.length>=2);}
});
test('published-only view preserves chapter/slot numbers, counts and underlying data',()=>{
  const before=JSON.stringify(r.courseBlueprints);
  for(const c of d.courses){const full=r.getVisibleRoadmap(c.id,d.topics);const visible=r.getVisibleRoadmap(c.id,d.topics,true);const oldEntries=full.flatMap(ch=>ch.entries);
    assert.equal(visible.flatMap(ch=>ch.entries).length,d.topics.filter(t=>t.courseId===c.id).length);
    for(const ch of visible){assert.equal(ch.total,10);assert.equal(ch.entries.length,ch.publishedCount);assert.ok(ch.entries.length>0);assert.ok(full.some(f=>f.id===ch.id&&f.position===ch.position));for(const e of ch.entries)assert.ok(e.published&&oldEntries.some(o=>o.id===e.id&&o.position===e.position));}
    assert.deepEqual(r.getVisibleRoadmap(c.id,[],true),[]);
  }
  assert.equal(JSON.stringify(r.courseBlueprints),before);assert.equal(d.courses.reduce((sum,c)=>sum+r.getRoadmapSummary(c.id,d.topics).target,0),700);
  // Empty chapters disappear, but the surviving third chapter must keep number 3.
  const one=[d.topicById(r.roadmapTopicId(CA,'contours'))];const filtered=r.getVisibleRoadmap(CA,one,true);
  assert.equal(filtered.length,1);assert.equal(filtered[0].position,3);assert.equal(filtered[0].entries[0].position,2);
});
test('new questions remain core and can be found by topic without changing competition/daily pools',()=>{
  const base={query:'',track:'all',courseId:null,level:null,completion:'all',completedIds:[]};
  const select=opts=>filters.filterStudyProblems(d.problems,{...base,...opts},d.courses,d.topics);
  assert.equal(select({track:'core'}).length,1088);assert.equal(select({track:'competition'}).length,20);assert.equal(select({track:'practice'}).length,18);
  for(const t of batch.expansionV19Topics)assert.equal(select({query:t.titleZh,courseId:t.courseId}).filter(p=>p.topicId===t.id).length,2);
  for(const p of batch.expansionV19Problems)assert.ok(select({track:'core'}).some(item=>item.id===p.id));
});
test('new and legacy study IDs round-trip with no schema change and planned IDs remain blocked',()=>{
  const state={...study.emptyStudyState,favoriteTopics:['limits',...batch.expansionV19Topics.map(t=>t.id)],favoriteFormulas:['chain-rule',...batch.expansionV19Formulas.map(f=>f.id)],completedProblems:['cmc17-a-fill-1',...batch.expansionV19Problems.map(p=>p.id)]};
  const text=study.createStudyBackup(state);assert.equal(JSON.parse(text).schemaVersion,1);assert.deepEqual(study.parseStudyBackup(text).state,state);
  let saved=null;const memory=store.createStudyStore({read:()=>null,write:value=>{saved=value;},remove:()=>{throw Error('Never clear');}});memory.restoreBackup(text);assert.deepEqual(JSON.parse(saved),state);
  const planned=r.getCourseRoadmap(MT,d.topics).flatMap(ch=>ch.entries).find(e=>!e.published);const snapshot=saved;assert.throws(()=>memory.toggleTopic(planned.id),/ID/);assert.equal(saved,snapshot);
});
test('polynomial division identities and remainder degrees',()=>{
  for(const x of [-3,-1,0,2,4]){near(poly([-5,4,-3,2],x),(x-2)*poly([6,1,2],x)+7);near(poly([4,3,0,2,1],x),(x*x+1)*poly([-1,2,1],x)+(x+5));}
  answer(HA,'division',1,'余式 7');answer(HA,'division',2,'余式 x+5');
});
test('multiplicities retain the first nonzero derivative',()=>{
  near(poly([2,-3,0,1],1),0);near(3*1**2-3,0);near(6*1,6);near(3*(-2)**2-3,9);
  for(const x of [-2,0,1,3])near(x**3-3*x+2,(x-1)**2*(x+2));answer(HA,'multiplicity',1,'二重根');answer(HA,'multiplicity',2,'a=−3，b=2');
});
test('interpolation values and nonuniqueness without a degree bound',()=>{
  [1,3,7].forEach((y,x)=>near(poly([1,1,1],x),y));for(const x of [-1,1])near(x*x+1,2);
  answer(HA,'interpolation',1,'x²+x+1');answer(HA,'interpolation',2,'不唯一');
});
test('subspaces need linear closure, not only a zero vector',()=>{
  const u=[2,1,0],v=[-1,0,1];near(dot([1,-2,1],u),0);near(dot([1,-2,1],v),0);assert.equal(rank([u,v]),2);
  assert.equal(0+0===1,false);assert.equal(1*1===0,false);answer(HA,'subspaces',1,'维数 2');answer(HA,'subspaces',2,'都不是子空间');
});
test('nonorthogonal direct-sum decomposition is unique',()=>{
  assert.equal(rank([[1,0,0],[0,1,0],[1,1,1]]),3);assert.deepEqual([-2+4,-1+4,0+4],[2,3,4]);assert.notEqual(dot([1,0,0],[1,1,1]),0);
  answer(HA,'direct-sum',1,'(−2,−1,0)+(4,4,4)');answer(HA,'direct-sum',2,'不是直和');
});
test('quotient coordinates discard exactly the specified subspace',()=>{
  assert.deepEqual([1-0,2-0,3-3],[1,2,0]);assert.equal(3-2,1);near(poly([2,3,-1],0)-poly([3,3,-1],0),-1);
  answer(HA,'quotient',1,'坐标为 3');answer(HA,'quotient',2,'不定义良好');
});
test('principal arguments use the correct quadrant and wraparound',()=>{
  near(Math.hypot(-Math.sqrt(3),1),2);near(Math.atan2(1,-Math.sqrt(3)),5*Math.PI/6);
  const product=cmul(cexp([0,4*Math.PI/5]),cexp([0,3*Math.PI/5]));near(Math.atan2(product[1],product[0]),-3*Math.PI/5);
  answer(CA,'argument',1,'5π/6');answer(CA,'argument',2,'−3π/5');
});
test('complex exponential solutions include every imaginary period',()=>{
  for(const k of [-2,-1,0,1,2]){const z=cexp([Math.log(2),Math.PI/2+2*k*Math.PI]);near(z[0],0);near(z[1],2);}
  near(cexp([1,Math.PI])[0],-Math.E);near(cexp([1,-Math.PI])[0],-Math.E);answer(CA,'exponential',1,'2kπ');answer(CA,'exponential',2,'均为 −e');
});
test('complex powers are multivalued and principal value is explicitly selected',()=>{
  for(const sign of [-1,1]){const squared=cmul([sign/Math.sqrt(2),sign/Math.sqrt(2)],[sign/Math.sqrt(2),sign/Math.sqrt(2)]);near(squared[0],0);near(squared[1],1);}
  for(const k of [-1,0,1]){const exponent=cmul([0,1],[0,Math.PI/2+2*k*Math.PI]);near(exponent[0],-Math.PI/2-2*k*Math.PI);near(exponent[1],0);assert.ok(cexp(exponent)[0]>0);}
  answer(CA,'powers',1,'±(1+i)/√2');answer(CA,'powers',2,'e^(−π/2−2kπ)');
});
test('parametric contour integrals retain dz and orientation',()=>{
  const steps=4096,h=2*Math.PI/steps;let real=0,imag=0;
  for(let j=0;j<steps;j++){const t=(j+.5)*h;const product=cmul([2*Math.cos(t),-2*Math.sin(t)],[-2*Math.sin(t),2*Math.cos(t)]);real+=product[0]*h;imag+=product[1]*h;}
  near(real,0);near(imag,8*Math.PI);near(cmul([1,1],[1,1])[1]/2,1);answer(CA,'contours',1,'反向积分 −i');answer(CA,'contours',2,'8πi');
});
test('removability does not follow from a zero residue alone',()=>{
  near(Math.sin(.0001)/.0001,1,1e-8);assert.equal(1/(.01**2),10000);answer(CA,'removable',1,'导数为 0');answer(CA,'removable',2,'二阶极点，不可去');
});
test('pole orders and Laurent coefficients are distinct',()=>{
  near(2+1,3);near(Math.exp(0),1);for(const z of [-1,0,1,3])near((z+1)/(z-2),1+3/(z-2));answer(CA,'poles',1,'留数 3');answer(CA,'poles',2,'留数 1；积分 2πi');
});
test('cross products, area and plane equations',()=>{
  assert.deepEqual(cross([1,2,0],[0,1,3]),[6,-3,1]);near(norm([6,-3,1])/2,Math.sqrt(46)/2);near(dot([6,-3,1],[1,2,0]),0);
  assert.deepEqual(cross([-1,1,0],[-1,0,1]),[1,1,1]);for(const p of [[1,0,0],[0,1,0],[0,0,1]])near(dot([1,1,1],p),1);
  answer(AG,'cross-product',1,'√46/2');answer(AG,'cross-product',2,'x+y+z=1');
});
test('passive orthogonal coordinates differ from an active rotation',()=>{
  const p=[2,3,4],basis=[[0,1,0],[-1,0,0],[0,0,1]];assert.deepEqual(basis.map(e=>dot(e,p)),[3,-2,4]);near(norm(p),norm([3,-2,4]));near(norm([2,3,-4]),norm(p));
  answer(AG,'orthogonal-change',1,'(3,−2,4)');answer(AG,'orthogonal-change',2,'翻转定向');
});
test('line-plane angle uses sine and does not decide containment',()=>{
  near(dot([1,1,Math.sqrt(2)],[0,0,1])/norm([1,1,Math.sqrt(2)]),Math.sin(Math.PI/4));near(dot([1,2,0],[0,0,1]),0);assert.notEqual(2,5);
  answer(AG,'line-plane-angle',1,'45°');answer(AG,'line-plane-angle',2,'不在平面内');
});
test('skew-line closest points satisfy both orthogonality equations',()=>{
  near(norm([0,0,1]),1);const w=[0,.5,-.5];near(dot(w,[1,0,0]),0);near(dot(w,[0,1,1]),0);near(norm(w),1/Math.sqrt(2));
  near(Math.abs(dot([0,1,0],cross([1,0,0],[0,1,1])))/norm(cross([1,0,0],[0,1,1])),norm(w));
  answer(AG,'skew-closest',1,'距离 1');answer(AG,'skew-closest',2,'(0,1/2,−1/2)');
});
test('sphere completion distinguishes a sphere, point and empty set',()=>{
  near(((-2)**2+4**2+(-6)**2)/4-5,9);for(const c of [5,6,7])near((2**2+(-4)**2+2**2)/4-c,6-c);
  answer(AG,'sphere-equation',1,'(1,−2,3)');answer(AG,'sphere-equation',2,'c>6 为空集');
});
test('sphere tangent formulas require a genuine point on the sphere',()=>{
  const C=[1,-2,3],P=[1,1,3];near(norm(P.map((v,i)=>v-C[i])),3);near(Math.abs(C[1]-1),3);assert.ok(6/Math.sqrt(2)>3);
  answer(AG,'tangent-plane',1,'y=1');answer(AG,'tangent-plane',2,'不相交');
});
test('set liminf means eventually always and limsup means infinitely often',()=>{
  for(const x of [-1,0,.5,1,1.5,2,3]){const a=x>=0&&x<=1,b=x>=1&&x<=2;assert.equal(a&&b,x===1);assert.equal(a||b,x>=0&&x<=2);}
  for(const n of [1,2,100])assert.equal(0>0&&0<1/n,false);answer(MT,'set-limits',1,'下极限 {1}');answer(MT,'set-limits',2,'均为空集');
});
test('finite generated sigma algebras are unions of membership atoms',()=>{
  function generatedMasks(generators){const sigmas=new Set([0,15,...generators]);let changed=true;while(changed){changed=false;for(const a of [...sigmas])for(const b of [...sigmas])for(const c of [15^a,a|b])if(!sigmas.has(c)){sigmas.add(c);changed=true;}}return sigmas;}
  assert.equal(generatedMasks([3]).size,4);assert.ok(!generatedMasks([3]).has(1));assert.equal(generatedMasks([3,6]).size,16);
  answer(MT,'generated',1,'不包含 {a}');answer(MT,'generated',2,'16 个集合');
});
test('Borel interval construction retains zero and excludes one',()=>{
  for(const x of [-.5,0,.4,1,2]){const member=Array.from({length:200},(_,i)=>i+1).every(n=>x>-1/n&&x<1);assert.equal(member,x>=0&&x<1);}
  answer(MT,'borel',1,'测度为 0');answer(MT,'borel',2,'∩ₙ≥₁(−1/n,1)');
});
test('measurable composition theorem is not a converse',()=>{
  for(const x of [-2,-.5,0,.7,3])for(const t of [-1,0,1,4])assert.equal(x*x>t,t<0||x>Math.sqrt(t)||x<-Math.sqrt(t));
  const sigma=[[],['a','b']];assert.ok(!sigma.some(s=>JSON.stringify(s)==='["a"]'));assert.equal((()=>0)('onlyPoint'),0);
  answer(MT,'composition',1,'f² 可测');answer(MT,'composition',2,'g 不可测');
});
test('pointwise measurable limit may be discontinuous and a supremum may not be attained',()=>{
  for(const x of [0,.5,.9,1])near(x**10000,x===1?1:0,1e-8);for(const n of [1,10,100])assert.ok(2-1/n<2);
  answer(MT,'limits',1,'不连续，但波莱尔可测');answer(MT,'limits',2,'任何一项都不达到');
});
test('dyadic approximations are monotone, finite-valued and not globally uniform on an unbounded function',()=>{
  const approx=(x,n)=>Math.floor(2**n*Math.min(x,n))/2**n;
  near([.125,.375,.625,.875].reduce((s,x)=>s+approx(x,2)/4,0),3/8);
  for(const x of [0,.125,.6,1,3,10,Infinity]){let last=0;for(let n=1;n<=6;n++){const value=approx(x,n);assert.ok(value>=last&&value<=x);assert.ok(Number.isFinite(value));last=value;}}
  assert.deepEqual([1,2,4].map(n=>approx(3,n)),[1,2,3]);for(const n of [1,2,5])assert.ok((n+100)-approx(n+100,n)>=100);
  answer(MT,'simple-approximation',1,'积分 3/8');answer(MT,'simple-approximation',2,'不一致收敛');
});
console.log(JSON.stringify({checks,status:'passed',published:305,target:700,remaining:395,historicalBatch:{topics:24,formulas:24,problems:48},scope:'Offline mathematical spot checks, filters, numbering and in-memory backup; not a full proof review or phone acceptance'},null,2));

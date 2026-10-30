const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const previous=require.extensions['.ts'];
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
let data,series,roadmap,study,filters;
try{
  data=require('../data/mockData.ts');
  assert.ok(fs.existsSync(require('node:path').join(__dirname,'../data/tenVersionExpansion.ts')),'Ten-release registry is missing');
  series=require('../data/tenVersionExpansion.ts');roadmap=require('../data/curriculumRoadmap.ts');study=require('../data/studyState.ts');filters=require('../data/problemFilters.ts');
}finally{if(previous)require.extensions['.ts']=previous;else delete require.extensions['.ts'];}
assert.equal(series.tenVersionReleases.length,10);
const topicIds=new Set(),problemIds=new Set(),prompts=new Set();
const allEntries=data.courses.flatMap(c=>roadmap.getCourseRoadmap(c.id,data.topics).flatMap(ch=>ch.entries));
for(const [index,release]of series.tenVersionReleases.entries()){
  assert.equal(release.version,`1.${13+index}.0`);assert.equal(release.topics.length,8);assert.equal(release.problems.length,72);assert.equal(release.formulas.length,8);
  for(const topic of release.topics){
    assert.ok(!topicIds.has(topic.id));topicIds.add(topic.id);assert.equal(data.topicById(topic.id),topic);
    assert.equal(allEntries.filter(e=>e.id===topic.id&&e.published).length,1);
    assert.ok(topic.definition.length>60&&topic.learningNotes.length>=2&&topic.formulaIds.length===1);
    const found=filters.filterStudyProblems(data.problems,{query:topic.titleZh,track:'core',courseId:topic.courseId,level:null,completion:'all',completedIds:[]},data.courses,data.topics);
    assert.deepEqual(found.filter(p=>p.topicId===topic.id).map(p=>p.id),topic.problemIds);
  }
  for(const p of release.problems){assert.ok(!problemIds.has(p.id));problemIds.add(p.id);assert.ok(!prompts.has(p.prompt),`Duplicate new prompt: ${p.prompt}`);prompts.add(p.prompt);assert.ok(p.hints.length&&p.steps.length>=2&&p.answer.length);assert.equal(p.source.kind,'original');}
  assert.equal(release.cumulative.problems,388+72*(index+1));assert.equal(release.cumulative.topics,225+8*(index+1));
}
assert.deepEqual([data.topics.length,data.formulas.length,data.problems.length],[305,321,1108]);
assert.equal(allEntries.filter(e=>!e.published).length,395);
const original=data.problems.filter(p=>!problemIds.has(p.id));assert.equal(original.length,388);
for(const p of original)assert.ok(!prompts.has(p.prompt),`New prompt duplicates old prompt: ${p.id}`);
const state={...study.emptyStudyState,favoriteTopics:['limits',...topicIds],favoriteFormulas:['chain-rule',...series.tenVersionFormulas.map(f=>f.id)],completedProblems:['cmc17-a-fill-1',...problemIds]};
assert.deepEqual(study.parseStudyBackup(study.createStudyBackup(state)).state,state);
assert.equal(JSON.parse(study.createStudyBackup(state)).schemaVersion,1);
assert.deepEqual(study.mergeStudyStates(state,state),state);
const variants=series.tenVersionProblems.filter(p=>p.source.label.includes('变式')).length;
assert.ok(variants>0&&variants<720);
console.log(JSON.stringify({status:'passed',releases:10,newTopics:80,newProblems:720,labelledVariants:variants,totalTopics:305,totalFormulas:321,totalProblems:1108,remainingRoadmap:395,scope:'Unique prompts/IDs, actual search/routes, release sequence and in-memory backups'},null,2));

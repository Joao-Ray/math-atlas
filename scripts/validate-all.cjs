const {spawnSync} = require('node:child_process');
const checks = ['content','curriculum','roadmap','textbooks','study','methods','papers','project-links',
  'expansion-v19','expansion-v110','expansion-v111','expansion-v112',
  'ten-versions','ten-calculus','ten-a','ten-b','ten-c'];
for(const name of checks) {
  const result = spawnSync(process.execPath,[`scripts/validate-${name}.cjs`],{stdio:'inherit'});
  if(result.error) throw result.error;
  if(result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`All ${checks.length} source validation suites passed`);

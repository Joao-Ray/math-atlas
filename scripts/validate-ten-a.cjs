// Independent arithmetic checks for the v1.14–v1.16 original lesson packs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const prior = require.extensions['.ts'];
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, filename);
let packs;
let blueprint;
try {
  packs = require('../data/tenVersions/linearProbabilityStatistics.ts');
  blueprint = require('../data/curriculumRoadmap.ts').courseBlueprints;
} finally {
  if (prior) require.extensions['.ts'] = prior;
  else delete require.extensions['.ts'];
}
const parse = s => Number(s.includes('/') ? s.split('/')[0] / s.split('/')[1] : s);
const numbers = s => (s.replaceAll('−', '-').match(/-?\d+(?:\.\d+)?(?:\/\d+)?/g) || []).map(parse);
const near = (a, b, tol = 1e-10) => assert.ok(Math.abs(a - b) <= tol, `${a} != ${b}`);
const arrayNear = (a, b, tol) => { assert.equal(a.length, b.length); a.forEach((x, i) => near(x, b[i], tol)); };
const matrix = x => [x.slice(0, 2), x.slice(2, 4)];
const mult = (a, b) => a.map(row => b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)));
const flat = a => a.flat();
const eye = [[1, 0], [0, 1]];
const square = n => n * n;
const factorial = n => n < 2 ? 1 : n * factorial(n - 1);
let arithmeticChecks = 0;
const check = (actual, expected, tolerance) => { arrayNear(actual, expected, tolerance); arithmeticChecks++; };
const seen = new Set();
for (const [name, lessons] of Object.entries(packs)) {
  assert.equal(lessons.length, 8, `${name}: eight topics`);
  assert.equal(lessons.flatMap(x => x.exercises).length, 72);
  for (const t of lessons) {
    const identity = `${t.courseId}/${t.key}`;
    assert.ok(!seen.has(identity)); seen.add(identity);
    assert.ok(blueprint[t.courseId].some(ch => ch.entries.split('|').some(x => x.startsWith(`${t.key}=`))), identity);
    assert.ok(t.definition.length > 60, identity);
    assert.ok(t.learningNotes.length >= 2);
    assert.ok(t.formula.conditions.length > 15);
    assert.equal(t.exercises.length, 9);
    assert.equal(new Set(t.exercises.map(x => x.prompt)).size, 9);
    for (const x of t.exercises) {
      assert.ok(x.steps.length >= 2 && x.steps.every(s => s.body.length >= 15));
      assert.ok(x.hints[0].length > 5 && x.answer.length > 0);
    }
    assert.ok(t.exercises.slice(0, 6).every(x => x.variantLabel), identity);
    for (let j = 0; j < 6; j++) {
      const k = j + 1;
      const a = numbers(t.exercises[j].answer);
      switch (t.key) {
        case 'transpose': {
          const ab = mult([[1, k]], [[2], [3]]);
          const reverse = mult([[2, 3]], [[1], [k]]);
          check(a, flat(ab)); check(flat(reverse), flat(ab)); break;
        }
        case 'inverse':
          check(flat(mult([[1, k], [0, 2]], matrix(a))), flat(eye));
          check(flat(mult(matrix(a), [[1, k], [0, 2]])), flat(eye)); break;
        case 'elementary':
          check(a.slice(4), flat(mult(matrix(a.slice(0, 4)), [[1, 2], [3, 4]])));
          check(flat(mult(matrix(a.slice(0, 4)), [[1, 0], [k, 1]])), flat(eye)); break;
        case 'block': {
          // Blocks are scalar multiples of I; their scalar coefficients multiply identically.
          const m = mult([[1, k], [0, 1]], [[2, 1], [0, 3]]);
          check(a, [m[0][0], m[0][1], m[1][1]]); break;
        }
        case 'trace': {
          const ab = mult([[1, k]], [[2], [3]])[0][0];
          const ba = mult([[2], [3]], [[1, k]]);
          check(a, [ab]); check(a, [ba[0][0] + ba[1][1]]); break;
        }
        case 'powers': {
          let result = eye;
          for (let i = 0; i < k + 1; i++) result = mult(result, [[1, 2], [0, 1]]);
          check(a, flat(result)); break;
        }
        case 'triangular':
          check(flat(mult([[2, 1], [0, 3]], [[a[0]], [a[1]]])), [2 * k + 2, 6]);
          check([a[2]], [2 * 3]); break;
        case 'sym-skew': {
          const s = matrix(a.slice(0, 4)); const r = matrix(a.slice(4));
          check(flat(s.map((row, i) => row.map((v, l) => v + r[i][l]))), [1, k, 2, 3]);
          near(s[0][1], s[1][0]); near(r[0][1], -r[1][0]); near(r[0][0], 0); near(r[1][1], 0);
          arithmeticChecks++; break;
        }
        case 'pmf': {
          const [c, label, event] = a;
          check([c * (1 + k + 2), label, event], [1, 1, c * k + c * 2]); break;
        }
        case 'cdf': {
          const masses = [1, k, 2].map(w => w / (k + 3));
          check(a, [1, masses[0] + masses[1], 1, masses[0], 1, masses[1]]); break;
        }
        case 'density': {
          const [c, endpoint, probability] = a;
          // Antiderivative of cx is cx²/2, verified over full support and selected interval.
          check([c * square(k) / 2, endpoint, probability], [1, k / 2, c * square(k / 2) / 2]); break;
        }
        case 'quantiles': {
          const [p1, x1, p2, x2] = a;
          check([(x1 - k) / 4, (x2 - k) / 4], [p1, p2]); break;
        }
        case 'bernoulli-binomial': {
          const n = k + 2; const probabilities = Array.from({ length: n + 1 }, (_, r) =>
            factorial(n) / (factorial(r) * factorial(n - r)) / 2 ** n);
          const mean = probabilities.reduce((s, p, r) => s + p * r, 0);
          const variance = probabilities.reduce((s, p, r) => s + p * square(r - mean), 0);
          check(a, [1, probabilities[1], mean, variance]); break;
        }
        case 'poisson-limit':
          check(a, [1000 * k * .001, 0, Math.exp(-1000 * k * .001)], .000051); break;
        case 'geom-neg-binomial': {
          const p = 1 / (k + 1); const failure = 1 - p;
          const pmf = t => failure ** (t - 1) * p;
          // Sum the geometric probability series independently, not just its expectation formula.
          let mean = 0; let total = 0;
          for (let t = 1; t <= 1000; t++) { mean += t * pmf(t); total += pmf(t); }
          near(total, 1);
          check(a, [2, 1 - pmf(1) - pmf(2), mean, mean - 1]); break;
        }
        case 'exp-gamma': {
          // Independently integrate exponential moments by composite Simpson quadrature.
          const simpson = fn => {
            const count = 20000; const top = 30 / k; const step = top / count;
            let sum = fn(0) + fn(top);
            for (let i = 1; i < count; i++) sum += (i % 2 ? 4 : 2) * fn(i * step);
            return sum * step / 3;
          };
          const mean = simpson(t => t * k * Math.exp(-k * t));
          const second = simpson(t => t * t * k * Math.exp(-k * t));
          check(a, [mean, second - mean * mean, 1 / k, Math.exp(-1)], .000051); break;
        }
        case 'z-mean': {
          const se = Math.sqrt(k * k / 100); const half = 1.96 * se;
          check(a, [half, 10 - half, 10 + half], .000051); break;
        }
        case 'paired-t': {
          const se = Math.sqrt(4 / 16);
          check(a, [k - 2.131 * se, k + 2.131 * se], .000051); break;
        }
        case 'welch': {
          const v1 = .1; const v2 = .4;
          const df = square(v1 + v2) / (square(v1) / 9 + square(v2) / 9);
          check(a, [k, v1 + v2, df], .000051); break;
        }
        case 'proportion': {
          const successes = 50 * square(k); const n = 100 * square(k);
          const phat = successes / n; const half = 1.96 * Math.sqrt(phat * (1 - phat) / n);
          check(a, [phat, phat - half, phat + half], .000051); break;
        }
        case 'variance-ci': {
          check(a, [9 * k / 19.023, 9 * k / 2.7], .000051);
          // Substitute the reported endpoint into the pivot, accounting for rounding of endpoints.
          near(9 * k / a[0], 19.023, .002); break;
        }
        case 'prediction': {
          const varianceOfMean = 4 / 16; const varianceOfFuture = 4;
          check(a, [2.131 * Math.sqrt(varianceOfMean + varianceOfFuture), 2.131 * Math.sqrt(varianceOfMean)], .000051); break;
        }
        case 'coverage': {
          const successes = 950 * k; const n = 1000 * k; const p = successes / n;
          check(a, [p, n - successes, Math.sqrt(p * (1 - p) / n)], .000051); break;
        }
        case 'pivot': {
          const [c, lower, upper] = a; const n = k + 1;
          check([lower], [2]);
          near(1 - c ** n, .95, .0003);
          near(1 - (2 / upper) ** n, .95, .00002);
          arithmeticChecks++; break;
        }
        default: assert.fail(`unchecked numeric family: ${t.key}`);
      }
    }
  }
}
// Further independently calculated examples outside the six-variant families.
const lesson = key => Object.values(packs).flat().find(t => t.key === key);
check(numbers(lesson('bernoulli-binomial').exercises[6].answer), [9, 1 / 3]);
const n = 9; const p = 1 / 3;
near(n * p, 3); near(n * p * (1 - p), 2);
check(numbers(lesson('z-mean').exercises[6].answer), [Math.ceil(square(1.96 * 5))]);
check(numbers(lesson('proportion').exercises[6].answer), [Math.ceil(square(1.96) / (4 * square(.05)))]);
check(numbers(lesson('prediction').exercises[6].answer), [square(5) - 1]);
check(numbers(lesson('pivot').exercises[7].answer), [5 - 3, 5 + 2]);
const twoGamma = numbers(lesson('exp-gamma').exercises[8].answer);
check(twoGamma, [2, 3, 2 / 3, 2 / 9]);
console.log(`PASS: 24 reserved topics, 216 worked exercises; ${arithmeticChecks} independent numeric/matrix checks.`);

// Replays the TDD cycle end to end:
//   RED   - new group of tests vs. the previous stage's code (must fail)
//   GREEN - all groups so far vs. the new stage's code (must all pass)
const { spawnSync } = require('child_process');
const path = require('path');

const stages = [
  { n: 1, name: 'primitives' },
  { n: 2, name: 'type mismatches' },
  { n: 3, name: 'arrays' },
  { n: 4, name: 'objects' },
  { n: 5, name: 'error paths in nested structures' },
  { n: 6, name: 'dates' },
  { n: 7, name: 'circular references' }
];

function run(stageFile, maxGroup) {
  const out = spawnSync('node', [
    path.join(__dirname, 'run-stage.js'),
    path.join(__dirname, 'stages', stageFile),
    String(maxGroup)
  ], { encoding: 'utf8' });
  if (out.status !== 0) throw new Error(out.stderr);
  return JSON.parse(out.stdout);
}

const sum = (groups, pick) =>
  Object.values(groups).reduce((t, g) => t + pick(g), 0);

let allGreen = true;
const rows = [];
const lines = [];
const log = (s = '') => { lines.push(s); console.log(s); };

log('TDD workflow: assertEquals');
log('='.repeat(60));

stages.forEach(({ n, name }) => {
  const red = run(`stage${n - 1}.js`, n);
  const groupKey = Object.keys(red).find((k) => k.startsWith(`${n}.`));
  const newGroup = red[groupKey];
  const redFailed = newGroup.failed.length;
  const redTotal = redFailed + newGroup.passed;
  const regress = Object.entries(red)
    .filter(([k]) => k !== groupKey)
    .reduce((t, [, g]) => t + g.failed.length, 0);

  const green = run(`stage${n}.js`, n);
  const gPassed = sum(green, (g) => g.passed);
  const gFailed = sum(green, (g) => g.failed.length);
  const ok = gFailed === 0;
  allGreen = allGreen && ok;

  log(`\nStage ${n}: ${name}`);
  log(`  RED   ${redFailed}/${redTotal} new tests failing against stage${n - 1}.js` +
      (regress ? `  (!) ${regress} earlier tests regressed` : ''));
  newGroup.failed.slice(0, 3).forEach((f) => log(`          - ${f.name}`));
  if (newGroup.failed.length > 3) log(`          ... and ${newGroup.failed.length - 3} more`);
  log(`  GREEN ${gPassed}/${gPassed + gFailed} tests passing with stage${n}.js ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) {
    Object.values(green).forEach((g) => g.failed.forEach((f) => log(`          x ${f.name}: ${f.message}`)));
  }
  rows.push({ n, name, newTests: redTotal, redFailed, total: gPassed + gFailed, ok });
});

log('\n' + '='.repeat(60));
log('Stage  Group                               New  Red  Total  Green');
rows.forEach((r) =>
  log(`${String(r.n).padEnd(6)} ${r.name.padEnd(35)} ${String(r.newTests).padStart(3)}  ${String(r.redFailed).padStart(3)}  ${String(r.total).padStart(5)}  ${r.ok ? 'yes' : 'NO'}`));
log(allGreen ? '\nAll stages green.' : '\nSome stages FAILED.');

require('fs').writeFileSync(path.join(__dirname, 'TDD_LOG.txt'), lines.join('\n') + '\n');
process.exit(allGreen ? 0 : 1);

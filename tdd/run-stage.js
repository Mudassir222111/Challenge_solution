// Usage: node run-stage.js <implementation.js> <maxGroup>
// Runs the numbered groups of ../assertEquals.test.js (those <= maxGroup) against
// the given implementation and prints per-group results as JSON.
// A tiny Jest-compatible shim is used so this works without installing anything.
const fs = require('fs');
const os = require('os');
const path = require('path');

const [, , implPath, maxGroupArg] = process.argv;
const maxGroup = Number(maxGroupArg);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tdd-'));
fs.copyFileSync(path.resolve(implPath), path.join(dir, 'assertEquals.js'));
fs.copyFileSync(path.join(__dirname, '..', 'assertEquals.test.js'), path.join(dir, 'assertEquals.test.js'));

const groups = {};
const stack = [];

global.describe = (name, fn) => {
  stack.push(name);
  fn();
  stack.pop();
};

global.it = (name, fn) => {
  const group = stack.find((n) => /^\d+\./.test(n));
  if (!group || parseInt(group, 10) > maxGroup) return;
  groups[group] = groups[group] || { passed: 0, failed: [] };
  try {
    fn();
    groups[group].passed++;
  } catch (e) {
    groups[group].failed.push({ name, message: e.message });
  }
};

global.expect = (fn) => ({
  not: { toThrow: () => fn() },
  toThrow: (expectedError) => {
    let thrown = null;
    try { fn(); } catch (e) { thrown = e; }
    if (!thrown) throw new Error('expected function to throw, but it did not');
    if (expectedError && thrown.message !== expectedError.message) {
      throw new Error(`expected message ${JSON.stringify(expectedError.message)} but got ${JSON.stringify(thrown.message)}`);
    }
  }
});

require(path.join(dir, 'assertEquals.test.js'));
console.log(JSON.stringify(groups));

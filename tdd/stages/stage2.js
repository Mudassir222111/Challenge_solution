function assertEquals(expected, actual) {
  if (typeLabel(expected) !== typeLabel(actual)) {
    fail(`Expected type ${typeLabel(expected)} but found type ${typeLabel(actual)}`);
  }
  const same = expected === actual || (Number.isNaN(expected) && Number.isNaN(actual));
  if (!same) {
    fail(`Expected ${format(expected)} but found ${format(actual)}`);
  }
}

function fail(message) {
  throw new Error(message);
}

function typeLabel(value) {
  if (value === null) return 'null';
  if (typeof value === 'object') return value.constructor ? value.constructor.name : 'Object';
  return typeof value;
}

function format(value) {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

module.exports = assertEquals;
